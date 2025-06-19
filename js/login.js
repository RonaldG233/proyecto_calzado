import { loginUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();

    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const usuario = await loginUsuario(correo, contrasena);
      alert("Inicio de sesión exitoso.");
      localStorage.setItem("usuario", JSON.stringify(usuario));
      window.location.href = "../html/catalogo.html"; // está en la misma carpeta
    } catch (error) {
      alert("Correo o contraseña incorrectos.");
      console.error("Error en el login:", error);
    }
  });
});

