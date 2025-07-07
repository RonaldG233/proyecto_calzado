import { obtenerUsuarios, obtenerCiudades, obtenerRoles } from "./api.js";

export async function crearTablaUsuarios() {
  try {
    const usuarios = await obtenerUsuarios();
    const ciudades = await obtenerCiudades();
    const roles = await obtenerRoles();

    const main = document.querySelector("main.usuarios");
    main.innerHTML = ""; // Limpiar contenido anterior si lo hay

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

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

    const tbody = document.createElement("tbody");

    usuarios.forEach(u => {
      const tr = document.createElement("tr");

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

      // Botones
      const tdAcciones = document.createElement("td");
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.classList.add("editar");

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.classList.add("eliminar");

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);

      tr.appendChild(tdAcciones);
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);
    btnEditar.addEventListener("click", () => {
  localStorage.setItem("usuarioEditar", JSON.stringify(u));
  window.location.href = "../html/editarUsuario.html";
});

  } catch (error) {
    console.error("Error al crear la tabla de usuarios:", error);
  }
}

