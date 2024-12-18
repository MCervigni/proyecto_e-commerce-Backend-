import fs from "fs";

export class ProductManager {
  constructor(path) {
    if (!path) {
      throw new Error(
        "Debe proporcionar una ruta válida para inicializar ProductManager."
      );
    }
    this.path = path;
  }

  // Método para obtener todos los productos
  async getProducts() {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      throw new Error("Error al leer los productos: " + error.message);
    }
  }

  // Método para obtener un producto por ID
  async getProductById(id) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`No se encontró un producto con ID ${id}`);
      }
      const product = products.find((p) => p.id === id);
      return product || null;
    } catch (error) {
      throw new Error("Error al buscar el producto: " + error.message);
    }
  }

  // Método para agregar un producto
  async addProduct(product) {
    try {
      const {
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails,
      } = product;

      if (!title || !description || !code || !price || !stock || !category) {
        throw new Error(
          "Todos los campos excepto thumbnails son obligatorios."
        );
      }

      const products = await this.getProducts();

      if (products.some((p) => p.code === code)) {
        throw new Error(`El producto con código ${code} ya existe.`);
      }

      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

      const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails,
      };

      products.push(newProduct);
      await this.#saveToFile(products);

      return newProduct;
    } catch (error) {
      throw new Error("Error al agregar el producto: " + error.message);
    }
  }

  // Método para modificar un producto
  async updateProduct(id, updates) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`No se encontró un producto con ID ${id}`);
      }
      products[index] = {
        ...products[index],
        ...updates,
        id,
      };

      await this.#saveToFile(products);

      return products[index];
    } catch (error) {
      throw new Error("Error al actualizar el producto: " + error.message);
    }
  }

  // Método para eliminar un producto
  async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`No se encontró un producto con ID ${id}`);
      }
      const deletedProduct = products.splice(index, 1)[0];
      await this.#saveToFile(products);

      return deletedProduct;
    } catch (error) {
      throw new Error("Error al eliminar el producto: " + error.message);
    }
  }

  // Método privado para guardar en el archivo
  async #saveToFile(data) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error("Error al guardar en el archivo: " + error.message);
    }
  }
}
