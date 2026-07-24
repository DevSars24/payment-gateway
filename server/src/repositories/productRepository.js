import Product from "../models/productModel.js";

/**
 * Product Repository Data Access Layer.
 */
export class ProductRepository {
  /**
   * Fetch all in-stock products
   */
  async findAll() {
    return await Product.find({ inStock: true });
  }

  /**
   * Find product by ID
   */
  async findById(id) {
    return await Product.findById(id);
  }

  /**
   * Seed static fallback product catalog if database is empty
   */
  async getStaticProductsFallback() {
    return [
      {
        id: 1,
        name: "MacBook Pro",
        amount: 5000,
        img: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664497359481",
        description: "13-inch, M2 Chip, 8GB RAM",
      },
      {
        id: 2,
        name: "Canon EOS R5",
        amount: 3000,
        img: "https://www.bhphotovideo.com/images/images2500x2500/canon_eos_r5_mirrorless_digital_1531228.jpg",
        description: "45MP Full-Frame Mirrorless Camera",
      },
    ];
  }
}

export const productRepository = new ProductRepository();
