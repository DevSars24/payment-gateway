using System.Security.Cryptography;
using System.Text;

namespace PaymentGateway.Api.Utilities;

public static class CryptoUtils
{
    public static string GenerateHmacSha256(string data, string secret)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public static bool VerifyTimingSafe(string signatureA, string signatureB)
    {
        if (string.IsNullOrEmpty(signatureA) || string.IsNullOrEmpty(signatureB))
            return false;

        var bufA = Encoding.UTF8.GetBytes(signatureA);
        var bufB = Encoding.UTF8.GetBytes(signatureB);

        if (bufA.Length != bufB.Length)
            return false;

        return CryptographicOperations.FixedTimeEquals(bufA, bufB);
    }

    public static bool VerifyPaymentSignature(string orderId, string paymentId, string signature, string secret)
    {
        var payload = $"{orderId}|{paymentId}";
        var expected = GenerateHmacSha256(payload, secret);
        return VerifyTimingSafe(expected, signature);
    }

    public static bool VerifyWebhookSignature(string rawBody, string signature, string secret)
    {
        var expected = GenerateHmacSha256(rawBody, secret);
        return VerifyTimingSafe(expected, signature);
    }
}
