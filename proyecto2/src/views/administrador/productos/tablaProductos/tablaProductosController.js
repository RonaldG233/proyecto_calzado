import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { crearTablaProductos } from "../../../../Modules/modules.js";
import { isTokenExpired, refreshAccessToken } from "../../../../helpers/api.js";

export const tablaProductosController = async () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.productos");

  if (!headerContainer || !sidebarContainer || !mainContainer) {
    return console.error("Contenedores no encontrados");
  }

  // ✅ Verificar token antes de mostrar la vista
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    const nuevoToken = await refreshAccessToken();
    if (!nuevoToken) {
      window.location.hash = "#login";
      return;
    }
  }

  // ✅ Insertar header y sidebar solo una vez
  if (!headerContainer.dataset.cargado) {
    headerContainer.innerHTML = HeaderAdmin;
    headerContainer.dataset.cargado = "true";
  }

  if (!sidebarContainer.dataset.cargado) {
    sidebarContainer.innerHTML = SidebarAdmin;
    sidebarContainer.dataset.cargado = "true";

    const btnHamburger = document.getElementById("hamburger");
    const sidebar = document.querySelector(".sidebar");

    if (btnHamburger && sidebar) {
      btnHamburger.addEventListener("click", () => {
        sidebar.classList.toggle("activo");
      });

      // Cerrar sidebar al dar click en un link
      sidebar.querySelectorAll(".sidebar-item").forEach(link => {
        link.addEventListener("click", () => {
          sidebar.classList.remove("activo");
        });
      });
    }
  }

  // ✅ Limpiar contenedor main antes de crear tabla
  mainContainer.innerHTML = "";

  // ✅ Llamar a crearTablaProductos una sola vez
  await crearTablaProductos();

  // ✅ Delegación de eventos para botones dentro de la tabla
  mainContainer.addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila) return;

    // Añadir talla
    if (e.target.classList.contains("btn-talla")) {
      const prodId = fila.querySelector("td").textContent;
      const prod = JSON.parse(localStorage.getItem("productoTalla") || "{}");
      if (prod.id_producto != prodId) {
        console.warn("Producto no encontrado en localStorage");
      }
    }

    // Añadir stock
    if (e.target.classList.contains("btn-stock")) {
      const prodId = fila.querySelector("td").textContent;
      const prod = JSON.parse(localStorage.getItem("productoStock") || "{}");
      if (prod.id_producto != prodId) {
        console.warn("Producto no encontrado en localStorage");
      }
    }
  });
};
