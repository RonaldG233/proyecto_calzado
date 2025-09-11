import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { confirmar, success, error } from "../../../../helpers/alertas.js";
import { get, post } from "../../../../helpers/api.js"; // post() ya hace fetch

export const agregarTallaController = async () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.agregarTalla");

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

  // Recuperar producto
  const producto = JSON.parse(localStorage.getItem("productoTalla"));
  if (!producto) {
    mainContainer.innerHTML = "<p>No se ha seleccionado un producto.</p>";
    return;
  }

  // Mostrar datos producto
  document.getElementById("nombre-producto").value = producto.nombre_producto;
  document.getElementById("descripcion-producto").value = producto.descripcion_producto;
  document.getElementById("precio-producto").value = `$${producto.precio_producto.toFixed(2)}`;

  const selectTallas = document.getElementById("select-tallas");
  const btnAgregarTalla = document.getElementById("btn-agregar-talla");
  const tablaTallas = document.getElementById("tabla-tallas");

  let tallas = [];
  try {
    tallas = await get("tallas"); // /api/tallas
  } catch (err) {
    console.error("Error cargando tallas:", err);
    selectTallas.innerHTML = "<option disabled>Error cargando tallas</option>";
    return;
  }

  let tallasSeleccionadas = JSON.parse(localStorage.getItem(`tallasProducto_${producto.id_producto}`)) || [];

  function renderSelectTallas() {
    selectTallas.innerHTML = '<option value="">-- Selecciona una talla --</option>';
    tallas.forEach(t => {
      if (!tallasSeleccionadas.find(ts => ts.codTalla === t.codTalla)) {
        const option = document.createElement("option");
        option.value = t.codTalla;
        option.textContent = t.numero_talla;
        selectTallas.appendChild(option);
      }
    });
  }

  function renderTablaTallas() {
    tablaTallas.innerHTML = "";
    if (tallasSeleccionadas.length === 0) {
      tablaTallas.innerHTML = "<tr><td colspan='2'>No hay tallas añadidas</td></tr>";
      return;
    }

    tallasSeleccionadas.forEach(t => {
      const tr = document.createElement("tr");
      const tdTalla = document.createElement("td");
      tdTalla.textContent = t.numero_talla;
      tdTalla.style.fontWeight = "bold";

      const tdAcc = document.createElement("td");
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ ELIMINAR";
      btnEliminar.style.backgroundColor = "red"; // ✅ Azul
      btnEliminar.style.color = "white";  
      btnEliminar.style.border = "none";
      btnEliminar.style.padding = "5px";
      btnEliminar.style.cursor = "pointer";
      btnEliminar.style.borderRadius = "5px";
      btnEliminar.style.marginTop = "5px";
      btnEliminar.style.marginLeft = "10px";

      // 🔥 Ahora sí elimina también en la BD
      btnEliminar.addEventListener("click", async () => {
        try {
          const confirmResp = await confirmar(`eliminar la talla ${t.numero_talla}`);
          if (!confirmResp.isConfirmed) return;

          const res = await fetch(
            `http://localhost:8080/proyectoCalzado/api/productos/${producto.id_producto}/tallas/${t.codTalla}`,
            { method: "DELETE" }
          );

          if (res.ok) {
            tallasSeleccionadas = tallasSeleccionadas.filter(sel => sel.codTalla !== t.codTalla);
            localStorage.setItem(`tallasProducto_${producto.id_producto}`, JSON.stringify(tallasSeleccionadas));

            renderTablaTallas();
            renderSelectTallas();
            success("Talla eliminada correctamente");
          } else {
            const data = await res.json();
            error(data.mensaje || "No se pudo eliminar la talla");
          }
        } catch (err) {
          console.error(err);
          error("Error en la solicitud al eliminar la talla");
        }
      });

      tdAcc.appendChild(btnEliminar);
      tr.appendChild(tdTalla);
      tr.appendChild(tdAcc);
      tablaTallas.appendChild(tr);
    });
  }

  renderSelectTallas();
  renderTablaTallas();

  btnAgregarTalla.addEventListener("click", () => {
    const codTalla = parseInt(selectTallas.value);
    if (!codTalla) return;

    const talla = tallas.find(t => t.codTalla === codTalla);
    if (!talla) return;

    tallasSeleccionadas.push(talla);
    renderTablaTallas();
    renderSelectTallas();
  });

  // Guardar tallas en backend
  document.getElementById("btn-guardar-tallas").addEventListener("click", async () => {
    if (tallasSeleccionadas.length === 0) {
      error("Debe añadir al menos una talla");
      return;
    }

    try {
      // Enviar solo nuevas tallas al backend
      const nuevasTallas = tallasSeleccionadas.filter(ts => !(ts.idProductoBackend || false));
      for (const t of nuevasTallas) {
        const res = await post(`productos/${producto.id_producto}/tallas`, { codTalla: t.codTalla });
        if (res.ok) {
          t.idProductoBackend = true; // marcar como guardado
        }
      }

      localStorage.setItem(`tallasProducto_${producto.id_producto}`, JSON.stringify(tallasSeleccionadas));
      success("Tallas guardadas correctamente");
      window.location.hash = "#productos/tablaProductos";

    } catch (err) {
      console.error(err);
      error("Error al guardar tallas");
    }
  });
};
