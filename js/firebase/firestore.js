import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    writeBatch,
    serverTimestamp,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { app } from "./config.js";

const db = getFirestore(app);

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

export async function getInventory() {

    const inventoryRef =
        collection(db, "inventory");

    const snapshot =
        await getDocs(inventoryRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

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

export async function updateProductionStatus(
    orderId,
    status
) {

    const productionOrders =
        await getProductionOrders();

    const productionOrder =
        productionOrders.find(
            order =>
                order.orderId === orderId
        );

    if (!productionOrder) {
        throw new Error(
            `No se encontró productionOrder relacionado con el pedido ${orderId}`
        );
    }

    const orderRef =
        doc(
            db,
            "orders",
            orderId
        );

    const productionOrderRef =
        doc(
            db,
            "productionOrders",
            productionOrder.id
        );

    const batch =
        writeBatch(db);

    batch.update(
        orderRef,
        {
            productionStatus: status,
            updatedAt:
                serverTimestamp()
        }
    );

    batch.update(
        productionOrderRef,
        {
            status,
            updatedAt:
                serverTimestamp()
        }
    );

    await batch.commit();

    console.log(
        "✓ Estado de producción sincronizado:",
        {
            orderId,
            productionOrderId:
                productionOrder.id,
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