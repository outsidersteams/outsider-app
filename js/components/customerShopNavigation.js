// ========================================
// OUTSIDER — CUSTOMER SHOP NAVIGATION
// ========================================

export function CustomerShopNavigation() {

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


                <a
                    href="/cart"
                    class="customer-shop-navigation__button"
                    data-spa-link
                    aria-label="Carrito"
                >
                    <i
                        class="fa-solid fa-bag-shopping"
                        aria-hidden="true"
                    ></i>
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