document.addEventListener("DOMContentLoaded", () => {
  const formRegistrar = document.getElementById("formRegistrarEstilo");
  const formEditar = document.getElementById("formEditarEstilo");
  const formEliminar = document.getElementById("formEliminarEstilo");

  const inputNombre = document.getElementById("nombreEstilo");
  const selectEditar = document.getElementById("estilosEditar");
  const selectEliminar = document.getElementById("estilosEliminar");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");

  const mensaje = document.getElementById("mensajeEstilo");

  // Cargar ciudades en selects
  async function cargarEstilos() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/estilos");
      const estilos = await response.json();

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
    }
  }

  // Mostrar mensaje
  function mostrarMensaje(texto, color = "white") {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }

  // REGISTRAR CIUDAD
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) {
      return mostrarMensaje("Debe ingresar un nombre de Estilo.", "red");
    }

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/estilos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_estilo: nombre }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Estilo registrado correctamente.", "green");
      formRegistrar.reset();
      cargarEstilos();
    } catch (error) {
      mostrarMensaje("Error al registrar el estilo.", "red");
    }
  });

  // EDITAR CIUDAD
  btnEditar.addEventListener("click", async () => {
    const idEstilo = selectEditar.value;
    if (!idEstilo) return mostrarMensaje("Seleccione un estilo a editar.", "red");

    const nuevoNombre = document.getElementById("nuevoNombreEstilo").value.trim();
if (!nuevoEstilo) {
  return mostrarMensaje("Debe ingresar un nuevo nombre para el estilo.", "red");
}


    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_estilo: nuevoNombre.trim() }),
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Estilo actualizado correctamente.", "green");
      cargarEstilos();
    } catch (error) {
      mostrarMensaje("Error al actualizar el estilo.", "red");
    }
  });

  // ELIMINAR CIUDAD
  btnEliminar.addEventListener("click", async () => {
    const idEstilo = selectEliminar.value;
    if (!idEstilo) return mostrarMensaje("Seleccione un estilo a eliminar.", "red");

    const confirmar = confirm("¿Estás seguro de que deseas eliminar este estilo?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/estilos/${idEstilo}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      mostrarMensaje("Estilo eliminado correctamente.", "green");
      cargarEstilos();
    } catch (error) {
      mostrarMensaje("Error al eliminar el estilo.", "red");
    }
  });

  // Cargar ciudades al iniciar
  cargarEstilos();
});
