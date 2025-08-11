import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarTalla");
  const selectEditar = document.getElementById("tallaEditar");
  const selectInactivar = document.getElementById("tallaInactivar");
  const selectActivar = document.getElementById("tallaActivar");
  const inputNuevoNombre = document.getElementById("nuevoNombreTalla");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnActivar = document.getElementById("btnActivar");

  let tallasCache = [];

  function mostrarMensaje(titulo, texto, icono = "info") {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: "Aceptar",
    });
  }

  async function cargarTallas() {
    try {
      const resActivas = await fetch("http://localhost:8080/proyectoCalzado/api/tallas/activas");
      const tallasActivas = await resActivas.json();

      const resInactivas = await fetch("http://localhost:8080/proyectoCalzado/api/tallas/inactivas");
      const tallasInactivas = await resInactivas.json();

      tallasCache = tallasActivas.concat(tallasInactivas);

      // Rellenar selects de editar e inactivar con tallas activas
      [selectEditar, selectInactivar].forEach((select) => {
        select.innerHTML = '<option value="">-- Selecciona una talla --</option>';
        tallasActivas.forEach((talla) => {
          const option = document.createElement("option");
          option.value = talla.codTalla;
          option.textContent = talla.numero_talla;
          select.appendChild(option);
        });
      });

      // Rellenar select de activar con tallas inactivas
      selectActivar.innerHTML = '<option value="">-- Selecciona una talla --</option>';
      tallasInactivas.forEach((talla) => {
        const option = document.createElement("option");
        option.value = talla.codTalla;
        option.textContent = talla.numero_talla;
        selectActivar.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error", "No se pudieron cargar las tallas.", "error");
    }
  }

  // Registrar nueva talla
  formRegistrar?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreTalla").value.trim();
    if (!nombre) {
      mostrarMensaje("Campo vacío", "Debe ingresar un número de talla.", "warning");
      return;
    }
    if (tallasCache.some((t) => t.numero_talla.toLowerCase() === nombre.toLowerCase())) {
      mostrarMensaje("Talla duplicada", "Ya existe una talla con ese número.", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/tallas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nombre }),
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Talla registrada correctamente.", "success");
      e.target.reset();
      cargarTallas();
    } catch {
      mostrarMensaje("Error", "No se pudo registrar la talla.", "error");
    }
  });

  // Editar talla
  btnEditar?.addEventListener("click", async () => {
    const idTalla = selectEditar.value;
    const nuevoNombre = inputNuevoNombre.value.trim();
    if (!idTalla) {
      mostrarMensaje("Atención", "Seleccione una talla para editar.", "warning");
      return;
    }
    if (!nuevoNombre) {
      mostrarMensaje("Campo vacío", "Debe ingresar un nuevo número para la talla.", "warning");
      return;
    }
    if (
      tallasCache.some(
        (t) => t.numero_talla.toLowerCase() === nuevoNombre.toLowerCase() && t.codTalla != idTalla
      )
    ) {
      mostrarMensaje("Talla duplicada", "Ya existe otra talla con ese número.", "warning");
      return;
    }

    try {
      // Verificar relación
      const relRes = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}/tienerelacion`);
      if (!relRes.ok) throw new Error("No se pudo verificar la relación");
      const data = await relRes.json();

      if (data.tieneRelacion) {
        mostrarMensaje("Error", "No se puede editar una talla que está relacionada.", "error");
        return;
      }

      // Actualizar
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_talla: nuevoNombre }),
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Talla actualizada correctamente.", "success");
      inputNuevoNombre.value = "";
      selectEditar.value = "";
      cargarTallas();
    } catch (error) {
      mostrarMensaje("Error", "No se pudo actualizar la talla.", "error");
    }
  });

  // Inactivar talla
  btnInactivar?.addEventListener("click", async () => {
    const idTalla = selectInactivar.value;
    if (!idTalla) {
      mostrarMensaje("Atención", "Seleccione una talla para inactivar.", "warning");
      return;
    }

    try {
      const relRes = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}/tienerelacion`);
      if (!relRes.ok) throw new Error("No se pudo verificar la relación");
      const data = await relRes.json();

      if (data.tieneRelacion) {
        mostrarMensaje("Error", "No se puede inactivar una talla que está relacionada.", "error");
        return;
      }

      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción inactivará la talla seleccionada.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, inactivar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacion.isConfirmed) return;

      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}/inactivar`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Talla inactivada correctamente.", "success");
      selectInactivar.value = "";
      cargarTallas();
    } catch {
      mostrarMensaje("Error", "No se pudo inactivar la talla.", "error");
    }
  });

  // Activar talla
  btnActivar?.addEventListener("click", async () => {
    const idTalla = selectActivar.value;
    if (!idTalla) {
      mostrarMensaje("Atención", "Seleccione una talla para activar.", "warning");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/tallas/${idTalla}/reactivar`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Talla activada correctamente.", "success");
      selectActivar.value = "";
      cargarTallas();
    } catch {
      mostrarMensaje("Error", "No se pudo activar la talla.", "error");
    }
  });

  cargarTallas();
});
