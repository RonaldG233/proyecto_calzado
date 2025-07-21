const formulario = document.getElementById('formularioImagen');
const respuesta = document.getElementById('respuesta');

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombreImagen = document.getElementById('nombreImagen').value.trim();
  const archivo = document.getElementById('archivo').files[0];

  // Validación nombre
  if (!nombreImagen) {
    respuesta.textContent = 'El nombre de la imagen es obligatorio.';
    respuesta.style.color = 'red';
    return;
  }
  if (nombreImagen.length > 50) {
    respuesta.textContent = 'El nombre debe tener máximo 50 caracteres.';
    respuesta.style.color = 'red';
    return;
  }

  // Validación archivo
  if (!archivo) {
    respuesta.textContent = 'Por favor selecciona un archivo.';
    respuesta.style.color = 'red';
    return;
  }
  if (!archivo.type.startsWith('image/')) {
    respuesta.textContent = 'Solo se permiten archivos de imagen.';
    respuesta.style.color = 'red';
    return;
  }
  if (archivo.size > 5 * 1024 * 1024) { // 5MB límite ejemplo
    respuesta.textContent = 'El archivo es demasiado grande (máx 5MB).';
    respuesta.style.color = 'red';
    return;
  }

  // Si pasa las validaciones, preparar FormData
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
      respuesta.style.color = 'green';
      respuesta.textContent = texto;
      formulario.reset();
    } else {
      respuesta.style.color = 'red';
      respuesta.textContent = texto || 'Error al subir la imagen.';
    }
  } catch (error) {
    respuesta.style.color = 'red';
    respuesta.textContent = 'Error de conexión al servidor.';
    console.error(error);
  }
});
