import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const contenedor = document.getElementById("contenedorCatalogo");
  let imagenes = [];
  let productos = [];

  async function cargarImagenes() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
      imagenes = await res.json();
    } catch (e) {
      console.error("Error cargando imágenes:", e);
    }
  }

  function obtenerNombreImagen(id) {
    const imagen = imagenes.find(img => img.id_imagen === id);
    return imagen ? imagen.nombre : "placeholder.jpg";
  }

  async function cargarProductos() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
      productos = await res.json();

      contenedor.innerHTML = "";

      productos.forEach(producto => {
        const nombreImagen = obtenerNombreImagen(producto.id_imagen);

        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
          <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${nombreImagen}" alt="${producto.nombre_producto}">
          <h3>${producto.nombre_producto}</h3>
          <p>$ ${parseInt(producto.precio_producto).toLocaleString()}</p>
          <label for="cantidad-${producto.id_producto}">Cantidad:</label>
          <input type="number" min="1" value="1" class="input-cantidad" id="cantidad-${producto.id_producto}">
          <button class="btnAgregar" data-id="${producto.id_producto}">Agregar</button>
        `;

        div.addEventListener("click", (e) => {
          const excluir = ["BUTTON", "INPUT", "LABEL"];
          if (!excluir.includes(e.target.tagName)) {
            localStorage.setItem("productoDetalle", JSON.stringify(producto));
            window.location.href = "producto.html";
          }
        });

        contenedor.appendChild(div);
      });
    } catch (e) {
      console.error("Error cargando productos:", e);
      contenedor.innerHTML = `<p style="color:red;">No se pudieron cargar los productos.</p>`;
    }
  }

  function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    const contador = document.querySelector(".contador-carrito");
    if (contador) {
      contador.textContent = totalItems;
    }
  }

  contenedor.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnAgregar")) {
      const id = parseInt(e.target.dataset.id);
      const input = document.getElementById(`cantidad-${id}`);
      const cantidadDeseada = parseInt(input.value);

      const producto = productos.find(p => p.id_producto === id);

      if (!producto) {
        Swal.fire({
          icon: "error",
          title: "Producto no encontrado",
          text: "Verifica el catálogo."
        });
        return;
      }

      if (cantidadDeseada < 1) {
        Swal.fire({
          icon: "warning",
          title: "Cantidad inválida",
          text: "Por favor ingresa una cantidad válida."
        });
        return;
      }

      if (cantidadDeseada > producto.cantidad_producto) {
        Swal.fire({
          icon: "warning",
          title: "Stock insuficiente",
          text: `Solo hay ${producto.cantidad_producto} unidades disponibles de "${producto.nombre_producto}".`
        });
        return;
      }

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

      if (index >= 0) {
        const cantidadActual = carrito[index].cantidad;
        const nuevaCantidad = cantidadActual + cantidadDeseada;

        if (nuevaCantidad > producto.cantidad_producto) {
          Swal.fire({
            icon: "warning",
            title: "Exceso de stock",
            html: `Ya tienes <b>${cantidadActual}</b> en el carrito.<br>No puedes exceder el stock (<b>${producto.cantidad_producto}</b>).`
          });
          return;
        }

        carrito[index].cantidad = nuevaCantidad;
      } else {
        carrito.push({
          id_producto: producto.id_producto,
          nombre_producto: producto.nombre_producto,
          precio_producto: producto.precio_producto,
          id_imagen: producto.id_imagen,
          cantidad: cantidadDeseada
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarContadorCarrito();

      Swal.fire({
        icon: "success",
        title: "¡Producto agregado!",
        text: `"${producto.nombre_producto}" agregado al carrito (${cantidadDeseada})`,
        timer: 1800,
        showConfirmButton: false
      });
    }
  });

  // Ejecutar carga inicial
  (async () => {
    await cargarImagenes();
    await cargarProductos();
    actualizarContadorCarrito();
  })();
});

