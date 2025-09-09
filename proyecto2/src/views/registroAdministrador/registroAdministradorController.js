import { 
  validarNombre,
  validarTelefono,
  validarCorreo,
  validarContrasena,
  validarConfirmaContrasena,
  validarSeleccion
} from "../../Modules/validaciones.js";

import { success, error } from "../../helpers/alertas.js";
import { postSinToken, obtenerCiudades, obtenerRoles } from "../../helpers/api.js";
import { contarCamposFormulario } from "../../Modules/modules.js";

export const registroAdministradorController = () => {
  const formulario = document.getElementById("formRegistro");
  if (!formulario) return console.error("No se encontró el formulario de registro");

  const btnRegistrar = document.getElementById("btnRegistro");
  if (!btnRegistrar) return console.error("No se encontró el botón de registro");

  // Cargar selects dinámicos
  cargarSelects();

  // Elementos del formulario
  const nombre = formulario.querySelector("#nombre");
  const telefono = formulario.querySelector("#telefono");
  const correo = formulario.querySelector("#correo");
  const contrasena = formulario.querySelector("#contrasena");
  const confirmaContrasena = formulario.querySelector("#confirmaContrasena");
  const ciudad = formulario.querySelector("#ciudad");
  const rol = formulario.querySelector("#rol");

  // Validaciones en blur/change
  nombre.addEventListener("blur", () => validarNombre(nombre));
  telefono.addEventListener("blur", () => validarTelefono(telefono));
  correo.addEventListener("blur", () => validarCorreo(correo));
  contrasena.addEventListener("blur", () => validarContrasena(contrasena));
  confirmaContrasena.addEventListener("blur", () => validarConfirmaContrasena(confirmaContrasena, contrasena));
  ciudad.addEventListener("change", () => validarSeleccion(ciudad));
  rol.addEventListener("change", () => validarSeleccion(rol));

  // Click en botón -> submit
  btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    formulario.requestSubmit();
  });

  // Submit del formulario
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    const { vacíos } = contarCamposFormulario(formulario);
    if (vacíos > 0) return error("Por favor completa todos los campos requeridos.");

    // Validar cada campo individualmente
    if (!validarNombre(nombre) || !validarTelefono(telefono) || !validarCorreo(correo) ||
        !validarContrasena(contrasena) || !validarConfirmaContrasena(confirmaContrasena, contrasena) ||
        !validarSeleccion(ciudad) || !validarSeleccion(rol)) {
      return error("Por favor completa correctamente todos los campos.");
    }

    // Preparar objeto para la API
    const usuario = {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      correo: correo.value.trim(),
      contrasena: contrasena.value.trim(),
    codCiudad: ciudad.value.toString(), // convertir a texto
    idRol: rol.value.toString()    
    };

    try {
      // Llamada a API
      console.log(usuario);
      const { status, data } = await postSinToken("usuarios", usuario);

      if (status >= 200 && status < 300) {
        await success(data?.mensaje || "Usuario registrado correctamente");
        formulario.reset();
        window.location.hash = "#login";
      } else {
        const msg = data?.mensaje || data?.error || "Ocurrió un error al registrar el usuario";
        await error(msg);
      }

    } catch (err) {
      console.error("Error al registrar usuario:", err);
      await error("No se pudo completar el registro. Intenta nuevamente.");
    }
  });
};

// ==================== Funciones auxiliares ====================
async function cargarSelects() {
  const ciudadSelect = document.getElementById("ciudad");
  const rolSelect = document.getElementById("rol");

  // ================= CARGAR CIUDADES =================
  if (ciudadSelect) {
    try {
      const ciudades = await obtenerCiudades();
      ciudadSelect.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';

      ciudades.forEach(c => {
        if (c.id_estado === 1) {
          // value como número
          ciudadSelect.add(new Option(c.nombre_ciudad,(c.codCiudad)));
        }
      });
    } catch (err) {
      console.error("Error cargando ciudades:", err);
      error("No se pudieron cargar las ciudades.");
    }
  }


  if (rolSelect) {
    try {
      const roles = await obtenerRoles();
      
      rolSelect.innerHTML = '<option value="">-- Selecciona un rol --</option>';
      roles.forEach(r => {
        const option = new Option(r.nombre_rol, r.idRol);
        option.value = r.idRol; // convertir a número
        if (r.id_rol === 2) { // deshabilitar admin
          option.disabled = true;
          option.textContent += " (No disponible)";
        }
        rolSelect.add(option);
      });
    } catch (err) {
      console.error("Error cargando roles:", err);
      error("No se pudieron cargar los roles.");
    }
  }
}
