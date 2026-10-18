// ========================================
// OUTSIDER — CHATWOOT CUSTOMER SUPPORT
// ========================================
// Loads Chatwoot once on customer-facing routes.
// The widget is hidden on every /enterprise route,
// including /enterprise/login, during SPA navigation.

const CHATWOOT_BASE_URL = "https://app.chatwoot.com";
const CHATWOOT_WEBSITE_TOKEN = "MvKVpkRpmM9eXg91h67Zi8u8";
const CHATWOOT_SCRIPT_ID = "outsider-chatwoot-sdk";
const CHATWOOT_STYLE_ID = "outsider-chatwoot-route-visibility";

let chatwootLoadStarted = false;
let chatwootInitialized = false;

function ensureChatwootVisibilityStyles() {
    if (document.getElementById(CHATWOOT_STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = CHATWOOT_STYLE_ID;
    style.textContent = `
        html.chatwoot-hidden-on-enterprise .woot-widget-holder,
        html.chatwoot-hidden-on-enterprise .woot-widget-bubble-holder,
        html.chatwoot-hidden-on-enterprise #chatwoot_live_chat_widget {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    `;

    document.head.appendChild(style);
}

function isEnterprisePath(pathname = window.location.pathname) {
    return pathname === "/enterprise" || pathname.startsWith("/enterprise/");
}

/**
 * Syncs the widget visibility with the current SPA route.
 * Enterprise routes never display the Chatwoot launcher or panel.
 */
export function syncChatwootVisibility(pathname = window.location.pathname) {
    ensureChatwootVisibilityStyles();

    const shouldHide = isEnterprisePath(pathname);
    document.documentElement.classList.toggle(
        "chatwoot-hidden-on-enterprise",
        shouldHide
    );

    // If Chatwoot is already loaded, close an open conversation panel
    // when navigating into Enterprise. CSS also hides its launcher.
    if (shouldHide && window.$chatwoot && typeof window.$chatwoot.toggle === "function") {
        try {
            window.$chatwoot.toggle("close");
        } catch (error) {
            // Visibility is still enforced by the route-specific CSS.
            console.debug("Chatwoot panel close skipped:", error);
        }
    }

    if (!shouldHide) {
        initChatwoot();
    }
}

/** Loads and initializes the Chatwoot SDK only once. */
export function initChatwoot() {
    ensureChatwootVisibilityStyles();

    // If a public route is visited, make sure the Enterprise-only
    // visibility class is not left behind by a previous navigation.
    if (!isEnterprisePath()) {
        document.documentElement.classList.remove("chatwoot-hidden-on-enterprise");
    }

    if (chatwootInitialized || chatwootLoadStarted) {
        return;
    }

    // Avoid adding a second SDK script if it is already present.
    const existingScript = document.getElementById(CHATWOOT_SCRIPT_ID);
    if (existingScript) {
        if (window.chatwootSDK && typeof window.chatwootSDK.run === "function") {
            runChatwootSDK();
        } else {
            chatwootLoadStarted = true;
            existingScript.addEventListener("load", runChatwootSDK, { once: true });
            existingScript.addEventListener("error", () => {
                chatwootLoadStarted = false;
                console.error("No se pudo cargar el widget de soporte de Chatwoot.");
            }, { once: true });
        }
        return;
    }

    // Avoid re-running the SDK if another part of the page initialized it.
    if (window.chatwootSDK && typeof window.chatwootSDK.run === "function") {
        runChatwootSDK();
        return;
    }

    window.chatwootSettings = {
        position: "right",
        type: "standard",
        launcherTitle: ""
    };

    const script = document.createElement("script");
    script.id = CHATWOOT_SCRIPT_ID;
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;

    script.onload = () => {
        runChatwootSDK();
    };

    script.onerror = () => {
        chatwootLoadStarted = false;
        console.error("No se pudo cargar el widget de soporte de Chatwoot.");
        script.remove();
    };

    chatwootLoadStarted = true;
    document.head.appendChild(script);
}

function runChatwootSDK() {
    if (chatwootInitialized) {
        return;
    }

    if (!window.chatwootSDK || typeof window.chatwootSDK.run !== "function") {
        chatwootLoadStarted = false;
        console.error("El SDK de Chatwoot se cargó, pero chatwootSDK.run no está disponible.");
        return;
    }

    window.chatwootSDK.run({
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        baseUrl: CHATWOOT_BASE_URL
    });

    chatwootInitialized = true;
}

// Chatwoot's SDK adds these properties to window at runtime.
// Declare them here for editor/linter compatibility in plain JavaScript.
if (typeof window !== "undefined") {
    window.chatwootSettings = window.chatwootSettings || {
        position: "right",
        type: "standard",
        launcherTitle: ""
    };
}
