const routes = {
    "/": () => {
        return `
            <h1>OUTSIDER</h1>
            <p>Store pública</p>
        `;
    },

    "/enterprise/login": () => {
        return `
            <h1>OUTSIDER ENTERPRISE</h1>
            <p>Login empresarial</p>
        `;
    }
};


export function router() {

    const path = window.location.pathname;

    const route = routes[path];

    const app = document.querySelector("#app");

    if (!app) {
        console.error("No se encontró #app");
        return;
    }

    if (route) {

        app.innerHTML = route();

    } else {

        app.innerHTML = `
            <h1>404</h1>
            <p>Página no encontrada.</p>
        `;

    }

}