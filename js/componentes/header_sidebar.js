export function componentes() {
  const cargarComponente = async (ruta, contenedorID) => {
    try {
      const res = await fetch(ruta);
      if (!res.ok) throw new Error(`No se pudo cargar ${ruta}`);
      const html = await res.text();
      document.getElementById(contenedorID).innerHTML = html;
    } catch (err) {
      console.error(`Error al cargar componente: ${ruta}`, err);
    }
  };

  // Aquí se usa el header y sidebar del USUARIO
  cargarComponente("../componentes/headerUsuario.html", "header-container");
  cargarComponente("../componentes/sidebarUsuario.html", "sidebar-container");
}
