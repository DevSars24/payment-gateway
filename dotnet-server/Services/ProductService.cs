using PaymentGateway.Api.Models;
using PaymentGateway.Api.Repositories;

namespace PaymentGateway.Api.Services;

public interface IProductService
{
    Task<List<Product>> GetProductsAsync();
}

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Product>> GetProductsAsync()
    {
        return await _repository.GetAllAsync();
    }
}
