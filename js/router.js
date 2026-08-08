import {
    EnterpriseLogin,
    initEnterpriseLogin
} from "./enterprise/login.js";

import {
    EnterpriseDashboard
} from "./enterprise/dashboard.js";


const routes = {

    "/": () => {

        return `
            <h1>OUTSIDER</h1>
            <p>Store pública</p>
        `;

    },

    "/enterprise/login": EnterpriseLogin,

    "/enterprise/dashboard": EnterpriseDashboard

};


export function router() {

    const path = window.location.pathname;

    const route = routes[path];

    const app = document.querySelector("#app");

    if (!app) {

        console.error(
            "No se encontró #app"
        );

        return;
    }


    if (route) {

        app.innerHTML = route();

        if (path === "/enterprise/login") {

            initEnterpriseLogin();

        }

    } else {

        app.innerHTML = `
            <h1>404</h1>
            <p>Página no encontrada.</p>
        `;

    }

}


// Escuchar cambios de URL dentro de la SPA

window.addEventListener(
    "popstate",
    router
);