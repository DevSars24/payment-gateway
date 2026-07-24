using Microsoft.Extensions.Options;
using Razorpay.Api;
using PaymentGateway.Api.Config;
using PaymentGateway.Api.DTOs;
using PaymentGateway.Api.Models;
using PaymentGateway.Api.Repositories;
using PaymentGateway.Api.Utilities;

namespace PaymentGateway.Api.Services;

public interface IPaymentService
{
    string GetPublicKey();
    Task<object> CreateCheckoutOrderAsync(decimal amount, string currency);
    Task<object> VerifyPaymentAsync(VerifyPaymentRequestDto dto);
    Task<List<PaymentRecord>> GetPaymentHistoryAsync(int page, int limit);
}

public class PaymentService : IPaymentService
{
    private readonly RazorpaySettings _settings;
    private readonly IPaymentRepository _repository;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IOptions<RazorpaySettings> settings,
        IPaymentRepository repository,
        ILogger<PaymentService> logger)
    {
        _settings = settings.Value;
        _repository = repository;
        _logger = logger;
    }

    public string GetPublicKey()
    {
        if (string.IsNullOrEmpty(_settings.KeyId))
        {
            throw new BadRequestException("Razorpay Key ID is not configured on server.");
        }
        return _settings.KeyId;
    }

    public async Task<object> CreateCheckoutOrderAsync(decimal amount, string currency)
    {
        if (amount < 1)
        {
            throw new BadRequestException("Amount must be at least 1 INR.");
        }

        var client = new RazorpayClient(_settings.KeyId, _settings.KeySecret);
        var receiptId = $"receipt_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Random.Shared.Next(100, 999)}";

        var input = new Dictionary<string, object>
        {
            { "amount", Convert.ToInt64(amount * 100) }, // Razorpay expects amount in paise
            { "currency", currency },
            { "receipt", receiptId }
        };

        _logger.LogInformation("Creating Razorpay Order for amount {Amount} {Currency}", (double)amount, currency);
        Order order = client.Order.Create(input);
        string orderId = Convert.ToString(order["id"]) ?? string.Empty;

        var record = new PaymentRecord
        {
            RazorpayOrderId = orderId,
            Amount = amount,
            Currency = currency,
            Receipt = receiptId,
            Status = "created",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.CreateAsync(record);
        _logger.LogInformation("Successfully created Razorpay Order ID: {OrderId}", orderId);

        return new
        {
            order = new
            {
                id = orderId,
                amount = Convert.ToInt64(amount * 100),
                currency,
                receipt = receiptId
            }
        };
    }

    public async Task<object> VerifyPaymentAsync(VerifyPaymentRequestDto dto)
    {
        var isValid = CryptoUtils.VerifyPaymentSignature(
            dto.RazorpayOrderId,
            dto.RazorpayPaymentId,
            dto.RazorpaySignature,
            _settings.KeySecret
        );

        if (!isValid)
        {
            _logger.LogWarning("Payment signature verification failed for Order ID: {OrderId}", dto.RazorpayOrderId);
            await _repository.UpdateStatusAsync(dto.RazorpayOrderId, "failed", failureReason: "Invalid HMAC signature");
            throw new PaymentVerificationException("Invalid cryptographic payment signature.");
        }

        _logger.LogInformation("Payment signature verified successfully for Order ID: {OrderId}", dto.RazorpayOrderId);
        var updated = await _repository.UpdateStatusAsync(
            dto.RazorpayOrderId,
            "completed",
            dto.RazorpayPaymentId,
            dto.RazorpaySignature
        );

        return new
        {
            success = true,
            payment_id = dto.RazorpayPaymentId,
            order_id = dto.RazorpayOrderId
        };
    }

    public async Task<List<PaymentRecord>> GetPaymentHistoryAsync(int page, int limit)
    {
        return await _repository.GetAllAsync(page, limit);
    }
}
