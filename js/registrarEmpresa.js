import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarEmpresa");
  const formEditar = document.getElementById("formEditarEmpresa");

  const inputNombre = document.getElementById("nombreEmpresa");
  const inputDireccion = document.getElementById("direccionEmpresa");
  const inputTelefono = document.getElementById("telefonoEmpresa");
  const inputCorreo = document.getElementById("correoEmpresa");

  const selectEditar = document.getElementById("empresaEditar");
  const inputNuevoNombre = document.getElementById("nuevoNombreEmpresa");
  const inputNuevaDireccion = document.getElementById("nuevaDireccionEmpresa");
  const inputNuevoTelefono = document.getElementById("nuevoTelefonoEmpresa");
  const inputNuevoCorreo = document.getElementById("nuevoCorreoEmpresa");

  const selectInactivar = document.getElementById("empresaInactivar");
  const selectActivar = document.getElementById("empresaActivar");

  const btnEditar = document.getElementById("btnEditarEmpresa");
  const btnInactivar = document.getElementById("btnInactivarEmpresa");
  const btnActivar = document.getElementById("btnActivarEmpresa");

  let listaEmpresas = [];

  function mostrarMensaje(titulo, texto, icono = "success") {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: "Aceptar",
    });
  }

  async function cargarEmpresas() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/empresas");
      const empresas = await res.json();
      listaEmpresas = empresas;

      // Empresas activas para editar
      selectEditar.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
      empresas
        .filter(e => e.id_estado === 1)
        .forEach(empresa => {
          const option = document.createElement("option");
          option.value = empresa.idEmpresa;
          option.textContent = empresa.nombre_empresa;
          selectEditar.appendChild(option);
        });

      // Empresas activas para inactivar
      selectInactivar.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
      empresas
        .filter(e => e.id_estado === 1)
        .forEach(empresa => {
          const option = document.createElement("option");
          option.value = empresa.idEmpresa;
          option.textContent = empresa.nombre_empresa;
          selectInactivar.appendChild(option);
        });

      // Empresas inactivas para activar
      selectActivar.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
      empresas
        .filter(e => e.id_estado === 2)
        .forEach(empresa => {
          const option = document.createElement("option");
          option.value = empresa.idEmpresa;
          option.textContent = empresa.nombre_empresa;
          selectActivar.appendChild(option);
        });
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      mostrarMensaje("Error", "No se pudieron cargar las empresas.", "error");
    }
  }

  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = inputNombre.value.trim();
    const direccion = inputDireccion.value.trim();
    const telefono = inputTelefono.value.trim();
    const correo = inputCorreo.value.trim();

    if (!nombre || !direccion || !telefono || !correo) {
      mostrarMensaje("Campos incompletos", "Todos los campos son obligatorios.", "warning");
      return;
    }

    if (listaEmpresas.some(e => e.nombre_empresa.toLowerCase() === nombre.toLowerCase())) {
      mostrarMensaje("Nombre duplicado", "Ya existe una empresa con ese nombre.", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_empresa: nombre,
          direccion_empresa: direccion,
          telefono_empresa: telefono,
          correo_empresa: correo,
        }),
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("¡Éxito!", "Empresa registrada correctamente.", "success");
      formRegistrar.reset();
      await cargarEmpresas();
    } catch (error) {
      mostrarMensaje("Error", "Error al registrar la empresa.", "error");
    }
  });

  selectEditar.addEventListener("change", () => {
    const id = selectEditar.value;
    const empresa = listaEmpresas.find(e => e.idEmpresa == id);

    if (empresa) {
      inputNuevoNombre.value = empresa.nombre_empresa;
      inputNuevaDireccion.value = empresa.direccion_empresa;
      inputNuevoTelefono.value = empresa.telefono_empresa;
      inputNuevoCorreo.value = empresa.correo_empresa;
    } else {
      inputNuevoNombre.value = "";
      inputNuevaDireccion.value = "";
      inputNuevoTelefono.value = "";
      inputNuevoCorreo.value = "";
    }
  });

  btnEditar.addEventListener("click", async () => {
    const id = selectEditar.value;
    if (!id) {
      mostrarMensaje("Seleccione empresa", "Seleccione una empresa a editar.", "warning");
      return;
    }

    const nuevo = {
      nombre_empresa: inputNuevoNombre.value.trim(),
      direccion_empresa: inputNuevaDireccion.value.trim(),
      telefono_empresa: inputNuevoTelefono.value.trim(),
      correo_empresa: inputNuevoCorreo.value.trim(),
    };

    if (!nuevo.nombre_empresa || !nuevo.direccion_empresa || !nuevo.telefono_empresa || !nuevo.correo_empresa) {
      mostrarMensaje("Campos incompletos", "Todos los campos de edición son obligatorios.", "warning");
      return;
    }

    // Validar nombre duplicado (excepto la misma empresa)
    if (
      listaEmpresas.some(e =>
        e.nombre_empresa.toLowerCase() === nuevo.nombre_empresa.toLowerCase() &&
        e.idEmpresa != id
      )
    ) {
      mostrarMensaje("Nombre duplicado", "Ya existe otra empresa con ese nombre.", "warning");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("¡Éxito!", "Empresa actualizada correctamente.", "success");
      await cargarEmpresas();

      selectEditar.value = "";
      inputNuevoNombre.value = "";
      inputNuevaDireccion.value = "";
      inputNuevoTelefono.value = "";
      inputNuevoCorreo.value = "";

    } catch (error) {
      mostrarMensaje("Error", "Error al actualizar la empresa.", "error");
    }
  });

  btnInactivar.addEventListener("click", async () => {
    const id = selectInactivar.value;
    if (!id) {
      mostrarMensaje("Seleccione empresa", "Seleccione una empresa a inactivar.", "warning");
      return;
    }

    // Validar relaciones antes de inactivar
    try {
      const resCheck = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}/tieneRelaciones`);
      if (!resCheck.ok) throw new Error("No se pudo validar relaciones");
      const dataCheck = await resCheck.json();

      if (dataCheck.tieneRelaciones) {
        mostrarMensaje("No permitido", "La empresa tiene relaciones y no se puede inactivar.", "error");
        return;
      }
    } catch {
      mostrarMensaje("Error", "No se pudo validar la empresa.", "error");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción inactivará la empresa seleccionada.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}/inactivar`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al inactivar la empresa.");
      }

      mostrarMensaje("¡Éxito!", "Empresa inactivada correctamente.", "success");
      await cargarEmpresas();

      selectInactivar.value = "";
    } catch (error) {
      mostrarMensaje("Error", error.message, "error");
    }
  });

  btnActivar.addEventListener("click", async () => {
    const id = selectActivar.value;
    if (!id) {
      mostrarMensaje("Seleccione empresa", "Seleccione una empresa a activar.", "warning");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}/reactivar`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al activar la empresa.");
      }

      mostrarMensaje("¡Éxito!", "Empresa activada correctamente.", "success");
      await cargarEmpresas();

      selectActivar.value = "";
    } catch (error) {
      mostrarMensaje("Error", error.message, "error");
    }
  });

  cargarEmpresas();
});
