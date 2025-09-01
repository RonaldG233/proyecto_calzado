// Importa funciones de validación
import { 
  validarFormularioRegistro,
  limpiar,
  validarNombre,
  validarTelefono,
  validarCorreo,
  validarContrasena,
  validarConfirmaContrasena,
  validarSeleccion
} from "../../Modules/validaciones.js";

// Importa funciones de alertas
import { success, error } from "../../helpers/alertas.js";

// Importa función para enviar datos al backend sin token
import { postSinToken } from "../../helpers/api.js";

// Importa contador de campos
import { contarCamposFormulario } from "../../Modules/modules.js";

/**
 * Controlador para el registro de usuarios.
 */
export const registroController = () => {
  const formulario = document.getElementById("formRegistro");
  if (!formulario) return console.error("No se encontró el formulario de registro");

  // Botón fuera del formulario
  const btnRegistrar = document.getElementById("btnRegistro");
  if (!btnRegistrar) return console.error("No se encontró el botón de registro");

  // Carga ciudades y roles
  cargarCiudades();
  cargarRoles();

  // Inputs del formulario
  const nombre = formulario.querySelector("#nombre");
  const telefono = formulario.querySelector("#telefono");
  const correo = formulario.querySelector("#correo");
  const contrasena = formulario.querySelector("#contrasena");
  const confirmaContrasena = formulario.querySelector("#confirmaContrasena");
  const ciudad = formulario.querySelector("#ciudad");
  const rol = formulario.querySelector("#rol");

  // Validaciones en tiempo real
  nombre.addEventListener("blur", () => validarNombre(nombre));
  telefono.addEventListener("blur", () => validarTelefono(telefono));
  correo.addEventListener("blur", () => validarCorreo(correo));
  contrasena.addEventListener("blur", () => validarContrasena(contrasena));
  confirmaContrasena.addEventListener("blur", () => validarConfirmaContrasena(confirmaContrasena, contrasena));
  ciudad.addEventListener("change", () => validarSeleccion(ciudad));
  rol.addEventListener("change", () => validarSeleccion(rol));

  // Listener para botón fuera del form
  btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    formulario.requestSubmit(); // dispara el submit del form
  });

  // Envío del formulario
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Revisar campos vacíos
    const { vacíos } = contarCamposFormulario(formulario);
    if (vacíos > 0) return;

    // 2. Validación completa
    const info = validarFormularioRegistro(e);

    // 3. Validar campos requeridos
    const camposRequeridos = ["nombre","telefono","correo","contrasena","confirmaContrasena","codCiudad","idRol"];
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in info));

    if (camposFaltantes.length > 0) {
      return error("Por favor completa todos los campos requeridos correctamente.");
    }

    // 4. Construir objeto usuario
    const usuario = {
      nombre: info.nombre,
      telefono: Number(info.telefono),
      correo: info.correo,
      contrasena: info.contrasena,
      codCiudad: info.codCiudad,
      idRol: info.idRol,
      id_estado: 1
    };

    // 5. Enviar al backend
    try {
      const respuesta = await postSinToken("usuarios", usuario);
      const res = await respuesta.json();

      if (respuesta.ok) {
        await success(res.mensaje || "Registro exitoso");
        formulario.reset();
        window.location.hash = "login";
      } else {
        error(res.error || "Ocurrió un error al registrar el usuario");
      }

    } catch (err) {
      console.error("Error al registrar usuario:", err);
      error("No se pudo completar el registro. Intenta nuevamente.");
    }
  });
};

/**
 * Carga dinámicamente las ciudades desde la API
 */
async function cargarCiudades() {
  const ciudadSelect = document.getElementById("ciudad");
  if (!ciudadSelect) return;

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
    if (!response.ok) throw new Error("Error al obtener ciudades");

    const ciudades = await response.json();
    ciudades.forEach(ciudad => {
      if (ciudad.id_estado === 1) {
        const option = document.createElement("option");
        option.value = ciudad.codCiudad;
        option.textContent = ciudad.nombre_ciudad;
        ciudadSelect.appendChild(option);
      }
    });

  } catch (err) {
    console.error("Error al cargar ciudades:", err);
    error("No se pudieron cargar las opciones de ciudad.");
  }
}

/**
 * Carga los roles en el select
 */
function cargarRoles() {
  const rolSelect = document.getElementById("rol");
  if (!rolSelect) return;

  rolSelect.innerHTML = '<option value="">-- Selecciona un rol --</option>';

  const roles = [
    { idRol: 1, nombre_rol: "Usuario" },
    { idRol: 2, nombre_rol: "Administrador" }
  ];

  roles.forEach(rol => {
    const option = document.createElement("option");
    option.value = rol.idRol;
    option.textContent = rol.nombre_rol;
    if (rol.idRol === 2) {
      option.disabled = true;
      option.textContent += " (No disponible)";
    }
    rolSelect.appendChild(option);
  });
}
