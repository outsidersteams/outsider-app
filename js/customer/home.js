import { getProducts, getPartners } from "../firebase/firestore.js";
import { CustomerNavigation } from "../components/customerNavigation.js";
import { CustomerMenu } from "../components/customerMenu.js";
import { CustomerEditorial } from "../components/customerEditorial.js";
import { ProductCarousel, PartnersCarousel, initPartnersCarousel } from "../components/productCarrusel.js";
import { CustomerFooter,initCustomerFooter } from "../components/customerFooter.js";
let homeProducts = [];
let homePartners = [];

export function CustomerHome() {
    return `
        <main class="customer-home">

            ${CustomerNavigation()}

            <section class="customer-home__hero">

                <div class="customer-home__hero-image">
                    <picture>
                        <source
                            media="(min-width: 1100px)"
                            srcset="/assets/hero-desktop.png"
                        >

                        <source
                            media="(min-width: 700px)"
                            srcset="/assets/hero-tablet.png"
                        >

                        <img
                            src="/assets/hero-mobile.png"
                            alt="Outsider"
                        >
                    </picture>
                </div>

                <div class="customer-home__hero-overlay"></div>

                <div class="customer-home__hero-content">

                    <img
                        class="customer-home__hero-logo"
                        src="/assets/outsider-logo.svg"
                        alt="Outsider"
                    >

                    <a
                        href="/shop"
                        class="customer-home__hero-button"
                        data-spa-link
                    >
                        Shop now
                    </a>

                </div>

                <span
                    class="customer-home__hero-scroll"
                    aria-hidden="true"
                ></span>

            </section>

            <section
                class="customer-home__product-section"
                id="customer-home-best-sellers"
            >
                <div class="customer-product-carousel__loading">
                    Cargando...
                </div>
            </section>

            ${CustomerEditorial()}

            <section
                class="customer-home__product-section"
                id="customer-home-latest-arrivals"
            >
                <div class="customer-product-carousel__loading">
                    Cargando...
                </div>
            </section>

            <section
                class="customer-home__partners-section"
                id="customer-home-partners"
            >
                <div class="customer-partners__loading">
                    Cargando...
                </div>
            </section>
            ${CustomerFooter()}
            ${CustomerMenu()}

        </main>
    `;
}

export async function initCustomerHome() {
    const menu = document.querySelector("#customer-menu");
    const menuButton = document.querySelector(
        ".customer-navigation__menu"
    );
    const closeButton = document.querySelector(
        "#customer-menu-close"
    );

    if (menu && menuButton && closeButton) {
        const openMenu = () => {
            menu.classList.add("is-open");
            menu.setAttribute("aria-hidden", "false");
            menuButton.setAttribute("aria-expanded", "true");
            document.body.classList.add("customer-menu-open");
        };

        const closeMenu = () => {
            menu.classList.remove("is-open");
            menu.setAttribute("aria-hidden", "true");
            menuButton.setAttribute("aria-expanded", "false");
            document.body.classList.remove("customer-menu-open");
        };

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", openMenu);
        closeButton.addEventListener("click", closeMenu);

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });
    }

    try {
        const [products, partners] = await Promise.all([
            getProducts(),
            getPartners()
        ]);

        homeProducts = normalizePublicProducts(products);
        homePartners = Array.isArray(partners)
            ? partners
            : [];

        renderHomeProductSections();
        renderHomePartners();
        initCustomerFooter();

    } catch (error) {
        console.error("Error cargando contenido de Home:", error);

        renderHomeProductError();
        renderHomePartnersError();
    }
}

function renderHomeProductSections() {
    const bestSellersContainer = document.querySelector(
        "#customer-home-best-sellers"
    );

    const latestArrivalsContainer = document.querySelector(
        "#customer-home-latest-arrivals"
    );

    if (bestSellersContainer) {
        bestSellersContainer.innerHTML = ProductCarousel(
            "bestSellers",
            homeProducts
        );
    }

    if (latestArrivalsContainer) {
        latestArrivalsContainer.innerHTML = ProductCarousel(
            "latestArrivals",
            homeProducts
        );
    }
}

function renderHomePartners() {
    const container = document.querySelector(
        "#customer-home-partners"
    );

    if (!container) return;

    container.innerHTML = PartnersCarousel(homePartners);
    initPartnersCarousel(container);
}

function renderHomeProductError() {
    const containers = [
        "#customer-home-best-sellers",
        "#customer-home-latest-arrivals"
    ];

    containers.forEach(selector => {
        const container = document.querySelector(selector);

        if (container) {
            container.innerHTML = `
                <div class="customer-product-carousel__empty">
                    No pudimos cargar los productos.
                </div>
            `;
        }
    });
}

function renderHomePartnersError() {
    const container = document.querySelector(
        "#customer-home-partners"
    );

    if (!container) return;

    container.innerHTML = `
        <div class="customer-partners__empty">
            No pudimos cargar los partners.
        </div>
    `;
}

function normalizePublicProducts(products) {
    return (Array.isArray(products) ? products : [])
        .filter(product =>
            product &&
            product.active !== false &&
            product.publishedActive?.web === true
        );
}
