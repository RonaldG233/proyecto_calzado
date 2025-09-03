// Importar HTML como strings (gracias a Vite + ?raw)
import Home from "../views/home/index.html?raw";
import Login from "../views/login/index.html?raw";
import Registro from "../views/registro/index.html?raw";
import Usuarios from "../views/administrador/usuarios/index.html?raw";
import Ciudades from "../views/administrador/ciudades/index.html?raw";
import Tallas from "../views/administrador/tallas/index.html?raw";
import Empresas from "../views/administrador/empresas/index.html?raw";
import Imagenes from "../views/administrador/imagenes/index.html?raw";
import Pagos from "../views/administrador/pagos/index.html?raw";
import Productos from "../views/administrador/productos/index.html?raw";

// Importar controladores
import { homeController } from "../views/home/homeController.js";
import { loginController } from "../views/login/loginController.js";
import { registroController } from "../views/registro/registroController.js";
import { usuarioController } from "../views/administrador/usuarios/usuarioController.js";
import { ciudadController } from "../views/administrador/ciudades/ciudadController.js";
import { tallaController } from "../views/administrador/tallas/tallaController.js";
import { empresaController } from "../views/administrador/empresas/empresaController.js";
import {imagenController} from "../views/administrador/imagenes/imagenController.js";
import { pagoController } from "../views/administrador/pagos/pagoController.js";
import { productoController } from "../views/administrador/productos/productoController.js";

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
  },
  ciudades: {
    path: "administrador/ciudades/index.html",
    html: Ciudades,
    controlador: ciudadController,
    private: true 
  },
  tallas: {
    path: "administrador/tallas/index.html",
    html: Tallas,
    controlador: tallaController,
    private: true
  },
  empresas: {
    path: "administrador/empresas/index.html",
    html: Empresas,
    controlador: empresaController,
    private: true
  },
  imagenes:{
    path: "administrador/imagenes/index.html",
    html: Imagenes,
    controlador: imagenController,
    private: true
  },
  pagos:{
    path: "administrador/pagos/index.html",
    html: Pagos,
    controlador: pagoController,
    private: true
  },
  productos: {
    path: "administrador/productos/index.html",
    html: Productos,
    controlador: productoController,
    private: true
  }
};
