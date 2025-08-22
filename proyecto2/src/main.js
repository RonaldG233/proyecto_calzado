import { router } from "./router/router";
import './estilos/style.css';

const app = document.querySelector("#app")

window.addEventListener("DOMContentLoaded", ()=> {
    router(app)
})
window.addEventListener("hashchange", ()=>{
    router(app)
})