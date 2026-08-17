// ========================================
// OUTSIDER — CUSTOMER PAYMENT
// ========================================

import {
    getCurrentAuthUser
} from "../firebase/auth.js";

import {
    getCurrentCustomer
} from "../firebase/userService.js";

// ========================================
// STORAGE
// ========================================

const CART_STORAGE_KEY =
    "customerCart";


// ========================================
// OUTSIDER API
// ========================================
//
// Customer Web NO crea la orden directamente
// en Firestore. La creación pasa por Worker,
// que autentica el Firebase ID Token, valida
// producto/precio/stock y ejecuta el flujo
// completo de Order + Inventory.
// ========================================

const OUTSIDER_API_BASE =
    "https://outsider-api.outsidersteams.workers.dev";


// ========================================
// CUSTOMER PAYMENT
// ========================================

export function CustomerPayment() {

    return `

        <main class="customer-payment">


            <!-- ========================================
                 HEADER
            ======================================== -->

            <header class="customer-payment__header">

                <div class="customer-payment__header-inner">

                    <button
                        type="button"
                        class="customer-payment__back"
                        data-payment-back
                        aria-label="Volver al checkout"
                    >

                        <i
                            class="fa-solid fa-arrow-left"
                            aria-hidden="true"
                        ></i>

                    </button>


                    <div class="customer-payment__brand">

                        <span
                            class="customer-payment__eyebrow"
                        >
                            OUTSIDER
                        </span>


                        <h1
                            class="customer-payment__title"
                        >
                            Pago
                        </h1>

                    </div>

                </div>

            </header>


            <!-- ========================================
                 CONTENT
            ======================================== -->

            <section
                class="customer-payment__content"
                aria-label="Pago"
            >


                <!-- ====================================
                     LOADING
                ==================================== -->

                <div
                    class="customer-payment__loading"
                    id="customer-payment-loading"
                >
                    Cargando...
                </div>


                <!-- ====================================
                     ERROR
                ==================================== -->

                <div
                    class="customer-payment__error"
                    id="customer-payment-error"
                    hidden
                ></div>


                <!-- ====================================
                     BODY
                ==================================== -->

                <div
                    class="customer-payment__body"
                    id="customer-payment-body"
                    hidden
                >


                    <!-- ==================================
                         DELIVERY DATA
                    ================================== -->

                    <section
                        class="customer-payment__customer"
                        aria-labelledby="customer-payment-customer-title"
                    >

                        <div class="customer-payment__section-header">

                            <span class="customer-payment__section-number">
                                01
                            </span>

                            <div>
                                <h2
                                    id="customer-payment-customer-title"
                                    class="customer-payment__section-title"
                                >
                                    Datos de entrega
                                </h2>

                                <p class="customer-payment__section-description">
                                    Confirmaremos estos datos al procesar tu pedido.
                                </p>
                            </div>

                        </div>

                        <div
                            id="customer-payment-customer"
                            class="customer-payment__customer-card"
                        >
                            Cargando datos...
                        </div>

                        <button
                            type="button"
                            class="customer-payment__edit-customer"
                            data-payment-edit-customer
                        >
                            EDITAR DATOS
                        </button>

                    </section>


                    <!-- ==================================
                         DISCOUNT
                    ================================== -->

                    <section
                        class="customer-payment__discount"
                        aria-labelledby="customer-payment-discount-title"
                    >

                        <div class="customer-payment__section-header">

                            <span class="customer-payment__section-number">
                                02
                            </span>

                            <div>
                                <h2
                                    id="customer-payment-discount-title"
                                    class="customer-payment__section-title"
                                >
                                    Código de descuento
                                </h2>

                                <p class="customer-payment__section-description">
                                    Ingresa tu código promocional si tienes uno.
                                </p>
                            </div>

                        </div>

                        <div class="customer-payment__discount-controls">

                            <input
                                type="text"
                                id="customer-payment-discount-code"
                                class="customer-payment__discount-input"
                                placeholder="Código de descuento"
                                maxlength="40"
                                autocomplete="off"
                                spellcheck="false"
                            >

                            <button
                                type="button"
                                id="customer-payment-discount-apply"
                                class="customer-payment__discount-button"
                            >
                                APLICAR
                            </button>

                        </div>

                        <p
                            id="customer-payment-discount-message"
                            class="customer-payment__discount-message"
                            aria-live="polite"
                        ></p>

                    </section>


                    <!-- ==================================
                         PAYMENT METHOD
                    ================================== -->

                    <section
                        class="customer-payment__method"
                        aria-labelledby="customer-payment-method-title"
                    >


                        <div
                            class="customer-payment__section-header"
                        >

                            <span
                                class="customer-payment__section-number"
                            >
                                03
                            </span>


                            <div>

                                <h2
                                    id="customer-payment-method-title"
                                    class="customer-payment__section-title"
                                >
                                    Método de pago
                                </h2>


                                <p
                                    class="customer-payment__section-description"
                                >
                                    Selecciona cómo deseas pagar tu pedido.
                                </p>

                            </div>

                        </div>


                        <!-- ==================================
                             PAYMENT OPTION
                        ================================== -->

                        <div
                            class="customer-payment__options"
                        >

                            <label
                                class="customer-payment__option customer-payment__option--selected"
                            >

                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash_on_delivery"
                                    checked
                                >


                                <span
                                    class="customer-payment__option-radio"
                                    aria-hidden="true"
                                ></span>


                                <span
                                    class="customer-payment__option-content"
                                >

                                    <strong
                                        class="customer-payment__option-title"
                                    >
                                        Pago contra entrega
                                    </strong>


                                    <span
                                        class="customer-payment__option-description"
                                    >
                                        Paga tu pedido cuando lo recibas.
                                    </span>

                                </span>


                                <i
                                    class="fa-solid fa-money-bill-wave"
                                    aria-hidden="true"
                                ></i>

                            </label>

                        </div>

                    </section>


                    <!-- ==================================
                         ORDER SUMMARY
                    ================================== -->

                    <section
                        class="customer-payment__summary"
                        aria-labelledby="customer-payment-summary-title"
                    >


                        <div
                            class="customer-payment__section-header"
                        >

                            <span
                                class="customer-payment__section-number"
                            >
                                04
                            </span>


                            <div>

                                <h2
                                    id="customer-payment-summary-title"
                                    class="customer-payment__section-title"
                                >
                                    Resumen del pedido
                                </h2>

                            </div>

                        </div>


                        <div
                            id="customer-payment-items"
                            class="customer-payment__items"
                        ></div>


                        <div
                            id="customer-payment-totals"
                            class="customer-payment__totals"
                        ></div>

                    </section>


                    <!-- ==================================
                         CONFIRM
                    ================================== -->

                    <section
                        class="customer-payment__confirmation"
                    >

                        <p
                            class="customer-payment__confirmation-text"
                        >
                            Al confirmar, revisaremos disponibilidad, precios, descuentos y procesaremos tu pedido.
                        </p>


                        <button
                            type="button"
                            id="customer-payment-submit"
                            class="customer-payment__submit"
                        >
                            CONFIRMAR PEDIDO
                        </button>

                    </section>

                </div>

            </section>

        </main>

    `;

}


// ========================================
// INIT PAYMENT
// ========================================

export async function initCustomerPayment() {

    const payment =
        document.querySelector(
            ".customer-payment"
        );


    if (!payment) {

        console.error(
            "No se encontró .customer-payment"
        );

        return;

    }


    // ========================================
    // AUTH
    // ========================================

    const user =
        getCurrentAuthUser();


    if (!user) {

        navigateTo(
            "/account"
        );

        return;

    }


    // ========================================
    // CART
    // ========================================

    const cart =
        loadCart();


    if (!cart.length) {

        console.warn(
            "Payment iniciado con carrito vacío."
        );


        navigateTo(
            "/cart"
        );

        return;

    }


    // ========================================
    // CUSTOMER
    // ========================================

    let customer;

    try {

        customer =
            await getCurrentCustomer();

    } catch (error) {

        console.error(
            "Error cargando Customer en Payment:",
            error
        );

        showPaymentError(
            error.message ||
            "No pudimos cargar tus datos."
        );

        return;

    }


    if (!customer) {

        showPaymentError(
            "No se encontró un Customer asociado a esta cuenta."
        );

        return;

    }


    // ========================================
    // RENDER
    // ========================================

    renderPayment(
        cart,
        customer
    );


    initPaymentEvents();

}


// ========================================
// LOAD CART
// ========================================

function loadCart() {

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!storedCart) {

            return [];

        }


        return normalizeCart(
            JSON.parse(
                storedCart
            )
        );

    } catch (error) {

        console.error(
            "Error leyendo carrito en Payment:",
            error
        );


        return [];

    }

}


// ========================================
// NORMALIZE CART
// ========================================

function normalizeCart(
    items
) {

    if (!Array.isArray(items)) {

        return [];

    }


    return items
        .filter(
            item =>
                item &&
                item.productId
        )
        .map(
            item => {

                const price =
                    normalizePrice(
                        item.price
                    );


                const quantity =
                    normalizeQuantity(
                        item.quantity
                    );


                return {

                    productId:
                        String(
                            item.productId
                        ),

                    productName:
                        String(
                            item.productName ||
                            "Producto"
                        ),

                    variantId:
                        item.variantId
                            ? String(
                                item.variantId
                            )
                            : "",

                    variantName:
                        item.variantName
                            ? String(
                                item.variantName
                            )
                            : "",

                    colorName:
                        item.colorName
                            ? String(
                                item.colorName
                            )
                            : "",

                    sizeId:
                        item.sizeId
                            ? String(
                                item.sizeId
                            )
                            : "",

                    sizeName:
                        item.sizeName
                            ? String(
                                item.sizeName
                            )
                            : "",

                    price,

                    quantity,

                    lineTotal:
                        price *
                        quantity,

                    image:
                        item.image
                            ? String(
                                item.image
                            )
                            : ""

                };

            }
        );

}


// ========================================
// RENDER PAYMENT
// ========================================

function renderPayment(
    cart,
    customer
) {

    const loading =
        document.querySelector(
            "#customer-payment-loading"
        );

    const body =
        document.querySelector(
            "#customer-payment-body"
        );

    const items =
        document.querySelector(
            "#customer-payment-items"
        );

    const totals =
        document.querySelector(
            "#customer-payment-totals"
        );


    const customerContainer =
        document.querySelector(
            "#customer-payment-customer"
        );


    if (
        !loading ||
        !body ||
        !items ||
        !totals
    ) {

        return;

    }


    if (customerContainer) {

        renderCustomer(
            customerContainer,
            customer
        );

    }


    items.innerHTML =
        cart
            .map(
                renderPaymentItem
            )
            .join("");


    totals.innerHTML =
        renderTotals(
            cart
        );


    loading.hidden =
        true;

    body.hidden =
        false;

}


// ========================================
// CUSTOMER SUMMARY
// ========================================

function renderCustomer(
    container,
    customer
) {

    const address =
        customer.address || {};

    const addressParts = [
        address.street,
        address.zone,
        address.city,
        address.department
    ]
        .filter(Boolean)
        .map(
            value =>
                escapeHTML(value)
        );

    container.innerHTML = `

        <div class="customer-payment__customer-name">
            ${escapeHTML(
                customer.name || "Cliente"
            )}
        </div>

        <div class="customer-payment__customer-contact">

            ${
                customer.phone
                    ? `<span>${escapeHTML(
                        customer.phone
                    )}</span>`
                    : ""
            }

            ${
                customer.email
                    ? `<span>${escapeHTML(
                        customer.email
                    )}</span>`
                    : ""
            }

        </div>

        <div class="customer-payment__customer-address">

            ${
                addressParts.length
                    ? addressParts.join(", ")
                    : "Sin dirección de entrega registrada."
            }

        </div>

    `;
}


// ========================================
// DISCOUNT — PREPARED
// ========================================

function handleDiscountApply(
    button
) {

    const payment =
        document.querySelector(
            ".customer-payment"
        );

    if (!payment) return;

    const input =
        payment.querySelector(
            "#customer-payment-discount-code"
        );

    const message =
        payment.querySelector(
            "#customer-payment-discount-message"
        );

    if (!input || !message) return;

    const code =
        String(
            input.value || ""
        )
            .trim()
            .toUpperCase();

    if (!code) {

        message.textContent =
            "Ingresa un código de descuento.";

        input.focus();

        return;

    }

    input.value =
        code;

    /*
        Todavía no se valida ni calcula el descuento
        en frontend. La validación real se hará en
        backend al aplicar/confirmar el pedido.
    */

    message.textContent =
        "La validación de códigos de descuento se habilitará próximamente.";

}


// ========================================
// PAYMENT ITEM
// ========================================

function renderPaymentItem(
    item
) {

    const image =
        item.image

            ? `

                <img
                    src="${escapeHTML(
                        item.image
                    )}"
                    alt="${escapeHTML(
                        item.productName
                    )}"
                    class="customer-payment__item-image"
                    loading="lazy"
                >

            `

            : `

                <div
                    class="customer-payment__item-image customer-payment__item-image--empty"
                    aria-hidden="true"
                >

                    <i
                        class="fa-regular fa-image"
                    ></i>

                </div>

            `;


    const options = [];


    if (item.variantName) {

        options.push(
            escapeHTML(
                item.variantName
            )
        );

    }


    if (item.colorName) {

        options.push(
            `Color ${escapeHTML(
                item.colorName
            )}`
        );

    }


    if (item.sizeName) {

        options.push(
            `Talla ${escapeHTML(
                item.sizeName
            )}`
        );

    }


    return `

        <article
            class="customer-payment__item"
        >

            <div
                class="customer-payment__item-media"
            >

                ${image}

            </div>


            <div
                class="customer-payment__item-info"
            >

                <h3
                    class="customer-payment__item-name"
                >
                    ${escapeHTML(
                        item.productName
                    )}
                </h3>


                ${
                    options.length

                        ? `

                            <div
                                class="customer-payment__item-options"
                            >
                                ${options.join(
                                    " · "
                                )}
                            </div>

                        `

                        : ""
                }


                <div
                    class="customer-payment__item-meta"
                >

                    <span>
                        Cantidad ${item.quantity}
                    </span>

                </div>

            </div>


            <strong
                class="customer-payment__item-price"
            >

                ${formatCurrency(
                    item.lineTotal
                )}

            </strong>

        </article>

    `;

}


// ========================================
// TOTALS
// ========================================

function renderTotals(
    cart
) {

    const subtotal =
        getSubtotal(
            cart
        );


    // ========================================
    // FUTURE PAYMENT STRUCTURE
    // ========================================
    //
    // Estos valores se mantienen separados
    // para preparar:
    //
    // - códigos de descuento
    // - descuentos por campaña
    // - descuentos de envío
    // - cálculo de envío
    // - futuras pasarelas
    //
    // ========================================

    const discount =
        0;


    const shipping =
        0;


    const total =
        subtotal -
        discount +
        shipping;


    return `

        <div
            class="customer-payment__total-row"
        >

            <span>
                Subtotal
            </span>


            <strong>
                ${formatCurrency(
                    subtotal
                )}
            </strong>

        </div>


        <div
            class="customer-payment__total-row"
        >

            <span>
                Descuento
            </span>


            <strong>
                ${formatCurrency(
                    discount
                )}
            </strong>

        </div>


        <div
            class="customer-payment__total-row"
        >

            <span>
                Envío
            </span>


            <strong>
                Se calculará después
            </strong>

        </div>


        <div
            class="customer-payment__total-divider"
        ></div>


        <div
            class="customer-payment__total-row customer-payment__total-row--grand"
        >

            <span>
                Total
            </span>


            <strong>
                ${formatCurrency(
                    total
                )}
            </strong>

        </div>

    `;

}


// ========================================
// SUBTOTAL
// ========================================

function getSubtotal(
    cart
) {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return total +
                item.lineTotal;

        },
        0
    );

}


// ========================================
// EVENTS
// ========================================

function initPaymentEvents() {

    const payment =
        document.querySelector(
            ".customer-payment"
        );


    if (!payment) {

        return;

    }


    // ========================================
    // BACK
    // ========================================

    payment.addEventListener(
        "click",
        event => {

            const backButton =
                event.target.closest(
                    "[data-payment-back]"
                );


            if (backButton) {

                navigateTo(
                    "/checkout"
                );

                return;

            }


            // ====================================
            // CONFIRM ORDER
            // ====================================

            const editCustomerButton =
                event.target.closest(
                    "[data-payment-edit-customer]"
                );

            if (editCustomerButton) {

                navigateTo(
                    "/checkout"
                );

                return;

            }


            const discountButton =
                event.target.closest(
                    "#customer-payment-discount-apply"
                );

            if (discountButton) {

                handleDiscountApply(
                    discountButton
                );

                return;

            }


            const submitButton =
                event.target.closest(
                    "#customer-payment-submit"
                );


            if (submitButton) {

                handlePaymentSubmit(
                    submitButton
                );

            }

        }
    );


    // ========================================
    // DISCOUNT INPUT
    // ========================================

    const discountInput =
        payment.querySelector(
            "#customer-payment-discount-code"
        );

    if (discountInput) {

        discountInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    const button =
                        payment.querySelector(
                            "#customer-payment-discount-apply"
                        );

                    if (button) {

                        handleDiscountApply(
                            button
                        );

                    }

                }

            }
        );

    }


    // ========================================
    // PAYMENT METHOD
    // ========================================

    const paymentOption =
        payment.querySelector(
            ".customer-payment__option"
        );


    if (paymentOption) {

        paymentOption.addEventListener(
            "click",
            () => {

                paymentOption.classList.add(
                    "customer-payment__option--selected"
                );

            }
        );

    }

}


// ========================================
// PAYMENT SUBMIT
// ========================================

async function handlePaymentSubmit(
    submitButton
) {

    if (
        !submitButton ||
        submitButton.disabled
    ) {

        return;

    }


    const payment =
        document.querySelector(
            ".customer-payment"
        );


    if (!payment) {

        return;

    }


    const errorElement =
        document.querySelector(
            "#customer-payment-error"
        );


    if (errorElement) {

        errorElement.textContent =
            "";

        errorElement.hidden =
            true;

    }


    // ========================================
    // AUTH
    // ========================================

    const user =
        getCurrentAuthUser();


    if (!user) {

        showPaymentError(
            "Tu sesión expiró. Inicia sesión nuevamente."
        );

        return;

    }


    // ========================================
    // CUSTOMER
    // ========================================

    let customer;

    try {

        customer =
            await getCurrentCustomer();

    } catch (error) {

        console.error(
            "Error obteniendo Customer antes de crear Order:",
            error
        );

        showPaymentError(
            error.message ||
            "No pudimos validar tus datos."
        );

        return;

    }


    if (!customer) {

        showPaymentError(
            "No se encontró un Customer asociado a esta cuenta."
        );

        return;

    }


    // ========================================
    // CART
    // ========================================

    const cart =
        loadCart();


    if (!cart.length) {

        showPaymentError(
            "Tu carrito está vacío."
        );

        return;

    }


    // ========================================
    // PAYMENT METHOD
    // ========================================

    const paymentMethod =
        payment.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value ||
        "cash_on_delivery";


    if (
        paymentMethod !==
        "cash_on_delivery"
    ) {

        showPaymentError(
            "El método de pago seleccionado no está disponible."
        );

        return;

    }


    // ========================================
    // DISCOUNT
    // ========================================
    //
    // El código se envía como referencia para la
    // siguiente etapa de validación real.
    //
    // createCustomerOrder() actualmente no aplica
    // descuentos desde frontend.
    // ========================================

    const discountInput =
        payment.querySelector(
            "#customer-payment-discount-code"
        );


    const discountCode =
        String(
            discountInput?.value ||
            ""
        )
            .trim()
            .toUpperCase();


    // ========================================
    // PREPARE REQUEST
    // ========================================
    //
    // NO enviamos price, productName ni otros
    // valores económicos como fuente de verdad.
    //
    // Firestore vuelve a consultar producto,
    // variante, talla y stock.
    // ========================================

    const requestedItems =
        cart.map(
            item => ({

                productId:
                    item.productId,

                variantId:
                    item.variantId ||
                    null,

                sizeId:
                    item.sizeId ||
                    null,

                quantity:
                    item.quantity

            })
        );


    submitButton.disabled =
        true;


    const originalText =
        submitButton.textContent;


    submitButton.textContent =
        "PROCESANDO PEDIDO...";


    try {

        // ========================================
        // FIREBASE ID TOKEN
        // ========================================

        const idToken =
            await user.getIdToken(
                true
            );


        if (!idToken) {

            throw new Error(
                "Firebase no devolvió un ID Token."
            );

        }


        // ========================================
        // CREATE ORDER THROUGH OUTSIDER API
        // ========================================
        //
        // IMPORTANTE:
        // NO escribimos Firestore directamente desde
        // Customer Web.
        //
        // El Worker es la fuente de verdad para:
        //
        // - autenticación
        // - validación del producto
        // - precio real
        // - stock
        // - orderNumber
        // - customerSnapshot
        // - creación de Order
        // - descuento de Inventory
        // - InventoryMovement
        //
        // Esto es exactamente el mismo flujo que
        // comprobamos con testCustomerOrderCreate().
        // ========================================

        const requestBody = {

            items:
                requestedItems,

            paymentMethod,

            discountCode:
                discountCode ||
                null

        };


        console.log(
            "→ Request Customer Order:",
            requestBody
        );


        const response =
            await fetch(

                `${OUTSIDER_API_BASE}/customer/order/create`,

                {

                    method:
                        "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${idToken}`,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

                }

            );


        let result =
            null;


        try {

            result =
                await response.json();

        } catch {

            throw new Error(
                "OUTSIDER API no devolvió JSON válido."
            );

        }


        if (!response.ok) {

            throw new Error(
                result?.error ||
                `No se pudo crear el pedido. HTTP ${response.status}`
            );

        }


        if (
            result?.success !== true ||
            result?.created !== true
        ) {

            throw new Error(
                result?.error ||
                "OUTSIDER API no confirmó la creación del pedido."
            );

        }


        console.log(
            "✓ Pedido Customer Web creado:",
            result
        );


        // ========================================
        // SOLO DESPUÉS DE ÉXITO
        // ========================================
        //
        // Nunca vaciamos el carrito antes de que
        // Firestore confirme la transacción.
        // ========================================

        localStorage.removeItem(
            CART_STORAGE_KEY
        );


        showPaymentSuccess(
            result
        );


    } catch (error) {

        console.error(
            "Error creando pedido Customer Web:",
            error
        );


        showPaymentError(
            getCustomerOrderErrorMessage(
                error
            ),
            true
        );


        submitButton.disabled =
            false;


        submitButton.textContent =
            originalText;

        return;

    }

}


// ========================================
// CUSTOMER ORDER ERROR
// ========================================

function getCustomerOrderErrorMessage(
    error
) {

    const message =
        String(
            error?.message ||
            ""
        );


    if (
        message.includes(
            "Missing or insufficient permissions"
        )
    ) {

        return (
            "La operación fue rechazada por permisos. "
            +
            "El pedido Customer debe procesarse mediante OUTSIDER API."
        );

    }


    if (
        message.toLowerCase().includes(
            "stock insuficiente"
        )
    ) {

        return message;

    }


    return (
        message ||
        "No pudimos confirmar tu pedido. "
        +
        "Tu carrito se ha conservado."
    );

}


// ========================================
// CUSTOMER ORDER SUCCESS
// ========================================

function showPaymentSuccess(
    result
) {

    const body =
        document.querySelector(
            "#customer-payment-body"
        );


    if (!body) {

        return;

    }


    body.innerHTML = `

        <section
            class="customer-payment__success"
            aria-live="polite"
        >

            <div
                class="customer-payment__success-icon"
                aria-hidden="true"
            >
                <i class="fa-solid fa-check"></i>
            </div>


            <h2
                class="customer-payment__success-title"
            >
                Pedido confirmado
            </h2>


            <p
                class="customer-payment__success-message"
            >
                Hemos recibido tu pedido correctamente.
            </p>


            <div
                class="customer-payment__success-order"
            >

                <span>
                    Pedido
                </span>

                <strong>
                    #${escapeHTML(
                        result?.order?.orderNumber ??
                        result?.orderNumber ??
                        result?.orderId ??
                        ""
                    )}
                </strong>

            </div>


            <p
                class="customer-payment__success-total"
            >
                Total:
                <strong>
                    ${formatCurrency(
                        result?.order?.total ??
                        result?.total ??
                        0
                    )}
                </strong>
            </p>


            <p
                class="customer-payment__success-payment"
            >
                Pago contra entrega
            </p>


            <!--
                Tracking todavía no existe.
                Cuando se construya, este punto será
                el enlace directo hacia /tracking.
            -->

        </section>

    `;

}


// ========================================
// ERROR
// ========================================

function showPaymentError(
    message,
    preserveBody = false
) {

    const loading =
        document.querySelector(
            "#customer-payment-loading"
        );

    const body =
        document.querySelector(
            "#customer-payment-body"
        );

    const errorElement =
        document.querySelector(
            "#customer-payment-error"
        );

    if (loading) {

        loading.hidden =
            true;

    }

    if (body) {

        body.hidden =
            !preserveBody;

    }

    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.hidden =
            false;

    }

}


// ========================================
// NAVIGATION
// ========================================

function navigateTo(
    path
) {

    window.history.pushState(
        {},
        "",
        path
    );


    window.dispatchEvent(
        new PopStateEvent(
            "popstate"
        )
    );

}


// ========================================
// PRICE
// ========================================

function normalizePrice(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


// ========================================
// QUANTITY
// ========================================

function normalizeQuantity(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        ) ||
        number <= 0
    ) {

        return 1;

    }


    return Math.max(
        1,
        Math.floor(
            number
        )
    );

}


// ========================================
// CURRENCY
// ========================================

function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "es-GT",
        {

            style:
                "currency",

            currency:
                "GTQ",

            maximumFractionDigits:
                2

        }
    ).format(
        Number(value) || 0
    );

}


// ========================================
// HTML ESCAPE
// ========================================

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