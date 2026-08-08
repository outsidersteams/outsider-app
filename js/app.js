import { app as firebaseApp } from "./firebase/config.js";

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