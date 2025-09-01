// modules.js
import { error } from "../helpers/alertas.js";
import { obtenerUsuarios, inactivarUsuario, reactivarUsuario } from "../helpers/api.js";
import Swal from "sweetalert2";

// ==================== VALIDACIÓN DE FORMULARIOS ====================
export const contarCamposFormulario = (formulario) => {
  if (!formulario) return { total: 0, completos: 0, vacíos: 0 };
  const campos = formulario.querySelectorAll("input, select, textarea");
  let completos = 0, vacíos = 0;

  campos.forEach(c => {
    if (!["button","submit","reset"].includes(c.type)) {
      c.value.trim() !== "" ? completos++ : vacíos++;
    }
  });

  if (vacíos > 0) error(`Hay ${vacíos} campos vacíos. Por favor completa todos los campos.`);
  return { total: campos.length, completos, vacíos };
};

// ==================== CREAR TABLA DE USUARIOS ====================
export async function crearTablaUsuarios() {
  try {
    const usuarios = await obtenerUsuarios();
    const main = document.querySelector("main.usuarios");
    main.innerHTML = "";

    const tabla = document.createElement("table");
    tabla.classList.add("tabla");

    // ----- Cabecera -----
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    ["ID","Nombre","Correo","Teléfono","Ciudad","Rol","Estado","Acciones"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    tabla.appendChild(thead);

    // ----- Cuerpo -----
    const tbody = document.createElement("tbody");
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

    usuarios.forEach(u => {
      const tr = document.createElement("tr");
      if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) tr.classList.add("resaltado-logueado");

      // Extraer datos, asegurando strings
      const datos = [
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        u.ciudad || "",                      // nombre de la ciudad
        u.rol ? u.rol.nombre_rol : "",       // nombre del rol
        u.estado
      ];

      datos.forEach(d => {
        const td = document.createElement("td");
        td.textContent = d;
        tr.appendChild(td);
      });

      // ----- Acciones -----
      const tdAcc = document.createElement("td");

      // Botón editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.classList.add("editar");
      tdAcc.appendChild(btnEditar);

      // Botón activar/inactivar
      const btnEstado = document.createElement("button");
      if (u.estado.toLowerCase() === "activo") {
        btnEstado.textContent = "🚫 Inactivar";
        btnEstado.classList.add("inactivar");
        btnEstado.addEventListener("click", async () => {
          if (usuarioLogueado && usuarioLogueado.idUsuario === u.idUsuario) {
            Swal.fire("No permitido","No puedes inactivar tu cuenta","warning");
            return;
          }
          const confirm = await Swal.fire({
            title: "Inactivar usuario?",
            text: `El usuario ${u.nombre} pasará a inactivo`,
            icon: "warning",
            showCancelButton:true
          });
          if (confirm.isConfirmed) {
            await inactivarUsuario(u.idUsuario);
            Swal.fire("Inactivado","Usuario inactivado","success");
            crearTablaUsuarios();
          }
        });
      } else {
        btnEstado.textContent = "✅ Reactivar";
        btnEstado.classList.add("reactivar");
        btnEstado.addEventListener("click", async () => {
          const confirm = await Swal.fire({
            title: "Reactivar usuario?",
            text: `El usuario ${u.nombre} pasará a activo`,
            icon:"question",
            showCancelButton:true
          });
          if (confirm.isConfirmed) {
            await reactivarUsuario(u.idUsuario);
            Swal.fire("Reactivado","Usuario activado","success");
            crearTablaUsuarios();
          }
        });
      }

      tdAcc.appendChild(btnEstado);
      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    main.appendChild(tabla);

  } catch (err) {
    console.error(err);
    Swal.fire("Error","No se pudo cargar la tabla","error");
  }
}
