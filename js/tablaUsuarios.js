import {
  obtenerUsuarios,
  obtenerCiudades,
  obtenerRoles,
  eliminarUsuario
} from "./api.js";

export async function crearTablaUsuarios() {
  try {
    const usuarios = await obtenerUsuarios();
    const ciudades = await obtenerCiudades();
    const roles = await obtenerRoles();

    const main = document.querySelector("main.usuarios");
    main.innerHTML = ""; // Limpiar contenido anterior

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // CABECERA
    const thead = document.createElement("thead");
    const trEncabezado = document.createElement("tr");
    const campos = ["ID", "Nombre", "Correo", "Teléfono", "Ciudad", "Rol"];
    campos.forEach(campo => {
      const th = document.createElement("th");
      th.textContent = campo;
      trEncabezado.appendChild(th);
    });
    const thAcciones = document.createElement("th");
    thAcciones.textContent = "Acciones";
    trEncabezado.appendChild(thAcciones);
    thead.appendChild(trEncabezado);
    tabla.appendChild(thead);

    // CUERPO
    const tbody = document.createElement("tbody");

    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");

      const ciudadNombre = ciudades.find(c => c.codCiudad === u.codCiudad)?.nombre_ciudad || "Desconocida";
      const rolNombre = roles.find(r => r.idRol === u.idRol)?.nombre_rol || "Sin rol";

      if (
        usuarioLogueado &&
        usuarioLogueado.idUsuario === u.idUsuario &&
        rolNombre.toLowerCase() !== "administrador"
      ) {
        tr.classList.add("resaltado-logueado");
      }

      const datos = [
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        ciudadNombre,
        rolNombre
      ];

      datos.forEach(dato => {
        const td = document.createElement("td");
        td.textContent = dato;
        tr.appendChild(td);
      });

      // ACCIONES
      const tdAcciones = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.classList.add("editar");

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.classList.add("eliminar");

      const datosEditar = { ...u };
      if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
        datosEditar.rolBloqueado = true;
      }

      btnEditar.addEventListener("click", () => {
        localStorage.setItem("usuarioEditar", JSON.stringify(datosEditar));
        window.location.href = "../html/editarUsuario.html";
      });

      if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
        btnEliminar.disabled = true;
        btnEliminar.title = "No puedes eliminar tu propia cuenta";
      } else {
        btnEliminar.addEventListener("click", async () => {
          const confirmar = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminar al usuario "${u.nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          });

          if (confirmar.isConfirmed) {
            try {
              await eliminarUsuario(u.idUsuario);
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El usuario fue eliminado correctamente.'
              });
              tr.remove();
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el usuario.'
              });
            }
          }
        });
      }

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);
      tr.appendChild(tdAcciones);

      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);
  } catch (error) {
    console.error("Error al crear la tabla de usuarios:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar la tabla de usuarios.'
    });
  }
}
