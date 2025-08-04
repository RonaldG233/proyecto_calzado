import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarTalla");
  const selectEditar = document.getElementById("tallaEditar");
  const selectEliminar = document.getElementById("tallaEliminar");
  const inputNuevoNombre = document.getElementById("nuevoNombreTalla");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");

  let tallasCache = [];

  // Carga las tallas y actualiza selects y cache
  async function cargarTallas() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/tallas");
      const tallas = await response.json();

      tallasCache = tallas;

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
      Swal.fire({
        icon: "error",
        title: "Error al cargar tallas",
        text: "Intenta recargar la página.",
      });
    }
  }

  // Registrar nueva talla con validación de duplicado
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreTalla").value.trim();

    if (!nombre) {
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Debe ingresar un número de talla.",
      });
    }

    // Verificar si ya existe la talla (ignorar mayúsculas/minúsculas)
    const existe = tallasCache.some(
      (t) => String(t.numero_talla).toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      return Swal.fire({
        icon: "warning",
        title: "Talla duplicada",
        text: "Ya existe esa talla registrada.",
      });
    }

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/tallas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nombre }),
      });

      if (!response.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Talla registrada",
        text: "Se registró correctamente.",
      });

      e.target.reset();
      await cargarTallas();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la talla.",
      });
    }
  });

  // Editar talla con validación para evitar duplicados en otro registro
  btnEditar.addEventListener("click", async () => {
    const idTalla = selectEditar.value;
    const nuevoNombre = inputNuevoNombre.value.trim();

    if (!idTalla) {
      return Swal.fire({
        icon: "warning",
        title: "Sin selección",
        text: "Seleccione una talla para editar.",
      });
    }

    if (!nuevoNombre) {
      return Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Debe ingresar un nuevo número para la talla.",
      });
    }

    // Verificar si el nuevo nombre ya existe en otra talla diferente
    const existe = tallasCache.some(
      (t) =>
        String(t.numero_talla).toLowerCase() === nuevoNombre.toLowerCase() &&
        String(t.codTalla) !== idTalla
    );
    if (existe) {
      return Swal.fire({
        icon: "warning",
        title: "Talla duplicada",
        text: "Ya existe otra talla con ese número.",
      });
    }

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nuevoNombre }),
      });

      if (!response.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Talla actualizada",
        text: "La talla se actualizó correctamente.",
      });

      inputNuevoNombre.value = "";
      selectEditar.value = "";
      await cargarTallas();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la talla.",
      });
    }
  });

  // Eliminar talla
  btnEliminar.addEventListener("click", async () => {
    const idTalla = selectEliminar.value;

    if (!idTalla) {
      return Swal.fire({
        icon: "warning",
        title: "Sin selección",
        text: "Seleccione una talla para eliminar.",
      });
    }

    const confirmar = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar talla?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Talla eliminada",
        text: "Se eliminó correctamente.",
      });

      selectEliminar.value = "";
      await cargarTallas();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la talla. Puede estar en uso.",
      });
    }
  });

  // Inicializar carga de tallas
  cargarTallas();
});

