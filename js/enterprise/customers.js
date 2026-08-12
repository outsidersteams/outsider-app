// ========================================
// OUTSIDER — ENTERPRISE CUSTOMERS
// ADMIN ONLY
// ========================================

import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    getOrders
} from "../firebase/firestore.js";


// ========================================
// STATE
// ========================================

let customers = [];
let orders = [];
let filteredCustomers = [];


// ========================================
// VIEW
// ========================================

export function EnterpriseCustomers(
    profile
) {

    if (
        profile?.role !== "admin"
    ) {

        return EnterpriseLayout(
            `
                <section
                    class="enterprise-customers enterprise-customers--forbidden"
                >

                    <div
                        class="enterprise-customers__forbidden-card"
                    >

                        <i
                            class="fa-solid fa-lock"
                        ></i>

                        <span>
                            Acceso restringido
                        </span>

                        <h1>
                            Clientes
                        </h1>

                        <p>
                            La información de clientes está
                            reservada para administradores.
                        </p>

                    </div>

                </section>
            `,
            profile
        );

    }


    return EnterpriseLayout(
        `
            <section
                class="enterprise-customers"
            >

                <div
                    class="enterprise-customers__header"
                >

                    <div>

                        <span
                            class="enterprise-customers__eyebrow"
                        >
                            Enterprise · Admin
                        </span>

                        <h1
                            class="enterprise-customers__title"
                        >
                            Clientes
                        </h1>

                        <p
                            class="enterprise-customers__description"
                        >
                            Gestiona los clientes registrados
                            y el historial comercial de Outsider.
                        </p>

                    </div>

                    <button
                        type="button"
                        class="enterprise-customers__add-button"
                        id="enterprise-customers-add"
                    >
                        <i class="fa-solid fa-plus"></i>
                        Nuevo cliente
                    </button>

                </div>


                <div
                    class="enterprise-customers__summary"
                >

                    <div
                        class="enterprise-customers__summary-card"
                    >

                        <span>
                            Clientes
                        </span>

                        <strong
                            id="enterprise-customers-count"
                        >
                            0
                        </strong>

                    </div>

                    <div
                        class="enterprise-customers__summary-card"
                    >

                        <span>
                            Activos
                        </span>

                        <strong
                            id="enterprise-customers-active"
                        >
                            0
                        </strong>

                    </div>

                    <div
                        class="enterprise-customers__summary-card"
                    >

                        <span>
                            Con compras
                        </span>

                        <strong
                            id="enterprise-customers-buyers"
                        >
                            0
                        </strong>

                    </div>

                </div>


                <div
                    class="enterprise-customers__toolbar"
                >

                    <div
                        class="enterprise-customers__search"
                    >

                        <i
                            class="fa-solid fa-magnifying-glass"
                        ></i>

                        <input
                            type="search"
                            id="enterprise-customers-search"
                            placeholder="Buscar por nombre, teléfono o correo..."
                            autocomplete="off"
                        />

                    </div>

                </div>


                <section
                    class="enterprise-customers__results"
                    id="enterprise-customers-results"
                >

                    <div
                        class="enterprise-customers__loading"
                    >
                        <i
                            class="fa-solid fa-spinner fa-spin"
                        ></i>

                        <span>
                            Cargando clientes...
                        </span>
                    </div>

                </section>

            </section>
        `,
        profile
    );

}


// ========================================
// INIT
// ========================================

export async function initEnterpriseCustomers(
    profile
) {

    if (
        profile?.role !== "admin"
    ) {

        return;

    }

    await loadCustomers();

    initCustomerSearch();

    initNewCustomerButton();

    renderCustomerSummary();

    renderCustomers();

}


// ========================================
// LOAD
// ========================================

async function loadCustomers() {

    const results =
        document.querySelector(
            "#enterprise-customers-results"
        );

    try {

        const [
            customerData,
            orderData
        ] = await Promise.all([
            getCustomers(),
            getOrders()
        ]);

        customers =
            Array.isArray(
                customerData
            )
                ? customerData
                : [];

        orders =
            Array.isArray(
                orderData
            )
                ? orderData
                : [];

        filteredCustomers =
            [...customers];

        console.log(
            "✓ Clientes cargados:",
            customers
        );

        console.log(
            "✓ Pedidos cargados para clientes:",
            orders
        );

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        if (results) {

            results.innerHTML = `
                <div
                    class="enterprise-customers__error"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    <h2>
                        No se pudieron cargar los clientes
                    </h2>

                    <p>
                        Ocurrió un error al consultar
                        la información de clientes.
                    </p>

                </div>
            `;

        }

    }

}

// ========================================
// SEARCH
// ========================================

function initCustomerSearch() {

    const input =
        document.querySelector(
            "#enterprise-customers-search"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        () => {

            const search =
                input.value
                    .trim()
                    .toLowerCase();

            filteredCustomers =
                customers.filter(
                    customer => {

                        const name =
                            String(
                                customer?.name || ""
                            ).toLowerCase();

                        const email =
                            String(
                                customer?.email || ""
                            ).toLowerCase();

                        const phone =
                            String(
                                customer?.phone || ""
                            ).toLowerCase();

                        return (
                            !search ||
                            name.includes(search) ||
                            email.includes(search) ||
                            phone.includes(search)
                        );

                    }
                );

            renderCustomers();

        }
    );

}


// ========================================
// SUMMARY
// ========================================

function renderCustomerSummary() {

    const count =
        document.querySelector(
            "#enterprise-customers-count"
        );

    const active =
        document.querySelector(
            "#enterprise-customers-active"
        );

    const buyers =
        document.querySelector(
            "#enterprise-customers-buyers"
        );

    const customersWithOrders =
        new Set(
            orders
                .map(
                    order =>
                        order?.customerId
                )
                .filter(Boolean)
        );

    if (count) {
        count.textContent =
            customers.length;
    }

    if (active) {

        active.textContent =
            customers.filter(
                customer =>
                    customer?.active !== false
            ).length;

    }

    if (buyers) {

        buyers.textContent =
            customers.filter(
                customer =>
                    customersWithOrders.has(
                        customer?.id
                    )
            ).length;

    }

}


// ========================================
// RENDER LIST
// ========================================

function renderCustomers() {

    const results =
        document.querySelector(
            "#enterprise-customers-results"
        );

    if (!results) {
        return;
    }


    if (
        filteredCustomers.length === 0
    ) {

        results.innerHTML = `
            <div
                class="enterprise-customers__empty"
            >

                <i
                    class="fa-regular fa-user"
                ></i>

                <h2>
                    No encontramos clientes
                </h2>

                <p>
                    Prueba con otro nombre,
                    teléfono o correo.
                </p>

            </div>
        `;

        return;

    }


    results.innerHTML = `
        <div
            class="enterprise-customers__list"
        >

            ${filteredCustomers
                .map(
                    customer =>
                        renderCustomerCard(
                            customer
                        )
                )
                .join("")}

        </div>
    `;


    results
        .querySelectorAll(
            "[data-customer-id]"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const customerId =
                            card.dataset
                                .customerId;

                        openCustomerDetail(
                            customerId
                        );

                    }
                );

            }
        );

}


// ========================================
// CUSTOMER CARD
// ========================================

function renderCustomerCard(
    customer
) {

    const customerOrders =
        orders.filter(
            order =>
                order?.customerId ===
                customer?.id
        );

    const validOrders =
        customerOrders.filter(
            order =>
                order?.orderStatus !==
                "cancelled"
        );

    const total =
        validOrders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                Number(
                    order?.subtotal ||
                    0
                ) +
                Number(
                    order?.shipping ||
                    0
                ) -
                Number(
                    order?.discount ||
                    0
                ),
            0
        );

    const lastOrder =
        customerOrders
            .map(
                order =>
                    order?.createdAt
            )
            .filter(Boolean)
            .sort(
                (
                    a,
                    b
                ) =>
                    toMillis(b) -
                    toMillis(a)
            )[0];

    const source =
        customer?.acquisitionSource ||
        customer?.source ||
        "No especificado";

    const active =
        customer?.active !== false;


    return `
        <article
            class="enterprise-customers__card"
            data-customer-id="${escapeHTML(
                customer?.id || ""
            )}"
        >

            <div
                class="enterprise-customers__identity"
            >

                <div
                    class="enterprise-customers__avatar"
                >
                    ${escapeHTML(
                        getInitials(
                            customer?.name
                        )
                    )}
                </div>

                <div
                    class="enterprise-customers__identity-main"
                >

                    <h3>
                        ${escapeHTML(
                            customer?.name ||
                            "Cliente sin nombre"
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            customer?.email ||
                            "Sin correo"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            customer?.phone ||
                            "Sin teléfono"
                        )}
                    </span>

                </div>

            </div>


            <div
                class="enterprise-customers__commercial"
            >

                <div>

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        ${customerOrders.length}
                    </strong>

                </div>

                <div>

                    <span>
                        Compras
                    </span>

                    <strong>
                        ${formatCurrency(
                            total
                        )}
                    </strong>

                </div>

            </div>


            <div
                class="enterprise-customers__meta"
            >

                <span
                    class="
                        enterprise-customers__status
                        ${
                            active
                                ? "is-active"
                                : "is-inactive"
                        }
                    "
                >
                    ${active
                        ? "Activo"
                        : "Inactivo"}
                </span>

                <span>
                    ${escapeHTML(
                        source
                    )}
                </span>

                <span>
                    Última compra:
                    ${
                        lastOrder
                            ? formatDate(
                                lastOrder
                            )
                            : "Sin compras"
                    }
                </span>

            </div>

            <i
                class="
                    enterprise-customers__card-arrow
                    fa-solid
                    fa-chevron-right
                "
            ></i>

        </article>
    `;

}



// ========================================
// CUSTOMER DETAIL
// ========================================

async function openCustomerDetail(
    customerId
) {

    const results =
        document.querySelector(
            "#enterprise-customers-results"
        );

    if (!results || !customerId) {
        return;
    }

    const customer =
        customers.find(
            item =>
                item?.id === customerId
        );

    if (!customer) {
        return;
    }

    results.innerHTML = `
        <div
            class="enterprise-customers__detail-loading"
        >
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Cargando cliente...</span>
        </div>
    `;

    try {

        const freshCustomer =
            await getCustomer(
                customerId
            );

        renderCustomerDetail(
            freshCustomer || customer
        );

    } catch (error) {

        console.error(
            "Error cargando detalle del cliente:",
            error
        );

        renderCustomerDetail(
            customer
        );

    }

}


function renderCustomerDetail(
    customer
) {

    const results =
        document.querySelector(
            "#enterprise-customers-results"
        );

    if (!results) {
        return;
    }

    const customerOrders =
        orders
            .filter(
                order =>
                    order?.customerId ===
                    customer?.id
            )
            .sort(
                (a, b) =>
                    toMillis(b?.createdAt) -
                    toMillis(a?.createdAt)
            );

    const validOrders =
        customerOrders.filter(
            order =>
                order?.orderStatus !==
                "cancelled"
        );

    const totalSpent =
        validOrders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                Number(
                    order?.subtotal || 0
                ) +
                Number(
                    order?.shipping || 0
                ) -
                Number(
                    order?.discount || 0
                ),
            0
        );

    const active =
        customer?.active !== false;

    const source =
        customer?.acquisitionSource ||
        customer?.source ||
        "No especificado";

    const customerSince =
        customer?.createdAt
            ? formatDate(
                customer.createdAt
            )
            : "—";

    const lastPurchase =
        validOrders.length
            ? validOrders[0]?.createdAt
            : null;

    const address =
        customer?.address || {};

    results.innerHTML = `
        <div
            class="enterprise-customers__detail"
        >

            <div
                class="enterprise-customers__detail-header"
            >

                <button
                    type="button"
                    class="enterprise-customers__detail-back"
                    id="enterprise-customers-detail-back"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Clientes
                </button>

                <span
                    class="
                        enterprise-customers__status
                        ${
                            active
                                ? "is-active"
                                : "is-inactive"
                        }
                    "
                >
                    ${
                        active
                            ? "Activo"
                            : "Inactivo"
                    }
                </span>

            </div>


            <div
                class="enterprise-customers__detail-identity"
            >

                <div
                    class="enterprise-customers__detail-avatar"
                >
                    ${escapeHTML(
                        getInitials(
                            customer?.name
                        )
                    )}
                </div>

                <div
                    class="enterprise-customers__detail-identity-main"
                >

                    <h2>
                        ${escapeHTML(
                            customer?.name ||
                            "Cliente sin nombre"
                        )}
                    </h2>

                    <p>
                        Cliente desde ${customerSince}
                    </p>

                </div>

            </div>


            <div
                class="enterprise-customers__detail-summary"
            >

                <div
                    class="enterprise-customers__detail-summary-card"
                >
                    <span>Pedidos</span>
                    <strong>
                        ${customerOrders.length}
                    </strong>
                </div>

                <div
                    class="enterprise-customers__detail-summary-card"
                >
                    <span>Total comprado</span>
                    <strong>
                        ${formatCurrency(
                            totalSpent
                        )}
                    </strong>
                </div>

                <div
                    class="enterprise-customers__detail-summary-card"
                >
                    <span>Última compra</span>
                    <strong>
                        ${
                            lastPurchase
                                ? formatDate(
                                    lastPurchase
                                )
                                : "—"
                        }
                    </strong>
                </div>

            </div>


            <div
                class="enterprise-customers__detail-grid"
            >

                <section
                    class="enterprise-customers__detail-card"
                >

                    <div
                        class="enterprise-customers__detail-card-header"
                    >
                        <h3>Información del cliente</h3>
                    </div>

                    <div
                        class="enterprise-customers__detail-fields"
                    >

                        <div>
                            <span>Nombre</span>
                            <strong>
                                ${escapeHTML(
                                    customer?.name ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Teléfono</span>
                            <strong>
                                ${escapeHTML(
                                    customer?.phone ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Correo</span>
                            <strong>
                                ${escapeHTML(
                                    customer?.email ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Origen</span>
                            <strong>
                                ${escapeHTML(
                                    source
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                <section
                    class="enterprise-customers__detail-card"
                >

                    <div
                        class="enterprise-customers__detail-card-header"
                    >
                        <h3>Dirección</h3>
                    </div>

                    <div
                        class="enterprise-customers__detail-address"
                    >

                        ${
                            [
                                address?.line1,
                                address?.line2,
                                address?.city,
                                address?.department,
                                address?.country
                            ]
                                .filter(Boolean)
                                .map(
                                    value =>
                                        `<span>${escapeHTML(value)}</span>`
                                )
                                .join("") ||
                            "<span>Sin dirección registrada</span>"
                        }

                    </div>

                </section>

            </div>


            <section
                class="enterprise-customers__detail-card enterprise-customers__detail-orders"
            >

                <div
                    class="enterprise-customers__detail-card-header"
                >

                    <div>
                        <h3>Historial de pedidos</h3>
                        <span>
                            ${customerOrders.length}
                            ${
                                customerOrders.length === 1
                                    ? "pedido"
                                    : "pedidos"
                            }
                        </span>
                    </div>

                </div>


                ${
                    customerOrders.length
                        ? `
                            <div
                                class="enterprise-customers__detail-order-list"
                            >
                                ${customerOrders
                                    .map(
                                        order =>
                                            renderCustomerOrder(
                                                order
                                            )
                                    )
                                    .join("")}
                            </div>
                        `
                        : `
                            <div
                                class="enterprise-customers__detail-empty"
                            >
                                <i class="fa-regular fa-clipboard"></i>
                                <p>
                                    Este cliente todavía no tiene pedidos.
                                </p>
                            </div>
                        `
                }

            </section>

        </div>
    `;

    const backButton =
        document.querySelector(
            "#enterprise-customers-detail-back"
        );

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {
                renderCustomerSummary();
                renderCustomers();
            }
        );

    }

}


function renderCustomerOrder(
    order
) {

    const orderNumber =
        order?.orderNumber ||
        "—";

    const orderDate =
        order?.createdAt
            ? formatDate(
                order.createdAt
            )
            : "—";

    const total =
        Number(
            order?.total || 0
        );

    const status =
        getCustomerOrderStatusLabel(
            order?.orderStatus
        );

    const channel =
        order?.salesChannel ||
        "—";

    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];

    const itemPreview =
        items
            .slice(0, 2)
            .map(
                item =>
                    `${item?.productName || "Producto"}${
                        item?.variantName
                            ? ` · ${item.variantName}`
                            : ""
                    }`
            )
            .join(" · ");

    const extraItems =
        items.length > 2
            ? ` +${items.length - 2} más`
            : "";

    return `
        <article
            class="enterprise-customers__detail-order"
        >

            <div
                class="enterprise-customers__detail-order-main"
            >

                <strong>
                    #${escapeHTML(
                        String(
                            orderNumber
                        )
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        itemPreview ||
                        "Sin productos"
                    )}
                    ${escapeHTML(
                        extraItems
                    )}
                </span>

                <small>
                    ${escapeHTML(
                        channel
                    )}
                    ·
                    ${orderDate}
                </small>

            </div>

            <div
                class="enterprise-customers__detail-order-status"
            >
                <span>
                    ${escapeHTML(
                        status
                    )}
                </span>
            </div>

            <strong
                class="enterprise-customers__detail-order-total"
            >
                ${formatCurrency(
                    total
                )}
            </strong>

        </article>
    `;

}


function getCustomerOrderStatusLabel(
    status
) {

    const labels = {
        pending: "Pendiente",
        confirmed: "Confirmado",
        processing: "Procesando",
        ready: "Listo",
        completed: "Completado",
        cancelled: "Cancelado"
    };

    return (
        labels[status] ||
        "Sin estado"
    );

}


// ========================================
// NEW CUSTOMER — PLACEHOLDER
// ========================================

function initNewCustomerButton() {

    const button =
        document.querySelector(
            "#enterprise-customers-add"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            renderNewCustomerForm();
        }
    );

}


// ========================================
// NEW CUSTOMER — FORM
// ========================================

function renderNewCustomerForm() {

    const results =
        document.querySelector(
            "#enterprise-customers-results"
        );

    if (!results) {
        return;
    }

    results.innerHTML = `
        <div
            class="enterprise-customers__new"
        >

            <div
                class="enterprise-customers__new-header"
            >

                <div>
                    <span
                        class="enterprise-customers__eyebrow"
                    >
                        Enterprise · Admin
                    </span>

                    <h2>
                        Nuevo cliente
                    </h2>

                    <p>
                        Registra la información del cliente
                        para incorporarlo al historial comercial.
                    </p>
                </div>

                <button
                    type="button"
                    class="enterprise-customers__new-close"
                    id="enterprise-customers-new-cancel-top"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <form
                id="enterprise-customers-new-form"
                novalidate
            >

                <section
                    class="enterprise-customers__new-card"
                >

                    <div
                        class="enterprise-customers__new-card-header"
                    >
                        <div>
                            <h3>Información principal</h3>
                            <span>
                                Datos básicos para identificar al cliente.
                            </span>
                        </div>
                    </div>

                    <div
                        class="enterprise-customers__new-fields"
                    >

                        <label
                            class="enterprise-customers__new-field enterprise-customers__new-field--full"
                        >
                            <span>
                                Nombre completo
                                <b>*</b>
                            </span>

                            <input
                                type="text"
                                name="name"
                                id="enterprise-customer-name"
                                autocomplete="name"
                                maxlength="120"
                                required
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>
                                Teléfono
                                <b>*</b>
                            </span>

                            <input
                                type="tel"
                                name="phone"
                                id="enterprise-customer-phone"
                                autocomplete="tel"
                                maxlength="30"
                                required
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>Correo electrónico</span>

                            <input
                                type="email"
                                name="email"
                                id="enterprise-customer-email"
                                autocomplete="email"
                                maxlength="160"
                            />
                        </label>

                    </div>

                </section>


                <section
                    class="enterprise-customers__new-card"
                >

                    <div
                        class="enterprise-customers__new-card-header"
                    >
                        <div>
                            <h3>Dirección</h3>
                            <span>
                                Opcional. Puedes completarla cuando sea necesaria.
                            </span>
                        </div>
                    </div>

                    <div
                        class="enterprise-customers__new-fields"
                    >

                        <label
                            class="enterprise-customers__new-field enterprise-customers__new-field--full"
                        >
                            <span>Dirección</span>

                            <input
                                type="text"
                                name="line1"
                                autocomplete="street-address"
                                maxlength="180"
                                placeholder="Dirección principal"
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field enterprise-customers__new-field--full"
                        >
                            <span>Referencia / complemento</span>

                            <input
                                type="text"
                                name="line2"
                                maxlength="180"
                                placeholder="Zona, colonia, apartamento, etc."
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>Ciudad</span>

                            <input
                                type="text"
                                name="city"
                                autocomplete="address-level2"
                                maxlength="80"
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>Departamento</span>

                            <input
                                type="text"
                                name="department"
                                autocomplete="address-level1"
                                maxlength="80"
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>País</span>

                            <input
                                type="text"
                                name="country"
                                autocomplete="country-name"
                                value="Guatemala"
                                maxlength="80"
                            />
                        </label>


                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>Código postal</span>

                            <input
                                type="text"
                                name="postalCode"
                                autocomplete="postal-code"
                                maxlength="20"
                            />
                        </label>

                    </div>

                </section>


                <section
                    class="enterprise-customers__new-card"
                >

                    <div
                        class="enterprise-customers__new-card-header"
                    >
                        <div>
                            <h3>Información comercial</h3>
                            <span>
                                Identifica cómo llegó el cliente a Outsider.
                            </span>
                        </div>
                    </div>

                    <div
                        class="enterprise-customers__new-fields"
                    >

                        <label
                            class="enterprise-customers__new-field"
                        >
                            <span>
                                Origen del cliente
                                <b>*</b>
                            </span>

                            <select
                                name="acquisitionSource"
                                id="enterprise-customer-source"
                                required
                            >
                                <option value="">
                                    Seleccionar origen
                                </option>
                                <option value="website">
                                    Web / Shopify
                                </option>
                                <option value="marketplace">
                                    Facebook Marketplace
                                </option>
                                <option value="instagram">
                                    Instagram
                                </option>
                                <option value="tiktok">
                                    TikTok
                                </option>
                                <option value="whatsapp">
                                    WhatsApp
                                </option>
                                <option value="referral">
                                    Referido
                                </option>
                                <option value="event">
                                    Evento
                                </option>
                                <option value="physical">
                                    Tienda física
                                </option>
                                <option value="other">
                                    Otro
                                </option>
                            </select>
                        </label>


                        <label
                            class="enterprise-customers__new-field enterprise-customers__new-field--full"
                        >
                            <span>Notas</span>

                            <textarea
                                name="notes"
                                maxlength="1000"
                                rows="4"
                                placeholder="Información adicional relevante del cliente..."
                            ></textarea>
                        </label>

                    </div>

                </section>


                <div
                    class="enterprise-customers__new-feedback"
                    id="enterprise-customers-new-feedback"
                    aria-live="polite"
                ></div>


                <div
                    class="enterprise-customers__new-actions"
                >

                    <button
                        type="button"
                        class="enterprise-customers__new-cancel"
                        id="enterprise-customers-new-cancel"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="enterprise-customers__new-submit"
                        id="enterprise-customers-new-submit"
                    >
                        <i class="fa-solid fa-user-plus"></i>
                        Crear cliente
                    </button>

                </div>

            </form>

        </div>
    `;


    const form =
        document.querySelector(
            "#enterprise-customers-new-form"
        );

    const cancel =
        document.querySelector(
            "#enterprise-customers-new-cancel"
        );

    const cancelTop =
        document.querySelector(
            "#enterprise-customers-new-cancel-top"
        );

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeNewCustomerForm
        );
    }

    if (cancelTop) {
        cancelTop.addEventListener(
            "click",
            closeNewCustomerForm
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            handleNewCustomerSubmit
        );
    }

}


function closeNewCustomerForm() {

    renderCustomerSummary();
    renderCustomers();

}


async function handleNewCustomerSubmit(
    event
) {

    event.preventDefault();

    const form =
        event.currentTarget;

    if (!form) {
        return;
    }

    const feedback =
        document.querySelector(
            "#enterprise-customers-new-feedback"
        );

    const submit =
        document.querySelector(
            "#enterprise-customers-new-submit"
        );

    const formData =
        new FormData(form);

    const name =
        String(
            formData.get("name") || ""
        ).trim();

    const phone =
        String(
            formData.get("phone") || ""
        ).trim();

    const email =
        String(
            formData.get("email") || ""
        ).trim();

    const acquisitionSource =
        String(
            formData.get(
                "acquisitionSource"
            ) || ""
        ).trim();

    if (!name || !phone || !acquisitionSource) {

        showNewCustomerFeedback(
            "Completa los campos obligatorios: nombre, teléfono y origen.",
            "error"
        );

        return;
    }

    if (
        email &&
        !isValidEmail(email)
    ) {

        showNewCustomerFeedback(
            "El correo electrónico no tiene un formato válido.",
            "error"
        );

        return;
    }


    const normalizedPhone =
        normalizeCustomerPhone(
            phone
        );

    const normalizedEmail =
        email.toLowerCase();


    const duplicate =
        customers.find(
            customer => {

                const existingPhone =
                    normalizeCustomerPhone(
                        customer?.phone
                    );

                const existingEmail =
                    String(
                        customer?.email || ""
                    )
                        .trim()
                        .toLowerCase();

                return (
                    (
                        normalizedPhone &&
                        existingPhone ===
                            normalizedPhone
                    ) ||
                    (
                        normalizedEmail &&
                        existingEmail ===
                            normalizedEmail
                    )
                );

            }
        );


    if (duplicate) {

        const duplicateName =
            duplicate?.name ||
            "otro cliente";

        showNewCustomerFeedback(
            `Ya existe un cliente registrado con estos datos: ${duplicateName}.`,
            "error"
        );

        return;
    }


    const address = {
        line1:
            String(
                formData.get("line1") ||
                ""
            ).trim(),

        line2:
            String(
                formData.get("line2") ||
                ""
            ).trim(),

        city:
            String(
                formData.get("city") ||
                ""
            ).trim(),

        department:
            String(
                formData.get("department") ||
                ""
            ).trim(),

        country:
            String(
                formData.get("country") ||
                ""
            ).trim(),

        postalCode:
            String(
                formData.get("postalCode") ||
                ""
            ).trim()
    };


    Object.keys(address).forEach(
        key => {

            if (!address[key]) {
                delete address[key];
            }

        }
    );


    const customerData = {

        name,

        phone,

        email,

        acquisitionSource,

        notes:
            String(
                formData.get("notes") ||
                ""
            ).trim(),

        active:
            true,

        ...(Object.keys(address).length
            ? { address }
            : {})

    };


    setNewCustomerSubmitting(
        true
    );


    try {

        const customerId =
            await createCustomer(
                customerData
            );


        if (!customerId) {
            throw new Error(
                "No se recibió el ID del cliente creado."
            );
        }


        const createdCustomer =
            await getCustomer(
                customerId
            );


        const customer =
            createdCustomer || {
                id: customerId,
                ...customerData
            };


        customers = [
            ...customers,
            customer
        ];

        filteredCustomers =
            [...customers];


        renderCustomerSummary();

        renderCustomerDetail(
            customer
        );


        console.log(
            "✓ Cliente creado:",
            customerId
        );


    } catch (error) {

        console.error(
            "Error creando cliente:",
            error
        );

        showNewCustomerFeedback(
            getCustomerCreateErrorMessage(
                error
            ),
            "error"
        );

        setNewCustomerSubmitting(
            false
        );

    }

}


function setNewCustomerSubmitting(
    submitting
) {

    const submit =
        document.querySelector(
            "#enterprise-customers-new-submit"
        );

    if (!submit) {
        return;
    }

    submit.disabled =
        submitting;

    submit.innerHTML =
        submitting
            ? `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creando...
            `
            : `
                <i class="fa-solid fa-user-plus"></i>
                Crear cliente
            `;

}


function showNewCustomerFeedback(
    message,
    type
) {

    const feedback =
        document.querySelector(
            "#enterprise-customers-new-feedback"
        );

    if (!feedback) {
        return;
    }

    feedback.className =
        `
            enterprise-customers__new-feedback
            is-${type}
        `;

    feedback.innerHTML = `
        <i
            class="
                fa-solid
                ${
                    type === "error"
                        ? "fa-circle-exclamation"
                        : "fa-circle-check"
                }
            "
        ></i>

        <span>
            ${escapeHTML(
                message
            )}
        </span>
    `;

}


function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );

}


function normalizeCustomerPhone(
    phone
) {

    return String(
        phone || ""
    )
        .replace(
            /\D/g,
            ""
        );

}


function getCustomerCreateErrorMessage(
    error
) {

    const message =
        String(
            error?.message ||
            ""
        );

    if (
        message
            .toLowerCase()
            .includes(
                "permission"
            )
    ) {

        return (
            "No tienes permisos para crear este cliente."
        );

    }

    return (
        message ||
        "No se pudo crear el cliente. Intenta nuevamente."
    );

}


// ========================================
// HELPERS
// ========================================

function getInitials(
    name
) {

    const parts =
        String(
            name || ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "CL";
    }

    return parts
        .slice(
            0,
            2
        )
        .map(
            part =>
                part
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "es-GT",
        {
            style: "currency",
            currency: "GTQ",
            minimumFractionDigits: 2
        }
    ).format(
        Number(
            value || 0
        )
    );

}


function formatDate(
    value
) {

    const millis =
        toMillis(value);

    if (!millis) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(
        new Date(
            millis
        )
    );

}


function toMillis(
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
            ) *
            1000
        );

    }

    const date =
        new Date(
            value
        );

    const millis =
        date.getTime();

    return Number.isFinite(
        millis
    )
        ? millis
        : 0;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
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

