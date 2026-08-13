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

        try {

            const profile =
                await getCurrentUserProfile();


        } catch (error) {

            console.error(
                "Error obteniendo perfil:",
                error
            );

        }

    } else {


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


async function testFirestore() {

    try {

        const categories =
            await getCategories();


    } catch (error) {

        console.error(
            "✗ Categorías:",
            error
        );

    }


    try {

        const products =
            await getProducts();


    } catch (error) {

        console.error(
            "✗ Productos:",
            error
        );

    }


    try {

        const customers =
            await getCustomers();


    } catch (error) {

        console.error(
            "✗ Clientes:",
            error
        );

    }


    try {

        const orders =
            await getOrders();

    } catch (error) {

        console.error(
            "✗ Pedidos:",
            error
        );

    }


    try {

        const inventory =
            await getInventory();


    } catch (error) {

        console.error(
            "✗ Inventario:",
            error
        );

    }


    try {

        const inventoryMovements =
            await getInventoryMovements();


    } catch (error) {

        console.error(
            "✗ Movimientos:",
            error
        );

    }


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


testFirestore();