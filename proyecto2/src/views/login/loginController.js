// import { loginUsuario } from './api.js';

export const loginController = () => {
  const formulario = document.getElementById("formLogin");

  // Si no encuentra el formulario, no sigue ejecutando
  if (!formulario) {
    console.error("No se encontró el formulario de login en el DOM");
    return;
  }

  // Selección de campos dentro del formulario
  const correoInput = formulario.querySelector("#correo");
  const contrasenaInput = formulario.querySelector("#contrasena");
  const btnLogin = formulario.querySelector(".boton_registrarse"); // botón del login

  // Validaciones en tiempo real
  correoInput.addEventListener('blur', (e) => {
    if (validarCorreo(e.target)) limpiar(e.target);
  });
  correoInput.addEventListener('keydown', (e) => {
    if (validarCorreo(e.target)) limpiar(e.target);
  });
  contrasenaInput.addEventListener('blur', (e) => {
    if (validarMinimo(e.target)) limpiar(e.target);
  });
  contrasenaInput.addEventListener('keydown', (e) => {
    if (validarMinimo(e.target)) limpiar(e.target);
  });

  // Manejo del login
  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value.trim();

    if (!correo || !contrasena) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'Entendido'
      });
    }

    try {
      // Aquí deberías llamar tu API
      const usuario = await loginUsuario(correo, contrasena);

      if (usuario.estado?.toLowerCase() === "inactivo") {
        return Swal.fire({
          icon: 'error',
          title: 'Usuario inactivo',
          text: 'Tu cuenta está inactiva. Contacta con el administrador.',
          confirmButtonText: 'Aceptar'
        });
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso.',
        confirmButtonText: 'Continuar'
      });

      // Guardar usuario en sesión local
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirigir según rol
      const nombreRol = usuario.rol?.nombre_rol || usuario.rol;
      if (nombreRol === "Administrador") {
        window.location.href = "../html/AdminCatalogo.html";
      } else if (nombreRol === "Usuario") {
        window.location.href = "../html/catalogo.html";
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Rol no reconocido',
          text: `El rol recibido es: ${nombreRol}`,
          confirmButtonText: 'Aceptar'
        });
        console.warn("Rol recibido:", nombreRol);
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Correo o contraseña incorrectos.',
        confirmButtonText: 'Intentar de nuevo'
      });
      console.error("Error en el login:", error);
    }
  });

  // Prevenir envío normal del form
  formulario.addEventListener('submit', (e) => e.preventDefault());
};
