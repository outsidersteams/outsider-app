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

import { app } from "./config.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

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