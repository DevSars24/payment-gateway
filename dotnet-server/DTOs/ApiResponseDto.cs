namespace PaymentGateway.Api.DTOs;

public class ApiResponseDto<T>
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public object? Meta { get; set; }
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");

    public static ApiResponseDto<T> Ok(T data, string message = "Success", object? meta = null)
    {
        return new ApiResponseDto<T>
        {
            Success = true,
            StatusCode = 200,
            Message = message,
            Data = data,
            Meta = meta
        };
    }

    public static ApiResponseDto<T> Error(int statusCode, string message)
    {
        return new ApiResponseDto<T>
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = default
        };
    }
}
