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
    EnterpriseOrders,
    initEnterpriseOrders
} from "./enterprise/orders.js";

import {
    EnterpriseProducts,
    initEnterpriseProducts
} from "./enterprise/products.js";

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
        EnterpriseProduction,


    "/enterprise/orders":
        EnterpriseOrders,


    "/enterprise/products":
        EnterpriseProducts

};


// ========================================
// NAVIGATION
// ========================================

export async function navigate(
    path
) {

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
        path === "/enterprise/production" ||
        path === "/enterprise/orders" ||
        path === "/enterprise/products";


    let routeContent;

    let enterpriseProfile = null;


    // ========================================
    // ENTERPRISE ROUTES
    // ========================================

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
                enterpriseProfile
            );

    }


    // ========================================
    // PUBLIC ROUTES
    // ========================================

    else {

        routeContent =
            route();

    }


    // ========================================
    // RENDER ROUTE
    // ========================================

    app.innerHTML =
        routeContent;


    // ========================================
    // ENTERPRISE LAYOUT
    // ========================================

    /*
        Orders utiliza EnterpriseLayout
        desde el router.

        Products utiliza EnterpriseLayout
        internamente, igual que Dashboard.

        Por eso Products NO se inicializa
        aquí para evitar duplicar el Layout.
    */

    if (
        path === "/enterprise/orders"
    ) {

        initEnterpriseLayout();

    }


    // ========================================
    // ENTERPRISE PRODUCTION INIT
    // ========================================

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
    // ENTERPRISE ORDERS INIT
    // ========================================

    if (
        path === "/enterprise/orders"
    ) {

        await initEnterpriseOrders();

    }


    // ========================================
    // ENTERPRISE PRODUCTS INIT
    // ========================================

    if (
        path === "/enterprise/products"
    ) {

        await initEnterpriseProducts(
            enterpriseProfile
        );

    }

}


// ========================================
// SPA NAVIGATION
// ========================================

window.addEventListener(
    "popstate",
    router
);