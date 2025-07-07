import { registrarUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".boton_registrarse");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const form = document.getElementById("formRegistro");

    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();
    const confirmaContrasena = form.confirmaContrasena.value.trim();
    const codCiudad = parseInt(form.ciudad.value);
    const idRol = parseInt(form.rol.value);

    if (!nombre || !telefono || !correo || !contrasena || !confirmaContrasena || isNaN(codCiudad) || isNaN(idRol)) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (contrasena !== confirmaContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const nuevoUsuario = {
      nombre,
      telefono,
      correo,
      contrasena,
      codCiudad,
      idRol
    };

    try {
      await registrarUsuario(nuevoUsuario);
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "./pagina_inicioSesion_usuario.html";
    } catch (error) {
      alert("No se pudo completar el registro.");
    }
  });
});
// archivo: registro.js
async function cargarCiudades() {
  const ciudadSelect = document.getElementById("ciudad");

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
    if (!response.ok) throw new Error("Error al obtener ciudades");

    const ciudades = await response.json();

    ciudades.forEach(ciudad => {
      const option = document.createElement("option");
      option.value = ciudad.codCiudad;
      option.textContent = ciudad.nombre_ciudad;
      ciudadSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar ciudades:", error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  cargarCiudades();

  // Aquí puedes conectar también la lógica para registrar el usuario
});


