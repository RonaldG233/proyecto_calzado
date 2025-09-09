// tablaImagenesController.js
import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { crearTablaImagenes } from "../../../../Modules/modules.js";
import { isTokenExpired, refreshAccessToken } from "../../../../helpers/api.js";

export const tablaImagenesController = async () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.imagenes"); // Contenedor para la tabla

  if (!headerContainer || !sidebarContainer || !mainContainer) {
    return console.error("Contenedores no encontrados");
  }

  // Verificar token antes de mostrar la vista
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    const nuevoToken = await refreshAccessToken();
    if (!nuevoToken) {
      window.location.hash = "#login";
      return;
    }
  }

  // Insertar header y sidebar
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  const btnHamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (btnHamburger && sidebar) {
    btnHamburger.addEventListener("click", () => {
      sidebar.classList.toggle("activo");
    });

    // Cerrar sidebar al hacer click en un link
    sidebar.querySelectorAll(".sidebar-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("activo");
      });
    });
  }

  // ------------------ Cargar tabla de imágenes ------------------
  // ✅ Pasamos el contenedor al módulo para evitar duplicación
  await crearTablaImagenes(mainContainer);
};
