import { Router } from "express";
import { CartManagerMongoDB as CartManager } from "../dao/cartManagerMongoDB.js";
import { ProductManagerMongoDB as ProductManager } from "../dao/productManagerMongoDB.js";
import { isValidObjectId } from "mongoose";
import { Cart } from "../dao/models/cartsModel.js";
import { processServerError } from "../utils.js";
import mongoose from "mongoose";

export const router = Router();

// Ruta raíz para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json({ message: "Carrito creado exitosamente", newCart });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener todos los carritos
router.get("/", async (req, res) => {
  try {
    const carts = await CartManager.getCarts();
    return res.status(200).json({ carts });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  let { cid } = req.params;
  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }
  try {
    const cart = await CartManager.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró carrito con Id ${cid}` });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }
  if (!isValidObjectId(pid)) {
    return res
      .status(400)
      .json({ error: `El ID del producto ingresado no es válido` });
  }

  try {
    const productExists = await ProductManager.getProductById(pid);
    if (!productExists) {
      return res
        .status(404)
        .json({ error: `El producto con ID ${pid} no existe` });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró un carrito con ID ${cid}` });
    }

    const productInCart = cart.products.find(
      (p) => p.product.toString() === pid
    );
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return res
      .status(200)
      .json({ message: "Producto agregado al carrito exitosamente", cart });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para eliminar un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }
  if (!isValidObjectId(pid)) {
    return res
      .status(400)
      .json({ error: `El ID del producto ingresado no es válido` });
  }

  try {
    const cart = await CartManager.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró carrito con ID ${cid}` });
    }

    const productInCart = await Cart.findOne({
      _id: cid,
      "products.product": new mongoose.Types.ObjectId(pid),
    });

    if (!productInCart) {
      return res
        .status(404)
        .json({ error: `El producto con ID ${pid} no está en el carrito` });
    }

    const updatedCart = await CartManager.removeProductFromCart(cid, pid);

    return res.status(200).json({
      message: "Producto eliminado del carrito exitosamente",
      updatedCart,
    });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para actualizar el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const products = req.body;

  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }

  if (!Array.isArray(products)) {
    return res
      .status(400)
      .json({
        error: `El cuerpo de la solicitud debe ser un arreglo de productos`,
      });
  }

  try {
    const combinedProducts = products.reduce((acc, product) => {
      if (!isValidObjectId(product.product)) {
        throw new Error(`El ID del producto ${product.product} no es válido`);
      }
      if (typeof product.quantity !== "number" || product.quantity <= 0) {
        throw new Error(
          `La cantidad del producto ${product.product} debe ser un número positivo`
        );
      }

      const existingProduct = acc.find(
        (p) => p.product.toString() === product.product
      );
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
      } else {
        acc.push(product);
      }
      return acc;
    }, []);

    for (const product of combinedProducts) {
      const productExists = await ProductManager.getProductById(
        product.product
      );
      if (!productExists) {
        return res
          .status(404)
          .json({ error: `El producto con ID ${product.product} no existe` });
      }
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró un carrito con ID ${cid}` });
    }

    const updatedCart = await CartManager.updateCart(cid, combinedProducts);
    return res
      .status(200)
      .json({ message: "Carrito actualizado exitosamente", updatedCart });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito
router.put("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }
  if (!isValidObjectId(pid)) {
    return res
      .status(400)
      .json({ error: `El ID del producto ingresado no es válido` });
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    return res
      .status(400)
      .json({ error: `La cantidad debe ser un número positivo` });
  }

  try {
    const cart = await CartManager.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró un carrito con ID ${cid}` });
    }

    const product = await ProductManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe producto con ID ${pid}` });
    }

    const updatedCart = await CartManager.updateProductQuantity(
      cid,
      pid,
      quantity
    );
    return res.status(200).json({
      message: "Cantidad del producto actualizada exitosamente",
      updatedCart,
    });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!isValidObjectId(cid)) {
    return res
      .status(400)
      .json({ error: `El ID del carrito ingresado no es válido` });
  }

  try {
    const cart = await CartManager.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró un carrito con ID ${cid}` });
    }
    const updatedCart = await CartManager.clearCart(cid);
    return res.status(200).json({
      message: "Todos los productos del carrito eliminados exitosamente",
      updatedCart,
    });
  } catch (error) {
    processServerError(res, error);
  }
});
