import fs from "fs";

export class CartManager {
  constructor(cartPath, productManager) {
    if (!cartPath || !productManager) {
      throw new Error("Debe proporcionar una ruta válida y un ProductManager.");
    }
    this.path = cartPath;
    this.productManager = productManager;
  }

  // Método para crear un nuevo carrito
  async createCart() {
    try {
      const carts = await this.getCarts();
      const newId =
        carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1;

      const newCart = {
        id: newId,
        products: [],
      };

      carts.push(newCart);
      await this.#saveToFile(carts);

      return newCart;
    } catch (error) {
      throw new Error("Error al crear el carrito: " + error.message);
    }
  }

  // Método para obtener todos los carritos
  async getCarts() {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      throw new Error("Error al leer los carritos: " + error.message);
    }
  }

  // Método para obtener un carrito por ID
  async getCartById(id) {
    try {
      const carts = await this.getCarts();
      return carts.find((c) => c.id === id) || null;
    } catch (error) {
      throw new Error("Error al buscar el carrito: " + error.message);
    }
  }

  // Método para agregar un producto al carrito
  async addProductToCart(cartId, productId) {
    try {
      // Verificar que el producto existe
      const product = await this.productManager.getProductById(productId);
      if (!product) {
        throw new Error(`El producto con ID ${productId} no existe.`);
      }

      const carts = await this.getCarts();
      const cartIndex = carts.findIndex((c) => c.id === cartId);

      if (cartIndex === -1) {
        throw new Error(`No se encontró un carrito con ID ${cartId}`);
      }

      const cart = carts[cartIndex];
      const productInCart = cart.products.find((p) => p.product === productId);

      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await this.#saveToFile(carts);
      return cart;
    } catch (error) {
      throw new Error(
        "Error al agregar el producto al carrito: " + error.message
      );
    }
  }

  // Método privado para guardar en el archivo
  async #saveToFile(data) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error("Error al guardar en el archivo: " + error.message);
    }
  }
}
