import { router } from './router/router.js';

// Cuando cargue la app, ejecutamos el router
document.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) {
    location.hash = "#home"; // Redirigir a la vista home si no hay hash
  }
  router();
});
