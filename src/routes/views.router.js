import { Router } from "express";
import { ProductManager } from "../dao/productManager.js";

const productManager = new ProductManager("./src/data/products.json");
export const router = Router();

router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { title: "Home", products });
});

router.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", { products });
});
