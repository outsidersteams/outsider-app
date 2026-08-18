import { router } from "./router.js";

import {
    getCategories,
    getUserProfile,
    getProducts,
    getCustomers,
    getOrders,
    getInventory,
    getInventoryMovements,
    getProductionOrders
} from "./firebase/firestore.js";

import {
    login,
    observeAuth,
    auth
} from "./firebase/auth.js";

import { app as firebaseApp } from "./firebase/config.js";

import {
    getCurrentUserProfile
} from "./firebase/userService.js";


// ========================================
// OUTSIDER — GLOBAL APP LOADER
// ========================================

function hideAppLoader() {

    const loader =
        document.querySelector(
            "#app-loader"
        );

    if (!loader) {

        return;

    }

    loader.classList.add(
        "is-hidden"
    );


    setTimeout(() => {

        loader.remove();

    }, 300);

}


// ========================================
// OUTSIDER API — FIRESTORE TEST
// ========================================
//
// PRUEBA TEMPORAL.
//
// Firebase Auth
//      ↓
// Firebase ID Token
//      ↓
// Cloudflare outsider-api
//      ↓
// Service Account
//      ↓
// Firestore
//      ↓
// READ ONLY
//
// Esta prueba NO modifica Firestore.
// ========================================

async function testOutsiderFirestore() {

    const user =
        auth.currentUser;


    if (!user) {

        console.warn(
            "OUTSIDER FIRESTORE TEST: no hay usuario autenticado."
        );

        return;

    }


    try {

        // ====================================
        // 1. OBTENER FIREBASE ID TOKEN
        // ====================================

        const idToken =
            await user.getIdToken(
                true
            );


        if (!idToken) {

            throw new Error(
                "Firebase no devolvió un ID Token."
            );

        }


        // ====================================
        // 2. LLAMAR CLOUDFLARE
        // ====================================

        const response =
            await fetch(

                "https://outsider-api.outsidersteams.workers.dev/firestore-test",

                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${idToken}`,

                        "Accept":
                            "application/json"

                    }

                }

            );


        // ====================================
        // 3. LEER RESPUESTA
        // ====================================

        let result =
            null;


        try {

            result =
                await response.json();

        } catch {

            throw new Error(
                "Cloudflare no devolvió JSON válido."
            );

        }


        // ====================================
        // 4. MOSTRAR RESULTADO
        // ====================================

        if (!response.ok) {

            console.error(
                "✗ OUTSIDER FIRESTORE TEST:",
                result
            );

            return;

        }


        console.log(
            "✓ OUTSIDER FIRESTORE TEST:",
            result
        );


    } catch (error) {

        console.error(
            "✗ OUTSIDER FIRESTORE TEST ERROR:",
            error
        );

    }

}


// ========================================
// OUTSIDER API — PHYSICAL ORDER VALIDATION
// ========================================
//
// PRUEBA TEMPORAL.
//
// Esta prueba NO descuenta inventario.
// NO crea orders.
// NO crea inventoryMovements.
// NO modifica Firestore.
//
// Producto de prueba:
//
// productId:
// 2cHYZVhC6upYsq6xE7H5
//
// variantId:
// imagen-1
//
// sizeId:
// imagen-1
//
// quantity:
// 1
// ========================================

window.testPhysicalOrderValidation =
    async function () {

        console.log(
            "========================================"
        );

        console.log(
            "OUTSIDER PHYSICAL ORDER VALIDATION"
        );

        console.log(
            "========================================"
        );


        const user =
            auth.currentUser;


        if (!user) {

            console.error(
                "✗ No hay usuario autenticado."
            );

            return;

        }


        console.log(
            "✓ Usuario autenticado:",
            user.uid
        );


        console.log(
            "✓ Email:",
            user.email
        );


        try {

            // ====================================
            // 1. FIREBASE ID TOKEN
            // ====================================

            const idToken =
                await user.getIdToken(
                    true
                );


            if (!idToken) {

                throw new Error(
                    "Firebase no devolvió un ID Token."
                );

            }


            console.log(
                "✓ Firebase ID Token obtenido."
            );


            // ====================================
            // 2. REQUEST
            // ====================================

            const requestBody = {

                items: [

                    {

                        productId:
                            "2cHYZVhC6upYsq6xE7H5",

                        variantId:
                            "imagen-1",

                        sizeId:
                            "imagen-1",

                        quantity:
                            1

                    }

                ]

            };


            console.log(
                "→ Request físico:",
                requestBody
            );


            // ====================================
            // 3. LLAMAR CLOUDFLARE
            // ====================================

            const response =
                await fetch(

                    "https://outsider-api.outsidersteams.workers.dev/customer/order/validate",

                    {

                        method:
                            "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${idToken}`,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }

                );


            // ====================================
            // 4. RESPONSE
            // ====================================

            let result =
                null;


            try {

                result =
                    await response.json();

            } catch {

                throw new Error(
                    "Cloudflare no devolvió JSON válido."
                );

            }


            if (!response.ok) {

                console.error(
                    "✗ OUTSIDER PHYSICAL VALIDATION:",
                    result
                );

                return result;

            }


            console.log(
                "✓ OUTSIDER PHYSICAL VALIDATION:",
                result
            );


            return result;


        } catch (error) {

            console.error(
                "✗ OUTSIDER PHYSICAL VALIDATION ERROR:",
                error
            );

        }

    };


// ========================================
// OUTSIDER API — MADE-TO-ORDER VALIDATION
// ========================================
//
// PRUEBA TEMPORAL.
//
// Producto:
//
// productId:
// SmjUsBZJgrinlXAg50CP
//
// variantId:
// negro
//
// sizeId:
// s
//
// quantity:
// 1
// ========================================

window.testMadeToOrderValidation =
    async function () {

        console.log(
            "========================================"
        );

        console.log(
            "OUTSIDER MADE-TO-ORDER ORDER VALIDATION"
        );

        console.log(
            "========================================"
        );


        const user =
            auth.currentUser;


        if (!user) {

            console.error(
                "✗ No hay usuario autenticado."
            );

            return;

        }


        console.log(
            "✓ Usuario autenticado:",
            user.uid
        );


        console.log(
            "✓ Email:",
            user.email
        );


        try {

            // ====================================
            // 1. FIREBASE ID TOKEN
            // ====================================

            const idToken =
                await user.getIdToken(
                    true
                );


            if (!idToken) {

                throw new Error(
                    "Firebase no devolvió un ID Token."
                );

            }


            console.log(
                "✓ Firebase ID Token obtenido."
            );


            // ====================================
            // 2. REQUEST
            // ====================================

            const requestBody = {

                items: [

                    {

                        productId:
                            "SmjUsBZJgrinlXAg50CP",

                        variantId:
                            "negro",

                        sizeId:
                            "s",

                        quantity:
                            1

                    }

                ]

            };


            console.log(
                "→ Request made_to_order:",
                requestBody
            );


            // ====================================
            // 3. LLAMAR CLOUDFLARE
            // ====================================

            const response =
                await fetch(

                    "https://outsider-api.outsidersteams.workers.dev/customer/order/validate",

                    {

                        method:
                            "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${idToken}`,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }

                );


            // ====================================
            // 4. RESPONSE
            // ====================================

            let result =
                null;


            try {

                result =
                    await response.json();

            } catch {

                throw new Error(
                    "Cloudflare no devolvió JSON válido."
                );

            }


            if (!response.ok) {

                console.error(
                    "✗ OUTSIDER MADE-TO-ORDER VALIDATION:",
                    result
                );

                return result;

            }


            console.log(
                "✓ OUTSIDER MADE-TO-ORDER VALIDATION:",
                result
            );


            return result;


        } catch (error) {

            console.error(
                "✗ OUTSIDER MADE-TO-ORDER VALIDATION ERROR:",
                error
            );

        }

    };


// ========================================
// OUTSIDER API — CUSTOMER ORDER CREATE TEST
// ========================================
//
// PRUEBA TEMPORAL — ESCRITURA REAL.
//
// Esta prueba CREARÁ una orden real.
//
// Producto físico:
//
// productId:
// 2cHYZVhC6upYsq6xE7H5
//
// variantId:
// imagen-1
//
// sizeId:
// imagen-1
//
// quantity:
// 1
// ========================================

window.testCustomerOrderCreate =
    async function () {

        console.log(
            "========================================"
        );

        console.log(
            "OUTSIDER CUSTOMER ORDER CREATE"
        );

        console.log(
            "========================================"
        );


        const user =
            auth.currentUser;


        if (!user) {

            console.error(
                "✗ No hay usuario autenticado."
            );

            return;

        }


        console.log(
            "✓ Usuario autenticado:",
            user.uid
        );


        console.log(
            "✓ Email:",
            user.email
        );


        try {

            // ====================================
            // 1. FIREBASE ID TOKEN
            // ====================================

            const idToken =
                await user.getIdToken(
                    true
                );


            if (!idToken) {

                throw new Error(
                    "Firebase no devolvió un ID Token."
                );

            }


            console.log(
                "✓ Firebase ID Token obtenido."
            );


            // ====================================
            // 2. REQUEST
            // ====================================

            const requestBody = {

                items: [

                    {

                        productId:
                            "2cHYZVhC6upYsq6xE7H5",

                        variantId:
                            "imagen-1",

                        sizeId:
                            "imagen-1",

                        quantity:
                            1

                    }

                ]

            };


            console.log(
                "→ Request CREATE:",
                requestBody
            );


            // ====================================
            // 3. CREATE ORDER
            // ====================================

            const response =
                await fetch(

                    "https://outsider-api.outsidersteams.workers.dev/customer/order/create",

                    {

                        method:
                            "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${idToken}`,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }

                );


            // ====================================
            // 4. RESPONSE
            // ====================================

            let result =
                null;


            try {

                result =
                    await response.json();

            } catch {

                throw new Error(
                    "Cloudflare no devolvió JSON válido."
                );

            }


            if (!response.ok) {

                console.error(
                    "✗ OUTSIDER CUSTOMER ORDER CREATE:",
                    result
                );

                return result;

            }


            console.log(
                "✓ OUTSIDER CUSTOMER ORDER CREATE:",
                result
            );


            return result;


        } catch (error) {

            console.error(
                "✗ OUTSIDER CUSTOMER ORDER CREATE ERROR:",
                error
            );

        }

    };


// ========================================
// FIREBASE AUTH STATE
// ========================================

observeAuth(async (user) => {

    if (user) {

        try {

            const profile =
                await getCurrentUserProfile();

        } catch (error) {

            console.error(
                "Error obteniendo perfil:",
                error
            );

        }


        // ====================================
        // TEMPORARY BACKEND TEST
        // ====================================

        await testOutsiderFirestore();

    }


    // ====================================
    // FIREBASE TERMINÓ DE RESTAURAR AUTH
    // ====================================

    await router();

    hideAppLoader();

});


// ========================================
// INITIAL APP
// ========================================
//
// El contenido real lo controla router().
// No dejamos aquí la pantalla provisional
// "Sistema iniciado correctamente."
// ========================================

const app =
    document.querySelector(
        "#app"
    );


// ========================================
// FIRESTORE TESTS
// ========================================

async function testFirestore() {


    // ====================================
    // CATEGORIES
    // ====================================

    try {

        const categories =
            await getCategories();

    } catch (error) {

        console.error(
            "✗ Categorías:",
            error
        );

    }


    // ====================================
    // PRODUCTS
    // ====================================

    try {

        const products =
            await getProducts();

    } catch (error) {

        console.error(
            "✗ Productos:",
            error
        );

    }


    // ====================================
    // CUSTOMERS
    // ====================================

    try {

        const customers =
            await getCustomers();

    } catch (error) {

        console.error(
            "✗ Clientes:",
            error
        );

    }


    // ====================================
    // ORDERS
    // ====================================

    try {

        const orders =
            await getOrders();

    } catch (error) {

        console.error(
            "✗ Pedidos:",
            error
        );

    }


    // ====================================
    // INVENTORY
    // ====================================

    try {

        const inventory =
            await getInventory();

    } catch (error) {

        console.error(
            "✗ Inventario:",
            error
        );

    }


    // ====================================
    // INVENTORY MOVEMENTS
    // ====================================

    try {

        const inventoryMovements =
            await getInventoryMovements();

    } catch (error) {

        console.error(
            "✗ Movimientos:",
            error
        );

    }


    // ====================================
    // PRODUCTION ORDERS
    // ====================================

    try {

        const productionOrders =
            await getProductionOrders();

    } catch (error) {

        console.error(
            "✗ Producción:",
            error
        );

    }

}


// ========================================
// START FIRESTORE TESTS
// ========================================

testFirestore();