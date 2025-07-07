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

    usuarios.forEach((u, index)=> {
      const tr = document.createElement("tr");
      const filaIndex = index + 1;

      const ciudadNombre = ciudades.find(c => c.codCiudad === u.codCiudad)?.nombre_ciudad || "Desconocida";
      const rolNombre = roles.find(r => r.idRol === u.idRol)?.nombre_rol || "Sin rol";

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

      // Botón Editar
      btnEditar.addEventListener("click", () => {
        localStorage.setItem("usuarioEditar", JSON.stringify(u));
        window.location.href = "../html/editarUsuario.html";
      });

      // Botón Eliminar
      btnEliminar.addEventListener("click", async () => {
        const confirmar = confirm("¿Estás seguro de eliminar este usuario?");
        if (confirmar) {
          try {
            await eliminarUsuario(u.idUsuario);
            alert("Usuario eliminado correctamente");
            tr.remove(); // Eliminar la fila
          } catch (error) {
            alert("Error al eliminar el usuario");
          }
        }
      });

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);
      tr.appendChild(tdAcciones);

      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);
  } catch (error) {
    console.error("Error al crear la tabla de usuarios:", error);
  }
}