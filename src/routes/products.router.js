import { Router } from "express";
import { ProductManagerMongoDB as ProductManager } from "../dao/productManagerMongoDB.js";
import { processServerError } from "../utils.js";
import { isValidObjectId } from "mongoose";
import { config } from "../config/config.js";
import { Product } from "../dao/models/productsModel.js";
import fs from "fs";
export const router = Router();

// Ruta para inicializar la colección de productos
router.get("/seed", async (req, res) => {
  const { clave } = req.body;

  // Verificar la contraseña
  if (clave !== "seedProducts55") {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  try {
    let products = await ProductManager.getProducts();
    if (products.length === 0) {
      let dataProducts = JSON.parse(
        await fs.promises.readFile(config.PRODUCTS_PATH, { encoding: "utf-8" })
      );
      let result = await ProductManager.insertMany(dataProducts);
      res.setHeader("Content-Type", "application/json");
      return res
        .status(201)
        .json({ payload: "Productos inicializados!", result });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error:
          "La colección products contiene información. No se puede realizar el seed",
      });
    }
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ processServerError: error.message });
  }
});

// Ruta raíz: Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    let { limit = 10, sort, query, page = 1 } = req.query;

    limit = Number(limit);
    page = Number(page);

    const filter = query
      ? { $or: [{ category: query }, { status: query }] }
      : {};
    const options = {
      limit,
      page,
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
      lean: true,
    };

    const products = await ProductManager.getProducts(filter, options);

    res.status(200).json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.hasPrevPage ? products.prevPage : null,
      nextPage: products.hasNextPage ? products.nextPage : null,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}`
        : null,
      nextLink: products.hasNextPage
        ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}`
        : null,
    });
  } catch (error) {
    processServerError(res, error);
  }
});

// Ruta para obtener un producto por su ID
router.get("/:pid", async (req, res) => {
  let { pid } = req.params;
  if (!isValidObjectId(pid)) {
    res.status(400).json({ error: `El ID ingresado no es válido` });
  }
  try {
    const product = await ProductManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe en DB un producto con ID ${pid}` });
    }

    return res.status(200).json({ product });
  } catch (error) {
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
    const existingProduct = await Product.findOne({ code }).lean();

    if (existingProduct) {
      return res.status(400).json({
        error: `El producto con el código ${code} ya existe.`,
      });
    }
    const newProduct = {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    };

    const addedProduct = await ProductManager.addProduct(newProduct);
    res
      .status(201)
      .json({ message: "Producto agregado exitosamente", addedProduct });
  } catch (error) {
    if (error.code === 11000) {
      // Verifica si es un error de clave duplicada
      return res
        .status(400)
        .json({ error: `El producto con el código ${code} ya existe.` });
    }
    processServerError(res, error);
  }
});

//
router.put("/:pid", async (req, res) => {
  let { pid } = req.params;

  if (!isValidObjectId(pid)) {
    return res.status(400).json({ error: `El ID ingresado no es válido` });
  }

  const updatedFields = req.body;

  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron campos para actualizar" });
  }

  if (updatedFields._id) {
    return res
      .status(403)
      .json({ error: "No está permitido modificar el ID del producto" });
  }

  try {
    const product = await Product.findById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe un producto con el ID ${pid}` });
    }

    if (updatedFields.code) {
      const existingProduct = await Product.findOne({
        code: updatedFields.code,
      });
      if (existingProduct && existingProduct._id.toString() !== pid) {
        return res.status(400).json({
          error: `El código ${updatedFields.code} ya está en uso por otro producto.`,
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(pid, updatedFields, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Producto actualizado exitosamente", updatedProduct });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: `El código ya existe.` });
    }
    processServerError(res, error);
  }
});

// Ruta para eliminar un producto por su ID
router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  if (!isValidObjectId(pid)) {
    res.status(400).json({ error: `El ID ingresado no es válido` });
  }

  try {
    const product = await ProductManager.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ error: `No existe en DB un producto con ID ${pid}` });
    }
    const deletedProduct = await ProductManager.deleteProduct(pid);
    res
      .status(200)
      .json({ message: "Producto eliminado exitosamente", deletedProduct });
  } catch (error) {
    processServerError(res, error);
  }
});
