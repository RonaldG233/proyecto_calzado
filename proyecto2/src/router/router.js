import { routes } from "./routes.js";
import { isTokenExpired, refreshAccessToken } from "../helpers/api.js";

export const router = async () => {
  const app = document.getElementById("app");
  let hash = location.hash.replace("#", "") || "home";
  const ruta = routes[hash];

  if (!ruta) {
    app.innerHTML = "<h2>Ruta no encontrada</h2>";
    return;
  }

  // Rutas privadas: validar token
  if (ruta.private) {
    let token = localStorage.getItem("token");
    
    // Si no hay token o está expirado, intenta refrescar
    if (!token || isTokenExpired()) {
      const nuevoToken = await refreshAccessToken();
      if (!nuevoToken) {
        window.location.hash = "#login"; // Redirige si no hay token válido
        return;
      }
    }
  }

  try {
    // Cargar vista
    app.innerHTML = ruta.html;

    // Ejecutar controlador
    if (typeof ruta.controlador === "function") {
      ruta.controlador();
    }
  } catch (err) {
    console.error("Error cargando la vista:", err);
    app.innerHTML = "<h2>Error al cargar la vista</h2>";
  }
};

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
