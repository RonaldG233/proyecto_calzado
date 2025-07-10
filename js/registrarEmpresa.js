// ✅ FUNCIÓN GLOBAL PARA MANEJAR LAS PESTAÑAS
function mostrarFormulario(id) {
  document.querySelectorAll(".formulario-empresa").forEach(f => f.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  document.getElementById("form-" + id).classList.add("active");
  const index = ["registrar", "editar", "eliminar"].indexOf(id);
  document.querySelectorAll(".tab-btn")[index].classList.add("active");
}

// ✅ LÓGICA PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
  const mensaje = document.getElementById("mensajeEmpresa");

  const mostrarMensaje = (texto, color = "green") => {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  };

  async function cargarEmpresas() {
    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/empresas");
      const data = await res.json();

      const editarSelect = document.getElementById("empresaEditar");
      const eliminarSelect = document.getElementById("empresaEliminar");

      [editarSelect, eliminarSelect].forEach(select => {
        select.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
        data.forEach(e => {
          const option = document.createElement("option");
          option.value = e.idEmpresa;
          option.textContent = e.nombre_empresa;
          select.appendChild(option);
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  cargarEmpresas();

  // REGISTRAR EMPRESA
  document.getElementById("formRegistrarEmpresa").addEventListener("submit", async (e) => {
    e.preventDefault();

    const empresa = {
      nombre_empresa: document.getElementById("nombreEmpresa").value.trim(),
      direccion_empresa: document.getElementById("direccionEmpresa").value.trim(),
      telefono_empresa: document.getElementById("telefonoEmpresa").value.trim(),
      correo_empresa: document.getElementById("correoEmpresa").value.trim(),
    };

    try {
      const res = await fetch("http://localhost:8080/proyectoCalzado/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresa),
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("Empresa registrada correctamente");
      e.target.reset();
      cargarEmpresas();
    } catch {
      mostrarMensaje("Error al registrar empresa", "red");
    }
  });

  // EDITAR EMPRESA
  document.getElementById("btnEditarEmpresa").addEventListener("click", async () => {
    const id = document.getElementById("empresaEditar").value;
    if (!id) return mostrarMensaje("Seleccione una empresa a editar", "red");

    const nueva = {
      nombre_empresa: document.getElementById("nuevoNombreEmpresa").value.trim(),
      direccion_empresa: document.getElementById("nuevaDireccionEmpresa").value.trim(),
      telefono_empresa: document.getElementById("nuevoTelefonoEmpresa").value.trim(),
      correo_empresa: document.getElementById("nuevoCorreoEmpresa").value.trim(),
    };

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nueva),
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("Empresa actualizada correctamente");
      cargarEmpresas();
    } catch {
      mostrarMensaje("Error al actualizar empresa", "red");
    }
  });

  // ELIMINAR EMPRESA
  document.getElementById("btnEliminarEmpresa").addEventListener("click", async () => {
    const id = document.getElementById("empresaEliminar").value;
    if (!id) return mostrarMensaje("Seleccione una empresa a eliminar", "red");

    const confirmar = confirm("¿Estás seguro de eliminar esta empresa?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8080/proyectoCalzado/api/empresas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      mostrarMensaje("Empresa eliminada correctamente");
      cargarEmpresas();
    } catch {
      mostrarMensaje("Error al eliminar empresa", "red");
    }
  });
});
