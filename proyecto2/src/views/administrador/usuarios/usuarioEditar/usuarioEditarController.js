import HeaderAdmin from "../../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../../components/sidebarAdmin.html?raw";
import { validarNombre, validarCorreo, validarTelefono, validarContrasena, validarConfirmaContrasena, validarSeleccion } from "../../../../Modules/validaciones.js";
import { success, error, info, confirmar } from "../../../../helpers/alertas.js";
import { get, put } from "../../../../helpers/api.js";

// ================= CONTROLLER EDITAR USUARIO =================
export const usuarioEditarController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  // Cargar header y sidebar
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Formulario e inputs
  const formEditar = document.getElementById("formEditarUsuario");
  const inputId = document.getElementById("idUsuario");
  const inputNombre = document.getElementById("nombre");
  const inputCorreo = document.getElementById("correo");
  const inputTelefono = document.getElementById("telefono");
  const inputContrasena = document.getElementById("contrasena");
  const selectCiudad = document.getElementById("codCiudad");
  const selectRol = document.getElementById("idRol");

  // Obtener datos del usuario a editar y logueado
  const usuarioEditar = JSON.parse(localStorage.getItem("usuarioEditar"));
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

  if (!usuarioEditar) {
    error("No hay usuario seleccionado para editar");
    window.location.href = "../html/AdminCatalogo.html";
    return;
  }

  // Rellenar inputs con los datos existentes
  inputId.value = usuarioEditar.idUsuario;
  inputNombre.value = usuarioEditar.nombre;
  inputCorreo.value = usuarioEditar.correo;
  inputTelefono.value = usuarioEditar.telefono;
  inputContrasena.value = usuarioEditar.contrasena || "";

  // ================= Cargar selects =================
  const cargarCiudades = async () => {
    try {
      const ciudades = await get("ciudades");
      selectCiudad.innerHTML = '<option value="">-- Seleccione una ciudad --</option>';
      ciudades.forEach(c => {
        const option = new Option(c.nombre_ciudad, c.codCiudad);
        if (usuarioEditar.codCiudad === c.codCiudad) option.selected = true;
        selectCiudad.appendChild(option);
      });
    } catch (err) {
      console.error(err);
      error("No se pudieron cargar las ciudades");
    }
  };

  const cargarRoles = async () => {
    try {
      const roles = await get("roles");
      selectRol.innerHTML = '<option value="">-- Seleccione un rol --</option>';
      roles.forEach(r => {
        const option = new Option(r.nombre_rol, r.idRol);
        if (usuarioEditar.idRol === r.idRol) option.selected = true;
        selectRol.appendChild(option);
      });
    } catch (err) {
      console.error(err);
      error("No se pudieron cargar los roles");
    }
  };

  cargarCiudades();
  cargarRoles();

  // ================= Configurar permisos =================
  let permitirCambioContrasena = false;
  if (usuarioLogueado && usuarioEditar.idUsuario === usuarioLogueado.idUsuario) {
    permitirCambioContrasena = true;
    inputContrasena.disabled = false;
  } else {
    inputContrasena.disabled = true;
    inputContrasena.title = "No puedes cambiar la contraseña de otro usuario";
  }

  if (usuarioLogueado && usuarioEditar.idUsuario === usuarioLogueado.idUsuario && usuarioLogueado.idRol === 2) {
    selectRol.disabled = true;
    selectRol.title = "No puedes cambiar tu rol si eres administrador";
  } else {
    selectRol.disabled = false;
  }

  // ================= SUBMIT FORM =================
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validaciones
    if (!validarNombre(inputNombre)) return;
    if (!validarCorreo(inputCorreo)) return;
    if (!validarTelefono(inputTelefono)) return;
    if (permitirCambioContrasena && !validarContrasena(inputContrasena)) return;
    if (!validarSeleccion(selectCiudad)) return;
    if (!selectRol.disabled && !validarSeleccion(selectRol)) return;

    // Confirmación antes de actualizar
    const confirm = await confirmar("actualizar este usuario");
    if (!confirm.isConfirmed) return;

    const usuarioActualizado = {
      idUsuario: parseInt(inputId.value),
      nombre: inputNombre.value.trim(),
      correo: inputCorreo.value.trim().toLowerCase(),
      telefono: inputTelefono.value.trim(),
      codCiudad: parseInt(selectCiudad.value),
      idRol: selectRol.disabled ? usuarioEditar.idRol : parseInt(selectRol.value),
      contrasena: permitirCambioContrasena ? inputContrasena.value : usuarioEditar.contrasena
    };

    try {
      const res = await put(`usuarios/${usuarioActualizado.idUsuario}`, usuarioActualizado);
      if (res.ok) {
        // Actualizar localStorage si el usuario editado es el logueado
        if (usuarioLogueado && usuarioLogueado.idUsuario === usuarioActualizado.idUsuario) {
          localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        }
        localStorage.removeItem("usuarioEditar");
        await success("Usuario actualizado correctamente");
        window.location.href = "../html/AdminCatalogo.html";
      } else {
        error(res.data?.mensaje || "No se pudo actualizar el usuario");
      }
    } catch (err) {
      console.error(err);
      error("Error al actualizar usuario");
    }
  });
};
