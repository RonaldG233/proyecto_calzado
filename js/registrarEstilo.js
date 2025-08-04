  import { componentes } from "./header_sidebar.js";

  document.addEventListener("DOMContentLoaded", () => {
    componentes();

    const formRegistrar = document.getElementById("formRegistrarEstilo");
    const formEditar = document.getElementById("formEditarEstilo");
    const formEliminar = document.getElementById("formEliminarEstilo");

    const inputNombre = document.getElementById("nombreEstilo");
    const selectEditar = document.getElementById("estilosEditar");
    const selectEliminar = document.getElementById("estilosEliminar");

    const btnEditar = document.getElementById("btnEditar");
    const btnEliminar = document.getElementById("btnEliminar");

    let estilosCache = [];

    // Función para mostrar mensajes con SweetAlert2
    function mostrarMensaje(titulo, texto, icono = "info") {
      Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: "Aceptar",
      });
    }

    // Cargar estilos en selects y guardar en cache
    async function cargarEstilos() {
      try {
        const response = await fetch("http://localhost:8080/proyectoCalzado/api/estilos");
        if (!response.ok) throw new Error("Error al cargar estilos");
        const estilos = await response.json();

        estilosCache = estilos; // guardar para validaciones

        [selectEditar, selectEliminar].forEach((select) => {
          select.innerHTML = '<option value="">-- Selecciona un estilo --</option>';
          estilos.forEach((estilo) => {
            const option = document.createElement("option");
            option.value = estilo.codEstilo;
            option.textContent = estilo.nombre_estilo;
            select.appendChild(option);
          });
        });
      } catch (error) {
        console.error("Error al cargar estilos:", error);
        mostrarMensaje("Error", "No se pudieron cargar los estilos.", "error");
      }
    }

    // REGISTRAR ESTILO
    formRegistrar.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = inputNombre.value.trim();

      if (!nombre) {
        mostrarMensaje("Campo vacío", "Debe ingresar un nombre de Estilo.", "warning");
        return;
      }

      // Validar que no exista ya un estilo con ese nombre
      const existe = estilosCache.some(e => e.nombre_estilo.toLowerCase() === nombre.toLowerCase());
      if (existe) {
        mostrarMensaje("Nombre duplicado", "Ya existe un estilo con ese nombre.", "warning");
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/proyectoCalzado/api/estilos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre_estilo: nombre }),
        });

        if (!response.ok) throw new Error();

        mostrarMensaje("¡Éxito!", "Estilo registrado correctamente.", "success");
        formRegistrar.reset();
        await cargarEstilos();
      } catch (error) {
        mostrarMensaje("Error", "No se pudo registrar el estilo.", "error");
      }
    });

    // EDITAR ESTILO
    btnEditar.addEventListener("click", async () => {
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

      // Validar que no exista otro estilo con ese nombre (distinto al actual)
      const existeOtro = estilosCache.some(e => e.nombre_estilo.toLowerCase() === nuevoNombre.toLowerCase() && e.codEstilo != idEstilo);
      if (existeOtro) {
        mostrarMensaje("Nombre duplicado", "Ya existe otro estilo con ese nombre.", "warning");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre_estilo: nuevoNombre }),
        });

        if (!response.ok) throw new Error();

        mostrarMensaje("¡Éxito!", "Estilo actualizado correctamente.", "success");
        document.getElementById("nuevoNombreEstilo").value = "";
        selectEditar.value = "";
        await cargarEstilos();
      } catch (error) {
        mostrarMensaje("Error", "No se pudo actualizar el estilo.", "error");
      }
    });

    // ELIMINAR ESTILO
    btnEliminar.addEventListener("click", async () => {
      const idEstilo = selectEliminar.value;
      if (!idEstilo) {
        mostrarMensaje("Atención", "Seleccione un estilo a eliminar.", "warning");
        return;
      }

      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará el estilo seleccionado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) return;

      try {
        const response = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error();

        mostrarMensaje("¡Éxito!", "Estilo eliminado correctamente.", "success");
        selectEliminar.value = "";
        await cargarEstilos();
      } catch (error) {
        mostrarMensaje("Error", "No se pudo eliminar el estilo.", "error");
      }
    });

    // Cargar estilos al iniciar
    cargarEstilos();
  });
