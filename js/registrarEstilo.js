  import { componentes } from "./header_sidebar.js";

  document.addEventListener("DOMContentLoaded", () => {
    componentes();

    const formRegistrar = document.getElementById("formRegistrarEstilo");
    const formEditar = document.getElementById("formEditarEstilo");
    const formEliminar = document.getElementById("formEliminarEstilo");
    const formReactivar = document.getElementById("formReactivarEstilo");

    const inputNombre = document.getElementById("nombreEstilo");
    const selectEditar = document.getElementById("estilosEditar");
    const selectEliminar = document.getElementById("estilosEliminar");
    const selectReactivar = document.getElementById("estilosReactivar");

    const btnEditar = document.getElementById("btnEditar");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnReactivar = document.getElementById("btnReactivar");

    let estilosCache = [];

    function mostrarMensaje(titulo, texto, icono = "info") {
      Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: "Aceptar",
      });
    }

    async function cargarEstilos() {
      try {
        // Trae estilos activos e inactivos por separado
        const resActivos = await fetch("http://localhost:8080/proyectoCalzado/api/estilos/activas");
        const activos = await resActivos.json();

        const resInactivos = await fetch("http://localhost:8080/proyectoCalzado/api/estilos/inactivas");
        const inactivos = await resInactivos.json();

        estilosCache = activos.concat(inactivos);

        // Llena selects para editar e inactivar solo con estilos activos
        [selectEditar, selectEliminar].forEach((select) => {
          select.innerHTML = '<option value="">-- Selecciona un estilo --</option>';
          activos.forEach((e) => {
            const option = document.createElement("option");
            option.value = e.codEstilo;
            option.textContent = e.nombre_estilo;
            select.appendChild(option);
          });
        });

        // Llena select para reactivar solo con estilos inactivos
        if (selectReactivar) {
          selectReactivar.innerHTML = '<option value="">-- Selecciona un estilo --</option>';
          inactivos.forEach((e) => {
            const option = document.createElement("option");
            option.value = e.codEstilo;
            option.textContent = e.nombre_estilo;
            selectReactivar.appendChild(option);
          });
        }
      } catch (error) {
        console.error(error);
        mostrarMensaje("Error", "No se pudieron cargar los estilos.", "error");
      }
    }

    // Registrar nuevo estilo con validación de duplicados
    formRegistrar?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = inputNombre.value.trim();
      if (!nombre) {
        mostrarMensaje("Campo vacío", "Debe ingresar un nombre de Estilo.", "warning");
        return;
      }
      if (estilosCache.some((e) => e.nombre_estilo.toLowerCase() === nombre.toLowerCase())) {
        mostrarMensaje("Nombre duplicado", "Ya existe un estilo con ese nombre.", "warning");
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/proyectoCalzado/api/estilos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre_estilo: nombre }),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("¡Éxito!", "Estilo registrado correctamente.", "success");
        formRegistrar.reset();
        cargarEstilos();
      } catch {
        mostrarMensaje("Error", "No se pudo registrar el estilo.", "error");
      }
    });

    // Editar estilo con validación y verificación de relación
    btnEditar?.addEventListener("click", async () => {
      const idEstilo = selectEditar.value;
      if (!idEstilo) {
        mostrarMensaje("Atención", "Seleccione un estilo a editar.", "warning");
        return;
      }
      const nuevoNombre = document.getElementById("nuevoNombreEstilo").value.trim();
      if (!nuevoNombre) {
        mostrarMensaje("Campo vacío", "Debe ingresar un nuevo nombre para el estilo.", "warning");
        return;
      }
      if (estilosCache.some((e) => e.nombre_estilo.toLowerCase() === nuevoNombre.toLowerCase() && e.codEstilo != idEstilo)) {
        mostrarMensaje("Nombre duplicado", "Ya existe otro estilo con ese nombre.", "warning");
        return;
      }

      try {
        const relRes = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}/tienerelacion`);
        if (!relRes.ok) throw new Error("No se pudo verificar relación");
        const data = await relRes.json();

        const tieneRelacion = (data.tieneRelacion === true || data.tieneRelacion === "true");
        if (tieneRelacion) {
          mostrarMensaje("Error", "No se puede editar un estilo que tiene productos relacionados.", "error");
          return;
        }

        const res = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre_estilo: nuevoNombre }),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("¡Éxito!", "Estilo actualizado correctamente.", "success");
        document.getElementById("nuevoNombreEstilo").value = "";
        selectEditar.value = "";
        cargarEstilos();
      } catch (error) {
        console.error(error);
        mostrarMensaje("Error", "No se pudo actualizar el estilo.", "error");
      }
    });

    // Inactivar estilo con confirmación
    btnEliminar?.addEventListener("click", async () => {
      const idEstilo = selectEliminar.value;
      if (!idEstilo) {
        mostrarMensaje("Atención", "Seleccione un estilo para inactivar.", "warning");
        return;
      }

      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción inactivará el estilo seleccionado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, inactivar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) return;

      try {
        const res = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}/inactivar`, {
          method: "PUT",
        });
        if (res.ok) {
          mostrarMensaje("Éxito", "Estilo inactivado correctamente.", "success");
          cargarEstilos();
        } else if (res.status === 409) {
          const errorMsg = await res.text();
          mostrarMensaje("Error", errorMsg, "error");
        } else {
          throw new Error("Error desconocido");
        }
      } catch (error) {
        console.error(error);
        mostrarMensaje("Error", "No se pudo inactivar el estilo.", "error");
      }
    });

    // Reactivar estilo
    btnReactivar?.addEventListener("click", async () => {
      const idEstilo = selectReactivar.value;
      if (!idEstilo) {
        mostrarMensaje("Atención", "Seleccione un estilo para reactivar.", "warning");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}/reactivar`, {
          method: "PUT",
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("¡Éxito!", "Estilo reactivado correctamente.", "success");
        selectReactivar.value = "";
        cargarEstilos();
      } catch {
        mostrarMensaje("Error", "No se pudo reactivar el estilo.", "error");
      }
    });

    cargarEstilos();
  });
