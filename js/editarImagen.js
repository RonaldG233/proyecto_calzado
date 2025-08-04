import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  componentes();

  const contenedor = document.querySelector(".editarImagen");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>Error: No se proporcionó un ID válido.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener la imagen.");

    const imagen = await response.json();

    // Guardamos el nombre original para usar en la vista previa
    const nombreOriginal = imagen.nombre;

    const html = `
      <h2>Editar Imagen</h2>
      <form id="formEditar">
        <label for="nombre">Nuevo nombre de la imagen:</label>
        <input type="text" id="nombre" name="nombre" value="${imagen.nombre}" required>

        <p>Vista previa:</p>
        <img id="vistaPrevia" src="http://localhost:8080/proyectoCalzado/imagenes?nombre=${encodeURIComponent(nombreOriginal)}" alt="${imagen.nombre}" width="200" />

        <br><br>
        <button type="submit">Guardar cambios</button>
        <a href="./tablaImagenes.html"><button type="button">Cancelar</button></a>
      </form>
    `;

    contenedor.innerHTML = html;

    const form = document.getElementById("formEditar");
    const inputNombre = document.getElementById("nombre");
    const vistaPrevia = document.getElementById("vistaPrevia");

    // Si cambias el nombre en el input, no actualices la imagen porque el archivo no cambia aquí.
    // Solo muestra la imagen con el nombre original hasta que el backend confirme cambio en archivo (si es que lo hace).
    inputNombre.addEventListener("input", () => {
      // No hacemos nada para no cambiar la vista previa hasta que se recargue
      // Podrías mostrar un mensaje que advierta que la vista previa no cambiará hasta recargar
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nuevoNombre = inputNombre.value.trim();
      if (!nuevoNombre) {
        Swal.fire("Error", "El nombre no puede estar vacío.", "warning");
        return;
      }

      const datosActualizados = {
        id_imagen: parseInt(id),
        nombre: nuevoNombre,
        ruta_imagen: nombreOriginal // Mantenemos ruta_imagen con el nombre original para no romper la imagen
      };

      try {
        const res = await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosActualizados)
        });

        if (!res.ok) throw new Error();

        await Swal.fire("¡Actualizado!", "La imagen se ha modificado correctamente.", "success");
        window.location.href = "./tablaImagenes.html";
      } catch (err) {
        console.error("Error al actualizar:", err);
        Swal.fire("Error", "No se pudo actualizar la imagen.", "error");
      }
    });

  } catch (error) {
    console.error("Error al cargar la imagen:", error);
    contenedor.innerHTML = "<p>Error al cargar la imagen.</p>";
  }
});
