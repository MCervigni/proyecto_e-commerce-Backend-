import express from "express";
import { engine } from "express-handlebars";
import { router as viewsRouter } from "./routes/views.router.js";
import { router as productsRouter } from "./routes/products.router.js";
import { router as cartsRouter } from "./routes/carts.router.js";
import { connectDB } from "./connDB.js";
import { config } from "./config/config.js";

const app = express();

app.engine("handlebars", engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.static("src/public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.listen(config.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${config.PORT}`);
});

connectDB(
  "mongodb+srv://marinacervignidev:MCervigni55@cluster0.flfry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  "ecommerce"
);