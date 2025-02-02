document.addEventListener("DOMContentLoaded", () => {
  async function addToCart(productId) {
    const cartId = document.getElementById("cartId").value;
    if (!cartId) {
      alert("Por favor, ingrese el ID del carrito.");
      return;
    }

    try {
      const response = await fetch(
        `/api/carts/${cartId}/product/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 400) {
        const result = await response.json();
        alert(`Error: ${result.error}`);
        return;
      }

      const result = await response.json();
      console.log(result);
      alert("Producto agregado al carrito exitosamente.");
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
      alert("Error al agregar el producto al carrito.");
    }
  }

  window.addToCart = addToCart;
});
