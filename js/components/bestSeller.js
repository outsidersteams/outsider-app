const HOME_BEST_SELLERS = [
    "SmjUsBZJgrinlXAg50CP",
    "2cHYZVhC6upYsq6xE7H5"
    // Coloca aquí los IDs de Firebase en el orden
    // en que quieres mostrarlos en Home.
    //
    // "ID_PRODUCTO_1",
    // "ID_PRODUCTO_2",
    // "ID_PRODUCTO_3",
];

export function BestSellers(products = []) {
    const selectedProducts = HOME_BEST_SELLERS
        .map(productId =>
            products.find(product => product.id === productId)
        )
        .filter(Boolean);

    return `
        <section class="customer-best-sellers">

            <div class="customer-best-sellers__heading">
                <h2>Más vendidos</h2>

                <a
                    href="/shop"
                    data-spa-link
                >
                    Ver todo
                </a>
            </div>

            <div class="customer-best-sellers__slider">

                ${
                    selectedProducts.length
                        ? selectedProducts
                            .map(renderProductCard)
                            .join("")
                        : `
                            <div class="customer-best-sellers__empty">
                                No hay productos seleccionados.
                            </div>
                        `
                }

            </div>

        </section>
    `;
}

function renderProductCard(product) {
    const imageUrl = getProductImage(product);
    const price = getProductPrice(product);

    return `
        <a
            href="/product?product=${encodeURIComponent(product.id)}"
            class="customer-best-sellers__card"
            data-spa-link
        >

            <div class="customer-best-sellers__image">
                ${
                    imageUrl
                        ? `
                            <img
                                src="${escapeHTML(imageUrl)}"
                                alt="${escapeHTML(
                                    product.name || "Producto"
                                )}"
                                loading="lazy"
                            >
                        `
                        : ""
                }
            </div>

            <div class="customer-best-sellers__info">

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

function formatCurrency(value) {
    return new Intl.NumberFormat(
        "es-GT",
        {
            style: "currency",
            currency: "GTQ",
            maximumFractionDigits: 2
        }
    ).format(Number(value));
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
