/**
 * Muestra un cuadro de confirmación usando SweetAlert2.
 * @param {string} mensaje - Acción que se confirma (ej: "eliminar usuario").
 * @param {string} texto - Texto adicional (opcional).
 * @returns {Promise} Promesa que resuelve con la respuesta del usuario.
 */
export const confirmar = (mensaje, texto = "") => {
  return Swal.fire({
    title: `¿Está seguro de ${mensaje}?`,
    text: texto,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#4DD42E",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    allowOutsideClick: false, // evita cerrar clickeando fuera
    allowEscapeKey: false // evita cerrar con tecla ESC
  });
};

/**
 * Muestra un mensaje de éxito.
 * @param {string} mensaje - Mensaje a mostrar.
 * @returns {Promise}
 */
export const success = (mensaje) => {
  return Swal.fire({
    title: "¡Éxito!",
    text: mensaje,
    icon: "success",
    confirmButtonColor: "#4DD42E",
    timer: 2500,
    timerProgressBar: true
  });
};

/**
 * Muestra un mensaje de error.
 * @param {string} mensaje - Mensaje a mostrar.
 * @returns {Promise}
 */
export const error = (mensaje) => {
  return Swal.fire({
    title: "Error",
    text: mensaje,
    icon: "error",
    confirmButtonColor: "#d33",
    timer: 3000,
    timerProgressBar: true
  });
};

/**
 * Muestra un mensaje informativo.
 * @param {string} mensaje - Mensaje a mostrar.
 * @param {string} titulo - Título opcional.
 * @returns {Promise}
 */
export const info = (mensaje, titulo = "Información") => {
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "info",
    confirmButtonColor: "#3085d6"
  });
};
