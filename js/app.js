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
    observeAuth
} from "./firebase/auth.js";

import { app as firebaseApp } from "./firebase/config.js";

import {
    getCurrentUserProfile
} from "./firebase/userService.js";

observeAuth(async (user) => {

    if (user) {

        console.log(
            "Usuario autenticado:",
            user.uid
        );

        console.log(
            "Email:",
            user.email
        );

        try {

            const profile =
                await getCurrentUserProfile();

            console.log(
                "Usuario completo:",
                profile
            );

        } catch (error) {

            console.error(
                "Error obteniendo perfil:",
                error
            );

        }

    } else {

        console.log(
            "No hay usuario autenticado"
        );

    }

    // Firebase ya terminó de restaurar
    // el estado de autenticación.
    router();

});





const app = document.querySelector("#app");

app.innerHTML = `

    <h1>OUTSIDER</h1>

    <p>
        Sistema iniciado correctamente.
    </p>

`;


console.log("Outsider iniciado correctamente");

console.log("Firebase conectado correctamente");

console.log("Firebase App:", firebaseApp);


async function testFirestore() {

    console.log(
        "========== FIRESTORE TEST =========="
    );

    try {

        const categories =
            await getCategories();

        console.log(
            "✓ Categorías:",
            categories
        );

    } catch (error) {

        console.error(
            "✗ Categorías:",
            error
        );

    }


    try {

        const products =
            await getProducts();

        console.log(
            "✓ Productos:",
            products
        );

    } catch (error) {

        console.error(
            "✗ Productos:",
            error
        );

    }


    try {

        const customers =
            await getCustomers();

        console.log(
            "✓ Clientes:",
            customers
        );

    } catch (error) {

        console.error(
            "✗ Clientes:",
            error
        );

    }


    try {

        const orders =
            await getOrders();

        console.log(
            "✓ Pedidos:",
            orders
        );

    } catch (error) {

        console.error(
            "✗ Pedidos:",
            error
        );

    }


    try {

        const inventory =
            await getInventory();

        console.log(
            "✓ Inventario:",
            inventory
        );

    } catch (error) {

        console.error(
            "✗ Inventario:",
            error
        );

    }


    try {

        const inventoryMovements =
            await getInventoryMovements();

        console.log(
            "✓ Movimientos:",
            inventoryMovements
        );

    } catch (error) {

        console.error(
            "✗ Movimientos:",
            error
        );

    }


    try {

        const productionOrders =
            await getProductionOrders();

        console.log(
            "✓ Producción:",
            productionOrders
        );

    } catch (error) {

        console.error(
            "✗ Producción:",
            error
        );

    }


    console.log(
        "========== FIRESTORE TEST END =========="
    );
}


testFirestore();