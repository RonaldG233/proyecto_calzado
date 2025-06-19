export async function loginUsuario(correo, contrasena) {
  try {
    const response = await fetch("http://localhost:8080/proyectoCalzado/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contrasena })
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const usuario = await response.json();
    return usuario;
  } catch (error) {
    console.error("Error en login:", error.message);
    throw error;
  }
}
