// Importar HTML como strings (gracias a Vite + ?raw)
import Home from "../views/home/index.html?raw";
import Login from "../views/login/index.html?raw";
import Registro from "../views/registro/index.html?raw";
import Usuarios from "../views/administrador/usuarios/index.html?raw";

// Importar controladores
import { homeController } from "../views/home/homeController.js";
import { loginController } from "../views/login/loginController.js";
import { registroController } from "../views/registro/registroController.js";
import { usuarioController } from "../views/administrador/usuarios/usuarioController.js";

/**
 * Objeto de rutas principal.
 * Cada ruta contiene:
 *  - html: contenido de la vista
 *  - controlador: lógica JS asociada
 *  - private: indica si requiere login (por ahora todas son públicas)
 */
export const routes = {
  home: {
    path: "home/index.html",
    html: Home,
    controlador: homeController,
    private: false
  },
  login: {
    path: "login/index.html",
    html: Login,
    controlador: loginController,
    private: false
  },
  registro: {
    path: "registro/index.html",
    html: Registro,
    controlador: registroController,
    private: false
  },
  usuarios: {
    
    path: "administrador/usuarios/index.html",
    html: Usuarios,
    controlador: usuarioController,
    private: true // Requiere login
  }
};
