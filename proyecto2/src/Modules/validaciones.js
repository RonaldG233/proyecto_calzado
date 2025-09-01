// validaciones.js

/**
 * Limpia los mensajes de error y estilos de un campo de formulario.
 * @param {HTMLElement} campo - Campo de formulario a limpiar.
 */
export const limpiar = (campo) => {
  if (campo.nextElementSibling) campo.nextElementSibling.remove();
  campo.classList.remove('border--red');
};

/**
 * Valida el nombre del usuario:
 * - Obligatorio
 * - No vacío
 * - Máximo 50 caracteres
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
export const validarNombre = (campo) => {
  const valor = campo.value.trim();
  if (!valor) {
    mostrarError(campo, 'El nombre es obligatorio.');
    return false;
  }
  if (valor.length > 50) {
    mostrarError(campo, 'El nombre no puede exceder 50 caracteres.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Valida el correo electrónico:
 * - Formato válido
 * - Máximo 70 caracteres
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
export const validarCorreo = (campo) => {
  const valor = campo.value.trim();
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!regex.test(valor)) {
    mostrarError(campo, 'Correo inválido.');
    return false;
  }
  if (valor.length > 70) {
    mostrarError(campo, 'El correo no puede exceder 70 caracteres.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Valida el teléfono:
 * - Obligatorio
 * - Solo números, espacios, + o -
 * - Longitud entre 7 y 30
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
export const validarTelefono = (campo) => {
  const valor = campo.value.trim();
  const regex = /^[0-9\-+\s]{7,30}$/;
  if (!valor) {
    mostrarError(campo, 'El teléfono es obligatorio.');
    return false;
  }
  if (!regex.test(valor)) {
    mostrarError(campo, 'Teléfono inválido. Debe tener entre 7 y 30 dígitos, puede incluir +, - o espacios.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Valida la contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una letra minúscula
 * - Al menos una letra mayúscula
 * - Al menos un número
 * - Al menos un caracter especial
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
export const validarContrasena = (campo) => {
  const valor = campo.value;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!regex.test(valor)) {
    mostrarError(campo, 'Contraseña insegura: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Valida que la confirmación de contraseña coincida con la contraseña
 * @param {HTMLElement} campo
 * @param {HTMLElement} contrasenaCampo
 * @returns {boolean}
 */
export const validarConfirmaContrasena = (campo, contrasenaCampo) => {
  if (campo.value !== contrasenaCampo.value) {
    mostrarError(campo, 'Las contraseñas no coinciden.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Valida la selección de ciudad o rol:
 * - Debe seleccionar un valor válido
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
export const validarSeleccion = (campo) => {
  if (!campo.value || campo.value === "") {
    mostrarError(campo, 'Debe seleccionar un elemento.');
    return false;
  }
  limpiar(campo);
  return true;
};

/**
 * Muestra un mensaje de error debajo del campo y aplica borde rojo
 * @param {HTMLElement} campo
 * @param {string} mensaje
 */
const mostrarError = (campo, mensaje) => {
  limpiar(campo);
  const span = document.createElement('span');
  span.textContent = mensaje;
  campo.classList.add('border--red');
  campo.insertAdjacentElement('afterend', span);
};

/**
 * Valida todo el formulario de registro y devuelve un objeto con los valores válidos
 * @param {Event} event
 * @returns {Object} info
 */
export const validarFormularioRegistro = (event) => {
  event.preventDefault();
  const form = event.target;

  const nombre = form.querySelector('#nombre');
  const telefono = form.querySelector('#telefono');
  const correo = form.querySelector('#correo');
  const contrasena = form.querySelector('#contrasena');
  const confirmaContrasena = form.querySelector('#confirmaContrasena');
  const ciudad = form.querySelector('#ciudad');
  const rol = form.querySelector('#rol');

  let info = {};

  if (validarNombre(nombre)) info.nombre = nombre.value.trim();
  if (validarTelefono(telefono)) info.telefono = telefono.value.trim();
  if (validarCorreo(correo)) info.correo = correo.value.trim().toLowerCase();
  if (validarContrasena(contrasena)) info.contrasena = contrasena.value;
  if (validarConfirmaContrasena(confirmaContrasena, contrasena)) info.confirmaContrasena = confirmaContrasena.value;
  if (validarSeleccion(ciudad)) info.codCiudad = parseInt(ciudad.value);
  if (validarSeleccion(rol)) info.idRol = parseInt(rol.value);

  return info;
};
