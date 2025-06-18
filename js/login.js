document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();

    if (!correo || !contrasena) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    fetch("http://localhost:8080/proyectoCalzado/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contrasena })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Credenciales incorrectas");
        }
        return response.json();
      })
      .then(usuario => {
        alert("Inicio de sesión exitoso.");
        localStorage.setItem("usuario", JSON.stringify(usuario));
        window.location.href = "../html/catalogo.html";
      })
      .catch(error => {
        alert("Correo o contraseña incorrectos.");
        console.error("Error de login:", error);
      });
  });
});
