import { crearTablaUsuarios } from "./tablaUsuarios.js";
import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();
  crearTablaUsuarios();


  // Evento de editar
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("editar")) {
      const fila = e.target.closest("tr");
      const celdas = fila.querySelectorAll("td");

      const usuario = {
        idUsuario: parseInt(celdas[0].textContent),
        nombre: celdas[1].textContent,
        correo: celdas[2].textContent,
        telefono: celdas[3].textContent,
        ciudad: celdas[4].textContent,
        rol: celdas[5].textContent
      };

      localStorage.setItem("usuarioEditar", JSON.stringify(u));
      window.location.href = "../html/editarUsuario.html";
    }
  });
});


