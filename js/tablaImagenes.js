document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".tablaImagen");

  // Función para cargar imágenes desde la API
  const cargarImagenes = async () => {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
      if (!response.ok) {
        throw new Error("Error al obtener las imágenes");
      }
      const imagenes = await response.json();

      if (imagenes.length === 0) {
        contenedor.innerHTML = "<p>No hay imágenes registradas.</p>";
        return;
      }

      let html = `
        <h2>Listado de Imágenes</h2>
        <table border="1" cellpadding="10" cellspacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

      imagenes.forEach((img) => {
        html += `
          <tr>
            <td>${img.id_imagen}</td>
            <td>${img.nombre}</td>
            <td><img src="http://localhost:8080/proyectoCalzado/imagenes?nombre=${img.nombre}" alt="${img.nombre}" width="100" /></td>
            <td>
              <a href="./editarImagen.html?id=${img.id_imagen}">
  <button>Editar</button>
</a>

              <button class="eliminar" data-id="${img.id_imagen}" data-nombre="${img.nombre}">Eliminar</button>
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      contenedor.innerHTML = html;
// Eliminar imagen
      contenedor.querySelectorAll(".eliminar").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          const nombre = e.target.getAttribute("data-nombre");

          if (confirm(`¿Estás seguro de eliminar la imagen "${nombre}"?`)) {
            try {
              const res = await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes/${id}`, {
                method: "DELETE",
              });

              if (!res.ok) throw new Error("Error al eliminar");

              alert("Imagen eliminada correctamente");
              cargarImagenes();
            } catch (err) {
              console.error("Error al eliminar:", err);
              alert("No se pudo eliminar la imagen.");
            }
          }
        });
      });


      // Aquí puedes implementar lógica para los botones de editar (si lo deseas más adelante)
    } catch (error) {
      console.error("Error:", error);
      contenedor.innerHTML = "<p>Error al cargar imágenes.</p>";
    }
  };

  // Función para renderizar el formulario
  const renderizarFormulario = () => {
    const formularioHTML = `
      <h2>Registrar Nueva Imagen</h2>
      <form id="formImagen" enctype="multipart/form-data">
        <label for="nombre">Nombre de la imagen:</label>
        <input type="text" id="nombre" name="nombre" required>

        <label for="archivo">Selecciona una imagen:</label>
        <input type="file" id="archivo" name="archivo" accept="image/*" required>

        <button type="submit">Subir Imagen</button>
      </form>
      <hr>
    `;

    contenedor.insertAdjacentHTML("afterbegin", formularioHTML);

    const form = document.getElementById("formImagen");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes/subir", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al subir la imagen");
        }

        alert("Imagen registrada correctamente");
        form.reset();
        cargarImagenes(); // Recargar la tabla
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Error al registrar la imagen");
      }
    });
  };

  renderizarFormulario();
  cargarImagenes();
});
