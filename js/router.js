import {
    EnterpriseLogin,
    initEnterpriseLogin
} from "./enterprise/login.js";


import {
    EnterpriseDashboard,
    initEnterpriseDashboard
} from "./enterprise/dashboard.js";


import {
    EnterpriseProduction,
    initEnterpriseProduction
} from "./enterprise/production.js";

import {
    checkEnterpriseAccess
} from "./enterprise/authGuard.js";


import {
    initEnterpriseLayout
} from "./components/enterpriseLayout.js";


// ========================================
// ROUTES
// ========================================

const routes = {

    "/": () => {

        return `
            <h1>OUTSIDER</h1>

            <p>
                Store pública
            </p>
        `;

    },


    "/enterprise/login":
        EnterpriseLogin,


    "/enterprise/dashboard":
        EnterpriseDashboard,


    "/enterprise/production":
        EnterpriseProduction

};


// ========================================
// NAVIGATION
// ========================================

export async function navigate(path) {

    window.history.pushState(
        {},
        "",
        path
    );

    await router();

}


// ========================================
// ROUTER
// ========================================

export async function router() {

    const path =
        window.location.pathname;


    const route =
        routes[path];


    const app =
        document.querySelector(
            "#app"
        );


    if (!app) {

        console.error(
            "No se encontró #app"
        );

        return;

    }


    // ========================================
    // ROUTE NOT FOUND
    // ========================================

    if (!route) {

        app.innerHTML = `

            <h1>
                404
            </h1>

            <p>
                Página no encontrada.
            </p>

        `;

        return;

    }


    // ========================================
    // ENTERPRISE ACCESS
    // ========================================

    const isEnterpriseRoute =
        path === "/enterprise/dashboard" ||
        path === "/enterprise/production";

let routeContent;
let enterpriseProfile = null;


    if (isEnterpriseRoute) {

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


    enterpriseProfile =
        access.profile;


    routeContent =
        await route(
            access.profile
        );


} else {

    routeContent =
        route();

}


    // ========================================
    // RENDER ROUTE
    // ========================================

    app.innerHTML =
        routeContent;

if (
    path === "/enterprise/production"
) {

    initEnterpriseProduction(
        enterpriseProfile
    );

}
    // ========================================
    // ENTERPRISE LOGIN INIT
    // ========================================

    if (
        path === "/enterprise/login"
    ) {

        initEnterpriseLogin();

    }


    // ========================================
    // ENTERPRISE DASHBOARD INIT
    // ========================================

    if (
        path === "/enterprise/dashboard"
    ) {

        initEnterpriseDashboard();

    }


    // ========================================
    // ENTERPRISE LAYOUT INIT
    // ========================================

    if (
        path === "/enterprise/dashboard" ||
        path === "/enterprise/production"
    ) {

        initEnterpriseLayout();

    }

}


// ========================================
// SPA NAVIGATION
// ========================================

window.addEventListener(
    "popstate",
    router
);