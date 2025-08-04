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
      alert("Inicio de sesión exitoso");

      // Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirección según el rol
      const nombreRol = usuario.rol?.nombre_rol || usuario.rol; // asegura compatibilidad

      if (nombreRol === "Administrador") {
        window.location.href = "../html/AdminCatalogo.html";
      } else if (nombreRol === "Usuario") {
        window.location.href = "../html/catalogo.html";
      } else {
        alert("Rol no reconocido");
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
