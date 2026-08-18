// ========================================
// OUTSIDER — PWA INSTALL
// ========================================

const INSTALL_DISMISSED_KEY = "outsider-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

let deferredInstallPrompt = null;
let modal = null;


// ========================================
// DETECTAR SI YA ESTÁ INSTALADA
// ========================================

function isAppInstalled() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}


// ========================================
// DETECTAR iOS
// ========================================

function isIOS() {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (
            navigator.platform === "MacIntel" &&
            navigator.maxTouchPoints > 1
        )
    );
}


// ========================================
// RECORDAR "AHORA NO"
// ========================================

function wasRecentlyDismissed() {
    const dismissedAt = localStorage.getItem(
        INSTALL_DISMISSED_KEY
    );

    if (!dismissedAt) {
        return false;
    }

    const elapsed =
        Date.now() - Number(dismissedAt);

    return elapsed < DISMISS_DURATION;
}


function rememberDismissal() {
    localStorage.setItem(
        INSTALL_DISMISSED_KEY,
        Date.now().toString()
    );
}


// ========================================
// CREAR MODAL
// ========================================

function createModal() {

    if (modal) {
        return;
    }

    modal = document.createElement("div");

    modal.className = "outsider-install-modal";

    modal.innerHTML = `
        <div
            class="outsider-install-overlay"
            data-install-close
        ></div>

        <div
            class="outsider-install-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outsider-install-title"
        >

            <button
                class="outsider-install-close"
                type="button"
                aria-label="Cerrar"
                data-install-close
            >
                ×
            </button>

            <div class="outsider-install-icon">
                <img
                    src="/assets/icon-192.png"
                    alt="OUTSIDER"
                >
            </div>

            <h2 id="outsider-install-title">
                Lleva OUTSIDER contigo
            </h2>

            <p class="outsider-install-description">
                Instala OUTSIDER en tu dispositivo
                para acceder más rápido.
            </p>

            <div
                class="outsider-install-ios"
                hidden
            >
                <p>
                    Para instalar OUTSIDER:
                </p>

                <ol>
                    <li>
                        Pulsa <strong>Compartir</strong>.
                    </li>
                    <li>
                        Selecciona
                        <strong>
                            Añadir a pantalla de inicio
                        </strong>.
                    </li>
                </ol>
            </div>

            <div class="outsider-install-actions">

                <button
                    class="outsider-install-button"
                    type="button"
                    data-install-action
                >
                    Instalar
                </button>

                <button
                    class="outsider-install-later"
                    type="button"
                    data-install-close
                >
                    Ahora no
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    addModalStyles();

    modal
        .querySelectorAll("[data-install-close]")
        .forEach((element) => {
            element.addEventListener(
                "click",
                closeModal
            );
        });

    modal
        .querySelector("[data-install-action]")
        .addEventListener(
            "click",
            handleInstall
        );
}


// ========================================
// ESTILOS DEL MODAL
// ========================================

function addModalStyles() {

    if (
        document.getElementById(
            "outsider-install-styles"
        )
    ) {
        return;
    }

    const style = document.createElement("style");

    style.id = "outsider-install-styles";

    style.textContent = `
        .outsider-install-modal {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .outsider-install-modal.is-visible {
            display: flex;
        }

        .outsider-install-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(5px);
        }

        .outsider-install-card {
            position: relative;
            width: min(100%, 390px);
            padding: 30px 26px 24px;
            border-radius: 20px;
            background: #ffffff;
            color: #111111;
            text-align: center;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
            animation: outsiderInstallAppear 0.25s ease-out;
        }

        .outsider-install-close {
            position: absolute;
            top: 12px;
            right: 14px;
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 50%;
            background: transparent;
            color: #555555;
            font-size: 26px;
            line-height: 1;
            cursor: pointer;
        }

        .outsider-install-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 18px;
            overflow: hidden;
            border-radius: 16px;
        }

        .outsider-install-icon img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .outsider-install-card h2 {
            margin: 0 0 10px;
            font-size: 24px;
            line-height: 1.2;
        }

        .outsider-install-description {
            margin: 0 auto 22px;
            max-width: 310px;
            color: #666666;
            font-size: 15px;
            line-height: 1.5;
        }

        .outsider-install-ios {
            margin-bottom: 20px;
            padding: 14px;
            border-radius: 12px;
            background: #f4f4f4;
            text-align: left;
            font-size: 14px;
            line-height: 1.5;
        }

        .outsider-install-ios p {
            margin: 0 0 8px;
        }

        .outsider-install-ios ol {
            margin: 0;
            padding-left: 20px;
        }

        .outsider-install-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .outsider-install-button {
            width: 100%;
            padding: 13px 18px;
            border: 0;
            border-radius: 10px;
            background: #000000;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
        }

        .outsider-install-later {
            width: 100%;
            padding: 10px;
            border: 0;
            background: transparent;
            color: #666666;
            font-size: 14px;
            cursor: pointer;
        }

        @keyframes outsiderInstallAppear {
            from {
                opacity: 0;
                transform: translateY(12px) scale(0.98);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;

    document.head.appendChild(style);
}


// ========================================
// MOSTRAR MODAL
// ========================================

function showModal() {

    if (
        !modal ||
        isAppInstalled() ||
        wasRecentlyDismissed()
    ) {
        return;
    }

    const iosInstructions =
        modal.querySelector(
            ".outsider-install-ios"
        );

    const installButton =
        modal.querySelector(
            "[data-install-action]"
        );

    if (isIOS()) {

        iosInstructions.hidden = false;

        installButton.hidden = true;

    } else {

        iosInstructions.hidden = true;

        installButton.hidden = false;

    }

    modal.classList.add("is-visible");
}


// ========================================
// CERRAR MODAL
// ========================================

function closeModal() {

    if (!modal) {
        return;
    }

    rememberDismissal();

    modal.classList.remove(
        "is-visible"
    );
}


// ========================================
// INSTALAR
// ========================================

async function handleInstall() {

    if (!deferredInstallPrompt) {
        closeModal();
        return;
    }

    deferredInstallPrompt.prompt();

    const result =
        await deferredInstallPrompt.userChoice;

    deferredInstallPrompt = null;

    if (
        result.outcome === "accepted"
    ) {
        closeModal();
    } else {
        rememberDismissal();
        closeModal();
    }
}


// ========================================
// CAPTURAR EVENTO DE INSTALACIÓN
// ========================================

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredInstallPrompt = event;

        scheduleInstallModal();

    }
);


// ========================================
// INSTALACIÓN COMPLETADA
// ========================================

window.addEventListener(
    "appinstalled",
    () => {

        deferredInstallPrompt = null;

        if (modal) {
            modal.classList.remove(
                "is-visible"
            );
        }

        console.log(
            "✓ OUTSIDER instalada correctamente."
        );

    }
);


// ========================================
// PROGRAMAR MODAL
// ========================================

function scheduleInstallModal() {

    setTimeout(() => {

        if (
            deferredInstallPrompt ||
            isIOS()
        ) {
            showModal();
        }

    }, 10000);

}


// ========================================
// INICIALIZAR
// ========================================

function init() {

    if (isAppInstalled()) {
        return;
    }

    createModal();

    if (isIOS()) {
        scheduleInstallModal();
    }

}

init();