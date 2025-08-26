import { routes } from './routes.js';

/**
 * Función principal del router SPA.
 * Detecta el hash, carga la vista correspondiente y ejecuta el controlador.
 */
export const router = async () => {
  const app = document.getElementById('app'); // Contenedor donde se cargan las vistas
  let hash = location.hash.replace("#", "");

  // Si no hay hash, redirigimos a home
  if (!hash) {
    location.hash = "home";
    return;
  }

  // Verifica si la ruta existe en routes
  const ruta = routes[hash];
  if (!ruta) {
    app.innerHTML = "<h2>Ruta no encontrada</h2>";
    return;
  }

  try {
    // Carga el HTML de la vista
    const response = await fetch(ruta.path);
    if (!response.ok) throw new Error("No se pudo cargar la vista");

    const html = await response.text();
    app.innerHTML = html;

    // Ejecuta el controlador de la vista (si existe)
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
document.addEventListener("DOMContentLoaded", router);
