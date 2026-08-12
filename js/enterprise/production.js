import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getProductionOrders,
    getOrder,
    updateProductionStatus
} from "../firebase/firestore.js";


// ========================================
// STATE
// ========================================

let productionOrdersState = [];


// ========================================
// PRODUCTION VIEW
// ========================================

export async function EnterpriseProduction(
    profile
) {

    let productionOrders = [];


    // ========================================
    // LOAD PRODUCTION ORDERS
    // ========================================

    try {

        productionOrders =
            await getProductionOrders();

        productionOrdersState =
            productionOrders;

        console.log(
            "Producción cargada:",
            productionOrders
        );

    } catch (error) {

        console.error(
            "Error cargando producción:",
            error
        );

    }


    // ========================================
    // STATS
    // ========================================

    const pendingCount =
        productionOrders.filter(
            order =>
                order.status === "pending"
        ).length;


    const inProductionCount =
        productionOrders.filter(
            order =>
                order.status === "in_production"
        ).length;


    const readyCount =
        productionOrders.filter(
            order =>
                order.status === "ready"
        ).length;


    const totalCount =
        productionOrders.length;


    // ========================================
    // CONTENT
    // ========================================

    const content = `

        <section
            class="enterprise-production"
            id="enterprise-production"
        >

            <div
                class="enterprise-production__header"
            >

                <div>

                    <h1>
                        Producción
                    </h1>

                    <p>
                        Gestión de órdenes de producción.
                    </p>

                </div>

            </div>


            <!-- ========================================
                 LIST VIEW
            ======================================== -->

            <div
                id="enterprise-production-list-view"
            >

                <div
                    class="enterprise-production__stats"
                >

                    <button
                        type="button"
                        class="
                            enterprise-production__stat
                            enterprise-production__stat--all
                            is-active
                        "
                        data-production-filter="all"
                    >

                        <span>
                            Todas
                        </span>

                        <strong>
                            ${totalCount}
                        </strong>

                    </button>


                    <button
                        type="button"
                        class="
                            enterprise-production__stat
                            enterprise-production__stat--pending
                        "
                        data-production-filter="pending"
                    >

                        <span>
                            Pendientes
                        </span>

                        <strong>
                            ${pendingCount}
                        </strong>

                    </button>


                    <button
                        type="button"
                        class="
                            enterprise-production__stat
                            enterprise-production__stat--processing
                        "
                        data-production-filter="in_production"
                    >

                        <span>
                            En producción
                        </span>

                        <strong>
                            ${inProductionCount}
                        </strong>

                    </button>


                    <button
                        type="button"
                        class="
                            enterprise-production__stat
                            enterprise-production__stat--ready
                        "
                        data-production-filter="ready"
                    >

                        <span>
                            Listos
                        </span>

                        <strong>
                            ${readyCount}
                        </strong>

                    </button>

                </div>


                <section
                    class="
                        enterprise-production__orders
                    "
                >

                    <div
                        class="
                            enterprise-production__section-header
                        "
                    >

                        <div>

                            <h2
                                id="enterprise-production-title"
                            >
                                Órdenes de producción
                            </h2>

                            <span
                                id="enterprise-production-subtitle"
                            >
                                Todas · ${totalCount} ${
                                    totalCount === 1
                                        ? "orden"
                                        : "órdenes"
                                }
                            </span>

                        </div>

                    </div>


                    <div
                        id="enterprise-production-list"
                        class="
                            enterprise-production__list
                        "
                    >
                    </div>

                </section>

            </div>


            <!-- ========================================
                 DETAIL VIEW
            ======================================== -->

            <div
                id="enterprise-production-detail"
                class="
                    enterprise-production__detail
                    is-hidden
                "
            >
            </div>

        </section>

    `;


    return EnterpriseLayout(
        content,
        profile
    );

}


// ========================================
// INIT PRODUCTION
// ========================================

export function initEnterpriseProduction(
    profile
) {

    const filterButtons =
        document.querySelectorAll(
            "[data-production-filter]"
        );


    const list =
        document.querySelector(
            "#enterprise-production-list"
        );


    const subtitle =
        document.querySelector(
            "#enterprise-production-subtitle"
        );


    const listView =
        document.querySelector(
            "#enterprise-production-list-view"
        );


    const detailView =
        document.querySelector(
            "#enterprise-production-detail"
        );


    if (
        !list ||
        !subtitle ||
        !listView ||
        !detailView
    ) {

        return;

    }


    // ========================================
    // CURRENT FILTER
    // ========================================

    let currentFilter = "all";


    // ========================================
    // INITIAL RENDER
    // ========================================

    renderFilteredProductionOrders(
        currentFilter,
        list,
        subtitle
    );


    // ========================================
    // FILTERS
    // ========================================

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilter =
                        button.dataset.productionFilter;


                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "is-active"
                            );

                        }
                    );


                    button.classList.add(
                        "is-active"
                    );


                    renderFilteredProductionOrders(
                        currentFilter,
                        list,
                        subtitle
                    );

                }
            );

        }
    );


    // ========================================
    // ORDER CLICK
    // ========================================

    list.addEventListener(
        "click",
        async event => {

            const orderCard =
                event.target.closest(
                    "[data-production-id]"
                );


            if (!orderCard) {

                return;

            }


            const productionId =
                orderCard.dataset.productionId;


            const productionOrder =
                productionOrdersState.find(
                    order =>
                        order.id === productionId
                );


            if (!productionOrder) {

                console.error(
                    "No se encontró la orden de producción:",
                    productionId
                );

                return;

            }


            await showProductionDetail(
                productionOrder,
                profile,
                listView,
                detailView
            );

        }
    );


    // ========================================
    // DETAIL CHANGE
    // ========================================

    detailView.addEventListener(
        "change",
        async event => {

            const statusSelect =
                event.target.closest(
                    "[data-production-status]"
                );


            if (!statusSelect) {

                return;

            }


            const productionId =
                detailView.dataset.productionId;


            if (!productionId) {

                console.error(
                    "No se encontró el ID de producción."
                );

                return;

            }


            const newStatus =
                statusSelect.value;


            const productionOrder =
                productionOrdersState.find(
                    order =>
                        order.id === productionId
                );


            if (!productionOrder) {

                console.error(
                    "No se encontró la orden:",
                    productionId
                );

                return;

            }


            const previousStatus =
                productionOrder.status;


            try {

                statusSelect.disabled = true;


                // ========================================
                // FIRESTORE WRITE
                // ========================================

               await updateProductionStatus(
    productionOrder.orderId,
    newStatus
);


                // ========================================
                // UPDATE LOCAL STATE
                // ========================================

                productionOrder.status =
                    newStatus;


                // ========================================
                // UPDATE BADGE
                // ========================================

                const statusBadge =
                    detailView.querySelector(
                        ".enterprise-production__order-status--detail"
                    );


                if (statusBadge) {

                    statusBadge.textContent =
                        getProductionStatusLabel(
                            newStatus
                        );

                    statusBadge.className =
                        `
                            enterprise-production__order-status
                            enterprise-production__order-status--detail
                            enterprise-production__order-status--${newStatus}
                        `;

                }


                // ========================================
                // UPDATE SELECT VISUAL STATE
                // ========================================

                statusSelect.className =
                    `enterprise-production__status-select enterprise-production__status-select--${newStatus}`;


                // ========================================
                // UPDATE COUNTERS
                // ========================================

                updateProductionCounters();


                console.log(
                    "✓ Estado de producción actualizado:",
                    {
                        id: productionId,
                        previousStatus,
                        newStatus
                    }
                );


            } catch (error) {

                console.error(
                    "Error actualizando estado de producción:",
                    error
                );


                // ========================================
                // RESTORE SELECT
                // ========================================

                statusSelect.value =
                    previousStatus;

                statusSelect.className =
                    `enterprise-production__status-select enterprise-production__status-select--${previousStatus}`;

            } finally {

                statusSelect.disabled =
                    false;

            }

        }
    );


    // ========================================
    // BACK BUTTON
    // ========================================

    detailView.addEventListener(
        "click",
        event => {

            const backButton =
                event.target.closest(
                    "[data-production-back]"
                );


            if (!backButton) {

                return;

            }


            detailView.classList.add(
                "is-hidden"
            );


            listView.classList.remove(
                "is-hidden"
            );


            // ========================================
            // RE-RENDER CURRENT FILTER
            // ========================================

            renderFilteredProductionOrders(
                currentFilter,
                list,
                subtitle
            );

        }
    );

}


// ========================================
// FILTERED ORDERS
// ========================================

function renderFilteredProductionOrders(
    filter,
    list,
    subtitle
) {

    let filteredOrders;


    if (
        filter === "all"
    ) {

        filteredOrders =
            productionOrdersState;

    } else {

        filteredOrders =
            productionOrdersState.filter(
                order =>
                    order.status === filter
            );

    }


    // ========================================
    // RENDER
    // ========================================

    renderProductionOrders(
        filteredOrders,
        list
    );


    // ========================================
    // SUBTITLE
    // ========================================

    const label =
        getProductionFilterLabel(
            filter
        );


    subtitle.textContent =
        `${label} · ${filteredOrders.length} ${
            filteredOrders.length === 1
                ? "orden"
                : "órdenes"
        }`;

}


// ========================================
// RENDER ORDERS
// ========================================

function renderProductionOrders(
    productionOrders,
    container
) {

    if (
        productionOrders.length === 0
    ) {

        container.innerHTML = `

            <div
                class="
                    enterprise-production__empty
                "
            >

                <strong>
                    No hay órdenes
                </strong>

                <span>
                    No existen órdenes dentro de este estado.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        productionOrders
            .map(
                order =>
                    createProductionOrderCard(
                        order
                    )
            )
            .join("");

}


// ========================================
// ORDER CARD
// ========================================

function createProductionOrderCard(
    order
) {

    const statusLabel =
        getProductionStatusLabel(
            order.status
        );


    return `

        <article
            class="
                enterprise-production__order
                enterprise-production__order--${order.status}
            "
            data-production-id="${order.id}"
            tabindex="0"
            role="button"
        >

            <div
                class="
                    enterprise-production__order-top
                "
            >

                <span
                    class="
                        enterprise-production__order-number
                    "
                >
                    #${order.productionNumber}
                </span>


                <span
                    class="
                        enterprise-production__order-status
                    "
                >
                    ${statusLabel}
                </span>

            </div>


            <div
                class="
                    enterprise-production__order-main
                "
            >

                <h3>
                    ${order.productName || "Producto"}
                </h3>


                <span
                    class="
                        enterprise-production__order-variant
                    "
                >
                    ${
                        order.variantName ||
                        "Sin variante"
                    }
                </span>

            </div>


            <div
                class="
                    enterprise-production__order-meta
                "
            >

                <span>
                    SKU:
                    ${order.sku || "—"}
                </span>


                <span>
                    Cantidad:
                    ${order.quantity || 0}
                </span>

            </div>

        </article>

    `;

}


// ========================================
// DETAIL
// ========================================

async function showProductionDetail(
    productionOrder,
    profile,
    listView,
    detailView
) {

    const isAdmin =
        profile?.role === "admin";


    let relatedOrder = null;


    // ========================================
    // RELATED ORDER
    // ADMIN ONLY
    // ========================================

    if (
        isAdmin &&
        productionOrder.orderId
    ) {

        try {

            relatedOrder =
                await getOrder(
                    productionOrder.orderId
                );

        } catch (error) {

            console.error(
                "Error cargando pedido relacionado:",
                error
            );

        }

    }


    // ========================================
    // STATUS
    // ========================================

    const statusLabel =
        getProductionStatusLabel(
            productionOrder.status
        );


    // ========================================
    // STATUS OPTIONS
    // ========================================

    const statusOptions = `

        <option
            value="pending"
            ${
                productionOrder.status === "pending"
                    ? "selected"
                    : ""
            }
        >
            Pendiente
        </option>


        <option
            value="in_production"
            ${
                productionOrder.status === "in_production"
                    ? "selected"
                    : ""
            }
        >
            En producción
        </option>


        <option
            value="ready"
            ${
                productionOrder.status === "ready"
                    ? "selected"
                    : ""
            }
        >
            Listo
        </option>

    `;


    // ========================================
    // ADMIN INFORMATION
    // ========================================

    const relatedOrderHTML =
        isAdmin
            ? `

                <div
                    class="
                        enterprise-production__detail-divider
                    "
                ></div>


                <div
                    class="
                        enterprise-production__detail-order
                    "
                >

                    <span>
                        Pedido relacionado
                    </span>


                    <strong>
                        ${
                            relatedOrder?.orderNumber
                                ? `#${relatedOrder.orderNumber}`
                                : productionOrder.orderId
                                    ? productionOrder.orderId
                                    : "Sin pedido relacionado"
                        }
                    </strong>

                </div>

            `
            : "";


    const costsHTML =
        isAdmin
            ? `

                <div
                    class="
                        enterprise-production__detail-costs
                    "
                >

                    <div>

                        <span>
                            Costo unitario
                        </span>

                        <strong>
                            Q${
                                Number(
                                    productionOrder.unitCost || 0
                                ).toFixed(2)
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Costo total
                        </span>

                        <strong>
                            Q${
                                Number(
                                    productionOrder.totalCost || 0
                                ).toFixed(2)
                            }
                        </strong>

                    </div>

                </div>

            `
            : "";


    // ========================================
    // DETAIL
    // ========================================

    detailView.innerHTML = `

        <div
            class="
                enterprise-production__detail-header
            "
        >

            <button
                type="button"
                class="
                    enterprise-production__back
                "
                data-production-back
            >

                <i
                    class="fa-solid fa-arrow-left"
                ></i>

                Volver a producción

            </button>

        </div>


        <section
            class="
                enterprise-production__detail-card
            "
        >

            <div
                class="
                    enterprise-production__detail-top
                "
            >

                <div>

                    <span
                        class="
                            enterprise-production__detail-number
                        "
                    >
                        Producción #${
                            productionOrder.productionNumber
                        }
                    </span>


                    <h2>
                        ${
                            productionOrder.productName ||
                            "Producto"
                        }
                    </h2>

                </div>


                <span
                    class="
                        enterprise-production__order-status
                        enterprise-production__order-status--detail
                        enterprise-production__order-status--${productionOrder.status}
                    "
                >
                    ${statusLabel}
                </span>

            </div>


            <!-- ========================================
                 STATUS CONTROL
            ======================================== -->

            <div
                class="
                    enterprise-production__detail-status
                "
            >

                <span>
                    Estado
                </span>


                <select
                    id="enterprise-production-status"
                    class="enterprise-production__status-select enterprise-production__status-select--${productionOrder.status}"
                    data-production-status
                >

                    ${statusOptions}

                </select>

            </div>


            <!-- ========================================
                 INFORMATION
            ======================================== -->

            <div
                class="
                    enterprise-production__detail-grid
                "
            >

                <div
                    class="
                        enterprise-production__detail-item
                    "
                >

                    <span>
                        Variante
                    </span>

                    <strong>
                        ${
                            productionOrder.variantName ||
                            "Sin variante"
                        }
                    </strong>

                </div>


                <div
                    class="
                        enterprise-production__detail-item
                    "
                >

                    <span>
                        SKU
                    </span>

                    <strong>
                        ${
                            productionOrder.sku ||
                            "—"
                        }
                    </strong>

                </div>


                <div
                    class="
                        enterprise-production__detail-item
                    "
                >

                    <span>
                        Cantidad
                    </span>

                    <strong>
                        ${
                            productionOrder.quantity ||
                            0
                        }
                    </strong>

                </div>


                <div
                    class="
                        enterprise-production__detail-item
                    "
                >

                    <span>
                        Proveedor
                    </span>

                    <strong>
                        ${
                            productionOrder.supplierId ||
                            "Sin proveedor"
                        }
                    </strong>

                </div>

            </div>


            ${relatedOrderHTML}


            ${costsHTML}


            <div
                class="
                    enterprise-production__detail-notes
                "
            >

                <span>
                    Notas
                </span>


                <p>
                    ${
                        productionOrder.notes ||
                        "Sin notas."
                    }
                </p>

            </div>

        </section>

    `;


    // ========================================
    // STORE CURRENT PRODUCTION ID
    // ========================================

    detailView.dataset.productionId =
        productionOrder.id;


    // ========================================
    // SHOW DETAIL
    // ========================================

    listView.classList.add(
        "is-hidden"
    );


    detailView.classList.remove(
        "is-hidden"
    );

}


// ========================================
// UPDATE COUNTERS
// ========================================

function updateProductionCounters() {

    const pendingCount =
        productionOrdersState.filter(
            order =>
                order.status === "pending"
        ).length;


    const inProductionCount =
        productionOrdersState.filter(
            order =>
                order.status === "in_production"
        ).length;


    const readyCount =
        productionOrdersState.filter(
            order =>
                order.status === "ready"
        ).length;


    const totalCount =
        productionOrdersState.length;


    const allCounter =
        document.querySelector(
            '[data-production-filter="all"] strong'
        );


    const pendingCounter =
        document.querySelector(
            '[data-production-filter="pending"] strong'
        );


    const inProductionCounter =
        document.querySelector(
            '[data-production-filter="in_production"] strong'
        );


    const readyCounter =
        document.querySelector(
            '[data-production-filter="ready"] strong'
        );


    if (allCounter) {

        allCounter.textContent =
            totalCount;

    }


    if (pendingCounter) {

        pendingCounter.textContent =
            pendingCount;

    }


    if (inProductionCounter) {

        inProductionCounter.textContent =
            inProductionCount;

    }


    if (readyCounter) {

        readyCounter.textContent =
            readyCount;

    }

}


// ========================================
// STATUS LABEL
// ========================================

function getProductionStatusLabel(
    status
) {

    const labels = {

        pending:
            "Pendiente",

        in_production:
            "En producción",

        ready:
            "Listo"

    };


    return (
        labels[status] ||
        "Desconocido"
    );

}


// ========================================
// FILTER LABEL
// ========================================

function getProductionFilterLabel(
    filter
) {

    const labels = {

        all:
            "Todas",

        pending:
            "Pendientes",

        in_production:
            "En producción",

        ready:
            "Listos"

    };


    return (
        labels[filter] ||
        "Todas"
    );

}