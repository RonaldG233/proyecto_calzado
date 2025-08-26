import Swal from 'sweetalert2';

export function alertaExito(texto) {
  Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: texto
  });
}

export function alertaError(texto) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: texto
  });
}

export function alertaInfo(titulo, mensaje) {
  Swal.fire({
    icon: "info",
    title: titulo,
    text: mensaje,
    confirmButtonText: "¡Entendido!",
    confirmButtonColor: "#3085d6",
  });
}

export function confirmarAccion(titulo, texto, accionConfirmada) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      accionConfirmada(); // Se ejecuta solo si el usuario confirma
    }
  });
}

export const alertaEditarEliminar = async (titulo, texto, onEditar, onEliminar) => {
  const { value: accion } = await Swal.fire({
    title: titulo,
    html: texto,
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Editar",
    denyButtonText: "Eliminar",
    cancelButtonText: "Cerrar",
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm',
      denyButton: 'swal2-deny',
      cancelButton: 'swal2-cancel'
    }
  });

  if (accion === true) {
    // 👉 Editar
    if (typeof onEditar === "function") onEditar();
  } else if (accion === false) {
    // 👉 Eliminar (confirmación antes de ejecutar)
    const confirmacion = await confirmarAccion(
      "¿Eliminar cita?",
      "Esta acción no se puede deshacer. ¿Deseas continuar?",
      async () => {
        if (typeof onEliminar === "function") onEliminar();
      }
    );
  }
};