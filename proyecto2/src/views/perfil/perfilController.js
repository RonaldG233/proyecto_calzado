import { success, error, info, confirmar } from "../../helpers/alertas.js";
import { obtenerCiudades, actualizarUsuario } from "../../helpers/api.js";

export const perfilController = () => {
  const form = document.getElementById("formPerfilUsuario");
  if (!form) return console.error("❌ No se encontró el formulario.");

  const idUsuarioInput = form.querySelector("#idUsuario");
  const nombreInput = form.querySelector("#nombre");
  const correoInput = form.querySelector("#correo");
  const telefonoInput = form.querySelector("#telefono");
  const ciudadSelect = form.querySelector("#ciudad");
  const rolInput = form.querySelector("#rol"); // Solo visual, no editable

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return error("No se encontró usuario logueado.");

  // Rellenar formulario
  idUsuarioInput.value = usuario.idUsuario || "";
  nombreInput.value = usuario.nombre || "";
  correoInput.value = usuario.correo || "";
  telefonoInput.value = usuario.telefono || "";
  rolInput.value = usuario.rol?.nombre || "Sin rol"; // 👈 corregido

  // Función para limpiar select
  const limpiarSelect = (select) => { 
    select.innerHTML = "";
    const placeholder = new Option("-- Seleccione una ciudad --", "");
    placeholder.disabled = true;
    placeholder.selected = true;
    select.add(placeholder);
  };

  // Cargar ciudades y preseleccionar la del usuario
  const cargarCiudades = async () => {
    try {
      const ciudades = await obtenerCiudades();
      limpiarSelect(ciudadSelect);

      ciudades.forEach(c => {
        const option = new Option(c.nombre_ciudad, c.codCiudad);
        if (usuario.codCiudad && parseInt(usuario.codCiudad) === parseInt(c.codCiudad)) {
          option.selected = true;
        }
        ciudadSelect.add(option);
      });
    } catch (err) {
      console.error(err);
      error("No se pudieron cargar las ciudades.");
    }
  };

  cargarCiudades();

  // Validaciones
  const validarCampos = () => {
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const codCiudad = ciudadSelect.value;

    if (!nombre || !correo || !telefono || !codCiudad) {
      info("Todos los campos son obligatorios.");
      return false;
    }

    if (nombre.length > 50) {
      info("El nombre no puede exceder los 50 caracteres.");
      return false;
    }

    const correoRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correo) || correo.length > 70) {
      info("Correo inválido o muy largo (máx. 70 caracteres).");
      return false;
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
      info("El teléfono debe tener exactamente 10 dígitos.");
      return false;
    }

    return true;
  };

  // Manejar submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const codCiudad = parseInt(ciudadSelect.value);

    try {
      const confirmResp = await confirmar("actualizar tu perfil");
      if (!confirmResp.isConfirmed) return;

      const usuarioActualizado = {
        idUsuario: usuario.idUsuario,
        nombre,
        correo,
        telefono,
        codCiudad,
        idRol: usuario.idRol
      };

      // Llamada al backend usando la nueva api.js
      const data = await actualizarUsuario(usuarioActualizado);

      // Guardar datos actualizados en localStorage
      localStorage.setItem("usuario", JSON.stringify({
        ...usuario,
        nombre: data.nombre || nombre,
        correo: data.correo || correo,
        telefono: data.telefono || telefono,
        codCiudad: data.codCiudad || codCiudad,
        ciudad: data.ciudad || ciudadSelect.options[ciudadSelect.selectedIndex].text,
        rol: usuario.rol // 👈 mantener objeto rol consistente
      }));

      await success("Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      error(err.message || "No se pudo actualizar el perfil.");
    }
  });
  // Botón "Volver"
const btnVolver = document.getElementById("btnVolver");
if (btnVolver) {
  btnVolver.addEventListener("click", () => {
    history.back(); // Regresa a la página anterior
  });
}
// Botón "Cerrar Sesión"
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", async () => {
    const confirmResp = await confirmar("cerrar sesión");
    if (!confirmResp.isConfirmed) return;

    // Limpiar localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Redirigir a la página principal (ajusta la URL según tu proyecto)
    window.location.href = "#home"; 
  });
}


};
