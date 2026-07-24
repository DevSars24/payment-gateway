import { productRepository } from "../repositories/productRepository.js";
import { memoryCache } from "../utils/cache.js";
import { logger } from "../utils/logger.js";

/**
 * Product Service with Cache-Aside strategy.
 */
export class ProductService {
  async getProducts() {
    const CACHE_KEY = "catalog:products";
    const cachedProducts = memoryCache.get(CACHE_KEY);

    if (cachedProducts) {
      logger.info("Serving product catalog from Cache.");
      return cachedProducts;
    }

    logger.info("Cache miss. Fetching products from repository/DB...");
    let products = await productRepository.findAll();

    if (!products || products.length === 0) {
      products = await productRepository.getStaticProductsFallback();
    }

    // Cache products for 5 minutes
    memoryCache.set(CACHE_KEY, products, 5 * 60 * 1000);
    return products;
  }
}

export const productService = new ProductService();
