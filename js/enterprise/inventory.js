// ========================================
// ENTERPRISE INVENTORY
// ========================================

import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getInventory,
    getInventoryItem,
    getInventoryMovementsByInventoryId,
    getProducts,
    createInventory,
    registerInventoryEntry,
    registerInventoryExit,
    registerInventoryAdjustment
} from "../firebase/firestore.js";


// ========================================
// VIEW
// ========================================

export function EnterpriseInventory(
    profile
) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const inventoryId =
        params.get("id");


    // ====================================
    // DETAIL VIEW
    // ====================================

    if (inventoryId) {

        const content = `

            <section class="enterprise-inventory">

                <div class="enterprise-inventory__header">

                    <div>

                        <h1>
                            Inventario
                        </h1>

                        <p>
                            Detalle del registro de inventario.
                        </p>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__content"
                    id="enterprise-inventory-content"
                >

                    <div class="enterprise-inventory__loading">

                        Cargando inventario...

                    </div>

                </div>

            </section>

        `;


        return EnterpriseLayout(
            content,
            profile
        );

    }


    // ====================================
    // LIST VIEW
    // ====================================

    const content = `

        <section class="enterprise-inventory">

            <div class="enterprise-inventory__header">

                <div>

                    <h1>
                        Inventario
                    </h1>

                    <p>
                        Control de existencias y movimientos.
                    </p>

                </div>

                <button
                    type="button"
                    class="enterprise-inventory__new-button"
                    id="enterprise-inventory-new-button"
                >
                    <i class="fa-solid fa-plus"></i>
                    Nuevo inventario
                </button>

            </div>


            <div
                class="enterprise-inventory__content"
                id="enterprise-inventory-content"
            >

                <div class="enterprise-inventory__loading">

                    Cargando inventario...

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
// INIT
// ========================================

export async function initEnterpriseInventory(
    profile
) {

    console.log(
        "✓ Enterprise Inventory inicializado"
    );


    const container =
        document.querySelector(
            "#enterprise-inventory-content"
        );


    if (!container) {

        console.error(
            "No se encontró el contenedor de Inventory."
        );

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const inventoryId =
        params.get("id");


    // ====================================
    // DETAIL
    // ====================================

    if (inventoryId) {

        await renderInventoryDetail(
            container,
            inventoryId
        );

        return;

    }


    // ====================================
    // LIST
    // ====================================

    await renderInventoryList(
        container
    );

}


// ========================================
// RENDER LIST
// ========================================

async function renderInventoryList(
    container
) {

    try {

        const inventory =
            await getInventory();


        console.log(
            "✓ Inventory cargado:",
            inventory
        );


        if (
            inventory.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="enterprise-inventory__empty"
                >

                    <h2>
                        No hay inventario registrado
                    </h2>

                    <p>
                        Todavía no existen registros
                        de inventario.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div
                class="enterprise-inventory__list"
            >

                ${inventory.map(
                    item => `

                        <article
                            class="enterprise-inventory__card"
                        >

                            <div
                                class="enterprise-inventory__card-main"
                            >

                                <div>

                                    <h2>
                                        ${
                                            item.productName ||
                                            "Producto sin nombre"
                                        }
                                    </h2>

                                    <p>
                                        ${
                                            item.variantName ||
                                            "Sin variante"
                                        }
                                        ·
                                        ${
                                            item.sizeName ||
                                            "Sin talla"
                                        }
                                    </p>

                                </div>


                                <div
                                    class="enterprise-inventory__stock"
                                >

                                    <strong>
                                        ${
                                            item.stock ?? 0
                                        }
                                    </strong>

                                    <span>
                                        Stock
                                    </span>

                                </div>

                            </div>


                            <div
                                class="enterprise-inventory__card-meta"
                            >

                                <span>

                                    SKU:
                                    ${
                                        item.sku ||
                                        "Sin SKU"
                                    }

                                </span>


                                <span>

                                    ${
                                        item.catalogStatus ===
                                        "active"
                                            ? "Catálogo activo"
                                            : "Retirado del catálogo"
                                    }

                                </span>

                            </div>


                            <button
                                type="button"
                                class="enterprise-inventory__card-action"
                                data-inventory-id="${item.id}"
                            >

                                Ver inventario

                                <i class="fa-solid fa-arrow-right"></i>

                            </button>

                        </article>

                    `
                ).join("")}

            </div>

        `;


        initNewInventoryFlow();

        // =================================
        // DETAIL NAVIGATION
        // =================================

        const detailButtons =
            container.querySelectorAll(
                ".enterprise-inventory__card-action"
            );


        detailButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const inventoryId =
                            button.dataset.inventoryId;


                        if (!inventoryId) {

                            return;

                        }


                        window.location.href =
                            `/enterprise/inventory?id=${inventoryId}`;

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Error cargando Inventory:",
            error
        );


        container.innerHTML = `

            <div
                class="enterprise-inventory__error"
            >

                <h2>
                    No se pudo cargar el inventario
                </h2>

                <p>
                    Ocurrió un error al consultar
                    los registros de inventario.
                </p>

            </div>

        `;

    }

}



// ========================================
// NEW INVENTORY — PRODUCT SELECTION
// ========================================

let newInventoryProducts = [];


function initNewInventoryFlow() {

    const button =
        document.querySelector(
            "#enterprise-inventory-new-button"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            const container =
                document.querySelector(
                    "#enterprise-inventory-content"
                );


            if (!container) {
                return;
            }


            await renderNewInventoryProductSelector(
                container
            );

        }
    );

}


async function renderNewInventoryProductSelector(
    container
) {

    container.innerHTML = `

        <div
            class="enterprise-inventory__new"
        >

            <div
                class="enterprise-inventory__new-header"
            >

                <div>

                    <span>
                        Nuevo inventario
                    </span>

                    <h2>
                        Seleccionar producto
                    </h2>

                    <p>
                        Busca el producto del catálogo
                        al que deseas agregar inventario.
                    </p>

                </div>


                <button
                    type="button"
                    class="enterprise-inventory__card-action"
                    id="enterprise-inventory-new-back"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Volver al inventario
                </button>

            </div>


            <div
                class="enterprise-inventory__new-search"
            >

                <label
                    for="enterprise-inventory-product-search"
                >
                    Buscar producto
                </label>


                <div
                    class="enterprise-inventory__new-search-input"
                >

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="search"
                        id="enterprise-inventory-product-search"
                        autocomplete="off"
                        placeholder="Nombre del producto..."
                    />

                </div>

            </div>


            <div
                class="enterprise-inventory__new-results"
                id="enterprise-inventory-new-results"
            >

                <div
                    class="enterprise-inventory__loading"
                >
                    Cargando productos...
                </div>

            </div>

        </div>

    `;


    const backButton =
        document.querySelector(
            "#enterprise-inventory-new-back"
        );


    backButton?.addEventListener(
        "click",
        () => {

            window.location.href =
                "/enterprise/inventory";

        }
    );


    const results =
        document.querySelector(
            "#enterprise-inventory-new-results"
        );


    const searchInput =
        document.querySelector(
            "#enterprise-inventory-product-search"
        );


    try {

        const products =
            await getProducts();


        newInventoryProducts =
            Array.isArray(products)
                ? products
                : [];


        renderNewInventoryProductResults(
            results,
            searchInput?.value || ""
        );


        searchInput?.focus();


        searchInput?.addEventListener(
            "input",
            () => {

                renderNewInventoryProductResults(
                    results,
                    searchInput.value
                );

            }
        );

    } catch (error) {

        console.error(
            "Error cargando productos para nuevo inventario:",
            error
        );


        if (results) {

            results.innerHTML = `

                <div
                    class="enterprise-inventory__error"
                >

                    <h2>
                        No se pudieron cargar los productos
                    </h2>

                    <p>
                        Ocurrió un error al consultar
                        el catálogo.
                    </p>

                </div>

            `;

        }

    }

}


function renderNewInventoryProductResults(
    results,
    searchTerm = ""
) {

    if (!results) {
        return;
    }


    const normalizedSearch =
        String(searchTerm)
            .trim()
            .toLowerCase();


    const filteredProducts =
        newInventoryProducts.filter(
            product => {

                const name =
                    String(
                        product?.name || ""
                    ).toLowerCase();


                const slug =
                    String(
                        product?.slug || ""
                    ).toLowerCase();


                return (
                    !normalizedSearch ||
                    name.includes(
                        normalizedSearch
                    ) ||
                    slug.includes(
                        normalizedSearch
                    )
                );

            }
        );


    if (!filteredProducts.length) {

        results.innerHTML = `

            <div
                class="enterprise-inventory__empty"
            >

                <h2>
                    No encontramos productos
                </h2>

                <p>
                    Prueba con otro nombre de producto.
                </p>

            </div>

        `;

        return;

    }


    results.innerHTML = `

        <div
            class="enterprise-inventory__new-product-list"
        >

            ${filteredProducts.map(
                product => {

                    const variants =
                        Array.isArray(
                            product?.variants
                        )
                            ? product.variants
                            : [];


                    const activeVariants =
                        variants.filter(
                            variant =>
                                variant?.active !== false
                        );


                    const status =
                        product?.active === false
                            ? "Inactivo"
                            : "Activo";


                    const statusClass =
                        product?.active === false
                            ? "inactive"
                            : "active";


                    return `

                        <article
                            class="
                                enterprise-inventory__new-product
                                enterprise-inventory__new-product--${statusClass}
                            "
                        >

                            <div
                                class="enterprise-inventory__new-product-main"
                            >

                                <div
                                    class="enterprise-inventory__new-product-icon"
                                >
                                    <i class="fa-solid fa-box"></i>
                                </div>


                                <div>

                                    <h3>
                                        ${
                                            escapeInventoryHTML(
                                                product?.name ||
                                                "Producto sin nombre"
                                            )
                                        }
                                    </h3>


                                    <p>
                                        ${
                                            activeVariants.length
                                        }
                                        ${
                                            activeVariants.length === 1
                                                ? "variante activa"
                                                : "variantes activas"
                                        }
                                    </p>

                                </div>

                            </div>


                            <div
                                class="enterprise-inventory__new-product-side"
                            >

                                <span
                                    class="
                                        enterprise-inventory__new-status
                                        enterprise-inventory__new-status--${statusClass}
                                    "
                                >
                                    ${status}
                                </span>


                                <button
                                    type="button"
                                    class="enterprise-inventory__card-action"
                                    data-select-product-id="${
                                        escapeInventoryHTML(
                                            product?.id || ""
                                        )
                                    }"
                                >
                                    Seleccionar
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>

                            </div>

                        </article>

                    `;

                }
            ).join("")}

        </div>

    `;


    results
        .querySelectorAll(
            "[data-select-product-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const productId =
                            button.dataset
                                .selectProductId;


                        const product =
                            newInventoryProducts.find(
                                item =>
                                    String(
                                        item?.id
                                    ) === String(
                                        productId
                                    )
                            );


                        if (!product) {
                            return;
                        }


                        selectNewInventoryProduct(
                            product
                        );

                    }
                );

            }
        );

}


function selectNewInventoryProduct(
    product
) {

    const container =
        document.querySelector(
            "#enterprise-inventory-content"
        );


    if (!container) {
        return;
    }


    const variants =
        Array.isArray(
            product?.variants
        )
            ? product.variants
            : [];


    container.innerHTML = `

        <div
            class="enterprise-inventory__new"
        >

            <div
                class="enterprise-inventory__new-header"
            >

                <div>

                    <span>
                        Nuevo inventario
                    </span>

                    <h2>
                        Seleccionar variante
                    </h2>

                    <p>
                        Producto: <strong>${escapeInventoryHTML(
                            product?.name ||
                            "Producto sin nombre"
                        )}</strong>
                    </p>

                </div>


                <button
                    type="button"
                    class="enterprise-inventory__card-action"
                    id="enterprise-inventory-new-back-to-products"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Cambiar producto
                </button>

            </div>


            <div
                class="enterprise-inventory__new-search"
            >

                <label
                    for="enterprise-inventory-variant-search"
                >
                    Buscar variante
                </label>

                <div
                    class="enterprise-inventory__new-search-input"
                >

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="search"
                        id="enterprise-inventory-variant-search"
                        autocomplete="off"
                        placeholder="Ej. blanco, negro, rojo..."
                    />

                </div>

            </div>


            <div
                class="enterprise-inventory__new-results"
                id="enterprise-inventory-variant-results"
            ></div>


            <div
                class="enterprise-inventory__new-selected"
                id="enterprise-inventory-variant-selected"
                hidden
            ></div>

        </div>

    `;


    const backButton =
        document.querySelector(
            "#enterprise-inventory-new-back-to-products"
        );


    backButton?.addEventListener(
        "click",
        async () => {

            // Volvemos a la etapa de búsqueda de producto
            // sin modificar Firestore.
            await renderNewInventoryProductSelector(
                container
            );

        }
    );


    const searchInput =
        document.querySelector(
            "#enterprise-inventory-variant-search"
        );


    const results =
        document.querySelector(
            "#enterprise-inventory-variant-results"
        );


    renderNewInventoryVariantResults(
        results,
        variants,
        ""
    );


    searchInput?.addEventListener(
        "input",
        () => {

            renderNewInventoryVariantResults(
                results,
                variants,
                searchInput.value
            );

        }
    );


    searchInput?.focus();

}


function renderNewInventoryVariantResults(
    results,
    variants,
    searchTerm = ""
) {

    if (!results) {
        return;
    }


    const normalizedSearch =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        variants.filter(
            variant => {

                const name =
                    String(
                        variant?.name ||
                        variant?.colorName ||
                        ""
                    ).toLowerCase();

                const id =
                    String(
                        variant?.id ||
                        ""
                    ).toLowerCase();

                return (
                    !normalizedSearch ||
                    name.includes(
                        normalizedSearch
                    ) ||
                    id.includes(
                        normalizedSearch
                    )
                );

            }
        );


    if (!filtered.length) {

        results.innerHTML = `
            <div
                class="enterprise-inventory__empty"
            >

                <h2>
                    No encontramos esa variante
                </h2>

                <p>
                    Prueba con otro nombre de variante.
                </p>

            </div>
        `;

        return;
    }


    results.innerHTML = `

        <div
            class="enterprise-inventory__new-product-list"
        >

            ${filtered.map(
                (variant, index) => {

                    const active =
                        variant?.active !== false;

                    const name =
                        variant?.name ||
                        variant?.colorName ||
                        `Variante ${index + 1}`;

                    const sizes =
                        Array.isArray(
                            variant?.sizes
                        )
                            ? variant.sizes
                            : [];

                    const activeSizes =
                        sizes.filter(
                            size =>
                                size?.active !== false
                        );

                    const image =
                        Array.isArray(
                            variant?.images
                        )
                            ? variant.images[0]
                            : variant?.image ||
                              "";

                    const safeId =
                        escapeInventoryHTML(
                            variant?.id ||
                            `variant-${index}`
                        );

                    return `

                        <article
                            class="
                                enterprise-inventory__new-product
                                enterprise-inventory__new-variant
                                ${
                                    active
                                        ? "enterprise-inventory__new-product--active"
                                        : "enterprise-inventory__new-product--inactive"
                                }
                            "
                        >

                            <div
                                class="enterprise-inventory__new-product-main"
                            >

                                <div
                                    class="enterprise-inventory__new-product-icon"
                                >

                                    ${
                                        image
                                            ? `
                                                <img
                                                    src="${escapeInventoryHTML(image)}"
                                                    alt="${escapeInventoryHTML(name)}"
                                                />
                                            `
                                            : `
                                                <i class="fa-solid fa-palette"></i>
                                            `
                                    }

                                </div>


                                <div>

                                    <h3>
                                        ${escapeInventoryHTML(name)}
                                    </h3>

                                    <p>
                                        ${
                                            sizes.length
                                                ? `${sizes.length} ${sizes.length === 1 ? "talla" : "tallas"} · ${activeSizes.length} activas`
                                                : "Sin tallas configuradas"
                                        }
                                    </p>

                                </div>

                            </div>


                            <div
                                class="enterprise-inventory__new-product-side"
                            >

                                <span
                                    class="
                                        enterprise-inventory__new-status
                                        ${
                                            active
                                                ? "enterprise-inventory__new-status--active"
                                                : "enterprise-inventory__new-status--inactive"
                                        }
                                    "
                                >
                                    ${
                                        active
                                            ? "Disponible"
                                            : "No disponible"
                                    }
                                </span>

                                <button
                                    type="button"
                                    class="enterprise-inventory__card-action"
                                    data-select-variant-id="${safeId}"
                                    ${active ? "" : "disabled"}
                                >
                                    ${
                                        active
                                            ? "Seleccionar"
                                            : "No disponible"
                                    }

                                    ${
                                        active
                                            ? `<i class="fa-solid fa-arrow-right"></i>`
                                            : ""
                                    }
                                </button>

                            </div>

                        </article>

                    `;

                }
            ).join("")}

        </div>

    `;


    const selectButtons =
        results.querySelectorAll(
            "[data-select-variant-id]"
        );


    selectButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const variantId =
                        button.dataset
                            .selectVariantId;

                    const variant =
                        variants.find(
                            item =>
                                String(
                                    item?.id
                                ) === String(
                                    variantId
                                )
                        );

                    if (!variant) {
                        return;
                    }

                    selectNewInventoryVariant(
                        variant
                    );

                }
            );

        }
    );

}


function selectNewInventoryVariant(
    variant
) {

    const selected =
        document.querySelector(
            "#enterprise-inventory-variant-selected"
        );


    if (!selected) {
        return;
    }


    const sizes =
        Array.isArray(
            variant?.sizes
        )
            ? variant.sizes
            : [];


    const activeSizes =
        sizes.filter(
            size =>
                size?.active !== false
        );


    selected.hidden = false;

    selected.innerHTML = `

        <div
            class="enterprise-inventory__new-selected-card"
        >

            <div>

                <span>
                    Variante seleccionada
                </span>

                <h3>
                    ${escapeInventoryHTML(
                        variant?.name ||
                        variant?.colorName ||
                        "Variante"
                    )}
                </h3>

                <p>
                    ${activeSizes.length}
                    ${
                        activeSizes.length === 1
                            ? "talla activa"
                            : "tallas activas"
                    }
                </p>

            </div>


            <div
                class="enterprise-inventory__new-selected-badge"
            >
                <i class="fa-solid fa-check"></i>
                Seleccionada
            </div>

        </div>


        <div
            class="enterprise-inventory__new-next"
        >

            <div>

                <strong>
                    Siguiente paso
                </strong>

                <span>
                    Seleccionar talla.
                </span>

            </div>


            <button
                type="button"
                class="enterprise-inventory__new-next-button"
                id="enterprise-inventory-new-next-variant"
                ${activeSizes.length ? "" : "disabled"}
            >
                Seleccionar talla
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        </div>

        ${
            activeSizes.length
                ? ""
                : `
                    <div class="enterprise-inventory__new-validation enterprise-inventory__new-validation--warning">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <div>
                            <strong>Esta variante no tiene tallas disponibles.</strong>
                            <span>No es posible ingresar inventario para esta variante.</span>
                        </div>
                    </div>
                `
        }

    `;


    document
        .querySelector(
            "#enterprise-inventory-new-next-variant"
        )
        ?.addEventListener(
            "click",
            () => {

                renderNewInventorySizeSelector(
                    variant
                );

            }
        );

}


function renderNewInventorySizeSelector(
    variant
) {

    const container =
        document.querySelector(
            "#enterprise-inventory-content"
        );


    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const productId =
        params.get("product");


    // El producto se conserva en memoria durante el flujo
    // porque esta vista se construye desde el selector anterior.
    const selectedProduct =
        newInventoryProducts.find(
            product =>
                Array.isArray(product?.variants) &&
                product.variants.some(
                    item =>
                        String(item?.id) ===
                        String(variant?.id)
                )
        );


    const resolvedProductId =
        selectedProduct?.id ||
        productId ||
        "";


    const sizes =
        Array.isArray(variant?.sizes)
            ? variant.sizes
            : [];


    container.innerHTML = `

        <div
            class="enterprise-inventory__new"
        >

            <div
                class="enterprise-inventory__new-header"
            >

                <div>

                    <span>
                        Nuevo inventario
                    </span>

                    <h2>
                        Seleccionar talla
                    </h2>

                    <p>
                        Variante:
                        <strong>${escapeInventoryHTML(
                            variant?.name ||
                            variant?.colorName ||
                            "Variante"
                        )}</strong>
                    </p>

                </div>


                <button
                    type="button"
                    class="enterprise-inventory__card-action"
                    id="enterprise-inventory-new-back-to-variant"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Cambiar variante
                </button>

            </div>


            <div
                class="enterprise-inventory__new-results"
                id="enterprise-inventory-size-results"
            ></div>


            <div
                class="enterprise-inventory__new-selected"
                id="enterprise-inventory-size-selected"
                hidden
            ></div>

        </div>

    `;


    document
        .querySelector(
            "#enterprise-inventory-new-back-to-variant"
        )
        ?.addEventListener(
            "click",
            () => {

                if (selectedProduct) {

                    selectNewInventoryProduct(
                        selectedProduct
                    );

                }

            }
        );


    renderNewInventorySizeResults(
        document.querySelector(
            "#enterprise-inventory-size-results"
        ),
        sizes,
        {
            productId: resolvedProductId,
            variantId: variant?.id || ""
        }
    );

}


async function renderNewInventorySizeResults(
    results,
    sizes,
    context
) {

    if (!results) {
        return;
    }


    if (!Array.isArray(sizes) || !sizes.length) {

        results.innerHTML = `
            <div class="enterprise-inventory__empty">
                <h2>No hay tallas configuradas</h2>
                <p>Esta variante no tiene tallas disponibles para seleccionar.</p>
            </div>
        `;

        return;
    }


    let inventory = [];

    try {
        inventory = await getInventory();
    } catch (error) {
        console.warn(
            "No se pudo consultar inventario para validar las tallas:",
            error
        );
    }


    const activeInventory =
        Array.isArray(inventory)
            ? inventory
            : [];


    results.innerHTML = `

        <div class="enterprise-inventory__new-product-list enterprise-inventory__new-size-list">

            ${sizes.map(
                (size, index) => {

                    const active =
                        size?.active !== false;

                    const sizeId =
                        String(
                            size?.id ||
                            `size-${index}`
                        );

                    const existing =
                        activeInventory.some(
                            item =>
                                String(item?.productId) === String(context.productId) &&
                                String(item?.variantId) === String(context.variantId) &&
                                String(item?.sizeId) === sizeId
                        );

                    const hasSku =
                        Boolean(
                            size?.sku
                        );

                    const available =
                        active &&
                        hasSku &&
                        !existing;

                    const status =
                        !active
                            ? "No disponible"
                            : !hasSku
                                ? "Sin SKU"
                                : existing
                                    ? "Ya existe"
                                    : "Disponible";

                    const statusClass =
                        available
                            ? "active"
                            : "inactive";

                    return `

                        <article
                            class="enterprise-inventory__new-product enterprise-inventory__new-size-card ${
                                available
                                    ? "enterprise-inventory__new-product--active"
                                    : "enterprise-inventory__new-product--inactive"
                            }"
                        >

                            <div class="enterprise-inventory__new-product-main">

                                <div class="enterprise-inventory__new-product-icon enterprise-inventory__new-size-icon">
                                    <i class="fa-solid fa-ruler-combined"></i>
                                </div>

                                <div>
                                    <h3>
                                        ${escapeInventoryHTML(
                                            size?.name ||
                                            "Talla sin nombre"
                                        )}
                                    </h3>

                                    <p>
                                        SKU:
                                        ${escapeInventoryHTML(
                                            size?.sku ||
                                            "Sin SKU"
                                        )}
                                    </p>
                                </div>

                            </div>


                            <div class="enterprise-inventory__new-product-side">

                                <span
                                    class="enterprise-inventory__new-status enterprise-inventory__new-status--${statusClass}"
                                >
                                    ${status}
                                </span>

                                <button
                                    type="button"
                                    class="enterprise-inventory__card-action"
                                    data-select-size-id="${escapeInventoryHTML(sizeId)}"
                                    ${available ? "" : "disabled"}
                                >
                                    ${
                                        available
                                            ? "Seleccionar"
                                            : status
                                    }
                                    ${
                                        available
                                            ? `<i class="fa-solid fa-arrow-right"></i>`
                                            : ""
                                    }
                                </button>

                            </div>

                        </article>

                    `;

                }
            ).join("")}

        </div>

    `;


    results
        .querySelectorAll(
            "[data-select-size-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const sizeId =
                            button.dataset.selectSizeId;

                        const size =
                            sizes.find(
                                item =>
                                    String(item?.id) ===
                                    String(sizeId)
                            );

                        if (!size) {
                            return;
                        }

                        renderNewInventoryStockForm(
                            context.productId,
                            context.variantId,
                            size
                        );

                    }
                );

            }
        );

}


function renderNewInventoryStockForm(
    productId,
    variantId,
    size
) {

    const container =
        document.querySelector(
            "#enterprise-inventory-content"
        );


    const selected =
        document.querySelector(
            "#enterprise-inventory-size-selected"
        );


    if (!container) {
        return;
    }


    if (selected) {

        selected.hidden = false;

        selected.innerHTML = `
            <div class="enterprise-inventory__new-validation enterprise-inventory__new-validation--success">
                <i class="fa-solid fa-check"></i>
                <div>
                    <strong>Talla disponible para crear inventario.</strong>
                    <span>${escapeInventoryHTML(size?.name || "Talla")}</span>
                </div>
            </div>
        `;

    }


    const form = document.createElement("div");

    form.className =
        "enterprise-inventory__new-stock-form";

    form.innerHTML = `

        <div class="enterprise-inventory__new-stock-header">
            <div>
                <span>Último paso</span>
                <h3>Stock inicial</h3>
                <p>Ingresa la cantidad con la que comenzará este inventario.</p>
            </div>
        </div>

        <label class="enterprise-inventory__new-stock-field">
            <span>Stock inicial</span>
            <input
                type="number"
                id="enterprise-inventory-new-stock"
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="Ej. 10"
            />
        </label>

        <div
            class="enterprise-inventory__new-validation enterprise-inventory__new-validation--info"
            id="enterprise-inventory-new-stock-error"
            hidden
        ></div>

        <div class="enterprise-inventory__new-stock-actions">
            <button
                type="button"
                class="enterprise-inventory__card-action"
                id="enterprise-inventory-new-stock-cancel"
            >
                Volver
            </button>

            <button
                type="button"
                class="enterprise-inventory__new-next-button"
                id="enterprise-inventory-new-stock-submit"
            >
                Crear inventario
                <i class="fa-solid fa-check"></i>
            </button>
        </div>

    `;


    container
        .querySelector(
            ".enterprise-inventory__new"
        )
        ?.appendChild(form);


    const stockInput =
        form.querySelector(
            "#enterprise-inventory-new-stock"
        );

    const errorBox =
        form.querySelector(
            "#enterprise-inventory-new-stock-error"
        );

    const submitButton =
        form.querySelector(
            "#enterprise-inventory-new-stock-submit"
        );

    const cancelButton =
        form.querySelector(
            "#enterprise-inventory-new-stock-cancel"
        );


    cancelButton?.addEventListener(
        "click",
        () => {

            form.remove();

            if (selected) {
                selected.hidden = true;
                selected.innerHTML = "";
            }

        }
    );


    stockInput?.focus();


    submitButton?.addEventListener(
        "click",
        async () => {

            const stock =
                Number(
                    stockInput?.value
                );

            if (
                !Number.isInteger(stock) ||
                stock <= 0
            ) {

                errorBox.textContent =
                    "El stock inicial debe ser un número entero mayor que 0.";

                errorBox.hidden = false;
                stockInput?.focus();
                return;
            }


            try {

                submitButton.disabled = true;
                submitButton.textContent =
                    "Creando...";

                errorBox.hidden = true;


                const inventoryId =
                    await createInventory(
                        productId,
                        variantId,
                        size?.id,
                        stock
                    );


                console.log(
                    "✓ Nuevo inventario creado desde el flujo:",
                    inventoryId
                );

                window.location.href =
                    `/enterprise/inventory?id=${inventoryId}`;

            } catch (error) {

                console.error(
                    "Error creando inventario:",
                    error
                );

                errorBox.textContent =
                    error.message ||
                    "No se pudo crear el inventario.";

                errorBox.hidden = false;

                submitButton.disabled = false;
                submitButton.textContent =
                    "Crear inventario";

            }

        }
    );

}


function escapeInventoryHTML(
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
// RENDER DETAIL
// ========================================

async function renderInventoryDetail(
    container,
    inventoryId
) {

    try {

        const item =
            await getInventoryItem(
                inventoryId
            );


        console.log(
            "✓ Inventory detalle cargado:",
            item
        );


        // =================================
        // NOT FOUND
        // =================================

        if (!item) {

            container.innerHTML = `

                <div
                    class="enterprise-inventory__empty"
                >

                    <h2>
                        Inventario no encontrado
                    </h2>

                    <p>
                        El registro solicitado
                        no existe.
                    </p>


                    <button
                        type="button"
                        class="enterprise-inventory__card-action"
                        id="enterprise-inventory-back"
                    >

                        <i class="fa-solid fa-arrow-left"></i>

                        Volver al inventario

                    </button>

                </div>

            `;


            initBackButton();

            return;

        }


        // =================================
        // LOAD MOVEMENTS
        // =================================

        const movements =
            await getInventoryMovementsByInventoryId(
                inventoryId
            );


        console.log(
            "✓ Movimientos de Inventory cargados:",
            movements
        );


        // =================================
        // DETAIL VIEW
        // =================================

        container.innerHTML = `

            <div
                class="enterprise-inventory__detail"
            >

                <button
                    type="button"
                    class="enterprise-inventory__back"
                    id="enterprise-inventory-back"
                >

                    <i class="fa-solid fa-arrow-left"></i>

                    Volver al inventario

                </button>


                <div
                    class="enterprise-inventory__detail-header"
                >

                    <div>

                        <span>
                            Inventario
                        </span>

                        <h2>
                            ${
                                item.productName ||
                                "Producto sin nombre"
                            }
                        </h2>

                        <p>
                            ${
                                item.variantName ||
                                "Sin variante"
                            }
                            ·
                            ${
                                item.sizeName ||
                                "Sin talla"
                            }
                        </p>

                    </div>


                    <div
                        class="enterprise-inventory__detail-stock"
                    >

                        <strong>
                            ${
                                item.stock ?? 0
                            }
                        </strong>

                        <span>
                            Stock actual
                        </span>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-info"
                >

                    <div>

                        <span>
                            SKU
                        </span>

                        <strong>
                            ${
                                item.sku ||
                                "Sin SKU"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Variante
                        </span>

                        <strong>
                            ${
                                item.variantName ||
                                "Sin variante"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Talla
                        </span>

                        <strong>
                            ${
                                item.sizeName ||
                                "Sin talla"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Estado catálogo
                        </span>

                        <strong>
                            ${
                                item.catalogStatus ===
                                "active"
                                    ? "Activo"
                                    : "Retirado"
                            }
                        </strong>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-actions"
                >

                    <button
                        type="button"
                        class="enterprise-inventory__action enterprise-inventory__action--entry"
                        id="enterprise-inventory-entry-button"
                    >

                        <i class="fa-solid fa-arrow-down"></i>

                        Registrar entrada

                    </button>


                    <button
                        type="button"
                        class="enterprise-inventory__action enterprise-inventory__action--exit"
                        id="enterprise-inventory-exit-button"
                    >

                        <i class="fa-solid fa-arrow-up"></i>

                        Registrar salida

                    </button>

                    <button
                        type="button"
                        class="enterprise-inventory__action enterprise-inventory__action--adjustment"
                        id="enterprise-inventory-adjustment-button"
                    >

                        <i class="fa-solid fa-scale-balanced"></i>

                        Ajustar inventario

                    </button>

                </div>


                <div
                    class="enterprise-inventory__entry-form"
                    id="enterprise-inventory-entry-form"
                    hidden
                >

                    <div
                        class="enterprise-inventory__entry-form-header"
                    >

                        <div>

                            <span>
                                Entrada de inventario
                            </span>

                            <h3>
                                Registrar ingreso
                            </h3>

                        </div>

                        <button
                            type="button"
                            class="enterprise-inventory__entry-close"
                            id="enterprise-inventory-entry-close"
                            aria-label="Cerrar"
                        >

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>


                    <div
                        class="enterprise-inventory__entry-form-body"
                    >

                        <label>

                            <span>
                                Cantidad
                            </span>

                            <input
                                type="number"
                                id="enterprise-inventory-entry-quantity"
                                min="1"
                                step="1"
                                inputmode="numeric"
                                placeholder="Ej. 5"
                            />

                        </label>


                        <label>

                            <span>
                                Motivo
                            </span>

                            <select
                                id="enterprise-inventory-entry-reason"
                            >

                                <option value="purchase">
                                    Compra
                                </option>

                                <option value="return">
                                    Devolución
                                </option>

                                <option value="initial_stock">
                                    Inventario inicial
                                </option>

                                <option value="other">
                                    Otro
                                </option>

                            </select>

                        </label>


                        <label>

                            <span>
                                Notas
                            </span>

                            <textarea
                                id="enterprise-inventory-entry-notes"
                                rows="3"
                                placeholder="Opcional"
                            ></textarea>

                        </label>


                        <div
                            class="enterprise-inventory__entry-form-error"
                            id="enterprise-inventory-entry-error"
                            hidden
                        ></div>


                        <div
                            class="enterprise-inventory__entry-form-actions"
                        >

                            <button
                                type="button"
                                class="enterprise-inventory__entry-cancel"
                                id="enterprise-inventory-entry-cancel"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                class="enterprise-inventory__entry-submit"
                                id="enterprise-inventory-entry-submit"
                            >
                                Registrar entrada
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__exit-form"
                    id="enterprise-inventory-exit-form"
                    hidden
                >

                    <div
                        class="enterprise-inventory__exit-form-header"
                    >

                        <div>

                            <span>
                                Salida de inventario
                            </span>

                            <h3>
                                Registrar salida
                            </h3>

                        </div>

                        <button
                            type="button"
                            class="enterprise-inventory__exit-close"
                            id="enterprise-inventory-exit-close"
                            aria-label="Cerrar"
                        >

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>


                    <div
                        class="enterprise-inventory__exit-form-body"
                    >

                        <div
                            class="enterprise-inventory__exit-stock-reference"
                        >

                            <span>
                                Stock disponible
                            </span>

                            <strong>
                                ${
                                    item.stock ?? 0
                                }
                            </strong>

                        </div>


                        <label>

                            <span>
                                Cantidad
                            </span>

                            <input
                                type="number"
                                id="enterprise-inventory-exit-quantity"
                                min="1"
                                step="1"
                                inputmode="numeric"
                                placeholder="Ej. 5"
                            />

                        </label>


                        <label>

                            <span>
                                Motivo
                            </span>

                            <select
                                id="enterprise-inventory-exit-reason"
                            >

                                <option value="sale">
                                    Venta
                                </option>

                                <option value="damage">
                                    Daño / pérdida
                                </option>

                                <option value="transfer">
                                    Traslado
                                </option>

                                <option value="other">
                                    Otro
                                </option>

                            </select>

                        </label>


                        <label>

                            <span>
                                Notas
                            </span>

                            <textarea
                                id="enterprise-inventory-exit-notes"
                                rows="3"
                                placeholder="Opcional"
                            ></textarea>

                        </label>


                        <div
                            class="enterprise-inventory__exit-form-error"
                            id="enterprise-inventory-exit-error"
                            hidden
                        ></div>


                        <div
                            class="enterprise-inventory__exit-form-actions"
                        >

                            <button
                                type="button"
                                class="enterprise-inventory__exit-cancel"
                                id="enterprise-inventory-exit-cancel"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                class="enterprise-inventory__exit-submit"
                                id="enterprise-inventory-exit-submit"
                            >
                                Registrar salida
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__adjustment-form"
                    id="enterprise-inventory-adjustment-form"
                    hidden
                >

                    <div
                        class="enterprise-inventory__adjustment-form-header"
                    >

                        <div>

                            <span>
                                Ajuste de inventario
                            </span>

                            <h3>
                                Corregir stock físico
                            </h3>

                        </div>

                        <button
                            type="button"
                            class="enterprise-inventory__adjustment-close"
                            id="enterprise-inventory-adjustment-close"
                            aria-label="Cerrar"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>

                    </div>

                    <div
                        class="enterprise-inventory__adjustment-form-body"
                    >

                        <div
                            class="enterprise-inventory__adjustment-system-stock"
                        >
                            <span>Stock del sistema</span>
                            <strong>${item.stock ?? 0}</strong>
                        </div>

                        <label>
                            <span>Stock físico</span>
                            <input
                                type="number"
                                id="enterprise-inventory-adjustment-physical-stock"
                                min="0"
                                step="1"
                                inputmode="numeric"
                                placeholder="Ej. 18"
                            />
                        </label>

                        <div
                            class="enterprise-inventory__adjustment-preview"
                            id="enterprise-inventory-adjustment-preview"
                            hidden
                        >
                            <span>Diferencia</span>
                            <strong id="enterprise-inventory-adjustment-difference">0</strong>
                        </div>

                        <label>
                            <span>Motivo</span>
                            <select id="enterprise-inventory-adjustment-reason">
                                <option value="physical_count">Conteo físico</option>
                                <option value="damage">Daño / pérdida</option>
                                <option value="correction">Corrección</option>
                                <option value="other">Otro</option>
                            </select>
                        </label>

                        <label>
                            <span>Notas</span>
                            <textarea
                                id="enterprise-inventory-adjustment-notes"
                                rows="3"
                                placeholder="Ej. Conteo físico realizado en bodega."
                            ></textarea>
                        </label>

                        <div
                            class="enterprise-inventory__adjustment-form-error"
                            id="enterprise-inventory-adjustment-error"
                            hidden
                        ></div>

                        <div
                            class="enterprise-inventory__adjustment-form-actions"
                        >

                            <button
                                type="button"
                                class="enterprise-inventory__adjustment-cancel"
                                id="enterprise-inventory-adjustment-cancel"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                class="enterprise-inventory__adjustment-submit"
                                id="enterprise-inventory-adjustment-submit"
                            >
                                Guardar ajuste
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-movements"
                >

                    <div
                        class="enterprise-inventory__detail-section-header"
                    >

                        <div>

                            <span>
                                Historial
                            </span>

                            <h3>
                                Movimientos de inventario
                            </h3>

                        </div>

                        <strong>
                            ${movements.length}
                        </strong>

                    </div>


                    ${
                        movements.length
                            ? `
                                <div
                                    class="enterprise-inventory__movement-list"
                                >

                                    ${movements.map(
                                        movement => `

                                            <div
                                                class="
                                                    enterprise-inventory__movement
                                                    enterprise-inventory__movement--${movement.type || "unknown"}
                                                "
                                            >

                                                <div
                                                    class="enterprise-inventory__movement-main"
                                                >

                                                    <strong>
                                                        ${
                                                            movement.type === "entry"
                                                                ? "Entrada"
                                                                : movement.type === "exit"
                                                                    ? "Salida"
                                                                    : movement.type === "adjustment"
                                                                        ? "Ajuste"
                                                                        : "Movimiento"
                                                        }
                                                    </strong>

                                                    <span>
                                                        ${
                                                            movement.reason ||
                                                            "Sin motivo"
                                                        }
                                                    </span>

                                                    ${
                                                        movement.notes
                                                            ? `
                                                                <small
                                                                    class="enterprise-inventory__movement-note"
                                                                >
                                                                    ${movement.notes}
                                                                </small>
                                                            `
                                                            : ""
                                                    }

                                                    ${
                                                        movement.createdBy
                                                            ? `
                                                                <small
                                                                    class="enterprise-inventory__movement-user"
                                                                >
                                                                    <i class="fa-solid fa-user"></i>

                                                                    ${
                                                                        movement.createdBy.name ||
                                                                        movement.createdBy.email ||
                                                                        "Usuario"
                                                                    }
                                                                </small>
                                                            `
                                                            : ""
                                                    }

                                                </div>


                                                <div
                                                    class="enterprise-inventory__movement-quantity"
                                                >

                                                    ${
                                                        movement.type === "entry"
                                                            ? "+"
                                                            : movement.type === "exit"
                                                                ? "-"
                                                                : movement.direction === "increase"
                                                                    ? "+"
                                                                    : "-"
                                                    }${
                                                        movement.quantity ?? 0
                                                    }

                                                </div>

                                            </div>

                                        `
                                    ).join("")}

                                </div>
                            `
                            : `
                                <div
                                    class="enterprise-inventory__movement-empty"
                                >

                                    No hay movimientos registrados
                                    para este inventario.

                                </div>
                            `
                    }

                </div>

            </div>

        `;


        initBackButton();

        initInventoryEntryForm(
            inventoryId
        );

        initInventoryExitForm(
            inventoryId
        );

        initInventoryAdjustmentForm(
            inventoryId,
            item.stock ?? 0
        );

    } catch (error) {

        console.error(
            "Error cargando detalle de Inventory:",
            error
        );


        container.innerHTML = `

            <div
                class="enterprise-inventory__error"
            >

                <h2>
                    No se pudo cargar el inventario
                </h2>

                <p>
                    Ocurrió un error al consultar
                    el registro solicitado.
                </p>


                <button
                    type="button"
                    class="enterprise-inventory__card-action"
                    id="enterprise-inventory-back"
                >

                    <i class="fa-solid fa-arrow-left"></i>

                    Volver al inventario

                </button>

            </div>

        `;


        initBackButton();

    }

}


// ========================================
// INVENTORY ENTRY FORM
// ========================================

function initInventoryEntryForm(
    inventoryId
) {

    const openButton =
        document.querySelector(
            "#enterprise-inventory-entry-button"
        );

    const form =
        document.querySelector(
            "#enterprise-inventory-entry-form"
        );

    const closeButton =
        document.querySelector(
            "#enterprise-inventory-entry-close"
        );

    const cancelButton =
        document.querySelector(
            "#enterprise-inventory-entry-cancel"
        );

    const submitButton =
        document.querySelector(
            "#enterprise-inventory-entry-submit"
        );

    const quantityInput =
        document.querySelector(
            "#enterprise-inventory-entry-quantity"
        );

    const reasonInput =
        document.querySelector(
            "#enterprise-inventory-entry-reason"
        );

    const notesInput =
        document.querySelector(
            "#enterprise-inventory-entry-notes"
        );

    const errorBox =
        document.querySelector(
            "#enterprise-inventory-entry-error"
        );


    if (
        !openButton ||
        !form ||
        !closeButton ||
        !cancelButton ||
        !submitButton ||
        !quantityInput ||
        !reasonInput ||
        !notesInput ||
        !errorBox
    ) {

        console.error(
            "No se pudo inicializar el formulario de entrada."
        );

        return;

    }


    const closeForm =
        () => {

            form.hidden = true;

            errorBox.hidden = true;

            errorBox.textContent = "";

            quantityInput.value = "";

            reasonInput.value = "purchase";

            notesInput.value = "";

        };


    const openForm =
        () => {

            form.hidden = false;

            errorBox.hidden = true;

            quantityInput.focus();

        };


    openButton.addEventListener(
        "click",
        openForm
    );


    closeButton.addEventListener(
        "click",
        closeForm
    );


    cancelButton.addEventListener(
        "click",
        closeForm
    );


    submitButton.addEventListener(
        "click",
        async () => {

            const quantity =
                Number(
                    quantityInput.value
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                errorBox.textContent =
                    "La cantidad debe ser un número entero mayor que 0.";

                errorBox.hidden = false;

                quantityInput.focus();

                return;

            }


            const reason =
                reasonInput.value;


            const notes =
                notesInput.value.trim();


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Registrando...";

                errorBox.hidden = true;


                const result =
                    await registerInventoryEntry(
                        inventoryId,
                        quantity,
                        {
                            reason,
                            notes
                        }
                    );


                console.log(
                    "✓ Entrada registrada desde Inventory:",
                    result
                );


                // Recarga el detalle para reflejar
                // stock e historial inmediatamente.
                window.location.reload();

            } catch (error) {

                console.error(
                    "Error registrando entrada:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "No se pudo registrar la entrada.";

                errorBox.hidden = false;

                submitButton.disabled = false;

                submitButton.textContent =
                    "Registrar entrada";

            }

        }
    );

}

// ========================================
// INVENTORY EXIT FORM
// ========================================

function initInventoryExitForm(
    inventoryId
) {

    const openButton =
        document.querySelector(
            "#enterprise-inventory-exit-button"
        );

    const form =
        document.querySelector(
            "#enterprise-inventory-exit-form"
        );

    const closeButton =
        document.querySelector(
            "#enterprise-inventory-exit-close"
        );

    const cancelButton =
        document.querySelector(
            "#enterprise-inventory-exit-cancel"
        );

    const submitButton =
        document.querySelector(
            "#enterprise-inventory-exit-submit"
        );

    const quantityInput =
        document.querySelector(
            "#enterprise-inventory-exit-quantity"
        );

    const reasonInput =
        document.querySelector(
            "#enterprise-inventory-exit-reason"
        );

    const notesInput =
        document.querySelector(
            "#enterprise-inventory-exit-notes"
        );

    const errorBox =
        document.querySelector(
            "#enterprise-inventory-exit-error"
        );


    if (
        !openButton ||
        !form ||
        !closeButton ||
        !cancelButton ||
        !submitButton ||
        !quantityInput ||
        !reasonInput ||
        !notesInput ||
        !errorBox
    ) {

        console.error(
            "No se pudo inicializar el formulario de salida."
        );

        return;

    }


    const closeForm =
        () => {

            form.hidden = true;

            errorBox.hidden = true;

            errorBox.textContent = "";

            quantityInput.value = "";

            reasonInput.value = "sale";

            notesInput.value = "";

        };


    openButton.addEventListener(
        "click",
        () => {

            form.hidden = false;

            errorBox.hidden = true;

            quantityInput.focus();

        }
    );


    closeButton.addEventListener(
        "click",
        closeForm
    );


    cancelButton.addEventListener(
        "click",
        closeForm
    );


    submitButton.addEventListener(
        "click",
        async () => {

            const quantity =
                Number(
                    quantityInput.value
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                errorBox.textContent =
                    "La cantidad debe ser un número entero mayor que 0.";

                errorBox.hidden = false;

                quantityInput.focus();

                return;

            }


            const reason =
                reasonInput.value;


            const notes =
                notesInput.value.trim();


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Registrando...";

                errorBox.hidden = true;


                const result =
                    await registerInventoryExit(
                        inventoryId,
                        quantity,
                        {
                            reason,
                            notes
                        }
                    );


                console.log(
                    "✓ Salida registrada desde Inventory:",
                    result
                );


                window.location.reload();

            } catch (error) {

                console.error(
                    "Error registrando salida:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "No se pudo registrar la salida.";

                errorBox.hidden = false;

                submitButton.disabled = false;

                submitButton.textContent =
                    "Registrar salida";

            }

        }
    );

}

// ========================================
// INVENTORY ADJUSTMENT FORM
// ========================================

function initInventoryAdjustmentForm(
    inventoryId,
    currentStock
) {

    const openButton =
        document.querySelector(
            "#enterprise-inventory-adjustment-button"
        );

    const form =
        document.querySelector(
            "#enterprise-inventory-adjustment-form"
        );

    const closeButton =
        document.querySelector(
            "#enterprise-inventory-adjustment-close"
        );

    const cancelButton =
        document.querySelector(
            "#enterprise-inventory-adjustment-cancel"
        );

    const submitButton =
        document.querySelector(
            "#enterprise-inventory-adjustment-submit"
        );

    const physicalStockInput =
        document.querySelector(
            "#enterprise-inventory-adjustment-physical-stock"
        );

    const reasonInput =
        document.querySelector(
            "#enterprise-inventory-adjustment-reason"
        );

    const notesInput =
        document.querySelector(
            "#enterprise-inventory-adjustment-notes"
        );

    const preview =
        document.querySelector(
            "#enterprise-inventory-adjustment-preview"
        );

    const differenceElement =
        document.querySelector(
            "#enterprise-inventory-adjustment-difference"
        );

    const errorBox =
        document.querySelector(
            "#enterprise-inventory-adjustment-error"
        );

    if (
        !openButton ||
        !form ||
        !closeButton ||
        !cancelButton ||
        !submitButton ||
        !physicalStockInput ||
        !reasonInput ||
        !notesInput ||
        !preview ||
        !differenceElement ||
        !errorBox
    ) {
        console.error(
            "No se pudo inicializar el formulario de ajuste."
        );
        return;
    }

    const resetForm = () => {
        form.hidden = true;
        physicalStockInput.value = "";
        reasonInput.value = "physical_count";
        notesInput.value = "";
        preview.hidden = true;
        differenceElement.textContent = "0";
        errorBox.hidden = true;
        errorBox.textContent = "";
        submitButton.disabled = false;
        submitButton.textContent = "Guardar ajuste";
    };

    const updatePreview = () => {
        const value = Number(
            physicalStockInput.value
        );

        if (
            physicalStockInput.value === "" ||
            !Number.isInteger(value) ||
            value < 0
        ) {
            preview.hidden = true;
            return;
        }

        const difference =
            value - Number(currentStock || 0);

        differenceElement.textContent =
            difference > 0
                ? `+${difference}`
                : `${difference}`;

        preview.hidden = false;
    };

    openButton.addEventListener(
        "click",
        () => {
            form.hidden = false;
            errorBox.hidden = true;
            physicalStockInput.focus();
        }
    );

    closeButton.addEventListener(
        "click",
        resetForm
    );

    cancelButton.addEventListener(
        "click",
        resetForm
    );

    physicalStockInput.addEventListener(
        "input",
        updatePreview
    );

    submitButton.addEventListener(
        "click",
        async () => {

            const physicalStock = Number(
                physicalStockInput.value
            );

            if (
                physicalStockInput.value === "" ||
                !Number.isInteger(physicalStock) ||
                physicalStock < 0
            ) {
                errorBox.textContent =
                    "El stock físico debe ser un número entero igual o mayor que 0.";
                errorBox.hidden = false;
                physicalStockInput.focus();
                return;
            }

            const difference =
                physicalStock - Number(currentStock || 0);

            if (difference === 0) {
                errorBox.textContent =
                    "El stock físico coincide con el stock del sistema. No es necesario realizar un ajuste.";
                errorBox.hidden = false;
                return;
            }

            try {
                submitButton.disabled = true;
                submitButton.textContent = "Guardando...";
                errorBox.hidden = true;

                const result =
                    await registerInventoryAdjustment(
                        inventoryId,
                        physicalStock,
                        {
                            reason: reasonInput.value,
                            notes: notesInput.value.trim()
                        }
                    );

                console.log(
                    "✓ Ajuste registrado desde Inventory:",
                    result
                );

                window.location.reload();

            } catch (error) {
                console.error(
                    "Error registrando ajuste:",
                    error
                );

                errorBox.textContent =
                    error.message ||
                    "No se pudo registrar el ajuste.";
                errorBox.hidden = false;
                submitButton.disabled = false;
                submitButton.textContent =
                    "Guardar ajuste";
            }
        }
    );
}


// ========================================
// BACK BUTTON
// ========================================

function initBackButton() {

    const backButton =
        document.querySelector(
            "#enterprise-inventory-back"
        );


    if (!backButton) {

        return;

    }


    backButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "/enterprise/inventory";

        }
    );

}
