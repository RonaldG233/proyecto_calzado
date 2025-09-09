import HeaderUsuario from "../../../components/headerUsuario.html?raw";
import SidebarUsuario from "../../../components/sidebarUsuario.html?raw";
import Swal from "sweetalert2";

export const productController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const contenedor = document.getElementById("detalleProducto");

  headerContainer.innerHTML = HeaderUsuario;
  sidebarContainer.innerHTML = SidebarUsuario;
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


  const datos = JSON.parse(localStorage.getItem("productoDetalle"));

  if (!datos) {
    Swal.fire({
      icon: "error",
      title: "Producto no encontrado",
      text: "No se pudo cargar el detalle del producto.",
    });
    contenedor.innerHTML = "<p class='error-text'>No se pudo cargar el producto.</p>";
    return;
  }

  const cargarDetalle = () => {
    const imagen = datos.url_imagen 
      ? `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${datos.url_imagen}`
      : "../img/default.png";

    contenedor.innerHTML = `
      <div class="detalle-contenedor">
        <div class="detalle-header">
          <h2 class="detalle-nombre">${datos.nombre_producto}</h2>
        </div>

        <div class="detalle-imagen-container">
          <img src="${imagen}" alt="${datos.nombre_producto}" class="detalle-imagen">
        </div>

        <div class="detalle-descripcion">
          <p>
            <strong>Descripción:</strong> ${datos.descripcion_producto}<br>
            <strong>Precio:</strong> $${parseFloat(datos.precio_producto).toFixed(2)}<br>
            <strong>Empresa:</strong> ${datos.nombre_empresa || "Sin empresa"}
          </p>
        </div>

        <div class="detalle-botones">
          <a href="#" class="btn-volver"><i class="ri-arrow-left-double-fill"></i> Volver</a>
        </div>
      </div>
    `;

    document.querySelector(".btn-volver").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  };

  cargarDetalle();
};
