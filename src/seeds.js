import fs from "fs";
import path from 'path';
import { config } from "./src/config/config.js";
import readline from "readline";
import { ProductManagerMongoDB as ProductManager } from "./src/dao/productManagerMongoDB.js";

let products = [
  {
    title: "Mat Blue",
    description:
      "Mat de yoga de 4mm confeccionado en goma antideslizante, proporciona estabilidad al practicante de yoga en la tracción. Funciona como aislante térmico. Color: turquesa.",
    code: "MB001",
    price: 35000,
    status: true,
    stock: 12,
    category: "mats",
    thumbnails: ["https://i.ibb.co/2FjpfKp/Mat-Blue.png"],
  },
  {
    title: "Mat Green",
    description:
      "Mat de yoga de 4mm confeccionado en goma antideslizante, proporciona estabilidad al practicante de yoga en la tracción. Funciona como aislante térmico. Color: verde.",
    code: "MG001",
    price: 35000,
    status: true,
    stock: 9,
    category: "mats",
    thumbnails: ["https://i.ibb.co/jhTX5ND/Mat-Green.png"],
  },
  {
    title: "Mat Purple",
    description:
      "Mat de yoga de 4mm confeccionado en goma antideslizante, proporciona estabilidad al practicante de yoga en la tracción. Funciona como aislante térmico. Color: violeta.",
    code: "MP001",
    price: 35000,
    status: true,
    stock: 11,
    category: "mats",
    thumbnails: ["https://i.ibb.co/809v6VW/Mat-Purple.png"],
  },
  {
    title: "Mat Corcho",
    description:
      "Mat de yoga de 6mm confeccionado en corcho natural, con propiedades antideslizantes y antibacterianas. Este material proporciona la amortiguación justa para protejer las articulaciones durante la práctica de yoga dinámico.",
    code: "MCC01",
    price: 40000,
    status: true,
    stock: 6,
    category: "mats",
    thumbnails: ["https://i.ibb.co/yhB9BvV/Mat-Corcho.png"],
  },
  {
    title: "Portamat Liso",
    description:
      "Bolso portamat hecho de lona de algodón de alta calidad, garantizando durabilidad y resistencia. Cuenta con un amplio compartimento para acomodar tu mat con un diseño espacioso te permite llevar otros elementos esenciales, como toallas y accesorios. Color: verde oliva.",
    code: "PML01",
    price: 20000,
    status: true,
    stock: 7,
    category: "portamats",
    thumbnails: ["https://i.ibb.co/7nF4nvR/Portamat-Liso.png"],
  },
  {
    title: "Portamat Mandalas",
    description:
      "Bolso portamat hecho de lona de algodón de alta calidad, garantizando durabilidad y resistencia. Cuenta con un amplio compartimento para acomodar tu mat con uu diseño espacioso te permite llevar otros elementos esenciales, como toallas y accesorios. Color: gris oscuro con estampa de mandalas en color blanco.",
    code: "PMM01",
    price: 22000,
    status: true,
    stock: 10,
    category: "portamats",
    thumbnails: ["https://i.ibb.co/N6fdbX6/Portamat-Mandala.png"],
  },
  {
    title: "Bolster Pink",
    description:
      "Cilindro de tela de algodón relleno de estopa. Elemento versátil por la variedad de usos. Es utilizado como apoyo relajante para las piernas cansadas, cinturas doloridas, o bien como descanso. Aporta altura para realizar posturas con mayor armonía. Color: rosa.",
    code: "BP001",
    price: 18000,
    status: true,
    stock: 5,
    category: "bolsters",
    thumbnails: ["https://i.ibb.co/7Rnqpmr/Bolster-Pink.png"],
  },
  {
    title: "Bolster Grey",
    description:
      "Cilindro de tela de algodón relleno de estopa. Elemento versátil por la variedad de usos. Es utilizado como apoyo relajante para las piernas cansadas, cinturas doloridas, o bien como descanso. Aporta altura para realizar posturas con mayor armonía. Color: gris.",
    code: "BG001",
    price: 18000,
    status: true,
    stock: 3,
    category: "bolsters",
    thumbnails: ["https://i.ibb.co/xgRXYM1/Bolster-Grey.png"],
  },
  {
    title: "Bolster Red",
    description:
      "Cilindro de tela de algodón relleno de estopa. Elemento versátil por la variedad de usos. Es utilizado como apoyo relajante para las piernas cansadas, cinturas doloridas, o bien como descanso. Aporta altura para realizar posturas con mayor armonía. Color: rojo.",
    code: "BR001",
    price: 18000,
    status: true,
    stock: 3,
    category: "bolsters",
    thumbnails: ["https://i.ibb.co/gzL3JZF/Bolster-Red.png"],
  },
  {
    title: "Bloque Madera",
    description:
      "Taco de madera de pino estacionado de 25 x 15 x 7 cm con todos sus cantos y aristas redondeados y lijados. Proveen altura y soporte en la posturas de pie haciéndolas más efectivas y armoniosas.",
    code: "BQM01",
    price: 9000,
    status: true,
    stock: 12,
    category: "bloques",
    thumbnails: ["https://i.ibb.co/yn3YPW6/Bloque-Madera.png"],
  },
  {
    title: "Bloque Goma Eva",
    description:
      "Taco de goma eva de 23 x 15 x 7 cm. Proveen altura y soporte en la posturas de pie haciéndolas más efectivas y armoniosas. Color: violeta.",
    code: "BQG01",
    price: 14000,
    status: true,
    stock: 9,
    category: "bloques",
    thumbnails: ["https://i.ibb.co/s2BqVQX/Bloque-Goma-Eva.png"],
  },
  {
    title: "Bloque Corcho",
    description:
      "Taco de corcho natural de 23 x 15 x 7 cm. Proveen altura y soporte en la posturas de pie haciéndolas más efectivas y armoniosas.",
    code: "BQC01",
    price: 18000,
    status: true,
    stock: 6,
    category: "bloques",
    thumbnails: ["https://i.ibb.co/3czBgzK/Bloque-Corcho.png"],
  },
  {
    title: "Cinto Algodón",
    description:
      "Cinto de algodón de 3cm de ancho y 1,7 mts. de largo. Con hebilla doble resistente a la tracción. Sirven como prolongación de los brazos para aquellas personas con escasa flexibilidad. Ayudan a alcanzar, dependiendo la postura, los pies o las manos. Color: negro.",
    code: "C0001",
    price: 6000,
    status: true,
    stock: 8,
    category: "cintos",
    thumbnails: ["https://i.ibb.co/XXF3K2P/Cinto.png"],
  },
  {
    title: "Cinto Poliester",
    description:
      "Cinto de poliester de 3cm de ancho y 1,9 mts. de largo. Con hebilla doble resistente a la tracción. Sirven como prolongación de los brazos para aquellas personas con escasa flexibilidad. Ayudan a alcanzar, dependiendo la postura, los pies o las manos. Color: negro.",
    code: "C0001",
    price: 5000,
    status: true,
    stock: 8,
    category: "cintos",
    thumbnails: ["https://i.ibb.co/XXF3K2P/Cinto.png"],
  },
];

const creaData = async (clave) => {
  if (clave !== "seedProducts55") {
    console.log(`Contraseña seed incorrecta!`);
    return;
  }

  if (!config.PRODUCTS_PATH) {
    console.log(`Complete la ruta del archivo de products en config.js`);
    return;
  }

  let productsPath = path.resolve(config.PRODUCTS_PATH);

  try {
    await fs.promises.writeFile(
      productsPath,
      JSON.stringify(products, null, 5)
    );
    console.log(`Data generada!`);

    let dataProducts = JSON.parse(
      await fs.promises.readFile(productsPath, { encoding: "utf-8" })
    );
    let result = await ProductManager.insertMany(dataProducts);
    console.log("Productos inicializados!", result);
  } catch (error) {
    console.log("Error al inicializar los productos:", error.message);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

rl.question('Por favor, introduce tu clave: ', (clave) => {
  creaData(clave);
  rl.close();
});