using System.ComponentModel.DataAnnotations;

namespace PaymentGateway.Api.DTOs;

public class CheckoutRequestDto
{
    [Required]
    [Range(1, double.MaxValue, ErrorMessage = "Amount must be at least 1 INR")]
    public decimal Amount { get; set; }

    public string Currency { get; set; } = "INR";
}

public class VerifyPaymentRequestDto
{
    [Required]
    public string RazorpayOrderId { get; set; } = string.Empty;

    [Required]
    public string RazorpayPaymentId { get; set; } = string.Empty;

    [Required]
    public string RazorpaySignature { get; set; } = string.Empty;
}
