namespace PaymentGateway.Api.Middleware;

public class RequestCorrelationMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationHeaderKey = "X-Correlation-ID";

    public RequestCorrelationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationHeaderKey].FirstOrDefault() ?? Guid.NewGuid().ToString();
        context.Response.Headers[CorrelationHeaderKey] = correlationId;
        context.Items[CorrelationHeaderKey] = correlationId;

        await _next(context);
    }
}
