const HOME_PRODUCT_SECTIONS = {
    bestSellers: {
        title: "Más vendidos",
        productIds: [
            "2cHYZVhC6upYsq6xE7H5",
            "SmjUsBZJgrinlXAg50CP"
        ],
        viewAllLabel: "Ver todo",
        viewAllHref: "/shop"
    },

    latestArrivals: {
        title: "Últimos ingresos",
        productIds: [
            "2cHYZVhC6upYsq6xE7H5",
            "SmjUsBZJgrinlXAg50CP"
        ],
        viewAllLabel: "Ver todo",
        viewAllHref: "/shop"
    }
};

export function ProductCarousel(sectionKey, products = []) {
    const section = HOME_PRODUCT_SECTIONS[sectionKey];

    if (!section) return "";

    const selectedProducts = section.productIds
        .map(productId =>
            products.find(product => product.id === productId)
        )
        .filter(Boolean);

    return `
        <section class="customer-product-carousel">

            <div class="customer-product-carousel__heading">
                <h2>${escapeHTML(section.title)}</h2>

                <a
                    href="${escapeHTML(section.viewAllHref)}"
                    data-spa-link
                >
                    ${escapeHTML(section.viewAllLabel)}
                </a>
            </div>

            <div class="customer-product-carousel__slider">
                ${
                    selectedProducts.length
                        ? selectedProducts
                            .map(renderProductCard)
                            .join("")
                        : `
                            <div class="customer-product-carousel__empty">
                                No hay productos seleccionados.
                            </div>
                        `
                }
            </div>

        </section>
    `;
}

export function renderHomeProductCarousels(products = []) {
    return `
        ${ProductCarousel("bestSellers", products)}
        ${ProductCarousel("latestArrivals", products)}
    `;
}

function renderProductCard(product) {
    const imageUrl = getProductImage(product);
    const price = getProductPrice(product);

    return `
        <a
            href="/product?product=${encodeURIComponent(product.id)}"
            class="customer-product-carousel__card"
            data-spa-link
        >
            <div class="customer-product-carousel__image">
                ${
                    imageUrl
                        ? `
                            <img
                                src="${escapeHTML(imageUrl)}"
                                alt="${escapeHTML(product.name || "Producto")}"
                                loading="lazy"
                            >
                        `
                        : ""
                }
            </div>

            <div class="customer-product-carousel__info">
                <h3>
                    ${escapeHTML(product.name || "Producto")}
                </h3>

                <span>
                    ${
                        price !== null
                            ? formatCurrency(price)
                            : "Consultar"
                    }
                </span>
            </div>
        </a>
    `;
}

function getProductPrice(product) {
    const variants = Array.isArray(product?.variants)
        ? product.variants
        : [];

    const activeVariants = variants.filter(
        variant => variant?.active !== false
    );

    const firstVariant =
        activeVariants[0] ||
        variants[0] ||
        null;

    const firstSize =
        Array.isArray(firstVariant?.sizes)
            ? (
                firstVariant.sizes.find(
                    size => size?.active !== false
                ) ||
                firstVariant.sizes[0]
            )
            : firstVariant;

    const rawPrice =
        firstSize?.price ??
        firstVariant?.price ??
        product?.price;

    return Number.isFinite(Number(rawPrice))
        ? Number(rawPrice)
        : null;
}

function getProductImage(product) {
    if (Array.isArray(product?.images)) {
        const image = product.images.find(
            value => Boolean(getImageUrl(value))
        );

        if (image) {
            return getImageUrl(image);
        }
    }

    const variants = Array.isArray(product?.variants)
        ? product.variants
        : [];

    const variant = variants.find(
        item =>
            Array.isArray(item?.images) &&
            getImageUrl(item.images[0])
    );

    return getImageUrl(variant?.images?.[0]);
}

function getImageUrl(value) {
    if (!value) return "";

    if (typeof value === "string") return value;

    if (typeof value === "object") {
        return String(
            value.url ||
            value.src ||
            value.fileUrl ||
            ""
        );
    }

    return "";
}

function formatCurrency(value) {
    return new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        maximumFractionDigits: 2
    }).format(Number(value));
}

const PARTNERS_COVER = {
    title: "OUTSIDER",
    subtitle: "PARTNERS"
};

export function PartnersCarousel(partners = []) {
    const items = Array.isArray(partners)
        ? partners.filter(Boolean)
        : [];

    return `
        <section
            class="customer-partners"
            aria-label="Outsider Partners"
        >

            <div class="customer-partners__header">
                <span class="customer-partners__eyebrow">
                    COMMUNITY
                </span>

                <div class="customer-partners__controls">
                    <button
                        type="button"
                        class="customer-partners__control customer-partners__control--prev"
                        data-partners-prev
                        aria-label="Partner anterior"
                    >
                        <span aria-hidden="true">←</span>
                    </button>

                    <button
                        type="button"
                        class="customer-partners__control customer-partners__control--next"
                        data-partners-next
                        aria-label="Siguiente partner"
                    >
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            <div
                class="customer-partners__slider"
                data-partners-slider
            >
                <div class="customer-partners__track">

                    <article class="customer-partners__cover">
                        <div class="customer-partners__cover-content">
                            <span>${PARTNERS_COVER.title}</span>
                            <span>${PARTNERS_COVER.subtitle}</span>
                        </div>
                    </article>

                    ${items.map(renderPartner).join("")}

                </div>
            </div>

        </section>
    `;
}

export function initPartnersCarousel(container) {
    if (!container) return;

    const slider = container.querySelector(
        "[data-partners-slider]"
    );

    const previousButton = container.querySelector(
        "[data-partners-prev]"
    );

    const nextButton = container.querySelector(
        "[data-partners-next]"
    );

    if (!slider) return;

    const getStep = () => {
        const slide = slider.querySelector(
            ".customer-partners__cover, .customer-partners__card"
        );

        if (!slide) return slider.clientWidth;

        const track = slider.querySelector(
            ".customer-partners__track"
        );

        const gap = track
            ? parseFloat(getComputedStyle(track).columnGap || "0")
            : 0;

        return slide.getBoundingClientRect().width + gap;
    };

    previousButton?.addEventListener("click", () => {
        slider.scrollBy({
            left: -getStep(),
            behavior: "smooth"
        });
    });

    nextButton?.addEventListener("click", () => {
        slider.scrollBy({
            left: getStep(),
            behavior: "smooth"
        });
    });

    const updateControls = () => {
        const maxScroll =
            slider.scrollWidth - slider.clientWidth;

        const hasOverflow = maxScroll > 2;

        if (previousButton) {
            previousButton.disabled =
                !hasOverflow || slider.scrollLeft <= 2;
        }

        if (nextButton) {
            nextButton.disabled =
                !hasOverflow ||
                slider.scrollLeft >= maxScroll - 2;
        }
    };

    slider.addEventListener("scroll", updateControls, {
        passive: true
    });

    window.addEventListener("resize", updateControls);

    updateControls();
}

function renderPartner(partner) {
    const image =
        typeof partner.image === "string"
            ? partner.image.trim()
            : "";

    const name =
        escapeHTML(partner.name || "Partner");

    const description =
        escapeHTML(partner.description || "");

    const social =
        partner.social &&
        typeof partner.social === "object"
            ? partner.social
            : {};

    return `
        <article class="customer-partners__card">

            <div class="customer-partners__image">
                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(partner.name || "Partner")}"
                                loading="lazy"
                            >
                        `
                        : `
                            <div
                                class="customer-partners__image-placeholder"
                                aria-hidden="true"
                            ></div>
                        `
                }
            </div>

            <div class="customer-partners__info">

                <div class="customer-partners__text">
                    <h3>${name}</h3>

                    ${
                        description
                            ? `<p>${description}</p>`
                            : ""
                    }
                </div>

                ${renderSocial(social)}

            </div>

        </article>
    `;
}

function renderSocial(social) {
    const links = [
        {
            key: "instagram",
            label: "Instagram",
            icon: '<i class="fa-brands fa-instagram" aria-hidden="true"></i>'
        },
        {
            key: "facebook",
            label: "Facebook",
            icon: '<i class="fa-brands fa-facebook-f" aria-hidden="true"></i>'
        },
        {
            key: "tiktok",
            label: "TikTok",
            icon: '<i class="fa-brands fa-tiktok" aria-hidden="true"></i>'
        }
    ];

    const available = links.filter(
        item =>
            typeof social[item.key] === "string" &&
            social[item.key].trim()
    );

    if (!available.length) return "";

    return `
        <nav
            class="customer-partners__social"
            aria-label="Redes sociales"
        >
            ${available.map(item => `
                <a
    href="${escapeAttribute(social[item.key])}"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="${item.label}"
>
    ${item.icon}
</a>
            `).join("")}
        </nav>
    `;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}
