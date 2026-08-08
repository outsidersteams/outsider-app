import {
    login,
    getCurrentAuthUser
} from "../firebase/auth.js";
import { checkEnterpriseAccess } from "./authGuard.js";
import { navigate } from "../navigation.js";
export function EnterpriseLogin() {

    return `

    <main class="enterprise-login">

        <div class="enterprise-login__background"></div>

        <section class="enterprise-login__card">

            <div class="enterprise-login__content">
        <div class="enterprise-login__brand">
    <img
        src="/assets/outsider-logo.svg"
        alt="OUTSIDER"
    >
</div>
                

                <form
                    id="enterprise-login-form"
                    class="enterprise-login__form"
                    method="post"
                >

                    <div class="enterprise-login__field">

                        <label
                            for="enterprise-email"
                            class="enterprise-login__label"
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            id="enterprise-email"
                            name="email"
                            class="enterprise-login__input"
                            autocomplete="email"
                            required
                        >

                    </div>

                    <div class="enterprise-login__field">

                        <label
                            for="enterprise-password"
                            class="enterprise-login__label"
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            id="enterprise-password"
                            name="password"
                            class="enterprise-login__input"
                            autocomplete="current-password"
                            required
                        >

                    </div>

                    <button
    type="submit"
    class="enterprise-login__button font-display"
>
    ENTRAR
</button>

                    <p
                        id="enterprise-login-error"
                        class="enterprise-login__error"
                        hidden
                    ></p>

                </form>

            </div>

        </section>

    </main>

`;
}

export async function initEnterpriseLogin() {

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

    form.addEventListener(
        "submit",
        async (event) => {

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

                console.log(
                    "Usuario después de login:",
                    getCurrentAuthUser()
                );


                const access =
                    await checkEnterpriseAccess();


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


                await navigate(
                    "/enterprise/dashboard"
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

        }
    );
}