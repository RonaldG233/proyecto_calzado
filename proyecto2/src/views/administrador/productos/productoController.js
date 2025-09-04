import HeaderAdmin from "../../../components/headerAdmin.html?raw";
import SidebarAdmin from "../../../components/sidebarAdmin.html?raw";
import { validarNombre, validarSeleccion } from "../../../Modules/validaciones.js";
import { success, error, info } from "../../../helpers/alertas.js";
import { get, post } from "../../../helpers/api.js";

export const productoController = () => {
  const headerContainer = document.getElementById("header-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  // Cargar header y sidebar
  headerContainer.innerHTML = HeaderAdmin;
  sidebarContainer.innerHTML = SidebarAdmin;

  // Formulario e inputs
  const formRegistrar = document.getElementById("formularioProducto");
  const inputNombre = document.getElementById("nombreProducto");
  const inputDescripcion = document.getElementById("descripcionProducto");
  const inputPrecio = document.getElementById("precioProducto");
  const selectEmpresa = document.getElementById("empresa");
  const selectImagen = document.getElementById("imagen");

  // Imagen vista previa
  const vistaPrevia = document.createElement("img");
  vistaPrevia.id = "vistaPrevia";
  vistaPrevia.style.display = "none";
  vistaPrevia.style.maxWidth = "200px";
  vistaPrevia.style.marginTop = "10px";
  selectImagen.parentNode.insertBefore(vistaPrevia, selectImagen.nextSibling);

  let listaImagenes = [];
  let listaEmpresas = [];

  // Cargar empresas e imágenes desde API
  const cargarDatos = async () => {
    try {
      [listaEmpresas, listaImagenes] = await Promise.all([get("empresas"), get("imagenes")]);

      // Limpiar selects
      selectEmpresa.innerHTML = '<option value="">-- Seleccione una empresa --</option>';
      selectImagen.innerHTML = '<option value="">-- Seleccione una imagen --</option>';

      // Llenar select empresas activas
      listaEmpresas
        .filter(emp => emp.id_estado === 1)
        .forEach(emp => {
          const option = new Option(emp.nombre_empresa, emp.idEmpresa);
          selectEmpresa.appendChild(option);
        });

      // Llenar select imágenes
      listaImagenes.forEach(img => {
        const option = new Option(img.nombre, img.id_imagen);
        selectImagen.appendChild(option);
      });

    } catch (err) {
      console.error("Error cargando selects:", err);
      error("Error", "No se pudieron cargar empresas o imágenes");
    }
  };

  cargarDatos();

  // Vista previa de la imagen seleccionada
  selectImagen.addEventListener("change", () => {
    const id = parseInt(selectImagen.value);
    if (id) {
      const imgSeleccionada = listaImagenes.find(img => img.id_imagen === id);
      if (imgSeleccionada) {
        vistaPrevia.src = `http://localhost:8080/proyectoCalzado/api/imagenes/ver/${imgSeleccionada.nombre}`;
        vistaPrevia.style.display = "block";
      }
    } else {
      vistaPrevia.src = "";
      vistaPrevia.style.display = "none";
    }
  });

  // Registrar producto
  formRegistrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar campos
    if (!validarNombre(inputNombre)) return;
    if (!inputDescripcion.value.trim()) return info("Faltan datos", "La descripción es obligatoria.");
    if (!inputPrecio.value || parseFloat(inputPrecio.value) <= 0) return info("Precio inválido", "Ingrese un precio válido.");
    if (!validarSeleccion(selectEmpresa)) return info("Faltan datos", "Debe seleccionar una empresa.");
    if (!validarSeleccion(selectImagen)) return info("Faltan datos", "Debe seleccionar una imagen.");

    // IDs numéricos
    const idEmpresa = parseInt(selectEmpresa.value);
    const idImagen = parseInt(selectImagen.value);

    if (isNaN(idEmpresa)) return info("Error", "ID de empresa inválido.");
    if (isNaN(idImagen)) return info("Error", "ID de imagen inválido.");

    const producto = {
      nombre_producto: inputNombre.value.trim(),
      descripcion_producto: inputDescripcion.value.trim(),
      precio_producto: parseFloat(inputPrecio.value),
      id_empresa: idEmpresa,
      id_imagen: idImagen,
      id_estado: 1
    };

    console.log("Producto a enviar:", producto);

    try {
      const res = await post("productos", producto);

      // Consideramos cualquier respuesta 200 o 201 como éxito
      if (res.ok || res.status === 201 || res.status === 200) {
        await success("Producto registrado correctamente.");
        formRegistrar.reset();
        vistaPrevia.src = "";
        vistaPrevia.style.display = "none";
      } else {
        // Si el backend devuelve error con mensaje
        const mensaje = res.data?.mensaje || "No se pudo registrar el producto.";
        error("Error", mensaje);
      }

    } catch (err) {
      console.error("Error al registrar producto:", err);
      error("Error de conexión", "No se pudo conectar con el servidor.");
    }
  });
};
