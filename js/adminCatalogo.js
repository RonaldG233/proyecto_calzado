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
});


