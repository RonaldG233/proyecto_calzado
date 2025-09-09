import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { confirmar, success, error } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const tallaController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

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

  const formRegistrar = document.getElementById("formRegistrarTalla");
  const selectEditar = document.getElementById("tallaEditar");
  const selectInactivar = document.getElementById("tallaInactivar");
  const selectActivar = document.getElementById("tallaActivar");
  const inputNombre = document.getElementById("nombreTalla");
  const inputNuevoNombre = document.getElementById("nuevoNombreTalla");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnActivar = document.getElementById("btnActivar");

  // ------------------ CARGAR TALLAS ------------------
  async function cargarTallas() {
    try {
      const activas = await get("tallas/activas");
      const inactivas = await get("tallas/inactivas");

      [selectEditar, selectInactivar, selectActivar].forEach(sel => {
        sel.innerHTML = `<option value="">-- Selecciona una talla --</option>`;
      });

      activas.forEach(talla => {
        const option = new Option(talla.numero_talla, talla.codTalla ?? talla.id_talla ?? talla.cod_talla);
        selectEditar.add(option.cloneNode(true));
        selectInactivar.add(option.cloneNode(true));
      });

      inactivas.forEach(talla => {
        const option = new Option(talla.numero_talla, talla.codTalla ?? talla.id_talla ?? talla.cod_talla);
        selectActivar.add(option);
      });
    } catch (err) {
      error("Error al cargar tallas. Intenta nuevamente.");
      console.error(err);
    }
  }

  // ------------------ REGISTRAR TALLA ------------------
  // ------------------ REGISTRAR TALLA ------------------
formRegistrar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = inputNombre.value.trim();

  if (!numero) return;

  try {
    // Primero verificamos si la talla ya existe
    const todas = await get("tallas"); // traer todas
    if (todas.some(t => t.numero_talla === numero)) {
      return error("Ya existe una talla con ese número."); // SweetAlert
    }

    const res = await post("tallas", { numero_talla: Number(numero) });
    if (res.status === 201) {
      await success("Talla registrada correctamente.");
      formRegistrar.reset();
      cargarTallas();
    } else {
      error("Error al registrar la talla.");
    }
  } catch (err) {
    error("Error en la solicitud.");
    console.error(err);
  }
});

// ------------------ EDITAR TALLA ------------------
// ------------------ EDITAR TALLA ------------------
btnEditar.addEventListener("click", async () => {
  const idTalla = selectEditar.value;
  const nuevoNumero = inputNuevoNombre.value.trim();
  const numeroActual = selectEditar.options[selectEditar.selectedIndex]?.text;

  if (!idTalla || !nuevoNumero) return;

  try {
    // Verificar si la talla está asociada
    const rel = await get(`tallas/${idTalla}/tienerelacion`);
    if (rel.tieneRelacion) {
      return error("No se puede editar una talla que ya está asociada a productos.");
    }

    // Verificar si el nuevo número ya existe en otra talla
    const todas = await get("tallas");
    if (todas.some(t => t.numero_talla === nuevoNumero && t.codTalla != idTalla)) {
      return error("No se puede cambiar a una talla que ya está registrada.");
    }

    const confirmResp = await confirmar(`editar la talla "${numeroActual}" a "${nuevoNumero}"`);
    if (!confirmResp.isConfirmed) return;

    const res = await put(`tallas/${idTalla}`, { numero_talla: Number(nuevoNumero) });
    if (res.ok) {
      await success("Talla actualizada correctamente.");
      inputNuevoNombre.value = "";
      selectEditar.value = "";
      cargarTallas();
    } else {
      error("No se pudo actualizar la talla.");
    }
  } catch (err) {
    error("Error al actualizar la talla.");
    console.error(err);
  }
});


// ------------------ INACTIVAR TALLA ------------------
btnInactivar.addEventListener("click", async () => {
  const idTalla = selectInactivar.value;
  if (!idTalla) return;

  try {
    // Preguntar al backend si tiene relación
    const rel = await get(`tallas/${idTalla}/tienerelacion`);
    if (!rel || rel.tieneRelacion) {
      return error("No se puede inactivar una talla que está asociada a productos.");
    }

    const confirmResp = await confirmar("¿Seguro que deseas inactivar esta talla?");
    if (!confirmResp.isConfirmed) return;

    const res = await put(`tallas/${idTalla}/inactivar`);
    if (res.ok) {
      await success("Talla inactivada correctamente.");
      selectInactivar.value = "";
      cargarTallas();
    } else {
      error("No se pudo inactivar la talla.");
    }
  } catch (err) {
    error("Error al inactivar talla.");
    console.error(err);
  }
});



  // ------------------ REACTIVAR TALLA ------------------
  btnActivar.addEventListener("click", async () => {
    const idTalla = selectActivar.value;
    if (!idTalla) return;

    try {
      const res = await put(`tallas/${idTalla}/reactivar`);
      if (res.ok) {
        await success("Talla reactivada correctamente.");
        selectActivar.value = "";
        cargarTallas();
      } else {
        error("No se pudo reactivar la talla.");
      }
    } catch (err) {
      error("Error al reactivar talla.");
      console.error(err);
    }
  });

  // ------------------ INICIALIZAR ------------------
  cargarTallas();
};
