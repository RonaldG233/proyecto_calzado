import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  // Carga header y sidebar (si usas ese módulo)
  componentes();

  // Referencias a formularios
  const formRegistrar = document.getElementById("formRegistrarCiudad");
  const formEditar = document.getElementById("formEditarCiudad");
  const formEliminar = document.getElementById("formEliminarCiudad");
  const formReactivar = document.getElementById("formReactivarCiudad");

  // Inputs y selects
  const inputNombre = document.getElementById("nombreCiudad");
  const selectEditar = document.getElementById("ciudadesEditar");
  const inputNuevoNombre = document.getElementById("nuevoNombreCiudad");
  const selectEliminar = document.getElementById("ciudadesEliminar");
  const selectReactivar = document.getElementById("ciudadesReactivar");

  // Botones
  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");
  const btnReactivar = document.getElementById("btnReactivar");

  const API_URL = "http://localhost:8080/proyectoCalzado/api/ciudades";

  // Cargar ciudades activas e inactivas y llenar selects
  async function cargarCiudades() {
    try {
      // Activas para editar y eliminar
      const resActivas = await fetch(`${API_URL}/activas`);
      const activas = await resActivas.json();

      // Inactivas para reactivar
      const resInactivas = await fetch(`${API_URL}/inactivas`);
      const inactivas = await resInactivas.json();

      // Limpia selects
      [selectEditar, selectEliminar].forEach(select => {
        select.innerHTML = `<option value="">-- Selecciona una ciudad --</option>`;
      });
      selectReactivar.innerHTML = `<option value="">-- Selecciona una ciudad --</option>`;

      // Llena activas
      activas.forEach(ciudad => {
        const option1 = document.createElement("option");
        option1.value = ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad;
        option1.textContent = ciudad.nombre_ciudad;

        selectEditar.appendChild(option1.cloneNode(true));
        selectEliminar.appendChild(option1.cloneNode(true));
      });

      // Llena inactivas
      inactivas.forEach(ciudad => {
        const option = document.createElement("option");
        option.value = ciudad.codCiudad ?? ciudad.id_ciudad ?? ciudad.cod_ciudad;
        option.textContent = ciudad.nombre_ciudad;
        selectReactivar.appendChild(option);
      });
    } catch (error) {
      console.error("Error cargando ciudades:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar ciudades",
        text: "Intenta recargar la página",
      });
    }
  }

  // REGISTRAR CIUDAD (POST)
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (!nombre) {
      return Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Debe ingresar un nombre de ciudad.",
      });
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nombre }),
      });

      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Ciudad registrada",
          text: "La ciudad fue agregada correctamente.",
        });
        formRegistrar.reset();
        cargarCiudades();
      } else if (res.status === 409) {
        const text = await res.text();
        Swal.fire({
          icon: "warning",
          title: "Conflicto",
          text: text || "Ya existe una ciudad con ese nombre.",
        });
      } else if (res.status === 400) {
        const text = await res.text();
        Swal.fire({
          icon: "warning",
          title: "Error de validación",
          text: text || "Nombre inválido.",
        });
      } else {
        throw new Error("Error inesperado");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la ciudad.",
      });
      console.error(error);
    }
  });
function soloLetras(texto) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
}

  // EDITAR CIUDAD (PUT)
  btnEditar.addEventListener("click", async () => {
    const idCiudad = selectEditar.value;
  const nuevoNombre = inputNuevoNombre.value.trim();

  if (!idCiudad) {
    return Swal.fire({
      icon: "warning",
      title: "Sin selección",
      text: "Seleccione una ciudad para editar.",
    });
  }

  if (!nuevoNombre) {
    return Swal.fire({
      icon: "warning",
      title: "Campo vacío",
      text: "Debe ingresar un nuevo nombre para la ciudad.",
    });
  }

  // Validación solo letras
  if (!soloLetras(nuevoNombre)) {
    return Swal.fire({
      icon: "warning",
      title: "Nombre inválido",
      text: "El nombre solo puede contener letras y espacios.",
    });
  }

    try {
      // Validar duplicado antes (opcional)
      const resLista = await fetch(API_URL);
      const lista = await resLista.json();
      const existe = lista.some(c => 
        c.nombre_ciudad.toLowerCase() === nuevoNombre.toLowerCase() &&
        c.codCiudad != idCiudad
      );
      if (existe) {
        return Swal.fire({
          icon: "warning",
          title: "Nombre duplicado",
          text: "Ya existe una ciudad con ese nombre.",
        });
      }

      const res = await fetch(`${API_URL}/${idCiudad}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nuevoNombre }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Ciudad actualizada",
          text: "El nombre fue actualizado correctamente.",
        });
        inputNuevoNombre.value = "";
        cargarCiudades();
      } else if (res.status === 403) {
        const text = await res.text();
        Swal.fire({
          icon: "warning",
          title: "Prohibido",
          text: text || "No se puede editar una ciudad con usuarios relacionados.",
        });
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la ciudad.",
      });
      console.error(error);
    }
  });

  // INACTIVAR CIUDAD (PUT)
  btnEliminar.addEventListener("click", async () => {
  const idCiudad = selectEliminar.value;
  if (!idCiudad) {
    return Swal.fire({
      icon: "warning",
      title: "Sin selección",
      text: "Seleccione una ciudad para inactivar.",
    });
  }

  const confirm = await Swal.fire({
    icon: "warning",
    title: "¿Inactivar ciudad?",
    text: "La ciudad quedará inactiva, pero no se eliminará de la base de datos.",
    showCancelButton: true,
    confirmButtonText: "Sí, inactivar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/${idCiudad}/inactivar`, {
      method: "PUT",
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Ciudad inactivada",
        text: "La ciudad fue marcada como inactiva.",
      });
      cargarCiudades();
    } else if (res.status === 403) {
      const text = await res.text();  // Aquí capturas el mensaje enviado desde el backend
      Swal.fire({
        icon: "warning",
        title: "Prohibido",
        text: text || "No se puede inactivar una ciudad con usuarios relacionados.",
      });
    } else {
      throw new Error("Error al inactivar");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo inactivar la ciudad.",
    });
    console.error(error);
  }
  });

  // REACTIVAR CIUDAD (PUT)
  btnReactivar.addEventListener("click", async () => {
    const idCiudad = selectReactivar.value;
    if (!idCiudad) {
      return Swal.fire({
        icon: "warning",
        title: "Sin selección",
        text: "Seleccione una ciudad para reactivar.",
      });
    }

    try {
      const res = await fetch(`${API_URL}/${idCiudad}/reactivar`, {
        method: "PUT",
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Ciudad reactivada",
          text: "La ciudad ahora está activa nuevamente.",
        });
        cargarCiudades();
      } else {
        throw new Error("Error al reactivar");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo reactivar la ciudad.",
      });
      console.error(error);
    }
  });

  // Al cargar la página, carga las ciudades
  cargarCiudades();
});
