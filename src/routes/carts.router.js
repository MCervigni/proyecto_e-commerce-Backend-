import { Router } from "express";
import { CartManager } from "../dao/cartManager.js";
import { ProductManager } from "../dao/productManager.js";

export const cartRouter = Router();

// Crear instancias de los gestores
const productManager = new ProductManager("./products.json");
const cartManager = new CartManager("./carts.json", productManager);

// Ruta para crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un carrito por ID
cartRouter.get("/:cid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado." });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para agregar un producto al carrito
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



/* import { Router } from "express";
import { CartManager } from "../dao/cartManager.js";
import { processServerError } from "../utils.js";

export const router = Router();

// Instancia de CartManager
const cartManager = new CartManager("./src/data/carts.json");

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ message: "Carrito creado exitosamente", newCart });
  } catch (error) {
    processServerError(res, error);
  }
});

// Obtener los productos de un carrito por ID
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartManager.getCartById(cid);
    cid = Number(cid);
    if (isNaN(cid)) {
      return res.status(404).json({ error: `El id debe ser numérico` });
    }
    else if (!cart) {
      return res
        .status(404)
        .json({ error: `No se encontró un carrito con ID ${cid}` });
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(cart);
  } catch (error) {
    processServerError(res, error);
  }
});

// Agregar un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const updatedCart = await cartManager.addProductToCart(
      Number(cid),
      Number(pid)
    );
    id = Number(id);
    if (isNaN(id)) {
      return res.status(404).json({ error: `El id debe ser numérico` });
    }
    res
      .setHeader("Content-Type", "application/json")
      .status(200)
      .json({ message: "Producto agregado exitosamente", updatedCart });
  } catch (error) {
    processServerError(res, error);
  }
});

export default router;
 */