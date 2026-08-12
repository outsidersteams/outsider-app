import {
    EnterpriseLayout,
    initEnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getProducts,
    getCategories,
    createProduct,
    updateProduct
} from "../firebase/firestore.js";

import {
    uploadImage,
    deleteImage
} from "../services/imagekit.js";

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


        if (productId) {

            renderProductDetail(
                productId,
                profile
            );

            return;

        }


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

    const variantRows =
        getProductVariantRows(
            product
        );


    const activeVariants =
        variantRows.filter(
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
// VARIANT NORMALIZATION
// ========================================

function getProductVariantRows(
    product
) {

    const variants =
        Array.isArray(
            product?.variants
        )
            ? product.variants
            : [];


    const rows = [];


    variants.forEach(
        variant => {

            // New structure: color group -> sizes
            if (
                Array.isArray(
                    variant?.sizes
                )
            ) {

                variant.sizes.forEach(
                    size => {

                        rows.push({

                            id:
                                `${variant.id || slugify(variant.name)}-${size.id || slugify(size.name)}`,

                            colorId:
                                variant.id || "",

                            colorName:
                                variant.name || "Sin color",

                            colorImage:
                                getImageUrl(
                                    Array.isArray(variant.images)
                                        ? variant.images[0]
                                        : ""
                                ),

                            name:
                                size.name || "Única",

                            sku:
                                size.sku || "Sin SKU",

                            price:
                                size.price,

                            active:
                                size.active !== false &&
                                variant.active !== false

                        });

                    }
                );

                return;

            }


            // Legacy structure: flat variants
            rows.push({

                id:
                    variant.id || "",

                colorId:
                    variant.id || "",

                colorName:
                    variant.colorName ||
                    "",

                colorImage:
                    variant.image ||
                    "",

                name:
                    variant.name ||
                    "Sin nombre",

                sku:
                    variant.sku ||
                    "Sin SKU",

                price:
                    variant.price,

                active:
                    variant.active !== false

            });

        }
    );


    return rows;

}


function getProductVariantGroups(
    product
) {

    const variants =
        Array.isArray(
            product?.variants
        )
            ? product.variants
            : [];


    if (
        variants.some(
            variant =>
                Array.isArray(
                    variant?.sizes
                )
        )
    ) {

        return variants.map(
            variant => ({

                id:
                    variant.id ||
                    slugify(variant.name),

                name:
                    variant.name ||
                    "Sin color",

                images:
                    Array.isArray(variant.images)
                        ? variant.images
                        : [],

                active:
                    variant.active !== false,

                sizes:
                    Array.isArray(variant.sizes)
                        ? variant.sizes
                        : []

            })
        );

    }


    // Legacy products remain readable.
    return [{

        id:
            "legacy",

        name:
            "Variantes",

        images: [],

        active:
            true,

        sizes:
            variants

    }];

}


function slugify(
    value
) {

    return String(
        value || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

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
                    variant.colorName
                        ? `${variant.colorName} / ${variant.name}`
                        : variant.name || "Sin nombre"
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
            channels["fb-page"] === true,

        instagram:
            channels.instagram === true,

        tiktok:
            channels.tiktok === true,

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
                "instagram",

            label:
                "Instagram"

        },

        {
            key:
                "tiktok",

            label:
                "TikTok"

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
// IMAGE ASSET HELPERS
// ========================================

function normalizeImageAsset(value) {

    if (!value) {
        return null;
    }

    if (typeof value === "string") {

        const url = value.trim();

        return url
            ? {
                url,
                fileId: null
            }
            : null;

    }

    if (typeof value === "object") {

        const url = String(
            value.url ||
            value.src ||
            ""
        ).trim();

        if (!url) {
            return null;
        }

        return {
            url,
            fileId: value.fileId || null
        };

    }

    return null;

}

function getImageUrl(value) {

    return normalizeImageAsset(value)?.url || "";

}

function serializeImageAsset(value) {

    const asset =
        normalizeImageAsset(value);

    return asset
        ? JSON.stringify(asset)
        : "";

}

function parseImageAsset(value) {

    if (!value) {
        return null;
    }

    try {

        const parsed =
            JSON.parse(value);

        return normalizeImageAsset(parsed);

    } catch {

        return normalizeImageAsset(value);

    }

}

// ========================================
// PRODUCT IMAGE
// ========================================

function getProductImage(
    product
) {

    if (
        Array.isArray(
            product?.images
        )
    ) {

        const image =
            product.images.find(
                value =>
                    Boolean(
                        getImageUrl(value)
                    )
            );

        if (image) {
            return getImageUrl(image);
        }

    }


    const firstColorImage =
        Array.isArray(product?.variants)
            ? product.variants.find(
                variant =>
                    Array.isArray(variant?.images) &&
                    getImageUrl(variant.images[0])
            )?.images?.[0]
            : null;


    return getImageUrl(firstColorImage) || null;

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
        getProductVariantRows(
            product
        );

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


                    <div class="enterprise-products__detail-actions">

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
                            profile?.role === "admin"
                                ? `
                                    <button
                                        type="button"
                                        class="enterprise-products__admin-secondary"
                                        id="enterprise-products-edit"
                                    >
                                        <i class="fa-solid fa-pen"></i>
                                        Editar producto
                                    </button>
                                `
                                : ""
                        }

                    </div>

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
                    renderProductDetailVariants(
                        product
                    )
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


    document
        .querySelector(
            "#enterprise-products-edit"
        )
        ?.addEventListener(
            "click",
            () => {

                if (currentEnterpriseProfile?.role !== "admin") {
                    return;
                }

                openEditProductPanel(product);

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
// DETAIL VARIANTS
// ========================================

function renderProductDetailVariants(
    product
) {

    const groups =
        getProductVariantGroups(
            product
        );


    if (!groups.length) {

        return `
            <div
                class="
                    enterprise-products__detail-empty
                "
            >
                Este producto no tiene variantes registradas.
            </div>
        `;

    }


    return `

        <div
            class="
                enterprise-products__detail-color-groups
            "
        >

            ${groups
                .map(
                    group => `

                        <div
                            class="
                                enterprise-products__detail-color-group
                                ${
                                    group.active
                                        ? ""
                                        : "is-inactive"
                                }
                            "
                        >

                            <div
                                class="
                                    enterprise-products__detail-color-header
                                "
                            >

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            group.name
                                        )}
                                    </strong>

                                    <span>
                                        ${group.sizes.length}
                                        ${
                                            group.sizes.length === 1
                                                ? "talla"
                                                : "tallas"
                                        }
                                    </span>

                                </div>

                                ${
                                    getImageUrl(group.images?.[0])
                                        ? `
                                            <img
                                                src="${escapeHTML(
                                                    getImageUrl(group.images?.[0])
                                                )}"
                                                alt="${escapeHTML(
                                                    group.name
                                                )}"
                                                loading="lazy"
                                            />
                                        `
                                        : ""
                                }

                            </div>


                            <div
                                class="
                                    enterprise-products__detail-size-list
                                "
                            >

                                ${group.sizes
                                    .map(
                                        size =>
                                            renderDetailVariant({
                                                ...size,
                                                name:
                                                    size.name ||
                                                    "Única"
                                            })
                                    )
                                    .join("")
                                }

                            </div>

                        </div>

                    `
                )
                .join("")
            }

        </div>

    `;

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
            openCreateProductPanel();
        }
    );

}


// ========================================
// CREATE PRODUCT PANEL
// ========================================

function openCreateProductPanel() {

    if (
        currentEnterpriseProfile?.role !== "admin"
    ) {
        return;
    }


    closeCreateProductPanel();


    const panel = document.createElement("div");

    panel.id =
        "enterprise-products-create-panel";

    panel.className =
        "enterprise-products__admin-overlay";

    panel.innerHTML = renderCreateProductPanel();

    document.body.appendChild(panel);


    initCreateProductPanel();

}


function openEditProductPanel(
    product
) {

    if (currentEnterpriseProfile?.role !== "admin" || !product) {
        return;
    }

    closeCreateProductPanel();

    const panel = document.createElement("div");

    panel.id = "enterprise-products-create-panel";
    panel.className = "enterprise-products__admin-overlay";
    panel.innerHTML = renderCreateProductPanel("edit", product);

    document.body.appendChild(panel);

    initCreateProductPanel("edit", product);

}


function renderCreateProductPanel(
    mode = "create",
    product = null
) {

    return `

        <div
            class="enterprise-products__admin-backdrop"
            data-close-create-product
        ></div>

        <aside
            class="enterprise-products__admin-panel"
            aria-label="${mode === "edit" ? "Editar producto" : "Crear producto"}"
        >

            <div
                class="enterprise-products__admin-header"
            >

                <div>
                    <span
                        class="enterprise-products__eyebrow"
                    >
                        Administración
                    </span>

                    <h2>
                        ${mode === "edit" ? "Editar producto" : "Nuevo producto"}
                    </h2>
                </div>

                <button
                    type="button"
                    class="enterprise-products__admin-close"
                    id="enterprise-products-create-close"
                    aria-label="Cerrar"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <form
                id="enterprise-products-create-form"
                class="enterprise-products__admin-form"
            >

                <section
                    class="enterprise-products__admin-section"
                >

                    <div
                        class="enterprise-products__admin-section-title"
                    >
                        Información general
                    </div>

                    <label
                        class="enterprise-products__field"
                    >
                        <span>Nombre *</span>
                        <input
                            type="text"
                            name="name"
                            required
                            autocomplete="off"
                            placeholder="Ej. Hoodie Stussy"
                        />
                    </label>

                    <label
                        class="enterprise-products__field"
                    >
                        <span>Slug</span>
                        <input
                            type="text"
                            name="slug"
                            autocomplete="off"
                            placeholder="hoodie-stussy"
                        />
                    </label>

                    <label
                        class="enterprise-products__field"
                    >
                        <span>Categoría *</span>
                        <select
                            name="categoryId"
                            required
                        >
                            <option value="">
                                Seleccionar categoría
                            </option>

                            ${categories
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
                        </select>
                    </label>

                    <label
                        class="enterprise-products__field"
                    >
                        <span>Descripción</span>
                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Descripción del producto..."
                        ></textarea>
                    </label>

                    <label
                        class="enterprise-products__field"
                    >
                        <span>Imagen principal</span>
                        <input
                            type="file"
                            name="mainImage"
                            accept="image/*"
                        />
                        <div
                            data-main-image-current
                            class="enterprise-products__current-image"
                            hidden
                        ></div>
                        <small>
                            JPG, PNG o WebP
                        </small>
                    </label>

                </section>


                <section
                    class="enterprise-products__admin-section"
                >

                    <div
                        class="enterprise-products__admin-section-heading"
                    >
                        <div>
                            <div
                                class="enterprise-products__admin-section-title"
                            >
                                Colores y tallas
                            </div>

                            <p>
                                Cada color puede tener su propia imagen y sus tallas/SKU.
                            </p>
                        </div>

                        <button
                            type="button"
                            class="enterprise-products__admin-secondary"
                            id="enterprise-products-add-color"
                        >
                            <i class="fa-solid fa-plus"></i>
                            Color
                        </button>
                    </div>


                    <div
                        id="enterprise-products-color-groups"
                    ></div>

                </section>


                <section
                    class="enterprise-products__admin-section"
                >

                    <div
                        class="enterprise-products__admin-section-title"
                    >
                        Fulfillment
                    </div>

                    <div
                        class="enterprise-products__admin-radio-grid"
                    >

                        <label
                            class="enterprise-products__admin-radio"
                        >
                            <input
                                type="radio"
                                name="fulfillmentType"
                                value="made_to_order"
                                checked
                            />
                            <span>
                                <strong>POD / Hecho bajo pedido</strong>
                                <small>No requiere stock físico previo.</small>
                            </span>
                        </label>

                        <label
                            class="enterprise-products__admin-radio"
                        >
                            <input
                                type="radio"
                                name="fulfillmentType"
                                value="physical"
                            />
                            <span>
                                <strong>Físico / Stock</strong>
                                <small>Se controla mediante inventario.</small>
                            </span>
                        </label>

                    </div>

                </section>


                <section
                    class="enterprise-products__admin-section"
                >

                    <div
                        class="enterprise-products__admin-section-title"
                    >
                        Canales de publicación
                    </div>

                    <div
                        class="enterprise-products__admin-channel-grid"
                    >

                        ${renderCreateChannelCheckbox(
                            "marketplace",
                            "Marketplace"
                        )}

                        ${renderCreateChannelCheckbox(
                            "fb-page",
                            "Facebook"
                        )}

                        ${renderCreateChannelCheckbox(
                            "instagram",
                            "Instagram"
                        )}

                        ${renderCreateChannelCheckbox(
                            "tiktok",
                            "TikTok"
                        )}

                        ${renderCreateChannelCheckbox(
                            "web",
                            "Web"
                        )}

                    </div>

                </section>


                <div
                    id="enterprise-products-create-error"
                    class="enterprise-products__admin-error"
                    hidden
                ></div>


                <div
                    class="enterprise-products__admin-actions"
                >

                    <button
                        type="button"
                        class="enterprise-products__admin-cancel"
                        id="enterprise-products-create-cancel"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="enterprise-products__admin-primary"
                        id="enterprise-products-create-submit"
                    >
                        <span>${mode === "edit" ? "Guardar cambios" : "Crear producto"}</span>
                    </button>

                </div>

            </form>

        </aside>

    `;

}


function renderCreateChannelCheckbox(
    key,
    label
) {

    return `

        <label
            class="enterprise-products__admin-channel"
        >
            <input
                type="checkbox"
                name="publishedActive"
                value="${escapeHTML(key)}"
            />

            <span>
                ${escapeHTML(label)}
            </span>
        </label>

    `;

}


function initCreateProductPanel(
    mode = "create",
    product = null
) {

    const form =
        document.querySelector(
            "#enterprise-products-create-form"
        );

    const groups =
        document.querySelector(
            "#enterprise-products-color-groups"
        );


    if (mode === "edit" && product) {

        const groups =
            getProductVariantGroups(product);

        groups.forEach(
            group => addColorGroup(group)
        );

    } else {

        addColorGroup();

    }


    document
        .querySelector(
            "#enterprise-products-add-color"
        )
        ?.addEventListener(
            "click",
            () => addColorGroup()
        );


    document
        .querySelector(
            "#enterprise-products-create-close"
        )
        ?.addEventListener(
            "click",
            closeCreateProductPanel
        );


    document
        .querySelector(
            "#enterprise-products-create-cancel"
        )
        ?.addEventListener(
            "click",
            closeCreateProductPanel
        );


    document
        .querySelector(
            "[data-close-create-product]"
        )
        ?.addEventListener(
            "click",
            closeCreateProductPanel
        );


    form
        ?.querySelector(
            '[name="name"]'
        )
        ?.addEventListener(
            "input",
            event => {

                const slugInput =
                    form.querySelector(
                        '[name="slug"]'
                    );

                if (
                    !slugInput.dataset.edited
                ) {
                    slugInput.value =
                        slugify(
                            event.target.value
                        );
                }

            }
        );


    form
        ?.querySelector(
            '[name="slug"]'
        )
        ?.addEventListener(
            "input",
            event => {
                event.target.dataset.edited =
                    "true";
            }
        );


    form
        ?.addEventListener(
            "submit",
            mode === "edit"
                ? handleEditProduct
                : handleCreateProduct
        );


    if (mode === "edit" && product) {

        form.dataset.productId =
            product.id || "";

        form.dataset.existingMainImage =
            serializeImageAsset(
                Array.isArray(product.images)
                    ? product.images[0]
                    : null
            );

        form.dataset.originalMainImage =
            form.dataset.existingMainImage;

        form.querySelector('[name="name"]').value =
            product.name || "";

        const slugInput =
            form.querySelector('[name="slug"]');

        slugInput.value =
            product.slug || slugify(product.name);

        slugInput.dataset.edited = "true";

        form.querySelector('[name="categoryId"]').value =
            product.categoryId || "";

        form.querySelector('[name="description"]').value =
            product.description || "";

        const fulfillmentType =
            product.fulfillment?.type || "made_to_order";

        const fulfillmentRadio =
            form.querySelector(
                `[name="fulfillmentType"][value="${CSS.escape(fulfillmentType)}"]`
            );

        if (fulfillmentRadio) {
            fulfillmentRadio.checked = true;
        }

        const published =
            product.publishedActive || {};

        form
            .querySelectorAll('input[name="publishedActive"]')
            .forEach(input => {
                input.checked = published[input.value] === true;
            });

        const mainImage =
            form.querySelector("[data-main-image-current]");

        if (mainImage && form.dataset.existingMainImage) {
            mainImage.innerHTML = `
                <img
                    src="${escapeHTML(
                        getImageUrl(
                            parseImageAsset(
                                form.dataset.existingMainImage
                            )
                        )
                    )}"
                    alt="Imagen actual"
                    loading="lazy"
                />
                <span>Imagen actual · selecciona otra para reemplazarla</span>
            `;
            mainImage.hidden = false;
        }

    }

}


function addColorGroup(
    initialColor = null
) {

    const container =
        document.querySelector(
            "#enterprise-products-color-groups"
        );


    if (!container) {
        return;
    }


    const colorId =
        initialColor?.id ||
        `color-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;


    const group =
        document.createElement(
            "div"
        );

    group.className =
        "enterprise-products__admin-color";

    group.dataset.colorId =
        colorId;

    group.innerHTML = `

        <div
            class="enterprise-products__admin-color-header"
        >

            <div>
                <strong>Color</strong>
                <small>
                    Agrupa aquí las tallas de este color.
                </small>
            </div>

            <button
                type="button"
                class="enterprise-products__admin-icon-button"
                data-remove-color
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>


        <div
            class="enterprise-products__admin-grid"
        >

            <label
                class="enterprise-products__field"
            >
                <span>Nombre del color *</span>
                <input
                    type="text"
                    data-color-name
                    required
                    placeholder="Negro"
                />
            </label>

            <div
    class="
        enterprise-products__field
        enterprise-products__image-field
    "
>
    <span>Imagen del color</span>

    <div
        class="enterprise-products__upload"
        data-image-upload
    >

        <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-color-image-file
            hidden
        />

        <button
            type="button"
            class="enterprise-products__upload-trigger"
            data-image-upload-trigger
        >

            <span
                class="
                    enterprise-products__upload-icon
                "
            >
                <i class="fa-regular fa-image"></i>
            </span>

            <span
                class="
                    enterprise-products__upload-content
                "
            >
                <strong>
                    Subir imagen
                </strong>

                <small>
                    Arrastra una imagen aquí o selecciónala
                </small>

                <em>
                    JPG · PNG · WEBP
                </em>
            </span>

        </button>


        <div
            class="enterprise-products__upload-preview"
            data-image-upload-preview
            hidden
        >

            <div
                class="enterprise-products__upload-thumb"
            >
                <img
                    data-image-preview
                    alt=""
                />
            </div>

            <div
                class="enterprise-products__upload-info"
            >

                <strong
                    data-image-file-name
                ></strong>

                <small
                    data-image-file-size
                ></small>

            </div>

            <button
                type="button"
                class="
                    enterprise-products__upload-remove
                "
                data-image-upload-remove
                aria-label="Eliminar imagen"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>

    </div>

</div>

        </div>


        <div
            class="enterprise-products__admin-size-header"
        >
            <span>Tallas / SKU</span>

            <button
                type="button"
                class="enterprise-products__admin-secondary"
                data-add-size
            >
                <i class="fa-solid fa-plus"></i>
                Talla
            </button>
        </div>


        <div
            class="enterprise-products__admin-size-list"
            data-size-list
        ></div>

    `;


    container.appendChild(
        group
    );


    if (initialColor) {

        const nameInput =
            group.querySelector("[data-color-name]");

        if (nameInput) {
            nameInput.value = initialColor.name || "";
        }

        group.dataset.existingImage =
            serializeImageAsset(
                initialColor.images?.[0]
            );

    }


    group
        .querySelector(
            "[data-remove-color]"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    container.children.length === 1
                ) {
                    showCreateProductError(
                        "Debe existir al menos un color."
                    );
                    return;
                }

                group.remove();

            }
        );


    group
        .querySelector(
            "[data-add-size]"
        )
        ?.addEventListener(
            "click",
            () => addSizeRow(group)
        );


    if (Array.isArray(initialColor?.sizes) && initialColor.sizes.length) {

        initialColor.sizes.forEach(
            size => addSizeRow(group, size)
        );

    } else {

        addSizeRow(group);

    }

    initImageUpload(
        group,
        initialColor?.images?.[0] || null
    );

}


function addSizeRow(
    group,
    initialSize = null
) {

    const list =
        group.querySelector(
            "[data-size-list]"
        );


    if (!list) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "enterprise-products__admin-size-row";

    row.innerHTML = `

        <input
            type="text"
            data-size-name
            required
            placeholder="M"
        />

        <input
            type="text"
            data-size-sku
            required
            placeholder="SKU-..."
        />

        <input
            type="number"
            data-size-price
            required
            min="0"
            step="0.01"
            placeholder="150"
        />

        <label
            class="enterprise-products__admin-inline-check"
        >
            <input
                type="checkbox"
                data-size-active
                checked
            />
            <span>Activo</span>
        </label>

        <button
            type="button"
            class="enterprise-products__admin-icon-button"
            data-remove-size
            aria-label="Eliminar talla"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>

    `;


    list.appendChild(
        row
    );


    if (initialSize) {

        row.querySelector("[data-size-name]").value =
            initialSize.name || "";

        row.querySelector("[data-size-sku]").value =
            initialSize.sku || "";

        row.querySelector("[data-size-price]").value =
            Number.isFinite(Number(initialSize.price))
                ? initialSize.price
                : "";

        row.querySelector("[data-size-active]").checked =
            initialSize.active !== false;

    }


    row
        .querySelector(
            "[data-remove-size]"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    list.children.length === 1
                ) {
                    showCreateProductError(
                        "Cada color debe tener al menos una talla."
                    );
                    return;
                }

                row.remove();

            }
        );

}

// ========================================
// IMAGE UPLOAD UI
// ========================================

function initImageUpload(
    container,
    existingImage = null
) {

    const upload =
        container.querySelector(
            "[data-image-upload]"
        );

    if (!upload) {
        return;
    }


    const input =
        upload.querySelector(
            "[data-color-image-file]"
        );

    const trigger =
        upload.querySelector(
            "[data-image-upload-trigger]"
        );

    const preview =
        upload.querySelector(
            "[data-image-upload-preview]"
        );

    const previewImage =
        upload.querySelector(
            "[data-image-preview]"
        );

    const fileName =
        upload.querySelector(
            "[data-image-file-name]"
        );

    const fileSize =
        upload.querySelector(
            "[data-image-file-size]"
        );

    const removeButton =
        upload.querySelector(
            "[data-image-upload-remove]"
        );


    const existingAsset =
        normalizeImageAsset(existingImage);

    // Guarda una copia permanente del asset original.
    // existingImage puede limpiarse al seleccionar una nueva imagen,
    // pero necesitamos el asset original para eliminarlo después
    // de confirmar la actualización en Firebase.
    container.dataset.originalImage =
        serializeImageAsset(existingAsset);

    container.dataset.existingImage =
        serializeImageAsset(existingAsset);


    if (existingAsset?.url) {

        previewImage.src =
            existingAsset.url;

        fileName.textContent =
            "Imagen actual";

        fileSize.textContent =
            existingAsset.fileId
                ? "Se conservará si no seleccionas otra"
                : "Imagen actual · sin fileId registrado";

        trigger.hidden = true;
        preview.hidden = false;

    }


    trigger?.addEventListener(
        "click",
        () => {
            input?.click();
        }
    );


    input?.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];

            if (!file) {
                return;
            }

            if (
                ![
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ].includes(file.type)
            ) {
                input.value = "";
                return;
            }

            const maxSize =
                10 * 1024 * 1024;

            if (file.size > maxSize) {
                input.value = "";
                alert(
                    "La imagen no puede superar 10 MB."
                );
                return;
            }

            // La imagen anterior sigue registrada hasta que
            // guardemos correctamente la nueva versión.
            container.dataset.existingImage = "";

            const objectUrl =
                URL.createObjectURL(file);

            previewImage.src = objectUrl;

            previewImage.onload = () => {
                URL.revokeObjectURL(objectUrl);
            };

            fileName.textContent = file.name;
            fileSize.textContent =
                formatImageFileSize(file.size);

            trigger.hidden = true;
            preview.hidden = false;

        }
    );


    removeButton?.addEventListener(
        "click",
        () => {

            input.value = "";
            container.dataset.existingImage = "";

            previewImage.src = "";
            fileName.textContent = "";
            fileSize.textContent = "";

            preview.hidden = true;
            trigger.hidden = false;

        }
    );

}


// ========================================
// IMAGE FILE SIZE
// ========================================

function formatImageFileSize(
    bytes
) {

    if (
        bytes < 1024
    ) {

        return `${bytes} B`;

    }


    if (
        bytes < 1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}

async function handleEditProduct(
    event
) {

    event.preventDefault();

    const form = event.currentTarget;
    const submit =
        form.querySelector(
            "#enterprise-products-create-submit"
        );

    clearCreateProductError();

    const productId =
        form.dataset.productId;

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) {
        showCreateProductError(
            "No se encontró el producto que intentas editar."
        );
        return;
    }

    const formData =
        new FormData(form);

    const name =
        String(
            formData.get("name") || ""
        ).trim();

    const slug =
        String(
            formData.get("slug") ||
            slugify(name)
        ).trim();

    const categoryId =
        String(
            formData.get("categoryId") || ""
        ).trim();

    const description =
        String(
            formData.get("description") || ""
        ).trim();

    const mainImageFile =
        formData.get("mainImage");

    const mainImage =
        mainImageFile instanceof File &&
        mainImageFile.size > 0
            ? mainImageFile
            : null;

    const fulfillmentType =
        String(
            formData.get("fulfillmentType") ||
            "made_to_order"
        );


    if (!name || !categoryId) {
        showCreateProductError(
            "Completa el nombre y la categoría del producto."
        );
        return;
    }


    const colorElements =
        Array.from(
            document.querySelectorAll(
                "#enterprise-products-color-groups > .enterprise-products__admin-color"
            )
        );


    if (!colorElements.length) {
        showCreateProductError(
            "Agrega al menos un color."
        );
        return;
    }


    const usedColorIds =
        new Set();

    const usedSkus =
        new Set();

    const variants =
        [];


    const validateImageFile = file => {

        if (!file) {
            return;
        }

        if (
            !file.type ||
            !file.type.startsWith("image/")
        ) {
            throw new Error(
                `El archivo "${file.name}" no es una imagen válida.`
            );
        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {
            throw new Error(
                `La imagen "${file.name}" supera el límite de 10 MB.`
            );
        }

    };


    const getFileExtension = file => {

        const match =
            file?.name?.match(
                /\.([a-zA-Z0-9]+)$/
            );

        return match
            ? `.${match[1].toLowerCase()}`
            : "";

    };


    // ====================================
    // ASSETS ORIGINALES
    // ====================================

    const originalAssets =
        [];

    const addOriginalAsset = asset => {

        const normalized =
            normalizeImageAsset(asset);

        if (!normalized) {
            return;
        }

        originalAssets.push(
            normalized
        );

    };


    addOriginalAsset(
        Array.isArray(product.images)
            ? product.images[0]
            : null
    );


    if (
        Array.isArray(product.variants)
    ) {

        product.variants.forEach(
            variant => {

                if (
                    Array.isArray(
                        variant?.images
                    )
                ) {

                    variant.images.forEach(
                        addOriginalAsset
                    );

                }

            }
        );

    }


    // Assets subidos durante esta edición.
    // Si Firebase falla, intentaremos limpiarlos
    // para no dejar archivos huérfanos en ImageKit.
    const newlyUploadedAssets =
        [];


    try {

        validateImageFile(
            mainImage
        );


        for (
            const colorElement of colorElements
        ) {

            const colorName =
                colorElement
                    .querySelector(
                        "[data-color-name]"
                    )
                    ?.value
                    .trim();

            const colorId =
                slugify(colorName);

            const colorImageFile =
                colorElement
                    .querySelector(
                        "[data-color-image-file]"
                    )
                    ?.files?.[0] ||
                null;

            const existingImage =
                parseImageAsset(
                    colorElement.dataset.existingImage
                );

            if (!colorName || !colorId) {
                throw new Error(
                    "Todos los colores deben tener un nombre válido."
                );
            }

            if (
                usedColorIds.has(colorId)
            ) {
                throw new Error(
                    `El color "${colorName}" está repetido.`
                );
            }

            usedColorIds.add(
                colorId
            );

            validateImageFile(
                colorImageFile
            );


            const sizeElements =
                Array.from(
                    colorElement.querySelectorAll(
                        "[data-size-list] > .enterprise-products__admin-size-row"
                    )
                );

            if (!sizeElements.length) {
                throw new Error(
                    `El color "${colorName}" debe tener al menos una talla.`
                );
            }


            const sizes =
                sizeElements.map(
                    sizeElement => {

                        const sizeName =
                            sizeElement
                                .querySelector(
                                    "[data-size-name]"
                                )
                                ?.value
                                .trim();

                        const sku =
                            sizeElement
                                .querySelector(
                                    "[data-size-sku]"
                                )
                                ?.value
                                .trim();

                        const price =
                            Number(
                                sizeElement
                                    .querySelector(
                                        "[data-size-price]"
                                    )
                                    ?.value
                            );

                        const active =
                            sizeElement
                                .querySelector(
                                    "[data-size-active]"
                                )
                                ?.checked !== false;


                        if (
                            !sizeName ||
                            !sku
                        ) {
                            throw new Error(
                                `Completa talla y SKU en el color "${colorName}".`
                            );
                        }

                        if (
                            !Number.isFinite(price) ||
                            price < 0
                        ) {
                            throw new Error(
                                `El precio de "${colorName} / ${sizeName}" no es válido.`
                            );
                        }

                        if (
                            usedSkus.has(sku)
                        ) {
                            throw new Error(
                                `El SKU "${sku}" está repetido.`
                            );
                        }

                        usedSkus.add(sku);

                        return {
                            id:
                                slugify(sizeName),
                            name:
                                sizeName,
                            sku,
                            price,
                            active
                        };

                    }
                );


            variants.push({

                id:
                    colorId,

                name:
                    colorName,

                images:
                    colorImageFile
                        ? []
                        : (
                            existingImage
                                ? [existingImage]
                                : []
                        ),

                active:
                    true,

                sizes,

                _imageFile:
                    colorImageFile

            });

        }


        // ====================================
        // PUBLISHED CHANNELS
        // ====================================

        const publishedActive = {
            marketplace: false,
            "fb-page": false,
            instagram: false,
            tiktok: false,
            web: false
        };


        form
            .querySelectorAll(
                'input[name="publishedActive"]:checked'
            )
            .forEach(
                input => {
                    publishedActive[
                        input.value
                    ] = true;
                }
            );


        // ====================================
        // PREPARAR SUBMIT
        // ====================================

        submit.disabled = true;
        submit.classList.add(
            "is-loading"
        );

        submit.querySelector(
            "span"
        ).textContent =
            "Preparando...";


        // ====================================
        // IMAGEN PRINCIPAL
        // ====================================

        let mainImageAsset =
            normalizeImageAsset(
                Array.isArray(product.images)
                    ? product.images[0]
                    : null
            );


        if (mainImage) {

            submit.querySelector(
                "span"
            ).textContent =
                "Subiendo nueva imagen principal...";

            const uploaded =
                await uploadImage(
                    mainImage,
                    {
                        fileName:
                            `${slug}-main${getFileExtension(mainImage)}`,
                        folder:
                            `/products/${slug}`
                    }
                );

            mainImageAsset = {
                url:
                    uploaded.url,
                fileId:
                    uploaded.fileId || null
            };

            newlyUploadedAssets.push(
                mainImageAsset
            );

        }


        // ====================================
        // IMÁGENES DE COLORES
        // ====================================

        for (
            let index = 0;
            index < variants.length;
            index++
        ) {

            const variant =
                variants[index];

            const imageFile =
                variant._imageFile;

            delete variant._imageFile;


            if (imageFile) {

                submit.querySelector(
                    "span"
                ).textContent =
                    `Subiendo imagen ${index + 1} de ${variants.length}...`;

                const uploaded =
                    await uploadImage(
                        imageFile,
                        {
                            fileName:
                                `${slug}-${variant.id}${getFileExtension(imageFile)}`,
                            folder:
                                `/products/${slug}/colors`
                        }
                    );

                const colorImageAsset = {
                    url:
                        uploaded.url,
                    fileId:
                        uploaded.fileId || null
                };

                variant.images = [
                    colorImageAsset
                ];

                newlyUploadedAssets.push(
                    colorImageAsset
                );

            }

        }


        // ====================================
        // GUARDAR FIREBASE PRIMERO
        // ====================================

        submit.querySelector(
            "span"
        ).textContent =
            "Guardando cambios...";


        await updateProduct(
            productId,
            {
                name,
                slug,
                categoryId,
                description,
                images:
                    mainImageAsset
                        ? [mainImageAsset]
                        : [],
                variants,
                active:
                    product.active !== false,
                fulfillment: {
                    type:
                        fulfillmentType
                },
                publishedActive,
                createdBy:
                    product.createdBy ||
                    currentEnterpriseProfile?.id ||
                    currentEnterpriseProfile?.uid ||
                    "system"
            }
        );


        // ====================================
        // LIMPIAR ASSETS ANTIGUOS
        // ====================================

        const newFileIds =
            new Set(
                [
                    mainImageAsset,
                    ...variants.flatMap(
                        variant =>
                            Array.isArray(
                                variant.images
                            )
                                ? variant.images
                                : []
                    )
                ]
                    .map(
                        asset =>
                            normalizeImageAsset(
                                asset
                            )?.fileId
                    )
                    .filter(Boolean)
            );


        const obsoleteAssets =
            originalAssets.filter(
                asset =>
                    asset.fileId &&
                    !newFileIds.has(
                        asset.fileId
                    )
            );


        // Evita intentar eliminar dos veces
        // el mismo archivo si fue referenciado
        // en más de un lugar.
        const uniqueObsoleteAssets =
            Array.from(
                new Map(
                    obsoleteAssets.map(
                        asset => [
                            asset.fileId,
                            asset
                        ]
                    )
                ).values()
            );


        for (
            const asset of uniqueObsoleteAssets
        ) {

            try {

                await deleteImage(
                    asset.fileId,
                    asset.url
                );

                console.log(
                    "✓ Imagen antigua eliminada de ImageKit:",
                    asset.fileId
                );

            } catch (deleteError) {

                // Firebase ya está actualizado.
                // El fallo de limpieza no debe revertir
                // un producto correctamente guardado.
                console.warn(
                    "⚠️ Firebase actualizado, pero no se pudo limpiar una imagen antigua de ImageKit:",
                    {
                        fileId:
                            asset.fileId,
                        error:
                            deleteError
                    }
                );

            }

        }


        closeCreateProductPanel();

        await reloadProducts();

        renderProductDetail(
            productId,
            currentEnterpriseProfile
        );


    } catch (error) {

        console.error(
            "Error editando producto:",
            error
        );


        // Si Firebase no llegó a guardar,
        // limpiamos las nuevas imágenes que
        // acabamos de subir para evitar huérfanos.
        for (
            const asset of newlyUploadedAssets
        ) {

            if (!asset?.fileId) {
                continue;
            }

            try {

                await deleteImage(
                    asset.fileId,
                    asset.url
                );

            } catch (cleanupError) {

                console.warn(
                    "⚠️ No se pudo limpiar una imagen nueva después del fallo de edición:",
                    {
                        fileId:
                            asset.fileId,
                        error:
                            cleanupError
                    }
                );

            }

        }


        showCreateProductError(
            error?.message ||
            "No se pudo actualizar el producto."
        );

    } finally {

        submit.disabled = false;

        submit.classList.remove(
            "is-loading"
        );

        submit.querySelector(
            "span"
        ).textContent =
            "Guardar cambios";

    }
}


async function handleCreateProduct(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;

    const submit =
        form.querySelector(
            "#enterprise-products-create-submit"
        );


    clearCreateProductError();


    const formData =
        new FormData(
            form
        );


    const name =
        String(
            formData.get("name") || ""
        ).trim();

    const slug =
        String(
            formData.get("slug") ||
            slugify(name)
        ).trim();

    const categoryId =
        String(
            formData.get("categoryId") || ""
        ).trim();

    const description =
        String(
            formData.get("description") || ""
        ).trim();

    const mainImageFile =
        formData.get("mainImage");

    const mainImage =
        mainImageFile instanceof File &&
        mainImageFile.size > 0
            ? mainImageFile
            : null;

    const fulfillmentType =
        String(
            formData.get("fulfillmentType") ||
            "made_to_order"
        );


    if (!name || !categoryId) {
        showCreateProductError(
            "Completa el nombre y la categoría del producto."
        );
        return;
    }


    const colorElements =
        Array.from(
            document.querySelectorAll(
                "#enterprise-products-color-groups > .enterprise-products__admin-color"
            )
        );


    if (!colorElements.length) {
        showCreateProductError(
            "Agrega al menos un color."
        );
        return;
    }


    const usedColorIds =
        new Set();

    const usedSkus =
        new Set();

    const colorDrafts =
        [];


    const validateImageFile =
        file => {

            if (!file) {
                return;
            }


            if (
                !file.type ||
                !file.type.startsWith(
                    "image/"
                )
            ) {

                throw new Error(
                    `El archivo "${file.name}" no es una imagen válida.`
                );

            }


            const maxSize =
                10 * 1024 * 1024;


            if (
                file.size >
                maxSize
            ) {

                throw new Error(
                    `La imagen "${file.name}" supera el límite de 10 MB.`
                );

            }

        };


    const getFileExtension =
        file => {

            const match =
                file?.name?.match(
                    /\.([a-zA-Z0-9]+)$/
                );


            return match
                ? `.${match[1].toLowerCase()}`
                : "";

        };


    try {

        validateImageFile(
            mainImage
        );


        // ====================================
        // VALIDAR COLORES Y TALLAS
        // ====================================

        for (
            const colorElement
            of colorElements
        ) {

            const colorName =
                colorElement
                    .querySelector(
                        "[data-color-name]"
                    )
                    ?.value
                    .trim();

            const colorImageInput =
                colorElement
                    .querySelector(
                        "[data-color-image-file]"
                    );

            const colorImageFile =
                colorImageInput?.files?.[0] ||
                null;

            const colorId =
                slugify(
                    colorName
                );


            if (!colorName || !colorId) {

                throw new Error(
                    "Todos los colores deben tener un nombre válido."
                );

            }


            if (
                usedColorIds.has(
                    colorId
                )
            ) {

                throw new Error(
                    `El color "${colorName}" está repetido.`
                );

            }


            usedColorIds.add(
                colorId
            );


            validateImageFile(
                colorImageFile
            );


            const sizeElements =
                Array.from(
                    colorElement.querySelectorAll(
                        "[data-size-list] > .enterprise-products__admin-size-row"
                    )
                );


            if (!sizeElements.length) {

                throw new Error(
                    `El color "${colorName}" debe tener al menos una talla.`
                );

            }


            const sizes =
                sizeElements.map(
                    sizeElement => {

                        const sizeName =
                            sizeElement
                                .querySelector(
                                    "[data-size-name]"
                                )
                                ?.value
                                .trim();

                        const sku =
                            sizeElement
                                .querySelector(
                                    "[data-size-sku]"
                                )
                                ?.value
                                .trim();

                        const price =
                            Number(
                                sizeElement
                                    .querySelector(
                                        "[data-size-price]"
                                    )
                                    ?.value
                            );

                        const active =
                            sizeElement
                                .querySelector(
                                    "[data-size-active]"
                                )
                                ?.checked !== false;


                        if (
                            !sizeName ||
                            !sku
                        ) {

                            throw new Error(
                                `Completa talla y SKU en el color "${colorName}".`
                            );

                        }


                        if (
                            !Number.isFinite(
                                price
                            ) ||
                            price < 0
                        ) {

                            throw new Error(
                                `El precio de "${colorName} / ${sizeName}" no es válido.`
                            );

                        }


                        if (
                            usedSkus.has(
                                sku
                            )
                        ) {

                            throw new Error(
                                `El SKU "${sku}" está repetido.`
                            );

                        }


                        usedSkus.add(
                            sku
                        );


                        return {

                            id:
                                slugify(
                                    sizeName
                                ),

                            name:
                                sizeName,

                            sku,

                            price,

                            active

                        };

                    }
                );


            colorDrafts.push({

                id:
                    colorId,

                name:
                    colorName,

                imageFile:
                    colorImageFile,

                sizes

            });

        }


        // ====================================
        // PUBLISHED CHANNELS
        // ====================================

        const publishedActive = {

            marketplace:
                false,

            "fb-page":
                false,

            instagram:
                false,

            tiktok:
                false,

            web:
                false

        };


        form
            .querySelectorAll(
                'input[name="publishedActive"]:checked'
            )
            .forEach(
                input => {

                    publishedActive[
                        input.value
                    ] = true;

                }
            );


        // ====================================
        // PREPARAR SUBMIT
        // ====================================

        submit.disabled =
            true;

        submit.classList.add(
            "is-loading"
        );


        submit.querySelector(
            "span"
        ).textContent =
            "Preparando...";


        // ====================================
        // SUBIR IMAGEN PRINCIPAL
        // ====================================

        let mainImageAsset =
            null;


        if (mainImage) {

            submit.querySelector(
                "span"
            ).textContent =
                "Subiendo imagen principal...";


            const uploadedMainImage =
                await uploadImage(
                    mainImage,
                    {

                        fileName:
                            `${slug}-main${getFileExtension(mainImage)}`,

                        folder:
                            `/products/${slug}`

                    }
                );


            mainImageAsset = {
                url: uploadedMainImage.url,
                fileId: uploadedMainImage.fileId || null
            };

        }


        // ====================================
        // SUBIR IMÁGENES DE COLORES
        // ====================================

        const variants =
            [];


        for (
            let index = 0;
            index < colorDrafts.length;
            index++
        ) {

            const color =
                colorDrafts[index];


            let colorImageAsset =
                null;


            if (color.imageFile) {

                submit.querySelector(
                    "span"
                ).textContent =
                    `Subiendo imagen ${index + 1} de ${colorDrafts.length}...`;


                const uploadedColorImage =
                    await uploadImage(
                        color.imageFile,
                        {

                            fileName:
                                `${slug}-${color.id}${getFileExtension(color.imageFile)}`,

                            folder:
                                `/products/${slug}/colors`

                        }
                    );


                colorImageAsset = {
                    url: uploadedColorImage.url,
                    fileId: uploadedColorImage.fileId || null
                };

            }


            variants.push({

                id:
                    color.id,

                name:
                    color.name,

                images:
                    colorImageAsset
                        ? [colorImageAsset]
                        : [],

                active:
                    true,

                sizes:
                    color.sizes

            });

        }


        // ====================================
        // CREAR PRODUCTO
        // ====================================

        submit.querySelector(
            "span"
        ).textContent =
            "Creando producto...";


        await createProduct({

            name,

            slug,

            categoryId,

            description,

            images:
                mainImageAsset
                    ? [mainImageAsset]
                    : [],

            variants,

            active:
                true,

            fulfillment: {

                type:
                    fulfillmentType

            },

            publishedActive,

            createdBy:
                currentEnterpriseProfile?.id ||
                currentEnterpriseProfile?.uid ||
                "system"

        });


        closeCreateProductPanel();

        await reloadProducts();

    }

    catch (error) {

        console.error(
            "Error creando producto:",
            error
        );


        showCreateProductError(
            error?.message ||
            "No se pudo crear el producto."
        );

    }

    finally {

        submit.disabled =
            false;

        submit.classList.remove(
            "is-loading"
        );

        submit.querySelector(
            "span"
        ).textContent =
            "Crear producto";

    }

}


async function reloadProducts() {

    try {

        products =
            await getProducts();

        filteredProducts =
            [...products];

        renderProducts();

    }
    catch (error) {

        console.error(
            "Error recargando productos:",
            error
        );

    }

}


function showCreateProductError(
    message
) {

    const errorBox =
        document.querySelector(
            "#enterprise-products-create-error"
        );

    if (!errorBox) {
        return;
    }

    errorBox.textContent =
        message;

    errorBox.hidden =
        false;

}


function clearCreateProductError() {

    const errorBox =
        document.querySelector(
            "#enterprise-products-create-error"
        );

    if (!errorBox) {
        return;
    }

    errorBox.textContent = "";
    errorBox.hidden = true;

}


function closeCreateProductPanel() {

    document
        .querySelector(
            "#enterprise-products-create-panel"
        )
        ?.remove();

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