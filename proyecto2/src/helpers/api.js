  // ================= IMPORTS =================
  import { jwtDecode } from "jwt-decode";

  import { error } from "./alertas.js";

  // ================= BASE API =================
  const API_BASE = "http://localhost:8080/proyectoCalzado/api";

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
      const res = await fetch(`${API_BASE}/usuarios/refresh`, {
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
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: await getAuthHeaders()
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    error(err.error || "Error en GET");
  };

  export const post = async (endpoint, info) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(info)
      });

      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    } catch (err) {
      console.error("Error en POST:", err);
      return { status: 0, data: { mensaje: "Error de conexión" } };
    }
  };

  export const postSinToken = async (endpoint, info) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      return { status: res.status, data };

    } catch (err) {
      console.error("Error en POST sin token:", err);
      return { status: 0, data: { mensaje: "Error de conexión" } };
    }
  };

  export const put = async (endpoint, info) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(info)
      });

      const data = await res.json().catch(() => ({}));

      // 🔹 devolvemos ok, status y data
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error("Error en PUT:", err);
      return { ok: false, status: 0, data: { mensaje: "Error de conexión" } };
    }
  };


  export const del = async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
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
  export const inactivarUsuario = async (id) => await put(`usuarios/${id}/inactivar`);
  export const reactivarUsuario = async (id) => await put(`usuarios/${id}/reactivar`);


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

 export async function actualizarUsuario(usuario) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/usuarios/${usuario.idUsuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Error al actualizar el usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar:", error);
    throw error;
  }
}


  export async function cambiarRolUsuario(idUsuario, nombreRol) {
    try {
      const res = await fetch(`${API_BASE}/usuarios/${idUsuario}/cambiarRol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ nombreRol }) // 🔑 enviamos nombreRol en vez de idRol
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || "Error al cambiar rol");
      }

      return await res.json();
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      throw err;
    }
  }
  async function actualizarEstadoProducto(prod, estado) {
    try {
      const prodActualizado = { ...prod, id_estado: estado };
      await fetch(`http://localhost:8080/proyectoCalzado/api/productos/${prod.id_producto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prodActualizado)
      });
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  }

