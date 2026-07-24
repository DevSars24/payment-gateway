using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Api.DTOs;
using PaymentGateway.Api.Services;

namespace PaymentGateway.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IProductService _productService;

    public PaymentController(IPaymentService paymentService, IProductService productService)
    {
        _paymentService = paymentService;
        _productService = productService;
    }

    [HttpGet("getkey")]
    public IActionResult GetKey()
    {
        var key = _paymentService.GetPublicKey();
        return Ok(ApiResponseDto<object>.Ok(new { key }, "Razorpay key fetched successfully"));
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto dto)
    {
        var result = await _paymentService.CreateCheckoutOrderAsync(dto.Amount, dto.Currency);
        return Ok(ApiResponseDto<object>.Ok(result, "Payment order created successfully"));
    }

    [HttpPost("paymentverification")]
    public async Task<IActionResult> PaymentVerification([FromBody] VerifyPaymentRequestDto dto)
    {
        var result = await _paymentService.VerifyPaymentAsync(dto);
        return Ok(ApiResponseDto<object>.Ok(result, "Payment signature verified successfully"));
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _productService.GetProductsAsync();
        return Ok(ApiResponseDto<object>.Ok(products, "Products retrieved successfully"));
    }

    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var history = await _paymentService.GetPaymentHistoryAsync(page, limit);
        return Ok(ApiResponseDto<object>.Ok(history, "Payment history fetched successfully"));
    }
}
