// ========================================
// OUTSIDER — CUSTOMER SHOP NAVIGATION
// ========================================

const CART_STORAGE_KEY =
    "customerCart";


// ========================================
// CUSTOMER SHOP NAVIGATION
// ========================================

export function CustomerShopNavigation() {

    const cartCount =
        getCartItemCount();


    return `
        <header class="customer-shop-navigation">

            <div class="customer-shop-navigation__left">

                <button
                    type="button"
                    class="customer-shop-navigation__button customer-shop-navigation__menu"
                    aria-label="Abrir menú"
                    aria-expanded="false"
                    aria-controls="customer-menu"
                >
                    <i
                        class="fa-solid fa-bars"
                        aria-hidden="true"
                    ></i>
                </button>

            </div>


            <div class="customer-shop-navigation__right">

                <!-- ========================================
                     SEARCH
                     ======================================== -->

                <button
                    type="button"
                    class="customer-shop-navigation__button"
                    data-customer-search
                    aria-label="Buscar productos"
                    aria-expanded="false"
                    aria-controls="customer-shop-search"
                >
                    <i
                        class="fa-solid fa-magnifying-glass"
                        aria-hidden="true"
                    ></i>
                </button>


                <!-- ========================================
                     ACCOUNT
                     ======================================== -->

                <a
                    href="/account"
                    class="customer-shop-navigation__button"
                    data-spa-link
                    aria-label="Mi cuenta"
                >
                    <i
                        class="fa-solid fa-user"
                        aria-hidden="true"
                    ></i>
                </a>


                <!-- ========================================
                     CART
                     ======================================== -->

                <a
                    href="/cart"
                    class="customer-shop-navigation__button customer-shop-navigation__cart"
                    data-spa-link
                    aria-label="Carrito"
                >

                    <i
                        class="fa-solid fa-bag-shopping"
                        aria-hidden="true"
                    ></i>


                    ${
                        cartCount > 0
                            ? `
                                <span
                                    class="customer-shop-navigation__cart-count"
                                    data-cart-count
                                    aria-hidden="true"
                                >
                                    ${cartCount}
                                </span>
                            `
                            : ""
                    }

                </a>

            </div>

        </header>


        <!-- ========================================
             SEARCH
             ======================================== -->

        <section
            class="customer-shop-search"
            id="customer-shop-search"
            aria-hidden="true"
        >

            <div class="customer-shop-search__inner">

                <div class="customer-shop-search__field">

                    <i
                        class="fa-solid fa-magnifying-glass"
                        aria-hidden="true"
                    ></i>


                    <input
                        type="search"
                        id="customer-shop-search-input"
                        class="customer-shop-search__input"
                        placeholder="Buscar productos"
                        autocomplete="off"
                        spellcheck="false"
                        aria-label="Buscar productos"
                    >


                    <button
                        type="button"
                        class="customer-shop-search__close"
                        id="customer-shop-search-close"
                        aria-label="Cerrar búsqueda"
                    >
                        <i
                            class="fa-solid fa-xmark"
                            aria-hidden="true"
                        ></i>
                    </button>

                </div>

            </div>

        </section>
    `;
}


// ========================================
// CART COUNT
// ========================================

function getCartItemCount() {

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!storedCart) {
            return 0;
        }


        const cart =
            JSON.parse(
                storedCart
            );


        if (!Array.isArray(cart)) {
            return 0;
        }


        return cart.reduce(
            (
                total,
                item
            ) => {

                const quantity =
                    Number(
                        item?.quantity || 0
                    );


                if (
                    !Number.isFinite(
                        quantity
                    ) ||
                    quantity <= 0
                ) {
                    return total;
                }


                return (
                    total +
                    Math.floor(quantity)
                );

            },
            0
        );

    } catch (error) {

        console.warn(
            "No se pudo leer el contador del carrito:",
            error
        );


        return 0;

    }

}