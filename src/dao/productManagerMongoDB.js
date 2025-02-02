import { Product } from "./models/productsModel.js";

export class ProductManagerMongoDB {
    static async getProducts(filter = {}, options = {}) {
      try {
        return await Product.paginate(filter, options);
      } catch (error) {
        throw new Error("Error al leer los productos: " + error.message);
      }
    }

  // Método para obtener un producto por ID
  static async getProductById(id) {
    try {
      return await Product.findById(id).lean();
    } catch (error) {
      throw new Error("Error al buscar el producto: " + error.message);
    }
  }

  // Método para agregar un producto
  static async addProduct(product) {
    try {
      const newProduct = await Product.create(product);
      return newProduct.toJSON();
    } catch (error) {
      throw new Error("Error al agregar el producto: " + error.message);
    }
  }

  // Método para modificar un producto
  static async updateProduct(id, updates) {
    try {
      return await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    } catch (error) {
      throw new Error("Error al actualizar el producto: " + error.message);
    }
  }

  // Método para eliminar un producto
  static async deleteProduct(id) {
    try {
      return await Product.findByIdAndDelete(id).lean();
    } catch (error) {
      throw new Error("Error al eliminar el producto: " + error.message);
    }
  }

  // Método para cargar los productos en DB
  static async insertMany(products = []) {
    try {
      return await Product.insertMany(products);
    } catch (error) {
      throw new Error("Error al cargar los productos: " + error.message);
    }
  }
}
