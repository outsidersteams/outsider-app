const CUSTOMER_EDITORIAL = {
    images: {
        mobile: "/assets/image-colab.png",
        tablet: "/assets/image-colab-tablet.png",
        desktop: "/assets/image-colab-desktop.png"
    },

    logos: {
        primary: "/assets/outsider-logo.svg",
        secondary: "/assets/predators-logo-colab.svg"
    },

    separator: "×",

    button: {
        label: "View Colab",
        href: "/collabs"
    }
};

export function CustomerEditorial() {
    return `
        <section class="customer-editorial">

            <div class="customer-editorial__media">
                <picture>
                    <source
                        media="(min-width: 1100px)"
                        srcset="${CUSTOMER_EDITORIAL.images.desktop}"
                    >

                    <source
                        media="(min-width: 700px)"
                        srcset="${CUSTOMER_EDITORIAL.images.tablet}"
                    >

                    <img
                        src="${CUSTOMER_EDITORIAL.images.mobile}"
                        alt="Outsider collaboration"
                    >
                </picture>
            </div>

            <div class="customer-editorial__overlay"></div>

            <div class="customer-editorial__content">

                <div class="customer-editorial__logos">

                    <img
                        src="${CUSTOMER_EDITORIAL.logos.primary}"
                        alt="Outsider"
                    >

                    <span>
                        ${CUSTOMER_EDITORIAL.separator}
                    </span>

                    <img
                        src="${CUSTOMER_EDITORIAL.logos.secondary}"
                        alt="Collaboration"
                    >

                </div>

                <a
                    href="${CUSTOMER_EDITORIAL.button.href}"
                    class="customer-editorial__button"
                    data-spa-link
                >
                    ${CUSTOMER_EDITORIAL.button.label}
                </a>

            </div>

        </section>
    `;
}