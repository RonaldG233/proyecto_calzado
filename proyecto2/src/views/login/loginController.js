import { postSinToken } from "../../helpers/api.js";
import { success, error, info } from "../../helpers/alertas.js";

export const loginController = () => {
  const formulario = document.getElementById("formLogin");
  if (!formulario) return console.error("No se encontró el formulario de login.");

  const correoInput = formulario.querySelector("#correo");
  const contrasenaInput = formulario.querySelector("#contrasena");
  const btnLogin = document.querySelector(".boton_registrarse");
  if (!btnLogin) return console.error("No se encontró el botón de login.");

  const limpiarSiValido = (input) => {
    if (input.value.trim() !== "") input.classList.remove("error");
  };

  correoInput.addEventListener("blur", () => limpiarSiValido(correoInput));
  correoInput.addEventListener("keydown", () => limpiarSiValido(correoInput));
  contrasenaInput.addEventListener("blur", () => limpiarSiValido(contrasenaInput));
  contrasenaInput.addEventListener("keydown", () => limpiarSiValido(contrasenaInput));

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value.trim();

    if (!correo || !contrasena) {
      return info("Todos los campos son obligatorios.", "Campos requeridos");
    }

    try {
      const { status, data } = await postSinToken("usuarios/login", { correo, contrasena });

      // ---------------- Manejo de errores ----------------
      if (status === 403) {
        return info(data.error || "Usuario inactivo. Contacta al administrador.", "Usuario inactivo");
      }

      if (status !== 200) {
        return error(data.error || "Error en el login.");
      }

      // Validar que el usuario esté activo (redundante, pero seguro)
      if (data.usuario.estado && data.usuario.estado.toLowerCase() !== "activo") {
        return info("Tu cuenta está inactiva. Contacta al administrador.", "Usuario inactivo");
      }

      // Guardar tokens y usuario completo
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      await success("Inicio de sesión exitoso.");

      // ================= MANEJO DE ROL =================
      let rolNombre = null;
      if (typeof data.usuario.rol === "string") {
        rolNombre = data.usuario.rol.toLowerCase();
      } else if (typeof data.usuario.rol === "object" && data.usuario.rol.nombre) {
        rolNombre = data.usuario.rol.nombre.toLowerCase();
      }

      if (!rolNombre) {
        info("No se encontró el rol del usuario.", "Aviso");
        return;
      }

      // Redirección según rol
      if (rolNombre === "administrador") {
        window.location.hash = "#usuarios";
      } else if (rolNombre === "usuario") {
        window.location.hash = "#catalogo";
      } else {
        info(`Rol no reconocido: ${rolNombre}`, "Aviso");
      }

    } catch (err) {
      console.error("Error en login:", err);
      error("Ocurrió un error al iniciar sesión. Intenta nuevamente.");
    }
  });

  formulario.addEventListener("submit", (e) => e.preventDefault());
};
