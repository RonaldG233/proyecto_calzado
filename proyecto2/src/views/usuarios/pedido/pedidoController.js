import HeaderUsuario from "../../../components/headerUsuario.html?raw";
import SidebarUsuario from "../../../components/sidebarUsuario.html?raw";
import Swal from "sweetalert2";

export const pedidoController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const contenedor = document.getElementById("listaCarrito");
  const totalInput = document.getElementById("totalPagoInput"); // Cambiado a input
  const btnConfirmar = document.getElementById("btnConfirmarPedido");
  const selectPago = document.getElementById("selectPago");

  headerContainer.innerHTML = HeaderUsuario;
  sidebarContainer.innerHTML = SidebarUsuario;
    const btnHamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (btnHamburger && sidebar) {
    btnHamburger.addEventListener("click", () => {
      sidebar.classList.toggle("activo");
    });

    // Opcional: cerrar sidebar al dar click en un link
    sidebar.querySelectorAll(".sidebar-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("activo");
      });
    });
  }



  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let productosDisponibles = [];

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario || usuario?.id_usuario;

  // Cargar productos y stock
  const cargarProductosStock = async () => {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
      productosDisponibles = await res.json();
    } catch (e) {
      console.error("Error cargando productos:", e);
    }
  };

  // Cargar métodos de pago
  const cargarMetodosPago = async () => {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pagos");
      const pagos = await res.json();
      selectPago.innerHTML = '<option value="">-- Selecciona método de pago --</option>';
      pagos.forEach(pago => {
        if (pago.id_estado == 1) {
          const option = document.createElement("option");
          option.value = pago.id_pago;
          option.textContent = pago.metodo_pago;
          selectPago.appendChild(option);
        }
      });
    } catch (e) {
      console.error("Error cargando métodos de pago:", e);
    }
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + Number(item.precio_producto) * Number(item.cantidad), 0);
  };

  // Actualizar stock de una talla de producto
  const actualizarStockTalla = async (idProducto, codTalla, cantidadVendida) => {
    try {
      const resStock = await fetch(`http://localhost:8080/proyectoCalzado/api/productos/${idProducto}/tallas`);
      if (!resStock.ok) throw new Error("Error obteniendo stock actual");
      const tallas = await resStock.json();
      const talla = tallas.find(t => t.codTalla === codTalla);
      if (!talla) throw new Error("Talla no encontrada");

      const nuevoStock = talla.numeroStock - cantidadVendida;
      if (nuevoStock < 0) throw new Error("Stock insuficiente");

      const ptActualizado = { idProducto, codTalla, numeroStock: nuevoStock };

      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/productos/${idProducto}/tallas/${codTalla}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ptActualizado)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mensaje || "No se pudo actualizar stock en DB");
      }

      // Actualizar localStorage
      const tallasLocal = JSON.parse(localStorage.getItem(`tallasProducto_${idProducto}`)) || [];
      const tallaSel = tallasLocal.find(t => t.codTalla === codTalla);
      if (tallaSel) {
        tallaSel.stock = nuevoStock;
        localStorage.setItem(`tallasProducto_${idProducto}`, JSON.stringify(tallasLocal));
      }

      return true;
    } catch (e) {
      console.error("Error actualizando stock:", e);
      return false;
    }
  };

  // Renderizar carrito
  const renderCarrito = () => {
    contenedor.innerHTML = "";
    if (carrito.length === 0) {
      totalInput.value = "$0";
      contenedor.innerHTML = "<p>El carrito está vacío.</p>";
      return;
    }

    carrito.forEach((item, index) => {
      const productoStock = productosDisponibles.find(p => p.id_producto === item.id_producto);
      const stock = productoStock?.cantidad_producto ?? 1;
      const imagen = productoStock?.url_imagen || "default.png";

      const div = document.createElement("div");
      div.classList.add("item-carrito");

      div.innerHTML = `
        <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagen}" alt="${item.nombre_producto}" class="img-carrito">
        <div class="info">
          <h3>${item.nombre_producto} (Talla ${item.numero_talla})</h3>
          <p>Precio: $${Number(item.precio_producto).toLocaleString("es-CO")}</p>
          <label for="cant-${index}">Cantidad:</label>
          <input type="number" id="cant-${index}" min="1" max="${stock}" value="${item.cantidad}">
          <button class="btnEliminar" data-index="${index}">Eliminar</button>
        </div>
      `;

      contenedor.appendChild(div);

      // Evento para cambiar cantidad
      const inputCantidad = div.querySelector(`#cant-${index}`);
      inputCantidad.addEventListener("change", (e) => {
        let nueva = parseInt(e.target.value);
        if (isNaN(nueva) || nueva < 1 || nueva > stock) {
          Swal.fire("Cantidad inválida", `Debe ser entre 1 y ${stock}`, "warning");
          e.target.value = item.cantidad;
        } else {
          carrito[index].cantidad = nueva;
          localStorage.setItem("carrito", JSON.stringify(carrito));
          totalInput.value = `$${calcularTotal().toLocaleString("es-CO")}`;
        }
      });

      // Evento para eliminar producto
      div.querySelector(".btnEliminar").addEventListener("click", () => {
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderCarrito();
        totalInput.value = `$${calcularTotal().toLocaleString("es-CO")}`;
      });
    });

    totalInput.value = `$${calcularTotal().toLocaleString("es-CO")}`;
  };

  // Confirmar pedido
  btnConfirmar.addEventListener("click", async () => {
    if (carrito.length === 0) return Swal.fire("Carrito vacío", "Agrega productos antes de continuar.", "info");

    const idPago = parseInt(selectPago.value);
    if (!idPago) return Swal.fire("Método de pago requerido", "Selecciona uno para continuar.", "warning");

    const pedido = {
      idUsuario,
      idPago,
      fechaHora: new Date().toISOString(),
      valorPagoTotal: parseFloat(calcularTotal().toFixed(2))
    };

    try {
      // Registrar pedido
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
      if (!res.ok) throw new Error("Error al registrar pedido");
      const idPedido = await res.json();

      // Registrar detalles y actualizar stock
      for (const item of carrito) {
        const detalle = {
          idPedido,
          idProducto: Number(item.id_producto),
          codTalla: Number(item.codTalla),
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precio_producto)
        };

        const detalleRes = await fetch("http://localhost:8080/proyectoCalzado/api/detalle-pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detalle)
        });
        if (!detalleRes.ok) throw new Error(`Error en detalle de ${item.nombre_producto}`);

        await actualizarStockTalla(item.id_producto, item.codTalla, item.cantidad);
      }

      Swal.fire("Pedido confirmado", "¡Tu pedido fue registrado exitosamente!", "success");
      localStorage.removeItem("carrito");
      setTimeout(() => window.location.href = "#catalogo", 2000);
    } catch (e) {
      console.error("Error confirmando pedido:", e);
      Swal.fire("Error", "No se pudo confirmar el pedido.", "error");
    }
  });

  const init = async () => {
    await cargarProductosStock();
    await cargarMetodosPago();
    renderCarrito();
  };

  init();
};
