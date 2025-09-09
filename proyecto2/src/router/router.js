import { routes } from "./routes.js";
import { isTokenExpired, refreshAccessToken } from "../helpers/api.js";
import Swal from "sweetalert2";

export const router = async () => {
  const app = document.getElementById("app");

  // Obtener hash y separar subruta
  let hash = location.hash.replace("#", "") || "home";
  const [routeName, subrouteName] = hash.split("/");

  const ruta = routes[routeName];

  if (!ruta) {
    app.innerHTML = "<h2>Ruta no encontrada</h2>";
    return;
  }

  // ============= VALIDAR TOKEN =============
  let token = localStorage.getItem("token");

  if (ruta.private) {
    if (!token || isTokenExpired(token)) {
      const nuevoToken = await refreshAccessToken();
      if (!nuevoToken) {
        window.location.hash = "#login";
        return;
      }
      token = nuevoToken; // actualizar token
    }

    // ============= VALIDAR PERMISOS =============
    if (ruta.permisos && ruta.permisos.length > 0) {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      if (!usuario || !usuario.rol) {
        Swal.fire("Acceso denegado", "No tienes permisos para acceder a esta vista", "error")
          .then(() => window.history.back());
        return;
      }

      let permisosUsuario = [];

      // Caso 1: rol como objeto con array de permisos
      if (typeof usuario.rol === "object" && usuario.rol.permisos) {
        permisosUsuario = usuario.rol.permisos; // array de strings
      }

      // Caso 2: rol como string
      else if (typeof usuario.rol === "string") {
        permisosUsuario = [usuario.rol]; // lo ponemos en un array para comparar
      }

      // Validar si tiene al menos un permiso requerido
      const tienePermiso = ruta.permisos.some(p => permisosUsuario.includes(p));

      if (!tienePermiso) {
        Swal.fire("Acceso denegado", "No tienes permisos para acceder a esta vista", "error")
          .then(() => window.history.back());
        return;
      }
    }
  }

  try {
    // Manejar subruta si existe
    let html = ruta.html;
    let controlador = ruta.controlador;

    if (subrouteName && ruta.subroutes && ruta.subroutes[subrouteName]) {
      html = ruta.subroutes[subrouteName].html;
      controlador = ruta.subroutes[subrouteName].controlador;
    }

    // Cargar vista
    app.innerHTML = html;

    // Ejecutar controlador
    if (typeof controlador === "function") {
      controlador();
    }

  } catch (err) {
    console.error("Error cargando la vista:", err);
    app.innerHTML = "<h2>Error al cargar la vista</h2>";
  }
};

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
