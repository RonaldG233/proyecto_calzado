/**
 * Cuenta la cantidad de campos de un formulario y cuáles están completos.
 * Además, lanza un mensaje de error si hay campos vacíos.
 * 
 * @param {HTMLFormElement} formulario - Formulario a analizar.
 * @returns {Object} - Objeto con total, completos, vacíos.
 */
import { error } from "../helpers/alertas.js";

export const contarCamposFormulario = (formulario) => {
  if (!formulario) {
    console.error("No se recibió un formulario válido en contarCamposFormulario");
    return { total: 0, completos: 0, vacíos: 0 };
  }

  // Selecciona todos los inputs, selects y textareas
  const campos = formulario.querySelectorAll("input, select, textarea");

  let completos = 0;
  let vacíos = 0;

  campos.forEach((campo) => {
    if (campo.type !== "button" && campo.type !== "submit" && campo.type !== "reset") {
      if (campo.value.trim() !== "") {
        completos++;
      } else {
        vacíos++;
      }
    }
  });

  // Si hay vacíos, mostramos alerta
  if (vacíos > 0) {
    error(`Hay ${vacíos} campos vacíos. Por favor completa todos los campos.`);
  }

  return {
    total: campos.length,
    completos,
    vacíos
  };
};
