const URL_PRODUCTOS = "http://localhost:8080/proyectoCalzado/api/productos";
const URL_IMAGENES = "http://localhost:8080/proyectoCalzado/api/imagenes";
const URL_ESTILOS = "http://localhost:8080/proyectoCalzado/api/estilos";

let productos = [];
let imagenes = [];

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

  const filtrados = productos.filter((p) => p.cod_estilo == codEstilo);
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
      <label for="cantidad-${producto.id_producto}">Cantidad:</label>
      <input type="number" min="1" value="1" class="input-cantidad" id="cantidad-${producto.id_producto}">
      <button class="btnAgregar" data-id="${producto.id_producto}">Agregar</button>
    `;

    div.addEventListener("click", (e) => {
      if (!["BUTTON", "INPUT", "LABEL"].includes(e.target.tagName)) {
        localStorage.setItem("productoDetalle", JSON.stringify(producto));
        window.location.href = "producto.html";
      }
    });

    contenedor.appendChild(div);
  });
}

// Lógica para agregar al carrito
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnAgregar")) {
    const id = parseInt(e.target.dataset.id);
    const input = document.getElementById(`cantidad-${id}`);
    const cantidadDeseada = parseInt(input.value);

    const producto = productos.find(p => p.id_producto === id);

    if (!producto) {
      Swal.fire({
        icon: "error",
        title: "Producto no encontrado",
        text: "Verifica el catálogo."
      });
      return;
    }

    if (cantidadDeseada < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "Por favor ingresa una cantidad válida."
      });
      return;
    }

    if (cantidadDeseada > producto.cantidad_producto) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${producto.cantidad_producto} unidades disponibles de "${producto.nombre_producto}".`
      });
      return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

    if (index >= 0) {
      const cantidadActual = carrito[index].cantidad;
      const nuevaCantidad = cantidadActual + cantidadDeseada;

      if (nuevaCantidad > producto.cantidad_producto) {
        Swal.fire({
          icon: "warning",
          title: "Exceso de stock",
          html: `Ya tienes <b>${cantidadActual}</b> en el carrito.<br>No puedes exceder el stock (<b>${producto.cantidad_producto}</b>).`
        });
        return;
      }

      carrito[index].cantidad = nuevaCantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_producto: producto.precio_producto,
        id_imagen: producto.id_imagen,
        cantidad: cantidadDeseada
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    Swal.fire({
      icon: "success",
      title: "¡Producto agregado!",
      text: `"${producto.nombre_producto}" agregado al carrito (${cantidadDeseada})`,
      timer: 1800,
      showConfirmButton: false
    });
  }
});
