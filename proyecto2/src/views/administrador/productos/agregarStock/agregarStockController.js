import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { success, error } from "../../../../helpers/alertas.js";
import { put } from "../../../../helpers/api.js";

export const agregarStockController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.agregarStock");

  if (!headerContainer || !sidebarContainer || !mainContainer) return;

  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  const btnHamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (btnHamburger && sidebar) {
    btnHamburger.addEventListener("click", () => {
      sidebar.classList.toggle("activo");
    });

    // Opcional: cerrar sidebar al dar click en un link
    sidebar.querySelectorAll(".sidebar-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("activo");
      });
    });
  }

  const producto = JSON.parse(localStorage.getItem("productoStock"));
  if (!producto) {
    mainContainer.innerHTML = "<p>No se ha seleccionado un producto.</p>";
    return;
  }

  const tallasProducto = JSON.parse(localStorage.getItem(`tallasProducto_${producto.id_producto}`)) || [];

  if (tallasProducto.length === 0) {
    mainContainer.innerHTML = "<p>Este producto no tiene tallas añadidas. Añade tallas antes de asignar stock.</p>";
    return;
  }

  mainContainer.innerHTML = `
  <div id="producto-info" class="stock__producto-info">
    <h3 class="stock__nombre">${producto.nombre_producto}</h3>
    <p class="stock__descripcion">${producto.descripcion_producto}</p>
    <p class="stock__precio">Precio: $${producto.precio_producto.toFixed(2)}</p>
  </div>
  <table id="tabla-stock" class="stock__tabla">
    <thead class="stock__tabla-encabezado">
      <tr>
        <th class="stock__tabla-columna">Talla</th>
        <th class="stock__tabla-columna">Stock</th>
      </tr>
    </thead>
    <tbody class="stock__tabla-cuerpo">
      ${tallasProducto.map(t => `
        <tr class="stock__fila">
          <td class="stock__talla">${t.numero_talla}</td>
          <td class="stock__celda-input">
            <input type="number" min="0" value="${t.stock || 0}" data-cod-talla="${t.codTalla}" class="stock__input">
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <button id="btn-guardar-stock" class="stock__btn-guardar">Guardar Stock</button>
`;


  const btnGuardar = document.getElementById("btn-guardar-stock");
  const inputsStock = mainContainer.querySelectorAll("#tabla-stock tbody input");

  btnGuardar.addEventListener("click", async () => {
    try {
      for (const input of inputsStock) {
        const codTalla = parseInt(input.dataset.codTalla);
        const stock = parseInt(input.value) || 0;
        await put(`productos/${producto.id_producto}/tallas/${codTalla}`, { numeroStock: stock });

        // Actualizar localStorage inmediatamente
        const t = tallasProducto.find(t => t.codTalla === codTalla);
        if (t) t.stock = stock;
      }
      localStorage.setItem(`tallasProducto_${producto.id_producto}`, JSON.stringify(tallasProducto));

      success("Stock guardado correctamente");
      window.location.hash = "#productos/tablaProductos";

    } catch (err) {
      console.error(err);
      error("Error al guardar el stock");
    }
  });
};
