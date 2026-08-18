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
    EnterpriseInventory,
    initEnterpriseInventory
} from "./enterprise/inventory.js";

import {
    EnterpriseCustomers,
    initEnterpriseCustomers
} from "./enterprise/customers.js";
import {
    CustomerCart,
    initCustomerCart
} from "./customer/cart.js";

import {
    checkEnterpriseAccess
} from "./enterprise/authGuard.js";

import {
    initEnterpriseLayout
} from "./components/enterpriseLayout.js";

import {
    CustomerHome,
    initCustomerHome
} from "./customer/home.js";

import {
    CustomerShop,
    initCustomerShop
} from "./customer/shop.js";

import {
    CustomerProduct,
    initCustomerProduct
} from "./customer/product.js";
import {
    CustomerAccount,
    initCustomerAccount
} from "./customer/account.js";
import {
    CustomerCheckout,
    initCustomerCheckout
} from "./customer/checkout.js";
import {
    CustomerPayment,
    initCustomerPayment
} from "./customer/payment.js";
// ========================================
// ROUTES
// ========================================

const routes = {

    // ====================================
    // CUSTOMER
    // ====================================

    "/":
        CustomerHome,

    "/shop":
        CustomerShop,

    "/product":
        CustomerProduct,

    "/cart":
        CustomerCart,

    "/account":
        CustomerAccount,


    // ====================================
    // ENTERPRISE
    // ====================================

    "/enterprise/login":
        EnterpriseLogin,

    "/enterprise/dashboard":
        EnterpriseDashboard,

    "/enterprise/production":
        EnterpriseProduction,

    "/enterprise/orders":
        EnterpriseOrders,

    "/enterprise/products":
        EnterpriseProducts,

    "/enterprise/inventory":
        EnterpriseInventory,

    "/enterprise/customers":
        EnterpriseCustomers,

    "/checkout":
    CustomerCheckout,
    "/payment": CustomerPayment

};

// ========================================
// PAGE TITLES
// ========================================

const pageTitles = {

    "/":
        "OUTSIDER",

    "/shop":
        "Shop — OUTSIDER",

    "/product":
        "Producto — OUTSIDER",

    "/cart":
        "Carrito — OUTSIDER",

    "/account":
        "Mi cuenta — OUTSIDER",

    "/checkout":
        "Checkout — OUTSIDER",

    "/payment":
        "Payment — OUTSIDER",

    "/enterprise/login":
        "Enterprise — OUTSIDER",

    "/enterprise/dashboard":
        "Dashboard — OUTSIDER",

    "/enterprise/production":
        "Producción — OUTSIDER",

    "/enterprise/orders":
        "Pedidos — OUTSIDER",

    "/enterprise/products":
        "Productos — OUTSIDER",

    "/enterprise/inventory":
        "Inventario — OUTSIDER",

    "/enterprise/customers":
        "Clientes — OUTSIDER"

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

    // ========================================
// DOCUMENT TITLE
// ========================================

document.title =
    pageTitles[path] ||
    "OUTSIDER";
    
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

        <main
            class="customer-not-found"
            aria-labelledby="not-found-title"
        >

            <div class="customer-not-found__content">

                <p
                    class="customer-not-found__code"
                    aria-hidden="true"
                >
                    404
                </p>

                <h1
                    id="not-found-title"
                    class="customer-not-found__title"
                >
                    Página no encontrada
                </h1>

                <p
                    class="customer-not-found__message"
                >
                    La página que buscas no existe,
                    fue movida o ya no está disponible.
                </p>

                <a
                    href="/"
                    class="customer-not-found__action"
                    data-link
                >
                    VOLVER AL INICIO
                </a>

            </div>

        </main>

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
        path === "/enterprise/products" ||
        path === "/enterprise/inventory" ||
        path === "/enterprise/customers";


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


    // ========================================
    // ENTERPRISE INVENTORY INIT
    // ========================================

    if (
        path === "/enterprise/inventory"
    ) {

        initEnterpriseInventory(
            enterpriseProfile
        );

    }


    // ========================================
    // ENTERPRISE CUSTOMERS INIT
    // ========================================

    if (
        path === "/enterprise/customers"
    ) {

        await initEnterpriseCustomers(
            enterpriseProfile
        );

    }


    // ========================================
    // CUSTOMER HOME INIT
    // ========================================

    if (
        path === "/"
    ) {

        await initCustomerHome();

    }


    // ========================================
    // CUSTOMER SHOP INIT
    // ========================================

    if (
        path === "/shop"
    ) {

        await initCustomerShop();

    }
    // ========================================
// CUSTOMER CART INIT
// ========================================

if (
    path === "/cart"
) {

    initCustomerCart();

}
    // ========================================
// CUSTOMER PRODUCT INIT
// ========================================

if (
    path === "/product"
) {

    await initCustomerProduct();

}
// ========================================
// CUSTOMER ACCOUNT INIT
// ========================================

if (
    path === "/account"
) {

    initCustomerAccount();

}
if (path === "/checkout") {

    await initCustomerCheckout();

}
if (path === "/payment") {
    initCustomerPayment();
}

}


// ========================================
// SPA NAVIGATION
// ========================================

window.addEventListener(
    "popstate",
    router
);