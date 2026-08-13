import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
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

    const snapshot =
        await getDocs(productsRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

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
        ).trim();

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

    const normalizedItems = items.map(item => ({
        productId: item.productId || null,
        productName: String(item.productName || "Producto").trim(),
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        colorName: item.colorName || null,
        sizeName: item.sizeName || null,
        sku: item.sku || null,
        price: Number(item.price || 0),
        quantity: Math.max(1, Number(item.quantity || 1)),
        lineTotal: Number(item.lineTotal || 0)
    }));

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
