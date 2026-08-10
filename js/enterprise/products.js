import {
    EnterpriseLayout,
    initEnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getProducts,
    getCategories
} from "../firebase/firestore.js";


// ========================================
// STATE
// ========================================

let products = [];
let categories = [];
let filteredProducts = [];
let currentEnterpriseProfile = null;


// ========================================
// ENTERPRISE PRODUCTS
// ========================================

export function EnterpriseProducts(
    profile
) {

    const content = `

        <section
            class="enterprise-products"
        >

            <!-- ========================================
                 HEADER
            ======================================== -->

            <div
                class="enterprise-products__header"
            >

                <div>

                    <span
                        class="enterprise-products__eyebrow"
                    >
                        Enterprise
                    </span>

                    <h1
                        class="enterprise-products__title"
                    >
                        Productos
                    </h1>

                    <p
                        class="enterprise-products__description"
                    >
                        Gestiona y consulta los productos
                        de Outsider.
                    </p>

                </div>


                ${
                    profile?.role === "admin"
                        ? `
                            <button
                                type="button"
                                class="
                                    enterprise-products__add-button
                                "
                                id="enterprise-products-add"
                            >

                                <i
                                    class="fa-solid fa-plus"
                                ></i>

                                <span>
                                    Producto
                                </span>

                            </button>
                        `
                        : ""
                }

            </div>


            <!-- ========================================
                 FILTERS
            ======================================== -->

            <div
                class="enterprise-products__filters"
            >

                <div
                    class="enterprise-products__search"
                >

                    <i
                        class="
                            fa-solid
                            fa-magnifying-glass
                        "
                    ></i>

                    <input
                        type="search"
                        id="enterprise-products-search"
                        placeholder="Buscar producto..."
                        autocomplete="off"
                    />

                </div>


                <select
                    id="enterprise-products-category"
                    class="
                        enterprise-products__filter
                    "
                >

                    <option value="">
                        Todas las categorías
                    </option>

                </select>


                <select
                    id="enterprise-products-status"
                    class="
                        enterprise-products__filter
                    "
                >

                    <option value="">
                        Todos los estados
                    </option>

                    <option value="active">
                        Activos
                    </option>

                    <option value="inactive">
                        Inactivos
                    </option>

                </select>

            </div>


            <!-- ========================================
                 PRODUCTS
            ======================================== -->

            <div
                id="enterprise-products-grid"
                class="
                    enterprise-products__grid
                "
            >

                <div
                    class="
                        enterprise-products__loading
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        "
                    ></i>

                    <span>
                        Cargando productos...
                    </span>

                </div>

            </div>

        </section>

    `;


    return EnterpriseLayout(
        content,
        profile
    );

}


// ========================================
// INIT PRODUCTS
// ========================================

export async function initEnterpriseProducts(
    profile
) {

    currentEnterpriseProfile =
        profile;

    // ========================================
    // ENTERPRISE LAYOUT
    // ========================================

    initEnterpriseLayout();

    // ========================================
    // PRODUCT DETAIL ROUTE
    // ========================================

    const productId =
        new URLSearchParams(
            window.location.search
        ).get("product");

    if (productId) {
        renderProductDetail(
            productId,
            profile
        );
        return;
    }


    const grid =
        document.querySelector(
            "#enterprise-products-grid"
        );


    if (!grid) {

        console.error(
            "No se encontró #enterprise-products-grid"
        );

        return;

    }


    try {

        const [
            productsData,
            categoriesData
        ] = await Promise.all([

            getProducts(),

            getCategories()

        ]);


        products =
            Array.isArray(
                productsData
            )
                ? productsData
                : [];


        categories =
            Array.isArray(
                categoriesData
            )
                ? categoriesData
                : [];


        filteredProducts =
            [
                ...products
            ];


        renderCategoryFilter();

        renderProducts();

        initProductEvents();

        initAdminButton(
            profile
        );

    }

    catch (error) {

        console.error(
            "Error cargando Products:",
            error
        );


        grid.innerHTML = `

            <div
                class="
                    enterprise-products__error
                "
            >

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    "
                ></i>

                <h3>
                    No se pudieron cargar
                    los productos
                </h3>

                <p>
                    Intenta recargar la página.
                </p>

            </div>

        `;

    }

}


// ========================================
// CATEGORY FILTER
// ========================================

function renderCategoryFilter() {

    const select =
        document.querySelector(
            "#enterprise-products-category"
        );


    if (!select) {

        return;

    }


    const sortedCategories =
        [
            ...categories
        ].sort(
            (
                a,
                b
            ) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
        );


    select.innerHTML = `

        <option value="">
            Todas las categorías
        </option>

        ${
            sortedCategories
                .map(
                    category => `

                        <option
                            value="${escapeHTML(
                                category.id
                            )}"
                        >
                            ${escapeHTML(
                                category.name ||
                                "Sin nombre"
                            )}
                        </option>

                    `
                )
                .join("")
        }

    `;

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts() {

    const grid =
        document.querySelector(
            "#enterprise-products-grid"
        );


    if (!grid) {

        return;

    }


    if (
        filteredProducts.length === 0
    ) {

        grid.innerHTML = `

            <div
                class="
                    enterprise-products__empty
                "
            >

                <i
                    class="
                        fa-regular
                        fa-folder-open
                    "
                ></i>

                <h3>
                    No hay productos
                </h3>

                <p>
                    No encontramos productos
                    con los filtros actuales.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        filteredProducts
            .map(
                product =>
                    renderProductCard(
                        product
                    )
            )
            .join("");

}


// ========================================
// PRODUCT CARD
// ========================================

function renderProductCard(
    product
) {

    const variants =
        Array.isArray(
            product.variants
        )
            ? product.variants
            : [];


    const activeVariants =
        variants.filter(
            variant =>
                variant.active !== false
        );
        const previewVariants =
    activeVariants.slice(
        0,
        3
    );

const remainingVariants =
    Math.max(
        activeVariants.length - 3,
        0
    );

const published =
    getPublishedChannels(
        product.publishedActive
    );


    const image =
        getProductImage(
            product
        );


    const price =
        getProductPrice(
            activeVariants
        );


    const category =
        categories.find(
            category =>
                category.id ===
                product.categoryId
        );


    const status =
        product.active
            ? "active"
            : "inactive";


    return `

        <article
            class="
                enterprise-products__card
                ${
                    status === "inactive"
                        ? "is-inactive"
                        : ""
                }
            "
            data-product-id="${escapeHTML(
                product.id
            )}"
        >

            <!-- ========================================
                 IMAGE
            ======================================== -->

            <div
                class="
                    enterprise-products__image
                "
            >

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(
                                    image
                                )}"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Producto"
                                )}"
                                loading="lazy"
                            />
                        `
                        : `
                            <div
                                class="
                                    enterprise-products__image-placeholder
                                "
                            >

                                <i
                                    class="
                                        fa-regular
                                        fa-image
                                    "
                                ></i>

                                <span>
                                    Sin imagen
                                </span>

                            </div>
                        `
                }

            </div>


            <!-- ========================================
                 BODY
            ======================================== -->

            <div
                class="
                    enterprise-products__body
                "
            >

                <div
                    class="
                        enterprise-products__top
                    "
                >

                    <div>

                        <h2
                            class="
                                enterprise-products__name
                            "
                        >
                            ${escapeHTML(
                                product.name ||
                                "Producto sin nombre"
                            )}
                        </h2>


                        ${
                            category
                                ? `
                                    <span
                                        class="
                                            enterprise-products__category
                                        "
                                    >
                                        ${escapeHTML(
                                            category.name ||
                                            ""
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <strong
                        class="
                            enterprise-products__price
                        "
                    >
                        ${price}
                    </strong>

                </div>


                <!-- ========================================
                     VARIANTS
                ======================================== -->

                <div
                    class="
                        enterprise-products__variants
                    "
                >

                    <div
                        class="
                            enterprise-products__section-title
                        "
                    >

                        <span>
                            Variantes
                        </span>

                        <span>
                            ${activeVariants.length}
                        </span>

                    </div>


                    ${
                        activeVariants.length
                            ? `

                                <div
                                    class="
                                        enterprise-products__variant-list
                                    "
                                >

                                    ${previewVariants
    .map(
        variant =>
            renderVariant(
                variant
            )
    )
    .join("")
}

${
    remainingVariants > 0
        ? `
            <div
                class="
                    enterprise-products__more-variants
                "
            >
                +${remainingVariants} variantes
            </div>
        `
        : ""
}

                                </div>

                            `
                            : `

                                <div
                                    class="
                                        enterprise-products__no-variants
                                    "
                                >
                                    Sin variantes activas.
                                </div>

                            `
                    }

                </div>
<div
    class="
        enterprise-products__channels
    "
>

    <div
        class="
            enterprise-products__section-title
        "
    >

        <span>
            Canales de venta
        </span>

    </div>


    <div
        class="
            enterprise-products__channel-list
        "
    >

        ${renderPublishedChannels(
            published
        )}

    </div>

</div>

                <!-- ========================================
                     FOOTER
                ======================================== -->

                <div
                    class="
                        enterprise-products__footer
                    "
                >

                    <span
                        class="
                            enterprise-products__status
                            enterprise-products__status--${status}
                        "
                    >

                        <span
                            class="
                                enterprise-products__status-dot
                            "
                        ></span>

                        ${
                            status === "active"
                                ? "Activo"
                                : "Inactivo"
                        }

                    </span>


                    ${
                        product.slug
                            ? `
                                <span
                                    class="
                                        enterprise-products__slug
                                    "
                                >
                                    ${escapeHTML(
                                        product.slug
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}


// ========================================
// VARIANT
// ========================================

function renderVariant(
    variant
) {

    return `

        <div
            class="
                enterprise-products__variant
            "
        >

            <div
                class="
                    enterprise-products__variant-name
                "
            >
                ${escapeHTML(
                    variant.name ||
                    "Sin nombre"
                )}
            </div>


            <div
                class="
                    enterprise-products__variant-sku
                "
            >
                ${escapeHTML(
                    variant.sku ||
                    "Sin SKU"
                )}
            </div>


            <div
                class="
                    enterprise-products__variant-price
                "
            >
                ${formatCurrency(
                    variant.price
                )}
            </div>


            <span
                class="
                    enterprise-products__variant-status
                    ${
                        variant.active === false
                            ? "is-inactive"
                            : ""
                    }
                "
            >

                ${
                    variant.active === false
                        ? "Inactivo"
                        : "Activo"
                }

            </span>

        </div>

    `;

}
// ========================================
// PUBLISHED CHANNELS
// ========================================

function getPublishedChannels(
    publishedActive
) {

    const channels =
        publishedActive || {};


    return {

        marketplace:
            channels.marketplace === true,

        facebook:
            channels.facebook === true,

        tiktokShop:
            channels.tiktokShop === true,

        web:
            channels.web === true

    };

}


// ========================================
// RENDER PUBLISHED CHANNELS
// ========================================

function renderPublishedChannels(
    channels
) {

    const items = [

        {
            key:
                "marketplace",

            label:
                "Marketplace"

        },

        {
            key:
                "facebook",

            label:
                "Facebook"

        },

        {
            key:
                "tiktokShop",

            label:
                "TikTok Shop"

        },

        {
            key:
                "web",

            label:
                "Web"

        }

    ];


    return items
        .map(
            channel => `

                <span
                    class="
                        enterprise-products__channel
                        ${
                            channels[
                                channel.key
                            ]
                                ? "is-published"
                                : "is-not-published"
                        }
                    "
                >

                    <span
                        class="
                            enterprise-products__channel-dot
                        "
                    ></span>

                    ${channel.label}

                </span>

            `
        )
        .join("");

}

// ========================================
// PRODUCT PRICE
// ========================================

function getProductPrice(
    variants
) {

    if (!variants.length) {

        return "—";

    }


    const prices =
        variants
            .map(
                variant =>
                    Number(
                        variant.price
                    )
            )
            .filter(
                price =>
                    Number.isFinite(
                        price
                    )
            );


    if (!prices.length) {

        return "—";

    }


    const min =
        Math.min(
            ...prices
        );


    const max =
        Math.max(
            ...prices
        );


    if (min === max) {

        return formatCurrency(
            min
        );

    }


    return `
        Desde
        ${formatCurrency(
            min
        )}
    `;

}


// ========================================
// PRODUCT IMAGE
// ========================================

function getProductImage(
    product
) {

    if (
        !Array.isArray(
            product.images
        )
    ) {

        return null;

    }


    const image =
        product.images.find(
            value =>
                typeof value ===
                "string" &&
                value.trim()
        );


    return image ||
        null;

}


// ========================================
// FILTERS
// ========================================

function applyFilters() {

    const searchInput =
        document.querySelector(
            "#enterprise-products-search"
        );


    const categorySelect =
        document.querySelector(
            "#enterprise-products-category"
        );


    const statusSelect =
        document.querySelector(
            "#enterprise-products-status"
        );


    const search =
        String(
            searchInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const categoryId =
        categorySelect?.value ||
        "";


    const status =
        statusSelect?.value ||
        "";


    filteredProducts =
        products.filter(
            product => {

                const name =
                    String(
                        product.name ||
                        ""
                    ).toLowerCase();


                const slug =
                    String(
                        product.slug ||
                        ""
                    ).toLowerCase();


                const categoryMatch =
                    !categoryId ||
                    product.categoryId ===
                        categoryId;


                const statusMatch =
                    !status ||
                    (
                        status === "active"
                            ? product.active === true
                            : product.active === false
                    );


                const searchMatch =
                    !search ||
                    name.includes(
                        search
                    ) ||
                    slug.includes(
                        search
                    );


                return (
                    categoryMatch &&
                    statusMatch &&
                    searchMatch
                );

            }
        );


    renderProducts();

}


// ========================================
// PRODUCT EVENTS
// ========================================

function initProductEvents() {

    const searchInput =
        document.querySelector(
            "#enterprise-products-search"
        );


    const categorySelect =
        document.querySelector(
            "#enterprise-products-category"
        );


    const statusSelect =
        document.querySelector(
            "#enterprise-products-status"
        );


    searchInput?.addEventListener(
        "input",
        applyFilters
    );


    categorySelect?.addEventListener(
        "change",
        applyFilters
    );


    statusSelect?.addEventListener(
        "change",
        applyFilters
    );


    document
        .querySelector(
            "#enterprise-products-grid"
        )
        ?.addEventListener(
            "click",
            event => {

                const card =
                    event.target.closest(
                        ".enterprise-products__card"
                    );

                if (!card) {
                    return;
                }

                const productId =
                    card.dataset.productId;

                if (!productId) {
                    return;
                }

                openProductDetail(
                    productId
                );

            }
        );

}


// ========================================
// PRODUCT DETAIL NAVIGATION
// ========================================

function openProductDetail(
    productId
) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    params.set(
        "product",
        productId
    );

    window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
    );

    renderProductDetail(
        productId,
        currentEnterpriseProfile
    );

}


// ========================================
// PRODUCT DETAIL
// ========================================

function renderProductDetail(
    productId,
    profile
) {

    const product =
        products.find(
            item =>
                item.id === productId
        );

    const app =
        document.querySelector(
            "#app"
        );

    if (!app) {
        return;
    }

    if (!product) {
        renderProductDetailError();
        return;
    }

    const variants =
        Array.isArray(
            product.variants
        )
            ? product.variants
            : [];

    const category =
        categories.find(
            item =>
                item.id === product.categoryId
        );

    const image =
        getProductImage(
            product
        );

    const activeVariants =
        variants.filter(
            variant =>
                variant.active !== false
        );

    const price =
        getProductPrice(
            activeVariants
        );

    const status =
        product.active
            ? "active"
            : "inactive";

    const published =
        getPublishedChannels(
            product.publishedActive
        );

    const content = `

        <section
            class="enterprise-products__detail"
        >

            <button
                type="button"
                id="enterprise-products-back"
                class="enterprise-products__back"
            >
                <i class="fa-solid fa-arrow-left"></i>
                <span>Volver a productos</span>
            </button>


            <div
                class="enterprise-products__detail-header"
            >

                <div
                    class="enterprise-products__detail-image"
                >

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                                        product.name ||
                                        "Producto"
                                    )}"
                                />
                            `
                            : `
                                <div
                                    class="
                                        enterprise-products__image-placeholder
                                    "
                                >
                                    <i class="fa-regular fa-image"></i>
                                    <span>Sin imagen</span>
                                </div>
                            `
                    }

                </div>


                <div
                    class="enterprise-products__detail-summary"
                >

                    ${
                        category
                            ? `
                                <span
                                    class="
                                        enterprise-products__category
                                    "
                                >
                                    ${escapeHTML(
                                        category.name || ""
                                    )}
                                </span>
                            `
                            : ""
                    }

                    <div
                        class="
                            enterprise-products__detail-heading
                        "
                    >

                        <h1
                            class="
                                enterprise-products__detail-title
                            "
                        >
                            ${escapeHTML(
                                product.name ||
                                "Producto sin nombre"
                            )}
                        </h1>

                        <strong
                            class="
                                enterprise-products__detail-price
                            "
                        >
                            ${price}
                        </strong>

                    </div>


                    <span
                        class="
                            enterprise-products__status
                            enterprise-products__status--${status}
                        "
                    >

                        <span
                            class="
                                enterprise-products__status-dot
                            "
                        ></span>

                        ${
                            status === "active"
                                ? "Activo"
                                : "Inactivo"
                        }

                    </span>

                </div>

            </div>


            <section
                class="
                    enterprise-products__detail-section
                "
            >

                <div
                    class="
                        enterprise-products__detail-section-header
                    "
                >
                    <h2>Descripción</h2>
                </div>

                <p
                    class="
                        enterprise-products__detail-description
                    "
                >
                    ${
                        product.description
                            ? escapeHTML(
                                product.description
                            )
                            : "Este producto no tiene una descripción registrada."
                    }
                </p>

            </section>


            <section
                class="
                    enterprise-products__detail-section
                "
            >

                <div
                    class="
                        enterprise-products__detail-section-header
                    "
                >

                    <div>
                        <h2>Variantes</h2>
                        <span>
                            ${variants.length}
                            ${
                                variants.length === 1
                                    ? "variante"
                                    : "variantes"
                            }
                        </span>
                    </div>

                </div>


                ${
                    variants.length
                        ? `
                            <div
                                class="
                                    enterprise-products__detail-variants
                                "
                            >
                                ${variants
                                    .map(
                                        variant =>
                                            renderDetailVariant(
                                                variant
                                            )
                                    )
                                    .join("")
                                }
                            </div>
                        `
                        : `
                            <div
                                class="
                                    enterprise-products__detail-empty
                                "
                            >
                                Este producto no tiene variantes registradas.
                            </div>
                        `
                }

            </section>


            <section
                class="
                    enterprise-products__detail-section
                "
            >

                <div
                    class="
                        enterprise-products__detail-section-header
                    "
                >
                    <h2>Canales de venta</h2>
                </div>

                <div
                    class="
                        enterprise-products__detail-channels
                    "
                >
                    ${renderPublishedChannels(published)}
                </div>

            </section>


            <section
                class="
                    enterprise-products__detail-section
                "
            >

                <div
                    class="
                        enterprise-products__detail-section-header
                    "
                >
                    <h2>Fulfillment</h2>
                </div>

                <div
                    class="
                        enterprise-products__detail-info-grid
                    "
                >

                    ${
                        renderFulfillmentInfo(
                            product.fulfillment
                        )
                    }

                </div>

            </section>

        </section>

    `;

    app.innerHTML =
        EnterpriseLayout(
            content,
            profile
        );

    initEnterpriseLayout();

    document
        .querySelector(
            "#enterprise-products-back"
        )
        ?.addEventListener(
            "click",
            () => {

                window.history.pushState(
                    {},
                    "",
                    window.location.pathname
                );

                renderProductsPage(
                    currentEnterpriseProfile
                );

            }
        );

}


// ========================================
// FULFILLMENT
// ========================================

function renderFulfillmentInfo(
    fulfillment
) {

    if (
        !fulfillment ||
        typeof fulfillment !== "object" ||
        Array.isArray(fulfillment)
    ) {

        return `

            <div
                class="
                    enterprise-products__detail-info-item
                "
            >

                <span>
                    Tipo
                </span>

                <strong>
                    ${
                        fulfillment
                            ? escapeHTML(
                                String(
                                    fulfillment
                                )
                            )
                            : "No registrado"
                    }
                </strong>

            </div>

        `;

    }


    const entries =
        Object.entries(
            fulfillment
        );


    if (!entries.length) {

        return `

            <div
                class="
                    enterprise-products__detail-info-item
                "
            >

                <span>
                    Fulfillment
                </span>

                <strong>
                    No registrado
                </strong>

            </div>

        `;

    }


    return entries
        .map(
            ([key, value]) => `

                <div
                    class="
                        enterprise-products__detail-info-item
                    "
                >

                    <span>
                        ${escapeHTML(
                            formatFulfillmentLabel(
                                key
                            )
                        )}
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatFulfillmentValue(
                                value
                            )
                        )}
                    </strong>

                </div>

            `
        )
        .join("");

}


function formatFulfillmentLabel(
    key
) {

    const labels = {

        type:
            "Tipo",

        supplier:
            "Proveedor",

        supplierId:
            "Supplier ID",

        method:
            "Método",

        service:
            "Servicio"

    };


    if (
        labels[key]
    ) {

        return labels[key];

    }


    return String(
        key
    )
        .replace(
            /([A-Z])/g,
            " $1"
        )
        .replace(
            /^./,
            char =>
                char.toUpperCase()
        );

}


function formatFulfillmentValue(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "No registrado";

    }


    if (
        typeof value === "object"
    ) {

        return Object.entries(
            value
        )
            .map(
                ([key, nestedValue]) =>
                    `${key}: ${
                        formatFulfillmentValue(
                            nestedValue
                        )
                    }`
            )
            .join(" · ");

    }


    if (
        typeof value === "boolean"
    ) {

        return value
            ? "Sí"
            : "No";

    }


    return String(
        value
    );

}


// ========================================
// DETAIL VARIANT
// ========================================

function renderDetailVariant(
    variant
) {

    const active =
        variant.active !== false;

    return `

        <div
            class="
                enterprise-products__detail-variant
                ${
                    active
                        ? ""
                        : "is-inactive"
                }
            "
        >

            <div>

                <span
                    class="
                        enterprise-products__detail-variant-name
                    "
                >
                    ${escapeHTML(
                        variant.name ||
                        "Sin nombre"
                    )}
                </span>

                <span
                    class="
                        enterprise-products__detail-variant-sku
                    "
                >
                    ${escapeHTML(
                        variant.sku ||
                        "Sin SKU"
                    )}
                </span>

            </div>


            <strong
                class="
                    enterprise-products__detail-variant-price
                "
            >
                ${formatCurrency(
                    variant.price
                )}
            </strong>


            <span
                class="
                    enterprise-products__detail-variant-status
                    ${
                        active
                            ? "is-active"
                            : "is-inactive"
                    }
                "
            >

                <span
                    class="
                        enterprise-products__status-dot
                    "
                ></span>

                ${
                    active
                        ? "Activo"
                        : "Inactivo"
                }

            </span>

        </div>

    `;

}


// ========================================
// RENDER CATALOG PAGE
// ========================================

function renderProductsPage(
    profile
) {

    const app =
        document.querySelector(
            "#app"
        );

    if (!app) {
        return;
    }

    app.innerHTML =
        EnterpriseProducts(
            profile
        );

    initEnterpriseLayout();

    renderCategoryFilter();
    renderProducts();
    initProductEvents();
    initAdminButton(
        profile
    );

}


// ========================================
// DETAIL ERROR
// ========================================

function renderProductDetailError() {

    const app =
        document.querySelector(
            "#app"
        );

    if (!app) {
        return;
    }

    const content = `

        <section
            class="
                enterprise-products__detail-error
            "
        >

            <i
                class="
                    fa-solid
                    fa-triangle-exclamation
                "
            ></i>

            <h1>
                Producto no encontrado
            </h1>

            <p>
                El producto solicitado no existe
                o ya no está disponible.
            </p>

            <button
                type="button"
                id="enterprise-products-back-error"
                class="enterprise-products__back"
            >

                <i class="fa-solid fa-arrow-left"></i>

                Volver a productos

            </button>

        </section>

    `;

    app.innerHTML =
        EnterpriseLayout(
            content,
            currentEnterpriseProfile
        );

    initEnterpriseLayout();

    document
        .querySelector(
            "#enterprise-products-back-error"
        )
        ?.addEventListener(
            "click",
            () => {

                window.history.pushState(
                    {},
                    "",
                    window.location.pathname
                );

                renderProductsPage(
                    currentEnterpriseProfile
                );

            }
        );

}


// ========================================
// ADMIN
// ========================================

function initAdminButton(
    profile
) {

    const button =
        document.querySelector(
            "#enterprise-products-add"
        );


    if (
        !button ||
        profile?.role !== "admin"
    ) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            console.log(
                "Administración de productos"
            );

        }
    );

}


// ========================================
// CURRENCY
// ========================================

function formatCurrency(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "es-GT",
        {
            style:
                "currency",

            currency:
                "GTQ",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    ).format(
        number
    );

}


// ========================================
// ESCAPE HTML
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