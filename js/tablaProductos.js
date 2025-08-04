import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();
  const contenedor = document.querySelector(".tablaProducto");

  let imagenes = [];

  async function cargarImagenes() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
      imagenes = await res.json();
    } catch (e) {
      console.error("Error cargando imágenes:", e);
    }
  }

  function buscarNombreImagen(id) {
    const img = imagenes.find(img => img.id_imagen === id);
    return img?.nombre || "placeholder.jpg";
  }

  async function cargarProductos() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
      const productos = await response.json();

      contenedor.innerHTML = "";

      if (!Array.isArray(productos)) throw new Error("Respuesta inesperada");

      productos.forEach(producto => {
        const {
          id_producto,
          nombre_producto,
          descripcion_producto,
          precio_producto,
          cantidad_producto,
          cod_estilo,
          cod_talla,
          id_empresa,
          id_imagen
        } = producto;

        const card = document.createElement("div");
        card.classList.add("cardProducto");

        const nombreImagen = buscarNombreImagen(id_imagen);

        card.innerHTML = `
          <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${nombreImagen}" alt="Producto" class="imgProducto"/>
          <div class="infoProducto">
            <h3>${nombre_producto}</h3>
            <p>${descripcion_producto}</p>
            <p class="precio">$${typeof precio_producto === "number" ? precio_producto.toFixed(2) : "0.00"}</p>
            <p class="cantidad">Stock: ${cantidad_producto ?? "?"}</p>
            <div class="accionesProducto">
              <button class="btnEditar" data-id="${id_producto}">Editar</button>
              <button class="btnEliminar" data-id="${id_producto}">Eliminar</button>
            </div>
          </div>
        `;

        contenedor.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar productos:", error);
      contenedor.innerHTML = `<p style="color:red">Error al cargar productos</p>`;
    }
  }

  contenedor.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnEditar")) {
      const id = e.target.dataset.id;
      window.location.href = `editarProducto.html?id=${id}`;
    }

    if (e.target.classList.contains("btnEliminar")) {
      const id = e.target.dataset.id;

      Swal.fire({
        title: "¿Eliminar producto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:8080/proyectoCalzado/api/productos/${id}`, {
              method: "DELETE"
            });

            if (!res.ok) throw new Error();

            Swal.fire("Eliminado", "El producto fue eliminado correctamente.", "success");
            cargarProductos();
          } catch (err) {
            console.error("Error al eliminar producto:", err);
            Swal.fire("Error", "No se pudo eliminar el producto.", "error");
          }
        }
      });
    }
  });

  (async () => {
    await cargarImagenes();
    await cargarProductos();
  })();
});
