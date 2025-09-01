/**
 * Muestra un cuadro de confirmación usando SweetAlert2.
 * @param {string} mensaje - Mensaje principal de la confirmación.
 * @param {string} texto - Texto adicional (opcional).
 * @returns {Promise} Promesa que resuelve con la respuesta del usuario.
 */
export const confirmar = (mensaje, texto = "") => {
  return Swal.fire({
    title: `¿Está seguro de ${mensaje}?`, // Título del cuadro
    text: texto, // Texto adicional
    icon: "warning", // Icono de advertencia
    showCancelButton: true, // Muestra botón cancelar
    confirmButtonColor: "#4DD42E", // Color botón confirmar
    cancelButtonColor: "#d33", // Color botón cancelar
    confirmButtonText: "Sí" // Texto botón confirmar
  });
}

/**
 * Muestra un mensaje de éxito usando SweetAlert2.
 * @param {string} mensaje - Mensaje a mostrar.
 * @returns {Promise}
 */
export const success = (mensaje) => {
  return Swal.fire({
    title: mensaje, // Título del mensaje
    icon: "success", // Icono de éxito
    draggable: true // Permite arrastrar el cuadro
  });
}

/**
 * Muestra un mensaje de error usando SweetAlert2.
 * @param {string} mensaje - Mensaje a mostrar.
 * @returns {Promise}
 */
export const error = (mensaje) => {
  return Swal.fire({
    title: mensaje, // Título del mensaje
    icon: "error", // Icono de error
    draggable: true // Permite arrastrar el cuadro
  });
}

/**
 * Muestra un mensaje informativo usando SweetAlert2.
 * @param {string} mensaje - Mensaje a mostrar.
 * @param {string} titulo - Título opcional del mensaje.
 * @returns {Promise}
 */
export const info = (mensaje, titulo = "Información") => {
  return Swal.fire({
    title: titulo, // Título del cuadro
    text: mensaje, // Texto del mensaje
    icon: "info", // Icono de información
    draggable: true // Permite arrastrar el cuadro
  });
}
