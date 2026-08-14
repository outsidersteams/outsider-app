export function ProductCard(product) {
    if (!product) return "";

    const imageUrl = getProductImage(product);
    const price = getProductPrice(product);

    return `
        <a
            href="/product?product=${encodeURIComponent(product.id)}"
            class="customer-product-card"
            data-spa-link
        >

            <div class="customer-product-card__image">

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

            <div class="customer-product-card__info">

                <h2 class="customer-product-card__name">
                    ${escapeHTML(product.name || "Producto")}
                </h2>

                <span class="customer-product-card__price">
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


/* =========================================
   PRODUCT IMAGE
   ========================================= */

function getProductImage(product) {

    if (Array.isArray(product?.images)) {

        const image = product.images.find(
            item => getImageUrl(item)
        );

        if (image) {
            return getImageUrl(image);
        }
    }

    return "";
}


/* =========================================
   PRODUCT PRICE
   ========================================= */

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

    const sizes = Array.isArray(firstVariant?.sizes)
        ? firstVariant.sizes
        : [];

    const activeSize = sizes.find(
        size => size?.active !== false
    );

    const firstSize =
        activeSize ||
        sizes[0] ||
        null;

    const rawPrice =
        firstSize?.price ??
        firstVariant?.price ??
        product?.price;

    return Number.isFinite(Number(rawPrice))
        ? Number(rawPrice)
        : null;
}


/* =========================================
   IMAGE URL
   ========================================= */

function getImageUrl(value) {

    if (!value) return "";

    if (typeof value === "string") {
        return value;
    }

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


/* =========================================
   CURRENCY
   ========================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        maximumFractionDigits: 2
    }).format(Number(value));
}


/* =========================================
   HTML ESCAPE
   ========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}