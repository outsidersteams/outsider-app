// ========================================
// OUTSIDER — CUSTOMER CART
// ========================================

const CART_STORAGE_KEY = "customerCart";

let cartItems = [];


// ========================================
// CUSTOMER CART
// ========================================

export function CustomerCart() {

    return `
        <main class="customer-cart">

            <header class="customer-cart__header">

                <div class="customer-cart__header-inner">

                    <button
                        type="button"
                        class="customer-cart__back"
                        data-cart-back
                        aria-label="Volver a Shop"
                    >
                        <i
                            class="fa-solid fa-arrow-left"
                            aria-hidden="true"
                        ></i>
                    </button>


                    <h1 class="customer-cart__title">
                        Cart
                    </h1>

                </div>

            </header>


            <section
                class="customer-cart__content"
                aria-label="Carrito de compras"
            >

                <div
                    class="customer-cart__items"
                    id="customer-cart-items"
                >
                    <div class="customer-cart__loading">
                        Cargando...
                    </div>
                </div>


                <aside
                    class="customer-cart__summary"
                    id="customer-cart-summary"
                >
                    ${renderSummary()}
                </aside>

            </section>

        </main>
    `;
}


// ========================================
// INIT CART
// ========================================

export function initCustomerCart() {

    const cart =
        document.querySelector(
            ".customer-cart"
        );

    if (!cart) return;


    loadCart();


    renderCart();


    initCartEvents();

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

            cartItems = [];

            return;
        }


        const parsedCart =
            JSON.parse(
                storedCart
            );


        cartItems =
            normalizeCart(
                parsedCart
            );

    } catch (error) {

        console.error(
            "Error leyendo carrito:",
            error
        );


        cartItems = [];

    }

}


// ========================================
// NORMALIZE CART
// ========================================

function normalizeCart(items) {

    if (!Array.isArray(items)) {
        return [];
    }


    return items
        .filter(item =>
            item &&
            item.productId
        )
        .map(item => ({

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

        }));

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    const itemsContainer =
        document.querySelector(
            "#customer-cart-items"
        );

    const summaryContainer =
        document.querySelector(
            "#customer-cart-summary"
        );


    if (
        !itemsContainer ||
        !summaryContainer
    ) {
        return;
    }


    if (!cartItems.length) {

        itemsContainer.innerHTML =
            renderEmptyCart();


        summaryContainer.innerHTML =
            renderSummary();


        return;
    }


    itemsContainer.innerHTML =
        cartItems
            .map(
                (item, index) =>
                    renderCartItem(
                        item,
                        index
                    )
            )
            .join("");


    summaryContainer.innerHTML =
        renderSummary();

}


// ========================================
// CART ITEM
// ========================================

function renderCartItem(
    item,
    index
) {

    const image =
        item.image
            ? `
                <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.productName)}"
                    class="customer-cart__item-image"
                    loading="lazy"
                >
            `
            : `
                <div
                    class="customer-cart__item-image customer-cart__item-image--empty"
                    aria-hidden="true"
                >
                    <i
                        class="fa-regular fa-image"
                    ></i>
                </div>
            `;


    const variant =
        item.variantName
            ? `
                <span class="customer-cart__item-option">
                    ${escapeHTML(item.variantName)}
                </span>
            `
            : "";


    const size =
        item.sizeName
            ? `
                <span class="customer-cart__item-option">
                    Talla ${escapeHTML(item.sizeName)}
                </span>
            `
            : "";


    return `
        <article
            class="customer-cart__item"
            data-cart-index="${index}"
        >

            <div class="customer-cart__item-media">
                ${image}
            </div>


            <div class="customer-cart__item-info">

                <div class="customer-cart__item-main">

                    <h2 class="customer-cart__item-name">
                        ${escapeHTML(item.productName)}
                    </h2>


                    <div class="customer-cart__item-options">

                        ${variant}

                        ${size}

                    </div>

                </div>


                <div class="customer-cart__item-bottom">

                    <div
                        class="customer-cart__quantity"
                        aria-label="Cantidad"
                    >

                        <button
                            type="button"
                            class="customer-cart__quantity-button"
                            data-cart-decrease
                            data-cart-index="${index}"
                            aria-label="Disminuir cantidad"
                        >
                            <i
                                class="fa-solid fa-minus"
                                aria-hidden="true"
                            ></i>
                        </button>


                        <span
                            class="customer-cart__quantity-value"
                            aria-live="polite"
                        >
                            ${item.quantity}
                        </span>


                        <button
                            type="button"
                            class="customer-cart__quantity-button"
                            data-cart-increase
                            data-cart-index="${index}"
                            aria-label="Aumentar cantidad"
                        >
                            <i
                                class="fa-solid fa-plus"
                                aria-hidden="true"
                            ></i>
                        </button>

                    </div>


                    <button
                        type="button"
                        class="customer-cart__remove"
                        data-cart-remove
                        data-cart-index="${index}"
                    >
                        Eliminar
                    </button>

                </div>

            </div>


            <div class="customer-cart__item-price">

                ${formatCurrency(
                    item.price *
                    item.quantity
                )}

            </div>

        </article>
    `;
}


// ========================================
// EMPTY CART
// ========================================

function renderEmptyCart() {

    return `
        <div class="customer-cart__empty">

            <div class="customer-cart__empty-icon">
                <i
                    class="fa-solid fa-bag-shopping"
                    aria-hidden="true"
                ></i>
            </div>


            <h2 class="customer-cart__empty-title">
                Tu carrito está vacío
            </h2>


            <p class="customer-cart__empty-text">
                Descubre nuestros productos y
                encuentra tu próximo favorito.
            </p>


            <button
                type="button"
                class="customer-cart__continue-button"
                data-cart-shop
            >
                Ver Shop
            </button>

        </div>
    `;
}


// ========================================
// SUMMARY
// ========================================

function renderSummary() {

    const subtotal =
        getSubtotal();


    return `
        <div class="customer-cart__summary-inner">

            <div class="customer-cart__summary-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatCurrency(subtotal)}
                </strong>

            </div>


            <p class="customer-cart__summary-note">
                Impuestos y envío se calcularán
                durante el checkout.
            </p>


            <button
                type="button"
                class="customer-cart__checkout"
                data-cart-checkout
                ${cartItems.length
                    ? ""
                    : "disabled"
                }
            >
                Continuar al checkout
            </button>


            <button
                type="button"
                class="customer-cart__continue"
                data-cart-shop
            >
                Continuar comprando
            </button>

        </div>
    `;
}


// ========================================
// SUBTOTAL
// ========================================

function getSubtotal() {

    return cartItems.reduce(
        (
            total,
            item
        ) => {

            return total +
                (
                    item.price *
                    item.quantity
                );

        },
        0
    );

}


// ========================================
// EVENTS
// ========================================

function initCartEvents() {

    const cart =
        document.querySelector(
            ".customer-cart"
        );

    if (!cart) return;


    cart.addEventListener(
        "click",
        event => {

            const increase =
                event.target.closest(
                    "[data-cart-increase]"
                );

            if (increase) {

                changeQuantity(
                    Number(
                        increase.dataset.cartIndex
                    ),
                    1
                );

                return;
            }


            const decrease =
                event.target.closest(
                    "[data-cart-decrease]"
                );

            if (decrease) {

                changeQuantity(
                    Number(
                        decrease.dataset.cartIndex
                    ),
                    -1
                );

                return;
            }


            const remove =
                event.target.closest(
                    "[data-cart-remove]"
                );

            if (remove) {

                removeItem(
                    Number(
                        remove.dataset.cartIndex
                    )
                );

                return;
            }


            const shopButton =
                event.target.closest(
                    "[data-cart-shop]"
                );

            if (shopButton) {

                navigateTo(
                    "/shop"
                );

                return;
            }


            const backButton =
                event.target.closest(
                    "[data-cart-back]"
                );

            if (backButton) {

                navigateTo(
                    "/shop"
                );

                return;
            }


            const checkoutButton =
                event.target.closest(
                    "[data-cart-checkout]"
                );

            if (
                checkoutButton &&
                !checkoutButton.disabled
            ) {

                navigateTo(
                    "/checkout"
                );

            }

        }
    );

}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQuantity(
    index,
    amount
) {

    if (
        !Number.isInteger(index) ||
        !cartItems[index]
    ) {
        return;
    }


    const currentQuantity =
        cartItems[index].quantity;


    const nextQuantity =
        currentQuantity +
        amount;


    if (nextQuantity <= 0) {

        removeItem(index);

        return;
    }


    cartItems[index].quantity =
        nextQuantity;


    saveCart();


    renderCart();

}


// ========================================
// REMOVE ITEM
// ========================================

function removeItem(index) {

    if (
        !Number.isInteger(index) ||
        !cartItems[index]
    ) {
        return;
    }


    cartItems.splice(
        index,
        1
    );


    saveCart();


    renderCart();

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(
                cartItems
            )
        );

    } catch (error) {

        console.error(
            "Error guardando carrito:",
            error
        );

    }

}


// ========================================
// NAVIGATION
// ========================================

function navigateTo(path) {

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

function normalizePrice(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


// ========================================
// QUANTITY
// ========================================

function normalizeQuantity(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        return 1;

    }


    return Math.max(
        1,
        Math.floor(number)
    );

}


// ========================================
// CURRENCY
// ========================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "es-GT",
        {
            style: "currency",
            currency: "GTQ",
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(value) {

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