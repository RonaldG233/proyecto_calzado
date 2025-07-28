document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".tablaProducto");

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

  // Ejecutar carga inicial
  (async () => {
    await cargarImagenes();
    await cargarProductos();
  })();

  // Escuchar eventos de botones
  contenedor.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnEditar")) {
      const id = e.target.dataset.id;
      console.log("Editar producto con ID:", id);
      // Aquí podrías redirigir a un formulario de edición o abrir un modal
      window.location.href = `editarProducto.html?id=${id}`;
    }

    if (e.target.classList.contains("btnEliminar")) {
      const id = e.target.dataset.id;
      if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        fetch(`http://localhost:8080/proyectoCalzado/api/productos/${id}`, {
          method: "DELETE"
        })
        .then(res => {
          if (!res.ok) throw new Error("No se pudo eliminar");
          return res.text();
        })
        .then(msg => {
          console.log(msg);
          cargarProductos(); // recargar lista
        })
        .catch(err => {
          console.error("Error al eliminar producto:", err);
          alert("No se pudo eliminar el producto.");
        });
      }
    }
  });
});


