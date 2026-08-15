// ========================================
// OUTSIDER — CUSTOMER CHECKOUT
// ========================================

import {
    getCurrentAuthUser
} from "../firebase/auth.js";

import {
    getCustomerByAuthUid,
    updateCustomerCheckoutData
} from "../firebase/firestore.js";


// ========================================
// STORAGE
// ========================================

const CART_STORAGE_KEY =
    "customerCart";

const CHECKOUT_RETURN_KEY =
    "customerAuthReturnTo";


// ========================================
// CUSTOMER CHECKOUT
// ========================================

export function CustomerCheckout() {

    return `

        <main class="customer-checkout">


            <!-- ========================================
                 HEADER
            ======================================== -->

            <header class="customer-checkout__header">

                <div class="customer-checkout__header-inner">

                    <button
                        type="button"
                        class="customer-checkout__back"
                        data-checkout-back
                        aria-label="Volver al carrito"
                    >

                        <i
                            class="fa-solid fa-arrow-left"
                            aria-hidden="true"
                        ></i>

                    </button>


                    <div class="customer-checkout__brand">

                        <span class="customer-checkout__eyebrow">
                            OUTSIDER
                        </span>

                        <h1 class="customer-checkout__title">
                            Checkout
                        </h1>

                    </div>

                </div>

            </header>


            <!-- ========================================
                 CONTENT
            ======================================== -->

            <section
                class="customer-checkout__content"
                aria-label="Checkout"
            >


                <!-- ====================================
                     LOADING
                ==================================== -->

                <div
                    class="customer-checkout__loading"
                    id="customer-checkout-loading"
                >
                    Cargando...
                </div>


                <!-- ====================================
                     BODY
                ==================================== -->

                <div
                    class="customer-checkout__body"
                    id="customer-checkout-body"
                    hidden
                >


                    <!-- ==================================
                         CUSTOMER DATA
                    ================================== -->

                    <section
                        class="customer-checkout__customer"
                        aria-labelledby="customer-checkout-customer-title"
                    >


                        <div
                            class="customer-checkout__section-header"
                        >

                            <span
                                class="customer-checkout__section-number"
                            >
                                01
                            </span>


                            <div>

                                <h2
                                    id="customer-checkout-customer-title"
                                    class="customer-checkout__section-title"
                                >
                                    Datos de entrega
                                </h2>


                                <p
                                    class="customer-checkout__section-description"
                                >
                                    Confirma tus datos para recibir tu pedido.
                                </p>

                            </div>

                        </div>


                        <form
                            id="customer-checkout-form"
                            class="customer-checkout__form"
                        >


                            <!-- ==============================
                                 NAME
                            =============================== -->

                            <div
                                class="customer-checkout__field"
                            >

                                <label
                                    for="checkout-name"
                                    class="customer-checkout__label"
                                >
                                    Nombre completo
                                </label>


                                <input
                                    type="text"
                                    id="checkout-name"
                                    name="name"
                                    class="customer-checkout__input"
                                    autocomplete="name"
                                    required
                                >

                            </div>


                            <!-- ==============================
                                 EMAIL
                            =============================== -->

                            <div
                                class="customer-checkout__field"
                            >

                                <label
                                    for="checkout-email"
                                    class="customer-checkout__label"
                                >
                                    Email
                                </label>


                                <input
                                    type="email"
                                    id="checkout-email"
                                    name="email"
                                    class="customer-checkout__input"
                                    autocomplete="email"
                                    readonly
                                >


                                <small
                                    class="customer-checkout__hint"
                                >
                                    Este correo pertenece a tu cuenta.
                                </small>

                            </div>


                            <!-- ==============================
                                 PHONE
                            =============================== -->

                            <div
                                class="customer-checkout__field"
                            >

                                <label
                                    for="checkout-phone"
                                    class="customer-checkout__label"
                                >
                                    Teléfono
                                </label>


                                <input
                                    type="tel"
                                    id="checkout-phone"
                                    name="phone"
                                    class="customer-checkout__input"
                                    autocomplete="tel"
                                    required
                                >

                            </div>


                            <!-- ==============================
                                 ADDRESS
                            =============================== -->

                            <div
                                class="customer-checkout__address"
                            >

                                <div
                                    class="customer-checkout__address-title"
                                >
                                    Dirección de envío
                                </div>


                                <!-- LINE 1 -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-address-line1"
                                        class="customer-checkout__label"
                                    >
                                        Dirección
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-address-line1"
                                        name="addressLine1"
                                        class="customer-checkout__input"
                                        autocomplete="address-line1"
                                        required
                                    >

                                </div>


                                <!-- LINE 2 -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-address-line2"
                                        class="customer-checkout__label"
                                    >
                                        Apartamento, casa, referencia
                                        <span>(opcional)</span>
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-address-line2"
                                        name="addressLine2"
                                        class="customer-checkout__input"
                                        autocomplete="address-line2"
                                    >

                                </div>


                                <!-- CITY -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-city"
                                        class="customer-checkout__label"
                                    >
                                        Ciudad
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-city"
                                        name="city"
                                        class="customer-checkout__input"
                                        autocomplete="address-level2"
                                        required
                                    >

                                </div>


                                <!-- DEPARTMENT -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-department"
                                        class="customer-checkout__label"
                                    >
                                        Departamento / Estado
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-department"
                                        name="department"
                                        class="customer-checkout__input"
                                        autocomplete="address-level1"
                                        required
                                    >

                                </div>


                                <!-- COUNTRY -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-country"
                                        class="customer-checkout__label"
                                    >
                                        País
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-country"
                                        name="country"
                                        class="customer-checkout__input"
                                        autocomplete="country"
                                        required
                                    >

                                </div>


                                <!-- POSTAL CODE -->

                                <div
                                    class="customer-checkout__field"
                                >

                                    <label
                                        for="checkout-postal-code"
                                        class="customer-checkout__label"
                                    >
                                        Código postal
                                    </label>


                                    <input
                                        type="text"
                                        id="checkout-postal-code"
                                        name="postalCode"
                                        class="customer-checkout__input"
                                        autocomplete="postal-code"
                                    >

                                </div>

                            </div>


                            <!-- ==============================
                                 ERROR
                            =============================== -->

                            <p
                                id="customer-checkout-error"
                                class="customer-checkout__error"
                                hidden
                            ></p>


                            <!-- ==============================
                                 BUTTON
                            =============================== -->

                            <button
                                type="submit"
                                id="customer-checkout-submit"
                                class="customer-checkout__submit"
                            >
                                CONTINUAR AL PAGO
                            </button>


                        </form>

                    </section>


                    <!-- ==================================
                         ORDER SUMMARY
                    ================================== -->

                    <aside
                        class="customer-checkout__summary"
                        aria-labelledby="customer-checkout-summary-title"
                    >

                        <div
                            class="customer-checkout__section-header"
                        >

                            <span
                                class="customer-checkout__section-number"
                            >
                                02
                            </span>


                            <div>

                                <h2
                                    id="customer-checkout-summary-title"
                                    class="customer-checkout__section-title"
                                >
                                    Resumen
                                </h2>

                            </div>

                        </div>


                        <div
                            id="customer-checkout-items"
                            class="customer-checkout__items"
                        ></div>


                        <div
                            id="customer-checkout-totals"
                            class="customer-checkout__totals"
                        ></div>

                    </aside>

                </div>

            </section>

        </main>

    `;

}


// ========================================
// INIT CHECKOUT
// ========================================

export async function initCustomerCheckout() {

    const checkout =
        document.querySelector(
            ".customer-checkout"
        );


    if (!checkout) {

        console.error(
            "No se encontró .customer-checkout"
        );

        return;

    }


    const cart =
        loadCart();


    // ========================================
    // EMPTY CART
    // ========================================

    if (!cart.length) {

        console.warn(
            "Checkout iniciado con carrito vacío."
        );


        navigateTo(
            "/cart"
        );


        return;

    }


    // ========================================
    // AUTH
    // ========================================

    const user =
        getCurrentAuthUser();


    if (!user) {

        sessionStorage.setItem(
            CHECKOUT_RETURN_KEY,
            "/checkout"
        );


        navigateTo(
            "/account"
        );


        return;

    }


    // ========================================
    // CUSTOMER
    // ========================================

    try {

        const customer =
            await getCustomerByAuthUid(
                user.uid
            );


        if (!customer) {

            throw new Error(
                "No se encontró un Customer asociado a esta cuenta."
            );

        }


        renderCheckout(
            cart,
            customer
        );


        initCheckoutEvents(
            customer
        );

    } catch (error) {

        console.error(
            "Error cargando Customer en Checkout:",
            error
        );


        showCheckoutError(
            "No pudimos cargar tus datos. Intenta nuevamente."
        );

    }

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
            "Error leyendo carrito en Checkout:",
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
            item => ({

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

                colorId:
                    item.colorId
                        ? String(
                            item.colorId
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

                sku:
                    item.sku
                        ? String(
                            item.sku
                        )
                        : "",

                price:
                    normalizePrice(
                        item.price
                    ),

                quantity:
                    normalizeQuantity(
                        item.quantity
                    ),

                lineTotal:
                    normalizePrice(
                        item.price
                    ) *
                    normalizeQuantity(
                        item.quantity
                    ),

                image:
                    item.image
                        ? String(
                            item.image
                        )
                        : "",

                fulfillmentType:
                    item.fulfillmentType
                        ? String(
                            item.fulfillmentType
                        )
                        : "physical"

            })
        );

}


// ========================================
// RENDER CHECKOUT
// ========================================

function renderCheckout(
    cart,
    customer
) {

    const loading =
        document.querySelector(
            "#customer-checkout-loading"
        );

    const body =
        document.querySelector(
            "#customer-checkout-body"
        );

    const items =
        document.querySelector(
            "#customer-checkout-items"
        );

    const totals =
        document.querySelector(
            "#customer-checkout-totals"
        );


    if (
        !loading ||
        !body ||
        !items ||
        !totals
    ) {

        return;

    }


    fillCustomerForm(
        customer
    );


    items.innerHTML =
        cart
            .map(
                renderCheckoutItem
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
// FILL CUSTOMER FORM
// ========================================

function fillCustomerForm(
    customer
) {

    const address =
        customer.address &&
        typeof customer.address === "object"
            ? customer.address
            : {};


    setInputValue(
        "#checkout-name",
        customer.name
    );


    setInputValue(
        "#checkout-email",
        customer.email
    );


    setInputValue(
        "#checkout-phone",
        customer.phone
    );


    setInputValue(
        "#checkout-address-line1",
        address.line1
    );


    setInputValue(
        "#checkout-address-line2",
        address.line2
    );


    setInputValue(
        "#checkout-city",
        address.city
    );


    setInputValue(
        "#checkout-department",
        address.department
    );


    setInputValue(
        "#checkout-country",
        address.country
    );


    setInputValue(
        "#checkout-postal-code",
        address.postalCode
    );

}


// ========================================
// SET INPUT VALUE
// ========================================

function setInputValue(
    selector,
    value
) {

    const input =
        document.querySelector(
            selector
        );


    if (!input) {

        return;

    }


    input.value =
        String(
            value || ""
        );

}


// ========================================
// CHECKOUT ITEM
// ========================================

function renderCheckoutItem(
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
                    class="customer-checkout__item-image"
                    loading="lazy"
                >

            `

            : `

                <div
                    class="customer-checkout__item-image customer-checkout__item-image--empty"
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
            class="customer-checkout__item"
        >

            <div
                class="customer-checkout__item-media"
            >

                ${image}

            </div>


            <div
                class="customer-checkout__item-info"
            >

                <h3
                    class="customer-checkout__item-name"
                >
                    ${escapeHTML(
                        item.productName
                    )}
                </h3>


                ${
                    options.length

                        ? `

                            <div
                                class="customer-checkout__item-options"
                            >
                                ${options.join(
                                    " · "
                                )}
                            </div>

                        `

                        : ""
                }


                <div
                    class="customer-checkout__item-meta"
                >

                    <span>
                        Cantidad ${item.quantity}
                    </span>

                </div>

            </div>


            <strong
                class="customer-checkout__item-price"
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


    return `

        <div
            class="customer-checkout__total-row"
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
            class="customer-checkout__total-row customer-checkout__total-row--muted"
        >

            <span>
                Envío
            </span>

            <span>
                Se calculará después
            </span>

        </div>


        <div
            class="customer-checkout__total-divider"
        ></div>


        <div
            class="customer-checkout__total-row customer-checkout__total-row--grand"
        >

            <span>
                Total
            </span>

            <strong>
                ${formatCurrency(
                    subtotal
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

function initCheckoutEvents(
    customer
) {

    const checkout =
        document.querySelector(
            ".customer-checkout"
        );


    const form =
        document.querySelector(
            "#customer-checkout-form"
        );


    if (!checkout) {

        return;

    }


    checkout.addEventListener(
        "click",
        event => {

            const backButton =
                event.target.closest(
                    "[data-checkout-back]"
                );


            if (backButton) {

                navigateTo(
                    "/cart"
                );

            }

        }
    );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            await handleCheckoutSubmit(
                customer
            );

        }
    );

}


// ========================================
// HANDLE SUBMIT
// ========================================

async function handleCheckoutSubmit(
    customer
) {

    const form =
        document.querySelector(
            "#customer-checkout-form"
        );


    const submitButton =
        document.querySelector(
            "#customer-checkout-submit"
        );


    const errorElement =
        document.querySelector(
            "#customer-checkout-error"
        );


    if (!form) {

        return;

    }


    const formData =
        new FormData(
            form
        );


    const name =
        String(
            formData.get("name") ||
            ""
        ).trim();


    const phone =
        String(
            formData.get("phone") ||
            ""
        ).trim();


    const address = {

        line1:
            String(
                formData.get(
                    "addressLine1"
                ) ||
                ""
            ).trim(),

        line2:
            String(
                formData.get(
                    "addressLine2"
                ) ||
                ""
            ).trim(),

        city:
            String(
                formData.get(
                    "city"
                ) ||
                ""
            ).trim(),

        department:
            String(
                formData.get(
                    "department"
                ) ||
                ""
            ).trim(),

        country:
            String(
                formData.get(
                    "country"
                ) ||
                ""
            ).trim(),

        postalCode:
            String(
                formData.get(
                    "postalCode"
                ) ||
                ""
            ).trim()

    };


    clearCheckoutError();


    // ========================================
    // VALIDATION
    // ========================================

    if (!name) {

        showCheckoutError(
            "Ingresa tu nombre completo."
        );

        return;

    }


    if (!phone) {

        showCheckoutError(
            "Ingresa tu número de teléfono."
        );

        return;

    }


    if (!address.line1) {

        showCheckoutError(
            "Ingresa tu dirección."
        );

        return;

    }


    if (!address.city) {

        showCheckoutError(
            "Ingresa tu ciudad."
        );

        return;

    }


    if (!address.department) {

        showCheckoutError(
            "Ingresa tu departamento o estado."
        );

        return;

    }


    if (!address.country) {

        showCheckoutError(
            "Ingresa tu país."
        );

        return;

    }


    // ========================================
    // LOADING STATE
    // ========================================

    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "GUARDANDO...";

    }


    try {

        const updatedCustomer =
            await updateCustomerCheckoutData(
                customer.id,
                {

                    name,

                    phone,

                    address

                }
            );


        console.log(
            "✓ Datos de entrega guardados:",
            updatedCustomer.id
        );


        // ====================================
        // SIGUIENTE ETAPA
        // ====================================

        /*
            Todavía no navegamos a Payment.

            En esta etapa solamente confirmamos
            que los datos del Customer quedaron
            guardados correctamente.

            La siguiente fase conectará este punto
            con Payment.
        */

        if (submitButton) {

            submitButton.textContent =
                "DATOS GUARDADOS";

        }


    } catch (error) {

        console.error(
            "Error guardando datos de Checkout:",
            error
        );


        showCheckoutError(
            error.message ||
            "No pudimos guardar tus datos."
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "CONTINUAR AL PAGO";

        }

    }

}


// ========================================
// CHECKOUT ERROR
// ========================================

function showCheckoutError(
    message
) {

    const errorElement =
        document.querySelector(
            "#customer-checkout-error"
        );


    if (!errorElement) {

        return;

    }


    errorElement.textContent =
        message;


    errorElement.hidden =
        false;

}


// ========================================
// CLEAR ERROR
// ========================================

function clearCheckoutError() {

    const errorElement =
        document.querySelector(
            "#customer-checkout-error"
        );


    if (!errorElement) {

        return;

    }


    errorElement.textContent =
        "";


    errorElement.hidden =
        true;

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