import express from "express";
import { createServer } from "http";
import { Server } from 'socket.io';
import { engine } from "express-handlebars";
import { router as viewsRouter } from "./routes/views.router.js";
import { router as productsRouter } from "./routes/products.router.js";
import { router as cartsRouter } from "./routes/carts.router.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

/* app.use(express.json());
app.use(express.urlencoded({ extended: true })); */

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.static("public"));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
});

app.set("socketio", io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
