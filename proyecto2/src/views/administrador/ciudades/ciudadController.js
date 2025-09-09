import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const ciudadController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");
    // ================== TOGGLE SIDEBAR (RESPONSIVE) ==================
  


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

  // Referencias a inputs, selects y botones
  const formRegistrar = document.getElementById("formRegistrarCiudad");
  const inputNombre = document.getElementById("nombreCiudad");

  const selectEditar = document.getElementById("ciudadesEditar");
  const inputNuevoNombre = document.getElementById("nuevoNombreCiudad");
  const btnEditar = document.getElementById("btnEditar");

  const selectEliminar = document.getElementById("ciudadesEliminar");
  const btnEliminar = document.getElementById("btnEliminar");

  const selectReactivar = document.getElementById("ciudadesReactivar");
  const btnReactivar = document.getElementById("btnReactivar");

  // ------------------ FUNCIONES AUXILIARES ------------------
  const limpiarSelect = (select) => {
    select.innerHTML = "";
    select.add(new Option("-- Selecciona una ciudad --", ""));
  };

  // ------------------ CARGAR CIUDADES ------------------
  const cargarCiudades = async () => {
    try {
      const activas = await get("ciudades/activas");
      const inactivas = await get("ciudades/inactivas");

      [selectEditar, selectEliminar, selectReactivar].forEach(limpiarSelect);

      activas.forEach(ciudad => {
        const option = new Option(
          ciudad.nombre_ciudad,
          ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad
        );
        selectEditar.add(option.cloneNode(true));
        selectEliminar.add(option.cloneNode(true));
      });

      inactivas.forEach(ciudad => {
        const option = new Option(
          ciudad.nombre_ciudad,
          ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad
        );
        selectReactivar.add(option);
      });

    } catch (err) {
      error("Error al cargar ciudades. Intenta nuevamente.");
      console.error(err);
    }
  };

  // ------------------ REGISTRAR ------------------
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!inputNombre.value.trim()) {
      error("Debes ingresar un nombre de ciudad.");
      return;
    }

    try {
      const res = await post("ciudades", { nombre_ciudad: inputNombre.value.trim() });

      if (res.status === 201) {
        await success("Ciudad registrada correctamente.");
        inputNombre.value = "";
        await cargarCiudades();
      } else if (res.status === 409) {
        error("Ya existe una ciudad con ese nombre.");
      } else {
        error("Error al registrar ciudad.");
      }
    } catch (err) {
      error("Error en la solicitud.");
      console.error(err);
    }
  });

// ------------------ EDITAR ------------------
// ------------------ EDITAR ------------------
// ------------------ EDITAR ------------------
btnEditar.addEventListener("click", async () => {
  const idCiudad = selectEditar.value;
  const nuevoNombre = inputNuevoNombre.value.trim();
  const nombreActual = selectEditar.options[selectEditar.selectedIndex].text;

  if (!idCiudad) {
    return Swal.fire({
      icon: "warning",
      title: "Sin selección",
      text: "Debes seleccionar una ciudad para editar.",
    });
  }

  if (!nuevoNombre) {
    return Swal.fire({
      icon: "warning",
      title: "Campo vacío",
      text: "Debes ingresar un nuevo nombre para la ciudad.",
    });
  }

  // Validación solo letras
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nuevoNombre)) {
    return Swal.fire({
      icon: "warning",
      title: "Nombre inválido",
      text: "El nombre solo puede contener letras y espacios.",
    });
  }

  // Confirmación
  const confirmResp = await Swal.fire({
    title: `Editar ciudad`,
    text: `¿Editar la ciudad "${nombreActual}" a "${nuevoNombre}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, editar",
    cancelButtonText: "Cancelar",
  });
  if (!confirmResp.isConfirmed) return;

  try {
    const res = await put(`ciudades/${idCiudad}`, { nombre_ciudad: nuevoNombre });

    // Manejo de respuestas según status
    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "Ciudad actualizada",
        text: "El nombre fue actualizado correctamente.",
      });
      inputNuevoNombre.value = "";
      selectEditar.value = "";
      cargarCiudades();

    } else if (res.data && res.data.error) {
      // Mensaje enviado desde backend
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.data.error,
      });

    } else if (!res.ok && res.status === 403) {
      Swal.fire({
        icon: "warning",
        title: "Prohibido",
        text: "No se puede editar la ciudad porque está relacionada con otros registros.",
      });

    } else if (!res.ok && res.status === 409) {
      Swal.fire({
        icon: "warning",
        title: "Duplicado",
        text: "Ya existe una ciudad con ese nombre.",
      });

    } else if (!res.ok && res.status === 404) {
      Swal.fire({
        icon: "error",
        title: "No encontrada",
        text: "La ciudad que intentas editar no existe.",
      });

    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error en la solicitud al actualizar ciudad.",
      });
    }

  } catch (err) {
    console.error("Error al actualizar ciudad:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error en la solicitud al actualizar ciudad.",
    });
  }
});


// ------------------ INACTIVAR ------------------
btnEliminar.addEventListener("click", async () => {
  if (!selectEliminar.value) {
    error("Debes seleccionar una ciudad para inactivar.");
    return;
  }

  const idCiudad = selectEliminar.value;
  const nombreCiudad = selectEliminar.options[selectEliminar.selectedIndex].text;

  const confirmResp = await confirmar(`inactivar la ciudad "${nombreCiudad}"`);
  if (!confirmResp.isConfirmed) return;

  try {
    const res = await put(`ciudades/${idCiudad}/inactivar`);

    if (res.ok || res.status === 200) {
      await success(`Ciudad "${nombreCiudad}" inactivada.`);
      selectEliminar.value = "";
      cargarCiudades();

    } else if (res.status === 400) {
      // 🚨 Caso relacionada en otra entidad
      error(`No se puede inactivar la ciudad "${nombreCiudad}" porque está relacionada con otros registros.`);

    } else {
      error(`No se puede inactivar la ciudad "${nombreCiudad}" porque está relacionada con otros registros.`);
    }

  } catch (err) {
    error("Error al inactivar ciudad.");
    console.error(err);
  }
});


  // ------------------ REACTIVAR ------------------
  btnReactivar.addEventListener("click", async () => {
    if (!selectReactivar.value) {
      error("Debes seleccionar una ciudad para reactivar.");
      return;
    }

    const idCiudad = selectReactivar.value;
    const nombreCiudad = selectReactivar.options[selectReactivar.selectedIndex].text;

    const confirmResp = await confirmar(`reactivar la ciudad "${nombreCiudad}"`);
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`ciudades/${idCiudad}/reactivar`);
      if (res.ok || res.status === 200) {
        await success(`Ciudad "${nombreCiudad}" reactivada.`);
        selectReactivar.value = "";
        cargarCiudades();
      } else {
        error("No se pudo reactivar la ciudad.");
      }
    } catch (err) {
      error("Error al reactivar ciudad.");
      console.error(err);
    }
  });

  // ------------------ INICIALIZAR ------------------
  cargarCiudades();
};
