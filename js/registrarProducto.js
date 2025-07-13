document.addEventListener("DOMContentLoaded", () => {
  const estiloSelect = document.getElementById("estiloProducto");
  const tallaSelect = document.getElementById("tallaProducto");
  const empresaSelect = document.getElementById("empresaProducto");
  const mensaje = document.getElementById("mensajeProducto");

  const mostrarMensaje = (texto, color = "green") => {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  };

  async function cargarOpciones() {
    try {
      const [estilos, tallas, empresas] = await Promise.all([
        fetch("http://localhost:8080/proyectoCalzado/api/estilos").then(r => r.json()),
        fetch("http://localhost:8080/proyectoCalzado/api/tallas").then(r => r.json()),
        fetch("http://localhost:8080/proyectoCalzado/api/empresas").then(r => r.json())
      ]);

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
    } catch (err) {
      console.error("Error cargando selects:", err);
    }
  }

  cargarOpciones();

  document.getElementById("formRegistrarProducto").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const precio = parseFloat(document.getElementById("precioProducto").value);
    const imagenFile = document.getElementById("imagenProducto").files[0];
    const cod_estilo = parseInt(estiloSelect.value);
    const cod_talla = parseInt(tallaSelect.value);
    const id_empresa = parseInt(empresaSelect.value);

    if (!imagenFile) {
      return mostrarMensaje("Debe seleccionar una imagen", "red");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const imagenBase64 = reader.result.split(',')[1]; // solo base64

      const producto = {
        nombre_producto: nombre,
        descripcion_producto: descripcion,
        precio_producto: precio,
        imagen_producto: atob(imagenBase64), // convertir base64 a bytes
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

        mostrarMensaje("Producto registrado correctamente.");
        e.target.reset();
      } catch (error) {
        console.error(error);
        mostrarMensaje("Error al registrar producto", "red");
      }
    };

    reader.readAsDataURL(imagenFile);
  });
});
