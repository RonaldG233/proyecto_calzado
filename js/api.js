const API_BASE = "http://localhost:8080/proyectoCalzado/api";

/* -------------------------- AUTENTICACIÓN -------------------------- */
export async function loginUsuario(correo, contrasena) {
  try {
    const response = await fetch(`${API_BASE}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena })
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en login:", error.message);
    throw error;
  }
}

/* -------------------------- REGISTRO DE USUARIOS -------------------------- */
export async function registrarUsuario(usuario) {
  try {
    const response = await fetch(`${API_BASE}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en el registro:", error.message);
    throw error;
  }
}

/* -------------------------- OBTENER DATOS -------------------------- */
export async function obtenerUsuarios() {
  try {
    const response = await fetch(`${API_BASE}/usuarios`);
    if (!response.ok) throw new Error("Error al obtener los usuarios");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}

export async function obtenerCiudades() {
  try {
    const response = await fetch(`${API_BASE}/ciudades`);
    if (!response.ok) throw new Error("Error al obtener ciudades");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    throw error;
  }
}

export async function obtenerRoles() {
  try {
    const response = await fetch(`${API_BASE}/roles`);
    if (!response.ok) throw new Error("Error al obtener roles");
    return await response.json();
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw error;
  }
}


