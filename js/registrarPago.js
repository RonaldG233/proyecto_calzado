import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();
  const URL = "http://localhost:8080/proyectoCalzado/api/pagos";

  const formRegistrar = document.getElementById("formRegistrarPago");
  const formEditar = document.getElementById("formEditarPago");
  const formEliminar = document.getElementById("formEliminarPago");

  const selectEditar = document.getElementById("pagoEditar");
  const selectEliminar = document.getElementById("pagoEliminar");

  let pagosCache = [];

  // Función para mostrar mensajes con SweetAlert2
  const mostrarAlerta = (titulo, texto, icono = "success") => {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: "Aceptar"
    });
  };

  // Cargar métodos de pago y actualizar selects
  const cargarPagos = async () => {
    try {
      const resp = await fetch(URL);
      if (!resp.ok) throw new Error("Error al cargar métodos");
      const pagos = await resp.json();

      pagosCache = pagos; // Guardar para validaciones

      selectEditar.innerHTML = '<option value="">-- Selecciona un método --</option>';
      selectEliminar.innerHTML = '<option value="">-- Selecciona un método --</option>';

      pagos.forEach(pago => {
        const optionEditar = document.createElement("option");
        optionEditar.value = pago.id_pago;
        optionEditar.textContent = pago.metodo_pago;
        selectEditar.appendChild(optionEditar);

        const optionEliminar = optionEditar.cloneNode(true);
        selectEliminar.appendChild(optionEliminar);
      });
    } catch (err) {
      mostrarAlerta("Error", "No se pudieron cargar los métodos de pago", "error");
    }
  };

  cargarPagos();

  // Registrar método con validación de duplicado
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombrePago").value.trim();

    if (!nombre) {
      mostrarAlerta("Campo vacío", "Debes ingresar un nombre para el método de pago", "warning");
      return;
    }

    // Validar que no exista el método (ignorando mayúsculas)
    const existe = pagosCache.some(p => p.metodo_pago.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      mostrarAlerta("Nombre duplicado", "Ya existe un método con ese nombre.", "warning");
      return;
    }

    try {
      const resp = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_pago: nombre }),
      });

      if (resp.ok) {
        mostrarAlerta("¡Éxito!", "Método registrado con éxito", "success");
        formRegistrar.reset();
        cargarPagos();
      } else {
        mostrarAlerta("Error", "No se pudo registrar el método", "error");
      }
    } catch (err) {
      mostrarAlerta("Error", "Fallo al conectar con la API", "error");
    }
  });

  // Editar método con validación para evitar nombre duplicado
  document.getElementById("btnEditar").addEventListener("click", async () => {
    const id = selectEditar.value;
    const nuevoNombre = document.getElementById("nuevoNombrePago").value.trim();

    if (!id || !nuevoNombre) {
      mostrarAlerta("Datos incompletos", "Selecciona un método y escribe el nuevo nombre", "warning");
      return;
    }

    // Validar que el nuevo nombre no coincida con otro método distinto
    const existeOtro = pagosCache.some(p => p.metodo_pago.toLowerCase() === nuevoNombre.toLowerCase() && p.id_pago != id);
    if (existeOtro) {
      mostrarAlerta("Nombre duplicado", "Ya existe otro método con ese nombre.", "warning");
      return;
    }

    try {
      const resp = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo_pago: nuevoNombre }),
      });

      if (resp.ok) {
        mostrarAlerta("¡Éxito!", "Método editado con éxito", "success");
        formEditar.reset();
        cargarPagos();
      } else {
        mostrarAlerta("Error", "No se pudo editar el método", "error");
      }
    } catch (err) {
      mostrarAlerta("Error", "Fallo al conectar con la API", "error");
    }
  });

  // Eliminar método con confirmación
  document.getElementById("btnEliminar").addEventListener("click", async () => {
    const id = selectEliminar.value;

    if (!id) {
      mostrarAlerta("Advertencia", "Selecciona un método a eliminar", "warning");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el método de pago seleccionado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const resp = await fetch(`${URL}/${id}`, { method: "DELETE" });

      if (resp.ok) {
        mostrarAlerta("¡Éxito!", "Método eliminado correctamente", "success");
        formEliminar.reset();
        cargarPagos();
      } else {
        mostrarAlerta("Error", "No se pudo eliminar el método", "error");
      }
    } catch (err) {
      mostrarAlerta("Error", "Fallo al conectar con la API", "error");
    }
  });
});
