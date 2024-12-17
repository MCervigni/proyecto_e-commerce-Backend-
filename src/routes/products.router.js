import { Router } from "express";
import { ProductManager } from "../dao/productManager.js";
import { processServerError } from "../utils.js";

export const router = Router();

// Instancia del ProductManager
const productManager = new ProductManager("./src/data/products.json");

// Ruta raíz: Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    let products = await productManager.getProducts();
    const { limit } = req.query;

    if (limit) {
      products = products.slice(0, Number(limit));
    }
    return res.status(200).json({ products });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener un producto por su ID
router.get("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(404).json({ error: `El id debe ser numérico` });
  }
  try {
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe producto con Id ${pid}` });
    }
    return res.status(200).json({ product });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para agregar un nuevo producto
router.post("/", async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails,
  } = req.body;

  // Validar campos obligatorios
  if (
    !title ||
    !description ||
    !code ||
    price === undefined ||
    stock === undefined ||
    !category
  ) {
    return res
      .status(400)
      .json({ error: "Todos los campos requeridos deben ser completados" });
  }

  try {
    // Generar un nuevo ID basado en el mayor ID existente
    const products = await productManager.getProducts();
    const maxId = products.reduce(
      (max, product) => Math.max(max, Number(product.id)),
      0
    );
    const newId = maxId + 1;

    const newProduct = await productManager.addProduct({
      id: newId.toString(),
      title,
      description,
      code,
      price: Number(price),
      status: true,
      stock: Number(stock),
      category,
      thumbnails,
    });
    return res
      .status(201)
      .json({ message: "Producto agregado exitosamente", newProduct });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para actualizar un producto por su ID
router.put("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(404).json({ error: `El id debe ser numérico` });
  }
  const updatedFields = req.body;

  if (updatedFields.id) {
    return res
      .status(403)
      .json({ error: "No está permitido modificar el ID del producto" });
  }

  try {
    const updatedProduct = await productManager.updateProduct(
      pid,
      updatedFields
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ error: `No existe producto con id ${pid}` });
    }
    return res
      .status(200)
      .json({ message: "Producto actualizado exitosamente", updatedProduct });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para eliminar un producto por su ID
router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(404).json({ error: `El id debe ser numérico` });
  }
  try {
    const deletedProduct = await productManager.deleteProduct(pid);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ error: `No existe producto con id ${pid}` });
    }
    return res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    processServerError(res, error);
  }
});
