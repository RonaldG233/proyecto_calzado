import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarPago");
  const formEditar = document.getElementById("formEditarPago");
  const formInactivar = document.getElementById("formInactivarPago");
  const formReactivar = document.getElementById("formReactivarPago");

  const inputNombre = document.getElementById("nombrePago");
  const selectEditar = document.getElementById("pagoEditar");
  const selectInactivar = document.getElementById("pagoInactivar");
  const selectReactivar = document.getElementById("pagoReactivar");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnReactivar = document.getElementById("btnReactivar");

  let pagosCache = [];

  function mostrarMensaje(titulo, texto, icono = "info") {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: "Aceptar",
    });
  }

  async function cargarPagos() {
    try {
      const resActivos = await fetch("http://localhost:8080/proyectoCalzado/api/pagos/activas");
      const activos = await resActivos.json();

      const resInactivos = await fetch("http://localhost:8080/proyectoCalzado/api/pagos/inactivas");
      const inactivos = await resInactivos.json();

      pagosCache = activos.concat(inactivos);

      // Limpio selects editar e inactivar con activos
      [selectEditar, selectInactivar].forEach((select) => {
        select.innerHTML = '<option value="">-- Selecciona un método --</option>';
        activos.forEach((pago) => {
          const option = document.createElement("option");
          option.value = pago.id_pago;
          option.textContent = pago.metodo_pago;
          select.appendChild(option);
        });
      });

      // Limpio select reactivar con inactivos
      selectReactivar.innerHTML = '<option value="">-- Selecciona un método --</option>';
      inactivos.forEach((pago) => {
        const option = document.createElement("option");
        option.value = pago.id_pago;
        option.textContent = pago.metodo_pago;
        selectReactivar.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error", "No se pudieron cargar los métodos de pago.", "error");
    }
  }

  // Registrar nuevo método con validación
  formRegistrar?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (!nombre) {
      mostrarMensaje("Campo vacío", "Debe ingresar un nombre para el método de pago.", "warning");
      return;
    }
    if (pagosCache.some((p) => p.metodo_pago.toLowerCase() === nombre.toLowerCase())) {
      mostrarMensaje("Nombre duplicado", "Ya existe un método con ese nombre.", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Aquí usas id_estado = 1 (activo) porque en la tabla el campo es así
        body: JSON.stringify({ metodo_pago: nombre, id_estado: 1 }),
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Método registrado correctamente.", "success");
      formRegistrar.reset();
      cargarPagos();
    } catch {
      mostrarMensaje("Error", "No se pudo registrar el método.", "error");
    }
  });

  // Editar método con validación duplicados
  btnEditar?.addEventListener("click", async () => {
    const idPago = selectEditar.value;
    if (!idPago) {
      mostrarMensaje("Atención", "Seleccione un método a editar.", "warning");
      return;
    }
    const nuevoNombre = document.getElementById("nuevoNombrePago").value.trim();
    if (!nuevoNombre) {
      mostrarMensaje("Campo vacío", "Debe ingresar un nuevo nombre para el método.", "warning");
      return;
    }
    if (pagosCache.some((p) => p.metodo_pago.toLowerCase() === nuevoNombre.toLowerCase() && p.id_pago != idPago)) {
      mostrarMensaje("Nombre duplicado", "Ya existe otro método con ese nombre.", "warning");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/pagos/${idPago}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Solo actualizamos metodo_pago, no el estado
        body: JSON.stringify({ metodo_pago: nuevoNombre }),
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Método actualizado correctamente.", "success");
      document.getElementById("nuevoNombrePago").value = "";
      selectEditar.value = "";
      cargarPagos();
    } catch {
      mostrarMensaje("Error", "No se pudo actualizar el método.", "error");
    }
  });

  // Inactivar método con confirmación
  btnInactivar?.addEventListener("click", async () => {
    const idPago = selectInactivar.value;
    if (!idPago) {
      mostrarMensaje("Atención", "Seleccione un método para inactivar.", "warning");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción inactivará el método seleccionado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/pagos/inactivar/${idPago}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Método inactivado correctamente.", "success");
      cargarPagos();
    } catch {
      mostrarMensaje("Error", "No se pudo inactivar el método.", "error");
    }
  });

  // Reactivar método
  btnReactivar?.addEventListener("click", async () => {
    const idPago = selectReactivar.value;
    if (!idPago) {
      mostrarMensaje("Atención", "Seleccione un método para reactivar.", "warning");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/pagos/reactivar/${idPago}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error();
      mostrarMensaje("¡Éxito!", "Método reactivado correctamente.", "success");
      selectReactivar.value = "";
      cargarPagos();
    } catch {
      mostrarMensaje("Error", "No se pudo reactivar el método.", "error");
    }
  });

  cargarPagos();
});
