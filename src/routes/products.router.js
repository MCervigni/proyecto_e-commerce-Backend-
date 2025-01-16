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
    return res.status(200).json({ product });
  } catch (error) {
    if (error.message.includes(`No se encontró un producto con ID`)) {
      return res.status(404).json({ error: error.message });
    }
    processServerError(res, error);
  }
});

// Ruta para agregar un nuevo producto
router.post("/", async (req, res) => {
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
    const newProduct = await productManager.addProduct(req.body);
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);

    let response = { newProduct };
    if (req.body.id) {
      response.warning = "El ID del producto se genera automáticamente. El ID proporcionado fue ignorado.";
    }

    res.status(201).json(response);
  } catch (error) {
    if (error.message.includes('El producto con código')) {
      return res.status(400).json({ error: error.message });
    }
    processServerError(res, error);
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
    return res
      .status(400)
      .json({ error: "No se proporcionaron campos para actualizar" });
  }

  if (updatedFields.id) {
    return res
      .status(403)
      .json({ error: "No está permitido modificar el ID del producto" });
  }

  try {
    const products = await productManager.getProducts();
    const existingProduct = products.find(
      (p) => p.code === updatedFields.code && p.id !== pid
    );
    if (existingProduct) {
      return res.status(400).json({
        error: `Ya existe un producto con el código ${updatedFields.code} en DB. Tiene ID= ${existingProduct.id}`,
      });
    }

    const updatedProduct = await productManager.updateProduct(
      pid,
      updatedFields
    );
    const io = req.app.get("socketio");
    io.emit("updateProducts", products);
    res
      .status(200)
      .json({ message: "Producto actualizado exitosamente", updatedProduct });
  } catch (error) {
    if (error.message.includes("No se encontró un producto con ID")) {
      return res.status(404).json({ error: error.message });
    }
    processServerError(res, error);
  }
});

// Ruta para eliminar un producto por su ID
router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  pid = Number(pid);
  if (isNaN(pid)) {
    return res.status(400).json({ error: `El ID debe ser numérico` });
  }

  try {
    const deletedProduct = await productManager.deleteProduct(pid);
    const io = req.app.get("socketio");
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
    res.status(200).json({ message: "Producto eliminado exitosamente", deletedProduct});
  } catch (error) {
    if (error.message.includes("No se encontró un producto con ID")) {
      return res.status(404).json({ error: error.message });
    }
    processServerError(res, error);
  }
});
