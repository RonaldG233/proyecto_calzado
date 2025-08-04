import { componentes } from "./header_sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  componentes();

  const formRegistrar = document.getElementById("formRegistrarCiudad");
  const formEditar = document.getElementById("formEditarCiudad");
  const formEliminar = document.getElementById("formEliminarCiudad");

  const inputNombre = document.getElementById("nombreCiudad");
  const selectEditar = document.getElementById("ciudadesEditar");
  const selectEliminar = document.getElementById("ciudadesEliminar");

  const btnEditar = document.getElementById("btnEditar");
  const btnEliminar = document.getElementById("btnEliminar");

  // Cargar ciudades en selects
  async function cargarCiudades() {
    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
      const ciudades = await response.json();

      [selectEditar, selectEliminar].forEach((select) => {
        select.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';
        ciudades.forEach((ciudad) => {
          const option = document.createElement("option");
          option.value = ciudad.codCiudad;
          option.textContent = ciudad.nombre_ciudad;
          select.appendChild(option);
        });
      });
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar ciudades',
        text: 'Intenta recargar la página.',
      });
    }
  }

  // REGISTRAR CIUDAD
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Debe ingresar un nombre de ciudad.',
      });
    }

    try {
      const response = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_ciudad: nombre }),
      });

      if (!response.ok) throw new Error();

      await Swal.fire({
        icon: 'success',
        title: 'Ciudad registrada',
        text: 'La ciudad ha sido agregada correctamente.',
      });

      formRegistrar.reset();
      cargarCiudades();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la ciudad.',
      });
    }
  });

  // EDITAR CIUDAD
  btnEditar.addEventListener("click", async () => {
  const idCiudad = selectEditar.value;
  const nuevoNombre = document.getElementById("nuevoNombreCiudad").value.trim();

  if (!idCiudad) {
    return Swal.fire({
      icon: 'warning',
      title: 'Sin selección',
      text: 'Seleccione una ciudad para editar.',
    });
  }

  if (!nuevoNombre) {
    return Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'Debe ingresar un nuevo nombre para la ciudad.',
    });
  }

  try {
    // Obtener todas las ciudades para validar duplicados
    const responseCiudades = await fetch("http://localhost:8080/proyectoCalzado/api/ciudades");
    const ciudades = await responseCiudades.json();

    // Validar si ya existe el nuevo nombre en otra ciudad (diferente a la que editamos)
    const nombreExiste = ciudades.some(c => c.nombre_ciudad.toLowerCase() === nuevoNombre.toLowerCase() && c.codCiudad != idCiudad);

    if (nombreExiste) {
      return Swal.fire({
        icon: 'warning',
        title: 'Nombre duplicado',
        text: 'Ya existe una ciudad con ese nombre.',
      });
    }

    // Si pasa la validación, actualizar
    const response = await fetch(`http://localhost:8080/proyectoCalzado/api/ciudades/${idCiudad}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_ciudad: nuevoNombre }),
    });

    if (!response.ok) throw new Error();

    await Swal.fire({
      icon: 'success',
      title: 'Ciudad actualizada',
      text: 'El nombre de la ciudad se actualizó correctamente.',
    });

    cargarCiudades();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar la ciudad.',
    });
  }
});


  // ELIMINAR CIUDAD
  btnEliminar.addEventListener("click", async () => {
    const idCiudad = selectEliminar.value;

    if (!idCiudad) {
      return Swal.fire({
        icon: 'warning',
        title: 'Sin selección',
        text: 'Seleccione una ciudad para eliminar.',
      });
    }

    const confirmar = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar ciudad?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmar.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/proyectoCalzado/api/ciudades/${idCiudad}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      await Swal.fire({
        icon: 'success',
        title: 'Ciudad eliminada',
        text: 'Se ha eliminado correctamente.',
      });

      cargarCiudades();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la ciudad. Puede estar en uso.',
      });
    }
  });

  // Cargar ciudades al iniciar
  cargarCiudades();
});


