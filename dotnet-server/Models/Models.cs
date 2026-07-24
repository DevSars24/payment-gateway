using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PaymentGateway.Api.Models;

public class PaymentRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("razorpayOrderId")]
    public string RazorpayOrderId { get; set; } = string.Empty;

    [BsonElement("razorpayPaymentId")]
    public string? RazorpayPaymentId { get; set; }

    [BsonElement("razorpaySignature")]
    public string? RazorpaySignature { get; set; }

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = "INR";

    [BsonElement("status")]
    public string Status { get; set; } = "created";

    [BsonElement("receipt")]
    public string? Receipt { get; set; }

    [BsonElement("failureReason")]
    public string? FailureReason { get; set; }

    [BsonElement("webhookEvents")]
    public List<WebhookEventLog> WebhookEvents { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WebhookEventLog
{
    public string EventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("img")]
    public string Img { get; set; } = string.Empty;

    [BsonElement("inStock")]
    public bool InStock { get; set; } = true;
}
