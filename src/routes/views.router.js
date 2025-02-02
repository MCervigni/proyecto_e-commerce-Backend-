import { Router } from "express";
import { ProductManagerMongoDB as ProductManager } from "../dao/productManagerMongoDB.js";
import { CartManagerMongoDB as CartManager } from "../dao/cartManagerMongoDB.js";
import { processServerError } from "../utils.js";

export const router = Router();

router.get("/products", async (req, res) => {
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

    let {
      docs: products,
      totalPages,
      hasPrevPage,
      prevPage,
      hasNextPage,
      nextPage,
    } = await ProductManager.getProducts(filter, options);

    res.render("home", {
      title: "Home",
      products,
      totalPages,
      hasPrevPage,
      prevPage,
      hasNextPage,
      nextPage,
    });
  } catch (error) {
    processServerError(res, error);
  }
});

router.get("/cart/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartManager.getCartById(cid);
    if (!cart) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No existe carrito con ID ${cid}` });
    }

    res.render("cart", {
      title: "Cart",
      cart,
    });
  } catch (error) {
    processServerError(res, error);
  }
});
