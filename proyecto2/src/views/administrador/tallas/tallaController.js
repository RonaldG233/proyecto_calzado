import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarTalla, validarSeleccion } from "../../../Modules/validaciones.js";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const tallaController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  const formRegistrar = document.getElementById("formRegistrarTalla");
  const selectEditar = document.getElementById("tallaEditar");
  const selectInactivar = document.getElementById("tallaInactivar");
  const selectActivar = document.getElementById("tallaActivar");
  const inputNombre = document.getElementById("nombreTalla");
  const inputNuevoNombre = document.getElementById("nuevoNombreTalla");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnActivar = document.getElementById("btnActivar");

  // Cargar tallas en los selects
  async function cargarTallas() {
    try {
      const activas = await get("tallas/activas");
      const inactivas = await get("tallas/inactivas");

      [selectEditar, selectInactivar, selectActivar].forEach(sel => {
        sel.innerHTML = `<option value="">-- Selecciona una talla --</option>`;
      });

      activas.forEach(talla => {
        const option = new Option(talla.numero_talla, talla.codTalla ?? talla.id_talla ?? talla.cod_talla);
        selectEditar.add(option.cloneNode(true));
        selectInactivar.add(option.cloneNode(true));
      });

      inactivas.forEach(talla => {
        const option = new Option(talla.numero_talla, talla.codTalla ?? talla.id_talla ?? talla.cod_talla);
        selectActivar.add(option);
      });
    } catch (err) {
      error("Error al cargar tallas. Intenta nuevamente.");
      console.error(err);
    }
  }

  // REGISTRAR TALLA
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const numero = inputNombre.value.trim();

    if (!numero || isNaN(numero) || Number(numero) <= 0) {
      error("Ingrese un número válido para la talla.");
      return;
    }

    try {
      const res = await post("tallas", { numero_talla: Number(numero) });
      if (res.status === 201) {
        await success("Talla registrada correctamente.");
        formRegistrar.reset();
        cargarTallas();
      } else if (res.status === 409) {
        error("Ya existe una talla con ese número.");
      } else {
        error("Error al registrar la talla.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // EDITAR TALLA
  btnEditar.addEventListener("click", async () => {
    if (!validarSeleccion(selectEditar) || !validarTalla(inputNuevoNombre)) return;

    const idTalla = selectEditar.value;
    const nuevoNombre = inputNuevoNombre.value.trim();

    try {
      const res = await put(`tallas/${idTalla}`, { numero_talla: Number(nuevoNombre) });
      if (res.ok) {
        await success("Talla actualizada correctamente.");
        inputNuevoNombre.value = "";
        selectEditar.value = "";
        cargarTallas();
      } else {
        error("No se pudo actualizar la talla.");
      }
    } catch (err) {
      error("Error al actualizar la talla.");
      console.error(err);
    }
  });

  // INACTIVAR TALLA
  btnInactivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectInactivar)) return;

    const idTalla = selectInactivar.value;
    const confirmResp = await confirmar("inactivar la talla");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`tallas/${idTalla}/inactivar`);
      if (res.ok) {
        await success("Talla inactivada correctamente.");
        selectInactivar.value = "";
        cargarTallas();
      } else {
        error("No se pudo inactivar la talla.");
      }
    } catch (err) {
      error("Error al inactivar talla.");
      console.error(err);
    }
  });

  // REACTIVAR TALLA
  btnActivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectActivar)) return;

    const idTalla = selectActivar.value;

    try {
      const res = await put(`tallas/${idTalla}/reactivar`);
      if (res.ok) {
        await success("Talla reactivada.");
        selectActivar.value = "";
        cargarTallas();
      } else {
        error("No se pudo reactivar la talla.");
      }
    } catch (err) {
      error("Error al reactivar talla.");
      console.error(err);
    }
  });

  cargarTallas();
};

