document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.querySelector(".editarImagen");

  // Obtener ID de la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>Error: No se proporcionó un ID válido.</p>";
    return;
  }

  try {
    // Solicitar imagen por ID
    const response = await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener la imagen.");

    const imagen = await response.json();

    // Mostrar formulario con datos actuales
    const html = `
      <h2>Editar Imagen</h2>
      <form id="formEditar">
        <label for="nombre">Nuevo nombre de la imagen:</label>
        <input type="text" id="nombre" name="nombre" value="${imagen.nombre}" required>

        <p>Vista previa:</p>
        <img src="http://localhost:8080/proyectoCalzado/imagenes?nombre=${imagen.nombre}" alt="${imagen.nombre}" width="200" />

        <br><br>
        <button type="submit">Guardar cambios</button>
        <a href="./tablaImagenes.html"><button type="button">Cancelar</button></a>
      </form>
    `;

    contenedor.innerHTML = html;

    // Manejar envío del formulario
    const form = document.getElementById("formEditar");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nuevoNombre = document.getElementById("nombre").value;

      const datosActualizados = {
        id_imagen: parseInt(id),
        nombre: nuevoNombre,
        ruta_imagen: nuevoNombre // Reutiliza el nombre como ruta
      };

      try {
        const res = await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datosActualizados)
        });

        if (!res.ok) throw new Error("Error al actualizar");

        alert("Imagen actualizada correctamente.");
        window.location.href = "./tablaImagenes.html";
      } catch (err) {
        console.error("Error al actualizar:", err);
        alert("No se pudo actualizar la imagen.");
      }
    });
  } catch (error) {
    console.error("Error al cargar la imagen:", error);
    contenedor.innerHTML = "<p>Error al cargar la imagen.</p>";
  }
});
