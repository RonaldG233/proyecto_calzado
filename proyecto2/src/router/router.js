import { routes } from "./routes.js";
import { isTokenExpired, refreshAccessToken } from "../helpers/api.js";

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

  // Rutas privadas: validar token
  if (ruta.private) {
    let token = localStorage.getItem("token");
    
    if (!token || isTokenExpired()) {
      const nuevoToken = await refreshAccessToken();
      if (!nuevoToken) {
        window.location.hash = "#login";
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
