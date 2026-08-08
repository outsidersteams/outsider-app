import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

const firebaseConfig = {

    apiKey: "AIzaSyDGqHIaEeVRQzKUSBC8JUBTjBq0ecf32j8",
    authDomain: "outsider-data-base.firebaseapp.com",
    projectId: "outsider-data-base",
    storageBucket: "outsider-data-base.firebasestorage.app",
    messagingSenderId: "252419339022",
    appId: "1:252419339022:web:f24242e96f419bc8949d5f"

};

const app = initializeApp(firebaseConfig);

export { app };