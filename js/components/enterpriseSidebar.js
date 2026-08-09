import { logout } from "../firebase/auth.js";


export function EnterpriseSidebar() {

    return `
        <nav class="enterprise-sidebar">

            <div class="enterprise-sidebar__brand">
                OUTSIDER
            </div>


            <div class="enterprise-sidebar__navigation">

                <a
                    href="/enterprise/dashboard"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/dashboard"
                >
                    <i class="fa-solid fa-house enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Dashboard
                    </span>
                </a>


                <a
                    href="/enterprise/orders"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/orders"
                >
                    <i class="fa-solid fa-receipt enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Pedidos
                    </span>
                </a>


                <a
                    href="/enterprise/products"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/products"
                >
                    <i class="fa-solid fa-box enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Productos
                    </span>
                </a>


                <a
                    href="/enterprise/customers"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/customers"
                >
                    <i class="fa-solid fa-users enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Clientes
                    </span>
                </a>


                <a
                    href="/enterprise/inventory"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/inventory"
                >
                    <i class="fa-solid fa-warehouse enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Inventario
                    </span>
                </a>

            </div>


            <div class="enterprise-sidebar__bottom">

                <a
                    href="/enterprise/settings"
                    class="enterprise-sidebar__link"
                    data-route="/enterprise/settings"
                >
                    <i class="fa-solid fa-gear enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Configuración
                    </span>
                </a>


                <button
                    type="button"
                    class="enterprise-sidebar__logout"
                    id="enterprise-logout"
                >
                    <i class="fa-solid fa-right-from-bracket enterprise-sidebar__icon"></i>

                    <span class="enterprise-sidebar__label">
                        Cerrar sesión
                    </span>
                </button>

            </div>

        </nav>
    `;
}


export function initEnterpriseSidebar() {

    // ========================================
    // ACTIVE ROUTE
    // ========================================

    const currentPath =
        window.location.pathname;

    const links =
        document.querySelectorAll(
            ".enterprise-sidebar__link[data-route]"
        );

    links.forEach((link) => {

        if (
            link.dataset.route === currentPath
        ) {

            link.classList.add("active");

        }

    });


    // ========================================
    // LOGOUT
    // ========================================

    const logoutButton =
        document.querySelector(
            "#enterprise-logout"
        );

    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled = true;

                await logout();

            } catch (error) {

                console.error(
                    "Error cerrando sesión:",
                    error
                );

                logoutButton.disabled = false;

            }

        }
    );

}