document.addEventListener("DOMContentLoaded", async () => {
  const main = document.querySelector(".pedido");

  const cargarUsuarios = async () => {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/usuarios");
    return await response.json();
  };

  const cargarPagos = async () => {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/pagos");
    return await response.json();
  };

  const crearFormulario = async () => {
    const usuarios = await cargarUsuarios();
    const pagos = await cargarPagos();

    main.innerHTML = `
      <h2>Registrar nuevo pedido</h2>
      <form id="formPedido">
        <label for="usuario">Usuario:</label>
        <select id="usuario" required>
          <option value="">Seleccione un usuario</option>
          ${usuarios.map(u => `<option value="${u.id_usuario}">${u.nombre}</option>`).join("")}
        </select>

        <label for="pago">Método de pago:</label>
        <select id="pago" required>
          <option value="">Seleccione método de pago</option>
          ${pagos.map(p => `<option value="${p.id_pago}">${p.metodo_pago}</option>`).join("")}
        </select>

        <label for="valor">Valor total del pedido:</label>
        <input type="number" id="valor" step="0.01" required>

        <button type="submit">Registrar Pedido</button>
      </form>
    `;

    document.getElementById("formPedido").addEventListener("submit", async (e) => {
      e.preventDefault();

      const pedido = {
        id_usuario: parseInt(document.getElementById("usuario").value),
        id_pago: parseInt(document.getElementById("pago").value),
        valor_pago_total: parseFloat(document.getElementById("valor").value),
        fecha_hora: new Date().toISOString().slice(0, 19).replace("T", " ")
      };

      const res = await fetch("http://localhost:8080/proyectoCalzado/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });

      if (res.ok) {
        alert("Pedido registrado con éxito.");
        document.getElementById("formPedido").reset();
      } else {
        alert("Error al registrar el pedido.");
      }
    });
  };

  crearFormulario();
});
