import {
    EnterpriseLayout,
    initEnterpriseLayout
} from "../components/enterpriseLayout.js";


import {
    getOrders,
    getOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateProductionStatus
} from "../firebase/firestore.js";


// ========================================
// ENTERPRISE DASHBOARD
// ========================================

export function EnterpriseDashboard(profile) {

    const content = `

        <section class="enterprise-dashboard">

            <div class="enterprise-dashboard__header">

                <div class="enterprise-dashboard__heading">

                    <span class="enterprise-dashboard__eyebrow">
                        Enterprise
                    </span>

                    <h1 class="enterprise-dashboard__title">
                        Pedidos
                    </h1>

                    <p class="enterprise-dashboard__description">
                        Gestiona y consulta los pedidos de Outsider.
                    </p>

                </div>


                <button
                    type="button"
                    class="enterprise-dashboard__new-order"
                    id="enterprise-new-order"
                >

                    <i class="fa-solid fa-plus"></i>

                    <span>
                        Nueva venta
                    </span>

                </button>

            </div>


            <section
                class="enterprise-dashboard__orders"
                id="enterprise-orders"
            >

                <div class="enterprise-dashboard__loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <span>
                        Cargando pedidos...
                    </span>

                </div>

            </section>

        </section>

    `;


    return EnterpriseLayout(
        content,
        profile
    );

}


// ========================================
// INIT DASHBOARD
// ========================================

export function initEnterpriseDashboard() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get("order");


    if (orderId) {

        loadOrderDetail(
            orderId
        );

    } else {

        loadOrders();

    }

}


// ========================================
// ORDER ACTIONS
// ========================================

function initOrderActions() {

    const cards =
        document.querySelectorAll(
            ".enterprise-order"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const orderId =
                        card.dataset.orderId;


                    if (!orderId) {

                        return;

                    }


                    const url =
                        `/enterprise/dashboard?order=${encodeURIComponent(
                            orderId
                        )}`;


                    window.history.pushState(
                        {},
                        "",
                        url
                    );


                    initEnterpriseDashboard();

                }
            );


            // ========================================
            // ACCESSIBILITY
            // ========================================

            card.setAttribute(
                "role",
                "button"
            );


            card.setAttribute(
                "tabindex",
                "0"
            );


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        card.click();

                    }

                }
            );

        }
    );

}


// ========================================
// BACK TO ORDERS
// ========================================

function initBackToOrders() {

    const button =
        document.querySelector(
            "#enterprise-back-orders"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            window.history.pushState(
                {},
                "",
                "/enterprise/dashboard"
            );


            initEnterpriseDashboard();

        }
    );

}


// ========================================
// ORDER STATUS
// ========================================

function initOrderStatusControl() {

    const select =
        document.querySelector(
            "#enterprise-order-status"
        );


    if (!select) {

        return;

    }


    select.addEventListener(
        "change",
        async () => {

            const orderId =
                select.dataset.orderId;


            const newStatus =
                select.value;


            if (
                !orderId ||
                !newStatus
            ) {

                return;

            }


            const previousStatus =
                select.dataset.previousStatus ||
                "";


            select.disabled =
                true;


            try {

                console.log(
                    "ORDER STATUS TEST",
                    {
                        orderId,
                        newStatus
                    }
                );


                await updateOrderStatus(
                    orderId,
                    newStatus
                );


                select.dataset.previousStatus =
                    newStatus;


                updateOrderStatusSelectStyle(
                    select,
                    newStatus
                );


                console.log(
                    "✓ Estado del pedido actualizado:",
                    newStatus
                );


            } catch (error) {

                console.error(
                    "✗ Error actualizando estado:",
                    error
                );


                if (previousStatus) {

                    select.value =
                        previousStatus;


                    updateOrderStatusSelectStyle(
                        select,
                        previousStatus
                    );

                }

            } finally {

                select.disabled =
                    false;

            }

        }
    );


    select.dataset.previousStatus =
        select.value;

}


// ========================================
// PAYMENT STATUS
// ========================================

function initPaymentStatusControl() {

    const select =
        document.querySelector(
            "#enterprise-payment-status"
        );


    if (!select) {

        return;

    }


    select.addEventListener(
        "change",
        async () => {

            const orderId =
                select.dataset.orderId;


            const newStatus =
                select.value;


            if (
                !orderId ||
                !newStatus
            ) {

                return;

            }


            const previousStatus =
                select.dataset.previousStatus ||
                "";


            select.disabled =
                true;


            try {

                console.log(
                    "PAYMENT STATUS TEST",
                    {
                        orderId,
                        newStatus
                    }
                );


                await updatePaymentStatus(
                    orderId,
                    newStatus
                );


                select.dataset.previousStatus =
                    newStatus;


                updatePaymentStatusSelectStyle(
                    select,
                    newStatus
                );


                console.log(
                    "✓ Estado de pago actualizado:",
                    newStatus
                );


            } catch (error) {

                console.error(
                    "✗ Error actualizando estado de pago:",
                    error
                );


                if (previousStatus) {

                    select.value =
                        previousStatus;


                    updatePaymentStatusSelectStyle(
                        select,
                        previousStatus
                    );

                }

            } finally {

                select.disabled =
                    false;

            }

        }
    );


    select.dataset.previousStatus =
        select.value;

}


// ========================================
// PRODUCTION STATUS
// ========================================

function initProductionStatusControl() {

    const select =
        document.querySelector(
            "#enterprise-production-status"
        );


    if (!select) {

        return;

    }


    select.addEventListener(
        "change",
        async () => {

            const orderId =
                select.dataset.orderId;


            const newStatus =
                select.value;


            if (
                !orderId ||
                !newStatus
            ) {

                return;

            }


            const previousStatus =
                select.dataset.previousStatus ||
                "";


            select.disabled =
                true;


            try {

                console.log(
                    "PRODUCTION STATUS TEST",
                    {
                        orderId,
                        newStatus
                    }
                );


                await updateProductionStatus(
                    orderId,
                    newStatus
                );


                select.dataset.previousStatus =
                    newStatus;


                updateProductionStatusSelectStyle(
                    select,
                    newStatus
                );


                console.log(
                    "✓ Estado de producción actualizado:",
                    newStatus
                );


            } catch (error) {

                console.error(
                    "✗ Error actualizando estado de producción:",
                    error
                );


                if (previousStatus) {

                    select.value =
                        previousStatus;


                    updateProductionStatusSelectStyle(
                        select,
                        previousStatus
                    );

                }

            } finally {

                select.disabled =
                    false;

            }

        }
    );


    select.dataset.previousStatus =
        select.value;

}


// ========================================
// PRODUCTION STATUS STYLE
// ========================================

function updateProductionStatusSelectStyle(
    select,
    status
) {

    select.classList.remove(
        "enterprise-order-detail__production-select--pending",
        "enterprise-order-detail__production-select--in_production",
        "enterprise-order-detail__production-select--ready"
    );


    select.classList.add(
        `enterprise-order-detail__production-select--${status}`
    );

}


// ========================================
// PAYMENT STATUS STYLE
// ========================================

function updatePaymentStatusSelectStyle(
    select,
    status
) {

    select.classList.remove(
        "enterprise-order-detail__payment-select--pending",
        "enterprise-order-detail__payment-select--paid",
        "enterprise-order-detail__payment-select--partial",
        "enterprise-order-detail__payment-select--refunded"
    );


    select.classList.add(
        `enterprise-order-detail__payment-select--${status}`
    );

}


// ========================================
// ORDER STATUS STYLE
// ========================================

function updateOrderStatusSelectStyle(
    select,
    status
) {

    select.classList.remove(
        "enterprise-order-detail__status-select--pending",
        "enterprise-order-detail__status-select--confirmed",
        "enterprise-order-detail__status-select--processing",
        "enterprise-order-detail__status-select--ready",
        "enterprise-order-detail__status-select--completed",
        "enterprise-order-detail__status-select--cancelled"
    );


    select.classList.add(
        `enterprise-order-detail__status-select--${status}`
    );

}


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const container =
        document.querySelector(
            "#enterprise-orders"
        );


    if (!container) {

        console.error(
            "No se encontró #enterprise-orders"
        );

        return;

    }


    try {

        const orders =
            await getOrders();


        if (!orders.length) {

            container.innerHTML = `

                <div class="enterprise-dashboard__empty">

                    <i class="fa-solid fa-box-open"></i>

                    <h2>
                        No hay pedidos
                    </h2>

                    <p>
                        Todavía no se han registrado pedidos.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            orders
                .map(
                    order =>
                        renderOrder(order)
                )
                .join("");


        initOrderActions();


    } catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );


        container.innerHTML = `

            <div class="enterprise-dashboard__error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    No se pudo cargar el pedido
                </h2>

                <p>
                    Intenta nuevamente.
                </p>

            </div>

        `;

    }

}


// ========================================
// LOAD ORDER DETAIL
// ========================================

async function loadOrderDetail(
    orderId
) {

    const container =
        document.querySelector(
            "#enterprise-orders"
        );


    if (!container) {

        console.error(
            "No se encontró #enterprise-orders"
        );

        return;

    }


    try {

        const order =
            await getOrder(
                orderId
            );


        if (!order) {

            container.innerHTML = `

                <div class="enterprise-dashboard__error">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <h2>
                        Pedido no encontrado
                    </h2>

                    <p>
                        El pedido solicitado no existe.
                    </p>

                    <button
                        type="button"
                        class="enterprise-order-detail__back"
                        id="enterprise-back-orders"
                    >

                        <i class="fa-solid fa-arrow-left"></i>

                        Volver a pedidos

                    </button>

                </div>

            `;


            initBackToOrders();

            return;

        }


        // ========================================
        // RENDER DETAIL
        // ========================================

        container.innerHTML =
            renderOrderDetail(
                order
            );


        // ========================================
        // INIT CONTROLS
        // ========================================

        initBackToOrders();

        initOrderStatusControl();

        initPaymentStatusControl();

        initProductionStatusControl();


    } catch (error) {

        console.error(
            "Error cargando detalle del pedido:",
            error
        );

    }

}


// ========================================
// ORDER STATUS LABEL
// ========================================

function getOrderStatusLabel(
    status
) {

    const labels = {

        pending:
            "Pendiente",

        confirmed:
            "Confirmado",

        processing:
            "En proceso",

        ready:
            "Listo",

        completed:
            "Completado",

        cancelled:
            "Cancelado"

    };


    return (
        labels[status] ||
        "Pendiente"
    );

}


// ========================================
// RENDER ORDER DETAIL
// ========================================

function renderOrderDetail(
    order
) {

    const customer =
        order.customerSnapshot || {};


    const address =
        customer.address || {};


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    // ========================================
    // ORDER STATUS
    // ========================================

    const status =
        order.orderStatus ||
        "pending";


    // ========================================
    // PRODUCTION STATUS
    // ========================================

    const productionStatus =
        order.productionStatus ||
        (
            order.requiresProduction
                ? "pending"
                : "not_required"
        );


    // ========================================
    // PAYMENT STATUS
    // ========================================

    const paymentStatus =
        order.paymentStatus ||
        "pending";


    const paymentMethod =
        order.paymentMethod ||
        "other";


    const channel =
        order.salesChannel ||
        "manual";


    const subtotal =
        Number(
            order.subtotal || 0
        ).toFixed(2);


    const shipping =
        Number(
            order.shipping || 0
        ).toFixed(2);


    const discount =
        Number(
            order.discount || 0
        ).toFixed(2);


    const total =
        Number(
            order.total || 0
        ).toFixed(2);


    // ========================================
    // ITEMS
    // ========================================

    const itemsHTML =
        items
            .map(
                item => `

                    <div
                        class="
                            enterprise-order-detail__item
                        "
                    >

                        <div
                            class="
                                enterprise-order-detail__item-main
                            "
                        >

                            <strong>
                                ${
                                    item.productName ||
                                    "Producto"
                                }
                            </strong>

                            <span>
                                ${
                                    item.variantName ||
                                    "Sin variante"
                                }
                            </span>

                            <small>
                                SKU:
                                ${
                                    item.sku ||
                                    "—"
                                }
                            </small>

                        </div>


                        <div
                            class="
                                enterprise-order-detail__item-quantity
                            "
                        >
                            x${item.quantity || 0}
                        </div>


                        <div
                            class="
                                enterprise-order-detail__item-price
                            "
                        >
                            Q${
                                Number(
                                    item.total || 0
                                ).toFixed(2)
                            }
                        </div>

                    </div>

                `
            )
            .join("");


    // ========================================
    // DETAIL HTML
    // ========================================

    return `

        <div
            class="
                enterprise-order-detail
            "
        >

            <div
                class="
                    enterprise-order-detail__header
                "
            >

                <div>

                    <button
                        type="button"
                        class="
                            enterprise-order-detail__back
                        "
                        id="enterprise-back-orders"
                    >

                        <i
                            class="
                                fa-solid
                                fa-arrow-left
                            "
                        ></i>

                        Volver a pedidos

                    </button>


                    <div
                        class="
                            enterprise-order-detail__title-row
                        "
                    >

                        <h1>
                            Pedido #${order.orderNumber}
                        </h1>


                        <!-- ========================================
                             ORDER STATUS
                        ======================================== -->

                        <div
                            class="
                                enterprise-order-detail__status-control
                            "
                        >

                            <label
                                for="enterprise-order-status"
                                class="
                                    enterprise-order-detail__status-label
                                "
                            >
                                Estado
                            </label>


                            <select
                                id="enterprise-order-status"
                                class="
                                    enterprise-order-detail__status-select
                                    enterprise-order-detail__status-select--${status}
                                "
                                data-order-id="${order.id}"
                            >

                                <option
                                    value="pending"
                                    ${
                                        status === "pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pendiente
                                </option>


                                <option
                                    value="confirmed"
                                    ${
                                        status === "confirmed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Confirmado
                                </option>


                                <option
                                    value="processing"
                                    ${
                                        status === "processing"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    En proceso
                                </option>


                                <option
                                    value="ready"
                                    ${
                                        status === "ready"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Listo
                                </option>


                                <option
                                    value="completed"
                                    ${
                                        status === "completed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Completado
                                </option>


                                <option
                                    value="cancelled"
                                    ${
                                        status === "cancelled"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Cancelado
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ========================================
                 DETAIL GRID
            ======================================== -->

            <div
                class="
                    enterprise-order-detail__grid
                "
            >


                <!-- ========================================
                     CLIENTE
                ======================================== -->

                <section
                    class="
                        enterprise-order-detail__card
                    "
                >

                    <div
                        class="
                            enterprise-order-detail__card-header
                        "
                    >

                        <div>

                            <span
                                class="
                                    enterprise-dashboard__eyebrow
                                "
                            >
                                Cliente
                            </span>

                            <h2>
                                Información del cliente
                            </h2>

                        </div>


                        <i
                            class="
                                fa-solid
                                fa-user
                            "
                        ></i>

                    </div>


                    <div
                        class="
                            enterprise-order-detail__customer
                        "
                    >

                        <strong>
                            ${
                                customer.name ||
                                "Sin nombre"
                            }
                        </strong>

                        <span>
                            ${
                                customer.phone ||
                                "Sin teléfono"
                            }
                        </span>

                        <span>
                            ${
                                customer.email ||
                                "Sin correo"
                            }
                        </span>

                    </div>


                    <div
                        class="
                            enterprise-order-detail__address
                        "
                    >

                        <span>
                            Dirección
                        </span>

                        <p>

                            ${
                                address.line1 ||
                                ""
                            }

                            ${
                                address.line2 ||
                                ""
                            }

                            ${
                                address.city ||
                                ""
                            }

                            ${
                                address.department ||
                                ""
                            }

                            ${
                                address.country ||
                                ""
                            }

                        </p>

                    </div>

                </section>


                <!-- ========================================
                     PEDIDO
                ======================================== -->

                <section
                    class="
                        enterprise-order-detail__card
                    "
                >

                    <div
                        class="
                            enterprise-order-detail__card-header
                        "
                    >

                        <div>

                            <span
                                class="
                                    enterprise-dashboard__eyebrow
                                "
                            >
                                Pedido
                            </span>

                            <h2>
                                Información de venta
                            </h2>

                        </div>


                        <i
                            class="
                                fa-solid
                                fa-receipt
                            "
                        ></i>

                    </div>


                    <div
                        class="
                            enterprise-order-detail__meta
                        "
                    >

                        <!-- CANAL -->

                        <div>

                            <span>
                                Canal
                            </span>

                            <strong>
                                ${channel}
                            </strong>

                        </div>


                        <!-- PAGO -->

                        <div>

                            <span>
                                Pago
                            </span>


                            <select
                                id="enterprise-payment-status"
                                class="
                                    enterprise-order-detail__payment-select
                                    enterprise-order-detail__payment-select--${paymentStatus}
                                "
                                data-order-id="${order.id}"
                            >

                                <option
                                    value="pending"
                                    ${
                                        paymentStatus === "pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pendiente
                                </option>


                                <option
                                    value="paid"
                                    ${
                                        paymentStatus === "paid"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pagado
                                </option>


                                <option
                                    value="partial"
                                    ${
                                        paymentStatus === "partial"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pago parcial
                                </option>


                                <option
                                    value="refunded"
                                    ${
                                        paymentStatus === "refunded"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Reembolsado
                                </option>

                            </select>

                        </div>


                        <!-- MÉTODO -->

                        <div>

                            <span>
                                Método
                            </span>

                            <strong>
                                ${paymentMethod}
                            </strong>

                        </div>


                        <!-- PRODUCCIÓN -->

                        <div>

                            <span>
                                Producción
                            </span>


                            ${
                                order.requiresProduction
                                    ? `

                                        <select
                                            id="enterprise-production-status"
                                            class="
                                                enterprise-order-detail__production-select
                                                enterprise-order-detail__production-select--${productionStatus}
                                            "
                                            data-order-id="${order.id}"
                                        >

                                            <option
                                                value="pending"
                                                ${
                                                    productionStatus === "pending"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Pendiente
                                            </option>


                                            <option
                                                value="in_production"
                                                ${
                                                    productionStatus === "in_production"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                En producción
                                            </option>


                                            <option
                                                value="ready"
                                                ${
                                                    productionStatus === "ready"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Listo
                                            </option>

                                        </select>

                                    `
                                    : `

                                        <strong>
                                            No requiere
                                        </strong>

                                    `
                            }

                        </div>

                    </div>

                </section>


                <!-- ========================================
                     PRODUCTOS
                ======================================== -->

                <section
                    class="
                        enterprise-order-detail__card
                        enterprise-order-detail__products
                    "
                >

                    <div
                        class="
                            enterprise-order-detail__card-header
                        "
                    >

                        <div>

                            <span
                                class="
                                    enterprise-dashboard__eyebrow
                                "
                            >
                                Productos
                            </span>

                            <h2>
                                Artículos del pedido
                            </h2>

                        </div>


                        <i
                            class="
                                fa-solid
                                fa-box
                            "
                        ></i>

                    </div>


                    <div
                        class="
                            enterprise-order-detail__items
                        "
                    >

                        ${itemsHTML}

                    </div>

                </section>


                <!-- ========================================
                     RESUMEN
                ======================================== -->

                <section
                    class="
                        enterprise-order-detail__card
                        enterprise-order-detail__summary
                    "
                >

                    <div
                        class="
                            enterprise-order-detail__card-header
                        "
                    >

                        <div>

                            <span
                                class="
                                    enterprise-dashboard__eyebrow
                                "
                            >
                                Resumen
                            </span>

                            <h2>
                                Total del pedido
                            </h2>

                        </div>


                        <i
                            class="
                                fa-solid
                                fa-calculator
                            "
                        ></i>

                    </div>


                    <div
                        class="
                            enterprise-order-detail__totals
                        "
                    >

                        <div>

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                Q${subtotal}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Envío
                            </span>

                            <strong>
                                Q${shipping}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Descuento
                            </span>

                            <strong>
                                - Q${discount}
                            </strong>

                        </div>


                        <div
                            class="
                                enterprise-order-detail__total
                            "
                        >

                            <span>
                                Total
                            </span>

                            <strong>
                                Q${total}
                            </strong>

                        </div>

                    </div>

                </section>

            </div>

        </div>

    `;

}


// ========================================
// RENDER ORDER CARD
// ========================================

function renderOrder(
    order
) {

    const customer =
        order.customerSnapshot?.name ||
        "Cliente sin nombre";


    const channel =
        order.salesChannel ||
        "manual";


    const status =
        order.orderStatus ||
        "pending";


    const total =
        Number(
            order.total || 0
        ).toFixed(2);


    return `

        <article
            class="enterprise-order"
            data-order-id="${order.id}"
        >

            <div
                class="
                    enterprise-order__number
                "
            >

                <span>
                    Pedido
                </span>

                <strong>
                    #${order.orderNumber}
                </strong>

            </div>


            <div
                class="
                    enterprise-order__customer
                "
            >

                <span>
                    Cliente
                </span>

                <strong>
                    ${customer}
                </strong>

            </div>


            <div
                class="
                    enterprise-order__channel
                "
            >

                <span>
                    Canal
                </span>

                <strong>
                    ${channel}
                </strong>

            </div>


            <div
                class="
                    enterprise-order__total
                "
            >

                <span>
                    Total
                </span>

                <strong>
                    Q${total}
                </strong>

            </div>


            <div
                class="
                    enterprise-order__status
                    enterprise-order__status--${status}
                "
            >

                ${status}

            </div>


            <button
                type="button"
                class="enterprise-order__action"
                data-order-id="${order.id}"
                aria-label="Ver pedido"
            >

                <i
                    class="
                        fa-solid
                        fa-chevron-right
                    "
                ></i>

            </button>

        </article>

    `;

}