import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarEmpresa");
  const formEditar = document.getElementById("formEditarEmpresa");
  const formEliminar = document.getElementById("formEliminarEmpresa");

  const inputNombre = document.getElementById("nombreEmpresa");
  const inputDireccion = document.getElementById("direccionEmpresa");
  const inputTelefono = document.getElementById("telefonoEmpresa");
  const inputCorreo = document.getElementById("correoEmpresa");

  const selectEditar = document.getElementById("empresaEditar");
  const selectEliminar = document.getElementById("empresaEliminar");

  const btnEditar = document.getElementById("btnEditarEmpresa");
  const btnEliminar = document.getElementById("btnEliminarEmpresa");

  const mensaje = document.getElementById("mensajeEmpresa");

  const inputNuevoNombre = document.getElementById("nuevoNombreEmpresa");
  const inputNuevaDireccion = document.getElementById("nuevaDireccionEmpresa");
  const inputNuevoTelefono = document.getElementById("nuevoTelefonoEmpresa");
  const inputNuevoCorreo = document.getElementById("nuevoCorreoEmpresa");

  const infoEliminar = document.createElement("div");
  infoEliminar.style.marginTop = "1rem";
  infoEliminar.style.fontSize = "0.9rem";
  formEliminar.appendChild(infoEliminar);

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

      [selectEditar, selectEliminar].forEach((select) => {
        select.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
        empresas.forEach((empresa) => {
          const option = document.createElement("option");
          option.value = empresa.idEmpresa;
          option.textContent = empresa.nombre_empresa;
          select.appendChild(option);
        });
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

    // Validar nombre duplicado al registrar
    const nombreExiste = listaEmpresas.some(e => e.nombre_empresa.toLowerCase() === nombre.toLowerCase());
    if (nombreExiste) {
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
      cargarEmpresas();
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

    // Validar nombre duplicado al editar (excepto la misma empresa)
    const nombreExisteEdit = listaEmpresas.some(e =>
      e.nombre_empresa.toLowerCase() === nuevo.nombre_empresa.toLowerCase() &&
      e.idEmpresa != id
    );
    if (nombreExisteEdit) {
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
      cargarEmpresas();

      // Limpiar campos y selects
      selectEditar.value = "";
      inputNuevoNombre.value = "";
      inputNuevaDireccion.value = "";
      inputNuevoTelefono.value = "";
      inputNuevoCorreo.value = "";

    } catch (error) {
      mostrarMensaje("Error", "Error al actualizar la empresa.", "error");
    }
  });

  selectEliminar.addEventListener("change", () => {
    const id = selectEliminar.value;
    const empresa = listaEmpresas.find(e => e.idEmpresa == id);

    if (empresa) {
      infoEliminar.innerHTML = `
        <strong>Nombre:</strong> ${empresa.nombre_empresa}<br>
        <strong>Dirección:</strong> ${empresa.direccion_empresa}<br>
        <strong>Teléfono:</strong> ${empresa.telefono_empresa}<br>
        <strong>Correo:</strong> ${empresa.correo_empresa}
      `;
    } else {
      infoEliminar.innerHTML = "";
    }
  });

  btnEliminar.addEventListener("click", async () => {
    const id = selectEliminar.value;
    if (!id) {
      mostrarMensaje("Seleccione empresa", "Seleccione una empresa a eliminar.", "warning");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la empresa seleccionada.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("¡Éxito!", "Empresa eliminada correctamente.", "success");
      infoEliminar.innerHTML = "";
      cargarEmpresas();

      // Limpiar selects
      selectEliminar.value = "";

    } catch (error) {
      mostrarMensaje("Error", "Error al eliminar la empresa.", "error");
    }
  });

  cargarEmpresas();
});
