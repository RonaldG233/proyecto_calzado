import { routes } from './routes.js';

export const router = () => {
  const app = document.getElementById("app");
  let hash = location.hash.replace("#", "") || "home";

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
