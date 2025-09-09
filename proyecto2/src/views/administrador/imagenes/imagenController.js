import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarNombre } from "../../../Modules/validaciones.js";
import { success, error, info } from "../../../helpers/alertas.js";
import { post } from "../../../helpers/api.js";

export const imagenController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  

  // Cargar header y sidebar
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

  // Formulario e inputs
  const formRegistrar = document.getElementById("formularioImagen");
  const inputNombre = document.getElementById("nombreImagen");
  const inputArchivo = document.getElementById("archivo");

  // REGISTRAR IMAGEN
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreImagen = inputNombre.value.trim();
    const archivo = inputArchivo.files[0];

    // 🔹 Validaciones locales
    if (!validarNombre(inputNombre)) return;

    if (!archivo) {
      return info("Archivo faltante", "Por favor selecciona un archivo.");
    }

    if (!archivo.type.startsWith("image/")) {
      return error("Archivo no válido", "Solo se permiten archivos de imagen.");
    }

    if (archivo.size > 5 * 1024 * 1024) {
      return error("Archivo muy grande", "El archivo es demasiado grande (máx 5MB).");
    }

    // 🔹 Validar si el nombre ya existe consultando la API
    try {
      const resVerif = await fetch(
        `http://localhost:8080/proyectoCalzado/api/imagenes/verificar-nombre?nombre=${encodeURIComponent(nombreImagen)}`
      );

      if (!resVerif.ok) throw new Error("Error al verificar nombre");
      const data = await resVerif.json();

      if (data.exists) {
        return info("Nombre duplicado", "Ya existe una imagen con ese nombre. Elige otro.");
      }
    } catch (err) {
      console.error("Error al verificar nombre:", err);
      return error("Error de conexión", "No se pudo verificar el nombre de la imagen.");
    }

    // 🔹 Subir imagen
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombrePersonalizado", nombreImagen);

    try {
      const res = await fetch(
        "http://localhost:8080/proyectoCalzado/api/imagenes/subir",
        {
          method: "POST",
          body: formData,
        }
      );

      const texto = await res.text();

      if (res.ok) {
        await success("Imagen subida correctamente.");
        formRegistrar.reset();
      } else {
        error("Error al subir", texto || "No se pudo subir la imagen.");
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      error("Error de conexión", "No se pudo conectar con el servidor.");
    }
  });
};
