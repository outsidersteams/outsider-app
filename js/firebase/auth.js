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
// LOGOUT
// ========================================

export async function logout() {

    await signOut(auth);

}


// ========================================
// EXPORT AUTH INSTANCE
// ========================================

export { auth };