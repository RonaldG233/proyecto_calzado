document.addEventListener("DOMContentLoaded", async () => {
  const datos = JSON.parse(localStorage.getItem("productoDetalle"));
  const contenedor = document.getElementById("detalleProducto");

  if (!datos) {
    Swal.fire({
      icon: "error",
      title: "Producto no encontrado",
      text: "No se pudo cargar el detalle del producto.",
    });
    contenedor.innerHTML = "<p style='color:red;'>No se pudo cargar el producto.</p>";
    return;
  }

  try {
    const [imagenes, estilos, tallas, empresas] = await Promise.all([
      fetch("http://localhost:8080/proyectoCalzado/api/imagenes").then(r => r.json()),
      fetch("http://localhost:8080/proyectoCalzado/api/estilos").then(r => r.json()),
      fetch("http://localhost:8080/proyectoCalzado/api/tallas").then(r => r.json()),
      fetch("http://localhost:8080/proyectoCalzado/api/empresas").then(r => r.json())
    ]);

    const imagen = imagenes.find(i => i.id_imagen === datos.id_imagen)?.nombre || "placeholder.jpg";
    const estilo = estilos.find(e => e.codEstilo === datos.cod_estilo)?.nombre_estilo || datos.cod_estilo;
    const talla = tallas.find(t => t.codTalla === datos.cod_talla)?.numero_talla || datos.cod_talla;
    const empresa = empresas.find(emp => emp.idEmpresa === datos.id_empresa)?.nombre_empresa || datos.id_empresa;

    contenedor.innerHTML = `
      <div class="contenedor">
        <div class="encabezado">
          <img src="../img/Group 7.png" alt="Logo" class="logo">
          <h2>${datos.nombre_producto}</h2>
        </div>

        <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagen}" alt="Zapato" class="imagen-zapato">

        <div class="descripcion">
          <p>
            <strong>- Descripción:</strong> ${datos.descripcion_producto}<br>
            <strong>- Precio:</strong> $${parseInt(datos.precio_producto).toLocaleString()}<br>
            <strong>- Cantidad:</strong> ${datos.cantidad_producto}<br>
            <strong>- Estilo:</strong> ${estilo}<br>
            <strong>- Talla:</strong> ${talla}<br>
            <strong>- Empresa:</strong> ${empresa}<br>
          </p>
        </div>

        <div class="precio">
          <span>COP</span> <strong>$${parseInt(datos.precio_producto).toLocaleString()}</strong>
        </div>

        <div class="botones">
          <a href="#"><i class="ri-arrow-left-double-fill"></i></a>
        </div>
      </div>
    `;

    document.querySelector(".botones a").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });

  } catch (e) {
    console.error("Error mostrando detalles del producto:", e);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudieron cargar los detalles del producto.",
    });
    contenedor.innerHTML = "<p style='color:red;'>Error cargando los detalles del producto.</p>";
  }
});
