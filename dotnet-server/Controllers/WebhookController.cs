using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Api.DTOs;
using PaymentGateway.Api.Services;

namespace PaymentGateway.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly IWebhookService _webhookService;

    public WebhookController(IWebhookService webhookService)
    {
        _webhookService = webhookService;
    }

    [HttpPost("razorpay")]
    public async Task<IActionResult> HandleWebhook()
    {
        using var reader = new StreamReader(Request.Body);
        var rawBody = await reader.ReadToEndAsync();
        var signature = Request.Headers["x-razorpay-signature"].FirstOrDefault() ?? string.Empty;

        await _webhookService.ProcessWebhookAsync(rawBody, signature);
        return Ok(ApiResponseDto<object>.Ok(new { processed = true }, "Webhook processed successfully"));
    }
}
