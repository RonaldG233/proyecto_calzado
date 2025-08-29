import { routes } from "./routes.js";

/**
 * Enrutador SPA.
 * Escucha cambios en el hash y carga la vista/controlador correspondiente.
 */
export const router = () => {
  const app = document.getElementById("app");

  // Elimina el "#" inicial del hash, si no hay hash va a "home"
  let hash = location.hash.replace("#", "") || "home";

  // Buscar la ruta correspondiente
  const ruta = routes[hash];
  if (!ruta) {
    app.innerHTML = "<h2>Ruta no encontrada</h2>";
    return;
  }

  try {
    // Insertar el HTML de la vista
    app.innerHTML = ruta.html;

    // Ejecutar el controlador si existe
    if (typeof ruta.controlador === "function") {
      ruta.controlador();
    }
  } catch (error) {
    console.error("Error cargando la vista:", error);
    app.innerHTML = "<h2>Error al cargar la vista</h2>";
  }
};

// Detecta cambios en el hash
window.addEventListener("hashchange", router);

// Ejecutar router al cargar la página
window.addEventListener("DOMContentLoaded", router);
