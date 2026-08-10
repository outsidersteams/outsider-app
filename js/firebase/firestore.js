import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    writeBatch,
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
// ========================================
// GET ORDER COMMENTS
// ========================================

export async function getOrderComments(
    orderId
) {

    const commentsRef =
        collection(
            db,
            "orders",
            orderId,
            "comments"
        );


    const snapshot =
        await getDocs(
            commentsRef
        );


    const comments =
        snapshot.docs.map(
            commentDoc => ({

                id:
                    commentDoc.id,

                ...commentDoc.data()

            })
        );


    // ========================================
    // SORT BY DATE
    // ========================================

    comments.sort(
        (
            a,
            b
        ) => {

            const dateA =
                getTimestampValue(
                    a.createdAt
                );


            const dateB =
                getTimestampValue(
                    b.createdAt
                );


            return dateA - dateB;

        }
    );


    return comments;

}


// ========================================
// ADD ORDER COMMENT
// ========================================

export async function addOrderComment(
    orderId,
    text,
    user
) {

    const cleanText =
        String(
            text || ""
        ).trim();


    if (!cleanText) {

        throw new Error(
            "El comentario no puede estar vacío."
        );

    }


    const commentsRef =
        collection(
            db,
            "orders",
            orderId,
            "comments"
        );


    const commentData = {

        text:
            cleanText,

        createdAt:
            serverTimestamp(),

        createdBy:
            user?.uid ||
            user?.id ||
            null,

        createdByName:
            user?.displayName ||
            user?.name ||
            user?.email ||
            "Usuario"

    };


    const commentRef =
        await addDoc(
            commentsRef,
            commentData
        );


    console.log(
        "✓ Comentario agregado:",
        {
            orderId,
            commentId:
                commentRef.id
        }
    );


    return {

        id:
            commentRef.id,

        ...commentData

    };

}


// ========================================
// TIMESTAMP HELPER
// ========================================

function getTimestampValue(
    value
) {

    if (!value) {

        return 0;

    }


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        value.seconds !== undefined
    ) {

        return (
            Number(
                value.seconds
            ) * 1000
        );

    }


    const date =
        new Date(
            value
        );


    const time =
        date.getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

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
            status: status,
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

    // ========================================
    // FIND RELATED PRODUCTION ORDER
    // ========================================

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


    // ========================================
    // REFERENCES
    // ========================================

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


    // ========================================
    // BATCH
    // ========================================

    const batch =
        writeBatch(db);


    // ORDER
    batch.update(
        orderRef,
        {
            productionStatus: status,
            updatedAt: serverTimestamp()
        }
    );


    // PRODUCTION ORDER
    batch.update(
        productionOrderRef,
        {
            status: status,
            updatedAt: serverTimestamp()
        }
    );


    // ========================================
    // COMMIT
    // ========================================

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