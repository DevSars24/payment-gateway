using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PaymentGateway.Api.Config;
using PaymentGateway.Api.Models;

namespace PaymentGateway.Api.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
}

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _collection;

    public ProductRepository(IOptions<MongoDbSettings> mongoSettings)
    {
        var client = new MongoClient(mongoSettings.Value.ConnectionString);
        var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
        _collection = database.GetCollection<Product>("products");
    }

    public async Task<List<Product>> GetAllAsync()
    {
        var products = await _collection.Find(p => p.InStock).ToListAsync();

        if (products.Count == 0)
        {
            return GetStaticFallbackProducts();
        }

        return products;
    }

    private static List<Product> GetStaticFallbackProducts()
    {
        return new List<Product>
        {
            new Product
            {
                Name = "MacBook Pro",
                Amount = 5000,
                Img = "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664497359481",
                Description = "13-inch, M2 Chip, 8GB RAM",
                InStock = true
            },
            new Product
            {
                Name = "Canon EOS R5",
                Amount = 3000,
                Img = "https://www.bhphotovideo.com/images/images2500x2500/canon_eos_r5_mirrorless_digital_1531228.jpg",
                Description = "45MP Full-Frame Mirrorless Camera",
                InStock = true
            }
        };
    }
}
