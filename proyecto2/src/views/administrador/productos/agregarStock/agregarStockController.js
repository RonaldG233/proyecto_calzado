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

  const producto = JSON.parse(localStorage.getItem("productoStock"));
  if (!producto) {
    mainContainer.innerHTML = "<p>No se ha seleccionado un producto.</p>";
    return;
  }

  // Obtener tallas del producto
  const tallasProducto = JSON.parse(localStorage.getItem(`tallasProducto_${producto.id_producto}`)) || [];

  if (tallasProducto.length === 0) {
    mainContainer.innerHTML = "<p>Este producto no tiene tallas añadidas. Añade tallas antes de asignar stock.</p>";
    return;
  }

  // Renderizar formulario de stock
  mainContainer.innerHTML = `
    <div id="producto-info">
      <h3>${producto.nombre_producto}</h3>
      <p>${producto.descripcion_producto}</p>
      <p>Precio: $${producto.precio_producto.toFixed(2)}</p>
    </div>
    <table id="tabla-stock">
      <thead>
        <tr>
          <th>Talla</th>
          <th>Stock</th>
        </tr>
      </thead>
      <tbody>
        ${tallasProducto.map(t => `
          <tr>
            <td>${t.numero_talla}</td>
            <td><input type="number" min="0" value="${t.stock || 0}" data-cod-talla="${t.codTalla}"></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <button id="btn-guardar-stock">Guardar Stock</button>
  `;

  const btnGuardar = document.getElementById("btn-guardar-stock");
  const inputsStock = mainContainer.querySelectorAll("#tabla-stock tbody input");

  btnGuardar.addEventListener("click", async () => {
    const nuevoStock = [];

    inputsStock.forEach(input => {
      const codTalla = parseInt(input.dataset.codTalla);
      const stock = parseInt(input.value) || 0;

      const talla = tallasProducto.find(t => t.codTalla === codTalla);
      if (talla) {
        talla.stock = stock; // Actualizar stock en la talla
        nuevoStock.push(talla);
      }
    });

    try {
      // Guardar stock en backend (opcional, si tu API lo soporta)
      // await put(`productos/${producto.id_producto}/stock`, nuevoStock);

      // Guardar en localStorage para tablaProductos
      localStorage.setItem(`tallasProducto_${producto.id_producto}`, JSON.stringify(nuevoStock));

      success("Stock guardado correctamente");
      window.location.hash = "#productos/tablaProductos";

    } catch (err) {
      console.error(err);
      error("Error al guardar el stock");
    }
  });
};
