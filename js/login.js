import { loginUsuario } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".boton_registrarse");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const form = document.getElementById("formLogin");

    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();

    if (!correo || !contrasena) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      const usuario = await loginUsuario(correo, contrasena);

      // Aquí validamos el estado (suponiendo que usuario.estado es "Activo" o "Inactivo")
      if (usuario.estado && usuario.estado.toLowerCase() === "inactivo") {
        Swal.fire({
          icon: 'error',
          title: 'Usuario inactivo',
          text: 'Tu cuenta está inactiva. Contacta con el administrador.',
          confirmButtonText: 'Aceptar'
        });
        return; // No seguir con el login
      }

      // Si está activo, continúa con login normal
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso.',
        confirmButtonText: 'Continuar'
      });

      // Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirección según el rol
      const nombreRol = usuario.rol?.nombre_rol || usuario.rol; // asegura compatibilidad

      if (nombreRol === "Administrador") {
        window.location.href = "../html/AdminCatalogo.html";
      } else if (nombreRol === "Usuario") {
        window.location.href = "../html/catalogo.html";
      } else {
        await Swal.fire({
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
});
