import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const estiloSelect = document.getElementById("estiloProducto");
  const tallaSelect = document.getElementById("tallaProducto");
  const empresaSelect = document.getElementById("empresaProducto");
  const imagenSelect = document.getElementById("imagenProducto");
  const vistaPrevia = document.getElementById("vistaPrevia");
  const mensaje = document.getElementById("mensajeProducto");

  const nombreInput = document.getElementById("nombre");
  const descripcionInput = document.getElementById("descripcion");
  const precioInput = document.getElementById("precio");
  const cantidadInput = document.getElementById("cantidad");
  const form = document.getElementById("formEditar");

  let imagenes = [];

  const mostrarMensaje = (texto, color = "green") => {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  };

  const urlParams = new URLSearchParams(window.location.search);
  const productoId = urlParams.get("id");

  if (!productoId) {
    mostrarMensaje("No se especificó ID de producto para editar", "red");
    form.style.display = "none";
    return;
  }

  async function cargarOpciones() {
    try {
      const [estilos, tallas, empresas, imgs] = await Promise.all([
        fetch("http://localhost:8080/proyectoCalzado/api/estilos").then(r => r.json()),
        fetch("http://localhost:8080/proyectoCalzado/api/tallas").then(r => r.json()),
        fetch("http://localhost:8080/proyectoCalzado/api/empresas").then(r => r.json()),
        fetch("http://localhost:8080/proyectoCalzado/api/imagenes").then(r => r.json())
      ]);

      imagenes = imgs;

      estilos.forEach(e => {
        const option = document.createElement("option");
        option.value = e.codEstilo;
        option.textContent = e.nombre_estilo;
        estiloSelect.appendChild(option);
      });

      tallas.forEach(t => {
        const option = document.createElement("option");
        option.value = t.codTalla;
        option.textContent = t.numero_talla;
        tallaSelect.appendChild(option);
      });

      empresas.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.idEmpresa;
        option.textContent = emp.nombre_empresa;
        empresaSelect.appendChild(option);
      });

      imagenes.forEach(img => {
        const option = document.createElement("option");
        option.value = img.id_imagen;
        option.textContent = img.nombre;
        imagenSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error cargando selects:", err);
      mostrarMensaje("Error cargando datos para selección", "red");
    }
  }

  async function cargarProducto(id) {
    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/productos`);
      const productos = await res.json();

      const producto = productos.find(p => p.id_producto == id);
      if (!producto) throw new Error("Producto no encontrado");

      nombreInput.value = producto.nombre_producto;
      descripcionInput.value = producto.descripcion_producto;
      precioInput.value = producto.precio_producto;
      cantidadInput.value = producto.cantidad_producto;

      estiloSelect.value = producto.cod_estilo;
      tallaSelect.value = producto.cod_talla;
      empresaSelect.value = producto.id_empresa;
      imagenSelect.value = producto.id_imagen;

      const imagenSeleccionada = imagenes.find(img => img.id_imagen == producto.id_imagen);
      if (imagenSeleccionada) {
        vistaPrevia.src = `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagenSeleccionada.nombre}`;
        vistaPrevia.style.display = "block";
      } else {
        vistaPrevia.style.display = "none";
      }
    } catch (error) {
      console.error("Error al cargar producto:", error);
      mostrarMensaje("No se pudo obtener el producto", "red");
    }
  }

  imagenSelect.addEventListener("change", () => {
    const id = parseInt(imagenSelect.value);
    const imagenSeleccionada = imagenes.find(img => img.id_imagen === id);

    if (imagenSeleccionada) {
      vistaPrevia.src = `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagenSeleccionada.nombre}`;
      vistaPrevia.style.display = "block";
    } else {
      vistaPrevia.src = "";
      vistaPrevia.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validación rápida
    if (!nombreInput.value.trim() || !descripcionInput.value.trim() || !precioInput.value || !cantidadInput.value) {
      return mostrarMensaje("Todos los campos son obligatorios", "red");
    }

    const productoEditado = {
      id_producto: parseInt(productoId),
      nombre_producto: nombreInput.value.trim(),
      descripcion_producto: descripcionInput.value.trim(),
      precio_producto: parseFloat(precioInput.value),
      cantidad_producto: parseInt(cantidadInput.value),
      id_imagen: parseInt(imagenSelect.value),
      cod_estilo: parseInt(estiloSelect.value),
      cod_talla: parseInt(tallaSelect.value),
      id_empresa: parseInt(empresaSelect.value)
    };

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/productos/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productoEditado)
      });

      if (!response.ok) throw new Error("Error actualizando");

      await Swal.fire({
        icon: "success",
        title: "Producto actualizado correctamente",
        confirmButtonText: "Volver"
      });

      window.location.href = "./tablaProductos.html";

    } catch (error) {
      console.error("Error al actualizar producto:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: "Revisa los datos o intenta más tarde"
      });
    }
  });

  (async () => {
    await cargarOpciones();
    await cargarProducto(productoId);
  })();
});
