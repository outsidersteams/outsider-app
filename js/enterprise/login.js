import { login } from "../firebase/auth.js";
import { checkEnterpriseAccess } from "./authGuard.js";

export function EnterpriseLogin() {

    return `

        <section class="enterprise-login">

            <div class="enterprise-login__card">

                <h1>OUTSIDER ENTERPRISE</h1>

                <p>
                    Acceso para personal autorizado
                </p>

                <form
                    id="enterprise-login-form"
                    method="post"
                >

                    <div>
                        <label for="enterprise-email">
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            id="enterprise-email"
                            name="email"
                            autocomplete="email"
                            required
                        >
                    </div>

                    <div>
                        <label for="enterprise-password">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            id="enterprise-password"
                            name="password"
                            autocomplete="current-password"
                            required
                        >
                    </div>

                    <button type="submit">
                        Iniciar sesión
                    </button>

                    <p
                        id="enterprise-login-error"
                        hidden
                    ></p>

                </form>

            </div>

        </section>

    `;
}

export function initEnterpriseLogin() {

    const form = document.querySelector(
        "#enterprise-login-form"
    );

    const errorMessage = document.querySelector(
        "#enterprise-login-error"
    );

    if (!form) {
        console.error(
            "No se encontró el formulario Enterprise"
        );

        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document
            .querySelector("#enterprise-email")
            .value
            .trim();

        const password = document
            .querySelector("#enterprise-password")
            .value;

        errorMessage.hidden = true;
        errorMessage.textContent = "";

        try {

            const user = await login(
    email,
    password
);

console.log(
    "Login Enterprise correcto:",
    user.uid
);

const access = await checkEnterpriseAccess();

if (!access.allowed) {

    console.error(
        "Acceso Enterprise denegado:",
        access.reason
    );

    errorMessage.textContent =
        "No tienes permisos para acceder al área Enterprise.";

    errorMessage.hidden = false;

    return;
}

console.log(
    "Acceso Enterprise autorizado:",
    access.profile
);

window.history.pushState(
    {},
    "",
    "/enterprise/dashboard"
);

window.dispatchEvent(
    new PopStateEvent("popstate")
);

        } catch (error) {

            console.error(
                "Error de login Enterprise:",
                error
            );

            errorMessage.textContent =
                "Correo o contraseña incorrectos.";

            errorMessage.hidden = false;

        }

    });
}