import {
    getFirestore,
    collection,
    getDocs,
    getDocsFromServer,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    writeBatch,
    serverTimestamp,
    addDoc,
    query,
    where,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { app, firebaseConfig } from "./config.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    getApps,
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_REFUND_APP_NAME =
    "outsider-admin-refund";

function getAdminRefundApp() {

    const existingApp =
        getApps().find(
            item =>
                item.name ===
                ADMIN_REFUND_APP_NAME
        );

    return existingApp ||
        initializeApp(
            firebaseConfig,
            ADMIN_REFUND_APP_NAME
        );

}

export async function getCategories() {

    const categoriesRef =
        collection(db, "categories");

    const snapshot =
        await getDocs(categoriesRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function getUserProfile(uid) {

    const userRef =
        doc(db, "users", uid);

    const snapshot =
        await getDoc(userRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}
export async function getProducts() {

    const productsRef =
        collection(db, "products");


    const productsQuery =
        query(
            productsRef,

            where(
                "active",
                "==",
                true
            ),

            where(
                "publishedActive.web",
                "==",
                true
            )
        );


    const snapshot =
        await getDocs(
            productsQuery
        );


    return snapshot.docs.map(
        document => ({
            id:
                document.id,

            ...document.data()
        })
    );

}

// ========================================
// CUSTOMER WEB — PRODUCT CACHE
// ========================================
//
// El catálogo público se cachea en localStorage para
// evitar lecturas repetidas cuando el cliente navega
// entre productos dentro de la SPA.
//
// TTL corto: 60 segundos. La disponibilidad pública
// se mantiene en `productAvailability`.
// El stock real jamás depende del cache: Payment/Order
// vuelve a validar el inventory real.
//
// ========================================

const CUSTOMER_PRODUCTS_CACHE_KEY =
    "outsider_customer_products_cache_v1";

const CUSTOMER_PRODUCTS_CACHE_TTL_MS =
    60 * 1000;

export async function getCustomerProductsCached(
    options = {}
) {

    const forceRefresh =
        options.forceRefresh === true;

    const now =
        Date.now();

    if (!forceRefresh) {

        try {

            const raw =
                localStorage.getItem(
                    CUSTOMER_PRODUCTS_CACHE_KEY
                );

            if (raw) {

                const cached =
                    JSON.parse(raw);

                if (
                    Array.isArray(cached.products) &&
                    Number.isFinite(cached.savedAt) &&
                    now - cached.savedAt <
                    CUSTOMER_PRODUCTS_CACHE_TTL_MS
                ) {

                    return cached.products;

                }

            }

        } catch (error) {

            console.warn(
                "No se pudo leer el cache de productos Customer:",
                error
            );

        }

    }

    const products =
        await getProducts();

    try {

        localStorage.setItem(
            CUSTOMER_PRODUCTS_CACHE_KEY,
            JSON.stringify({
                savedAt: now,
                products
            })
        );

    } catch (error) {

        console.warn(
            "No se pudo guardar el cache de productos Customer:",
            error
        );

    }

    return products;

}

export function clearCustomerProductsCache() {

    try {

        localStorage.removeItem(
            CUSTOMER_PRODUCTS_CACHE_KEY
        );

    } catch (error) {

        console.warn(
            "No se pudo limpiar el cache de productos Customer:",
            error
        );

    }

}

// ========================================
// CUSTOMER WEB — PRODUCT AVAILABILITY CACHE
// ========================================
//
// La disponibilidad pública se mantiene separada de
// `products` para que Enterprise pueda actualizarla sin
// abrir permisos de escritura sobre el catálogo.
//
// El stock real permanece exclusivamente en `inventory`.
// Customer Web solo recibe `available: true/false`.
//
// TTL corto: 30 segundos.
// En una recarga completa del navegador Product Detail
// puede solicitar una lectura fresca explícita.
//
// ========================================

const CUSTOMER_PRODUCT_AVAILABILITY_CACHE_PREFIX =
    "outsider_customer_product_availability_v1_";

const CUSTOMER_PRODUCT_AVAILABILITY_CACHE_TTL_MS =
    30 * 1000;

function getCustomerProductAvailabilityCacheKey(
    productId
) {

    return (
        CUSTOMER_PRODUCT_AVAILABILITY_CACHE_PREFIX +
        String(productId || "")
    );

}

export async function getCustomerProductAvailabilityCached(
    productId,
    options = {}
) {

    if (!productId) {
        return [];
    }

    const forceRefresh =
        options.forceRefresh === true;

    const cacheKey =
        getCustomerProductAvailabilityCacheKey(
            productId
        );

    const now =
        Date.now();

    if (!forceRefresh) {

        try {

            const raw =
                localStorage.getItem(
                    cacheKey
                );

            if (raw) {

                const cached =
                    JSON.parse(raw);

                if (
                    Array.isArray(cached.items) &&
                    Number.isFinite(cached.savedAt) &&
                    now - cached.savedAt <
                    CUSTOMER_PRODUCT_AVAILABILITY_CACHE_TTL_MS
                ) {

                    return cached.items;

                }

            }

        } catch (error) {

            console.warn(
                "No se pudo leer el cache de disponibilidad Customer:",
                error
            );

        }

    }

    const availabilityRef =
        collection(
            db,
            "productAvailability"
        );

    const availabilityQuery =
        query(
            availabilityRef,
            where(
                "productId",
                "==",
                productId
            )
        );

    const snapshot =
        forceRefresh
            ? await getDocsFromServer(
                availabilityQuery
            )
            : await getDocs(
                availabilityQuery
            );

    const items =
        snapshot.docs.map(
            document => ({
                id:
                    document.id,

                ...document.data()
            })
        );

    try {

        localStorage.setItem(
            cacheKey,
            JSON.stringify({
                savedAt: now,
                items
            })
        );

    } catch (error) {

        console.warn(
            "No se pudo guardar el cache de disponibilidad Customer:",
            error
        );

    }

    return items;

}

export function clearCustomerProductAvailabilityCache(
    productId
) {

    if (!productId) {
        return;
    }

    try {

        localStorage.removeItem(
            getCustomerProductAvailabilityCacheKey(
                productId
            )
        );

    } catch (error) {

        console.warn(
            "No se pudo limpiar el cache de disponibilidad Customer:",
            error
        );

    }

}

// ========================================
// PARTNERS
// ========================================

export async function getPartners() {

    const partnersRef =
        collection(db, "partners");

    const snapshot =
        await getDocs(partnersRef);

    return snapshot.docs
        .map(document => ({
            id:
                document.id,
            ...document.data()
        }))
        .filter(
            partner =>
                partner &&
                partner.active !== false
        )
        .sort(
            (a, b) => {
                const orderA =
                    Number(a.order);

                const orderB =
                    Number(b.order);

                const normalizedA =
                    Number.isFinite(orderA)
                        ? orderA
                        : Number.MAX_SAFE_INTEGER;

                const normalizedB =
                    Number.isFinite(orderB)
                        ? orderB
                        : Number.MAX_SAFE_INTEGER;

                return normalizedA - normalizedB;
            }
        );

}

// ========================================
// CREATE PRODUCT
// ========================================

export async function createProduct(
    productData
) {

    const productsRef =
        collection(db, "products");

    const productRef =
        await addDoc(
            productsRef,
            {
                ...productData,
                createdAt:
                    serverTimestamp(),
                updatedAt:
                    serverTimestamp()
            }
        );

    return productRef.id;

}


// ========================================
// CUSTOMERS
// ========================================

const CUSTOMER_SOURCES = [
    "web",
    "marketplace",
    "instagram",
    "tiktok",
    "whatsapp",
    "referral",
    "event",
    "physical_store",
    "other"
];

function validateCustomerSource(source) {

    if (!source) {
        return;
    }

    if (!CUSTOMER_SOURCES.includes(source)) {
        throw new Error(
            "El origen del cliente no es válido."
        );
    }

}

function normalizeCustomerData(
    customerData = {}
) {

    const name =
        String(
            customerData.name || ""
        ).trim();

    const phone =
        String(
            customerData.phone || ""
        ).trim();

    const email =
        String(
            customerData.email || ""
        )
            .trim()
            .toLowerCase();

    const acquisitionSource =
        String(
            customerData.acquisitionSource || ""
        ).trim();

    if (!name) {
        throw new Error(
            "El nombre del cliente es obligatorio."
        );
    }

    if (!phone) {
        throw new Error(
            "El teléfono del cliente es obligatorio."
        );
    }

    validateCustomerSource(
        acquisitionSource
    );

    const address =
        customerData.address &&
        typeof customerData.address === "object"
            ? {
                line1:
                    String(customerData.address.line1 || "").trim(),
                line2:
                    String(customerData.address.line2 || "").trim(),
                city:
                    String(customerData.address.city || "").trim(),
                department:
                    String(customerData.address.department || "").trim(),
                country:
                    String(customerData.address.country || "").trim(),
                postalCode:
                    String(customerData.address.postalCode || "").trim()
            }
            : {
                line1: "",
                line2: "",
                city: "",
                department: "",
                country: "",
                postalCode: ""
            };

    return {
        name,
        phone,
        email,
        address,
        notes:
            String(customerData.notes || "").trim(),
        acquisitionSource:
            acquisitionSource || null,
        active:
            customerData.active !== false
    };

}


// ========================================
// GET CUSTOMER
// ========================================

export async function getCustomer(
    customerId
) {

    if (!customerId) {
        throw new Error(
            "El customerId es obligatorio."
        );
    }

    const customerRef =
        doc(
            db,
            "customers",
            customerId
        );

    const snapshot =
        await getDoc(
            customerRef
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id:
            snapshot.id,
        ...snapshot.data()
    };

}


// ========================================
// CREATE CUSTOMER
// ========================================

export async function createCustomer(
    customerData
) {

    const data =
        normalizeCustomerData(
            customerData
        );

    const customersRef =
        collection(
            db,
            "customers"
        );

    const customerRef =
        await addDoc(
            customersRef,
            {
                ...data,
                createdAt:
                    serverTimestamp(),
                updatedAt:
                    serverTimestamp()
            }
        );

    console.log(
        "✓ Cliente creado:",
        customerRef.id
    );

    return customerRef.id;

}


// ========================================
// UPDATE CUSTOMER
// ========================================

export async function updateCustomer(
    customerId,
    customerData
) {

    if (!customerId) {
        throw new Error(
            "El customerId es obligatorio."
        );
    }

    const data =
        normalizeCustomerData(
            customerData
        );

    const customerRef =
        doc(
            db,
            "customers",
            customerId
        );

    const snapshot =
        await getDoc(
            customerRef
        );

    if (!snapshot.exists()) {
        throw new Error(
            "El cliente no existe."
        );
    }

    await updateDoc(
        customerRef,
        {
            ...data,
            updatedAt:
                serverTimestamp()
        }
    );

    console.log(
        "✓ Cliente actualizado:",
        customerId
    );

}



// ========================================
// UPDATE CUSTOMER CHECKOUT DATA
// ========================================
//
// Actualiza únicamente los datos que el Customer
// puede completar/modificar durante Checkout.
//
// NO modifica:
// - authUid
// - email
// - acquisitionSource
// - active
// - notes
// - createdAt
//
// Esto permite que un Customer creado desde
// Enterprise pueda completar sus datos de entrega
// desde Web sin alterar su información administrativa.
// ========================================

export async function updateCustomerCheckoutData(
    customerId,
    customerData = {}
) {

    if (!customerId) {

        throw new Error(
            "El customerId es obligatorio."
        );

    }

    const customerRef =
        doc(
            db,
            "customers",
            customerId
        );

    const snapshot =
        await getDoc(
            customerRef
        );

    if (!snapshot.exists()) {

        throw new Error(
            "El cliente no existe."
        );

    }

    const currentCustomer =
        snapshot.data();

    const name =
        String(
            customerData.name ??
            currentCustomer.name ??
            ""
        ).trim();

    const phone =
        String(
            customerData.phone ??
            currentCustomer.phone ??
            ""
        ).trim();

    if (!name) {

        throw new Error(
            "El nombre del cliente es obligatorio."
        );

    }

    if (!phone) {

        throw new Error(
            "El teléfono del cliente es obligatorio."
        );

    }

    const address =
        customerData.address &&
        typeof customerData.address === "object"
            ? {
                line1:
                    String(
                        customerData.address.line1 ??
                        ""
                    ).trim(),

                line2:
                    String(
                        customerData.address.line2 ??
                        ""
                    ).trim(),

                city:
                    String(
                        customerData.address.city ??
                        ""
                    ).trim(),

                department:
                    String(
                        customerData.address.department ??
                        ""
                    ).trim(),

                country:
                    String(
                        customerData.address.country ??
                        ""
                    ).trim(),

                postalCode:
                    String(
                        customerData.address.postalCode ??
                        ""
                    ).trim()
            }
            : (
                currentCustomer.address &&
                typeof currentCustomer.address === "object"
                    ? currentCustomer.address
                    : {}
            );

    await updateDoc(
        customerRef,
        {
            name,
            phone,
            address,
            updatedAt:
                serverTimestamp()
        }
    );

    console.log(
        "✓ Datos de Checkout actualizados:",
        customerId
    );

    return {
        id:
            customerId,

        ...currentCustomer,

        name,
        phone,
        address
    };

}


// ========================================
// CUSTOMER SOURCE LABEL
// ========================================

export function getCustomerSourceLabel(
    source
) {

    const labels = {
        web: "Web",
        marketplace: "Marketplace",
        instagram: "Instagram",
        tiktok: "TikTok",
        whatsapp: "WhatsApp",
        referral: "Referido",
        event: "Evento",
        physical_store: "Tienda física",
        other: "Otro"
    };

    return (
        labels[source] ||
        "Sin especificar"
    );

}

export async function getCustomers() {

    const customersRef =
        collection(db, "customers");

    const snapshot =
        await getDocs(customersRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}


// ========================================
// CUSTOMER ACCOUNT AUTHENTICATION
// ========================================

export async function getCustomerByAuthUid(
    authUid
) {

    if (!authUid) {

        throw new Error(
            "El authUid es obligatorio."
        );

    }

    const customersRef =
        collection(
            db,
            "customers"
        );

    const customerQuery =
        query(
            customersRef,
            where(
                "authUid",
                "==",
                authUid
            )
        );

    const snapshot =
        await getDocs(
            customerQuery
        );

    if (snapshot.empty) {

        return null;

    }

    const customerDocument =
        snapshot.docs[0];

    return {
        id:
            customerDocument.id,

        ...customerDocument.data()
    };

}


export async function getCustomerByEmail(
    email
) {

    const normalizedEmail =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();

    if (!normalizedEmail) {

        return null;

    }

    const currentUser =
        auth.currentUser;

    if (!currentUser) {

        throw new Error(
            "No hay una cuenta autenticada."
        );

    }

    const authenticatedEmail =
        String(
            currentUser.email || ""
        )
            .trim()
            .toLowerCase();

    // Customer Web solo puede consultar su propio email.
    // Enterprise conserva su acceso mediante las Rules.
    if (
        normalizedEmail !==
        authenticatedEmail
    ) {

        const enterpriseUser =
            await getEnterpriseUserByUid(
                currentUser.uid
            );

        const isEnterpriseAccount =
            enterpriseUser &&
            enterpriseUser.active === true &&
            [
                "employee",
                "manager",
                "admin"
            ].includes(
                enterpriseUser.role
            );

        if (!isEnterpriseAccount) {

            throw new Error(
                "No tienes permiso para consultar este Customer."
            );

        }

    }

    const customersRef =
        collection(
            db,
            "customers"
        );

    const customerQuery =
        query(
            customersRef,
            where(
                "email",
                "==",
                normalizedEmail
            )
        );

    const snapshot =
        await getDocs(
            customerQuery
        );

    if (snapshot.empty) {

        return null;

    }

    const customerDocument =
        snapshot.docs[0];

    return {
        id:
            customerDocument.id,

        ...customerDocument.data()
    };

}


export async function linkCustomerAuthUid(
    customerId,
    authUid
) {

    if (!customerId) {
        throw new Error(
            "El customerId es obligatorio."
        );
    }

    if (!authUid) {
        throw new Error(
            "El authUid es obligatorio."
        );
    }

    const currentUser =
        auth.currentUser;

    if (!currentUser) {
        throw new Error(
            "No hay una cuenta autenticada."
        );
    }

    if (currentUser.uid !== authUid) {
        throw new Error(
            "El authUid no corresponde a la cuenta autenticada."
        );
    }

    const customerRef =
        doc(
            db,
            "customers",
            customerId
        );

    const snapshot =
        await getDoc(
            customerRef
        );

    if (!snapshot.exists()) {
        throw new Error(
            "El cliente no existe."
        );
    }

    const customer =
        snapshot.data();

    if (
        customer.authUid &&
        customer.authUid !== authUid
    ) {
        throw new Error(
            "Este cliente ya está vinculado a otra cuenta."
        );
    }

    const customerEmail =
        String(
            customer.email || ""
        )
            .trim()
            .toLowerCase();

    const authenticatedEmail =
        String(
            currentUser.email || ""
        )
            .trim()
            .toLowerCase();

    if (
        !customerEmail ||
        !authenticatedEmail ||
        customerEmail !== authenticatedEmail
    ) {
        throw new Error(
            "El correo del Customer no coincide con la cuenta autenticada."
        );
    }

    await updateDoc(
        customerRef,
        {
            authUid,
            updatedAt:
                serverTimestamp()
        }
    );

    console.log(
        "✓ Cuenta Customer vinculada:",
        {
            customerId,
            authUid,
            email:
                authenticatedEmail
        }
    );

    return {
        id:
            customerId,

        ...customer,

        authUid
    };
}


export async function createCustomerAccount(
    profileData = {},
    authUid
) {

    if (!authUid) {

        throw new Error(
            "El authUid es obligatorio."
        );

    }

    const name =
        String(
            profileData.name || ""
        ).trim();

    const email =
        String(
            profileData.email || ""
        )
            .trim()
            .toLowerCase();

    if (!name) {

        throw new Error(
            "El nombre del cliente es obligatorio."
        );

    }

    if (!email) {

        throw new Error(
            "El correo del cliente es obligatorio."
        );

    }

    const existingCustomer =
        await getCustomerByEmail(
            email
        );

    if (existingCustomer) {

        if (
            existingCustomer.authUid &&
            existingCustomer.authUid !== authUid
        ) {

            throw new Error(
                "Ya existe un Customer con este correo vinculado a otra cuenta."
            );

        }

        return linkCustomerAuthUid(
            existingCustomer.id,
            authUid
        );

    }

    const customerRef =
        await addDoc(
            collection(
                db,
                "customers"
            ),
            {

                authUid,

                name,

                phone:
                    String(
                        profileData.phone || ""
                    ).trim(),

                email,

                address:
                    profileData.address &&
                    typeof profileData.address === "object"
                        ? profileData.address
                        : {},

                notes:
                    String(
                        profileData.notes || ""
                    ).trim(),

                acquisitionSource:
                    "web",

                active:
                    true,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );

    console.log(
        "✓ Customer Account creado:",
        customerRef.id
    );

    return {

        id:
            customerRef.id,

        authUid,

        name,

        phone:
            String(
                profileData.phone || ""
            ).trim(),

        email,

        address:
            profileData.address &&
            typeof profileData.address === "object"
                ? profileData.address
                : {},

        notes:
            String(
                profileData.notes || ""
            ).trim(),

        acquisitionSource:
            "web",

        active:
            true

    };

}


// ========================================
// SALES — DATA LAYER
// ========================================

/**
 * Obtiene una venta asociada a una orden.
 *
 * La colección sales contiene información financiera
 * y su lectura queda protegida por Firestore Rules.
 */
export async function getSaleByOrderId(
    orderId
) {

    if (!orderId) {
        throw new Error(
            "El orderId es obligatorio."
        );
    }

    const saleRef =
        doc(
            db,
            "sales",
            orderId
        );

    const snapshot =
        await getDoc(
            saleRef
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id:
            snapshot.id,
        ...snapshot.data()
    };

}


/**
 * Crea el registro financiero de una orden.
 *
 * Importante:
 * - No lee sales/{orderId}.
 * - Solo lee la orden.
 * - La protección contra duplicados se apoya en:
 *      1. orders.saleConfirmed / orders.saleId
 *      2. sales/{orderId} como ID determinístico
 *      3. Firestore Rules: sales solo permite CREATE
 *         para Enterprise y UPDATE solo para Admin.
 *
 * Condiciones:
 * - orderStatus      === "completed"
 * - paymentStatus    === "paid"
 * - productionStatus === "ready"
 *
 * Si no requiere producción:
 * - productionStatus === "not_required"
 *   también es válido.
 */
export async function createSaleFromOrder(
    orderId
) {

    if (!orderId) {
        throw new Error(
            "El orderId es obligatorio."
        );
    }

    const currentUser =
        auth.currentUser;

    if (!currentUser) {
        throw new Error(
            "No hay una cuenta autenticada para registrar la venta."
        );
    }

    const saleRef =
        doc(
            db,
            "sales",
            orderId
        );

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    let result = null;

    const currentUserProfile =
        await getUserProfile(
            currentUser.uid
        );

    await runTransaction(
        db,
        async transaction => {

            // =================================
            // OBTENER ORDEN
            // =================================

            const orderSnapshot =
                await transaction.get(
                    orderRef
                );

            if (!orderSnapshot.exists()) {

                throw new Error(
                    "El pedido no existe."
                );

            }

            const order =
                orderSnapshot.data();


            // =================================
            // PROTECCIÓN CONTRA DUPLICADO
            // =================================

            if (
                order.saleConfirmed === true ||
                order.saleId
            ) {

                throw new Error(
                    "Esta orden ya está registrada como venta."
                );

            }


            // =================================
            // ESTADOS
            // =================================

            const orderStatus =
                order.orderStatus ||
                "pending";

            const paymentStatus =
                order.paymentStatus ||
                "pending";

            const productionStatus =
                order.productionStatus ||
                (
                    order.requiresProduction
                        ? "pending"
                        : "not_required"
                );


            // =================================
            // VALIDAR ORDER
            // =================================

            if (
                orderStatus !==
                "completed"
            ) {

                throw new Error(
                    "No se puede registrar la venta: el pedido no está completado."
                );

            }


            // =================================
            // VALIDAR PAYMENT
            // =================================

            if (
                paymentStatus !==
                "paid"
            ) {

                throw new Error(
                    "No se puede registrar la venta: el pago no está marcado como pagado."
                );

            }


            // =================================
            // VALIDAR PRODUCTION
            // =================================

            if (
                order.requiresProduction
                    ? productionStatus !== "ready"
                    : (
                        productionStatus !== "not_required" &&
                        productionStatus !== "ready"
                    )
            ) {

                throw new Error(
                    "No se puede registrar la venta: la producción todavía no está lista."
                );

            }


            // =================================
            // IMPORTES
            // =================================

            const subtotal =
                Number(
                    order.subtotal || 0
                );

            const discountAmount =
                Number(
                    order.discount || 0
                );

            const shippingAmount =
                Number(
                    order.shipping || 0
                );

            const orderTotal =
                Number(order.total);

            const calculatedTotal =
                subtotal +
                shippingAmount -
                discountAmount;

            const netAmount =
                Number.isFinite(orderTotal)
                    ? orderTotal
                    : calculatedTotal;


            // =================================
            // SALE DATA
            // =================================

            const saleData = {

                saleId:
                    orderId,

                orderId,

                orderNumber:
                    order.orderNumber ||
                    null,

                customerId:
                    order.customerId ||
                    null,

                salesChannel:
                    order.salesChannel ||
                    "manual",

                paymentMethod:
                    order.paymentMethod ||
                    "other",

                grossAmount:
                    subtotal,

                subtotal,

                discountAmount,

                shippingAmount,

                netAmount,

                paymentAmount:
                    netAmount,

                status:
                    "completed",

                paymentStatus:
                    "paid",

                confirmedByUid:
                    currentUser.uid,

                confirmedByName:
                    currentUserProfile?.name ||
                    currentUserProfile?.displayName ||
                    currentUserProfile?.fullName ||
                    (
                        currentUserProfile?.firstName &&
                        currentUserProfile?.lastName
                            ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}`
                            : null
                    ) ||
                    currentUser.displayName ||
                    currentUser.email ||
                    "Usuario",

                source:
                    "enterprise",

                version:
                    1,

                saleDate:
                    serverTimestamp(),

                completedAt:
                    serverTimestamp(),

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            // =================================
            // CREAR SALE
            // =================================

            transaction.set(
                saleRef,
                saleData
            );


            // =================================
            // MARCAR ORDER COMO REGISTRADA
            // =================================

            transaction.update(
                orderRef,
                {

                    saleConfirmed:
                        true,

                    saleId:
                        orderId,

                    saleConfirmedByUid:
                        currentUser.uid,

                    saleConfirmedByName:
                        currentUserProfile?.name ||
                        currentUserProfile?.displayName ||
                        currentUserProfile?.fullName ||
                        (
                            currentUserProfile?.firstName &&
                            currentUserProfile?.lastName
                                ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}`
                                : null
                        ) ||
                        currentUser.displayName ||
                        currentUser.email ||
                        "Usuario",

                    saleConfirmedAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            result = {

                created:
                    true,

                alreadyExists:
                    false,

                saleId:
                    orderId,

                ...saleData

            };

        }
    );


    console.log(
        "✓ Venta registrada:",
        {
            orderId,
            saleId:
                result?.saleId
        }
    );


    return result;

}



export async function getOrders() {

    const ordersRef =
        collection(db, "orders");

    const snapshot =
        await getDocs(ordersRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

// ========================================
// CREATE CUSTOMER ORDER — CUSTOMER WEB
// ========================================
//
// Crea una orden desde Customer Web y descuenta
// inventario + registra movimientos dentro de una
// única transacción de Firestore.
//
// IMPORTANTE:
// Firestore Transaction.get() requiere DocumentReference.
// La consulta de inventory obtiene primero el documento
// exacto y luego la transacción vuelve a leer esa referencia
// para protegerse contra cambios concurrentes.
//
// Todas las lecturas de la transacción se realizan
// antes de las escrituras.
//
// El precio real siempre se obtiene desde Firestore.
// El frontend solamente proporciona IDs y cantidades.
//
// ========================================

export async function createCustomerOrder(
    orderData = {}
) {

    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error(
            "No hay una cuenta Customer autenticada."
        );
    }

    const customerId = String(orderData.customerId || "").trim();

    if (!customerId) {
        throw new Error("El Customer es obligatorio.");
    }

    const items = Array.isArray(orderData.items) ? orderData.items : [];

    if (!items.length) {
        throw new Error(
            "El pedido debe contener al menos un producto."
        );
    }

    const paymentMethod = String(
        orderData.paymentMethod || "cash_on_delivery"
    ).trim();

    if (paymentMethod !== "cash_on_delivery") {
        throw new Error(
            "El método de pago seleccionado no está disponible."
        );
    }

    const shipping = Number(orderData.shipping ?? 0);

    if (!Number.isFinite(shipping) || shipping < 0) {
        throw new Error("El costo de envío no es válido.");
    }

    const discount = Number(orderData.discount ?? 0);

    if (!Number.isFinite(discount) || discount < 0) {
        throw new Error("El descuento no es válido.");
    }

    const requestedItems = items.map(item => {
        const productId = String(item.productId || "").trim();
        const variantId = item.variantId ? String(item.variantId).trim() : null;
        const sizeId = item.sizeId ? String(item.sizeId).trim() : null;
        const quantity = Number(item.quantity);

        if (!productId) {
            throw new Error("Uno de los productos no tiene productId.");
        }

        if (
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            !Number.isInteger(quantity)
        ) {
            throw new Error("La cantidad de un producto no es válida.");
        }

        return { productId, variantId, sizeId, quantity };
    });

    const customerRef = doc(db, "customers", customerId);
    const productRefs = requestedItems.map(item =>
        doc(db, "products", item.productId)
    );

    const ordersRef = collection(db, "orders");
    const orderRef = doc(ordersRef);
    const movementsRef = collection(db, "inventoryMovements");

    let result = null;

    await runTransaction(db, async transaction => {

        // ====================================
        // TODAS LAS LECTURAS BASE
        // ====================================

        const transactionCustomerSnapshot =
            await transaction.get(customerRef);

        if (!transactionCustomerSnapshot.exists()) {
            throw new Error("El Customer no existe.");
        }

        const transactionCustomer =
            transactionCustomerSnapshot.data();

        if (transactionCustomer.authUid !== currentUser.uid) {
            throw new Error(
                "El Customer no está vinculado a la cuenta autenticada."
            );
        }

        if (transactionCustomer.active === false) {
            throw new Error("La cuenta Customer está inactiva.");
        }

        const productSnapshots = [];

        for (const productRef of productRefs) {
            productSnapshots.push(
                await transaction.get(productRef)
            );
        }

        // ====================================
        // VALIDAR PRODUCTOS / FULFILLMENT
        // ====================================

        const normalizedItems = [];
        const physicalItems = [];
        let subtotal = 0;
        let requiresProduction = false;

        for (let index = 0; index < requestedItems.length; index++) {

            const requestedItem = requestedItems[index];
            const productSnapshot = productSnapshots[index];

            if (!productSnapshot.exists()) {
                throw new Error(
                    `El producto ${requestedItem.productId} ya no existe.`
                );
            }

            const product = productSnapshot.data();

            if (
                product.active !== true ||
                product.publishedActive?.web !== true
            ) {
                throw new Error(
                    `El producto "${product.name || "Producto"}" ya no está disponible.`
                );
            }

            const fulfillmentType = String(
                product.fulfillment?.type || "physical"
            ).trim().toLowerCase();

            if (!['physical', 'made_to_order'].includes(fulfillmentType)) {
                throw new Error(
                    `El tipo de fulfillment del producto "${product.name || "Producto"}" no es válido.`
                );
            }

            if (fulfillmentType === "made_to_order") {
                requiresProduction = true;
            }

            let variant = null;

            if (requestedItem.variantId) {
                variant = Array.isArray(product.variants)
                    ? product.variants.find(
                        item => item.id === requestedItem.variantId
                    )
                    : null;

                if (!variant) {
                    throw new Error(
                        `La variante del producto "${product.name || "Producto"}" no existe.`
                    );
                }

                if (variant.active === false) {
                    throw new Error(
                        `La variante de "${product.name || "Producto"}" ya no está disponible.`
                    );
                }
            }

            let size = null;

            if (requestedItem.sizeId) {
                if (!variant) {
                    throw new Error(
                        `La talla del producto "${product.name || "Producto"}" requiere una variante.`
                    );
                }

                size = Array.isArray(variant.sizes)
                    ? variant.sizes.find(
                        item => item.id === requestedItem.sizeId
                    )
                    : null;

                if (!size) {
                    throw new Error(
                        `La talla seleccionada de "${product.name || "Producto"}" ya no existe.`
                    );
                }

                if (size.active === false) {
                    throw new Error(
                        `La talla seleccionada de "${product.name || "Producto"}" ya no está disponible.`
                    );
                }
            }

            const candidatePrices = [
                size?.price,
                variant?.price,
                product.price
            ];

            let unitPrice = null;

            for (const candidate of candidatePrices) {
                const numericPrice = Number(candidate);

                if (
                    Number.isFinite(numericPrice) &&
                    numericPrice >= 0
                ) {
                    unitPrice = numericPrice;
                    break;
                }
            }

            if (unitPrice === null) {
                throw new Error(
                    `No se encontró un precio válido para "${product.name || "Producto"}".`
                );
            }

            const lineTotal = unitPrice * requestedItem.quantity;
            subtotal += lineTotal;

            normalizedItems.push({
                productId:
                    requestedItem.productId,

                productName:
                    String(
                        product.name || "Producto"
                    ).trim(),

                fulfillmentType,

                variantId:
                    requestedItem.variantId,

                variantName:
                    variant?.name || null,

                colorName:
                    variant?.colorName ||
                    variant?.color ||
                    null,

                sizeId:
                    requestedItem.sizeId,

                sizeName:
                    size?.name || null,

                sku:
                    size?.sku || null,

                // ====================================
                // ORDER ITEM STANDARD
                // ====================================
                // `unitPrice` y `total` son los nombres
                // canónicos utilizados por la vista de Orders.
                //
                // `price` y `lineTotal` se conservan temporalmente
                // para compatibilidad con código anterior.
                // ====================================

                unitPrice:
                    unitPrice,

                price:
                    unitPrice,

                quantity:
                    requestedItem.quantity,

                total:
                    lineTotal,

                lineTotal:
                    lineTotal,

                inventoryId:
                    null
            });

            if (fulfillmentType === "physical") {
                physicalItems.push({
                    itemIndex: normalizedItems.length - 1,
                    requestedItem
                });
            }
        }

        // ====================================
        // INVENTARIO SOLO PARA PHYSICAL
        // ====================================
        // made_to_order no necesita documento
        // en inventory y no descuenta stock.
        // ====================================

        const inventoryEntries = [];

        for (const physicalItem of physicalItems) {

            const requestedItem = physicalItem.requestedItem;
            const inventoryRef = collection(db, "inventory");
            let inventoryQuery;

            if (requestedItem.sizeId) {
                if (!requestedItem.variantId) {
                    throw new Error(
                        "Una talla requiere una variante válida."
                    );
                }

                inventoryQuery = query(
                    inventoryRef,
                    where("productId", "==", requestedItem.productId),
                    where("variantId", "==", requestedItem.variantId),
                    where("sizeId", "==", requestedItem.sizeId)
                );
            } else if (requestedItem.variantId) {
                inventoryQuery = query(
                    inventoryRef,
                    where("productId", "==", requestedItem.productId),
                    where("variantId", "==", requestedItem.variantId)
                );
            } else {
                inventoryQuery = query(
                    inventoryRef,
                    where("productId", "==", requestedItem.productId)
                );
            }

            const inventorySnapshot = await getDocs(inventoryQuery);

            if (inventorySnapshot.empty) {
                throw new Error(
                    `No existe inventario para el producto ${requestedItem.productId}.`
                );
            }

            if (inventorySnapshot.size > 1) {
                throw new Error(
                    `Existe más de un registro de inventario para el producto ${requestedItem.productId}.`
                );
            }

            const inventoryDocumentRef = inventorySnapshot.docs[0].ref;
            const inventorySnapshotInTransaction =
                await transaction.get(inventoryDocumentRef);

            if (!inventorySnapshotInTransaction.exists()) {
                throw new Error(
                    `El inventario del producto ${requestedItem.productId} ya no existe.`
                );
            }

            const inventory = inventorySnapshotInTransaction.data();
            const normalizedItem = normalizedItems[physicalItem.itemIndex];

            if (inventory.productId !== requestedItem.productId) {
                throw new Error(
                    "El inventario encontrado no corresponde al producto solicitado."
                );
            }

            if (
                requestedItem.variantId &&
                inventory.variantId !== requestedItem.variantId
            ) {
                throw new Error(
                    "El inventario encontrado no corresponde a la variante solicitada."
                );
            }

            if (
                requestedItem.sizeId &&
                inventory.sizeId !== requestedItem.sizeId
            ) {
                throw new Error(
                    "El inventario encontrado no corresponde a la talla solicitada."
                );
            }

            const currentStock = Number(inventory.stock);

            if (!Number.isFinite(currentStock) || currentStock < 0) {
                throw new Error(
                    `El stock de "${normalizedItem.productName}" no es válido.`
                );
            }

            if (requestedItem.quantity > currentStock) {
                throw new Error(
                    `Stock insuficiente para "${normalizedItem.productName}". Disponible: ${currentStock}.`
                );
            }

            normalizedItem.sku =
                normalizedItem.sku || inventory.sku || null;

            normalizedItem.inventoryId = inventoryDocumentRef.id;

            inventoryEntries.push({
                itemIndex: physicalItem.itemIndex,
                ref: inventoryDocumentRef,
                data: inventory
            });
        }

        // ====================================
        // DESCUENTO / TOTAL
        // ====================================

        if (discount > subtotal) {
            throw new Error(
                "El descuento no puede ser mayor que el subtotal."
            );
        }

        const calculatedTotal =
            subtotal + shipping - discount;

        if (
            !Number.isFinite(calculatedTotal) ||
            calculatedTotal <= 0
        ) {
            throw new Error(
                "El total del pedido debe ser mayor a Q0.00."
            );
        }

        // ====================================
        // ORDER NUMBER
        // ====================================
        // El número secuencial oficial debe ser asignado por
        // el backend/Cloud Function que crea la orden Customer.
        // Este data-layer conserva el fallback histórico para
        // no romper llamadas directas existentes.
        //
        // Cuando el backend envía `orderData.orderNumber`, se
        // respeta ese número.
        // ====================================

        const requestedOrderNumber =
            Number(
                orderData.orderNumber
            );

        const orderNumber =
            Number.isInteger(
                requestedOrderNumber
            ) &&
            requestedOrderNumber > 0
                ? requestedOrderNumber
                : Number(
                    String(Date.now()).slice(-9)
                );

        const customerSnapshot = {
            name: transactionCustomer.name || "",
            email:
                transactionCustomer.email ||
                currentUser.email ||
                "",
            phone: transactionCustomer.phone || "",
            address: transactionCustomer.address || {}
        };

        // ====================================
        // WRITES DE INVENTARIO SOLO PHYSICAL
        // ====================================
        //
        // Inventory + inventoryMovement +
        // productAvailability quedan dentro de la
        // MISMA transacción que el Order.
        // ====================================

        for (const inventoryEntry of inventoryEntries) {

            const normalizedItem =
                normalizedItems[inventoryEntry.itemIndex];

            const inventory = inventoryEntry.data;
            const currentStock = Number(inventory.stock);

            const newStock =
                currentStock -
                normalizedItem.quantity;

            transaction.update(
                inventoryEntry.ref,
                {
                    stock:
                        newStock,

                    updatedAt:
                        serverTimestamp()
                }
            );

            const movementRef =
                doc(movementsRef);

            transaction.set(
                movementRef,
                {
                    inventoryId:
                        inventoryEntry.ref.id,

                    productId:
                        inventory.productId,

                    variantId:
                        inventory.variantId ||
                        null,

                    sizeId:
                        inventory.sizeId ||
                        null,

                    sku:
                        inventory.sku ||
                        normalizedItem.sku ||
                        null,

                    type:
                        "exit",

                    quantity:
                        normalizedItem.quantity,

                    reason:
                        "sale",

                    referenceType:
                        "order",

                    referenceId:
                        orderRef.id,

                    notes:
                        "Salida automática por pedido Customer Web.",

                    createdAt:
                        serverTimestamp(),

                    createdBy: {
                        uid:
                            currentUser.uid,

                        name:
                            transactionCustomer.name ||
                            currentUser.displayName ||
                            currentUser.email ||
                            "Customer Web",

                        email:
                            currentUser.email ||
                            null
                    }
                }
            );

            // La disponibilidad pública se actualiza
            // atómicamente con el descuento real.
            await syncProductSizeAvailabilityInTransaction(
                transaction,
                inventory.productId,
                inventory.variantId,
                inventory.sizeId,
                newStock > 0
            );
        }

        const productionStatus =
            requiresProduction
                ? "pending"
                : "not_required";

        const orderDataToSave = {
            orderNumber,
            customerId,
            customerAuthUid: currentUser.uid,
            customerSnapshot,
            // `items` usa el mismo contrato de Orders que Enterprise:
            // unitPrice + total, conservando price + lineTotal por compatibilidad.
            items: normalizedItems,
            subtotal,
            discount,
            shipping,
            total: calculatedTotal,
            orderStatus: "confirmed",
            paymentStatus: "pending",
            productionStatus,
            requiresProduction,
            paymentMethod,
            salesChannel: "web",
            source: "web",
            createdByUid: currentUser.uid,
            createdByName:
                transactionCustomer.name ||
                currentUser.displayName ||
                currentUser.email ||
                "Customer Web",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        transaction.set(orderRef, orderDataToSave);

        result = {
            orderId: orderRef.id,
            orderNumber,
            subtotal,
            discount,
            shipping,
            total: calculatedTotal,
            requiresProduction,
            productionStatus
        };
    });

    // La transacción ya actualizó la proyección pública.
    // Limpiamos el cache local únicamente después del éxito.
    for (const item of normalizedItems) {

        if (item.fulfillmentType === "physical") {

            clearCustomerProductAvailabilityCache(
                item.productId
            );

        }

    }

    console.log(
        "✓ Pedido Customer Web creado:",
        result
    );

    return result;
}

// ========================================
// CREATE ORDER — ENTERPRISE POS
// ========================================

export async function createOrder(orderData = {}) {

    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("No hay una cuenta Enterprise autenticada.");
    }

    const customer = orderData.customer || {};
    const items = Array.isArray(orderData.items) ? orderData.items : [];

    if (!customer.id) {
        throw new Error("El cliente es obligatorio.");
    }

    if (!items.length) {
        throw new Error("El pedido debe contener al menos un producto.");
    }

    const subtotal = Number(orderData.subtotal || 0);
    const shipping = Math.max(0, Number(orderData.shipping || 0));
    const discount = Math.max(0, Number(orderData.discount || 0));
    const total = Math.max(0, Number(orderData.total ?? subtotal + shipping - discount));

    if (!Number.isFinite(total) || total <= 0) {
        throw new Error("El total del pedido debe ser mayor a Q0.00.");
    }

    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);

    const maxOrderNumber = snapshot.docs.reduce(
        (max, orderDoc) => {
            const value = Number(orderDoc.data()?.orderNumber);
            return Number.isFinite(value) ? Math.max(max, value) : max;
        },
        1000
    );

    const orderNumber = maxOrderNumber + 1;

    const normalizedItems = items.map(item => {

        const unitPrice =
            Number(
                item.unitPrice ??
                item.price ??
                0
            );

        const quantity =
            Math.max(
                1,
                Number(
                    item.quantity || 1
                )
            );

        const total =
            Number(
                item.total ??
                item.lineTotal ??
                unitPrice * quantity
            );

        return {

            productId:
                item.productId ||
                null,

            productName:
                String(
                    item.productName ||
                    "Producto"
                ).trim(),

            fulfillmentType:
                item.fulfillmentType ||
                "physical",

            variantId:
                item.variantId ||
                null,

            variantName:
                item.variantName ||
                null,

            colorName:
                item.colorName ||
                null,

            sizeId:
                item.sizeId ||
                null,

            sizeName:
                item.sizeName ||
                null,

            sku:
                item.sku ||
                null,

            // Contrato canónico
            unitPrice,

            quantity,

            total,

            // Compatibilidad legacy
            price:
                unitPrice,

            lineTotal:
                total

        };

    });

    const userProfile = await getUserProfile(currentUser.uid);
    const createdByName =
        userProfile?.name ||
        userProfile?.displayName ||
        userProfile?.fullName ||
        currentUser.displayName ||
        currentUser.email ||
        "Usuario";

    const requiresProduction = orderData.requiresProduction === true;
    const paymentStatus = orderData.paymentStatus === "pending" ? "pending" : "paid";

    const orderDataToSave = {
        orderNumber,
        customerId: customer.id,
        customerSnapshot: {
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || {}
        },
        items: normalizedItems,
        subtotal,
        discount,
        shipping,
        total,
        orderStatus: orderData.orderStatus || "confirmed",
        paymentStatus,
        productionStatus: requiresProduction ? "pending" : "not_required",
        requiresProduction,
        paymentMethod: orderData.paymentMethod || "other",
        salesChannel: orderData.salesChannel || "manual",
        source: "enterprise",
        createdByUid: currentUser.uid,
        createdByName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const orderRef = await addDoc(
        ordersRef,
        orderDataToSave
    );

    if (requiresProduction) {

        const existingProductionOrders =
            await getProductionOrders();

        const maxProductionNumber =
            existingProductionOrders.reduce(
                (max, productionOrder) => {

                    const value =
                        Number(
                            productionOrder.productionNumber
                        );

                    return Number.isFinite(value)
                        ? Math.max(max, value)
                        : max;

                },
                1000
            );

        const productionRef =
            collection(
                db,
                "productionOrders"
            );

        const productionBatch =
            writeBatch(db);

        normalizedItems.forEach(
            (item, index) => {

                const productionRefDoc =
                    doc(productionRef);

                productionBatch.set(
                    productionRefDoc,
                    {
                        productionNumber:
                            maxProductionNumber +
                            index +
                            1,

                        orderId:
                            orderRef.id,

                        productId:
                            item.productId,

                        productName:
                            item.productName,

                        variantId:
                            item.variantId,

                        variantName:
                            item.variantName,

                        sku:
                            item.sku,

                        quantity:
                            item.quantity,

                        supplierId:
                            null,

                        unitCost:
                            0,

                        totalCost:
                            0,

                        status:
                            "pending",

                        notes:
                            "",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }
        );

        await productionBatch.commit();

    }

    console.log(
        "✓ Pedido creado desde Enterprise POS:",
        {
            orderId: orderRef.id,
            orderNumber
        }
    );

    return orderRef.id;

}


// ========================================
// GET INVENTORY
// ========================================

export async function getInventory() {

    const inventoryRef =
        collection(
            db,
            "inventory"
        );


    const snapshot =
        await getDocs(
            inventoryRef
        );


    return snapshot.docs.map(
        document => ({

            id:
                document.id,

            ...document.data()

        })
    );

}
// ========================================
// GET INVENTORY ITEM
// ========================================

export async function getInventoryItem(
    inventoryId
) {

    if (!inventoryId) {

        throw new Error(
            "El inventoryId es obligatorio."
        );

    }


    const inventoryRef =
        doc(
            db,
            "inventory",
            inventoryId
        );


    const snapshot =
        await getDoc(
            inventoryRef
        );


    if (!snapshot.exists()) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}

// ========================================
// CREATE INVENTORY
// ========================================

export async function createInventory(
    productId,
    variantId,
    sizeId,
    stock
) {

    if (
        typeof stock !== "number" ||
        !Number.isFinite(stock) ||
        stock <= 0
    ) {

        throw new Error(
            "El stock inicial debe ser mayor que 0."
        );

    }


    // ====================================
    // OBTENER PRODUCTO
    // ====================================

    const productRef =
        doc(
            db,
            "products",
            productId
        );

    const productSnapshot =
        await getDoc(
            productRef
        );


    if (!productSnapshot.exists()) {

        throw new Error(
            "El producto no existe."
        );

    }


    const product =
        productSnapshot.data();


    // ====================================
    // BUSCAR VARIANTE
    // ====================================

    const variant =
        Array.isArray(product.variants)
            ? product.variants.find(
                item =>
                    item.id === variantId
            )
            : null;


    if (!variant) {

        throw new Error(
            "La variante no existe dentro del producto."
        );

    }


    // ====================================
    // BUSCAR TALLA
    // ====================================

    const size =
        Array.isArray(variant.sizes)
            ? variant.sizes.find(
                item =>
                    item.id === sizeId
            )
            : null;


    if (!size) {

        throw new Error(
            "La talla no existe dentro de la variante."
        );

    }


    // ====================================
    // VALIDAR SKU
    // ====================================

    if (!size.sku) {

        throw new Error(
            "La talla seleccionada no tiene SKU."
        );

    }


    // ====================================
    // VALIDAR DISPONIBILIDAD EN CATÁLOGO
    // ====================================

    const catalogAvailable =
        product.active === true &&
        variant.active === true &&
        size.active === true;


    if (!catalogAvailable) {

        throw new Error(
            "Esta variante no está disponible para ingresar inventario."
        );

    }


    // ====================================
    // COMPROBAR INVENTARIO EXISTENTE
    // ====================================

    const inventoryRef =
        collection(
            db,
            "inventory"
        );

    const existingQuery =
        query(
            inventoryRef,

            where(
                "productId",
                "==",
                productId
            ),

            where(
                "variantId",
                "==",
                variantId
            ),

            where(
                "sizeId",
                "==",
                sizeId
            )
        );


    const existingSnapshot =
        await getDocs(
            existingQuery
        );


    if (!existingSnapshot.empty) {

        throw new Error(
            "Ya existe un registro de inventario para esta variante y talla."
        );

    }


    // ====================================
    // ESTADO DEL CATÁLOGO
    // ====================================

    const catalogStatus =
        "active";


    // ====================================
    // CREAR INVENTARIO
    // ====================================

    const inventoryDocument =
        await addDoc(
            inventoryRef,
            {

                productId,

                variantId,

                sizeId,

                sku:
                    size.sku,

                productName:
                    product.name,

                variantName:
                    variant.name,

                sizeName:
                    size.name,

                stock,

                catalogStatus,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


    await syncProductSizeAvailability(
        productId,
        variantId,
        sizeId,
        stock > 0
    );

    console.log(
        "✓ Inventory creado:",
        inventoryDocument.id
    );


    return inventoryDocument.id;

}
// ========================================
// INVENTORY MOVEMENT USER
// ========================================

async function getInventoryMovementUser() {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "No hay un usuario autenticado para registrar el movimiento."
        );

    }


    const profile =
        await getUserProfile(
            user.uid
        );


    return {

        uid:
            user.uid,

        name:
            profile?.name ||
            profile?.displayName ||
            user.displayName ||
            user.email ||
            "Usuario",

        email:
            profile?.email ||
            user.email ||
            null

    };

}


// ========================================
// SYNC PUBLIC PRODUCT AVAILABILITY
// ========================================
//
// Mantiene una proyección pública mínima de disponibilidad
// a partir del inventory real.
//
// IMPORTANTE:
// - `inventory` continúa siendo la fuente de verdad.
// - Customer Web NO recibe stock ni acceso a inventory.
// - No modificamos `products` desde Employee.
// - Solo se publica available: true/false.
//
// ========================================

function getProductAvailabilityDocumentId(
    productId,
    variantId,
    sizeId
) {

    return [
        productId,
        variantId,
        sizeId
    ]
        .map(
            value =>
                encodeURIComponent(
                    String(value)
                )
        )
        .join("__");

}

async function syncProductSizeAvailabilityInTransaction(
    transaction,
    productId,
    variantId,
    sizeId,
    available
) {

    if (!productId || !variantId || !sizeId) {
        return null;
    }

    const availabilityId =
        getProductAvailabilityDocumentId(
            productId,
            variantId,
            sizeId
        );

    const availabilityRef =
        doc(
            db,
            "productAvailability",
            availabilityId
        );

    transaction.set(
        availabilityRef,
        {
            productId:
                String(productId),

            variantId:
                String(variantId),

            sizeId:
                String(sizeId),

            available:
                Boolean(available),

            updatedAt:
                serverTimestamp()
        },
        {
            merge:
                true
        }
    );

    return availabilityRef;
}

async function syncProductSizeAvailability(
    productId,
    variantId,
    sizeId,
    available
) {

    if (!productId || !variantId || !sizeId) {
        return false;
    }

    const availabilityId =
        getProductAvailabilityDocumentId(
            productId,
            variantId,
            sizeId
        );

    const availabilityRef =
        doc(
            db,
            "productAvailability",
            availabilityId
        );

    await setDoc(
        availabilityRef,
        {
            productId:
                String(productId),

            variantId:
                String(variantId),

            sizeId:
                String(sizeId),

            available:
                Boolean(available),

            updatedAt:
                serverTimestamp()
        },
        {
            merge:
                true
        }
    );

    clearCustomerProductAvailabilityCache(
        productId
    );

    console.log(
        "✓ Disponibilidad pública sincronizada:",
        {
            productId,
            variantId,
            sizeId,
            available:
                Boolean(available)
        }
    );

    return true;

}


// ========================================
// REGISTER INVENTORY ENTRY
// ========================================

export async function registerInventoryEntry(
    inventoryId,
    quantity,
    options = {}
) {

    // ====================================
    // VALIDAR CANTIDAD
    // ====================================

    if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "La cantidad de entrada debe ser mayor que 0."
        );

    }


    // ====================================
    // DATOS DEL MOVIMIENTO
    // ====================================

    const reason =
        options.reason ||
        "purchase";

    const referenceType =
        options.referenceType ||
        null;

    const referenceId =
        options.referenceId ||
        null;

    const unitCost =
        typeof options.unitCost === "number"
            ? options.unitCost
            : null;

    const notes =
        options.notes ||
        "";


    const createdBy =
        await getInventoryMovementUser();


    // ====================================
    // REFERENCIAS
    // ====================================

    const inventoryRef =
        doc(
            db,
            "inventory",
            inventoryId
        );

    const movementsRef =
        collection(
            db,
            "inventoryMovements"
        );

    const movementRef =
        doc(
            movementsRef
        );


    // ====================================
    // TRANSACCIÓN
    // ====================================

    await runTransaction(
        db,
        async transaction => {

            // =================================
            // OBTENER INVENTARIO
            // =================================

            const inventorySnapshot =
                await transaction.get(
                    inventoryRef
                );


            if (
                !inventorySnapshot.exists()
            ) {

                throw new Error(
                    "El registro de inventario no existe."
                );

            }


            const inventory =
                inventorySnapshot.data();


            // =================================
            // STOCK ACTUAL
            // =================================

            const currentStock =
                Number(
                    inventory.stock || 0
                );


            const newStock =
                currentStock +
                quantity;


            // =================================
            // ACTUALIZAR INVENTARIO
            // =================================

            transaction.update(
                inventoryRef,
                {

                    stock:
                        newStock,

                    updatedAt:
                        serverTimestamp()

                }
            );


            // =================================
            // CREAR MOVIMIENTO
            // =================================

            transaction.set(
                movementRef,
                {

                    inventoryId,

                    productId:
                        inventory.productId,

                    variantId:
                        inventory.variantId,

                    sizeId:
                        inventory.sizeId,

                    sku:
                        inventory.sku,

                    type:
                        "entry",

                    quantity,

                    reason,

                    referenceType,

                    referenceId,

                    unitCost,

                    notes,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        createdBy

                }
            );

        }
    );


    // ====================================
    // SYNC PUBLIC AVAILABILITY
    // ====================================

    const entryInventory =
        await getInventoryItem(
            inventoryId
        );

    if (entryInventory) {
        await syncProductSizeAvailability(
            entryInventory.productId,
            entryInventory.variantId,
            entryInventory.sizeId,
            Number(entryInventory.stock) > 0
        );
    }

    // ====================================
    // RESULTADO
    // ====================================

    console.log(
        "✓ Entrada de inventario registrada:",
        {
            inventoryId,
            quantity,
            reason
        }
    );


    return {

        success:
            true,

        inventoryId,

        quantity,

        type:
            "entry",

        reason

    };

}
// ========================================
// REGISTER INVENTORY EXIT
// ========================================

export async function registerInventoryExit(
    inventoryId,
    quantity,
    options = {}
) {

    // ====================================
    // VALIDAR CANTIDAD
    // ====================================

    if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "La cantidad de salida debe ser mayor que 0."
        );

    }


    // ====================================
    // DATOS DEL MOVIMIENTO
    // ====================================

    const reason =
        options.reason ||
        "sale";

    const referenceType =
        options.referenceType ||
        null;

    const referenceId =
        options.referenceId ||
        null;

    const notes =
        options.notes ||
        "";


    const createdBy =
        await getInventoryMovementUser();


    // ====================================
    // REFERENCIAS
    // ====================================

    const inventoryRef =
        doc(
            db,
            "inventory",
            inventoryId
        );

    const movementsRef =
        collection(
            db,
            "inventoryMovements"
        );

    const movementRef =
        doc(
            movementsRef
        );


    // ====================================
    // TRANSACCIÓN
    // ====================================

    await runTransaction(
        db,
        async transaction => {

            // =================================
            // OBTENER INVENTARIO
            // =================================

            const inventorySnapshot =
                await transaction.get(
                    inventoryRef
                );


            if (
                !inventorySnapshot.exists()
            ) {

                throw new Error(
                    "El registro de inventario no existe."
                );

            }


            const inventory =
                inventorySnapshot.data();


            // =================================
            // STOCK ACTUAL
            // =================================

            const currentStock =
                Number(
                    inventory.stock || 0
                );


            // =================================
            // VALIDAR STOCK DISPONIBLE
            // =================================

            if (
                quantity > currentStock
            ) {

                throw new Error(
                    `Stock insuficiente. Stock disponible: ${currentStock}. Cantidad solicitada: ${quantity}.`
                );

            }


            // =================================
            // NUEVO STOCK
            // =================================

            const newStock =
                currentStock -
                quantity;


            // =================================
            // ACTUALIZAR INVENTARIO
            // =================================

            transaction.update(
                inventoryRef,
                {

                    stock:
                        newStock,

                    updatedAt:
                        serverTimestamp()

                }
            );


            // =================================
            // CREAR MOVIMIENTO
            // =================================

            transaction.set(
                movementRef,
                {

                    inventoryId,

                    productId:
                        inventory.productId,

                    variantId:
                        inventory.variantId,

                    sizeId:
                        inventory.sizeId,

                    sku:
                        inventory.sku,

                    type:
                        "exit",

                    quantity,

                    reason,

                    referenceType,

                    referenceId,

                    notes,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        createdBy

                }
            );

        }
    );


    // ====================================
    // SYNC PUBLIC AVAILABILITY
    // ====================================

    const exitInventory =
        await getInventoryItem(
            inventoryId
        );

    if (exitInventory) {
        await syncProductSizeAvailability(
            exitInventory.productId,
            exitInventory.variantId,
            exitInventory.sizeId,
            Number(exitInventory.stock) > 0
        );
    }

    // ====================================
    // RESULTADO
    // ====================================

    console.log(
        "✓ Salida de inventario registrada:",
        {
            inventoryId,
            quantity,
            reason
        }
    );


    return {

        success:
            true,

        inventoryId,

        quantity,

        type:
            "exit",

        reason

    };

}
// ========================================
// REGISTER INVENTORY ADJUSTMENT
// ========================================

export async function registerInventoryAdjustment(
    inventoryId,
    physicalStock,
    options = {}
) {

    // ====================================
    // VALIDAR STOCK FÍSICO
    // ====================================

    if (
        typeof physicalStock !== "number" ||
        !Number.isFinite(physicalStock) ||
        physicalStock < 0
    ) {

        throw new Error(
            "El stock físico debe ser un número igual o mayor que 0."
        );

    }


    // ====================================
    // DATOS DEL MOVIMIENTO
    // ====================================

    const reason =
        options.reason ||
        "physical_count";

    const notes =
        options.notes ||
        "";


    const createdBy =
        await getInventoryMovementUser();


    // ====================================
    // REFERENCIAS
    // ====================================

    const inventoryRef =
        doc(
            db,
            "inventory",
            inventoryId
        );

    const movementsRef =
        collection(
            db,
            "inventoryMovements"
        );

    const movementRef =
        doc(
            movementsRef
        );


    // ====================================
    // TRANSACCIÓN
    // ====================================

    await runTransaction(
        db,
        async transaction => {

            // =================================
            // OBTENER INVENTARIO
            // =================================

            const inventorySnapshot =
                await transaction.get(
                    inventoryRef
                );


            if (
                !inventorySnapshot.exists()
            ) {

                throw new Error(
                    "El registro de inventario no existe."
                );

            }


            const inventory =
                inventorySnapshot.data();


            // =================================
            // STOCK ACTUAL
            // =================================

            const currentStock =
                Number(
                    inventory.stock || 0
                );


            // =================================
            // CALCULAR DIFERENCIA
            // =================================

            const difference =
                physicalStock -
                currentStock;


            // =================================
            // NO HAY DIFERENCIA
            // =================================

            if (
                difference === 0
            ) {

                throw new Error(
                    "El stock físico coincide con el stock del sistema. No es necesario realizar un ajuste."
                );

            }


            // =================================
            // ACTUALIZAR INVENTARIO
            // =================================

            transaction.update(
                inventoryRef,
                {

                    stock:
                        physicalStock,

                    updatedAt:
                        serverTimestamp()

                }
            );


            // =================================
            // CREAR MOVIMIENTO
            // =================================

            transaction.set(
                movementRef,
                {

                    inventoryId,

                    productId:
                        inventory.productId,

                    variantId:
                        inventory.variantId,

                    sizeId:
                        inventory.sizeId,

                    sku:
                        inventory.sku,

                    type:
                        "adjustment",

                    quantity:
                        Math.abs(difference),

                    direction:
                        difference > 0
                            ? "increase"
                            : "decrease",

                    reason,

                    referenceType:
                        null,

                    referenceId:
                        null,

                    unitCost:
                        null,

                    notes,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        createdBy

                }
            );

        }
    );


    // ====================================
    // SYNC PUBLIC AVAILABILITY
    // ====================================

    const adjustedInventory =
        await getInventoryItem(
            inventoryId
        );

    if (adjustedInventory) {
        await syncProductSizeAvailability(
            adjustedInventory.productId,
            adjustedInventory.variantId,
            adjustedInventory.sizeId,
            Number(adjustedInventory.stock) > 0
        );
    }

    // ====================================
    // RESULTADO
    // ====================================

    console.log(
        "✓ Ajuste de inventario registrado:",
        {
            inventoryId,
            physicalStock,
            reason
        }
    );


    return {

        success:
            true,

        inventoryId,

        physicalStock,

        type:
            "adjustment",

        reason

    };

}
// ========================================
// SYNC EXISTING INVENTORY AVAILABILITY
// ========================================
//
// Utilidad de bootstrap para inventario creado antes
// de introducir `productAvailability`.
//
// NO modifica inventory.
// Solo crea/actualiza la proyección pública
// available: true/false.
//
// Debe ejecutarse una vez sobre inventario histórico
// después de desplegar las Rules nuevas.
// ========================================

export async function syncProductAvailabilityForInventory(
    inventoryId
) {

    const inventory =
        await getInventoryItem(
            inventoryId
        );

    if (!inventory) {

        throw new Error(
            "El registro de inventario no existe."
        );

    }

    await syncProductSizeAvailability(
        inventory.productId,
        inventory.variantId,
        inventory.sizeId,
        Number(inventory.stock) > 0
    );

    return {
        inventoryId,
        productId: inventory.productId,
        variantId: inventory.variantId,
        sizeId: inventory.sizeId,
        available: Number(inventory.stock) > 0
    };

}

export async function syncAllProductAvailability() {

    const inventoryItems =
        await getInventory();

    let synced = 0;
    let skipped = 0;

    for (const inventory of inventoryItems) {

        if (
            !inventory.productId ||
            !inventory.variantId ||
            !inventory.sizeId
        ) {

            skipped++;
            continue;

        }

        await syncProductSizeAvailability(
            inventory.productId,
            inventory.variantId,
            inventory.sizeId,
            Number(inventory.stock) > 0
        );

        synced++;

    }

    console.log(
        "✓ Disponibilidad pública reconstruida desde inventory:",
        {
            totalInventory:
                inventoryItems.length,

            synced,
            skipped
        }
    );

    return {
        totalInventory:
            inventoryItems.length,

        synced,
        skipped
    };

}


export async function getInventoryMovements() {

    const movementsRef =
        collection(
            db,
            "inventoryMovements"
        );

    const snapshot =
        await getDocs(movementsRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}
// ========================================
// GET INVENTORY MOVEMENTS BY INVENTORY
// ========================================

export async function getInventoryMovementsByInventoryId(
    inventoryId
) {

    if (!inventoryId) {

        throw new Error(
            "El inventoryId es obligatorio."
        );

    }


    const movementsRef =
        collection(
            db,
            "inventoryMovements"
        );


    const movementsQuery =
        query(
            movementsRef,

            where(
                "inventoryId",
                "==",
                inventoryId
            )
        );


    const snapshot =
        await getDocs(
            movementsQuery
        );


    return snapshot.docs.map(
        document => ({

            id:
                document.id,

            ...document.data()

        })
    );

}
export async function getProductionOrders() {

    const productionRef =
        collection(
            db,
            "productionOrders"
        );

    const snapshot =
        await getDocs(productionRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function getOrder(orderId) {

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    const snapshot =
        await getDoc(orderRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}

export async function updateOrderStatus(
    orderId,
    status
) {

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    await updateDoc(
        orderRef,
        {
            orderStatus: status,
            updatedAt:
                serverTimestamp()
        }
    );

}

export async function updateProductionOrderStatus(
    productionOrderId,
    status
) {

    const productionOrderRef =
        doc(
            db,
            "productionOrders",
            productionOrderId
        );

    await updateDoc(
        productionOrderRef,
        {
            status,
            updatedAt:
                serverTimestamp()
        }
    );

}

export async function updatePaymentStatus(
    orderId,
    status
) {

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    await updateDoc(
        orderRef,
        {
            paymentStatus: status,
            updatedAt:
                serverTimestamp()
        }
    );

}

async function ensureProductionOrdersForOrder(
    orderId
) {

    const productionOrders =
        await getProductionOrders();

    const relatedOrders =
        productionOrders.filter(
            productionOrder =>
                productionOrder.orderId === orderId
        );

    if (relatedOrders.length) {
        return relatedOrders;
    }

    const order =
        await getOrder(orderId);

    if (!order) {
        throw new Error(
            "No se encontró el pedido."
        );
    }

    if (order.requiresProduction !== true) {
        throw new Error(
            "Este pedido no requiere producción."
        );
    }

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];

    if (!items.length) {
        throw new Error(
            "El pedido no contiene productos para producción."
        );
    }

    const productionRef =
        collection(
            db,
            "productionOrders"
        );

    const maxProductionNumber =
        productionOrders.reduce(
            (max, productionOrder) => {

                const value =
                    Number(
                        productionOrder.productionNumber
                    );

                return Number.isFinite(value)
                    ? Math.max(max, value)
                    : max;

            },
            1000
        );

    const batch =
        writeBatch(db);

    items.forEach(
        (item, index) => {

            const productionRefDoc =
                doc(productionRef);

            batch.set(
                productionRefDoc,
                {
                    productionNumber:
                        maxProductionNumber +
                        index +
                        1,

                    orderId,

                    productId:
                        item.productId ||
                        null,

                    productName:
                        item.productName ||
                        "Producto",

                    variantId:
                        item.variantId ||
                        null,

                    variantName:
                        item.variantName ||
                        null,

                    sku:
                        item.sku ||
                        null,

                    quantity:
                        Math.max(
                            1,
                            Number(
                                item.quantity || 1
                            )
                        ),

                    supplierId:
                        null,

                    unitCost:
                        0,

                    totalCost:
                        0,

                    status:
                        order.productionStatus ===
                        "not_required"
                            ? "pending"
                            : (
                                order.productionStatus ||
                                "pending"
                            ),

                    notes:
                        "",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );

        }
    );

    await batch.commit();

    return await getProductionOrders().then(
        allProductionOrders =>
            allProductionOrders.filter(
                productionOrder =>
                    productionOrder.orderId ===
                    orderId
            )
    );

}

export async function updateProductionStatus(
    orderId,
    status
) {

    let productionOrders =
        await getProductionOrders();

    let relatedOrders =
        productionOrders.filter(
            productionOrder =>
                productionOrder.orderId ===
                orderId
        );

    // Reparación automática de pedidos Enterprise
    // creados con requiresProduction=true antes
    // de que existiera su productionOrder.
    if (!relatedOrders.length) {

        relatedOrders =
            await ensureProductionOrdersForOrder(
                orderId
            );

    }

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    const batch =
        writeBatch(db);

    batch.update(
        orderRef,
        {
            productionStatus:
                status,

            updatedAt:
                serverTimestamp()
        }
    );

    relatedOrders.forEach(
        productionOrder => {

            const productionOrderRef =
                doc(
                    db,
                    "productionOrders",
                    productionOrder.id
                );

            batch.update(
                productionOrderRef,
                {
                    status,

                    updatedAt:
                        serverTimestamp()
                }
            );

        }
    );

    await batch.commit();

    console.log(
        "✓ Estado de producción sincronizado:",
        {
            orderId,
            productionOrderIds:
                relatedOrders.map(
                    productionOrder =>
                        productionOrder.id
                ),
            status
        }
    );

}

// ========================================
// UPDATE PRODUCT
// ========================================

export async function updateProduct(
    productId,
    productData
) {

    const productRef =
        doc(
            db,
            "products",
            productId
        );

    await updateDoc(
        productRef,
        {
            ...productData,
            updatedAt:
                serverTimestamp()
        }
    );

}

/**
 * Registra un reembolso completo sobre una venta histórica.
 *
 * La cuenta ADMIN se autentica en una app Firebase secundaria para que
 * la sesión del empleado actual no sea reemplazada.
 *
 * No elimina la venta ni modifica sus importes originales.
 */
export async function refundSaleFromOrder(
    orderId,
    adminEmail,
    adminPassword,
    refundReason = "Pedido cancelado y pago reembolsado"
) {

    if (!orderId) {
        throw new Error(
            "El orderId es obligatorio."
        );
    }

    if (!adminEmail || !adminPassword) {
        throw new Error(
            "Se requieren las credenciales del administrador."
        );
    }

    if (!auth.currentUser) {
        throw new Error(
            "No hay una sesión Enterprise activa."
        );
    }

    const adminApp =
        getAdminRefundApp();

    const adminAuth =
        getAuth(adminApp);

    const adminDb =
        getFirestore(adminApp);

    try {

        const adminCredential =
            await signInWithEmailAndPassword(
                adminAuth,
                adminEmail.trim(),
                adminPassword
            );

        const adminUid =
            adminCredential.user.uid;

        const adminUserRef =
            doc(
                adminDb,
                "users",
                adminUid
            );

        const adminUserSnapshot =
            await getDoc(
                adminUserRef
            );

        if (!adminUserSnapshot.exists()) {
            throw new Error(
                "La cuenta indicada no tiene perfil Enterprise."
            );
        }

        const adminProfile =
            adminUserSnapshot.data();

        if (
            adminProfile.active !== true ||
            adminProfile.role !== "admin"
        ) {
            throw new Error(
                "La cuenta indicada no tiene autorización de ADMIN."
            );
        }

        const orderRef =
            doc(
                adminDb,
                "orders",
                orderId
            );

        const saleRef =
            doc(
                adminDb,
                "sales",
                orderId
            );

        const result =
            await runTransaction(
                adminDb,
                async transaction => {

                    const orderSnapshot =
                        await transaction.get(
                            orderRef
                        );

                    const saleSnapshot =
                        await transaction.get(
                            saleRef
                        );

                    if (!orderSnapshot.exists()) {
                        throw new Error(
                            "El pedido no existe."
                        );
                    }

                    if (!saleSnapshot.exists()) {
                        throw new Error(
                            "No existe una venta registrada para este pedido."
                        );
                    }

                    const order =
                        orderSnapshot.data();

                    const sale =
                        saleSnapshot.data();

                    if (
                        sale.status ===
                        "refunded"
                    ) {
                        throw new Error(
                            "Esta venta ya fue reembolsada."
                        );
                    }

                    if (
                        order.orderStatus !==
                        "cancelled"
                    ) {
                        throw new Error(
                            "El pedido debe estar cancelado antes de procesar el reembolso."
                        );
                    }

                    if (
                        order.paymentStatus !==
                        "refunded"
                    ) {
                        throw new Error(
                            "El pago debe estar marcado como reembolsado antes de procesar la venta."
                        );
                    }

                    const adminName =
                        adminProfile.name ||
                        adminProfile.displayName ||
                        adminProfile.fullName ||
                        (
                            adminProfile.firstName &&
                            adminProfile.lastName
                                ? `${adminProfile.firstName} ${adminProfile.lastName}`
                                : null
                        ) ||
                        adminCredential.user.displayName ||
                        adminCredential.user.email ||
                        "Administrador";

                    const refundedAmount =
                        Number(
                            sale.netAmount ??
                            sale.paymentAmount ??
                            0
                        );

                    transaction.update(
                        saleRef,
                        {

                            status:
                                "refunded",

                            paymentStatus:
                                "refunded",

                            refundedAmount,

                            refundReason:
                                refundReason.trim() ||
                                "Pedido cancelado y pago reembolsado",

                            refundedByUid:
                                adminUid,

                            refundedByName:
                                adminName,

                            refundedAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }
                    );

                    transaction.update(
                        orderRef,
                        {

                            refundConfirmed:
                                true,

                            refundConfirmedByUid:
                                adminUid,

                            refundConfirmedByName:
                                adminName,

                            refundConfirmedAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }
                    );

                    return {
                        saleId:
                            orderId,
                        refundedAmount,
                        refundedByUid:
                            adminUid,
                        refundedByName:
                            adminName
                    };

                }
            );

        console.log(
            "✓ Reembolso autorizado por ADMIN:",
            result
        );

        return result;

    } finally {

        await signOut(
            adminAuth
        );

    }

}
// ========================================
// CHECK ENTERPRISE USER
// ========================================

export async function getEnterpriseUserByUid(
    uid
) {

    if (!uid) {

        return null;

    }


    const userRef =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (!snapshot.exists()) {

        return null;

    }


    return {
        id:
            snapshot.id,

        ...snapshot.data()
    };

}