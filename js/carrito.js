document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listaCarrito");
  const totalSpan = document.getElementById("totalPago");
  const btnConfirmar = document.getElementById("btnConfirmarPedido");
  const selectPago = document.getElementById("selectPago");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let productosDisponibles = [];

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario || usuario?.id_usuario;

  async function cargarProductosStock() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
      productosDisponibles = await res.json();
    } catch (e) {
      console.error("Error cargando productos para validar stock:", e);
    }
  }

  async function cargarImagenes() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
      return await res.json();
    } catch (e) {
      console.error("Error cargando imágenes:", e);
      return [];
    }
  }

  async function cargarMetodosPago() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pagos");
      const pagos = await res.json();
      selectPago.innerHTML = '<option value="">-- Selecciona método de pago --</option>';
      pagos.forEach(pago => {
        const option = document.createElement("option");
        option.value = pago.id_pago;
        option.textContent = pago.metodo_pago;
        selectPago.appendChild(option);
      });
    } catch (e) {
      console.error("Error cargando métodos de pago:", e);
    }
  }

  function calcularTotal() {
    return carrito.reduce((total, item) => {
      return total + (item.precio_producto * item.cantidad);
    }, 0);
  }

  async function renderCarrito() {
    contenedor.innerHTML = "";

    const imagenes = await cargarImagenes();

    carrito.forEach((item, index) => {
      const productoStock = productosDisponibles.find(p => p.id_producto === item.id_producto);
      const stock = productoStock?.cantidad_producto ?? 1;
      const imagen = imagenes.find(i => i.id_imagen === item.id_imagen)?.nombre || "placeholder.jpg";

      const div = document.createElement("div");
      div.classList.add("item-carrito");

      div.innerHTML = `
        <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagen}" alt="${item.nombre_producto}">
        <div class="info">
          <h3>${item.nombre_producto}</h3>
          <p>Precio: $${parseInt(item.precio_producto).toLocaleString()}</p>
          <label for="cant-${index}">Cantidad:</label>
          <input type="number" id="cant-${index}" min="1" max="${stock}" value="${item.cantidad}">
          <button class="btnEliminar" data-index="${index}">Eliminar</button>
        </div>
      `;

      contenedor.appendChild(div);

      div.querySelector(`#cant-${index}`).addEventListener("change", (e) => {
        const nueva = parseInt(e.target.value);
        if (nueva < 1 || nueva > stock) {
          Swal.fire({
            icon: "warning",
            title: "Cantidad inválida",
            text: `La cantidad debe estar entre 1 y ${stock}.`
          });
          e.target.value = item.cantidad;
        } else {
          carrito[index].cantidad = nueva;
          localStorage.setItem("carrito", JSON.stringify(carrito));
          totalSpan.textContent = calcularTotal().toLocaleString();
        }
      });

      div.querySelector(".btnEliminar").addEventListener("click", () => {
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderCarrito();
        totalSpan.textContent = calcularTotal().toLocaleString();
      });
    });

    totalSpan.textContent = calcularTotal().toLocaleString();
  }

  btnConfirmar.addEventListener("click", async () => {
    if (carrito.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Carrito vacío",
        text: "Tu carrito está vacío, agrega productos para continuar."
      });
      return;
    }

    const idPago = parseInt(selectPago.value);

    if (!idPago) {
      Swal.fire({
        icon: "warning",
        title: "Método de pago requerido",
        text: "Selecciona un método de pago para continuar."
      });
      return;
    }

    const pedido = {
      idUsuario: idUsuario,
      idPago: idPago,
      fechaHora: new Date().toISOString(),
      valorPagoTotal: parseFloat(calcularTotal().toFixed(2))
    };

    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pedido)
      });

      if (!res.ok) throw new Error("Error al registrar pedido");

      const idPedido = await res.json();

      for (const item of carrito) {
        const detalle = {
          idPedido: idPedido,
          idProducto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precio_producto)
        };

        const detalleRes = await fetch("http://localhost:8080/proyectoCalzado/api/detalle-pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detalle)
        });

        if (!detalleRes.ok) {
          throw new Error(`Error al registrar detalle del producto ${item.nombre_producto}`);
        }
      }

      Swal.fire({
        icon: "success",
        title: "Pedido confirmado",
        text: "¡Tu pedido fue confirmado exitosamente!",
        timer: 2000,
        showConfirmButton: false
      });

      localStorage.removeItem("carrito");
      setTimeout(() => {
        window.location.href = "catalogo.html";
      }, 2000);

    } catch (e) {
      console.error("Error confirmando pedido:", e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo confirmar el pedido. Intenta nuevamente más tarde."
      });
    }
  });

  await cargarProductosStock();
  await cargarMetodosPago();
  await renderCarrito();
});
