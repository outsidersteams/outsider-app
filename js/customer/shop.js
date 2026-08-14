import { getProducts } from "../firebase/firestore.js";
import { CustomerMenu } from "../components/customerMenu.js";
import { CustomerFooter } from "../components/customerFooter.js";
import { ProductCard } from "../components/productCard.js";
import { CustomerShopNavigation } from "../components/customerShopNavigation.js";

let shopProducts = [];

let activeCategory = "all";

let searchQuery = "";

const SHOP_CATEGORIES = [
    {
        id: "all",
        label: "All"
    },
    {
        id: "tee",
        label: "T-Shirts"
    },
    {
        id: "hoodies",
        label: "Hoodies"
    },
    {
        id: "pants",
        label: "Pants"
    },
    {
        id: "caps",
        label: "Caps"
    }
];


// ========================================
// CUSTOMER SHOP
// ========================================

export function CustomerShop() {

    return `
        <main class="customer-shop">

            ${CustomerShopNavigation()}


            <section class="customer-shop__intro">

                <h1 class="customer-shop__title">
                    Productos
                </h1>

            </section>


            <section
                class="customer-shop__categories"
                aria-label="Categorías"
            >

                <div
                    class="customer-shop__categories-list"
                    id="customer-shop-categories"
                >
                    ${renderCategories()}
                </div>

            </section>


            <section
                class="customer-shop__products-section"
                aria-label="Productos"
            >

                <div
                    class="customer-shop__products"
                    id="customer-shop-products"
                >

                    <div class="customer-shop__loading">
                        Cargando...
                    </div>

                </div>

            </section>


            ${CustomerFooter()}

            ${CustomerMenu()}

        </main>
    `;
}


// ========================================
// INIT SHOP
// ========================================

export async function initCustomerShop() {

    const shop =
        document.querySelector(
            ".customer-shop"
        );

    if (!shop) return;


    initMenu();

    initSearch();


    const container =
        document.querySelector(
            "#customer-shop-products"
        );

    if (!container) return;


    try {

        const products =
            await getProducts();


        shopProducts =
            normalizePublicProducts(
                products
            );


        renderFilteredProducts();

        initCategories();


    } catch (error) {

        console.error(
            "Error cargando productos de Shop:",
            error
        );


        container.innerHTML = `
            <div class="customer-shop__error">
                No pudimos cargar los productos.
            </div>
        `;

    }

}


// ========================================
// NORMALIZE PRODUCTS
// ========================================

function normalizePublicProducts(
    products
) {

    return (
        Array.isArray(products)
            ? products
            : []
    )
    .filter(product =>
        product &&
        product.active !== false &&
        product.publishedActive?.web === true
    );

}


// ========================================
// CATEGORIES
// ========================================

function renderCategories() {

    return SHOP_CATEGORIES
        .map(category => `

            <button
                type="button"
                class="customer-shop__category ${
                    category.id === activeCategory
                        ? "is-active"
                        : ""
                }"
                data-category="${category.id}"
            >
                ${category.label}
            </button>

        `)
        .join("");

}


function initCategories() {

    const container =
        document.querySelector(
            "#customer-shop-categories"
        );

    if (!container) return;


    container.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-category]"
                );

            if (!button) return;


            const category =
                button.dataset.category;


            if (!category) return;


            activeCategory =
                category;


            container.innerHTML =
                renderCategories();


            renderFilteredProducts();

        }
    );

}


// ========================================
// FILTER PRODUCTS
// ========================================

function getFilteredProducts() {

    let products =
        shopProducts;


    // ----------------------------------------
    // CATEGORY
    // ----------------------------------------

    if (
        activeCategory !== "all"
    ) {

        products =
            products.filter(
                product =>
                    product.categoryId ===
                    activeCategory
            );

    }


    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    const normalizedQuery =
        searchQuery
            .trim()
            .toLowerCase();


    if (normalizedQuery) {

        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        )
                        .toLowerCase();


                    return name.includes(
                        normalizedQuery
                    );

                }
            );

    }


    return products;

}


function renderFilteredProducts() {

    const container =
        document.querySelector(
            "#customer-shop-products"
        );

    if (!container) return;


    const filteredProducts =
        getFilteredProducts();


    if (!filteredProducts.length) {

        if (searchQuery.trim()) {

            container.innerHTML = `
                <div class="customer-shop__empty">

                    No encontramos productos
                    para "${escapeHTML(searchQuery)}".

                </div>
            `;

        } else {

            container.innerHTML = `
                <div class="customer-shop__empty">

                    No hay productos disponibles
                    en esta categoría.

                </div>
            `;

        }

        return;
    }


    container.innerHTML =
        filteredProducts
            .map(product =>
                ProductCard(product)
            )
            .join("");

}


// ========================================
// SEARCH
// ========================================

function initSearch() {

    const searchButton =
        document.querySelector(
            "[data-customer-search]"
        );

    const search =
        document.querySelector(
            "#customer-shop-search"
        );

    const input =
        document.querySelector(
            "#customer-shop-search-input"
        );

    const closeButton =
        document.querySelector(
            "#customer-shop-search-close"
        );


    if (
        !searchButton ||
        !search ||
        !input ||
        !closeButton
    ) {
        return;
    }


    const openSearch = () => {

        search.classList.add(
            "is-open"
        );

        search.setAttribute(
            "aria-hidden",
            "false"
        );

        searchButton.setAttribute(
            "aria-expanded",
            "true"
        );


        requestAnimationFrame(() => {

            input.focus();

        });

    };


    const closeSearch = () => {

        /*
         * El foco debe salir del buscador
         * antes de ocultarlo con aria-hidden.
         */

        searchButton.focus();


        search.classList.remove(
            "is-open"
        );

        search.setAttribute(
            "aria-hidden",
            "true"
        );

        searchButton.setAttribute(
            "aria-expanded",
            "false"
        );


        input.value = "";

        searchQuery = "";

        renderFilteredProducts();

    };


    searchButton.addEventListener(
        "click",
        openSearch
    );


    closeButton.addEventListener(
        "click",
        closeSearch
    );


    input.addEventListener(
        "input",
        event => {

            searchQuery =
                event.target.value;


            renderFilteredProducts();

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                search.classList.contains(
                    "is-open"
                )
            ) {

                closeSearch();

            }

        }
    );

}


// ========================================
// MENU
// ========================================

function initMenu() {

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


        /*
         * Una vez abierto el menú,
         * el foco pasa al botón cerrar.
         */

        requestAnimationFrame(() => {

            closeButton.focus();

        });

    };


    const closeMenu = () => {

        /*
         * Primero devolvemos el foco
         * al botón que abrió el menú.
         *
         * Después ocultamos el menú.
         */

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


    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );


    menu.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest("a");

            if (!link) return;

            closeMenu();

        }
    );


    menuButton.addEventListener(
        "click",
        openMenu
    );


    closeButton.addEventListener(
        "click",
        closeMenu
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
// ESCAPE HTML
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