import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getOrders,
    updateOrderStatus,
    updatePaymentStatus,
    updateProductionStatus
} from "../firebase/firestore.js";


// ========================================
// STATE
// ========================================

let ordersState = [];

let currentFilters = {
    orderStatus: "all",
    paymentStatus: "all",
    productionStatus: "all",
    search: ""
};


// ========================================
// ENTERPRISE ORDERS
// ========================================

export async function EnterpriseOrders(
    profile
) {

    const content = `
        <section
            class="enterprise-orders"
            id="enterprise-orders"
        >

            <!-- ========================================
                 HEADER
            ======================================== -->

            <div
                class="enterprise-orders__header"
            >

                <div
                    class="enterprise-orders__heading"
                >

                    <span
                        class="enterprise-orders__eyebrow"
                    >
                        Enterprise
                    </span>

                    <h1
                        class="enterprise-orders__title"
                    >
                        Pedidos
                    </h1>

                    <p
                        class="enterprise-orders__description"
                    >
                        Gestiona y consulta todos los pedidos de Outsider.
                    </p>

                </div>


                <button
                    type="button"
                    class="enterprise-orders__new-order"
                    id="enterprise-orders-new-sale"
                >

                    <i class="fa-solid fa-plus"></i>

                    <span>
                        Nueva venta
                    </span>

                </button>

            </div>


            <!-- ========================================
                 SEARCH
            ======================================== -->

            <div
                class="enterprise-orders__toolbar"
            >

                <div
                    class="enterprise-orders__search"
                >

                    <i
                        class="fa-solid fa-magnifying-glass"
                    ></i>

                    <input
                        type="search"
                        id="enterprise-orders-search"
                        placeholder="Buscar pedido, cliente, producto o SKU..."
                        autocomplete="off"
                    />

                </div>

            </div>


            <!-- ========================================
                 ORDER STATUS FILTERS
            ======================================== -->

            <section
                class="enterprise-orders__filter-section"
            >

                <div
                    class="enterprise-orders__filter-heading"
                >
                    Estado del pedido
                </div>


                <div
                    class="enterprise-orders__filters"
                    id="enterprise-orders-order-filters"
                >

                    <button
                        type="button"
                        class="
                            enterprise-orders__filter
                            is-active
                        "
                        data-order-status-filter="all"
                    >
                        Todos
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-order-status-filter="pending"
                    >
                        Pendientes
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-order-status-filter="confirmed"
                    >
                        Confirmados
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-order-status-filter="processing"
                    >
                        En proceso
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-order-status-filter="completed"
                    >
                        Completados
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-order-status-filter="cancelled"
                    >
                        Cancelados
                    </button>

                </div>

            </section>


            <!-- ========================================
                 PAYMENT FILTERS
            ======================================== -->

            <section
                class="enterprise-orders__filter-section"
            >

                <div
                    class="enterprise-orders__filter-heading"
                >
                    Pago
                </div>


                <div
                    class="enterprise-orders__filters"
                    id="enterprise-orders-payment-filters"
                >

                    <button
                        type="button"
                        class="
                            enterprise-orders__filter
                            is-active
                        "
                        data-payment-status-filter="all"
                    >
                        Todos
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-payment-status-filter="pending"
                    >
                        Pendiente
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-payment-status-filter="paid"
                    >
                        Pagado
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-payment-status-filter="partial"
                    >
                        Parcial
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-payment-status-filter="refunded"
                    >
                        Reembolsado
                    </button>

                </div>

            </section>


            <!-- ========================================
                 PRODUCTION FILTERS
            ======================================== -->

            <section
                class="enterprise-orders__filter-section"
            >

                <div
                    class="enterprise-orders__filter-heading"
                >
                    Producción
                </div>


                <div
                    class="enterprise-orders__filters"
                    id="enterprise-orders-production-filters"
                >

                    <button
                        type="button"
                        class="
                            enterprise-orders__filter
                            is-active
                        "
                        data-production-status-filter="all"
                    >
                        Todos
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-production-status-filter="pending"
                    >
                        Pendiente
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-production-status-filter="in_production"
                    >
                        En producción
                    </button>


                    <button
                        type="button"
                        class="enterprise-orders__filter"
                        data-production-status-filter="ready"
                    >
                        Listo
                    </button>

                </div>

            </section>


            <!-- ========================================
                 RESULTS
            ======================================== -->

            <section
                class="enterprise-orders__results"
                id="enterprise-orders-results"
            >

                <div
                    class="enterprise-orders__loading"
                >

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

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
// INIT
// ========================================

export async function initEnterpriseOrders() {

    await loadOrders();

    initSearch();

    initOrderStatusFilters();

    initPaymentStatusFilters();

    initProductionStatusFilters();

    initNewSaleButton();

    renderOrders();
}


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const container =
        document.querySelector(
            "#enterprise-orders-results"
        );


    if (!container) {

        console.error(
            "No se encontró #enterprise-orders-results"
        );

        return;

    }


    try {

        container.innerHTML = `
            <div
                class="enterprise-orders__loading"
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Cargando pedidos...
                </span>

            </div>
        `;


        const orders =
            await getOrders();


        ordersState =
            orders;


        console.log(
            "Pedidos cargados:",
            ordersState
        );


    } catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );


        container.innerHTML = `
            <div
                class="enterprise-orders__error"
            >

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <h2>
                    No se pudieron cargar los pedidos
                </h2>

                <p>
                    Ocurrió un error al consultar los pedidos.
                </p>

            </div>
        `;

    }

}


// ========================================
// SEARCH
// ========================================

function initSearch() {

    const input =
        document.querySelector(
            "#enterprise-orders-search"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        () => {

            currentFilters.search =
                input.value
                    .trim()
                    .toLowerCase();


            renderOrders();

        }
    );

}


// ========================================
// ORDER STATUS FILTERS
// ========================================

function initOrderStatusFilters() {

    const buttons =
        document.querySelectorAll(
            "[data-order-status-filter]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilters.orderStatus =
                        button.dataset.orderStatusFilter;


                    updateFilterButtons(
                        buttons,
                        currentFilters.orderStatus
                    );


                    renderOrders();

                }
            );

        }
    );

}


// ========================================
// PAYMENT STATUS FILTERS
// ========================================

function initPaymentStatusFilters() {

    const buttons =
        document.querySelectorAll(
            "[data-payment-status-filter]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilters.paymentStatus =
                        button.dataset.paymentStatusFilter;


                    updateFilterButtons(
                        buttons,
                        currentFilters.paymentStatus
                    );


                    renderOrders();

                }
            );

        }
    );

}


// ========================================
// PRODUCTION STATUS FILTERS
// ========================================

function initProductionStatusFilters() {

    const buttons =
        document.querySelectorAll(
            "[data-production-status-filter]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilters.productionStatus =
                        button.dataset.productionStatusFilter;


                    updateFilterButtons(
                        buttons,
                        currentFilters.productionStatus
                    );


                    renderOrders();

                }
            );

        }
    );

}


// ========================================
// FILTER BUTTON STATE
// ========================================

function updateFilterButtons(
    buttons,
    activeValue
) {

    buttons.forEach(
        button => {

            const attribute =
                Object.keys(
                    button.dataset
                ).find(
                    key =>
                        key.endsWith(
                            "StatusFilter"
                        )
                );


            if (!attribute) {

                return;

            }


            if (
                button.dataset[attribute] ===
                activeValue
            ) {

                button.classList.add(
                    "is-active"
                );

            } else {

                button.classList.remove(
                    "is-active"
                );

            }

        }
    );

}


// ========================================
// FILTER ORDERS
// ========================================

function getFilteredOrders() {

    return ordersState.filter(
        order => {

            // ========================================
            // ORDER STATUS
            // ========================================

            if (
                currentFilters.orderStatus !==
                "all"
            ) {

                if (
                    order.orderStatus !==
                    currentFilters.orderStatus
                ) {

                    return false;

                }

            }


            // ========================================
            // PAYMENT STATUS
            // ========================================

            if (
                currentFilters.paymentStatus !==
                "all"
            ) {

                if (
                    order.paymentStatus !==
                    currentFilters.paymentStatus
                ) {

                    return false;

                }

            }


            // ========================================
            // PRODUCTION STATUS
            // ========================================

            if (
                currentFilters.productionStatus !==
                "all"
            ) {

                if (
                    order.productionStatus !==
                    currentFilters.productionStatus
                ) {

                    return false;

                }

            }


            // ========================================
            // SEARCH
            // ========================================

            if (
                currentFilters.search
            ) {

                const customer =
                    order.customerSnapshot ||
                    {};


                const customerName =
                    customer.name ||
                    "";


                const customerEmail =
                    customer.email ||
                    "";


                const customerPhone =
                    customer.phone ||
                    "";


                const orderNumber =
                    String(
                        order.orderNumber ||
                        ""
                    );


                const items =
                    Array.isArray(
                        order.items
                    )
                        ? order.items
                        : [];


                const searchableItems =
                    items
                        .map(
                            item =>
                                [
                                    item.productName,
                                    item.sku,
                                    item.variantName
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                        )
                        .join(" ");


                const searchableText =
                    [
                        orderNumber,
                        customerName,
                        customerEmail,
                        customerPhone,
                        searchableItems
                    ]
                        .join(" ")
                        .toLowerCase();


                if (
                    !searchableText.includes(
                        currentFilters.search
                    )
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders() {

    const container =
        document.querySelector(
            "#enterprise-orders-results"
        );


    if (!container) {

        return;

    }


    const filteredOrders =
        getFilteredOrders();


    if (!filteredOrders.length) {

        container.innerHTML = `
            <div
                class="enterprise-orders__empty"
            >

                <i
                    class="fa-solid fa-box-open"
                ></i>

                <h2>
                    No hay pedidos
                </h2>

                <p>
                    No encontramos pedidos con los filtros actuales.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        filteredOrders
            .map(
                order =>
                    renderOrderCard(
                        order
                    )
            )
            .join("");


    initOrderCardActions();

}


// ========================================
// ORDER CARD
// ========================================

function renderOrderCard(
    order
) {

    const customer =
        order.customerSnapshot ||
        {};


    const customerName =
        customer.name ||
        "Cliente sin nombre";


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const itemCount =
        items.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const productPreview =
        items
            .slice(0, 2)
            .map(
                item =>
                    `${item.productName || "Producto"}${item.variantName ? ` · ${item.variantName}` : ""}`
            )
            .join(" · ");


    const extraItems =
        items.length > 2
            ? ` +${items.length - 2} más`
            : "";


    const orderStatus =
        getOrderStatusLabel(
            order.orderStatus
        );


    const paymentStatus =
        getPaymentStatusLabel(
            order.paymentStatus
        );


    const productionStatus =
        order.requiresProduction
            ? getProductionStatusLabel(
                order.productionStatus
            )
            : "No requiere";


    const total =
        Number(
            order.total || 0
        ).toFixed(2);


    return `
        <article
            class="enterprise-orders__card"
            data-order-id="${order.id}"
            role="button"
            tabindex="0"
        >

            <div
                class="enterprise-orders__card-main"
            >

                <div
                    class="enterprise-orders__card-number"
                >
                    #${order.orderNumber || "—"}
                </div>


                <div
                    class="enterprise-orders__card-customer"
                >
                    ${escapeHTML(
                        customerName
                    )}
                </div>


                <div
                    class="enterprise-orders__card-products"
                >
                    ${
                        escapeHTML(
                            productPreview ||
                            "Sin productos"
                        )
                    }

                    ${extraItems}
                </div>


                <div
                    class="enterprise-orders__card-meta"
                >

                    <span>
                        ${itemCount}
                        ${
                            itemCount === 1
                                ? " artículo"
                                : " artículos"
                        }
                    </span>

                </div>

            </div>


            <div
                class="enterprise-orders__card-statuses"
            >

                <span
                    class="
                        enterprise-orders__status
                        enterprise-orders__status--order-${order.orderStatus || "unknown"}
                    "
                >
                    ${orderStatus}
                </span>


                <span
                    class="
                        enterprise-orders__status
                        enterprise-orders__status--payment-${order.paymentStatus || "unknown"}
                    "
                >
                    ${paymentStatus}
                </span>


                <span
                    class="
                        enterprise-orders__status
                        enterprise-orders__status--production-${order.productionStatus || "none"}
                    "
                >
                    ${productionStatus}
                </span>

            </div>


            <div
                class="enterprise-orders__card-total"
            >

                <span>
                    Total
                </span>

                <strong>
                    Q${total}
                </strong>

            </div>


            <div
                class="enterprise-orders__card-action"
                aria-hidden="true"
            >

                <i
                    class="fa-solid fa-chevron-right"
                ></i>

            </div>

        </article>
    `;

}


// ========================================
// CARD NAVIGATION
// ========================================

function initOrderCardActions() {

    const cards =
        document.querySelectorAll(
            ".enterprise-orders__card"
        );


    cards.forEach(
        card => {

            const openOrder =
                () => {

                    const orderId =
                        card.dataset.orderId;


                    if (!orderId) {

                        return;

                    }


                    window.history.pushState(
                        {},
                        "",
                        `/enterprise/orders?order=${encodeURIComponent(
                            orderId
                        )}`
                    );


                    loadOrderDetail(
                        orderId
                    );

                };


            card.addEventListener(
                "click",
                openOrder
            );


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openOrder();

                    }

                }
            );

        }
    );

}


// ========================================
// DETAIL PLACEHOLDER
// ========================================

async function loadOrderDetail(
    orderId
) {

    const order =
        ordersState.find(
            item =>
                item.id === orderId
        );


    if (!order) {

        console.error(
            "No se encontró el pedido:",
            orderId
        );

        return;

    }


    const container =
        document.querySelector(
            "#enterprise-orders-results"
        );


    if (!container) {

        return;

    }


    const customer =
        order.customerSnapshot ||
        {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const total =
        Number(
            order.total || 0
        ).toFixed(2);


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


    const orderStatus =
        getOrderStatusLabel(
            order.orderStatus
        );


    const paymentStatus =
        getPaymentStatusLabel(
            order.paymentStatus
        );


    const productionStatus =
        order.requiresProduction
            ? getProductionStatusLabel(
                order.productionStatus
            )
            : "No requiere";


    const createdAt =
        formatOrderDate(
            order.createdAt
        );


    container.innerHTML = `

        <!-- ========================================
             DETAIL HEADER
        ======================================== -->

        <div
            class="enterprise-orders__detail"
        >

            <div
                class="enterprise-orders__detail-header"
            >

                <button
                    type="button"
                    class="enterprise-orders__detail-back"
                    id="enterprise-orders-detail-back"
                >

                    <i
                        class="fa-solid fa-arrow-left"
                    ></i>

                    <span>
                        Volver a pedidos
                    </span>

                </button>


                <div
                    class="enterprise-orders__detail-title-row"
                >

                    <div>

                        <span
                            class="enterprise-orders__detail-eyebrow"
                        >
                            Pedido
                        </span>

                        <h1
                            class="enterprise-orders__detail-title"
                        >
                            #${escapeHTML(
                                order.orderNumber || "—"
                            )}
                        </h1>

                        <p
                            class="enterprise-orders__detail-date"
                        >
                            ${createdAt}
                        </p>

                        <div
                            class="enterprise-orders__detail-channel"
                        >

                            <span>
                                Canal de venta
                            </span>

                            <strong>
                                ${escapeHTML(
                                    formatSalesChannel(
                                        order.salesChannel
                                    )
                                )}
                            </strong>

                        </div>

                    </div>


                    <select
                        id="enterprise-orders-detail-order-status"
                        class="
                            enterprise-orders__detail-select
                            enterprise-orders__detail-select--order
                            enterprise-orders__status-select
                            enterprise-orders__status-select--order
                            ${getStatusClass(order.orderStatus)}
                        "
                        data-order-id="${escapeHTML(order.id)}"
                    >
                        <option
                            value="pending"
                            ${order.orderStatus === "pending" ? "selected" : ""}
                        >
                            Pendiente
                        </option>

                        <option
                            value="confirmed"
                            ${order.orderStatus === "confirmed" ? "selected" : ""}
                        >
                            Confirmado
                        </option>

                        <option
                            value="processing"
                            ${order.orderStatus === "processing" ? "selected" : ""}
                        >
                            En proceso
                        </option>

                        <option
                            value="ready"
                            ${order.orderStatus === "ready" ? "selected" : ""}
                        >
                            Listo
                        </option>

                        <option
                            value="completed"
                            ${order.orderStatus === "completed" ? "selected" : ""}
                        >
                            Completado
                        </option>

                        <option
                            value="cancelled"
                            ${order.orderStatus === "cancelled" ? "selected" : ""}
                        >
                            Cancelado
                        </option>
                    </select>

                </div>

            </div>


            <!-- ========================================
                 DETAIL GRID
            ======================================== -->

            <div
                class="enterprise-orders__detail-grid"
            >


                <!-- ========================================
                     CUSTOMER
                ======================================== -->

                <section
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--customer
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Cliente
                            </span>

                            <h2>
                                Información del cliente
                            </h2>

                        </div>

                        <i
                            class="fa-solid fa-user"
                        ></i>

                    </div>


                    <div
                        class="enterprise-orders__customer-info"
                    >

                        <div
                            class="enterprise-orders__customer-name"
                        >
                            ${escapeHTML(
                                customer.name ||
                                "Cliente sin nombre"
                            )}
                        </div>


                        ${
                            customer.phone
                                ? `
                                    <div
                                        class="enterprise-orders__customer-item"
                                    >

                                        <i
                                            class="fa-solid fa-phone"
                                        ></i>

                                        <span>
                                            ${escapeHTML(
                                                customer.phone
                                            )}
                                        </span>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            customer.email
                                ? `
                                    <div
                                        class="enterprise-orders__customer-item"
                                    >

                                        <i
                                            class="fa-solid fa-envelope"
                                        ></i>

                                        <span>
                                            ${escapeHTML(
                                                customer.email
                                            )}
                                        </span>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            formatCustomerAddress(customer.address)
                                ? `
                                    <div
                                        class="enterprise-orders__customer-item"
                                    >

                                        <i
                                            class="fa-solid fa-location-dot"
                                        ></i>

                                        <span>
                                            ${escapeHTML(
                                                formatCustomerAddress(
                                                    customer.address
                                                )
                                            )}
                                        </span>

                                    </div>
                                `
                                : ""
                        }

                    </div>

                </section>


                <!-- ========================================
                     ORDER NOTE
                ======================================== -->

                <section
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--note
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Comentario
                            </span>

                            <h2>
                                Comentario del pedido
                            </h2>

                        </div>

                        <i
                            class="fa-regular fa-note-sticky"
                        ></i>

                    </div>

                    <div
                        class="enterprise-orders__order-note"
                    >

                        ${
                            order.notes &&
                            String(order.notes).trim()
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            order.notes
                                        )}
                                    </p>
                                `
                                : `
                                    <span
                                        class="enterprise-orders__order-note-empty"
                                    >
                                        Sin comentario del pedido.
                                    </span>
                                `
                        }

                    </div>

                </section>


                <!-- ========================================
                     PAYMENT
                ======================================== -->

                <section
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--payment
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Pago
                            </span>

                            <h2>
                                Información de pago
                            </h2>

                        </div>

                        <i
                            class="fa-solid fa-credit-card"
                        ></i>

                    </div>


                    <div
                        class="enterprise-orders__payment-info"
                    >

                        <div
                            class="enterprise-orders__payment-row"
                        >

                            <span>
                                Método
                            </span>

                            <strong>
                                ${escapeHTML(
                                    formatPaymentMethod(
                                        order.paymentMethod
                                    )
                                )}
                            </strong>

                        </div>


                        <div
                            class="enterprise-orders__payment-row"
                        >

                            <span>
                                Estado
                            </span>

                            <select
                                id="enterprise-orders-detail-payment-status"
                                class="
                                    enterprise-orders__detail-select
                                    enterprise-orders__detail-select--payment
                                    enterprise-orders__status-select
                                    enterprise-orders__status-select--payment
                                    ${getStatusClass(order.paymentStatus)}
                                "
                                data-order-id="${escapeHTML(order.id)}"
                            >
                                <option
                                    value="pending"
                                    ${order.paymentStatus === "pending" ? "selected" : ""}
                                >
                                    Pendiente
                                </option>

                                <option
                                    value="paid"
                                    ${order.paymentStatus === "paid" ? "selected" : ""}
                                >
                                    Pagado
                                </option>

                                <option
                                    value="partial"
                                    ${order.paymentStatus === "partial" ? "selected" : ""}
                                >
                                    Pago parcial
                                </option>

                                <option
                                    value="refunded"
                                    ${order.paymentStatus === "refunded" ? "selected" : ""}
                                >
                                    Reembolsado
                                </option>
                            </select>

                        </div>

                    </div>

                </section>


                <!-- ========================================
                     PRODUCTS
                ======================================== -->

                <section
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--products
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Productos
                            </span>

                            <h2>
                                Artículos del pedido
                            </h2>

                        </div>

                        <span
                            class="enterprise-orders__detail-count"
                        >
                            ${items.length}
                            ${
                                items.length === 1
                                    ? " producto"
                                    : " productos"
                            }
                        </span>

                    </div>


                    <div
                        class="enterprise-orders__detail-products"
                    >

                        ${
                            items.length
                                ? items
                                    .map(
                                        item =>
                                            renderOrderDetailItem(
                                                item
                                            )
                                    )
                                    .join("")
                                : `
                                    <div
                                        class="enterprise-orders__detail-empty"
                                    >
                                        No hay productos registrados.
                                    </div>
                                `
                        }

                    </div>

                </section>


                <!-- ========================================
                     PRODUCTION
                ======================================== -->

                <section
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--production
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Producción
                            </span>

                            <h2>
                                Estado de producción
                            </h2>

                        </div>

                        <i
                            class="fa-solid fa-industry"
                        ></i>

                    </div>


                    <div
                        class="enterprise-orders__production-info"
                    >

                        <div
                            class="enterprise-orders__production-row"
                        >

                            <span>
                                Requiere producción
                            </span>

                            <strong>
                                ${
                                    order.requiresProduction
                                        ? "Sí"
                                        : "No"
                                }
                            </strong>

                        </div>


                        <div
                            class="enterprise-orders__production-row"
                        >

                            <span>
                                Estado
                            </span>

                            ${
                                order.requiresProduction
                                    ? `
                                        <select
                                            id="enterprise-orders-detail-production-status"
                                            class="
                                            enterprise-orders__detail-select
                                            enterprise-orders__detail-select--production
                                            enterprise-orders__status-select
                                            enterprise-orders__status-select--production
                                            ${getStatusClass(order.productionStatus)}
                                        "
                                            data-order-id="${escapeHTML(order.id)}"
                                        >
                                            <option
                                                value="pending"
                                                ${order.productionStatus === "pending" ? "selected" : ""}
                                            >
                                                Pendiente
                                            </option>

                                            <option
                                                value="in_production"
                                                ${order.productionStatus === "in_production" ? "selected" : ""}
                                            >
                                                En producción
                                            </option>

                                            <option
                                                value="ready"
                                                ${order.productionStatus === "ready" ? "selected" : ""}
                                            >
                                                Listo
                                            </option>
                                        </select>
                                    `
                                    : `
                                        <span
                                            class="
                                                enterprise-orders__status
                                                enterprise-orders__status--production-none
                                            "
                                        >
                                            No requiere
                                        </span>
                                    `
                            }

                        </div>

                    </div>

                </section>


                <!-- ========================================
                     SUMMARY
                ======================================== -->

                <aside
                    class="
                        enterprise-orders__detail-card
                        enterprise-orders__detail-card--summary
                    "
                >

                    <div
                        class="enterprise-orders__detail-card-header"
                    >

                        <div>

                            <span
                                class="enterprise-orders__detail-card-eyebrow"
                            >
                                Resumen
                            </span>

                            <h2>
                                Total del pedido
                            </h2>

                        </div>

                    </div>


                    <div
                        class="enterprise-orders__summary"
                    >

                        <div
                            class="enterprise-orders__summary-row"
                        >

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                Q${subtotal}
                            </strong>

                        </div>


                        <div
                            class="enterprise-orders__summary-row"
                        >

                            <span>
                                Envío
                            </span>

                            <strong>
                                Q${shipping}
                            </strong>

                        </div>


                        <div
                            class="enterprise-orders__summary-row"
                        >

                            <span>
                                Descuento
                            </span>

                            <strong>
                                - Q${discount}
                            </strong>

                        </div>


                        <div
                            class="enterprise-orders__summary-divider"
                        ></div>


                        <div
                            class="
                                enterprise-orders__summary-row
                                enterprise-orders__summary-row--total
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

                </aside>

            </div>

        </div>
    `;


    initOrderDetailActions();
    initOrderDetailStatusControls();

}

// ========================================
// ORDER DETAIL ITEM
// ========================================

function renderOrderDetailItem(
    item
) {

    const quantity =
        Number(
            item.quantity || 0
        );


    const unitPrice =
        Number(
            item.unitPrice || 0
        ).toFixed(2);


    const itemTotal =
        Number(
            item.total || 0
        ).toFixed(2);


    return `
        <article
            class="enterprise-orders__detail-product"
        >

            <div
                class="enterprise-orders__detail-product-main"
            >

                <div
                    class="enterprise-orders__detail-product-name"
                >
                    ${escapeHTML(
                        item.productName ||
                        "Producto"
                    )}
                </div>


                ${
                    item.variantName
                        ? `
                            <div
                                class="enterprise-orders__detail-product-variant"
                            >
                                ${escapeHTML(
                                    item.variantName
                                )}
                            </div>
                        `
                        : ""
                }


                ${
                    item.sku
                        ? `
                            <div
                                class="enterprise-orders__detail-product-sku"
                            >
                                SKU: ${escapeHTML(
                                    item.sku
                                )}
                            </div>
                        `
                        : ""
                }

            </div>


            <div
                class="enterprise-orders__detail-product-quantity"
            >
                x${quantity}
            </div>


            <div
                class="enterprise-orders__detail-product-price"
            >

                <span>
                    Q${unitPrice}
                </span>

                <strong>
                    Q${itemTotal}
                </strong>

            </div>

        </article>
    `;

}


// ========================================
// DETAIL STATUS CONTROLS
// ========================================

function getCurrentDetailOrder(
    orderId
) {

    return ordersState.find(
        order =>
            order.id === orderId
    );

}


function setDetailSelectState(
    select,
    disabled
) {

    if (!select) {
        return;
    }

    select.disabled = disabled;

}


function refreshCurrentOrderInState(
    orderId,
    field,
    value
) {

    const order =
        ordersState.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        return;
    }

    order[field] = value;

}


function initOrderDetailStatusControls() {

    const orderStatusSelect =
        document.querySelector(
            "#enterprise-orders-detail-order-status"
        );

    const paymentStatusSelect =
        document.querySelector(
            "#enterprise-orders-detail-payment-status"
        );

    const productionStatusSelect =
        document.querySelector(
            "#enterprise-orders-detail-production-status"
        );


    if (orderStatusSelect) {

        orderStatusSelect.addEventListener(
            "change",
            async () => {

                const orderId =
                    orderStatusSelect.dataset.orderId;

                const newStatus =
                    orderStatusSelect.value;

                const order =
                    getCurrentDetailOrder(
                        orderId
                    );

                if (
                    !orderId ||
                    !newStatus ||
                    !order
                ) {
                    return;
                }

                const previousStatus =
                    order.orderStatus;

                setDetailSelectState(
                    orderStatusSelect,
                    true
                );

                try {

                    await updateOrderStatus(
                        orderId,
                        newStatus
                    );

                    refreshCurrentOrderInState(
                        orderId,
                        "orderStatus",
                        newStatus
                    );

                    updateStatusSelectClass(
                        orderStatusSelect,
                        "order",
                        newStatus
                    );

                } catch (error) {

                    console.error(
                        "Error actualizando estado del pedido:",
                        error
                    );

                    orderStatusSelect.value =
                        previousStatus || "pending";

                    updateStatusSelectClass(
                        orderStatusSelect,
                        "order",
                        previousStatus || "pending"
                    );

                } finally {

                    setDetailSelectState(
                        orderStatusSelect,
                        false
                    );

                }

            }
        );

    }


    if (paymentStatusSelect) {

        paymentStatusSelect.addEventListener(
            "change",
            async () => {

                const orderId =
                    paymentStatusSelect.dataset.orderId;

                const newStatus =
                    paymentStatusSelect.value;

                const order =
                    getCurrentDetailOrder(
                        orderId
                    );

                if (
                    !orderId ||
                    !newStatus ||
                    !order
                ) {
                    return;
                }

                const previousStatus =
                    order.paymentStatus;

                setDetailSelectState(
                    paymentStatusSelect,
                    true
                );

                try {

                    await updatePaymentStatus(
                        orderId,
                        newStatus
                    );

                    refreshCurrentOrderInState(
                        orderId,
                        "paymentStatus",
                        newStatus
                    );

                    updateStatusSelectClass(
                        paymentStatusSelect,
                        "payment",
                        newStatus
                    );

                } catch (error) {

                    console.error(
                        "Error actualizando estado de pago:",
                        error
                    );

                    paymentStatusSelect.value =
                        previousStatus || "pending";

                    updateStatusSelectClass(
                        paymentStatusSelect,
                        "payment",
                        previousStatus || "pending"
                    );

                } finally {

                    setDetailSelectState(
                        paymentStatusSelect,
                        false
                    );

                }

            }
        );

    }


    if (productionStatusSelect) {

        productionStatusSelect.addEventListener(
            "change",
            async () => {

                const orderId =
                    productionStatusSelect.dataset.orderId;

                const newStatus =
                    productionStatusSelect.value;

                const order =
                    getCurrentDetailOrder(
                        orderId
                    );

                if (
                    !orderId ||
                    !newStatus ||
                    !order
                ) {
                    return;
                }

                const previousStatus =
                    order.productionStatus;

                setDetailSelectState(
                    productionStatusSelect,
                    true
                );

                try {

                    await updateProductionStatus(
                        orderId,
                        newStatus
                    );

                    refreshCurrentOrderInState(
                        orderId,
                        "productionStatus",
                        newStatus
                    );

                    updateStatusSelectClass(
                        productionStatusSelect,
                        "production",
                        newStatus
                    );

                } catch (error) {

                    console.error(
                        "Error actualizando estado de producción:",
                        error
                    );

                    productionStatusSelect.value =
                        previousStatus || "pending";

                    updateStatusSelectClass(
                        productionStatusSelect,
                        "production",
                        previousStatus || "pending"
                    );

                } finally {

                    setDetailSelectState(
                        productionStatusSelect,
                        false
                    );

                }

            }
        );

    }

}


// ========================================
// DETAIL ACTIONS
// ========================================

function initOrderDetailActions() {

    const backButton =
        document.querySelector(
            "#enterprise-orders-detail-back"
        );


    if (!backButton) {

        return;

    }


    backButton.addEventListener(
        "click",
        () => {

            window.history.pushState(
                {},
                "",
                "/enterprise/orders"
            );


            renderOrders();

        }
    );

}


// ========================================
// CUSTOMER ADDRESS
// ========================================

function formatCustomerAddress(
    address
) {

    if (!address) {
        return "";
    }

    if (typeof address === "string") {
        return address.trim();
    }

    if (typeof address !== "object") {
        return "";
    }

    return [
        address.line1,
        address.line2,
        address.city,
        address.department,
        address.postalCode,
        address.country
    ]
        .filter(
            value =>
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
        )
        .map(
            value =>
                String(value).trim()
        )
        .join(", ");

}


// ========================================
// PAYMENT METHOD
// ========================================

function formatPaymentMethod(
    method
) {

    const labels = {

        cash:
            "Efectivo",

        card:
            "Tarjeta",

        transfer:
            "Transferencia",

        bank_transfer:
            "Transferencia bancaria",

        credit_card:
            "Tarjeta de crédito",

        debit_card:
            "Tarjeta de débito",

        paypal:
            "PayPal"

    };


    return (
        labels[method] ||
        method ||
        "No especificado"
    );

}


// ========================================
// SALES CHANNEL
// ========================================

function formatSalesChannel(
    channel
) {

    const labels = {

        marketplace:
            "Marketplace",

        shopify:
            "Shopify",

        instagram:
            "Instagram",

        facebook:
            "Facebook",

        tiktok:
            "TikTok",

        whatsapp:
            "WhatsApp",

        manual:
            "Venta manual"

    };

    return (
        labels[channel] ||
        channel ||
        "No especificado"
    );

}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(
    status
) {

    if (!status) {
        return "pending";
    }

    return String(status)
        .trim()
        .toLowerCase()
        .replace(/_/g, "-")
        .replace(/\s+/g, "-");

}


// ========================================
// UPDATE SELECT STATUS COLOR
// ========================================

function updateStatusSelectClass(
    select,
    type,
    status
) {

    if (!select) {
        return;
    }

    const prefixes = {
        order:
            "enterprise-orders__status-select--order",
        payment:
            "enterprise-orders__status-select--payment",
        production:
            "enterprise-orders__status-select--production"
    };

    if (!prefixes[type]) {
        return;
    }

    const statusClasses = [
        "pending",
        "confirmed",
        "processing",
        "ready",
        "completed",
        "cancelled",
        "paid",
        "partial",
        "refunded",
        "in-production"
    ];

    statusClasses.forEach(
        statusClass => {
            select.classList.remove(statusClass);
        }
    );

    select.classList.add(
        getStatusClass(status)
    );

}


// ========================================
// ORDER DATE
// ========================================

function formatOrderDate(
    value
) {

    if (!value) {

        return "Fecha no disponible";

    }


    try {

        let date;


        if (
            typeof value.toDate ===
            "function"
        ) {

            date =
                value.toDate();

        } else if (
            value.seconds
        ) {

            date =
                new Date(
                    value.seconds * 1000
                );

        } else {

            date =
                new Date(
                    value
                );

        }


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Fecha no disponible";

        }


        return new Intl.DateTimeFormat(
            "es-GT",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(
            date
        );

    } catch (error) {

        console.warn(
            "No se pudo formatear la fecha:",
            error
        );


        return "Fecha no disponible";

    }

}
// ========================================
// NEW SALE
// ========================================

function initNewSaleButton() {

    const button =
        document.querySelector(
            "#enterprise-orders-new-sale"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            console.log(
                "Nueva venta seleccionada."
            );

        }
    );

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
        "Desconocido"
    );

}


// ========================================
// PAYMENT STATUS LABEL
// ========================================

function getPaymentStatusLabel(
    status
) {

    const labels = {

        pending:
            "Pago pendiente",

        paid:
            "Pagado",

        partial:
            "Pago parcial",

        refunded:
            "Reembolsado"

    };


    return (
        labels[status] ||
        "Pago desconocido"
    );

}


// ========================================
// PRODUCTION STATUS LABEL
// ========================================

function getProductionStatusLabel(
    status
) {

    const labels = {

        pending:
            "Producción pendiente",

        in_production:
            "En producción",

        ready:
            "Producción lista"

    };


    return (
        labels[status] ||
        "Producción desconocida"
    );

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}