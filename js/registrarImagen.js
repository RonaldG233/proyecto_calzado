import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formulario = document.getElementById('formularioImagen');

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreImagen = document.getElementById('nombreImagen').value.trim();
    const archivo = document.getElementById('archivo').files[0];

    // Validaciones
    if (!nombreImagen) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la imagen es obligatorio.'
      });
    }

    if (nombreImagen.length > 50) {
      return Swal.fire({
        icon: 'warning',
        title: 'Nombre muy largo',
        text: 'El nombre debe tener máximo 50 caracteres.'
      });
    }

    if (!archivo) {
      return Swal.fire({
        icon: 'warning',
        title: 'Archivo faltante',
        text: 'Por favor selecciona un archivo.'
      });
    }

    if (!archivo.type.startsWith('image/')) {
      return Swal.fire({
        icon: 'error',
        title: 'Archivo no válido',
        text: 'Solo se permiten archivos de imagen.'
      });
    }

    if (archivo.size > 5 * 1024 * 1024) {
      return Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo es demasiado grande (máx 5MB).'
      });
    }

    // Preparar FormData
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('nombrePersonalizado', nombreImagen);

    try {
      const res = await fetch('http://localhost:8080/proyectoCalzado/api/imagenes/subir', {
        method: 'POST',
        body: formData,
      });

      const texto = await res.text();

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Imagen subida',
          text: texto || 'La imagen se subió correctamente.'
        });
        formulario.reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al subir',
          text: texto || 'No se pudo subir la imagen.'
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.'
      });
    }
  });
});
