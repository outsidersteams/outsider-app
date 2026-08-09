import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { app } from "./config.js";

const db = getFirestore(app);


export async function getCategories() {

    const categoriesRef = collection(db, "categories");

    const snapshot = await getDocs(categoriesRef);

    const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return categories;
}
export async function getUserProfile(uid) {

    const userRef = doc(
        db,
        "users",
        uid
    );

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {

        return null;

    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}
//GetProducts
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
//Get Clients
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
//Get Pedidos
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
//Inventario
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
// Movimientos
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
//Produccion Pod
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

    const orderRef = doc(
        db,
        "orders",
        orderId
    );

    await updateDoc(
        orderRef,
        {
            orderStatus: status,
            updatedAt: serverTimestamp()
        }
    );

}
export async function updatePaymentStatus(
    orderId,
    status
) {

    const orderRef = doc(
        db,
        "orders",
        orderId
    );

    await updateDoc(
        orderRef,
        {
            paymentStatus: status,
            updatedAt: serverTimestamp()
        }
    );

}
export async function updateProductionStatus(
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
            productionStatus: status,
            updatedAt: serverTimestamp()
        }
    );

}