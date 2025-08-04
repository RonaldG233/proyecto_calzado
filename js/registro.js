import { registrarUsuario } from "./api.js";

// Cargar ciudades al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarCiudades();

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
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (contrasena !== confirmaContrasena) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Verifica que ambas contraseñas sean iguales.',
        confirmButtonText: 'Reintentar'
      });
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

      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Ahora puedes iniciar sesión.',
        confirmButtonText: 'Iniciar sesión'
      });

      window.location.href = "./pagina_inicioSesion_usuario.html";

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'No se pudo completar el registro. Intenta nuevamente.',
        confirmButtonText: 'Entendido'
      });
    }
  });
});

// Función para cargar ciudades desde la API
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
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar ciudades',
      text: 'No se pudieron cargar las opciones de ciudad.',
      confirmButtonText: 'Cerrar'
    });
    console.error("Error al cargar ciudades:", error);
  }
}
