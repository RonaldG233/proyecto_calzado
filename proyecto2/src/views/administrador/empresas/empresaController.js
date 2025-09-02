import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarNombre, validarCorreo, validarTelefono, validarSeleccion } from "../../../Modules/validaciones.js";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const empresaController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Formularios y campos
  const formRegistrar = document.getElementById("formRegistrarEmpresa");
  const selectEditar = document.getElementById("empresaEditar");
  const selectInactivar = document.getElementById("empresaInactivar");
  const selectActivar = document.getElementById("empresaActivar");

  const inputNombre = document.getElementById("nombreEmpresa");
  const inputDireccion = document.getElementById("direccionEmpresa");
  const inputTelefono = document.getElementById("telefonoEmpresa");
  const inputCorreo = document.getElementById("correoEmpresa");

  const inputNuevoNombre = document.getElementById("nuevoNombreEmpresa");
  const inputNuevaDireccion = document.getElementById("nuevaDireccionEmpresa");
  const inputNuevoTelefono = document.getElementById("nuevoTelefonoEmpresa");
  const inputNuevoCorreo = document.getElementById("nuevoCorreoEmpresa");

  const btnEditar = document.getElementById("btnEditarEmpresa");
  const btnInactivar = document.getElementById("btnInactivarEmpresa");
  const btnActivar = document.getElementById("btnActivarEmpresa");

  let listaEmpresas = [];

  // Cargar empresas y llenar selects
  const cargarEmpresas = async () => {
    try {
      listaEmpresas = await get("empresas");

      [selectEditar, selectInactivar, selectActivar].forEach(sel => sel.innerHTML = `<option value="">-- Seleccione una empresa --</option>`);

      listaEmpresas.forEach(emp => {
        const option = new Option(emp.nombre_empresa, emp.idEmpresa);

        if (emp.id_estado === 1) {
          selectEditar.add(option.cloneNode(true));
          selectInactivar.add(option.cloneNode(true));
        } else if (emp.id_estado === 2) {
          selectActivar.add(option);
        }
      });
    } catch (err) {
      error("Error al cargar empresas.");
      console.error(err);
    }
  };

  // REGISTRAR EMPRESA
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarNombre(inputNombre) || !validarNombre(inputDireccion) || !validarTelefono(inputTelefono) || !validarCorreo(inputCorreo)) return;

    try {
      const res = await post("empresas", {
        nombre_empresa: inputNombre.value.trim(),
        direccion_empresa: inputDireccion.value.trim(),
        telefono_empresa: inputTelefono.value.trim(),
        correo_empresa: inputCorreo.value.trim()
      });

      if (res.status === 201) {
        await success("Empresa registrada correctamente.");
        formRegistrar.reset();
        cargarEmpresas();
      } else if (res.status === 409) {
        error("Ya existe una empresa con ese nombre.");
      } else {
        error("Error al registrar la empresa.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // COMPLETAR DATOS PARA EDITAR
  selectEditar.addEventListener("change", () => {
    const empresa = listaEmpresas.find(e => e.idEmpresa == selectEditar.value);
    if (empresa) {
      inputNuevoNombre.value = empresa.nombre_empresa;
      inputNuevaDireccion.value = empresa.direccion_empresa;
      inputNuevoTelefono.value = empresa.telefono_empresa;
      inputNuevoCorreo.value = empresa.correo_empresa;
    } else {
      inputNuevoNombre.value = inputNuevaDireccion.value = inputNuevoTelefono.value = inputNuevoCorreo.value = "";
    }
  });

  // EDITAR EMPRESA
  btnEditar.addEventListener("click", async () => {
    if (!validarSeleccion(selectEditar) || !validarNombre(inputNuevoNombre) || !validarNombre(inputNuevaDireccion) || !validarTelefono(inputNuevoTelefono) || !validarCorreo(inputNuevoCorreo)) return;

    const id = selectEditar.value;
    try {
      const res = await put(`empresas/${id}`, {
        nombre_empresa: inputNuevoNombre.value.trim(),
        direccion_empresa: inputNuevaDireccion.value.trim(),
        telefono_empresa: inputNuevoTelefono.value.trim(),
        correo_empresa: inputNuevoCorreo.value.trim()
      });

      if (res.ok) {
        await success("Empresa actualizada correctamente.");
        selectEditar.value = "";
        inputNuevoNombre.value = inputNuevaDireccion.value = inputNuevoTelefono.value = inputNuevoCorreo.value = "";
        cargarEmpresas();
      } else {
        error("No se pudo actualizar la empresa.");
      }
    } catch (err) {
      error("Error al actualizar la empresa.");
      console.error(err);
    }
  });

  // INACTIVAR EMPRESA
  btnInactivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectInactivar)) return;

    const id = selectInactivar.value;
    const confirmResp = await confirmar("inactivar la empresa");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`empresas/${id}/inactivar`);
      if (res.ok) {
        await success("Empresa inactivada correctamente.");
        selectInactivar.value = "";
        cargarEmpresas();
      } else {
        error("No se pudo inactivar la empresa.");
      }
    } catch (err) {
      error("Error al inactivar la empresa.");
      console.error(err);
    }
  });

  // ACTIVAR EMPRESA
  btnActivar.addEventListener("click", async () => {
    if (!validarSeleccion(selectActivar)) return;

    const id = selectActivar.value;
    try {
      const res = await put(`empresas/${id}/reactivar`);
      if (res.ok) {
        await success("Empresa activada correctamente.");
        selectActivar.value = "";
        cargarEmpresas();
      } else {
        error("No se pudo activar la empresa.");
      }
    } catch (err) {
      error("Error al activar la empresa.");
      console.error(err);
    }
  });

  cargarEmpresas();
};
