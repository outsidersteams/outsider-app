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

import {
    initEnterpriseLayout
} from "./components/enterpriseLayout.js";


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

    await router();

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

        let routeContent;


        if (path === "/enterprise/dashboard") {

            const access =
                await checkEnterpriseAccess();


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


            routeContent = route(
                access.profile
            );


        } else {

            routeContent = route();

        }


        // ========================================
        // RENDER ROUTE
        // ========================================

        app.innerHTML = routeContent;


        // ========================================
        // ENTERPRISE LOGIN INIT
        // ========================================

        if (
            path === "/enterprise/login"
        ) {

            initEnterpriseLogin();

        }


        // ========================================
        // ENTERPRISE LAYOUT INIT
        // ========================================

        if (
            path === "/enterprise/dashboard"
        ) {

            initEnterpriseLayout();

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