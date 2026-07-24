using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PaymentGateway.Api.Config;
using PaymentGateway.Api.Models;

namespace PaymentGateway.Api.Repositories;

public interface IPaymentRepository
{
    Task<PaymentRecord> CreateAsync(PaymentRecord record);
    Task<PaymentRecord?> FindByOrderIdAsync(string razorpayOrderId);
    Task<PaymentRecord?> UpdateStatusAsync(string razorpayOrderId, string status, string? paymentId = null, string? signature = null, string? failureReason = null);
    Task<List<PaymentRecord>> GetAllAsync(int page = 1, int limit = 20);
    Task RecordWebhookEventAsync(string razorpayOrderId, string eventId, string eventType);
}

public class PaymentRepository : IPaymentRepository
{
    private readonly IMongoCollection<PaymentRecord> _collection;

    public PaymentRepository(IOptions<MongoDbSettings> mongoSettings)
    {
        var client = new MongoClient(mongoSettings.Value.ConnectionString);
        var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
        _collection = database.GetCollection<PaymentRecord>("payments");

        // Create index on RazorpayOrderId
        var indexKeys = Builders<PaymentRecord>.IndexKeys.Ascending(p => p.RazorpayOrderId);
        var indexModel = new CreateIndexModel<PaymentRecord>(indexKeys, new CreateIndexOptions { Unique = true });
        _collection.Indexes.CreateOne(indexModel);
    }

    public async Task<PaymentRecord> CreateAsync(PaymentRecord record)
    {
        await _collection.InsertOneAsync(record);
        return record;
    }

    public async Task<PaymentRecord?> FindByOrderIdAsync(string razorpayOrderId)
    {
        return await _collection.Find(p => p.RazorpayOrderId == razorpayOrderId).FirstOrDefaultAsync();
    }

    public async Task<PaymentRecord?> UpdateStatusAsync(string razorpayOrderId, string status, string? paymentId = null, string? signature = null, string? failureReason = null)
    {
        var update = Builders<PaymentRecord>.Update.Set(p => p.Status, status);

        if (!string.IsNullOrEmpty(paymentId))
            update = update.Set(p => p.RazorpayPaymentId, paymentId);

        if (!string.IsNullOrEmpty(signature))
            update = update.Set(p => p.RazorpaySignature, signature);

        if (!string.IsNullOrEmpty(failureReason))
            update = update.Set(p => p.FailureReason, failureReason);

        return await _collection.FindOneAndUpdateAsync(
            p => p.RazorpayOrderId == razorpayOrderId,
            update,
            new FindOneAndUpdateOptions<PaymentRecord> { ReturnDocument = ReturnDocument.After }
        );
    }

    public async Task<List<PaymentRecord>> GetAllAsync(int page = 1, int limit = 20)
    {
        return await _collection.Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * limit)
            .Limit(limit)
            .ToListAsync();
    }

    public async Task RecordWebhookEventAsync(string razorpayOrderId, string eventId, string eventType)
    {
        var log = new WebhookEventLog { EventId = eventId, EventType = eventType, ProcessedAt = DateTime.UtcNow };
        var update = Builders<PaymentRecord>.Update.Push(p => p.WebhookEvents, log);

        await _collection.UpdateOneAsync(
            p => p.RazorpayOrderId == razorpayOrderId && !p.WebhookEvents.Any(e => e.EventId == eventId),
            update
        );
    }
}
