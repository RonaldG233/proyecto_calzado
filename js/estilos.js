const URL_PRODUCTOS = "http://localhost:8080/proyectoCalzado/api/productos";
const URL_IMAGENES = "http://localhost:8080/proyectoCalzado/api/imagenes";
const URL_ESTILOS = "http://localhost:8080/proyectoCalzado/api/estilos";

let productos = [];
let imagenes = [];

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", async () => {
    

  await cargarEstilos();
  await cargarImagenes();
  await cargarProductos();

  document.getElementById("selectEstilos").addEventListener("change", filtrarPorEstilo);
});

async function cargarEstilos() {
  const select = document.getElementById("selectEstilos");
  try {
    const res = await fetch(URL_ESTILOS);
    const estilos = await res.json();

    select.innerHTML = '<option value="">-- Todos los estilos --</option>';
    estilos.forEach((estilo) => {
      const option = document.createElement("option");
      option.value = estilo.codEstilo;
      option.textContent = estilo.nombre_estilo;
      select.appendChild(option);
    });
  } catch (e) {
    console.error("Error cargando estilos:", e);
  }
}

async function cargarImagenes() {
  try {
    const res = await fetch(URL_IMAGENES);
    imagenes = await res.json();
  } catch (e) {
    console.error("Error cargando imágenes:", e);
  }
}

async function cargarProductos() {
  try {
    const res = await fetch(URL_PRODUCTOS);
    productos = await res.json();
    renderizarProductos(productos);
  } catch (e) {
    console.error("Error cargando productos:", e);
  }
}

function filtrarPorEstilo() {
  const codEstilo = document.getElementById("selectEstilos").value;
  if (!codEstilo) {
    renderizarProductos(productos);
    return;
  }

  const filtrados = productos.filter((producto) => producto.codEstilo == codEstilo);
  renderizarProductos(filtrados);
}

function obtenerNombreImagen(id) {
  const imagen = imagenes.find((img) => img.id_imagen === id);
  return imagen ? imagen.nombre : "placeholder.jpg";
}

function renderizarProductos(lista) {
  const contenedor = document.getElementById("contenedorCatalogo");
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p style='color:red;'>No hay productos para este estilo.</p>";
    return;
  }

  lista.forEach((producto) => {
    const nombreImagen = obtenerNombreImagen(producto.id_imagen);
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <img src="http://localhost:8080/proyectoCalzado/api/imagenes/ver/${nombreImagen}" alt="${producto.nombre_producto}">
      <h3>${producto.nombre_producto}</h3>
      <p>$ ${parseInt(producto.precio_producto).toLocaleString()}</p>
    `;

    contenedor.appendChild(div);
  });
}
