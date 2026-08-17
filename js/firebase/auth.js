// ========================================
// OUTSIDER — FIREBASE AUTHENTICATION
// ========================================

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { app } from "./config.js";


const auth = getAuth(app);


// ========================================
// LOGIN — EMAIL / PASSWORD
// ========================================

export async function login(email, password) {

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return userCredential.user;

}


// ========================================
// REGISTER — EMAIL / PASSWORD
// ========================================

export async function register(email, password) {

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    return userCredential.user;

}


// ========================================
// LOGIN / REGISTER — GOOGLE
// ========================================

export async function loginWithGoogle() {

    const provider =
        new GoogleAuthProvider();

    const userCredential =
        await signInWithPopup(
            auth,
            provider
        );

    return userCredential.user;

}


// ========================================
// OBSERVE AUTH STATE
// ========================================

export function observeAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// ========================================
// CURRENT AUTH USER
// ========================================

export function getCurrentAuthUser() {

    return auth.currentUser;

}


// ========================================
// CURRENT USER — FIREBASE ID TOKEN
// ========================================
//
// Devuelve el ID Token del usuario actualmente
// autenticado.
//
// Este token será utilizado posteriormente
// para autenticar solicitudes contra
// outsider-api.
//
// Si no existe usuario autenticado,
// devuelve null.
// ========================================

export async function getCurrentUserIdToken() {

    const user =
        auth.currentUser;


    if (!user) {

        return null;

    }


    return await user.getIdToken();

}


// ========================================
// TEST — OUTSIDER API AUTHENTICATION
// ========================================
//
// Esta función es únicamente para comprobar
// la comunicación:
//
// SPA
// ↓
// Firebase Auth
// ↓
// ID Token
// ↓
// Cloudflare outsider-api
// ↓
// /auth-check
//
// No modifica Firestore.
// No modifica Orders.
// No modifica Inventory.
// No modifica Payment.
// ========================================

export async function testOutsiderApiAuth() {

    const idToken =
        await getCurrentUserIdToken();


    if (!idToken) {

        throw new Error(
            "No hay un usuario autenticado."
        );

    }


    const response =
        await fetch(
            "https://outsider-api.outsidersteams.workers.dev/auth-check",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${idToken}`
                }
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            `OUTSIDER API respondió HTTP ${response.status}.`
        );

    }


    return data;

}


// ========================================
// LOGOUT
// ========================================

export async function logout() {

    await signOut(auth);

}


// ========================================
// EXPORT AUTH INSTANCE
// ========================================

export { auth };