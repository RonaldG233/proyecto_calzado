import { obtenerCiudades, obtenerRoles, actualizarUsuario } from "./api.js";
import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  componentes();

  const usuarioEditar = JSON.parse(localStorage.getItem("usuarioEditar"));
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

  const codCiudad = document.getElementById("codCiudad");
  const idRol = document.getElementById("idRol");
  const inputContrasena = document.getElementById("contrasena");

  document.getElementById("idUsuario").value = usuarioEditar.idUsuario;
  document.getElementById("nombre").value = usuarioEditar.nombre;
  document.getElementById("correo").value = usuarioEditar.correo;
  document.getElementById("contrasena").value = usuarioEditar.contrasena;
  document.getElementById("telefono").value = usuarioEditar.telefono;

  // Cargar ciudades
  const ciudades = await obtenerCiudades();
  ciudades.forEach(c => {
    const option = document.createElement("option");
    option.value = c.codCiudad;
    option.textContent = c.nombre_ciudad;
    if (usuarioEditar.codCiudad === c.codCiudad) {
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
    if (usuarioEditar.idRol === r.idRol) {
      option.selected = true;
    }
    idRol.appendChild(option);
  });

  // Solo permitir cambio de contraseña al usuario logueado sobre sí mismo
  let permitirCambioContrasena = false;
  if (usuarioLogueado && usuarioEditar.idUsuario === usuarioLogueado.idUsuario) {
    permitirCambioContrasena = true;
    inputContrasena.disabled = false;
  } else {
    inputContrasena.disabled = true;
    inputContrasena.title = "No puedes cambiar la contraseña de otro usuario";
  }

  // Bloquear edición del rol si el usuario logueado es administrador y está editando su propio usuario
  if (
    usuarioLogueado &&
    usuarioEditar.idUsuario === usuarioLogueado.idUsuario &&
    usuarioLogueado.idRol === 2
  ) {
    idRol.disabled = true;
    idRol.title = "No puedes cambiar tu rol si eres administrador";
  } else {
    idRol.disabled = false;
  }

  // Envío del formulario
  document.getElementById("formEditarUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioActualizado = {
      idUsuario: parseInt(document.getElementById("idUsuario").value),
      nombre: document.getElementById("nombre").value,
      correo: document.getElementById("correo").value,
      telefono: document.getElementById("telefono").value,
      codCiudad: parseInt(document.getElementById("codCiudad").value),
      idRol: idRol.disabled
        ? usuarioEditar.idRol // si el select está deshabilitado, mantener rol original
        : parseInt(idRol.value),
      contrasena: permitirCambioContrasena
        ? document.getElementById("contrasena").value
        : usuarioEditar.contrasena
    };

    try {
      await actualizarUsuario(usuarioActualizado);

      // Si es el usuario logueado, actualizar también en localStorage
      if (usuarioLogueado && usuarioLogueado.idUsuario === usuarioActualizado.idUsuario) {
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      }

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

