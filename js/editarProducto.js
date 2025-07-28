document.addEventListener("DOMContentLoaded", () => {
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

  let imagenes = []; // para vista previa

  const mostrarMensaje = (texto, color = "green") => {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  };

  // Obtener el id del producto desde la URL
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

      // Buscar el producto en la lista
      const producto = productos.find(p => p.id_producto == id);

      if (!producto) throw new Error("Producto no encontrado");

      // Llenar inputs y selects con datos del producto
      nombreInput.value = producto.nombre_producto;
      descripcionInput.value = producto.descripcion_producto;
      precioInput.value = producto.precio_producto;
      cantidadInput.value = producto.cantidad_producto;

      estiloSelect.value = producto.cod_estilo;
      tallaSelect.value = producto.cod_talla;
      empresaSelect.value = producto.id_empresa;
      imagenSelect.value = producto.id_imagen;

      // Mostrar imagen en vista previa
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
    if (id) {
      const imagenSeleccionada = imagenes.find(img => img.id_imagen === id);
      if (imagenSeleccionada) {
        vistaPrevia.src = `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagenSeleccionada.nombre}`;
        vistaPrevia.style.display = "block";
      }
    } else {
      vistaPrevia.src = "";
      vistaPrevia.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const precio = parseFloat(precioInput.value);
    const cantidad = parseInt(cantidadInput.value);
    const id_imagen = parseInt(imagenSelect.value);
    const cod_estilo = parseInt(estiloSelect.value);
    const cod_talla = parseInt(tallaSelect.value);
    const id_empresa = parseInt(empresaSelect.value);

    if (!id_imagen) {
      return mostrarMensaje("Debe seleccionar una imagen", "red");
    }

    const productoEditado = {
      id_producto: parseInt(productoId),
      nombre_producto: nombre,
      descripcion_producto: descripcion,
      precio_producto: precio,
      cantidad_producto: cantidad,
      id_imagen,
      cod_estilo,
      cod_talla,
      id_empresa
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

      mostrarMensaje("Producto actualizado correctamente.");
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al actualizar producto", "red");
    }
  });

  (async () => {
    await cargarOpciones();
    await cargarProducto(productoId);
  })();

});
