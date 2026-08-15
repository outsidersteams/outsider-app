// ========================================
// OUTSIDER — USER SERVICE
// ========================================

import {
    getCurrentAuthUser
} from "./auth.js";

import {
    getUserProfile,
    getCustomerByAuthUid,
    getCustomerByEmail,
    linkCustomerAuthUid,
    createCustomerAccount,
    getEnterpriseUserByUid
} from "./firestore.js";


// ========================================
// GET CURRENT ENTERPRISE USER PROFILE
// ========================================

export async function getCurrentUserProfile() {

    const user =
        getCurrentAuthUser();

    if (!user) {
        return null;
    }

    const profile =
        await getUserProfile(
            user.uid
        );

    return profile;
}


// ========================================
// GET CURRENT CUSTOMER
// ========================================

export async function getCurrentCustomer() {

    const user =
        getCurrentAuthUser();

    if (!user) {
        return null;
    }

    const enterpriseUser =
        await getEnterpriseUserByUid(
            user.uid
        );

    if (enterpriseUser) {

        console.warn(
            "El UID pertenece a Enterprise. No se devolverá como Customer:",
            {
                uid:
                    user.uid,

                role:
                    enterpriseUser.role
            }
        );

        return null;
    }


    // ========================================
    // 1. BUSCAR CUSTOMER POR AUTH UID
    // ========================================

    const customer =
        await getCustomerByAuthUid(
            user.uid
        );

    if (customer) {
        return customer;
    }


    // ========================================
    // 2. FALLBACK SEGURO POR EMAIL
    // ========================================
    //
    // Cubre Customers creados previamente
    // desde Enterprise que todavía no tenían
    // authUid cuando crearon su cuenta Web.
    // ========================================

    const email =
        String(
            user.email || ""
        )
            .trim()
            .toLowerCase();

    if (!email) {
        return null;
    }

    const existingEmailCustomer =
        await getCustomerByEmail(
            email
        );

    if (!existingEmailCustomer) {
        return null;
    }


    // ========================================
    // CUSTOMER VINCULADO A OTRA CUENTA
    // ========================================

    if (
        existingEmailCustomer.authUid &&
        existingEmailCustomer.authUid !== user.uid
    ) {

        console.warn(
            "El Customer ya está vinculado a otra cuenta:",
            existingEmailCustomer.id
        );

        return null;
    }


    // ========================================
    // VINCULAR CUSTOMER EXISTENTE
    // ========================================

    const linkedCustomer =
        await linkCustomerAuthUid(
            existingEmailCustomer.id,
            user.uid
        );

    console.log(
        "✓ Customer existente vinculado desde getCurrentCustomer:",
        linkedCustomer.id
    );

    return linkedCustomer;
}


// ========================================
// ENSURE CUSTOMER ACCOUNT
// ========================================
//
// Firebase Authentication
//          ↓
// Enterprise → bloquear
//          ↓
// authUid
//          ↓
// email
//          ↓
// vincular / crear
// ========================================

export async function ensureCustomerAccount(
    user,
    additionalData = {}
) {

    if (!user) {

        throw new Error(
            "No existe un usuario autenticado."
        );

    }


    // ========================================
    // 0. CHECK ENTERPRISE USER
    // ========================================

    const enterpriseUser =
        await getEnterpriseUserByUid(
            user.uid
        );

    if (enterpriseUser) {

        console.warn(
            "Cuenta Enterprise detectada:",
            {
                uid:
                    user.uid,

                role:
                    enterpriseUser.role
            }
        );

        throw new Error(
            "Esta cuenta pertenece al área Enterprise y no puede utilizarse como cuenta Customer."
        );
    }


    // ========================================
    // 1. BUSCAR CUSTOMER POR AUTH UID
    // ========================================

    const existingAuthCustomer =
        await getCustomerByAuthUid(
            user.uid
        );

    if (existingAuthCustomer) {

        console.log(
            "✓ Customer encontrado por authUid:",
            existingAuthCustomer.id
        );

        return existingAuthCustomer;
    }


    // ========================================
    // 2. BUSCAR CUSTOMER POR EMAIL
    // ========================================

    const email =
        String(
            user.email || ""
        )
            .trim()
            .toLowerCase();

    if (!email) {

        throw new Error(
            "La cuenta de autenticación no tiene un correo electrónico válido."
        );

    }

    const existingEmailCustomer =
        await getCustomerByEmail(
            email
        );

    if (existingEmailCustomer) {

        console.log(
            "Customer existente encontrado por email:",
            existingEmailCustomer.id
        );


        // ========================================
        // CUSTOMER YA VINCULADO A OTRA CUENTA
        // ========================================

        if (
            existingEmailCustomer.authUid &&
            existingEmailCustomer.authUid !== user.uid
        ) {

            throw new Error(
                "Este Customer ya está vinculado a otra cuenta."
            );

        }


        // ========================================
        // VINCULAR CUSTOMER EXISTENTE
        // ========================================

        const linkedCustomer =
            await linkCustomerAuthUid(
                existingEmailCustomer.id,
                user.uid
            );

        console.log(
            "✓ Customer existente vinculado:",
            linkedCustomer.id
        );

        return linkedCustomer;
    }


    // ========================================
    // 3. CREAR NUEVO CUSTOMER
    // ========================================

    const customer =
        await createCustomerAccount(
            {

                name:
                    additionalData.name ||
                    user.displayName ||
                    "",

                email:
                    email,

                phone:
                    additionalData.phone ||
                    "",

                address:
                    additionalData.address ||
                    {},

                notes:
                    additionalData.notes ||
                    ""

            },
            user.uid
        );

    console.log(
        "✓ Nuevo Customer Account creado:",
        customer.id
    );

    return customer;
}
