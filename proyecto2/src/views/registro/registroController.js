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

import { success, error } from "../../helpers/alertas.js";
import { postSinToken } from "../../helpers/api.js";
import { contarCamposFormulario } from "../../Modules/modules.js";

export const registroController = () => {
  const formulario = document.getElementById("formRegistro");
  if (!formulario) return console.error("No se encontró el formulario de registro");

  const btnRegistrar = document.getElementById("btnRegistro");
  if (!btnRegistrar) return console.error("No se encontró el botón de registro");

  cargarCiudades();
  cargarRoles();

  const nombre = formulario.querySelector("#nombre");
  const telefono = formulario.querySelector("#telefono");
  const correo = formulario.querySelector("#correo");
  const contrasena = formulario.querySelector("#contrasena");
  const confirmaContrasena = formulario.querySelector("#confirmaContrasena");
  const ciudad = formulario.querySelector("#ciudad");
  const rol = formulario.querySelector("#rol");

  nombre.addEventListener("blur", () => validarNombre(nombre));
  telefono.addEventListener("blur", () => validarTelefono(telefono));
  correo.addEventListener("blur", () => validarCorreo(correo));
  contrasena.addEventListener("blur", () => validarContrasena(contrasena));
  confirmaContrasena.addEventListener("blur", () => validarConfirmaContrasena(confirmaContrasena, contrasena));
  ciudad.addEventListener("change", () => validarSeleccion(ciudad));
  rol.addEventListener("change", () => validarSeleccion(rol));

  btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    formulario.requestSubmit();
  });

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { vacíos } = contarCamposFormulario(formulario);
    if (vacíos > 0) return;

    const info = validarFormularioRegistro(e);
    const camposRequeridos = ["nombre","telefono","correo","contrasena","confirmaContrasena"];
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in info));

    if (!ciudad.value || !rol.value || camposFaltantes.length > 0) {
      return error("Por favor completa todos los campos requeridos correctamente.");
    }

    const usuario = {
      nombre: info.nombre,
      telefono: info.telefono,
      correo: info.correo,
      contrasena: info.contrasena,
      codCiudad: Number(ciudad.value),
      idRol: Number(rol.value),
      id_estado: 1
    };

    try {
      const { status, data } = await postSinToken("usuarios", usuario);

      if (status >= 200 && status < 300) {
        await success(data.mensaje || "Registro exitoso");
        formulario.reset();
        window.location.hash = "login";
      } else {
        await error(data.error || data.mensaje || "Ocurrió un error al registrar el usuario");
      }

    } catch (err) {
      console.error("Error al registrar usuario:", err);
      await error("No se pudo completar el registro. Intenta nuevamente.");
    }
  });
};

async function cargarCiudades() {
  const ciudadSelect = document.getElementById("ciudad");
  if (!ciudadSelect) return;

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
    if (!response.ok) throw new Error("Error al obtener ciudades");

    const ciudades = await response.json();
    ciudadSelect.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';

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
