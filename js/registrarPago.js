document.addEventListener("DOMContentLoaded", () => {
  const URL = "http://localhost:8080/proyectoCalzado/api/pagos";

  const formRegistrar = document.getElementById("formRegistrarPago");
  const formEditar = document.getElementById("formEditarPago");
  const formEliminar = document.getElementById("formEliminarPago");

  const selectEditar = document.getElementById("pagoEditar");
  const selectEliminar = document.getElementById("pagoEliminar");
  const mensaje = document.getElementById("mensajePago");

  // Función para mostrar mensajes
  const mostrarMensaje = (texto, tipo = "exito") => {
    mensaje.textContent = texto;
    mensaje.style.color = tipo === "exito" ? "green" : "red";
    setTimeout(() => mensaje.textContent = "", 3000);
  };

  // Cargar métodos de pago en los select
  const cargarPagos = async () => {
    try {
      const resp = await fetch(URL);
      const pagos = await resp.json();

      // Limpiar selects
      selectEditar.innerHTML = '<option value="">-- Selecciona un método --</option>';
      selectEliminar.innerHTML = '<option value="">-- Selecciona un método --</option>';

      pagos.forEach(pago => {
        const optionEditar = document.createElement("option");
        optionEditar.value = pago.id_pago;
        optionEditar.textContent = pago.metodo_pago;  // CORREGIDO
        selectEditar.appendChild(optionEditar);

        const optionEliminar = optionEditar.cloneNode(true);
        selectEliminar.appendChild(optionEliminar);
      });
    } catch (err) {
      mostrarMensaje("Error al cargar los métodos de pago", "error");
    }
  };

  cargarPagos();

  // Registrar método
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombrePago").value.trim();
    if (!nombre) return mostrarMensaje("Nombre requerido", "error");

    try {
      const resp = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_pago: nombre }), // CORREGIDO
      });

      if (resp.ok) {
        mostrarMensaje("Método registrado con éxito");
        formRegistrar.reset();
        cargarPagos();
      } else {
        mostrarMensaje("Error al registrar", "error");
      }
    } catch (err) {
      mostrarMensaje("Error al conectar con la API", "error");
    }
  });

  // Editar método
  document.getElementById("btnEditar").addEventListener("click", async () => {
    const id = selectEditar.value;
    const nuevoNombre = document.getElementById("nuevoNombrePago").value.trim();
    if (!id || !nuevoNombre) return mostrarMensaje("Selecciona y escribe nuevo nombre", "error");

    try {
      const resp = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_pago: nuevoNombre }), // CORREGIDO
      });

      if (resp.ok) {
        mostrarMensaje("Método editado con éxito");
        formEditar.reset();
        cargarPagos();
      } else {
        mostrarMensaje("Error al editar", "error");
      }
    } catch (err) {
      mostrarMensaje("Error al conectar con la API", "error");
    }
  });

  // Eliminar método
  document.getElementById("btnEliminar").addEventListener("click", async () => {
    const id = selectEliminar.value;
    if (!id) return mostrarMensaje("Selecciona un método", "error");

    if (!confirm("¿Estás seguro de eliminar este método de pago?")) return;

    try {
      const resp = await fetch(`${URL}/${id}`, { method: "DELETE" });

      if (resp.ok) {
        mostrarMensaje("Método eliminado con éxito");
        formEliminar.reset();
        cargarPagos();
      } else {
        mostrarMensaje("Error al eliminar", "error");
      }
    } catch (err) {
      mostrarMensaje("Error al conectar con la API", "error");
    }
  });
});
