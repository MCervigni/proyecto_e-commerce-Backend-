import { Router } from "express";
import { ProductManager } from "../dao/productManager.js";
import { processServerError } from "../utils.js";

// Instancia del ProductManager
const productManager = new ProductManager("./src/data/products.json");
export const router = Router();

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
    return res.status(400).json({ error: `El ID debe ser numérico` });
  }
  try {
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe producto con ID ${pid}` });
    }
    return res.status(200).json({ product });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para agregar un nuevo producto
/* router.post("/", async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } =
    req.body;

  if (
    !title ||
    !description ||
    !code ||
    price === undefined ||
    stock === undefined ||
    !category
  ) {
    return res.status(400).json({
      error:
        "title | description | code | price | stock -> son campos obligatorios",
    });
  }

  try {
    const products = await productManager.getProducts();
    const maxId = products.reduce(
      (max, product) => Math.max(max, Number(product.id)),
      0
    );
    const newId = maxId + 1;

    const codeExists = products.find((product) => product.code === code);
    if (codeExists) {
      return res.status(400).json({ error: "El código ya existe" });
    }

    const newProduct = await productManager.addProduct({
      id: newId,
      title,
      description,
      code,
      price: Number(price),
      status: true,
      stock: Number(stock),
      category,
      thumbnails: thumbnails || [],
    });
    return res
      .status(201)
      .json({ message: "Producto agregado exitosamente", newProduct });
  } catch (error) {
    processServerError(res, error);
  }
}); */

// Ruta para agregar un nuevo producto
router.post("/", async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || price === undefined || stock === undefined || !category) {
    return res.status(400).json({
      error: "title | description | code | price | stock -> son campos obligatorios",
    });
  }

  try {
    const newProduct = await productManager.addProduct(req.body);
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un producto por su ID
router.put("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(400).json({ error: `El ID debe ser numérico` });
  }

  const updatedFields = req.body;
  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
  }

  try {
    const updatedProduct = await productManager.updateProduct(pid, updatedFields);
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* // Ruta para actualizar un producto por su ID
router.put("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(404).json({ error: `El ID debe ser numérico` });
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
        .json({ error: `No existe producto con ID ${pid}` });
    }
    let existingProduct = products.find((p) => p.code === updatedProduct.code);
    if (existingProduct) {
      return res.status(400).json({
        error: `Ya existe un producto con el código ${code} en DB. Tiene ID= ${existingProduct.id} `,
      });
    }

    return res
      .status(200)
      .json({ message: "Producto actualizado exitosamente", updatedProduct });
  } catch (error) {
    processServerError(res, error);
  }
}); */

// Ruta para eliminar un producto por su ID
router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(400).json({ error: `El ID debe ser numérico` });
  }

  try {
    const deletedProduct = await productManager.deleteProduct(pid);
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
// Ruta para eliminar un producto por su ID
router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(404).json({ error: `El ID debe ser numérico` });
  }
  try {
    const deletedProduct = await productManager.deleteProduct(pid);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ error: `No existe producto con ID ${pid}` });
    }
    return res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    processServerError(res, error);
  }
}); */
