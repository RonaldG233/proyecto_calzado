import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { crearTablaUsuarios } from "../../../Modules/modules.js";
import { isTokenExpired, refreshAccessToken } from "../../../helpers/api.js";

export const usuarioController = async () => {
  localStorage.removeItem("usuarioEditar");
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const mainContainer = document.querySelector("main.usuarios");

  

  if (!headerContainer || !sidebarContainer || !mainContainer) {
    return console.error("Contenedores no encontrados");
  }

  // Verificar token antes de mostrar la vista
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired()) {
    const nuevoToken = await refreshAccessToken();
    if (!nuevoToken) {
      window.location.hash = "#login";
      return;
    }
  }

  // Insertar header y sidebar
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  const btnHamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (btnHamburger && sidebar) {
    btnHamburger.addEventListener("click", () => {
      sidebar.classList.toggle("activo");
    });

    // Opcional: cerrar sidebar al dar click en un link
    sidebar.querySelectorAll(".sidebar-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("activo");
      });
    });
  }

  // Cargar tabla de usuarios
  crearTablaUsuarios();

  // Delegación de eventos para editar
  mainContainer.addEventListener("click", (e) => {
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
      // localStorage.setItem("usuarioEditar", JSON.stringify(usuario));
      // window.location.hash = "#editarUsuario"; // Cambié a hash SPA
    }
  });
};
