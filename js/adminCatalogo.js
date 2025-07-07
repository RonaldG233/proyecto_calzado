import { crearTablaUsuarios } from "./tablaUsuarios.js";

document.addEventListener("DOMContentLoaded", () => {
  crearTablaUsuarios();

  const iconoMenu = document.querySelector('.menuDesplegable');
  const menu = document.getElementById('menuDesplegable');

  iconoMenu.addEventListener('click', function (e) {
    e.preventDefault();
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });

  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !iconoMenu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

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

      localStorage.setItem("usuarioEditar", JSON.stringify(usuario));
      window.location.href = "../html/editarUsuario.html";
    }
  });
});



