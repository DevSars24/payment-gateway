namespace PaymentGateway.Api.Utilities;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 500) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message = "Resource Not Found") : base(message, 404) { }
}

public class PaymentVerificationException : AppException
{
    public PaymentVerificationException(string message = "Payment Signature Verification Failed") : base(message, 400) { }
}
