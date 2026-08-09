import { router } from "./router.js";
import {
    login,
    observeAuth
} from "./firebase/auth.js";

import { app as firebaseApp } from "./firebase/config.js";

import {
    getCategories,
    getUserProfile
} from "./firebase/firestore.js";

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

    try {

        const categories = await getCategories();

        console.log(
            "Categorías desde Firestore:",
            categories
        );

    } catch (error) {

        console.error(
            "Error conectando con Firestore:",
            error
        );

    }

}


testFirestore();