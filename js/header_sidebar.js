export function componentes() {
  const cargarComponente = async (ruta, contenedorID) => {
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) throw new Error(`Error al cargar ${ruta}`);
      const html = await respuesta.text();
      document.getElementById(contenedorID).innerHTML = html;
    } catch (error) {
      console.error("Error al cargar componente:", error);
    }
  };

  // Cargar header y sidebar
  cargarComponente("../componentes/header.html", "header-container");
  cargarComponente("../componentes/sidebar.html", "sidebar-container");
}
