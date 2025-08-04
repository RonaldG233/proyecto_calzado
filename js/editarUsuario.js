import { obtenerCiudades, obtenerRoles, actualizarUsuario } from "./api.js";
import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  componentes();

  const usuario = JSON.parse(localStorage.getItem("usuarioEditar"));

  const codCiudad = document.getElementById("codCiudad");
  const idRol = document.getElementById("idRol");

  document.getElementById("idUsuario").value = usuario.idUsuario;
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("correo").value = usuario.correo;
  document.getElementById("contrasena").value = usuario.contrasena;
  document.getElementById("telefono").value = usuario.telefono;

  // Cargar ciudades
  const ciudades = await obtenerCiudades();
  ciudades.forEach(c => {
    const option = document.createElement("option");
    option.value = c.codCiudad;
    option.textContent = c.nombre_ciudad;
    if (usuario.codCiudad === c.codCiudad) {
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
    if (usuario.idRol === r.idRol) {
      option.selected = true;
    }
    idRol.appendChild(option);
  });

  // 🚫 Bloquear el cambio de rol si está marcado
  if (usuario.rolBloqueado) {
    idRol.disabled = true;
  }

  // Envío del formulario
  document.getElementById("formEditarUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioActualizado = {
      idUsuario: parseInt(document.getElementById("idUsuario").value),
      nombre: document.getElementById("nombre").value,
      correo: document.getElementById("correo").value,
      contrasena: document.getElementById("contrasena").value,
      telefono: document.getElementById("telefono").value,
      codCiudad: parseInt(document.getElementById("codCiudad").value),
      idRol: parseInt(document.getElementById("idRol").value),
    };

    // Comprobar si hubo cambios
    const sinCambios =
      usuario.nombre === usuarioActualizado.nombre &&
      usuario.correo === usuarioActualizado.correo &&
      usuario.contrasena === usuarioActualizado.contrasena &&
      usuario.telefono === usuarioActualizado.telefono &&
      usuario.codCiudad === usuarioActualizado.codCiudad &&
      usuario.idRol === usuarioActualizado.idRol;

    if (sinCambios) {
      return Swal.fire({
        icon: "warning",
        title: "Sin cambios",
        text: "No has realizado ninguna modificación.",
      });
    }

    try {
      await actualizarUsuario(usuarioActualizado);
      localStorage.removeItem("usuarioEditar");

      await Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los datos han sido guardados correctamente.",
        confirmButtonText: "Aceptar"
      });

      window.location.href = "../html/AdminCatalogo.html";

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "Verifica los datos e intenta nuevamente.",
      });
    }
  });
});

