import HeaderUsuario from "../../../components/headerUsuario.html?raw";
import SidebarUsuario from "../../../components/sidebarUsuario.html?raw";
import Swal from "sweetalert2";

export const catalogoController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const contenedor = document.getElementById("contenedorCatalogo");

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


  let productos = [];

  const cargarProductos = async () => {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
      productos = await res.json();
      contenedor.innerHTML = "";

      productos.forEach(prod => {
        const tallasLocal = JSON.parse(localStorage.getItem(`tallasProducto_${prod.id_producto}`)) || [];

        const card = document.createElement("div");
        card.classList.add("card-producto");

        card.innerHTML = `
          <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${prod.url_imagen || 'default.png'}" 
               alt="${prod.nombre_producto}" class="card-imagen">
          <div class="card-info">
            <h3>${prod.nombre_producto}</h3>
            <p>$${prod.precio_producto.toFixed(2)}</p>
            
            <label>Talla:</label>
            <select class="select-talla"></select>
            
            <label>Cantidad:</label>
            <input type="number" min="1" value="1" class="input-cantidad">
            
            <label>Stock:</label>
            <input type="number" class="input-stock" readonly>
            
            <button class="btn-agregar">Agregar</button>
          </div>
        `;

        const selectTalla = card.querySelector(".select-talla");
        const inputCantidad = card.querySelector(".input-cantidad");
        const inputStock = card.querySelector(".input-stock");
        const btnAgregar = card.querySelector(".btn-agregar");

        // --- Configuración de tallas y stock ---
        if (tallasLocal.length > 0) {
          selectTalla.innerHTML = "<option disabled selected>Seleccionar talla</option>";
          tallasLocal.forEach(t => {
            const option = document.createElement("option");
            option.value = t.codTalla;
            option.textContent = t.numero_talla;
            selectTalla.appendChild(option);
          });
          selectTalla.selectedIndex = 1;
          const tallaSel = tallasLocal[0];
          inputStock.value = tallaSel.stock;
          inputCantidad.max = tallaSel.stock;
        } else {
          selectTalla.disabled = true;
          inputCantidad.disabled = true;
          inputStock.value = 0;
          btnAgregar.disabled = true;
        }

        selectTalla.addEventListener("change", () => {
          const codTalla = parseInt(selectTalla.value);
          const tallaSel = tallasLocal.find(t => t.codTalla === codTalla);
          inputStock.value = tallaSel.stock;
          inputCantidad.max = tallaSel.stock;
        });

        // --- Agregar al carrito ---
        btnAgregar.addEventListener("click", (e) => {
          e.stopPropagation(); // Evita que el click en el botón active la card
          const codTalla = parseInt(selectTalla.value);
          if (!codTalla) return Swal.fire("Selecciona una talla", "", "warning");

          const tallaSel = tallasLocal.find(t => t.codTalla === codTalla);
          const cantidadDeseada = parseInt(inputCantidad.value);

          if (cantidadDeseada < 1) return Swal.fire("Cantidad inválida", "", "warning");
          if (cantidadDeseada > tallaSel.stock) return Swal.fire("Stock insuficiente", `Solo hay ${tallaSel.stock} disponibles`, "warning");

          let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
          const index = carrito.findIndex(item => item.id_producto === prod.id_producto && item.codTalla === codTalla);

          if (index >= 0) carrito[index].cantidad += cantidadDeseada;
          else carrito.push({
            id_producto: prod.id_producto,
            nombre_producto: prod.nombre_producto,
            precio_producto: prod.precio_producto,
            id_imagen: prod.id_imagen,
            codTalla: codTalla,
            numero_talla: tallaSel.numero_talla,
            cantidad: cantidadDeseada
          });

          localStorage.setItem("carrito", JSON.stringify(carrito));
          Swal.fire("¡Agregado!", `${cantidadDeseada} unidad(es) de ${prod.nombre_producto} agregadas al carrito`, "success");
        });

        // --- Click en la card para ir al detalle ---
        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("btn-agregar") || e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
          localStorage.setItem("productoDetalle", JSON.stringify(prod));
          window.location.href = "#product"; // Ajusta según tu ruta
        });

        contenedor.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      contenedor.innerHTML = `<p style="color:red;">No se pudieron cargar los productos.</p>`;
    }
  };

  cargarProductos();
};
