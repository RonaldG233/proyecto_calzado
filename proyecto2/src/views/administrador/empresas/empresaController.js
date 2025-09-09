import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const empresaController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  const btnHamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (btnHamburger && sidebar) {
    btnHamburger.addEventListener("click", () => {
      sidebar.classList.toggle("activo");
    });

    // Opcional: cerrar sidebar al dar click en un link
    sidebar.querySelectorAll(".sidebar-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("activo");
      });
    });
  }

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

  // ------------------ AUX ------------------
  const limpiarSelect = (select) => {
    select.innerHTML = "<option value=''>-- Seleccione una empresa --</option>";
  };

  // ------------------ CARGAR EMPRESAS ------------------
  const cargarEmpresas = async () => {
    try {
      listaEmpresas = await get("empresas");

      [selectEditar, selectInactivar, selectActivar].forEach(limpiarSelect);

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

  // ------------------ REGISTRAR EMPRESA ------------------
  formRegistrar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const direccion = inputDireccion.value.trim();
  const telefono = inputTelefono.value.trim();
  const correo = inputCorreo.value.trim();

  if (!nombre) return;

  try {
    // Verificar si ya existe una empresa con el mismo nombre
    const todas = await get("empresas");
    if (todas.some(emp => emp.nombre_empresa.toLowerCase() === nombre.toLowerCase())) {
      return error("Ya existe una empresa con ese nombre."); // SweetAlert
    }

    const res = await post("empresas", { nombre_empresa: nombre, direccion_empresa: direccion, telefono_empresa: telefono, correo_empresa: correo });
    if (res.status === 201) {
      await success("Empresa registrada correctamente.");
      formRegistrar.reset();
      cargarEmpresas();
    } else if (res.status === 500) {
      error("No se pudo registrar la empresa.");
    } else {
      error("Error al registrar la empresa.");
    }
  } catch (err) {
    error("Error en la solicitud.");
    console.error(err);
  }
});
  // ------------------ COMPLETAR DATOS PARA EDITAR ------------------
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

  // ------------------ EDITAR EMPRESA ------------------
  btnEditar.addEventListener("click", async () => {
  const id = selectEditar.value;
  const nuevoNombre = inputNuevoNombre.value.trim();
  const nuevaDireccion = inputNuevaDireccion.value.trim();
  const nuevoTelefono = inputNuevoTelefono.value.trim();
  const nuevoCorreo = inputNuevoCorreo.value.trim();

  if (!id || !nuevoNombre) return;

  try {
    // Verificar si el nuevo nombre ya existe en otra empresa
    if (listaEmpresas.some(emp => emp.nombre_empresa.toLowerCase() === nuevoNombre.toLowerCase() && emp.idEmpresa != id)) {
      return error("No se puede cambiar a un nombre de empresa que ya está registrado.");
    }

    const confirmResp = await confirmar(`editar la empresa "${nuevoNombre}"`);
    if (!confirmResp.isConfirmed) return;

    const res = await put(`empresas/${id}`, {
      nombre_empresa: nuevoNombre,
      direccion_empresa: nuevaDireccion,
      telefono_empresa: nuevoTelefono,
      correo_empresa: nuevoCorreo
    });

    if (res.ok) {
      await success("Empresa actualizada correctamente.");
      selectEditar.value = "";
      inputNuevoNombre.value = inputNuevaDireccion.value = inputNuevoTelefono.value = inputNuevoCorreo.value = "";
      cargarEmpresas();
    } else if (res.status === 409) {
      error("No se puede editar la empresa porque tiene registros relacionados.");
    } else if (res.status === 404) {
      error("La empresa que intentas editar no existe.");
    } else {
      error("Error al actualizar la empresa.");
    }
  } catch (err) {
    error("Error en la solicitud.");
    console.error(err);
  }
});
  // ------------------ INACTIVAR EMPRESA ------------------
  btnInactivar.addEventListener("click", async () => {
    const id = selectInactivar.value;
    if (!id) return;

    const confirmResp = await confirmar("inactivar la empresa");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`empresas/${id}/inactivar`);
      if (res.ok) {
        await success("Empresa inactivada correctamente.");
        selectInactivar.value = "";
        cargarEmpresas();
      } else if (res.status === 409) {
        error("No se puede inactivar la empresa porque tiene registros relacionados.");
      } else {
        error("No se pudo inactivar la empresa.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // ------------------ ACTIVAR EMPRESA ------------------
  btnActivar.addEventListener("click", async () => {
    const id = selectActivar.value;
    if (!id) return;

    try {
      const res = await put(`empresas/${id}/reactivar`);
      if (res.ok) {
        await success("Empresa activada correctamente.");
        selectActivar.value = "";
        cargarEmpresas();
      } else if (res.status === 404) {
        error("La empresa que intentas activar no existe.");
      } else {
        error("No se pudo activar la empresa.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

  // ------------------ INICIALIZAR ------------------
  cargarEmpresas();
};
