import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { confirmar, success, error, info } from "../../../helpers/alertas.js";
import { get, post, put } from "../../../helpers/api.js";

export const pagoController = () => {
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

  // Formularios y campos
  const formRegistrar = document.getElementById("formRegistrarPago");
  const selectEditar = document.getElementById("pagoEditar");
  const selectInactivar = document.getElementById("pagoInactivar");
  const selectReactivar = document.getElementById("pagoReactivar");

  const inputNombre = document.getElementById("nombrePago");
  const inputNuevoNombre = document.getElementById("nuevoNombrePago");

  const btnEditar = document.getElementById("btnEditar");
  const btnInactivar = document.getElementById("btnInactivar");
  const btnReactivar = document.getElementById("btnReactivar");

  let listaPagos = [];

  // ------------------ AUX ------------------
  const limpiarSelect = (select) => {
    select.innerHTML = "<option value=''>-- Seleccione un método --</option>";
  };

  // ------------------ CARGAR PAGOS ------------------
  const cargarPagos = async () => {
    try {
      const activos = await get("pagos/activas");
      const inactivos = await get("pagos/inactivas");
      listaPagos = [...activos, ...inactivos];

      [selectEditar, selectInactivar].forEach(sel => {
        limpiarSelect(sel);
        activos.forEach(p => sel.add(new Option(p.metodo_pago, p.id_pago)));
      });

      limpiarSelect(selectReactivar);
      inactivos.forEach(p => selectReactivar.add(new Option(p.metodo_pago, p.id_pago)));

    } catch (err) {
      error("Error al cargar métodos de pago.");
      console.error(err);
    }
  };

// ------------------ REGISTRAR ------------------
formRegistrar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();

  if (!nombre) return error("Debes ingresar un nombre.");

  // ✅ Validar duplicados
  if (listaPagos.some(p => p.metodo_pago.toLowerCase() === nombre.toLowerCase())) {
    return info("Duplicado", "Ese método de pago ya existe.");
  }

  try {
    const res = await post("pagos", { metodo_pago: nombre, id_estado: 1 });

    if (res.status === 201) {
      await success("Método registrado correctamente.");
      formRegistrar.reset();
      cargarPagos();
    } else {
      error("Error al registrar el método.");
    }
  } catch (err) {
    error("Error en la solicitud.");
    console.error(err);
  }
});


  // ------------------ EDITAR ------------------
  selectEditar.addEventListener("change", () => {
    const pago = listaPagos.find(p => p.id_pago == selectEditar.value);
    inputNuevoNombre.value = pago ? pago.metodo_pago : "";
  });

// ------------------ EDITAR ------------------
btnEditar.addEventListener("click", async () => {
  const id = selectEditar.value;
  const nuevoNombre = inputNuevoNombre.value.trim();

  if (!id || !nuevoNombre) return error("Selecciona un método y escribe un nombre.");

  // ✅ Validar duplicados, ignorando el mismo registro que se edita
  if (listaPagos.some(p => p.metodo_pago.toLowerCase() === nuevoNombre.toLowerCase() && p.id_pago != id)) {
    return info("Duplicado", "Ya existe otro método de pago con ese nombre.");
  }

  const confirmResp = await confirmar(`editar el método "${nuevoNombre}"`);
  if (!confirmResp.isConfirmed) return;

  try {
    const res = await put(`pagos/${id}`, { metodo_pago: nuevoNombre });

    if (res.ok) {
      await success("Método actualizado correctamente.");
      selectEditar.value = "";
      inputNuevoNombre.value = "";
      cargarPagos();
    } else {
      error("No se pudo actualizar el método.");
    }
  } catch (err) {
    error("Error al actualizar el método.");
    console.error(err);
  }
});

  // ------------------ INACTIVAR ------------------
  btnInactivar.addEventListener("click", async () => {
    const id = selectInactivar.value;
    if (!id) return;

    const confirmResp = await confirmar("inactivar el método de pago");
    if (!confirmResp.isConfirmed) return;

    try {
      const res = await put(`pagos/inactivar/${id}`);
      if (res.ok) {
        await success("Método inactivado correctamente.");
        selectInactivar.value = "";
        cargarPagos();
      } else {
        error("No se pudo inactivar el método.");
      }
    } catch (err) {
      error("Error al inactivar el método.");
      console.error(err);
    }
  });

  // ------------------ REACTIVAR ------------------
  btnReactivar.addEventListener("click", async () => {
    const id = selectReactivar.value;
    if (!id) return;

    try {
      const res = await put(`pagos/reactivar/${id}`);
      if (res.ok) {
        await success("Método reactivado correctamente.");
        selectReactivar.value = "";
        cargarPagos();
      } else {
        error("No se pudo reactivar el método.");
      }
    } catch (err) {
      error("Error al reactivar el método.");
      console.error(err);
    }
  });

  // ------------------ INICIALIZAR ------------------
  cargarPagos();
};
