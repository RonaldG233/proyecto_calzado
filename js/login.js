import { loginUsuario } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".boton_registrarse");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const form = document.getElementById("formLogin");

    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();

    if (!correo || !contrasena) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      const usuario = await loginUsuario(correo, contrasena);
      alert("Inicio de sesión exitoso");
      localStorage.setItem("usuario", JSON.stringify(usuario));
      window.location.href = "../html/catalogo.html"; // O cambia la ruta si está en otra carpeta
    } catch (error) {
      alert("Correo o contraseña incorrectos.");
      console.error("Error en el login:", error);
    }
  });
});


