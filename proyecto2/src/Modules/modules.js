// modules.js
import { error } from "../helpers/alertas.js";
import { obtenerUsuarios, inactivarUsuario, reactivarUsuario, cambiarRolUsuario, put  } from "../helpers/api.js";
import Swal from "sweetalert2";

// ==================== VALIDACIÓN DE FORMULARIOS ====================
export const contarCamposFormulario = (formulario) => {
  if (!formulario) return { total: 0, completos: 0, vacíos: 0 };
  const campos = formulario.querySelectorAll("input, select, textarea");
  let completos = 0, vacíos = 0;

  campos.forEach(c => {
    if (!["button","submit","reset"].includes(c.type)) {
      c.value.trim() !== "" ? completos++ : vacíos++;
    }
  });

  if (vacíos > 0) error(`Hay ${vacíos} campos vacíos. Por favor completa todos los campos.`);
  return { total: campos.length, completos, vacíos };
};

// ==================== CREAR TABLA DE USUARIOS ====================
const rolesMap = {
  "Administrador": 2,
  "Usuario": 1
};
export async function crearTablaUsuarios() {
  try {
    
    const usuarios = await obtenerUsuarios();
    const main = document.querySelector("main.usuarios");
    main.innerHTML = "";

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // ----- Cabecera -----
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["ID", "Nombre", "Correo", "Teléfono", "Ciudad", "Rol", "Estado", "Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    // ----- Cuerpo -----
    const tbody = document.createElement("tbody");
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

    usuarios.forEach(u => {
      const tr = document.createElement("tr");

      // Resaltar usuario logueado
      if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
        tr.classList.add("resaltado-logueado");
      }

      // Datos de la fila
      const datos = [
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        u.ciudad || "",
        u.rol?.nombre || "Sin rol", // 👈 aquí
        u.estado
      ];


      datos.forEach((d, i) => {
        const td = document.createElement("td");
        td.textContent = d;

        // 👉 Si es la columna de Rol
        if (i === 5) {
          td.classList.add("col-rol");

          // Solo permitir cambio si NO es el usuario logueado
          if (!(usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario)) {
            td.style.cursor = "pointer";
            td.title = "Click para cambiar rol";

            td.addEventListener("click", async () => {
  const rolActual = u.rol?.nombre.toLowerCase();
  const nuevoRolNombre = rolActual === "administrador" ? "Usuario" : "Administrador";

  const confirm = await Swal.fire({
    title: "Cambiar rol?",
    text: `El usuario ${u.nombre} pasará a rol ${nuevoRolNombre}`,
    icon: "question",
    showCancelButton: true
  });

  if (confirm.isConfirmed) {
    try {
      await cambiarRolUsuario(u.idUsuario, nuevoRolNombre);
      Swal.fire("Rol actualizado", `El rol se cambió a ${nuevoRolNombre}`, "success");
      crearTablaUsuarios();
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar el rol", "error");
    }
  }
});


          }
        }

        tr.appendChild(td);
      });

      // Acciones
      const tdAcc = document.createElement("td");

      // Botón activar/inactivar
      const btnEstado = document.createElement("button");
      if (u.estado.toLowerCase() === "activo") {
        btnEstado.textContent = "🚫 Inactivar";
        btnEstado.classList.add("inactivar");
        btnEstado.addEventListener("click", async () => {
          if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
            Swal.fire("No permitido", "No puedes inactivar tu propia cuenta", "warning");
            return;
          }

          const confirm = await Swal.fire({
            title: "Inactivar usuario?",
            text: `El usuario ${u.nombre} pasará a inactivo`,
            icon: "warning",
            showCancelButton: true
          });

          if (confirm.isConfirmed) {
            await inactivarUsuario(u.idUsuario);
            Swal.fire("Inactivado", "Usuario inactivado", "success");
            crearTablaUsuarios();
          }
        });
      } else {
        btnEstado.textContent = "✅ Reactivar";
        btnEstado.classList.add("reactivar");
        btnEstado.addEventListener("click", async () => {
          const confirm = await Swal.fire({
            title: "Reactivar usuario?",
            text: `El usuario ${u.nombre} pasará a activo`,
            icon: "question",
            showCancelButton: true
          });

          if (confirm.isConfirmed) {
            await reactivarUsuario(u.idUsuario);
            Swal.fire("Reactivado", "Usuario activado", "success");
            crearTablaUsuarios();
          }
        });
      }

      tdAcc.appendChild(btnEstado);
      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo cargar la tabla", "error");
  }
}

// ==================== CREAR TABLA DE IMÁGENES ====================
export async function crearTablaImagenes(contenedor) {
  if (!contenedor) return;

  // Limpiar contenedor antes de renderizar
  contenedor.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
    if (!response.ok) throw new Error("Error al obtener las imágenes");

    const imagenes = await response.json();
    if (!imagenes.length) {
      contenedor.innerHTML = "<p>No hay imágenes registradas.</p>";
      return;
    }

    // Crear tabla
    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["ID", "Nombre", "Imagen", "Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    imagenes.forEach(img => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = img.id_imagen;

      const tdNombre = document.createElement("td");
      tdNombre.textContent = img.nombre;

      const tdImg = document.createElement("td");
      const imgTag = document.createElement("img");
      imgTag.src = `http://localhost:8080/proyectoCalzado/imagenes?nombre=${img.nombre}`;
      imgTag.alt = img.nombre;
      imgTag.width = 100;
      tdImg.appendChild(imgTag);

      const tdAcc = document.createElement("td");
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.classList.add("eliminar");
      btnEliminar.addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
          title: `¿Eliminar "${img.nombre}"?`,
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        });

        if (confirmacion.isConfirmed) {
          try {
            const res = await fetch(
              `http://localhost:8080/proyectoCalzado/api/imagenes/${img.id_imagen}`,
              { method: "DELETE" }
            );
            if (!res.ok) throw new Error();

            Swal.fire("Eliminada", "La imagen fue eliminada correctamente.", "success");

            tr.remove();
            if (!tbody.querySelector("tr")) {
              contenedor.innerHTML = "<p>No hay imágenes registradas.</p>";
            }
          } catch (err) {
            console.error("Error al eliminar:", err);
            Swal.fire("Error", "No se pudo eliminar la imagen.", "error");
          }
        }
      });

      tdAcc.appendChild(btnEliminar);
      [tdId, tdNombre, tdImg, tdAcc].forEach(td => tr.appendChild(td));
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    contenedor.appendChild(tabla);

  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Error al cargar imágenes.</p>";
  }
}



export async function crearTablaProductos() {
  const main = document.querySelector("main.productos");
  if (!main) return;

  // ✅ Limpiar contenedor antes de renderizar
  main.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
    if (!response.ok) throw new Error("Error al obtener los productos");

    const productos = await response.json();
    if (!productos.length) {
      main.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    // ✅ Crear tabla
    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // Cabecera
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["ID","Nombre","Descripción","Precio","Empresa","Imagen","Tallas","Stock","Estado","Acciones"]
      .forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        trHead.appendChild(th);
      });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const prod of productos) {
      const tr = document.createElement("tr");

      // Celdas
      const tdId = document.createElement("td"); tdId.textContent = prod.id_producto;
      const tdNombre = document.createElement("td"); tdNombre.textContent = prod.nombre_producto;
      const tdDescripcion = document.createElement("td"); tdDescripcion.textContent = prod.descripcion_producto;
      const tdPrecio = document.createElement("td"); tdPrecio.textContent = `$${prod.precio_producto.toFixed(2)}`;
      const tdEmpresa = document.createElement("td"); tdEmpresa.textContent = prod.nombre_empresa || "Sin empresa";

      const tdImg = document.createElement("td");
      const imgTag = document.createElement("img");
      imgTag.src = prod.url_imagen 
        ? `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${prod.url_imagen}`
        : "http://localhost:8080/proyectoCalzado/imagenes/default.png";
      imgTag.alt = prod.nombre_producto;
      imgTag.width = 100;
      tdImg.appendChild(imgTag);

      // Tallas, Stock y Estado
      const tdTallas = document.createElement("td");
      const tdStock = document.createElement("td");
      const tdEstado = document.createElement("td");

      const tallasLocal = JSON.parse(localStorage.getItem(`tallasProducto_${prod.id_producto}`)) || [];

      const actualizarEstadoVisual = (tallaSeleccionada) => {
        const stock = tallaSeleccionada ? tallaSeleccionada.stock || 0 : 0;
        tdStock.textContent = stock;

        const todasAgotadas = tallasLocal.every(t => t.stock <= 0);
        const nuevoEstado = todasAgotadas ? 2 : 1;

        tdEstado.textContent = todasAgotadas ? "Agotado" : "Disponible";
        tdEstado.style.color = todasAgotadas ? "red" : "green";
      };

      if (tallasLocal.length > 0) {
        const select = document.createElement("select");
        select.innerHTML = "<option disabled selected>Seleccionar talla</option>";
        tallasLocal.forEach(t => {
          const option = document.createElement("option");
          option.value = t.codTalla;
          option.textContent = t.numero_talla;
          select.appendChild(option);
        });

        select.addEventListener("change", () => {
          const codTalla = parseInt(select.value);
          const tallaSel = tallasLocal.find(t => t.codTalla === codTalla);
          actualizarEstadoVisual(tallaSel);
        });

        tdTallas.appendChild(select);

        select.selectedIndex = 1;
        actualizarEstadoVisual(tallasLocal[0]);
      } else {
        tdTallas.textContent = "No hay tallas";
        tdTallas.style.color = "red";
        tdStock.textContent = "0";
        tdEstado.textContent = "Agotado";
        tdEstado.style.color = "red";
      }

      // Acciones
      const tdAcc = document.createElement("td");
      const btnTalla = document.createElement("button");
      btnTalla.textContent = "➕ Añadir talla";
      btnTalla.classList.add("btn-talla");
      btnTalla.addEventListener("click", () => {
        localStorage.setItem("productoTalla", JSON.stringify(prod));
        window.location.hash = "#productos/agregarTalla";
      });

      const btnStock = document.createElement("button");
      btnStock.textContent = "➕ Añadir stock";
      btnStock.classList.add("btn-stock");
      btnStock.addEventListener("click", () => {
        localStorage.setItem("productoStock", JSON.stringify(prod));
        window.location.hash = "#productos/agregarStock";
      });

      tdAcc.appendChild(btnTalla);
      tdAcc.appendChild(btnStock);

      [tdId, tdNombre, tdDescripcion, tdPrecio, tdEmpresa, tdImg, tdTallas, tdStock, tdEstado, tdAcc].forEach(td => tr.appendChild(td));
      tbody.appendChild(tr);
    }

    tabla.appendChild(tbody);
    main.appendChild(tabla);

  } catch (err) {
    console.error(err);
    main.innerHTML = "<p>Error al cargar productos.</p>";
  }
}
