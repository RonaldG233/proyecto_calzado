// Importar HTML como strings (gracias a Vite + ?raw)
import Home from "../views/home/index.html?raw";
import Login from "../views/login/index.html?raw";
import Registro from "../views/registro/index.html?raw";
import RegistroAdministrador from "../views/registroAdministrador/index.html?raw";
import Usuarios from "../views/administrador/usuarios/index.html?raw";
import Ciudades from "../views/administrador/ciudades/index.html?raw";
import Tallas from "../views/administrador/tallas/index.html?raw";
import Empresas from "../views/administrador/empresas/index.html?raw";
import Imagenes from "../views/administrador/imagenes/index.html?raw";
import Pagos from "../views/administrador/pagos/index.html?raw";
import Productos from "../views/administrador/productos/index.html?raw";
import TablaImagenes  from "../views/administrador/imagenes/tablaImagenes/index.html?raw";
import TablaProductos  from "../views/administrador/productos/tablaProductos/index.html?raw";
import AgregarTalla  from "../views/administrador/productos/agregarTalla/index.html?raw";
import AgregarStock from "../views/administrador/productos/agregarStock/index.html?raw";
import UsuarioEditar  from "../views/administrador/usuarios/usuarioEditar/index.html?raw";
import Catalogo from "../views/usuarios/catalogo/index.html?raw";
import Pedido from "../views/usuarios/pedido/index.html?raw";
import CatalogoTalla from "../views/usuarios/catalogoTalla/index.html?raw";
import CatalogoEmpresa from "../views/usuarios/catalogoEmpresa/index.html?raw";
import Product from "../views/usuarios/producto/index.html?raw";
import Perfil from "../views/perfil/index.html?raw"

// Importar controladores
import { homeController } from "../views/home/homeController.js";
import { loginController } from "../views/login/loginController.js";
import { registroController } from "../views/registro/registroController.js";
import { registroAdministradorController } from "../views/registroAdministrador/registroAdministradorController.js";
import { usuarioController } from "../views/administrador/usuarios/usuarioController.js";
import { ciudadController } from "../views/administrador/ciudades/ciudadController.js";
import { tallaController } from "../views/administrador/tallas/tallaController.js";
import { empresaController } from "../views/administrador/empresas/empresaController.js";
import {imagenController} from "../views/administrador/imagenes/imagenController.js";
import { pagoController } from "../views/administrador/pagos/pagoController.js";
import { productoController } from "../views/administrador/productos/productoController.js";
import { tablaImagenesController } from "../views/administrador/imagenes/tablaImagenes/tablaImagenesController.js";
import { tablaProductosController } from "../views/administrador/productos/tablaProductos/tablaProductosController.js";
import { agregarTallaController } from "../views/administrador/productos/agregarTalla/agregarTallaController.js";
import { agregarStockController } from "../views/administrador/productos/agregarStock/agregarStockController.js";
import { usuarioEditarController } from "../views/administrador/usuarios/usuarioEditar/usuarioEditarController.js";
import {catalogoController} from "../views/usuarios/catalogo/catalogoController.js";
import {pedidoController} from "../views/usuarios/pedido/pedidoController.js";
import {catalogoTallaController} from "../views/usuarios/catalogoTalla/catalogoTallaController.js";
import {catalogoEmpresaController} from "../views/usuarios/catalogoEmpresa/catalogoEmpresaController.js";
import {productController} from "../views/usuarios/producto/productController.js";
import {perfilController} from "../views/perfil/perfilController.js"


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
  registroAdministrador: {
    path: "registroAdministrador/index.html",
    html: RegistroAdministrador,
    controlador: registroAdministradorController,
    private: false
  },
  usuarios: {
    
    path: "administrador/usuarios/index.html",
    html: Usuarios,
    controlador: usuarioController,
    private: true,
    permisos: ["GESTION_USUARIOS"],
    subroutes: {
      usuarioEditar: {
        path: "administrador/usuarios/usuarioEditar/index.html",
        html: UsuarioEditar,
        controlador: usuarioEditarController,
        private: true
      }
    }
  },
  ciudades: {
    path: "administrador/ciudades/index.html",
    html: Ciudades,
    controlador: ciudadController,
    private: true,
    permisos: ["GESTION_CIUDADES"] 
  },
  tallas: {
    path: "administrador/tallas/index.html",
    html: Tallas,
    controlador: tallaController,
    private: true,
    permisos: ["GESTION_TALLAS"]
  },
  empresas: {
    path: "administrador/empresas/index.html",
    html: Empresas,
    controlador: empresaController,
    private: true,
    permisos: ["GESTION_EMPRESAS"]
  },
  imagenes: {
    path: "administrador/imagenes/index.html",
    html: Imagenes,
    controlador: imagenController,
    private: true,
    permisos: ["GESTION_IMAGENES"],
    subroutes: {
      tablaImagenes: {
        path: "administrador/imagenes/tablaImagenes/index.html",
        html: TablaImagenes,
        controlador: tablaImagenesController,
        private: true,
        permisos: ["TABLA_IMAGENES"]
      }
    }
  },

  pagos:{
    path: "administrador/pagos/index.html",
    html: Pagos,
    controlador: pagoController,
    private: true,
    permisos: ["GESTION_PAGOS"]
  },
  productos: {
    path: "administrador/productos/index.html",
    html: Productos,
    controlador: productoController,
    private: true,
    permisos: ["CREAR_PRODUCTOS"],
    subroutes: {
      tablaProductos: {
        path: "administrador/productos/tablaProdutos/index.html",
        html: TablaProductos,
        controlador: tablaProductosController,
        private: true,
        permisos: ["TABLA_PRODUCTOS"]
      },
      agregarTalla: { // <-- nueva subruta
      path: "administrador/productos/agregarTalla/index.html",
      html: AgregarTalla, // importado arriba con ?raw
      controlador: agregarTallaController, // importado arriba
      private: true,
      permisos: ["AGREGAR_TALLAS"]
      },
    agregarStock: { // <-- nueva subruta
      path: "administrador/productos/agregarStock/index.html",
      html: AgregarStock, // importado arriba con ?raw
      controlador: agregarStockController, // importado arriba
      private: true,
      permisos: ["AGREGAR_STOCK"]
      }
    }
  },
  catalogo:{
    path:"usuarios/catalogo/index.html",
    html: Catalogo,
    controlador: catalogoController,
    private: true,
    permisos: ["REVISAR_CATALOGO"]
  },
  pedido:{
    path:"usuarios/pedido/index.html",
    html: Pedido,
    controlador: pedidoController,
    private: true,
    permisos: ["REALIZAR_PEDIDO"]
  },
  catalogoTalla:{
    path:"usuarios/catalogoTalla/index.html",
    html: CatalogoTalla,
    controlador: catalogoTallaController,
    private: true,
    permisos: ["FILTRAR_CATALOGO_TALLA"]
  },
  catalogoEmpresa:{
    path:"usuarios/catalogoEmpresa/index.html",
    html: CatalogoEmpresa,
    controlador: catalogoEmpresaController,
    private: true,
    permisos: ["FILTRAR_CATALOGO_EMPRESA"]
  },
  product:{
    path:"usuarios/producto/index.html",
    html: Product,
    controlador: productController,
    private: true,
    permisos: ["REVISAR_DETALLE_PRODUCTO"]
  },
  perfil:{
    path:"perfil/index.html",
    html:Perfil,
    controlador: perfilController,
    private: false,
    
  }
};
