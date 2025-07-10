document.addEventListener("DOMContentLoaded", () => {
  const formRegistrar = document.getElementById("formRegistrarTalla");
  const formEditar = document.getElementById("formEditarTalla");
  const formEliminar = document.getElementById("formEliminarTalla");

  const inputNombre = document.getElementById("nombreTalla");
  const selectEditar = document.getElementById("tallaEditar");
  const selectEliminar = document.getElementById("tallaEliminar");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");

  const mensaje = document.getElementById("mensajeTalla");

  // Cargar tallas en selects
  async function cargarTallas() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/tallas");
      const tallas = await response.json();

      [selectEditar, selectEliminar].forEach((select) => {
        select.innerHTML = '<option value="">-- Selecciona una talla --</option>';
        tallas.forEach((talla) => {
          const option = document.createElement("option");
          option.value = talla.codTalla;
          option.textContent = talla.numero_talla;
          select.appendChild(option);
        });
      });
    } catch (error) {
      console.error("Error al cargar tallas:", error);
    }
  }

  // Mostrar mensaje
  function mostrarMensaje(texto, color = "white") {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }

  // REGISTRAR TALLA
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) {
      return mostrarMensaje("Debe ingresar un número de talla.", "red");
    }

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/tallas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Talla registrada correctamente.", "green");
      formRegistrar.reset();
      cargarTallas();
    } catch (error) {
      mostrarMensaje("Error al registrar la talla.", "red");
    }
  });

  // EDITAR TALLA
  btnEditar.addEventListener("click", async () => {
    const idTalla = selectEditar.value;
    if (!idTalla) return mostrarMensaje("Seleccione una talla a editar.", "red");

    const nuevoNombre = document.getElementById("nuevoNombreTalla").value.trim();
    if (!nuevoNombre) {
      return mostrarMensaje("Debe ingresar un nuevo número para la talla.", "red");
    }

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nuevoNombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Talla actualizada correctamente.", "green");
      cargarTallas();
      document.getElementById("nuevoNombreTalla").value = "";
      selectEditar.value = "";
    } catch (error) {
      mostrarMensaje("Error al actualizar la talla.", "red");
    }
  });

  // ELIMINAR TALLA
  btnEliminar.addEventListener("click", async () => {
    const idTalla = selectEliminar.value;
    if (!idTalla) return mostrarMensaje("Seleccione una talla a eliminar.", "red");

    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta talla?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Talla eliminada correctamente.", "green");
      cargarTallas();
      selectEliminar.value = "";
    } catch (error) {
      mostrarMensaje("Error al eliminar la talla.", "red");
    }
  });

  // Cargar tallas al iniciar
  cargarTallas();
});
