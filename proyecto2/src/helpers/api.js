// Importa la función para decodificar el contenido del token JWT
import * as jwt from "jwt-decode";
const jwtDecode = jwt.default || jwt;

// Importa la función para mostrar mensajes de error
import { error } from "./alertas.js";

/**
 * Valida si el token almacenado en localStorage está expirado.
 * @returns {boolean} true si el token está expirado o no existe, false si está vigente.
 */
const isTokenExpired = () => {
  const token = localStorage.getItem("token"); 
  if (!token) return true; 
  try {
    const decoded = jwtDecode(token); 
    const currentTime = Date.now() / 1000; 
    return decoded.exp < currentTime; 
  } catch (e) {
    return true; 
  }
};

/**
 * Refresca el token de acceso usando el refreshToken almacenado en localStorage.
 * @returns {string|null} El nuevo token si fue exitoso, null si falla.
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken"); 
  if (!refreshToken) return null; 

  const res = await fetch(`http://localhost:8080/proyectoCalzado/api/refreshToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (res.ok) {
    const data = await res.json(); 
    localStorage.setItem("token", data.token); 
    return data.token; 
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return null;
  }
};

/**
 * Obtiene los headers de autenticación para las peticiones HTTP.
 * @returns {Object} Headers con Content-Type y Authorization si hay token válido
 */
const getAuthHeaders = async () => {
  let token = localStorage.getItem("token"); 
  if (!token || isTokenExpired()) {
    token = await refreshAccessToken(); 
  }
  return token
    ? { "Content-Type": "application/json", Authorization: "Bearer " + token }
    : { "Content-Type": "application/json" };
};

/**
 * Petición GET autenticada
 */
export const get = async (endpoint) => {
  const data = await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
    headers: await getAuthHeaders()
  });
  if (data.ok) return await data.json();
  const men = await data.json(); 
  error(men.error);
};

/**
 * Petición POST autenticada
 */
export const post = async (endpoint, info) => {
  return await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(info)
  });
};

/**
 * Petición POST sin token
 */
export const postSinToken = async (endpoint, info) => {
  return await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info)
  });
};

/**
 * Petición POST para subir imágenes
 */
export const post_imgs = async (formData) => {
  const token = localStorage.getItem("token"); 
  const headers = token ? { 'Authorization': 'Bearer ' + token } : {}; 
  return await fetch(`http://localhost:8080/proyectoCalzado/api/imagenes`, {
    method: 'POST',
    headers: headers,
    body: formData
  });
};

/**
 * Petición PUT autenticada
 */
export const put = async (endpoint, info) => {
  try {
    return await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(info)
    });
  } catch (error) {
    console.log(error); 
  }
};

/**
 * Petición DELETE autenticada
 */
export const del = async (endpoint) => {
  return await fetch(`http://localhost:8080/proyectoCalzado/api/${endpoint}`, {
    method: 'DELETE',
    headers: await getAuthHeaders()
  });
};
