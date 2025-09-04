// Importa jwt-decode
import * as jwt from "jwt-decode";
const jwtDecode = jwt.default || jwt;

// Importa la función para mostrar mensajes de error
import { error } from "./alertas.js";

// ================= TOKEN =================
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    return true;
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`http://localhost:8080/proyectoCalzado/api/usuarios/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.hash = "#login";
      return null;
    }

    const data = await res.json();
    localStorage.setItem("token", data.accessToken);
    return data.accessToken;

  } catch (err) {
    console.error("Error refrescando token:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.hash = "#login";
    return null;
  }
};

export const getValidToken = async () => {
  let token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    token = await refreshAccessToken();
  }
  return token;
};

const getAuthHeaders = async () => {
  const token = await getValidToken();
  return token
    ? { "Content-Type": "application/json", Authorization: "Bearer " + token }
    : { "Content-Type": "application/json" };
};

// ================= PETICIONES =================
export const get = async (endpoint) => {
  const res = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
    headers: await getAuthHeaders()
  });
  if (res.ok) return await res.json();
  const err = await res.json().catch(() => ({}));
  error(err.error || "Error en GET");
};

export const post = async (endpoint, info) => {
  try {
    const res = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(info)
    });

    const data = await res.json().catch(() => ({}));
    // DEVUELVE COMO ANTES: { status, data }
    return { status: res.status, data };
  } catch (err) {
    console.error("Error en POST:", err);
    return { status: 0, data: { mensaje: "Error de conexión" } };
  }
};

export const postSinToken = async (endpoint, info) => {
  try {
    const res = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    console.error("Error en POST sin token:", err);
    return { status: 0, data: { mensaje: "Error de conexión" } };
  }
};

export const put = async (endpoint, info) => {
  try {
    const res = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(info)
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (err) {
    console.error("Error en PUT:", err);
    return { ok: false, data: { mensaje: "Error de conexión" } };
  }
};

export const del = async (endpoint) => {
  try {
    const res = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
      method: "DELETE",
      headers: await getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (err) {
    console.error("Error en DELETE:", err);
    return { ok: false, data: { mensaje: "Error de conexión" } };
  }
};


// ================= HELPERS USUARIOS =================
export const obtenerUsuarios = async () => await get("usuarios");
export const inactivarUsuario = async (id) => await put(`usuarios/inactivar/${id}`);
export const reactivarUsuario = async (id) => await put(`usuarios/reactivar/${id}`);
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
//ACTUALIZAR USUARIO
export async function actualizarUsuario(usuario) {
  try {
    const response = await fetch(`${API_BASE}/usuarios/${usuario.idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar:", error);
    throw error;
  }
}