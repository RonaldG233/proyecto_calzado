import HeaderUsuario from "../../../components/headerUsuario.html?raw";
import SidebarUsuario from "../../../components/sidebarUsuario.html?raw";
import Swal from "sweetalert2";

export const catalogoEmpresaController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const contenedor = document.getElementById("contenedorCatalogo");
  const selectEmpresas = document.getElementById("selectEmpresas");

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


  const URL_PRODUCTOS = "http://localhost:8080/proyectoCalzado/api/productos";
  const URL_EMPRESAS = "http://localhost:8080/proyectoCalzado/api/empresas";

  let productos = [];
  let empresas = [];

  // Cargar empresas activas
  const cargarEmpresas = async () => {
    try {
      const res = await fetch(`${URL_EMPRESAS}/activos`);
      empresas = await res.json();

      selectEmpresas.innerHTML = '<option value="">-- Todas las empresas --</option>';
      empresas.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.nombre_empresa; // filtramos por nombre
        option.textContent = emp.nombre_empresa;
        selectEmpresas.appendChild(option);
      });
    } catch (e) {
      console.error("Error cargando empresas:", e);
      selectEmpresas.innerHTML = "<option value=''>-- Error cargando empresas --</option>";
    }
  };

  // Cargar productos
  const cargarProductos = async () => {
    try {
      const res = await fetch(URL_PRODUCTOS);
      productos = await res.json();
      renderizarProductos(productos);
    } catch (e) {
      console.error("Error cargando productos:", e);
      contenedor.innerHTML = `<p style="color:red;">No se pudieron cargar los productos.</p>`;
    }
  };

  // Filtrar productos por empresa
  const filtrarPorEmpresa = () => {
    const empresaSeleccionada = selectEmpresas.value;
    const filtrados = empresaSeleccionada 
      ? productos.filter(p => p.nombre_empresa === empresaSeleccionada)
      : productos;
    renderizarProductos(filtrados);
  };

  // Renderizar productos en el catálogo
  const renderizarProductos = (lista) => {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
      contenedor.innerHTML = "<p style='color:red;'>No hay productos para esta empresa.</p>";
      return;
    }

    lista.forEach(prod => {
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

      const selectTallaProd = card.querySelector(".select-talla");
      const inputCantidad = card.querySelector(".input-cantidad");
      const inputStock = card.querySelector(".input-stock");
      const btnAgregar = card.querySelector(".btn-agregar");

      if (tallasLocal.length > 0) {
        selectTallaProd.innerHTML = "<option disabled selected>Seleccionar talla</option>";
        tallasLocal.forEach(t => {
          const option = document.createElement("option");
          option.value = t.codTalla;
          option.textContent = t.numero_talla;
          selectTallaProd.appendChild(option);
        });
        const tallaSel = tallasLocal[0];
        selectTallaProd.selectedIndex = 1;
        inputStock.value = tallaSel.stock;
        inputCantidad.max = tallaSel.stock;
      } else {
        selectTallaProd.disabled = true;
        inputCantidad.disabled = true;
        inputStock.value = 0;
        btnAgregar.disabled = true;
      }

      selectTallaProd.addEventListener("change", () => {
        const codTalla = parseInt(selectTallaProd.value);
        const tallaSel = tallasLocal.find(t => t.codTalla === codTalla);
        inputStock.value = tallaSel.stock;
        inputCantidad.max = tallaSel.stock;
      });

      btnAgregar.addEventListener("click", (e) => {
        e.stopPropagation(); // evita que se abra detalle al agregar al carrito
        const codTalla = parseInt(selectTallaProd.value);
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

      // Click en la card solo si no es botón, select, input o label
      card.addEventListener("click", (e) => {
        if (!["BUTTON", "SELECT", "INPUT", "LABEL"].includes(e.target.tagName)) {
          localStorage.setItem("productoDetalle", JSON.stringify(prod));
          window.location.href = "#product"; // ajusta la ruta
        }
      });

      contenedor.appendChild(card);
    });
  };

  // Eventos
  selectEmpresas.addEventListener("change", filtrarPorEmpresa);

  // Inicialización
  const init = async () => {
    await cargarEmpresas();
    await cargarProductos();
  };

  init();
};
