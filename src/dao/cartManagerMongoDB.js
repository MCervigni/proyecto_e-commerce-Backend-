import { Cart } from "./models/cartsModel.js";

export class CartManagerMongoDB {
  // Método para obtener todos los carritos
  static async getCarts() {
    try {
      return await Cart.find().lean();
    } catch (error) {
      throw new Error("Error al obtener los carritos: " + error.message);
    }
  }

  // Método para obtener un carrito por ID
  static async getCartById(id) {
    try {
      return await Cart.findById(id).populate(`products.product`).lean();
    } catch (error) {
      throw new Error("Error al buscar el carrito: " + error.message);
    }
  }

  // Método para crear un nuevo carrito
  static async createCart() {
    try {
      const newCart = new Cart();
      await newCart.save();
      return newCart;
    } catch (error) {
      throw new Error("Error al crear el carrito: " + error.message);
    }
  }

  // Método para agregar un producto al carrito
  static async addProductToCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      const productInCart = cart.products.find(
        (p) => p.product.toString() === productId
      );
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(
        "Error al agregar el producto al carrito: " + error.message
      );
    }
  }

  // Método para eliminar un producto del carrito
  static async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findByIdAndDelete;
      cart.products = cart.products.filter(
        (p) => p.product.toString() !== productId
      );
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(
        "Error al eliminar el producto del carrito: " + error.message
      );
    }
  }

  // Método para actualizar el carrito con un arreglo de productos
  static async updateCart(cartId, products) {
    try {
      const updatedCart = await Cart.findByIdAndUpdate(
        cartId,
        { products },
        { new: true, runValidators: true }
      ).lean();
      return updatedCart;
    } catch (error) {
      throw new Error("Error al actualizar el carrito: " + error.message);
    }
  }

  // Método para actualizar la cantidad de un producto en el carrito
  static async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await Cart.findById(cartId);
      const productInCart = cart.products.find(
        (p) => p.product.toString() === productId
      );

      productInCart.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(
        "Error al actualizar la cantidad del producto en el carrito: " +
          error.message
      );
    }
  }

  // Método para eliminar todos los productos del carrito
  static async clearCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);

      cart.products = [];
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(
        "Error al eliminar todos los productos del carrito: " + error.message
      );
    }
  }
}
