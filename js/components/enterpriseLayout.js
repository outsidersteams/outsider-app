import {
    EnterpriseSidebar,
    initEnterpriseSidebar
} from "./enterpriseSidebar.js";

import {
    EnterpriseHeader
} from "./enterpriseHeader.js";
export function EnterpriseLayout(content, profile) {

    return `
        <div class="enterprise-layout">

            <aside
                class="enterprise-layout__sidebar"
                id="enterprise-sidebar"
            >
                ${EnterpriseSidebar()}
            </aside>


            <div
                class="enterprise-layout__overlay"
                id="enterprise-layout-overlay"
            >
            </div>


            <div class="enterprise-layout__main">

                <header
                    class="enterprise-layout__header"
                    id="enterprise-header"
                >
                    ${EnterpriseHeader(profile)}
                </header>


                <main
                    class="enterprise-layout__content"
                    id="enterprise-content"
                >
                    ${content}
                </main>

            </div>

        </div>
    `;
}
export function initEnterpriseLayout() {

    const layout =
        document.querySelector(
            ".enterprise-layout"
        );

    const menuButton =
        document.querySelector(
            "#enterprise-menu-toggle"
        );

    const overlay =
        document.querySelector(
            "#enterprise-layout-overlay"
        );

    if (
        !layout ||
        !menuButton ||
        !overlay
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            layout.classList.toggle(
                "sidebar-open"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            layout.classList.remove(
                "sidebar-open"
            );

        }
    );


    initEnterpriseSidebar();

}