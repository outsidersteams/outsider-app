import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { app } from "./config.js";


const auth = getAuth(app);


export async function login(email, password) {

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return userCredential.user;

}


export function observeAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


export function getCurrentAuthUser() {

    return auth.currentUser;

}


export async function logout() {

    await signOut(auth);

}


export { auth };