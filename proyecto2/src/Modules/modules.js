// modules.js
import { error } from "../helpers/alertas.js";
import { obtenerUsuarios, inactivarUsuario, reactivarUsuario } from "../helpers/api.js";
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
export async function crearTablaUsuarios() {
  try {
    const usuarios = await obtenerUsuarios();
    const main = document.querySelector("main.usuarios");
    main.innerHTML = "";

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // ----- Cabecera -----
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    ["ID","Nombre","Correo","Teléfono","Ciudad","Rol","Estado","Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    tabla.appendChild(thead);

    // ----- Cuerpo -----
    const tbody = document.createElement("tbody");
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

    usuarios.forEach(u => {
      const tr = document.createElement("tr");
      if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) tr.classList.add("resaltado-logueado");

      // Extraer datos, asegurando strings
      const datos = [
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        u.ciudad || "",                      // nombre de la ciudad
        u.rol ? u.rol.nombre_rol : "",       // nombre del rol
        u.estado
      ];

      datos.forEach(d => {
        const td = document.createElement("td");
        td.textContent = d;
        tr.appendChild(td);
      });

      // ----- Acciones -----
      const tdAcc = document.createElement("td");

      // Botón editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.classList.add("editar");
      tdAcc.appendChild(btnEditar);
      btnEditar.addEventListener("click", () => {
        localStorage.setItem("usuarioEditar", JSON.stringify(prod));
        window.location.hash = "#usuarios/usuarioEditar/usuarioEditar";
      });

      // Botón activar/inactivar
      const btnEstado = document.createElement("button");
      if (u.estado.toLowerCase() === "activo") {
        btnEstado.textContent = "🚫 Inactivar";
        btnEstado.classList.add("inactivar");
        btnEstado.addEventListener("click", async () => {
          if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
            Swal.fire("No permitido","No puedes inactivar tu cuenta","warning");
            return;
          }
          const confirm = await Swal.fire({
            title: "Inactivar usuario?",
            text: `El usuario ${u.nombre} pasará a inactivo`,
            icon: "warning",
            showCancelButton:true
          });
          if (confirm.isConfirmed) {
            await inactivarUsuario(u.idUsuario);
            Swal.fire("Inactivado","Usuario inactivado","success");
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
            icon:"question",
            showCancelButton:true
          });
          if (confirm.isConfirmed) {
            await reactivarUsuario(u.idUsuario);
            Swal.fire("Reactivado","Usuario activado","success");
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
    Swal.fire("Error","No se pudo cargar la tabla","error");
  }
}
// ==================== CREAR TABLA DE IMÁGENES ====================
export async function crearTablaImagenes() {
  const main = document.querySelector("main.imagenes") || document.querySelector(".tablaImagen");
  if (!main) return;

  // ✅ Limpiar el contenedor antes de renderizar
  main.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/imagenes");
    if (!response.ok) throw new Error("Error al obtener las imágenes");

    const imagenes = await response.json();

    if (!imagenes.length) {
      main.innerHTML = "<p>No hay imágenes registradas.</p>";
      return;
    }

    // Crear tabla
    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // Cabecera
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["ID", "Nombre", "Imagen", "Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    // Cuerpo
    const tbody = document.createElement("tbody");

    imagenes.forEach(img => {
      const tr = document.createElement("tr");

      // ID
      const tdId = document.createElement("td");
      tdId.textContent = img.id_imagen;

      // Nombre
      const tdNombre = document.createElement("td");
      tdNombre.textContent = img.nombre;

      // Imagen (vista previa)
      const tdImg = document.createElement("td");
      const imgTag = document.createElement("img");
      imgTag.src = `http://localhost:8080/proyectoCalzado/imagenes?nombre=${img.nombre}`;
      imgTag.alt = img.nombre;
      imgTag.width = 100;
      tdImg.appendChild(imgTag);

      // Acciones
      const tdAcc = document.createElement("td");

      // Botón eliminar
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

            // ✅ Quitar la fila directamente sin duplicar tabla
            tr.remove();

            // Si ya no quedan filas, mostrar mensaje vacío
            if (!tbody.querySelector("tr")) {
              main.innerHTML = "<p>No hay imágenes registradas.</p>";
            }

          } catch (err) {
            console.error("Error al eliminar:", err);
            Swal.fire("Error", "No se pudo eliminar la imagen.", "error");
          }
        }
      });
      tdAcc.appendChild(btnEliminar);

      // Insertar celdas en la fila
      [tdId, tdNombre, tdImg, tdAcc].forEach(td => tr.appendChild(td));
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);

  } catch (err) {
    console.error(err);
    main.innerHTML = "<p>Error al cargar imágenes.</p>";
  }
}

// ==================== CREAR TABLA DE PRODUCTOS ====================
export async function crearTablaProductos() {
  const main = document.querySelector("main.productos");
  if (!main) return;

  main.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/productos");
    if (!response.ok) throw new Error("Error al obtener los productos");

    const productos = await response.json();
    if (!productos.length) {
      main.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["ID","Nombre","Descripción","Precio","Empresa","Imagen","Tallas","Stock","Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    productos.forEach(prod => {
      const tr = document.createElement("tr");

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

      // Tallas y Select
      const tdTallas = document.createElement("td");
      const tdStock = document.createElement("td");
      const tallasLocal = JSON.parse(localStorage.getItem(`tallasProducto_${prod.id_producto}`));

      if (tallasLocal && tallasLocal.length > 0) {
        const select = document.createElement("select");
        select.innerHTML = "<option disabled selected>Seleccionar talla</option>";

        tallasLocal.forEach(t => {
          const option = document.createElement("option");
          option.value = t.codTalla;
          option.textContent = t.numero_talla;
          select.appendChild(option);
        });

        // Evento para actualizar el stock según la talla seleccionada
        select.addEventListener("change", () => {
          const codTalla = parseInt(select.value);
          const tallaSeleccionada = tallasLocal.find(t => t.codTalla === codTalla);
          tdStock.textContent = tallaSeleccionada ? tallaSeleccionada.stock || 0 : 0;
        });

        tdTallas.appendChild(select);

        // Mostrar stock de la primera talla por defecto (opcional)
        tdStock.textContent = tallasLocal[0].stock || 0;
        select.selectedIndex = 1; // seleccionar primera talla por defecto
      } else {
        tdTallas.textContent = "No hay tallas";
        tdTallas.style.color = "red";
        tdStock.textContent = "0";
      }

      // Acciones
      const tdAcc = document.createElement("td");
      const btnTalla = document.createElement("button");
      btnTalla.textContent = "➕ Añadir talla";
      btnTalla.addEventListener("click", () => {
        localStorage.setItem("productoTalla", JSON.stringify(prod));
        window.location.hash = "#productos/agregarTalla";
      });

      const btnStock = document.createElement("button");
      btnStock.textContent = "➕ Añadir stock";
      btnStock.addEventListener("click", () => {
        localStorage.setItem("productoStock", JSON.stringify(prod));
        window.location.hash = "#productos/agregarStock";
      });

      tdAcc.appendChild(btnTalla);
      tdAcc.appendChild(btnStock);

      [tdId, tdNombre, tdDescripcion, tdPrecio, tdEmpresa, tdImg, tdTallas, tdStock, tdAcc].forEach(td => tr.appendChild(td));
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);

  } catch (err) {
    console.error(err);
    main.innerHTML = "<p>Error al cargar productos.</p>";
  }
}
