// import { registrarUsuario } from "./api.js";

// Controlador de registro
export const registroController = () => {
  const formulario = document.getElementById("formRegistro");

  if (!formulario) {
    console.error("No se encontró el formulario de registro en el DOM");
    return;
  }

  // Selección segura de inputs
  const nombreInput = formulario.querySelector("#nombre");
  const telefonoInput = formulario.querySelector("#telefono");
  const correoInput = formulario.querySelector("#correo");
  const contrasenaInput = formulario.querySelector("#contrasena");
  const confirmaContrasenaInput = formulario.querySelector("#confirmaContrasena");
  const ciudadSelect = formulario.querySelector("#ciudad");
  const rolSelect = formulario.querySelector("#rol");
  const btnRegistrar = formulario.querySelector(".boton_registrarse");

  if (!btnRegistrar) {
    console.error("No se encontró el botón de registro en el DOM");
    return;
  }

  // Cargar ciudades y roles al iniciar
  cargarCiudades();
  cargarRoles();

  btnRegistrar.addEventListener("click", async (e) => {
    e.preventDefault();

    // Validación básica
    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value.trim();
    const confirmaContrasena = confirmaContrasenaInput.value.trim();
    const codCiudad = parseInt(ciudadSelect.value);
    const idRol = parseInt(rolSelect.value);

    if (!nombre || !telefono || !correo || !contrasena || !confirmaContrasena || isNaN(codCiudad) || isNaN(idRol)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'Entendido'
      });
    }

    if (contrasena !== confirmaContrasena) {
      return Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Verifica que ambas contraseñas sean iguales.',
        confirmButtonText: 'Reintentar'
      });
    }

    // Construir objeto usuario
    const usuario = {
      nombre,
      telefono: Number(telefono),
      correo,
      contrasena,
      codCiudad,
      idRol,
      id_estado: 1
    };

    try {
      await registrarUsuario(usuario);

      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Ahora puedes iniciar sesión.',
        confirmButtonText: 'Iniciar sesión'
      });

      formulario.reset();
      window.location.hash = "login";

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'No se pudo completar el registro. Intenta nuevamente.',
        confirmButtonText: 'Entendido'
      });
      console.error("Error al registrar usuario:", error);
    }
  });
};

// Función para cargar ciudades desde la API
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

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar ciudades',
      text: 'No se pudieron cargar las opciones de ciudad.',
      confirmButtonText: 'Cerrar'
    });
    console.error("Error al cargar ciudades:", error);
  }
}

// Función para cargar roles
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
