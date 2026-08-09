export function EnterpriseHeader(profile) {

    const name = profile?.name || "Usuario";
    const role = profile?.role || "employee";

    const initial = name
        .charAt(0)
        .toUpperCase();

    return `
        <header class="enterprise-header">

            <div class="enterprise-header__left">

                <button
    type="button"
    class="enterprise-header__menu"
    id="enterprise-menu-toggle"
    aria-label="Abrir menú"
>
    <i class="fa-solid fa-bars"></i>
</button>

                <div class="enterprise-header__title">
                    Enterprise
                </div>

            </div>


            <div class="enterprise-header__right">

                <div class="enterprise-header__user">

                    <div class="enterprise-header__avatar">
                        ${initial}
                    </div>

                    <div class="enterprise-header__user-info">

                        <span class="enterprise-header__user-name">
                            ${name}
                        </span>

                        <span class="enterprise-header__user-role">
                            ${role}
                        </span>

                    </div>

                </div>

            </div>

        </header>
    `;
}