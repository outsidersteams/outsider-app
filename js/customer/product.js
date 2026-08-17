import {
    getCustomerProductsCached,
    getCustomerProductAvailabilityCached
} from "../firebase/firestore.js";

import {
    CustomerShopNavigation
} from "../components/customerShopNavigation.js";

import {
    CustomerMenu
} from "../components/customerMenu.js";

import {
    CustomerFooter
} from "../components/customerFooter.js";


let currentProduct = null;

let selectedVariantId = null;

let selectedSizeId = null;

let currentProductAvailability =
    new Map();


// ========================================
// CUSTOMER PRODUCT
// ========================================

export function CustomerProduct() {

    return `
        <main class="customer-product">

            ${CustomerShopNavigation()}


            <section
                class="customer-product__content"
                id="customer-product-content"
            >

                <div class="customer-product__loading">

                    <i
                        class="fa-solid fa-spinner fa-spin"
                        aria-hidden="true"
                    ></i>

                    <span>
                        Cargando producto...
                    </span>

                </div>

            </section>


            ${CustomerFooter()}

            ${CustomerMenu()}

        </main>
    `;
}


// ========================================
// INIT
// ========================================

export async function initCustomerProduct() {

    const container =
        document.querySelector(
            "#customer-product-content"
        );

    if (!container) {
        return;
    }


    const productId =
        getProductIdFromUrl();


    if (!productId) {

        renderError(
            container,
            "No encontramos el producto."
        );

        return;
    }


    try {

        // ====================================
        // PRODUCTS
        // ====================================

        const products =
            await getCustomerProductsCached();


        const product =
            Array.isArray(products)

                ? products.find(
                    item =>
                        item &&
                        item.id === productId
                )

                : null;


        if (!product) {

            renderError(
                container,
                "El producto no existe."
            );

            return;
        }


        // ====================================
        // PUBLICATION
        // ====================================

        if (
            product.active === false ||
            product.publishedActive?.web !== true
        ) {

            renderError(
                container,
                "Este producto no está disponible."
            );

            return;
        }


        // ====================================
        // NORMALIZE PRODUCT
        // ====================================

        currentProduct =
            normalizeProduct(
                product
            );


        // ====================================
        // PUBLIC AVAILABILITY
        // ====================================
        //
        // Physical products use the lightweight
        // productAvailability projection.
        // Made-to-order products never query inventory
        // or availability.
        // ====================================

        currentProductAvailability =
            new Map();

        if (!isMadeToOrder()) {

            const navigationEntry =
                performance.getEntriesByType(
                    "navigation"
                )[0];

            // Una recarga completa o una restauración desde
            // historial puede conservar el estado anterior de
            // la SPA. En ambos casos pedimos la proyección pública
            // directamente al servidor para no mostrar una
            // disponibilidad obsoleta.
            const forceAvailabilityRefresh =
                navigationEntry?.type === "reload" ||
                navigationEntry?.type === "back_forward";

            const availabilityItems =
                await getCustomerProductAvailabilityCached(
                    productId,
                    {
                        forceRefresh:
                            forceAvailabilityRefresh
                    }
                );

            availabilityItems.forEach(
                item => {

                    if (
                        !item ||
                        item.available === undefined
                    ) {
                        return;
                    }

                    currentProductAvailability.set(
                        getAvailabilityKey(
                            item.variantId,
                            item.sizeId
                        ),
                        Boolean(
                            item.available
                        )
                    );

                }
            );

        }


        // ====================================
        // INITIAL SELECTION
        // ====================================

        const firstVariant =
            currentProduct.variants[0] ||
            null;


        selectedVariantId =
            firstVariant?.id ||
            null;


        const firstAvailableSize =
            getFirstSelectableSize(
                firstVariant
            );


        selectedSizeId =
            firstAvailableSize?.id ||
            null;


        // ====================================
        // RENDER
        // ====================================

        renderProduct(
            container
        );


        // ====================================
        // INIT
        // ====================================

        initGallery();

        initProductOptions();

        initProductMenu();
        updateCartCount();


    } catch (error) {

        console.error(
            "Error cargando Product Detail:",
            error
        );


        renderError(
            container,
            "No pudimos cargar el producto."
        );

    }

}


// ========================================
// URL
// ========================================

function getProductIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params
            .get("product") ||
        ""
    ).trim();

}


// ========================================
// NORMALIZE PRODUCT
// ========================================

function normalizeProduct(
    product
) {

    const variants =
        Array.isArray(
            product.variants
        )

            ? product.variants.filter(
                variant =>
                    variant &&
                    variant.active !== false
            )

            : [];


    const images =
        Array.isArray(
            product.images
        )

            ? product.images
                .map(
                    image =>
                        getImageUrl(image)
                )
                .filter(Boolean)

            : [];


    return {

        ...product,

        variants,

        images

    };

}


// ========================================
// RENDER PRODUCT
// ========================================

function renderProduct(
    container
) {

    const images =
        getProductImages();


    const firstImage =
        images[0] ||
        "";


    const selectedVariant =
        getSelectedVariant();


    const selectedSize =
        getSelectedSize();


    const price =
        getSizePrice(
            selectedSize
        );


    container.innerHTML = `

        <div
            class="customer-product__layout"
        >


            <!-- =================================
                 GALLERY
                 ================================= -->

            <section
                class="customer-product__gallery"
                aria-label="Imágenes del producto"
            >

                <div
                    class="customer-product__gallery-main"
                >

                    ${
                        firstImage

                            ? `

                                <img
                                    id="customer-product-main-image"
                                    src="${escapeAttribute(
                                        firstImage
                                    )}"
                                    alt="${escapeAttribute(
                                        currentProduct.name ||
                                        "Producto"
                                    )}"
                                >

                            `

                            : `

                                <div
                                    class="customer-product__image-placeholder"
                                >

                                    <i
                                        class="fa-regular fa-image"
                                        aria-hidden="true"
                                    ></i>

                                </div>

                            `
                    }

                </div>


                ${
                    images.length > 1

                        ? `

                            <div
                                class="customer-product__thumbnails"
                            >

                                ${images
                                    .map(
                                        (
                                            image,
                                            index
                                        ) => `

                                            <button
                                                type="button"
                                                class="
                                                    customer-product__thumbnail
                                                    ${
                                                        index === 0
                                                            ? "is-active"
                                                            : ""
                                                    }
                                                "
                                                data-product-image="${escapeAttribute(
                                                    image
                                                )}"
                                                aria-label="Ver imagen ${
                                                    index + 1
                                                }"
                                            >

                                                <img
                                                    src="${escapeAttribute(
                                                        image
                                                    )}"
                                                    alt=""
                                                    loading="lazy"
                                                >

                                            </button>

                                        `
                                    )
                                    .join("")}

                            </div>

                        `

                        : ""
                }

            </section>


            <!-- =================================
                 INFORMATION
                 ================================= -->

            <section
                class="customer-product__information"
            >

                <div
                    class="customer-product__heading"
                >

                    <span
                        class="customer-product__category"
                    >
                        ${escapeHTML(
                            getCategoryLabel()
                        )}
                    </span>


                    <h1
                        class="customer-product__name"
                    >
                        ${escapeHTML(
                            currentProduct.name ||
                            "Producto"
                        )}
                    </h1>


                    <div
                        class="customer-product__price"
                        id="customer-product-price"
                    >
                        ${
                            price !== null
                                ? formatCurrency(price)
                                : "Consultar"
                        }
                    </div>

                </div>


                ${
                    currentProduct.description

                        ? `

                            <div
                                class="customer-product__description"
                            >
                                ${escapeHTML(
                                    currentProduct.description
                                )}
                            </div>

                        `

                        : ""
                }


                ${renderVariants()}


                ${renderSizes()}


                <div
                    class="customer-product__purchase"
                >

                    <button
                        type="button"
                        class="customer-product__add-button"
                        id="customer-product-add-button"
                        ${
                            isCurrentSelectionAvailable()
                                ? ""
                                : "disabled"
                        }
                    >

                        <span>
                            ${
                                isCurrentSelectionAvailable()
                                    ? "Agregar al carrito"
                                    : "SOLD OUT"
                            }
                        </span>

                        <i
                            class="fa-solid fa-bag-shopping"
                            aria-hidden="true"
                        ></i>

                    </button>

                </div>

            </section>

        </div>

    `;

}


// ========================================
// FULFILLMENT
// ========================================

function isMadeToOrder() {

    return (
        currentProduct?.fulfillment?.type ===
        "made_to_order"
    );

}


// ========================================
// VARIANTS
// ========================================

function renderVariants() {

    const variants =
        currentProduct.variants;


    if (!variants.length) {
        return "";
    }


    if (variants.length === 1) {
        return "";
    }


    return `

        <div
            class="customer-product__option"
        >

            <div
                class="customer-product__option-header"
            >

                <span>
                    Variante
                </span>

            </div>


            <div
                class="customer-product__variants"
            >

                ${variants
                    .map(
                        variant => `

                            <button
                                type="button"
                                class="
                                    customer-product__variant
                                    ${
                                        String(
                                            variant.id
                                        ) ===
                                        String(
                                            selectedVariantId
                                        )
                                            ? "is-active"
                                            : ""
                                    }
                                "
                                data-variant-id="${escapeAttribute(
                                    variant.id
                                )}"
                            >

                                ${
                                    escapeHTML(
                                        variant.name ||
                                        variant.color ||
                                        variant.colorName ||
                                        variant.id ||
                                        "Variante"
                                    )
                                }

                            </button>

                        `
                    )
                    .join("")}

            </div>

        </div>

    `;

}


// ========================================
// SIZES
// ========================================

function renderSizes() {

    const variant =
        getSelectedVariant();


    const sizes =
        getActiveSizes(
            variant
        );


    if (!sizes.length) {
        return "";
    }


    return `

        <div
            class="customer-product__option"
        >

            <div
                class="customer-product__option-header"
            >

                <span>
                    Talla
                </span>

            </div>


            <div
                class="customer-product__sizes"
            >

                ${sizes
                    .map(
                        size => {

                            const available =
                                isSizeAvailable(
                                    variant,
                                    size
                                );


                            const selected =
                                String(
                                    size.id
                                ) ===
                                String(
                                    selectedSizeId
                                );


                            return `

                                <button
                                    type="button"
                                    class="
                                        customer-product__size
                                        ${
                                            selected
                                                ? "is-active"
                                                : ""
                                        }
                                        ${
                                            available
                                                ? ""
                                                : "is-sold-out"
                                        }
                                    "
                                    data-size-id="${escapeAttribute(
                                        size.id
                                    )}"
                                    ${
                                        available
                                            ? ""
                                            : "disabled"
                                    }
                                    ${
                                        available
                                            ? ""
                                            : 'aria-label="SOLD OUT"'
                                    }
                                >

                                    <span>
                                        ${escapeHTML(
                                            size.name ||
                                            size.id
                                        )}
                                    </span>

                                    ${
                                        available
                                            ? ""
                                            : `
                                                <small>
                                                    SOLD OUT
                                                </small>
                                            `
                                    }

                                </button>

                            `;

                        }
                    )
                    .join("")}

            </div>

        </div>

    `;

}


// ========================================
// AVAILABILITY
// ========================================

function isSizeAvailable(
    variant,
    size
) {

    if (!variant || !size) {
        return false;
    }


    // ====================================
    // MADE TO ORDER
    // ====================================

    // Los productos made_to_order nunca
    // dependen de inventory.
    if (isMadeToOrder()) {

        return (
            variant.active !== false &&
            size.active !== false
        );

    }


    // ====================================
    // PHYSICAL
    // ====================================

    if (
        variant.active === false ||
        size.active === false
    ) {
        return false;
    }


    // `productAvailability` es la proyección pública
    // de inventory. El stock real permanece protegido.
    const availabilityKey =
        getAvailabilityKey(
            variant.id,
            size.id
        );


    if (
        currentProductAvailability.has(
            availabilityKey
        )
    ) {

        return (
            currentProductAvailability.get(
                availabilityKey
            ) === true
        );

    }


    // Compatibilidad temporal con productos existentes que
    // todavía no tengan documento en productAvailability.
    //
    // La fuente pública principal es productAvailability.
    // Este fallback solo conserva compatibilidad con datos
    // antiguos y no expone el stock real.
    return size.available === true;

}


// ========================================
// AVAILABILITY KEY
// ========================================

function getAvailabilityKey(
    variantId,
    sizeId
) {

    return (
        String(variantId ?? "") +
        "::" +
        String(sizeId ?? "")
    );

}


// ========================================
// CURRENT VARIANT
// =======================================

function getSelectedVariant() {

    return (
        currentProduct?.variants?.find(
            variant =>
                String(
                    variant.id
                ) ===
                String(
                    selectedVariantId
                )
        )

        ||

        currentProduct?.variants?.[0]

        ||

        null
    );

}


// ========================================
// CURRENT SIZE
// ========================================

function getSelectedSize() {

    const variant =
        getSelectedVariant();


    if (!variant) {
        return null;
    }


    const sizes =
        getActiveSizes(
            variant
        );


    return (
        sizes.find(
            size =>
                String(
                    size.id
                ) ===
                String(
                    selectedSizeId
                )
        )

        ||

        getFirstSelectableSize(
            variant
        )

        ||

        null
    );

}


// ========================================
// FIRST SELECTABLE SIZE
// ========================================

function getFirstSelectableSize(
    variant
) {

    const sizes =
        getActiveSizes(
            variant
        );


    return (
        sizes.find(
            size =>
                isSizeAvailable(
                    variant,
                    size
                )
        )

        ||

        null
    );

}


// ========================================
// ACTIVE SIZES
// ========================================

function getActiveSizes(
    variant
) {

    if (
        !variant ||
        !Array.isArray(
            variant.sizes
        )
    ) {

        return [];

    }


    return variant.sizes.filter(
        size =>
            size &&
            size.active !== false
    );

}


// ========================================
// PRICE
// ========================================

function getSizePrice(
    size
) {

    if (!size) {
        return null;
    }


    const price =
        Number(
            size.price
        );


    return Number.isFinite(
        price
    )
        ? price
        : null;

}


// ========================================
// CURRENT AVAILABILITY
// ========================================

function isCurrentSelectionAvailable() {

    const variant =
        getSelectedVariant();


    const size =
        getSelectedSize();


    if (!variant || !size) {
        return false;
    }


    return isSizeAvailable(
        variant,
        size
    );

}


// ========================================
// PRODUCT OPTIONS
// ========================================

function initProductOptions() {

    const container =
        document.querySelector(
            "#customer-product-content"
        );


    if (!container) {
        return;
    }


    // ====================================
    // VARIANT
    // ====================================

    container.addEventListener(
        "click",
        event => {

            const variantButton =
                event.target.closest(
                    "[data-variant-id]"
                );


            if (variantButton) {

                const variantId =
                    variantButton.dataset.variantId;


                if (!variantId) {
                    return;
                }


                selectVariant(
                    variantId
                );


                return;
            }


            // =================================
            // SIZE
            // =================================

            const sizeButton =
                event.target.closest(
                    "[data-size-id]"
                );


            if (sizeButton) {

                if (
                    sizeButton.disabled
                ) {

                    return;

                }


                const sizeId =
                    sizeButton.dataset.sizeId;


                if (!sizeId) {
                    return;
                }


                selectedSizeId =
                    sizeId;


                updateProductOptions();

            }

        }
    );


    // ====================================
    // ADD TO CART
    // ====================================

    container.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#customer-product-add-button"
                );


            if (!button) {
                return;
            }


            if (
                button.disabled ||
                !isCurrentSelectionAvailable()
            ) {

                return;

            }


            addCurrentProductToCart();

        }
    );

}


// ========================================
// SELECT VARIANT
// ========================================

function selectVariant(
    variantId
) {

    const variant =
        currentProduct.variants.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    variantId
                )
        );


    if (!variant) {
        return;
    }


    selectedVariantId =
        variant.id;


    const firstAvailableSize =
        getFirstSelectableSize(
            variant
        );


    selectedSizeId =
        firstAvailableSize?.id ||
        null;


    updateProductOptions();

}


// ========================================
// UPDATE OPTIONS
// ========================================

function updateProductOptions() {

    updateProductGallery();


    const container =
        document.querySelector(
            "#customer-product-content"
        );


    if (!container) {
        return;
    }


    const variant =
        getSelectedVariant();


    const size =
        getSelectedSize();


    // ====================================
    // VARIANTS
    // ====================================

    container
        .querySelectorAll(
            "[data-variant-id]"
        )
        .forEach(
            button => {

                const active =
                    String(
                        button.dataset.variantId
                    ) ===
                    String(
                        variant?.id
                    );


                button.classList.toggle(
                    "is-active",
                    active
                );

            }
        );


    // ====================================
    // SIZES
    // ====================================

    const sizeButtons =
        container.querySelectorAll(
            "[data-size-id]"
        );


    sizeButtons.forEach(
        button => {

            const sizeId =
                button.dataset.sizeId;


            const currentSize =
                getActiveSizes(
                    variant
                ).find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            sizeId
                        )
                );


            const available =
                currentSize
                    ? isSizeAvailable(
                        variant,
                        currentSize
                    )
                    : false;


            const selected =
                String(
                    sizeId
                ) ===
                String(
                    selectedSizeId
                );


            button.disabled =
                !available;


            button.classList.toggle(
                "is-active",
                selected &&
                available
            );


            button.classList.toggle(
                "is-sold-out",
                !available
            );


            const label =
                button.querySelector(
                    "span"
                );


            if (label && currentSize) {

                label.textContent =
                    currentSize.name ||
                    currentSize.id;

            }

        }
    );


    // ====================================
    // PRICE
    // ====================================

    const priceElement =
        container.querySelector(
            "#customer-product-price"
        );


    if (priceElement) {

        const price =
            getSizePrice(
                size
            );


        priceElement.textContent =
            price !== null
                ? formatCurrency(price)
                : "Consultar";

    }


    // ====================================
    // PURCHASE BUTTON
    // ====================================

    updatePurchaseButton();

}


// ========================================
// PURCHASE BUTTON
// ========================================

function updatePurchaseButton() {

    const button =
        document.querySelector(
            "#customer-product-add-button"
        );


    if (!button) {
        return;
    }


    const available =
        isCurrentSelectionAvailable();


    button.disabled =
        !available;


    button.classList.toggle(
        "is-disabled",
        !available
    );


    const text =
        button.querySelector(
            "span"
        );


    if (text) {

        text.textContent =
            available
                ? "Agregar al carrito"
                : "SOLD OUT";

    }

}


// ========================================
// ADD TO CART
// ========================================

function addCurrentProductToCart() {

    const variant =
        getSelectedVariant();


    const size =
        getSelectedSize();


    if (
        !variant ||
        !size ||
        !isCurrentSelectionAvailable()
    ) {

        return;

    }


    const price =
        getSizePrice(
            size
        );


    if (price === null) {

        console.warn(
            "No se puede agregar el producto sin precio."
        );

        return;

    }


    const cartItem = {

    productId:
        currentProduct.id,

    productName:
        currentProduct.name ||
        "Producto",

    image:
        getProductImages()[0] ||
        "",

    variantId:
        variant.id ||
        null,

    variantName:
        variant.name ||
        variant.color ||
        variant.colorName ||
        variant.id ||
        null,

    sizeId:
        size.id ||
        null,

    sizeName:
        size.name ||
        size.id ||
        null,

    sku:
        size.sku ||
        null,

    price,

    quantity:
        1,

    fulfillmentType:
        currentProduct?.fulfillment?.type ||
        "physical"

};


    let cart = [];


    try {

        const storedCart =
            localStorage.getItem(
                "customerCart"
            );


        cart =
            storedCart
                ? JSON.parse(
                    storedCart
                )
                : [];

    } catch (error) {

        console.warn(
            "No se pudo leer el carrito:",
            error
        );

        cart = [];

    }


    if (!Array.isArray(cart)) {
        cart = [];
    }


    const existingIndex =
        cart.findIndex(
            item =>

                String(
                    item.productId
                ) ===
                String(
                    cartItem.productId
                )

                &&

                String(
                    item.variantId
                ) ===
                String(
                    cartItem.variantId
                )

                &&

                String(
                    item.sizeId
                ) ===
                String(
                    cartItem.sizeId
                )
        );


    if (existingIndex >= 0) {

        cart[existingIndex].quantity =
            Math.max(
                1,
                Number(
                    cart[existingIndex].quantity ||
                    1
                )
            ) + 1;

    } else {

        cart.push(
            cartItem
        );

    }


 localStorage.setItem(
    "customerCart",
    JSON.stringify(
        cart
    )
);


updateCartCount(
    true
);


console.log(
    "✓ Producto agregado al carrito:",
    cartItem
);

}
// ========================================
// CART COUNT
// ========================================

function getCartItemCount() {

    try {

        const storedCart =
            localStorage.getItem(
                "customerCart"
            );

        const cart =
            storedCart
                ? JSON.parse(storedCart)
                : [];

        if (!Array.isArray(cart)) {
            return 0;
        }

        return cart.reduce(
            (total, item) => {

                const quantity =
                    Number(
                        item?.quantity || 0
                    );

                return (
                    total +
                    (
                        Number.isFinite(quantity)
                            ? quantity
                            : 0
                    )
                );

            },
            0
        );

    } catch (error) {

        console.warn(
            "No se pudo calcular el contador del carrito:",
            error
        );

        return 0;

    }

}


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount(
    animate = false
) {

    const countElement =
        document.querySelector(
            "[data-cart-count]"
        );

    if (!countElement) {
        return;
    }

    const count =
        getCartItemCount();


    countElement.textContent =
        String(count);


    countElement.hidden =
        count <= 0;


    if (
        animate &&
        count > 0
    ) {

        countElement.classList.remove(
            "is-bumping"
        );

        // Fuerza reinicio de la animación
        void countElement.offsetWidth;

        countElement.classList.add(
            "is-bumping"
        );

    }

}


// ========================================
// GALLERY INTERACTION
// ========================================

function initGallery() {

    const container =
        document.querySelector(
            "#customer-product-content"
        );


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-product-image]"
                );


            if (!button) {
                return;
            }


            const image =
                button.dataset.productImage;


            if (!image) {
                return;
            }


            const mainImage =
                container.querySelector(
                    "#customer-product-main-image"
                );


            if (!mainImage) {
                return;
            }


            mainImage.src = image;


            container
                .querySelectorAll(
                    ".customer-product__thumbnail"
                )
                .forEach(
                    thumbnail =>
                        thumbnail.classList.remove(
                            "is-active"
                        )
                );


            button.classList.add(
                "is-active"
            );

        }
    );

}


// ========================================
// UPDATE GALLERY BY VARIANT
// ========================================

function updateProductGallery() {

    const container =
        document.querySelector(
            "#customer-product-content"
        );


    if (!container) {
        return;
    }


    const gallery =
        container.querySelector(
            ".customer-product__gallery"
        );


    if (!gallery) {
        return;
    }


    const images =
        getProductImages();


    const firstImage =
        images[0] ||
        "";


    const main =
        gallery.querySelector(
            ".customer-product__gallery-main"
        );


    if (!main) {
        return;
    }


    if (firstImage) {

        main.innerHTML = `

            <img
                id="customer-product-main-image"
                src="${escapeAttribute(firstImage)}"
                alt="${escapeAttribute(
                    currentProduct?.name ||
                    "Producto"
                )}"
            >

        `;

    } else {

        main.innerHTML = `

            <div
                class="customer-product__image-placeholder"
            >

                <i
                    class="fa-regular fa-image"
                    aria-hidden="true"
                ></i>

            </div>

        `;

    }


    let thumbnails =
        gallery.querySelector(
            ".customer-product__thumbnails"
        );


    if (images.length > 1) {

        const html = images
            .map(
                (image, index) => `

                    <button
                        type="button"
                        class="
                            customer-product__thumbnail
                            ${
                                index === 0
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-product-image="${escapeAttribute(image)}"
                        aria-label="Ver imagen ${index + 1}"
                    >

                        <img
                            src="${escapeAttribute(image)}"
                            alt=""
                            loading="lazy"
                        >

                    </button>

                `
            )
            .join("");


        if (!thumbnails) {

            thumbnails =
                document.createElement(
                    "div"
                );

            thumbnails.className =
                "customer-product__thumbnails";

            gallery.appendChild(
                thumbnails
            );

        }


        thumbnails.innerHTML =
            html;

        thumbnails.hidden = false;

    } else if (thumbnails) {

        thumbnails.innerHTML = "";
        thumbnails.hidden = true;

    }

}


// ========================================
// MENU
// ========================================

function initProductMenu() {

    const menu =
        document.querySelector(
            "#customer-menu"
        );


    const menuButton =
        document.querySelector(
            ".customer-shop-navigation__menu"
        );


    const closeButton =
        document.querySelector(
            "#customer-menu-close"
        );


    if (
        !menu ||
        !menuButton ||
        !closeButton
    ) {
        return;
    }


    const openMenu = () => {

        menu.classList.add(
            "is-open"
        );

        menu.setAttribute(
            "aria-hidden",
            "false"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "customer-menu-open"
        );


        requestAnimationFrame(
            () => {

                closeButton.focus();

            }
        );

    };


    const closeMenu = () => {

        menuButton.focus();


        menu.classList.remove(
            "is-open"
        );


        menu.setAttribute(
            "aria-hidden",
            "true"
        );


        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        document.body.classList.remove(
            "customer-menu-open"
        );

    };


    menuButton.addEventListener(
        "click",
        openMenu
    );


    closeButton.addEventListener(
        "click",
        closeMenu
    );


    menu.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a"
                );


            if (!link) {
                return;
            }


            closeMenu();

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                menu.classList.contains(
                    "is-open"
                )
            ) {

                closeMenu();

            }

        }
    );

}


// ========================================
// PRODUCT IMAGES
// ========================================

function getProductImages() {

    const variant =
        getSelectedVariant();


    const variantImages =
        Array.isArray(
            variant?.images
        )
            ? variant.images
                .map(
                    image =>
                        getImageUrl(image)
                )
                .filter(Boolean)
            : [];


    if (variantImages.length) {

        return [
            ...new Set(
                variantImages
            )
        ];

    }


    const productImages =
        Array.isArray(
            currentProduct?.images
        )
            ? currentProduct.images
            : [];


    return [
        ...new Set(
            productImages
                .filter(Boolean)
        )
    ];

}


// ========================================
// CATEGORY
// ========================================

function getCategoryLabel() {

    const category =
        currentProduct.categoryId;


    const labels = {

        tee:
            "T-Shirts",

        hoodies:
            "Hoodies",

        pants:
            "Pants",

        caps:
            "Caps"

    };


    return (
        labels[category] ||
        category ||
        "Outsider"
    );

}


// ========================================
// IMAGE URL
// ========================================

function getImageUrl(
    value
) {

    if (!value) {
        return "";
    }


    if (
        typeof value ===
        "string"
    ) {

        return value.trim();

    }


    if (
        typeof value ===
        "object"
    ) {

        return String(
            value.url ||
            value.src ||
            value.fileUrl ||
            ""
        ).trim();

    }


    return "";

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
            style: "currency",
            currency: "GTQ",
            maximumFractionDigits: 2
        }
    ).format(
        Number(value)
    );

}


// ========================================
// ERROR
// ========================================

function renderError(
    container,
    message
) {

    container.innerHTML = `

        <div
            class="customer-product__error"
        >

            <i
                class="fa-solid fa-circle-exclamation"
                aria-hidden="true"
            ></i>

            <h2>
                ${escapeHTML(
                    message
                )}
            </h2>

            <a
                href="/shop"
                data-spa-link
            >
                Volver a Shop
            </a>

        </div>

    `;

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


// ========================================
// ATTRIBUTE ESCAPE
// ========================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}