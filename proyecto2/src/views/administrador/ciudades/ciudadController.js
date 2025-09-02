import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarNombreCiudad, validarSeleccion } from "../../../Modules/validaciones.js";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const ciudadController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Referencias
  const formRegistrar = document.getElementById("formRegistrarCiudad");
  const formEditar = document.getElementById("formEditarCiudad");
  const formEliminar = document.getElementById("formEliminarCiudad");
  const formReactivar = document.getElementById("formReactivarCiudad");

  const inputNombre = document.getElementById("nombreCiudad");
  const selectEditar = document.getElementById("ciudadesEditar");
  const inputNuevoNombre = document.getElementById("nuevoNombreCiudad");
  const selectEliminar = document.getElementById("ciudadesEliminar");
  const selectReactivar = document.getElementById("ciudadesReactivar");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");
  const btnReactivar = document.getElementById("btnReactivar");

  // ================== CARGAR CIUDADES ==================
  async function cargarCiudades() {
    try {
      const activas = await get("ciudades/activas");
      const inactivas = await get("ciudades/inactivas");

      [selectEditar, selectEliminar, selectReactivar].forEach(sel => {
        sel.innerHTML = `<option value="">-- Selecciona una ciudad --</option>`;
      });

      activas.forEach(ciudad => {
        const option = new Option(ciudad.nombre_ciudad, ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad);
        selectEditar.add(option.cloneNode(true));
        selectEliminar.add(option.cloneNode(true));
      });

      inactivas.forEach(ciudad => {
        const option = new Option(ciudad.nombre_ciudad, ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad);
        selectReactivar.add(option);
      });
    } catch (err) {
      error("Error al cargar ciudades. Intenta nuevamente.");
      console.error(err);
    }
  }

  // ================== REGISTRAR ==================
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarNombreCiudad(inputNombre)) return;

    try {
      const res = await post("ciudades", { nombre_ciudad: inputNombre.value.trim() });
      if (res.status === 201) {
        await success("Ciudad registrada correctamente.");
        formRegistrar.reset();
        cargarCiudades();
      } else if (res.status === 409) {
        error("Ya existe una ciudad con ese nombre.");
      } else {
        error("Error al registrar ciudad.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // ================== EDITAR ==================
  btnEditar.addEventListener("click", async () => {
    if (!validarSeleccion(selectEditar) || !validarNombreCiudad(inputNuevoNombre)) return;

    const idCiudad = selectEditar.value;
    const nuevoNombre = inputNuevoNombre.value.trim();

    try {
      const res = await put(`ciudades/${idCiudad}`, { nombre_ciudad: nuevoNombre });
      if (res.ok) {
        await success("Ciudad actualizada correctamente.");
        inputNuevoNombre.value = "";
        cargarCiudades();
      } else {
        error("No se pudo actualizar la ciudad.");
      }
    } catch (err) {
      error("Error al actualizar ciudad.");
      console.error(err);
    }
  });

  // ================== INACTIVAR ==================
  btnEliminar.addEventListener("click", async () => {
    if (!validarSeleccion(selectEliminar)) return;
    const idCiudad = selectEliminar.value;

    const confirmResp = await confirmar("inactivar la ciudad");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`ciudades/${idCiudad}/inactivar`);
      if (res.ok) {
        await success("Ciudad inactivada.");
        cargarCiudades();
      } else {
        error("No se pudo inactivar la ciudad.");
      }
    } catch (err) {
      error("Error al inactivar ciudad.");
      console.error(err);
    }
  });

  // ================== REACTIVAR ==================
  btnReactivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectReactivar)) return;
    const idCiudad = selectReactivar.value;

    try {
      const res = await put(`ciudades/${idCiudad}/reactivar`);
      if (res.ok) {
        await success("Ciudad reactivada.");
        cargarCiudades();
      } else {
        error("No se pudo reactivar la ciudad.");
      }
    } catch (err) {
      error("Error al reactivar ciudad.");
      console.error(err);
    }
  });

  // Inicializar
  cargarCiudades();
};
