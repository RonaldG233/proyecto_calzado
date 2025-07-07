import { obtenerCiudades, obtenerRoles, actualizarUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioEditar"));

  const codCiudad = document.getElementById("codCiudad");
  const idRol = document.getElementById("idRol");

  document.getElementById("idUsuario").value = usuario.idUsuario;
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("correo").value = usuario.correo;
  document.getElementById("telefono").value = usuario.telefono;

  // Cargar ciudades
  const ciudades = await obtenerCiudades();
  ciudades.forEach(c => {
    const option = document.createElement("option");
    option.value = c.codCiudad;
    option.textContent = c.nombre_ciudad;
    if (usuario.ciudad === c.nombre_ciudad) {
      option.selected = true;
    }
    codCiudad.appendChild(option);
  });

  // Cargar roles
  const roles = await obtenerRoles();
  roles.forEach(r => {
    const option = document.createElement("option");
    option.value = r.idRol;
    option.textContent = r.nombre_rol;
    if (usuario.rol === r.nombre_rol) {
      option.selected = true;
    }
    idRol.appendChild(option);
  });

  // 🧠 Manejar el envío del formulario
  document.getElementById("formEditarUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioActualizado = {
      idUsuario: parseInt(document.getElementById("idUsuario").value),
      nombre: document.getElementById("nombre").value,
      correo: document.getElementById("correo").value,
      telefono: document.getElementById("telefono").value,
      codCiudad: parseInt(document.getElementById("codCiudad").value),
      idRol: parseInt(document.getElementById("idRol").value),
    };

    try {
      await actualizarUsuario(usuarioActualizado);
      localStorage.removeItem("usuarioEditar");   
      alert("Usuario actualizado con éxito.");
      window.location.href = "../html/AdminCatalogo.html";
    } catch (error) {
      alert("Error al actualizar el usuario.");
    }
  });
});


