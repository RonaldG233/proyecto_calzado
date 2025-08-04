

document.addEventListener("DOMContentLoaded", async () => {
  

  const listaPedidos = document.getElementById("listaPedidos");

  try {
    const [pedidosRes, detallesRes, productosRes, imagenesRes] = await Promise.all([
      fetch("http://localhost:8080/proyectoCalzado/api/pedidos"),
      fetch("http://localhost:8080/proyectoCalzado/api/detalle-pedido"),
      fetch("http://localhost:8080/proyectoCalzado/api/productos"),
      fetch("http://localhost:8080/proyectoCalzado/api/imagenes")
    ]);

    const pedidos = await pedidosRes.json();
    const detalles = await detallesRes.json();
    const productos = await productosRes.json();
    const imagenes = await imagenesRes.json();

    if (pedidos.length === 0) {
      listaPedidos.innerHTML = "<p>No hay pedidos registrados.</p>";
      return;
    }

    pedidos.forEach(pedido => {
      const divPedido = document.createElement("div");
      divPedido.classList.add("pedido");

      const detallesPedido = detalles.filter(d => d.idPedido === pedido.idPedido);

      let htmlDetalles = "";

      detallesPedido.forEach(det => {
        const producto = productos.find(p => p.id_producto === det.idProducto);
        const imagen = imagenes.find(i => i.id_imagen === producto.id_imagen)?.nombre || "placeholder.jpg";

        htmlDetalles += `
          <div class="producto-pedido">
            <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imagen}" alt="${producto.nombre_producto}">
            <div>
              <h4>${producto.nombre_producto}</h4>
              <p>Cantidad: ${det.cantidad}</p>
              <p>Precio unitario: $${parseFloat(det.precioUnitario).toLocaleString()}</p>
              <p>Subtotal: $${(det.precioUnitario * det.cantidad).toLocaleString()}</p>
            </div>
          </div>
        `;
      });

      divPedido.innerHTML = `
        <h3>Pedido #${pedido.idPedido}</h3>
        <p>Fecha: ${pedido.fechaHora}</p>
        <p>Total pagado: $${parseFloat(pedido.valorPagoTotal).toLocaleString()}</p>
        <div class="detalles-pedido">${htmlDetalles}</div>
      `;

      listaPedidos.appendChild(divPedido);
    });

  } catch (error) {
    console.error("Error consultando pedidos:", error);
    listaPedidos.innerHTML = "<p>Error cargando los pedidos.</p>";
  }
});
