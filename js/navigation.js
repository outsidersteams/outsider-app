import { router } from "./router.js";

export async function navigate(path) {

    window.history.pushState(
        {},
        "",
        path
    );

    await router();

}