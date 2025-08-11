import {
  obtenerUsuarios,
  obtenerCiudades,
  obtenerRoles,
  inactivarUsuario,
  reactivarUsuario
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
    const campos = ["ID", "Nombre", "Correo", "Teléfono", "Ciudad", "Rol", "Estado"];
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
      const estadoNombre = u.estado || "Desconocido"; // <-- viene de la API (Activo/Inactivo)

      if (
        usuarioLogueado &&
        usuarioLogueado.idUsuario === u.idUsuario &&
        rolNombre.toLowerCase() !== "usuario"
      ) {
        tr.classList.add("resaltado-logueado");
      }

      const datos = [
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        ciudadNombre,
        rolNombre,
        estadoNombre
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

      btnEditar.addEventListener("click", () => {
        const datosEditar = { ...u };
        if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
          datosEditar.rolBloqueado = true;
        }
        localStorage.setItem("usuarioEditar", JSON.stringify(datosEditar));
        window.location.href = "../html/editarUsuario.html";
      });

      // Botón de estado dinámico
      const btnEstado = document.createElement("button");
      // Dentro de crearTablaUsuarios(), en el botón btnEstado cuando sea "Inactivar"
if (estadoNombre.toLowerCase() === "activo") {
  btnEstado.textContent = "🚫 Inactivar";
  btnEstado.classList.add("inactivar");
  btnEstado.addEventListener("click", async () => {

    // Validar que no sea el usuario logueado
    if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes inactivar tu propia cuenta.'
      });
      return; // Salir sin hacer nada
    }

    const confirmar = await Swal.fire({
      title: '¿Inactivar usuario?',
      text: `El usuario "${u.nombre}" pasará a estado inactivo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, inactivar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmar.isConfirmed) {
      try {
        await inactivarUsuario(u.idUsuario);
        Swal.fire({
          icon: 'success',
          title: 'Inactivado',
          text: 'El usuario fue inactivado correctamente.'
        });
        crearTablaUsuarios(); // Recargar tabla
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al inactivar el usuario.'
        });
      }
    }
  });

      } else {
        btnEstado.textContent = "✅ Reactivar";
        btnEstado.classList.add("reactivar");
        btnEstado.addEventListener("click", async () => {
          const confirmar = await Swal.fire({
            title: '¿Reactivar usuario?',
            text: `El usuario "${u.nombre}" pasará a estado activo.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
          });

          if (confirmar.isConfirmed) {
            try {
              await reactivarUsuario(u.idUsuario);
              Swal.fire({
                icon: 'success',
                title: 'Reactivado',
                text: 'El usuario fue reactivado correctamente.'
              });
              crearTablaUsuarios(); // Recargar tabla
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al reactivar el usuario.'
              });
            }
          }
        });
      }

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEstado);
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
