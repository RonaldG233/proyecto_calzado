// Importar HTML como strings (gracias a Vite + ?raw)
import Home from "../views/home/index.html?raw";
import Login from "../views/login/index.html?raw";
import Registro from "../views/registro/index.html?raw";

// Importar controladores
import { homeController } from "../views/home/homeController.js";
import { loginController } from "../views/login/loginController.js";
import { registroController } from "../views/registro/registroController.js";

export const routes = {
  home: {
    html: Home,
    controlador: homeController,
    private: false
  },
  login: {
    html: Login,
    controlador: loginController,
    private: false
  },
  registro: {
    html: Registro,
    controlador: registroController,
    private: false
  }
};
