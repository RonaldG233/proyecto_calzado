import { loginController } from "../views/login/loginController.js";
import { registroController } from "../views/registro/registroController.js";
import { homeController } from "../views/home/homeController.js";

export const routes={
    home: {
    path: "views/home/index.html",
    controlador: homeController,
    private: false,
    },
    login:{
        path:'login/index.html',
        controlador:loginController,
        private:false
    },
    registro:{
        path:'registro/index.html',
        controlador:registroController,
        private:false
    }

}   