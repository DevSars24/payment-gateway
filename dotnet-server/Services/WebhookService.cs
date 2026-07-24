using System.Text.Json;
using Microsoft.Extensions.Options;
using PaymentGateway.Api.Config;
using PaymentGateway.Api.Repositories;
using PaymentGateway.Api.Utilities;

namespace PaymentGateway.Api.Services;

public interface IWebhookService
{
    Task ProcessWebhookAsync(string rawBody, string signature);
}

public class WebhookService : IWebhookService
{
    private readonly RazorpaySettings _settings;
    private readonly IPaymentRepository _repository;
    private readonly ILogger<WebhookService> _logger;

    public WebhookService(
        IOptions<RazorpaySettings> settings,
        IPaymentRepository repository,
        ILogger<WebhookService> logger)
    {
        _settings = settings.Value;
        _repository = repository;
        _logger = logger;
    }

    public async Task ProcessWebhookAsync(string rawBody, string signature)
    {
        if (string.IsNullOrEmpty(signature))
        {
            throw new BadRequestException("Missing x-razorpay-signature header.");
        }

        var isValid = CryptoUtils.VerifyWebhookSignature(rawBody, signature, _settings.WebhookSecret);
        if (!isValid)
        {
            _logger.LogError("Webhook HMAC signature verification failed.");
            throw new PaymentVerificationException("Invalid webhook signature.");
        }

        using var doc = JsonDocument.Parse(rawBody);
        var root = doc.RootElement;

        var eventType = root.GetProperty("event").GetString() ?? "";
        var eventId = root.TryGetProperty("event_id", out var evtId) ? evtId.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();

        _logger.LogInformation("Received verified Webhook event: {EventType} [ID: {EventId}]", eventType, eventId);

        if (eventType is "payment.captured" or "order.paid")
        {
            if (root.TryGetProperty("payload", out var payload) && payload.TryGetProperty("payment", out var paymentObj))
            {
                var entity = paymentObj.GetProperty("entity");
                var orderId = entity.GetProperty("order_id").GetString() ?? "";
                var paymentId = entity.GetProperty("id").GetString() ?? "";

                await _repository.RecordWebhookEventAsync(orderId, eventId, eventType);
                await _repository.UpdateStatusAsync(orderId, "completed", paymentId);
            }
        }
        else if (eventType is "payment.failed")
        {
            if (root.TryGetProperty("payload", out var payload) && payload.TryGetProperty("payment", out var paymentObj))
            {
                var entity = paymentObj.GetProperty("entity");
                var orderId = entity.GetProperty("order_id").GetString() ?? "";
                var reason = entity.TryGetProperty("error_description", out var desc) ? desc.GetString() : "Payment failed";

                await _repository.RecordWebhookEventAsync(orderId, eventId, eventType);
                await _repository.UpdateStatusAsync(orderId, "failed", failureReason: reason);
            }
        }
    }
}
