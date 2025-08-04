import { obtenerCiudades, actualizarUsuario } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;

  // Mostrar datos
  document.getElementById("nombre").textContent = usuario.nombre;
  document.getElementById("correo").textContent = usuario.correo;
  document.getElementById("telefono").textContent = usuario.telefono;
  document.getElementById("rol").textContent = usuario.rol?.nombre_rol || "No disponible";

  // Cargar ciudad
  try {
    const ciudades = await obtenerCiudades();
    const ciudadUsuario = ciudades.find(c => c.codCiudad === usuario.codCiudad);
    document.getElementById("ciudad").textContent = ciudadUsuario?.nombre_ciudad || "No disponible";

    // Rellenar select del modal
    const select = document.getElementById("editCiudad");
    ciudades.forEach(c => {
      const option = document.createElement("option");
      option.value = c.codCiudad;
      option.textContent = c.nombre_ciudad;
      if (c.codCiudad === usuario.codCiudad) option.selected = true;
      select.appendChild(option);
    });
  } catch (err) {
    document.getElementById("ciudad").textContent = "No disponible";
  }

  // Botón editar
  document.getElementById("btnEditarPerfil").addEventListener("click", () => {
    document.getElementById("editNombre").value = usuario.nombre;
    document.getElementById("editTelefono").value = usuario.telefono;
    document.getElementById("editContrasena").value = usuario.contrasena;
    document.getElementById("modalEditar").style.display = "flex";
  });

  // Cancelar edición
  document.getElementById("cancelarEdicion").addEventListener("click", () => {
    document.getElementById("modalEditar").style.display = "none";
  });

  // Guardar edición
  document.getElementById("formEditarPerfil").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("editNombre").value.trim();
    const telefono = document.getElementById("editTelefono").value.trim();
    const codCiudad = parseInt(document.getElementById("editCiudad").value);
    const contrasena = document.getElementById("editContrasena").value;

    const actualizado = {
      ...usuario,
      nombre,
      telefono,
      codCiudad,
      contrasena
    };

    try {
      const nuevoUsuario = await actualizarUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
      Swal.fire("Éxito", "Datos actualizados correctamente", "success").then(() => {
        location.reload();
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el perfil", "error");
    }
  });

  // NUEVO: Botón cerrar sesión
  document.getElementById("btnCerrarSesion").addEventListener("click", () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem("usuario");
        // Si usas sessionStorage u otra cosa, también bórrala aquí
        window.location.href = "../html/pagina_inicioSesion_usuario.html"; // Cambia por la página de login o inicio
      }
    });
  });
});
