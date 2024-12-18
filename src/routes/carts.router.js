import { Router } from "express";
import { CartManager } from "../dao/cartManager.js";
import { ProductManager } from "../dao/productManager.js";
import { processServerError } from "../utils.js";

export const router = Router();

// Crear instancias de los gestores
const productManager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json", productManager);

// Ruta raíz para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ message: "Carrito creado exitosamente", newCart });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener todos los carritos
router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    return res.status(200).json({ carts });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  let { cid } = req.params;
  cid = Number(cid);
  if (isNaN(cid)) {
    return res.status(400).json({ error: `El id debe ser numérico` });
  }
  try {
    const cart = await cartManager.getCartById(cid);
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
  let { cid, pid } = req.params;
  cid = Number(cid);
  pid = Number(pid);
  if (isNaN(cid) || isNaN(pid)) {
    return res.status(404).json({ error: `Los IDs deben ser numéricos` });
  }
  try {
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe producto con ID ${pid}` });
    }

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: `No existe carrito con ID ${cid}` });
    }
    const updatedCart = await cartManager.addProductToCart(cid, pid);

    res
      .setHeader("Content-Type", "application/json")
      .status(200)
      .json({ message: "Producto agregado exitosamente", updatedCart });
  } catch (error) {
    processServerError(res, error);
  }
});
