// Cambia el idPedido que quieres consultar
const idPedido = 1;

// URL del endpoint REST (ajusta según tu ruta base y puerto)
const url = `http://localhost:8080/proyectoCalzado/detalle-pedido/${idPedido}`;

async function mostrarDetalles() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener los detalles: ' + response.status);
        }

        // Obtiene la lista de detalles en formato JSON
        const detallesPedido = await response.json();

        const tbody = document.querySelector("#tablaDetalles tbody");
        tbody.innerHTML = ""; // Limpia contenido previo

        detallesPedido.forEach(detalle => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${detalle.idDetalle}</td>
                <td>${detalle.nombreProducto}</td>
                <td>${detalle.cantidad}</td>
                <td>$${parseFloat(detalle.precioUnitario).toFixed(2)}</td>
                <td>${detalle.fechaHoraPedido}</td>
                <td>${detalle.nombreUsuario}</td>
                <td>${detalle.metodoPago}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        alert("Hubo un error al cargar los detalles del pedido.");
    }
}

document.addEventListener("DOMContentLoaded", mostrarDetalles);
