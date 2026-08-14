export function CustomerMenu() {
    return `
        <aside
            class="customer-menu"
            id="customer-menu"
            aria-hidden="true"
        >
            <div class="customer-menu__inner">

                <div class="customer-menu__header">
                    <span class="customer-menu__label">
                        OUTSIDER
                    </span>

                    <button
                        type="button"
                        class="customer-menu__close"
                        id="customer-menu-close"
                        aria-label="Cerrar menú"
                    >
                        ×
                    </button>
                </div>

                <nav
                    class="customer-menu__navigation"
                    aria-label="Navegación principal"
                >
                    <a href="/shop" data-spa-link>
                        Shop
                    </a>

                    <a href="/shop?category=t-shirts" data-spa-link>
                        T-Shirts
                    </a>

                    <a href="/shop?category=hoodies" data-spa-link>
                        Hoodies
                    </a>

                    <a href="/shop?category=pants" data-spa-link>
                        Pants
                    </a>

                    <a href="/shop?category=caps" data-spa-link>
                        Caps
                    </a>

                    <a href="/collabs" data-spa-link>
                        Collabs
                    </a>
                </nav>

                <div class="customer-menu__secondary">
                    <a href="/account" data-spa-link>
                        Mi cuenta
                    </a>

                    <a href="/orders" data-spa-link>
                        Mis pedidos
                    </a>
                </div>

            </div>
        </aside>
    `;
}