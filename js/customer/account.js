// ========================================
// OUTSIDER — CUSTOMER ACCOUNT
// ========================================

import {
    login,
    register,
    loginWithGoogle,
    observeAuth,
    logout
} from "../firebase/auth.js";

import {
    ensureCustomerAccount
} from "../firebase/userService.js";


// ========================================
// VIEW
// ========================================

export function CustomerAccount() {

    return `

        <main class="customer-account">

            <section class="customer-account__container">

                <div class="customer-account__header">

                    <p class="customer-account__eyebrow">
                        ACCOUNT
                    </p>

                    <h1 class="customer-account__title">
                        Mi cuenta
                    </h1>

                </div>


                <div
                    id="customer-account-content"
                    class="customer-account__content"
                >

                    <p>
                        Cargando...
                    </p>

                </div>

            </section>

        </main>

    `;
}


// ========================================
// INIT
// ========================================

export function initCustomerAccount() {

    const container =
        document.querySelector(
            "#customer-account-content"
        );


    if (!container) {

        console.error(
            "No se encontró #customer-account-content"
        );

        return;

    }


    // ========================================
    // AUTH STATE
    // ========================================

    const unsubscribe =
        observeAuth(
            (user) => {

                if (user) {

                    renderAuthenticatedState(
                        container,
                        user
                    );

                } else {

                    renderLoginState(
                        container
                    );

                }

            }
        );


    container.dataset.authObserver =
        "active";


    return unsubscribe;

}


// ========================================
// LOGIN / REGISTER VIEW
// ========================================

function renderLoginState(container) {

    container.innerHTML = `

        <div class="customer-account__auth">

            <h2 class="customer-account__auth-title">
                Iniciar sesión
            </h2>

            <p class="customer-account__auth-description">
                Accede a tu cuenta para continuar con tu compra.
            </p>


            <!-- GOOGLE -->

            <button
                type="button"
                id="customer-google-login"
                class="customer-account__google-button"
            >

                <span
                    class="customer-account__google-icon"
                    aria-hidden="true"
                >
                    G
                </span>

                <span>
                    Continuar con Google
                </span>

            </button>


            <div class="customer-account__separator">

                <span>
                    o
                </span>

            </div>


            <!-- EMAIL LOGIN -->

            <form
                id="customer-login-form"
                class="customer-account__form"
            >

                <div class="customer-account__field">

                    <label
                        for="customer-login-email"
                        class="customer-account__label"
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        id="customer-login-email"
                        name="email"
                        class="customer-account__input"
                        autocomplete="email"
                        required
                    >

                </div>


                <div class="customer-account__field">

                    <label
                        for="customer-login-password"
                        class="customer-account__label"
                    >
                        Contraseña
                    </label>

                    <input
                        type="password"
                        id="customer-login-password"
                        name="password"
                        class="customer-account__input"
                        autocomplete="current-password"
                        required
                    >

                </div>


                <button
                    type="submit"
                    class="customer-account__submit"
                    id="customer-login-submit"
                >
                    Iniciar sesión
                </button>


                <p
                    id="customer-login-error"
                    class="customer-account__error"
                    hidden
                ></p>

            </form>


            <div class="customer-account__register">

                <p>
                    ¿No tienes una cuenta?
                </p>

                <button
                    type="button"
                    id="customer-show-register"
                    class="customer-account__link"
                >
                    Crear cuenta
                </button>

            </div>

        </div>

    `;


    bindLoginEvents(
        container
    );

}


// ========================================
// REGISTER VIEW
// ========================================

function renderRegisterState(container) {

    container.innerHTML = `

        <div class="customer-account__auth">

            <h2 class="customer-account__auth-title">
                Crear cuenta
            </h2>

            <p class="customer-account__auth-description">
                Crea tu cuenta para guardar tus datos y gestionar tus compras.
            </p>


            <!-- GOOGLE -->

            <button
                type="button"
                id="customer-google-register"
                class="customer-account__google-button"
            >

                <span
                    class="customer-account__google-icon"
                    aria-hidden="true"
                >
                    G
                </span>

                <span>
                    Continuar con Google
                </span>

            </button>


            <div class="customer-account__separator">

                <span>
                    o
                </span>

            </div>


            <!-- REGISTER -->

            <form
                id="customer-register-form"
                class="customer-account__form"
            >

                <div class="customer-account__field">

                    <label
                        for="customer-register-name"
                        class="customer-account__label"
                    >
                        Nombre
                    </label>

                    <input
                        type="text"
                        id="customer-register-name"
                        name="name"
                        class="customer-account__input"
                        autocomplete="name"
                        required
                    >

                </div>


                <div class="customer-account__field">

                    <label
                        for="customer-register-email"
                        class="customer-account__label"
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        id="customer-register-email"
                        name="email"
                        class="customer-account__input"
                        autocomplete="email"
                        required
                    >

                </div>


                <div class="customer-account__field">

                    <label
                        for="customer-register-password"
                        class="customer-account__label"
                    >
                        Contraseña
                    </label>

                    <input
                        type="password"
                        id="customer-register-password"
                        name="password"
                        class="customer-account__input"
                        autocomplete="new-password"
                        minlength="6"
                        required
                    >

                </div>


                <button
                    type="submit"
                    class="customer-account__submit"
                    id="customer-register-submit"
                >
                    Crear cuenta
                </button>


                <p
                    id="customer-register-error"
                    class="customer-account__error"
                    hidden
                ></p>

            </form>


            <div class="customer-account__register">

                <p>
                    ¿Ya tienes una cuenta?
                </p>

                <button
                    type="button"
                    id="customer-show-login"
                    class="customer-account__link"
                >
                    Iniciar sesión
                </button>

            </div>

        </div>

    `;


    bindRegisterEvents(
        container
    );

}


// ========================================
// AUTHENTICATED VIEW
// ========================================

function renderAuthenticatedState(
    container,
    user
) {

    const displayName =
        user.displayName ||
        user.email ||
        "Cliente";


    container.innerHTML = `

        <div class="customer-account__profile">

            <!-- PROFILE -->

            <div class="customer-account__profile-header">

                ${
                    user.photoURL
                        ? `
                            <img
                                src="${escapeHtml(user.photoURL)}"
                                alt=""
                                class="customer-account__avatar"
                            >
                        `
                        : `
                            <div
                                class="customer-account__avatar customer-account__avatar--placeholder"
                            >
                                ${getInitial(displayName)}
                            </div>
                        `
                }

                <div class="customer-account__profile-info">

                    <h2 class="customer-account__profile-name">
                        ${escapeHtml(displayName)}
                    </h2>

                    <p class="customer-account__profile-email">
                        ${escapeHtml(user.email || "")}
                    </p>

                </div>

            </div>


            <!-- CUSTOMER NAVIGATION -->

            <nav
                class="customer-account__navigation"
                aria-label="Navegación de cuenta"
            >

                <p class="customer-account__navigation-label">
                    NAVEGAR
                </p>


                <!-- HOME -->

                <button
                    type="button"
                    class="customer-account__navigation-item"
                    data-account-navigation="/"
                >

                    <span class="customer-account__navigation-icon">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 10.5 12 3l9 7.5"
                            />
                            <path
                                d="M5.5 9.5V21h13V9.5"
                            />
                            <path
                                d="M9.5 21v-6h5v6"
                            />
                        </svg>
                    </span>

                    <span class="customer-account__navigation-content">

                        <span class="customer-account__navigation-title">
                            Inicio
                        </span>

                        <span class="customer-account__navigation-description">
                            Regresa al inicio de OUTSIDER
                        </span>

                    </span>

                    <span class="customer-account__navigation-arrow">
                        →
                    </span>

                </button>


                <!-- SHOP -->

                <button
                    type="button"
                    class="customer-account__navigation-item"
                    data-account-navigation="/shop"
                >

                    <span class="customer-account__navigation-icon">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 8h14l1 12H4L5 8Z"
                            />
                            <path
                                d="M8 8a4 4 0 0 1 8 0"
                            />
                        </svg>
                    </span>

                    <span class="customer-account__navigation-content">

                        <span class="customer-account__navigation-title">
                            Tienda
                        </span>

                        <span class="customer-account__navigation-description">
                            Explora nuestros productos
                        </span>

                    </span>

                    <span class="customer-account__navigation-arrow">
                        →
                    </span>

                </button>


                <!-- CART -->

                <button
                    type="button"
                    class="customer-account__navigation-item"
                    data-account-navigation="/cart"
                >

                    <span class="customer-account__navigation-icon">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 5h2l1.5 10h10L20 8H7"
                            />
                            <circle
                                cx="9"
                                cy="19"
                                r="1.25"
                            />
                            <circle
                                cx="17"
                                cy="19"
                                r="1.25"
                            />
                        </svg>
                    </span>

                    <span class="customer-account__navigation-content">

                        <span class="customer-account__navigation-title">
                            Mi carrito
                        </span>

                        <span class="customer-account__navigation-description">
                            Revisa los productos que agregaste
                        </span>

                    </span>

                    <span class="customer-account__navigation-arrow">
                        →
                    </span>

                </button>

            </nav>


            <!-- LOGOUT -->

            <div class="customer-account__profile-actions">

                <button
                    type="button"
                    id="customer-logout"
                    class="customer-account__logout"
                >
                    Cerrar sesión
                </button>

            </div>

        </div>

    `;


    // ========================================
    // NAVIGATION EVENTS
    // ========================================

    const navigationButtons =
        container.querySelectorAll(
            "[data-account-navigation]"
        );


    navigationButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const path =
                        button.dataset.accountNavigation;


                    if (!path) {
                        return;
                    }


                    window.history.pushState(
                        {},
                        "",
                        path
                    );


                    window.dispatchEvent(
                        new PopStateEvent(
                            "popstate"
                        )
                    );

                }
            );

        }
    );


    // ========================================
    // LOGOUT
    // ========================================

    const logoutButton =
        container.querySelector(
            "#customer-logout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Cerrando sesión...";


                try {

                    await logout();

                } catch (error) {

                    console.error(
                        "Error cerrando sesión:",
                        error
                    );

                    logoutButton.disabled = false;

                    logoutButton.textContent =
                        "Cerrar sesión";

                }

            }
        );

    }

}


// ========================================
// LOGIN EVENTS
// ========================================

function bindLoginEvents(container) {

    const loginForm =
        container.querySelector(
            "#customer-login-form"
        );


    const googleButton =
        container.querySelector(
            "#customer-google-login"
        );


    const registerButton =
        container.querySelector(
            "#customer-show-register"
        );


    // ========================================
    // EMAIL LOGIN
    // ========================================

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    loginForm
                        .querySelector(
                            "[name='email']"
                        )
                        .value
                        .trim();


                const password =
                    loginForm
                        .querySelector(
                            "[name='password']"
                        )
                        .value;


                const submitButton =
                    loginForm.querySelector(
                        "#customer-login-submit"
                    );


                const error =
                    loginForm.querySelector(
                        "#customer-login-error"
                    );


                error.hidden = true;
                error.textContent = "";


                submitButton.disabled = true;

                submitButton.textContent =
                    "Iniciando sesión...";


                try {

                    const user =
                        await login(
                            email,
                            password
                        );


                    await ensureCustomerAccount(
                        user
                    );

                } catch (authError) {

                    console.error(
                        "Error Customer Login:",
                        authError
                    );


                    error.textContent =
                        getAuthErrorMessage(
                            authError
                        );


                    error.hidden = false;


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Iniciar sesión";

                }

            }
        );

    }


    // ========================================
    // GOOGLE
    // ========================================

    if (googleButton) {

        googleButton.addEventListener(
            "click",
            async () => {

                googleButton.disabled = true;

                googleButton.textContent =
                    "Conectando con Google...";


                try {

                    const user =
                        await loginWithGoogle();


                    await ensureCustomerAccount(
                        user
                    );

                } catch (authError) {

                    console.error(
                        "Error Google Customer Auth:",
                        authError
                    );


                    googleButton.disabled = false;


                    googleButton.innerHTML = `

                        <span
                            class="customer-account__google-icon"
                            aria-hidden="true"
                        >
                            G
                        </span>

                        <span>
                            Continuar con Google
                        </span>

                    `;


                    showAccountError(
                        container,
                        getAuthErrorMessage(
                            authError
                        )
                    );

                }

            }
        );

    }


    // ========================================
    // SHOW REGISTER
    // ========================================

    if (registerButton) {

        registerButton.addEventListener(
            "click",
            () => {

                renderRegisterState(
                    container
                );

            }
        );

    }

}


// ========================================
// REGISTER EVENTS
// ========================================

function bindRegisterEvents(container) {

    const registerForm =
        container.querySelector(
            "#customer-register-form"
        );


    const googleButton =
        container.querySelector(
            "#customer-google-register"
        );


    const loginButton =
        container.querySelector(
            "#customer-show-login"
        );


    // ========================================
    // EMAIL REGISTER
    // ========================================

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const name =
                    registerForm
                        .querySelector(
                            "[name='name']"
                        )
                        .value
                        .trim();


                const email =
                    registerForm
                        .querySelector(
                            "[name='email']"
                        )
                        .value
                        .trim();


                const password =
                    registerForm
                        .querySelector(
                            "[name='password']"
                        )
                        .value;


                const submitButton =
                    registerForm.querySelector(
                        "#customer-register-submit"
                    );


                const error =
                    registerForm.querySelector(
                        "#customer-register-error"
                    );


                error.hidden = true;
                error.textContent = "";


                submitButton.disabled = true;

                submitButton.textContent =
                    "Creando cuenta...";


                try {

                    const user =
                        await register(
                            email,
                            password
                        );


                    await ensureCustomerAccount(
                        user,
                        {
                            name
                        }
                    );


                    console.log(
                        "✓ Customer registrado completamente:",
                        {
                            uid:
                                user.uid,

                            email:
                                user.email,

                            name
                        }
                    );


                } catch (authError) {

                    console.error(
                        "Error creando Customer:",
                        authError
                    );


                    error.textContent =
                        getAuthErrorMessage(
                            authError
                        );


                    error.hidden = false;


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Crear cuenta";

                }

            }
        );

    }


    // ========================================
    // GOOGLE REGISTER
    // ========================================

    if (googleButton) {

        googleButton.addEventListener(
            "click",
            async () => {

                googleButton.disabled = true;

                googleButton.textContent =
                    "Conectando con Google...";


                try {

                    const user =
                        await loginWithGoogle();


                    await ensureCustomerAccount(
                        user
                    );

                } catch (authError) {

                    console.error(
                        "Error Google Customer Register:",
                        authError
                    );


                    googleButton.disabled = false;


                    googleButton.innerHTML = `

                        <span
                            class="customer-account__google-icon"
                            aria-hidden="true"
                        >
                            G
                        </span>

                        <span>
                            Continuar con Google
                        </span>

                    `;


                    showAccountError(
                        container,
                        getAuthErrorMessage(
                            authError
                        )
                    );

                }

            }
        );

    }


    // ========================================
    // SHOW LOGIN
    // ========================================

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                renderLoginState(
                    container
                );

            }
        );

    }

}


// ========================================
// ERROR DISPLAY
// ========================================

function showAccountError(
    container,
    message
) {

    let error =
        container.querySelector(
            ".customer-account__global-error"
        );


    if (!error) {

        error =
            document.createElement(
                "p"
            );

        error.className =
            "customer-account__error customer-account__global-error";


        container
            .querySelector(
                ".customer-account__auth"
            )
            ?.prepend(error);

    }


    error.textContent =
        message;

    error.hidden = false;

}


// ========================================
// FIREBASE AUTH ERROR MESSAGES
// ========================================

function getAuthErrorMessage(error) {

    switch (error?.code) {

        case "auth/invalid-email":
            return "El correo electrónico no es válido.";

        case "auth/user-not-found":
            return "No existe una cuenta con este correo.";

        case "auth/wrong-password":
            return "La contraseña es incorrecta.";

        case "auth/invalid-credential":
            return "El correo o la contraseña son incorrectos.";

        case "auth/email-already-in-use":
            return "Ya existe una cuenta con este correo.";

        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";

        case "auth/popup-closed-by-user":
            return "El inicio de sesión con Google fue cancelado.";

        case "auth/popup-blocked":
            return "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo nuevamente.";

        case "auth/account-exists-with-different-credential":
            return "Ya existe una cuenta con este correo utilizando otro método de acceso.";

        case "auth/network-request-failed":
            return "No se pudo conectar con Firebase. Revisa tu conexión.";

        default:
            return "No pudimos completar la autenticación. Inténtalo nuevamente.";

    }

}


// ========================================
// HELPERS
// ========================================

function getInitial(name) {

    return (
        name
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase()
        || "C"
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}