import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();
  const estiloSelect = document.getElementById("estiloProducto");
  const tallaSelect = document.getElementById("tallaProducto");
  const empresaSelect = document.getElementById("empresaProducto");
  const imagenSelect = document.getElementById("imagenProducto");
  const vistaPrevia = document.getElementById("vistaPrevia");

  let imagenes = [];

  // ✅ Función de alertas con SweetAlert2
  const mostrarAlerta = (titulo, texto, icono = "success") => {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: "Aceptar"
    });
  };

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
      mostrarAlerta("Error", "No se pudieron cargar los datos", "error");
    }
  }

  cargarOpciones();

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

  document.getElementById("formularioProducto").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const precio = parseFloat(document.getElementById("precioProducto").value);
    const cantidad = parseInt(document.getElementById("cantidadProducto").value);
    const id_imagen = parseInt(imagenSelect.value);
    const cod_estilo = parseInt(estiloSelect.value);
    const cod_talla = parseInt(tallaSelect.value);
    const id_empresa = parseInt(empresaSelect.value);

    if (!nombre || !descripcion || isNaN(precio) || isNaN(cantidad) || isNaN(id_imagen) || isNaN(cod_estilo) || isNaN(cod_talla) || isNaN(id_empresa)) {
      return mostrarAlerta("Campos incompletos", "Todos los campos son obligatorios", "warning");
    }

    const producto = {
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
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
      });

      if (!response.ok) throw new Error();

      mostrarAlerta("¡Registro exitoso!", "Producto registrado correctamente");
      e.target.reset();
      vistaPrevia.src = "";
      vistaPrevia.style.display = "none";
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error", "No se pudo registrar el producto", "error");
    }
  });
});
