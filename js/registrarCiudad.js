document.addEventListener("DOMContentLoaded", () => {
  const formRegistrar = document.getElementById("formRegistrarCiudad");
  const formEditar = document.getElementById("formEditarCiudad");
  const formEliminar = document.getElementById("formEliminarCiudad");

  const inputNombre = document.getElementById("nombreCiudad");
  const selectEditar = document.getElementById("ciudadesEditar");
  const selectEliminar = document.getElementById("ciudadesEliminar");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");

  const mensaje = document.getElementById("mensajeCiudad");

  // Cargar ciudades en selects
  async function cargarCiudades() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
      const ciudades = await response.json();

      [selectEditar, selectEliminar].forEach((select) => {
        select.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';
        ciudades.forEach((ciudad) => {
          const option = document.createElement("option");
          option.value = ciudad.codCiudad;
          option.textContent = ciudad.nombre_ciudad;
          select.appendChild(option);
        });
      });
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
    }
  }

  // Mostrar mensaje
  function mostrarMensaje(texto, color = "white") {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }

  // REGISTRAR CIUDAD
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) {
      return mostrarMensaje("Debe ingresar un nombre de ciudad.", "red");
    }

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Ciudad registrada correctamente.", "green");
      formRegistrar.reset();
      cargarCiudades();
    } catch (error) {
      mostrarMensaje("Error al registrar ciudad.", "red");
    }
  });

  // EDITAR CIUDAD
  btnEditar.addEventListener("click", async () => {
    const idCiudad = selectEditar.value;
    if (!idCiudad) return mostrarMensaje("Seleccione una ciudad a editar.", "red");

    const nuevoNombre = document.getElementById("nuevoNombreCiudad").value.trim();
if (!nuevoNombre) {
  return mostrarMensaje("Debe ingresar un nuevo nombre para la ciudad.", "red");
}


    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/ciudades/${idCiudad}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nuevoNombre.trim() }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Ciudad actualizada correctamente.", "green");
      cargarCiudades();
    } catch (error) {
      mostrarMensaje("Error al actualizar la ciudad.", "red");
    }
  });

  // ELIMINAR CIUDAD
  btnEliminar.addEventListener("click", async () => {
    const idCiudad = selectEliminar.value;
    if (!idCiudad) return mostrarMensaje("Seleccione una ciudad a eliminar.", "red");

    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta ciudad?");
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

  // Cargar ciudades al iniciar
  cargarCiudades();
});
