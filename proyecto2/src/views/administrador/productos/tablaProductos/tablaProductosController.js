// tablaProductosController.js
import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { crearTablaProductos } from "../../../../Modules/modules.js";
import { isTokenExpired, refreshAccessToken } from "../../../../helpers/api.js";

export const tablaProductosController = async () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.productos"); // Contenedor para la tabla

  if (!headerContainer || !sidebarContainer || !mainContainer) {
    return console.error("Contenedores no encontrados");
  }

  // Verificar token antes de mostrar la vista
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired()) {
    const nuevoToken = await refreshAccessToken();
    if (!nuevoToken) {
      window.location.hash = "#login";
      return;
    }
  }

  // Insertar header y sidebar
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Esperar a que se cargue la tabla de productos con imágenes y datos cruzados
  await crearTablaProductos();

  // Opcional: si quieres, puedes agregar listeners globales para botones dentro de la tabla
  mainContainer.addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila) return;

    // Botones de añadir talla
    if (e.target.classList.contains("btn-talla")) {
      const prodId = fila.querySelector("td").textContent;
      const prod = JSON.parse(localStorage.getItem("productoTalla") || "{}");
      if (prod.id_producto != prodId) {
        console.warn("Producto no encontrado en localStorage");
      }
    }

    // Botones de añadir stock
    if (e.target.classList.contains("btn-stock")) {
      const prodId = fila.querySelector("td").textContent;
      const prod = JSON.parse(localStorage.getItem("productoStock") || "{}");
      if (prod.id_producto != prodId) {
        console.warn("Producto no encontrado en localStorage");
      }
    }
  });
};
