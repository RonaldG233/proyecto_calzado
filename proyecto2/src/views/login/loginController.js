// loginController.js
import { postSinToken } from "../../helpers/api.js";
import { success, error, info } from "../../helpers/alertas.js";

export const loginController = () => {
  const formulario = document.getElementById("formLogin");
  if (!formulario) return console.error("No se encontró el formulario de login.");

  const correoInput = formulario.querySelector("#correo");
  const contrasenaInput = formulario.querySelector("#contrasena");
  const btnLogin = document.querySelector(".boton_registrarse");
  if (!btnLogin) return console.error("No se encontró el botón de login.");

  // Limpia errores si hay input válido
  const limpiarSiValido = (input) => {
    if (input.value.trim() !== "") input.classList.remove("error");
  };

  correoInput.addEventListener("blur", () => limpiarSiValido(correoInput));
  correoInput.addEventListener("keydown", () => limpiarSiValido(correoInput));
  contrasenaInput.addEventListener("blur", () => limpiarSiValido(contrasenaInput));
  contrasenaInput.addEventListener("keydown", () => limpiarSiValido(contrasenaInput));

  // Click del botón login
  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value.trim();

    if (!correo || !contrasena) {
      return info("Todos los campos son obligatorios.", "Campos requeridos");
    }

    try {
      // Llamada al login de la API
      const { status, data } = await postSinToken("usuarios/login", { correo, contrasena });

      if (status !== 200) {
        return error(data.error || "Error en el login.");
      }

      // Guardar tokens y usuario para autenticación SPA
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      await success("Inicio de sesión exitoso.");

      // Redirección según rol usando hash SPA
      const rol = data.usuario.rol?.toLowerCase();
      if (rol === "administrador") {
        window.location.hash = "#usuarios"; // Admin SPA
      } else if (rol === "usuario") {
        window.location.hash = "#catalogo"; // Usuario SPA
      } else {
        info(`Rol no reconocido: ${rol}`, "Aviso");
      }

    } catch (err) {
      console.error("Error en login:", err);
      error("Ocurrió un error al iniciar sesión. Intenta nuevamente.");
    }
  });

  // Evitar envío del formulario por defecto
  formulario.addEventListener("submit", (e) => e.preventDefault());
};
