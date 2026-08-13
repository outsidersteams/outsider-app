import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getOrders,
    updateOrderStatus,
    updatePaymentStatus,
    updateProductionStatus,
    createSaleFromOrder,
    refundSaleFromOrder,
    getProducts,
    getCustomers,
    createCustomer,
    createOrder
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

let newSaleState = {
    products: [],
    customers: [],
    cart: [],
    selectedCustomer: null,
    selectedProduct: null,
    salesChannel: "marketplace",
    paymentMethod: "cash",
    paymentStatus: "paid",
    shipping: 0,
    discount: 0,
    requiresProduction: false,
    profile: null
};


// ========================================
// ENTERPRISE ORDERS
// ========================================

export async function EnterpriseOrders(
    profile
) {

    newSaleState.profile = profile;

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
        getOrderTotal(order).toFixed(2);


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
        getOrderTotal(order).toFixed(2);


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


    // ========================================
    // SALE AVAILABILITY
    // ========================================

    const canMarkAsSale =
        order.orderStatus === "completed" &&
        order.paymentStatus === "paid" &&
        (
            order.requiresProduction !== true ||
            order.productionStatus === "ready" ||
            order.productionStatus === "not_required"
        ) &&
        order.saleConfirmed !== true &&
        !order.saleId;

    const canProcessRefund =
        order.saleConfirmed === true &&
        !!order.saleId &&
        order.orderStatus === "cancelled" &&
        order.paymentStatus === "refunded" &&
        order.refundConfirmed !== true;


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


                    <div
                        class="enterprise-orders__detail-actions"
                    >

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

                        ${
                            canMarkAsSale
                                ? `
                                    <button
                                        type="button"
                                        id="enterprise-orders-detail-mark-sale"
                                        class="enterprise-orders__mark-sale"
                                        data-order-id="${order.id}"
                                    >
                                        <i class="fa-solid fa-check"></i>
                                        Marcar como venta
                                    </button>
                                `
                                : ""
                        }

                        ${
                            canProcessRefund
                                ? `
                                    <button
                                        type="button"
                                        id="enterprise-orders-detail-process-refund"
                                        class="enterprise-orders__mark-sale"
                                        data-order-id="${order.id}"
                                    >
                                        <i class="fa-solid fa-rotate-left"></i>
                                        Procesar reembolso
                                    </button>
                                `
                                : ""
                        }

                    </div>

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

    const markSaleButton =
        document.querySelector(
            "#enterprise-orders-detail-mark-sale"
        );

    const processRefundButton =
        document.querySelector(
            "#enterprise-orders-detail-process-refund"
        );


    if (backButton) {

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


    if (markSaleButton) {

        markSaleButton.addEventListener(
            "click",
            () => {

                const orderId =
                    markSaleButton.dataset.orderId ||
                    document.querySelector(
                        "#enterprise-orders-detail-order-status"
                    )?.dataset.orderId;

                const order =
                    getCurrentDetailOrder(
                        orderId
                    );

                if (!order) {

                    console.error(
                        "No se encontró la orden para confirmar la venta.",
                        orderId
                    );

                    return;

                }

                openSaleConfirmationModal(
                    order
                );

            }
        );

    }

    if (processRefundButton) {

        processRefundButton.addEventListener(
            "click",
            () => {

                const orderId =
                    processRefundButton.dataset.orderId;

                const order =
                    getCurrentDetailOrder(
                        orderId
                    );

                if (!order) {

                    console.error(
                        "No se encontró la orden para procesar el reembolso.",
                        orderId
                    );

                    return;

                }

                openRefundAuthorizationModal(
                    order
                );

            }
        );

    }


}


// ========================================
// SALE CONFIRMATION MODAL
// ========================================

function openSaleConfirmationModal(
    order
) {

    closeSaleConfirmationModal();


    const orderNumber =
        order.orderNumber ||
        "—";

    const total =
        getOrderTotal(order).toFixed(2);


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "enterprise-orders-sale-confirmation-modal";


    modal.className =
        "enterprise-orders__sale-modal";


    modal.innerHTML = `

        <div
            class="enterprise-orders__sale-modal-backdrop"
            data-sale-modal-close="true"
        ></div>


        <section
            class="enterprise-orders__sale-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enterprise-orders-sale-modal-title"
        >

            <div
                class="enterprise-orders__sale-modal-icon"
                aria-hidden="true"
            >
                <i class="fa-solid fa-check"></i>
            </div>


            <div
                class="enterprise-orders__sale-modal-content"
            >

                <h2
                    id="enterprise-orders-sale-modal-title"
                >
                    ¿Registrar esta venta?
                </h2>


                <p>
                    Estás a punto de registrar el pedido
                    <strong>#${orderNumber}</strong>
                    como una venta realizada.
                </p>


                <p>
                    Se creará el registro financiero correspondiente
                    por un total de
                    <strong>Q${total}</strong>.
                </p>


                <p
                    class="enterprise-orders__sale-modal-warning"
                >
                    Confirma únicamente si el pedido fue efectivamente
                    cobrado y completado.
                </p>

            </div>


            <div
                class="enterprise-orders__sale-modal-actions"
            >

                <button
                    type="button"
                    class="enterprise-orders__sale-modal-cancel"
                    id="enterprise-orders-sale-modal-cancel"
                >
                    Cancelar
                </button>


                <button
                    type="button"
                    class="enterprise-orders__sale-modal-confirm"
                    id="enterprise-orders-sale-modal-confirm"
                >
                    Confirmar venta
                </button>

            </div>

        </section>

    `;


    document.body.appendChild(
        modal
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-open"
            );

        }
    );


    const cancelButton =
        modal.querySelector(
            "#enterprise-orders-sale-modal-cancel"
        );

    const confirmButton =
        modal.querySelector(
            "#enterprise-orders-sale-modal-confirm"
        );


    const close =
        () => {

            closeSaleConfirmationModal();

        };


    cancelButton?.addEventListener(
        "click",
        close
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.dataset.saleModalClose ===
                "true"
            ) {

                close();

            }

        }
    );


    confirmButton?.addEventListener(
        "click",
        async () => {

            if (
                confirmButton.disabled
            ) {

                return;

            }

            confirmButton.disabled = true;

            const originalText =
                confirmButton.textContent;

            confirmButton.textContent =
                "Registrando...";

            try {

                const result =
                    await createSaleFromOrder(
                        order.id
                    );


                close();

                await renderOrders();

            } catch (error) {

                console.error(
                    "Error al registrar la venta:",
                    error
                );

                confirmButton.disabled = false;

                confirmButton.textContent =
                    originalText;

                window.alert(
                    error?.message ||
                    "No fue posible registrar la venta."
                );

            }

        }
    );


    const handleEscape =
        event => {

            if (
                event.key === "Escape"
            ) {

                close();

            }

        };


    document.addEventListener(
        "keydown",
        handleEscape
    );


    modal._saleModalCleanup =
        () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };


    cancelButton?.focus();

}


function closeSaleConfirmationModal() {

    const modal =
        document.querySelector(
            "#enterprise-orders-sale-confirmation-modal"
        );


    if (!modal) {

        return;

    }


    if (
        typeof modal._saleModalCleanup ===
        "function"
    ) {

        modal._saleModalCleanup();

    }


    modal.classList.remove(
        "is-open"
    );


    window.setTimeout(
        () => {

            modal.remove();

        },
        160
    );

}


// ========================================
// ORDER TOTAL
// ========================================

function getOrderTotal(
    order
) {

    const storedTotal =
        Number(order?.total);

    // Si Firestore ya tiene un total válido, lo respetamos.
    if (
        Number.isFinite(storedTotal) &&
        storedTotal > 0
    ) {
        return storedTotal;
    }

    // Fallback: reconstruimos el total a partir del resumen
    // que ya existe en la orden. Esto evita mostrar Q0.00
    // cuando subtotal/envío/descuento sí están disponibles.
    const subtotal =
        Number(order?.subtotal) || 0;

    const shipping =
        Number(order?.shipping) || 0;

    const discount =
        Number(order?.discount) || 0;

    return subtotal + shipping - discount;

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
        async () => {
            await openNewSalePOS();
        }
    );

}


// ========================================
// NEW SALE — POS
// ========================================

async function openNewSalePOS() {

    closeNewSalePOS();

    newSaleState = {
        products: [],
        customers: [],
        cart: [],
        selectedCustomer: null,
        selectedProduct: null,
        salesChannel: "marketplace",
        paymentMethod: "cash",
        paymentStatus: "paid",
        shipping: 0,
        discount: 0,
        requiresProduction: false,
        profile: newSaleState.profile
    };

    try {
        const [products, customers] = await Promise.all([
            getProducts(),
            getCustomers()
        ]);

        newSaleState.products =
            Array.isArray(products)
                ? products.filter(item => item?.active !== false)
                : [];

        newSaleState.customers =
            Array.isArray(customers)
                ? customers.filter(item => item?.active !== false)
                : [];

    } catch (error) {
        console.error("Error cargando datos del POS:", error);
        window.alert(error?.message || "No fue posible cargar clientes y productos.");
        return;
    }

    const modal = document.createElement("div");
    modal.id = "enterprise-orders-new-sale-pos";
    modal.className = "enterprise-orders__pos";
    modal.innerHTML = renderNewSalePOS();
    document.body.appendChild(modal);

    requestAnimationFrame(() => modal.classList.add("is-open"));

    initNewSalePOSEvents(modal);
    renderNewSalePOSCart(modal);
    renderPOSCustomerResults(modal, "");
}

function renderNewSalePOS() {
    return `
        <div class="enterprise-orders__pos-backdrop" data-pos-close="true"></div>
        <section class="enterprise-orders__pos-dialog" role="dialog" aria-modal="true" aria-labelledby="enterprise-orders-pos-title">
            <header class="enterprise-orders__pos-header">
                <div>
                    <span class="enterprise-orders__pos-eyebrow">Point of Sale</span>
                    <h2 id="enterprise-orders-pos-title">Nueva venta</h2>
                    <p>Registra una venta de Marketplace, Facebook, Instagram u otro canal.</p>
                </div>
                <button type="button" class="enterprise-orders__pos-close" id="enterprise-orders-pos-close" aria-label="Cerrar">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div class="enterprise-orders__pos-body">
                <div class="enterprise-orders__pos-main">

                    <section class="enterprise-orders__pos-section">
                        <div class="enterprise-orders__pos-section-heading">
                            <div><span>01</span><h3>Cliente</h3></div>
                            <button type="button" class="enterprise-orders__pos-secondary-button" id="enterprise-orders-pos-new-customer" ${newSaleState.profile?.role === "admin" ? "" : "disabled"}>
                                <i class="fa-solid fa-user-plus"></i> Nuevo cliente
                            </button>
                        </div>
                        <div class="enterprise-orders__pos-field">
                            <label for="enterprise-orders-pos-customer-search">Buscar cliente</label>
                            <div class="enterprise-orders__pos-search">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="search" id="enterprise-orders-pos-customer-search" placeholder="Nombre, teléfono o correo..." autocomplete="off">
                            </div>
                            <div id="enterprise-orders-pos-customer-results" class="enterprise-orders__pos-results"></div>
                        </div>
                        <div id="enterprise-orders-pos-selected-customer"></div>
                    </section>

                    <section class="enterprise-orders__pos-section">
                        <div class="enterprise-orders__pos-section-heading">
                            <div><span>02</span><h3>Productos</h3></div>
                        </div>
                        <div class="enterprise-orders__pos-field">
                            <label for="enterprise-orders-pos-product-search">Buscar producto</label>
                            <div class="enterprise-orders__pos-search">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="search" id="enterprise-orders-pos-product-search" placeholder="Nombre, SKU o categoría..." autocomplete="off">
                            </div>
                            <div id="enterprise-orders-pos-product-results" class="enterprise-orders__pos-results"></div>
                        </div>
                        <div id="enterprise-orders-pos-product-config"></div>
                        <div id="enterprise-orders-pos-cart"></div>
                    </section>

                    <section class="enterprise-orders__pos-section">
                        <div class="enterprise-orders__pos-section-heading">
                            <div><span>03</span><h3>Datos de la venta</h3></div>
                        </div>
                        <div class="enterprise-orders__pos-grid">
                            <div class="enterprise-orders__pos-field">
                                <label>Canal de venta</label>
                                <select id="enterprise-orders-pos-channel">
                                    <option value="marketplace">Facebook Marketplace</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="web">Tienda web</option>
                                    <option value="physical_store">Tienda física</option>
                                    <option value="event">Evento</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div class="enterprise-orders__pos-field">
                                <label>Método de pago</label>
                                <select id="enterprise-orders-pos-payment-method">
                                    <option value="cash">Efectivo</option>
                                    <option value="transfer">Transferencia</option>
                                    <option value="card">Tarjeta</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div class="enterprise-orders__pos-field">
                                <label>Estado del pago</label>
                                <select id="enterprise-orders-pos-payment-status">
                                    <option value="paid">Pagado</option>
                                    <option value="pending">Pendiente</option>
                                </select>
                            </div>
                            <div class="enterprise-orders__pos-field">
                                <label>Producción</label>
                                <select id="enterprise-orders-pos-requires-production">
                                    <option value="false">No requiere producción</option>
                                    <option value="true">Requiere producción</option>
                                </select>
                            </div>
                            <div class="enterprise-orders__pos-field">
                                <label>Envío</label>
                                <input type="number" id="enterprise-orders-pos-shipping" min="0" step="0.01" value="0">
                            </div>
                            <div class="enterprise-orders__pos-field">
                                <label>Descuento</label>
                                <input type="number" id="enterprise-orders-pos-discount" min="0" step="0.01" value="0">
                            </div>
                        </div>
                    </section>

                </div>

                <aside class="enterprise-orders__pos-summary">
                    <div class="enterprise-orders__pos-summary-sticky">
                        <span class="enterprise-orders__pos-summary-eyebrow">Resumen</span>
                        <h3>Nueva orden</h3>
                        <div id="enterprise-orders-pos-summary-items"></div>
                        <div class="enterprise-orders__pos-summary-lines">
                            <div><span>Subtotal</span><strong id="enterprise-orders-pos-summary-subtotal">Q0.00</strong></div>
                            <div><span>Envío</span><strong id="enterprise-orders-pos-summary-shipping">Q0.00</strong></div>
                            <div><span>Descuento</span><strong id="enterprise-orders-pos-summary-discount">Q0.00</strong></div>
                            <div class="enterprise-orders__pos-summary-total"><span>Total</span><strong id="enterprise-orders-pos-summary-total">Q0.00</strong></div>
                        </div>
                        <button type="button" class="enterprise-orders__pos-submit" id="enterprise-orders-pos-submit">
                            <i class="fa-solid fa-check"></i> Crear pedido
                        </button>
                        <button type="button" class="enterprise-orders__pos-cancel" id="enterprise-orders-pos-cancel">Cancelar</button>
                    </div>
                </aside>
            </div>
        </section>
    `;
}

function initNewSalePOSEvents(modal) {

    const close = () => closeNewSalePOS();

    modal.querySelector("#enterprise-orders-pos-close")?.addEventListener("click", close);
    modal.querySelector("#enterprise-orders-pos-cancel")?.addEventListener("click", close);
    modal.addEventListener("click", event => {
        if (event.target.dataset.posClose === "true") close();
    });

    modal.querySelector("#enterprise-orders-pos-customer-search")?.addEventListener("input", event => {
        renderPOSCustomerResults(modal, event.target.value);
    });

    modal.querySelector("#enterprise-orders-pos-product-search")?.addEventListener("input", event => {
        renderPOSProductResults(modal, event.target.value);
    });

    modal.querySelector("#enterprise-orders-pos-channel")?.addEventListener("change", event => {
        newSaleState.salesChannel = event.target.value;
    });
    modal.querySelector("#enterprise-orders-pos-payment-method")?.addEventListener("change", event => {
        newSaleState.paymentMethod = event.target.value;
    });
    modal.querySelector("#enterprise-orders-pos-payment-status")?.addEventListener("change", event => {
        newSaleState.paymentStatus = event.target.value;
    });
    modal.querySelector("#enterprise-orders-pos-requires-production")?.addEventListener("change", event => {
        newSaleState.requiresProduction = event.target.value === "true";
    });
    modal.querySelector("#enterprise-orders-pos-shipping")?.addEventListener("input", event => {
        newSaleState.shipping = Math.max(0, Number(event.target.value) || 0);
        renderNewSalePOSSummary(modal);
    });
    modal.querySelector("#enterprise-orders-pos-discount")?.addEventListener("input", event => {
        newSaleState.discount = Math.max(0, Number(event.target.value) || 0);
        renderNewSalePOSSummary(modal);
    });

    modal.querySelector("#enterprise-orders-pos-new-customer")?.addEventListener("click", () => {
        if (newSaleState.profile?.role !== "admin") {
            window.alert("Solo un administrador puede crear un cliente desde Enterprise.");
            return;
        }
        openPOSNewCustomerModal(modal);
    });

    modal.querySelector("#enterprise-orders-pos-submit")?.addEventListener("click", () => {
        submitNewSalePOS(modal);
    });
}

function renderPOSCustomerResults(modal, search = "") {

    const container = modal.querySelector("#enterprise-orders-pos-customer-results");
    if (!container) return;

    const term = String(search || "").trim().toLowerCase();
    const results = newSaleState.customers.filter(customer => {
        if (!term) return true;
        return [customer?.name, customer?.phone, customer?.email]
            .map(value => String(value || "").toLowerCase())
            .some(value => value.includes(term));
    }).slice(0, 8);

    container.innerHTML = results.length
        ? results.map(customer => `
            <button type="button" class="enterprise-orders__pos-result" data-pos-customer-id="${escapeHTML(customer.id)}">
                <span><strong>${escapeHTML(customer.name || "Sin nombre")}</strong><small>${escapeHTML(customer.phone || customer.email || "Sin contacto")}</small></span>
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        `).join("")
        : `<div class="enterprise-orders__pos-empty">No se encontraron clientes.</div>`;

    container.querySelectorAll("[data-pos-customer-id]").forEach(button => {
        button.addEventListener("click", () => {
            const customer = newSaleState.customers.find(item => item.id === button.dataset.posCustomerId);
            if (!customer) return;
            newSaleState.selectedCustomer = customer;
            renderPOSSelectedCustomer(modal);
            container.innerHTML = "";
            const input = modal.querySelector("#enterprise-orders-pos-customer-search");
            if (input) input.value = "";
        });
    });
}

function renderPOSSelectedCustomer(modal) {

    const container = modal.querySelector("#enterprise-orders-pos-selected-customer");
    const customer = newSaleState.selectedCustomer;
    if (!container) return;

    container.innerHTML = customer
        ? `
            <div class="enterprise-orders__pos-selected">
                <div><strong>${escapeHTML(customer.name || "Cliente")}</strong><span>${escapeHTML(customer.phone || "Sin teléfono")}${customer.email ? ` · ${escapeHTML(customer.email)}` : ""}</span></div>
                <button type="button" id="enterprise-orders-pos-clear-customer" aria-label="Cambiar cliente"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `
        : "";

    container.querySelector("#enterprise-orders-pos-clear-customer")?.addEventListener("click", () => {
        newSaleState.selectedCustomer = null;
        renderPOSSelectedCustomer(modal);
        renderPOSCustomerResults(modal, "");
    });
}

function renderPOSProductResults(modal, search = "") {

    const container = modal.querySelector("#enterprise-orders-pos-product-results");
    if (!container) return;

    const term = String(search || "").trim().toLowerCase();
    const results = newSaleState.products.filter(product => {
        const variants = getPOSProductVariants(product);
        const haystack = [
            product?.name,
            product?.title,
            product?.sku,
            product?.categoryName,
            ...variants.map(item => `${item.colorName} ${item.sizeName} ${item.sku}`)
        ].join(" ").toLowerCase();
        return !term || haystack.includes(term);
    }).slice(0, 10);

    container.innerHTML = results.length
        ? results.map(product => `
            <button type="button" class="enterprise-orders__pos-result" data-pos-product-id="${escapeHTML(product.id)}">
                <span><strong>${escapeHTML(product.name || product.title || "Producto")}</strong><small>${getPOSProductVariants(product).length} variantes</small></span>
                <i class="fa-solid fa-plus"></i>
            </button>
        `).join("")
        : `<div class="enterprise-orders__pos-empty">No se encontraron productos.</div>`;

    container.querySelectorAll("[data-pos-product-id]").forEach(button => {
        button.addEventListener("click", () => {
            const product = newSaleState.products.find(item => item.id === button.dataset.posProductId);
            if (!product) return;
            newSaleState.selectedProduct = product;
            renderPOSProductConfig(modal);
        });
    });
}

function getPOSProductVariants(product) {

    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const rows = [];

    variants.forEach(variant => {
        if (Array.isArray(variant?.sizes)) {
            variant.sizes.forEach(size => {
                if (variant?.active === false || size?.active === false) return;
                rows.push({
                    id: `${variant.id || variant.name}-${size.id || size.name}`,
                    colorName: variant.name || "Sin color",
                    sizeName: size.name || "Única",
                    sku: size.sku || "",
                    price: Number(size.price || 0),
                    label: `${variant.name || "Sin color"} / ${size.name || "Única"}${size.sku ? ` · ${size.sku}` : ""}`
                });
            });
            return;
        }
        if (variant?.active === false) return;
        rows.push({
            id: variant.id || variant.sku || variant.name,
            colorName: variant.colorName || "",
            sizeName: variant.name || "Única",
            sku: variant.sku || "",
            price: Number(variant.price || 0),
            label: `${variant.colorName || ""}${variant.name ? ` / ${variant.name}` : ""}${variant.sku ? ` · ${variant.sku}` : ""}`
        });
    });

    return rows;
}

function renderPOSProductConfig(modal) {

    const container = modal.querySelector("#enterprise-orders-pos-product-config");
    const product = newSaleState.selectedProduct;
    if (!container) return;

    if (!product) {
        container.innerHTML = "";
        return;
    }

    const variants = getPOSProductVariants(product);

    container.innerHTML = `
        <div class="enterprise-orders__pos-product-config">
            <div><strong>${escapeHTML(product.name || product.title || "Producto")}</strong><span>Selecciona variante y cantidad</span></div>
            <div class="enterprise-orders__pos-product-config-grid">
                <select id="enterprise-orders-pos-variant">
                    <option value="">${variants.length ? "Seleccionar variante" : "Sin variante"}</option>
                    ${variants.map(variant => `<option value="${escapeHTML(variant.id)}">${escapeHTML(variant.label)} · Q${variant.price.toFixed(2)}</option>`).join("")}
                </select>
                <input type="number" id="enterprise-orders-pos-quantity" min="1" step="1" value="1">
                <button type="button" class="enterprise-orders__pos-add-product" id="enterprise-orders-pos-add-product"><i class="fa-solid fa-plus"></i> Agregar</button>
            </div>
        </div>
    `;

    container.querySelector("#enterprise-orders-pos-add-product")?.addEventListener("click", () => {

        const variantId = container.querySelector("#enterprise-orders-pos-variant")?.value || "";
        const quantity = Math.max(1, parseInt(container.querySelector("#enterprise-orders-pos-quantity")?.value, 10) || 1);
        const variant = variants.find(item => item.id === variantId);

        if (variants.length && !variant) {
            window.alert("Selecciona una variante.");
            return;
        }

        const price = Number(variant?.price ?? product?.price ?? 0);
        if (!Number.isFinite(price) || price < 0) {
            window.alert("El producto no tiene un precio válido.");
            return;
        }

        const item = {
            productId: product.id,
            productName: product.name || product.title || "Producto",
            variantId: variant?.id || null,
            variantName: variant?.label || null,
            colorName: variant?.colorName || null,
            sizeName: variant?.sizeName || null,
            sku: variant?.sku || product?.sku || null,
            price,
            quantity,
            lineTotal: price * quantity
        };

        const existing = newSaleState.cart.find(itemInCart => itemInCart.productId === item.productId && itemInCart.variantId === item.variantId);
        if (existing) {
            existing.quantity += quantity;
            existing.lineTotal = existing.price * existing.quantity;
        } else {
            newSaleState.cart.push(item);
        }

        newSaleState.selectedProduct = null;
        container.innerHTML = "";
        modal.querySelector("#enterprise-orders-pos-product-search").value = "";
        modal.querySelector("#enterprise-orders-pos-product-results").innerHTML = "";
        renderNewSalePOSCart(modal);
    });
}

function renderNewSalePOSCart(modal) {

    const container = modal.querySelector("#enterprise-orders-pos-cart");
    if (!container) return;

    container.innerHTML = newSaleState.cart.length
        ? `<div class="enterprise-orders__pos-cart-list">${newSaleState.cart.map((item, index) => `
            <article class="enterprise-orders__pos-cart-item">
                <div><strong>${escapeHTML(item.productName)}</strong><span>${item.variantName ? escapeHTML(item.variantName) : ""}${item.sku ? ` · ${escapeHTML(item.sku)}` : ""}</span></div>
                <div class="enterprise-orders__pos-cart-controls">
                    <input type="number" min="1" value="${item.quantity}" data-pos-cart-quantity="${index}">
                    <strong>Q${Number(item.lineTotal).toFixed(2)}</strong>
                    <button type="button" data-pos-cart-remove="${index}" aria-label="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </article>
        `).join("")}</div>`
        : `<div class="enterprise-orders__pos-cart-empty">Agrega productos para construir el pedido.</div>`;

    container.querySelectorAll("[data-pos-cart-quantity]").forEach(input => input.addEventListener("change", () => {
        const index = Number(input.dataset.posCartQuantity);
        const quantity = Math.max(1, parseInt(input.value, 10) || 1);
        newSaleState.cart[index].quantity = quantity;
        newSaleState.cart[index].lineTotal = newSaleState.cart[index].price * quantity;
        renderNewSalePOSCart(modal);
    }));

    container.querySelectorAll("[data-pos-cart-remove]").forEach(button => button.addEventListener("click", () => {
        newSaleState.cart.splice(Number(button.dataset.posCartRemove), 1);
        renderNewSalePOSCart(modal);
    }));

    renderNewSalePOSSummary(modal);
}

function renderNewSalePOSSummary(modal) {

    const subtotal = newSaleState.cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    const shipping = Math.max(0, Number(newSaleState.shipping || 0));
    const discount = Math.min(subtotal + shipping, Math.max(0, Number(newSaleState.discount || 0)));
    const total = Math.max(0, subtotal + shipping - discount);

    const items = modal.querySelector("#enterprise-orders-pos-summary-items");
    if (items) {
        items.innerHTML = newSaleState.cart.length
            ? newSaleState.cart.map(item => `<div class="enterprise-orders__pos-summary-item"><span>${escapeHTML(item.productName)} × ${item.quantity}</span><strong>Q${Number(item.lineTotal).toFixed(2)}</strong></div>`).join("")
            : `<div class="enterprise-orders__pos-summary-empty">Sin productos</div>`;
    }

    const values = {
        "enterprise-orders-pos-summary-subtotal": subtotal,
        "enterprise-orders-pos-summary-shipping": shipping,
        "enterprise-orders-pos-summary-discount": discount,
        "enterprise-orders-pos-summary-total": total
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = modal.querySelector(`#${id}`);
        if (element) element.textContent = `Q${value.toFixed(2)}`;
    });
}

async function submitNewSalePOS(modal) {

    const submitButton = modal.querySelector("#enterprise-orders-pos-submit");

    if (!newSaleState.selectedCustomer) {
        window.alert("Selecciona un cliente antes de crear el pedido.");
        return;
    }

    if (!newSaleState.cart.length) {
        window.alert("Agrega al menos un producto.");
        return;
    }

    const subtotal = newSaleState.cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    const shipping = Math.max(0, Number(newSaleState.shipping || 0));
    const discount = Math.min(subtotal + shipping, Math.max(0, Number(newSaleState.discount || 0)));
    const total = Math.max(0, subtotal + shipping - discount);

    if (!Number.isFinite(total) || total <= 0) {
        window.alert("El total del pedido debe ser mayor a Q0.00.");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creando pedido...`;

    try {

        const orderId = await createOrder({
            customer: newSaleState.selectedCustomer,
            items: newSaleState.cart,
            subtotal,
            shipping,
            discount,
            total,
            orderStatus: "confirmed",
            paymentStatus: newSaleState.paymentStatus,
            paymentMethod: newSaleState.paymentMethod,
            productionStatus: newSaleState.requiresProduction ? "pending" : "not_required",
            requiresProduction: newSaleState.requiresProduction,
            salesChannel: newSaleState.salesChannel
        });

        closeNewSalePOS();
        await loadOrders();
        renderOrders();

    } catch (error) {
        console.error("Error creando pedido desde POS:", error);
        submitButton.disabled = false;
        submitButton.innerHTML = `<i class="fa-solid fa-check"></i> Crear pedido`;
        window.alert(error?.message || "No fue posible crear el pedido.");
    }
}

async function openPOSNewCustomerModal(parentModal) {

    const modal = document.createElement("div");
    modal.className = "enterprise-orders__pos-customer-modal";
    modal.innerHTML = `
        <div class="enterprise-orders__pos-customer-backdrop" data-pos-customer-close="true"></div>
        <section class="enterprise-orders__pos-customer-dialog" role="dialog" aria-modal="true">
            <header class="enterprise-orders__pos-customer-header">
                <div><span>Nuevo cliente</span><h3>Registrar cliente</h3></div>
                <button type="button" id="enterprise-orders-pos-customer-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </header>
            <div class="enterprise-orders__pos-customer-form">
                <div class="enterprise-orders__pos-field"><label>Nombre *</label><input type="text" id="enterprise-orders-pos-customer-name"></div>
                <div class="enterprise-orders__pos-field"><label>Teléfono *</label><input type="tel" id="enterprise-orders-pos-customer-phone"></div>
                <div class="enterprise-orders__pos-field"><label>Correo</label><input type="email" id="enterprise-orders-pos-customer-email"></div>
                <div class="enterprise-orders__pos-field"><label>Dirección</label><input type="text" id="enterprise-orders-pos-customer-address"></div>
            </div>
            <div class="enterprise-orders__pos-customer-actions">
                <button type="button" class="enterprise-orders__pos-cancel" id="enterprise-orders-pos-customer-cancel">Cancelar</button>
                <button type="button" class="enterprise-orders__pos-submit" id="enterprise-orders-pos-customer-save">Crear cliente</button>
            </div>
        </section>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("is-open"));

    const close = () => modal.remove();
    modal.querySelector("#enterprise-orders-pos-customer-close")?.addEventListener("click", close);
    modal.querySelector("#enterprise-orders-pos-customer-cancel")?.addEventListener("click", close);
    modal.addEventListener("click", event => {
        if (event.target.dataset.posCustomerClose === "true") close();
    });

    modal.querySelector("#enterprise-orders-pos-customer-save")?.addEventListener("click", async () => {

        const saveButton = modal.querySelector("#enterprise-orders-pos-customer-save");
        const name = modal.querySelector("#enterprise-orders-pos-customer-name")?.value.trim();
        const phone = modal.querySelector("#enterprise-orders-pos-customer-phone")?.value.trim();
        const email = modal.querySelector("#enterprise-orders-pos-customer-email")?.value.trim();
        const addressLine = modal.querySelector("#enterprise-orders-pos-customer-address")?.value.trim();

        if (!name || !phone) {
            window.alert("Nombre y teléfono son obligatorios.");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Creando...";

        try {
            const customerId = await createCustomer({
                name,
                phone,
                email,
                address: {
                    line1: addressLine,
                    line2: "",
                    city: "",
                    department: "",
                    country: "Guatemala",
                    postalCode: ""
                },
                acquisitionSource: newSaleState.salesChannel
            });

            const createdCustomer = {
                id: customerId,
                name,
                phone,
                email,
                address: {
                    line1: addressLine,
                    country: "Guatemala"
                },
                active: true,
                acquisitionSource: newSaleState.salesChannel
            };

            newSaleState.customers.push(createdCustomer);
            newSaleState.selectedCustomer = createdCustomer;
            renderPOSSelectedCustomer(parentModal);
            close();

        } catch (error) {
            console.error("Error creando cliente desde POS:", error);
            saveButton.disabled = false;
            saveButton.textContent = "Crear cliente";
            window.alert(error?.message || "No fue posible crear el cliente.");
        }
    });
}

function closeNewSalePOS() {
    const modal = document.querySelector("#enterprise-orders-new-sale-pos");
    if (!modal) return;
    modal.classList.remove("is-open");
    window.setTimeout(() => modal.remove(), 160);
}

function focusPOSCustomerSearch(modal) {
    window.setTimeout(() => {
        modal.querySelector("#enterprise-orders-pos-customer-search")?.focus();
    }, 50);
}

function escapeAttribute(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

// ========================================
// REFUND AUTHORIZATION MODAL
// ========================================

function closeRefundAuthorizationModal() {

    const modal =
        document.querySelector(
            "#enterprise-orders-refund-authorization-modal"
        );

    if (!modal) {
        return;
    }

    modal.remove();

}

function openRefundAuthorizationModal(
    order
) {

    closeRefundAuthorizationModal();

    const orderNumber =
        order.orderNumber ||
        "—";

    const total =
        getOrderTotal(order).toFixed(2);

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "enterprise-orders-refund-authorization-modal";

    modal.className =
        "enterprise-orders__sale-modal";

    modal.innerHTML = `

        <div
            class="enterprise-orders__sale-modal-backdrop"
            data-refund-modal-close="true"
        ></div>

        <section
            class="enterprise-orders__sale-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enterprise-orders-refund-modal-title"
        >

            <div
                class="enterprise-orders__sale-modal-icon"
                aria-hidden="true"
            >
                <i class="fa-solid fa-shield-halved"></i>
            </div>

            <div
                class="enterprise-orders__sale-modal-content"
            >

                <h2
                    id="enterprise-orders-refund-modal-title"
                >
                    Autorizar reembolso
                </h2>

                <p>
                    El pedido
                    <strong>#${escapeHTML(orderNumber)}</strong>
                    está cancelado y el pago está marcado como reembolsado.
                </p>

                <p>
                    Se actualizará el registro histórico de la venta
                    por <strong>Q${total}</strong>.
                </p>

                <p
                    class="enterprise-orders__sale-modal-warning"
                >
                    Esta operación requiere credenciales de un usuario
                    con rol ADMIN. La venta no será eliminada.
                </p>

                <div
                    style="display:grid;gap:10px;margin-top:16px;"
                >

                    <label
                        for="enterprise-orders-refund-admin-email"
                    >
                        Correo del administrador
                    </label>

                    <input
                        id="enterprise-orders-refund-admin-email"
                        type="email"
                        autocomplete="username"
                        placeholder="Correo del administrador"
                    />

                    <label
                        for="enterprise-orders-refund-admin-password"
                    >
                        Contraseña de administrador
                    </label>

                    <input
                        id="enterprise-orders-refund-admin-password"
                        type="password"
                        autocomplete="current-password"
                        placeholder="Contraseña"
                    />

                    <label
                        for="enterprise-orders-refund-reason"
                    >
                        Motivo
                    </label>

                    <textarea
                        id="enterprise-orders-refund-reason"
                        rows="3"
                        maxlength="300"
                    >Pedido cancelado y pago reembolsado</textarea>

                </div>

            </div>

            <div
                class="enterprise-orders__sale-modal-actions"
            >

                <button
                    type="button"
                    class="enterprise-orders__sale-modal-cancel"
                    id="enterprise-orders-refund-modal-cancel"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    class="enterprise-orders__sale-modal-confirm"
                    id="enterprise-orders-refund-modal-confirm"
                >
                    Autorizar reembolso
                </button>

            </div>

        </section>

    `;

    document.body.appendChild(
        modal
    );

    requestAnimationFrame(
        () => {
            modal.classList.add(
                "is-open"
            );
        }
    );

    const emailInput =
        modal.querySelector(
            "#enterprise-orders-refund-admin-email"
        );

    const passwordInput =
        modal.querySelector(
            "#enterprise-orders-refund-admin-password"
        );

    const reasonInput =
        modal.querySelector(
            "#enterprise-orders-refund-reason"
        );

    const cancelButton =
        modal.querySelector(
            "#enterprise-orders-refund-modal-cancel"
        );

    const confirmButton =
        modal.querySelector(
            "#enterprise-orders-refund-modal-confirm"
        );

    const close =
        () => {
            closeRefundAuthorizationModal();
        };

    cancelButton?.addEventListener(
        "click",
        close
    );

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.dataset.refundModalClose ===
                "true"
            ) {
                close();
            }

        }
    );

    confirmButton?.addEventListener(
        "click",
        async () => {

            if (confirmButton.disabled) {
                return;
            }

            const adminEmail =
                emailInput?.value.trim();

            const adminPassword =
                passwordInput?.value || "";

            const reason =
                reasonInput?.value.trim() ||
                "Pedido cancelado y pago reembolsado";

            if (!adminEmail || !adminPassword) {

                window.alert(
                    "Ingresa el correo y la contraseña del administrador."
                );

                return;
            }

            confirmButton.disabled = true;
            confirmButton.textContent =
                "Autorizando...";

            try {

                const result =
                    await refundSaleFromOrder(
                        order.id,
                        adminEmail,
                        adminPassword,
                        reason
                    );


                close();

                await renderOrders();

            } catch (error) {

                console.error(
                    "Error al procesar el reembolso:",
                    error
                );

                confirmButton.disabled = false;
                confirmButton.textContent =
                    "Autorizar reembolso";

                window.alert(
                    error?.message ||
                    "No fue posible autorizar el reembolso."
                );

            }

        }
    );

    const handleEscape =
        event => {

            if (
                event.key === "Escape"
            ) {

                close();

                document.removeEventListener(
                    "keydown",
                    handleEscape
                );

            }

        };

    document.addEventListener(
        "keydown",
        handleEscape
    );

}
