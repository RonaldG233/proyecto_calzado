import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarNombre, validarSeleccion } from "../../../Modules/validaciones.js";
import { confirmar, success, error, info } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const pagoController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  // Insertar layout
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Formularios
  const formRegistrar = document.getElementById("formRegistrarPago");
  const selectEditar = document.getElementById("pagoEditar");
  const selectInactivar = document.getElementById("pagoInactivar");
  const selectReactivar = document.getElementById("pagoReactivar");

  const inputNombre = document.getElementById("nombrePago");
  const inputNuevoNombre = document.getElementById("nuevoNombrePago");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnReactivar = document.getElementById("btnReactivar");

  let listaPagos = [];

  // Cargar métodos de pago
  const cargarPagos = async () => {
    try {
      const activos = await get("pagos/activas");
      const inactivos = await get("pagos/inactivas");
      listaPagos = [...activos, ...inactivos];

      // Llenar selects
      [selectEditar, selectInactivar].forEach(sel => {
        sel.innerHTML = `<option value="">-- Seleccione un método --</option>`;
        activos.forEach(p => {
          const option = new Option(p.metodo_pago, p.id_pago);
          sel.add(option);
        });
      });

      selectReactivar.innerHTML = `<option value="">-- Seleccione un método --</option>`;
      inactivos.forEach(p => {
        const option = new Option(p.metodo_pago, p.id_pago);
        selectReactivar.add(option);
      });

    } catch (err) {
      error("Error al cargar métodos de pago.");
      console.error(err);
    }
  };

  // REGISTRAR
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarNombre(inputNombre)) return;

    const nombre = inputNombre.value.trim();
    if (listaPagos.some(p => p.metodo_pago.toLowerCase() === nombre.toLowerCase())) {
      return info("Nombre duplicado", "Ya existe un método con ese nombre.");
    }

    try {
      const res = await post("pagos", {
        metodo_pago: nombre,
        id_estado: 1, // Activo por defecto
      });

      if (res.status === 201) {
        await success("Método registrado correctamente.");
        formRegistrar.reset();
        cargarPagos();
      } else if (res.status === 409) {
        info("Duplicado", "Ese método de pago ya existe.");
      } else {
        error("Error al registrar el método.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // EDITAR
  btnEditar.addEventListener("click", async () => {
    if (!validarSeleccion(selectEditar) || !validarNombre(inputNuevoNombre)) return;

    const id = selectEditar.value;
    const nuevoNombre = inputNuevoNombre.value.trim();

    if (listaPagos.some(p => p.metodo_pago.toLowerCase() === nuevoNombre.toLowerCase() && p.id_pago != id)) {
      return info("Nombre duplicado", "Ya existe otro método con ese nombre.");
    }

    try {
      const res = await put(`pagos/${id}`, { metodo_pago: nuevoNombre });

      if (res.ok) {
        await success("Método actualizado correctamente.");
        selectEditar.value = "";
        inputNuevoNombre.value = "";
        cargarPagos();
      } else {
        error("No se pudo actualizar el método.");
      }
    } catch (err) {
      error("Error al actualizar el método.");
      console.error(err);
    }
  });

  // INACTIVAR
  btnInactivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectInactivar)) return;

    const id = selectInactivar.value;
    const confirmResp = await confirmar("inactivar el método de pago");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`pagos/inactivar/${id}`);
      if (res.ok) {
        await success("Método inactivado correctamente.");
        selectInactivar.value = "";
        cargarPagos();
      } else {
        error("No se pudo inactivar el método.");
      }
    } catch (err) {
      error("Error al inactivar el método.");
      console.error(err);
    }
  });

  // REACTIVAR
  btnReactivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectReactivar)) return;

    const id = selectReactivar.value;

    try {
      const res = await put(`pagos/reactivar/${id}`);
      if (res.ok) {
        await success("Método reactivado correctamente.");
        selectReactivar.value = "";
        cargarPagos();
      } else {
        error("No se pudo reactivar el método.");
      }
    } catch (err) {
      error("Error al reactivar el método.");
      console.error(err);
    }
  });

  cargarPagos();
};
