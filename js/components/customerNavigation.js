export function CustomerNavigation() {
    return `
        <header class="customer-navigation">
            <a
                href="/"
                class="customer-navigation__logo"
                data-spa-link
                aria-label="Outsider"
            >
                <img
                    src="/assets/isotipo.svg"
                    alt="Outsider"
                >
            </a>

            <button
                type="button"
                class="customer-navigation__menu"
                aria-label="Abrir menú"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </header>
    `;
}