import {
    EnterpriseLogin,
    initEnterpriseLogin
} from "./enterprise/login.js";

import {
    EnterpriseDashboard
} from "./enterprise/dashboard.js";

import {
    checkEnterpriseAccess
} from "./enterprise/authGuard.js";


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
export async function navigate(path) {

    window.history.pushState(
        {},
        "",
        path
    );

    router();

}

export async function router() {

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


        // ========================================
        // ENTERPRISE ACCESS
        // ========================================

        if (path === "/enterprise/dashboard") {

            const access = await checkEnterpriseAccess();

            if (!access.allowed) {

                console.warn(
                    "Acceso Enterprise rechazado:",
                    access.reason
                );

                window.history.replaceState(
                    {},
                    "",
                    "/enterprise/login"
                );

                return router();

            }

        }


        // ========================================
        // RENDER ROUTE
        // ========================================

        app.innerHTML = route();


        // ========================================
        // ENTERPRISE LOGIN INIT
        // ========================================

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


// ========================================
// SPA NAVIGATION
// ========================================

window.addEventListener(
    "popstate",
    router
);

// Escuchar cambios de URL dentro de la SPA

window.addEventListener(
    "popstate",
    router
);