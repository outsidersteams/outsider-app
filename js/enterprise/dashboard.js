import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

export function EnterpriseDashboard(profile) {

    const content = `

        <section class="enterprise-dashboard">

            <h1>
                Dashboard
            </h1>

            <p>
                Bienvenido, ${profile?.name || "Usuario"}.
            </p>

        </section>

    `;

    return EnterpriseLayout(
        content,
        profile
    );

}