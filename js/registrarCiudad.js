document.addEventListener("DOMContentLoaded", () => {
  const formCiudad = document.getElementById("formCiudad");
  const mensaje = document.getElementById("mensajeCiudad");
  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");
  const selectCiudades = document.getElementById("ciudadesExistentes");
  const inputNombre = document.getElementById("nombreCiudad");

  // Cargar ciudades existentes al iniciar
  async function cargarCiudades() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
      const ciudades = await response.json();

      // Vaciar el select
      selectCiudades.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';

      // Rellenar con ciudades
      ciudades.forEach((ciudad) => {
        const option = document.createElement("option");
        option.value = ciudad.codCiudad;
        option.textContent = ciudad.nombre_ciudad;
        selectCiudades.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
    }
  }

  // Registrar ciudad
  formCiudad.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) return mostrarMensaje("Debe ingresar un nombre de ciudad.", "red");

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Ciudad registrada correctamente.", "green");
      formCiudad.reset();
      cargarCiudades();
    } catch (error) {
      mostrarMensaje("Error al registrar la ciudad.", "red");
    }
  });

  // Editar ciudad
  btnEditar.addEventListener("click", async () => {
    const idCiudad = selectCiudades.value;
    const nuevoNombre = prompt("Nuevo nombre de ciudad:");

    if (!idCiudad || !nuevoNombre) {
      return mostrarMensaje("Debe seleccionar una ciudad y escribir un nuevo nombre.", "red");
    }

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/ciudades/${idCiudad}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nuevoNombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Ciudad actualizada correctamente.", "green");
      cargarCiudades();
    } catch (error) {
      mostrarMensaje("Error al actualizar la ciudad.", "red");
    }
  });

  // Eliminar ciudad
  btnEliminar.addEventListener("click", async () => {
    const idCiudad = selectCiudades.value;
    if (!idCiudad) return mostrarMensaje("Seleccione una ciudad para eliminar.", "red");

    const confirmar = confirm("¿Estás seguro de eliminar esta ciudad?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/ciudades/${idCiudad}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Ciudad eliminada correctamente.", "green");
      cargarCiudades();
    } catch (error) {
      mostrarMensaje("Error al eliminar la ciudad.", "red");
    }
  });

  function mostrarMensaje(texto, color) {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }

  // Cargar ciudades al iniciar
  cargarCiudades();
});
