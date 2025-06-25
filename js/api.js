export async function loginUsuario(correo, contrasena) {
  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/usuarios/login", {
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

export async function registrarUsuario(usuario) {
  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/usuarios", {
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
