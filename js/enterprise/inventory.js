// ========================================
// ENTERPRISE INVENTORY
// ========================================

import {
    EnterpriseLayout
} from "../components/enterpriseLayout.js";

import {
    getInventory,
    getInventoryItem,
    getInventoryMovementsByInventoryId,
    registerInventoryEntry,
    registerInventoryExit
} from "../firebase/firestore.js";


// ========================================
// VIEW
// ========================================

export function EnterpriseInventory(
    profile
) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const inventoryId =
        params.get("id");


    // ====================================
    // DETAIL VIEW
    // ====================================

    if (inventoryId) {

        const content = `

            <section class="enterprise-inventory">

                <div class="enterprise-inventory__header">

                    <div>

                        <h1>
                            Inventario
                        </h1>

                        <p>
                            Detalle del registro de inventario.
                        </p>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__content"
                    id="enterprise-inventory-content"
                >

                    <div class="enterprise-inventory__loading">

                        Cargando inventario...

                    </div>

                </div>

            </section>

        `;


        return EnterpriseLayout(
            content,
            profile
        );

    }


    // ====================================
    // LIST VIEW
    // ====================================

    const content = `

        <section class="enterprise-inventory">

            <div class="enterprise-inventory__header">

                <div>

                    <h1>
                        Inventario
                    </h1>

                    <p>
                        Control de existencias y movimientos.
                    </p>

                </div>

            </div>


            <div
                class="enterprise-inventory__content"
                id="enterprise-inventory-content"
            >

                <div class="enterprise-inventory__loading">

                    Cargando inventario...

                </div>

            </div>

        </section>

    `;


    return EnterpriseLayout(
        content,
        profile
    );

}


// ========================================
// INIT
// ========================================

export async function initEnterpriseInventory(
    profile
) {

    console.log(
        "✓ Enterprise Inventory inicializado"
    );


    const container =
        document.querySelector(
            "#enterprise-inventory-content"
        );


    if (!container) {

        console.error(
            "No se encontró el contenedor de Inventory."
        );

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const inventoryId =
        params.get("id");


    // ====================================
    // DETAIL
    // ====================================

    if (inventoryId) {

        await renderInventoryDetail(
            container,
            inventoryId
        );

        return;

    }


    // ====================================
    // LIST
    // ====================================

    await renderInventoryList(
        container
    );

}


// ========================================
// RENDER LIST
// ========================================

async function renderInventoryList(
    container
) {

    try {

        const inventory =
            await getInventory();


        console.log(
            "✓ Inventory cargado:",
            inventory
        );


        if (
            inventory.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="enterprise-inventory__empty"
                >

                    <h2>
                        No hay inventario registrado
                    </h2>

                    <p>
                        Todavía no existen registros
                        de inventario.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div
                class="enterprise-inventory__list"
            >

                ${inventory.map(
                    item => `

                        <article
                            class="enterprise-inventory__card"
                        >

                            <div
                                class="enterprise-inventory__card-main"
                            >

                                <div>

                                    <h2>
                                        ${
                                            item.productName ||
                                            "Producto sin nombre"
                                        }
                                    </h2>

                                    <p>
                                        ${
                                            item.variantName ||
                                            "Sin variante"
                                        }
                                        ·
                                        ${
                                            item.sizeName ||
                                            "Sin talla"
                                        }
                                    </p>

                                </div>


                                <div
                                    class="enterprise-inventory__stock"
                                >

                                    <strong>
                                        ${
                                            item.stock ?? 0
                                        }
                                    </strong>

                                    <span>
                                        Stock
                                    </span>

                                </div>

                            </div>


                            <div
                                class="enterprise-inventory__card-meta"
                            >

                                <span>

                                    SKU:
                                    ${
                                        item.sku ||
                                        "Sin SKU"
                                    }

                                </span>


                                <span>

                                    ${
                                        item.catalogStatus ===
                                        "active"
                                            ? "Catálogo activo"
                                            : "Retirado del catálogo"
                                    }

                                </span>

                            </div>


                            <button
                                type="button"
                                class="enterprise-inventory__card-action"
                                data-inventory-id="${item.id}"
                            >

                                Ver inventario

                                <i class="fa-solid fa-arrow-right"></i>

                            </button>

                        </article>

                    `
                ).join("")}

            </div>

        `;


        // =================================
        // DETAIL NAVIGATION
        // =================================

        const detailButtons =
            container.querySelectorAll(
                ".enterprise-inventory__card-action"
            );


        detailButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const inventoryId =
                            button.dataset.inventoryId;


                        if (!inventoryId) {

                            return;

                        }


                        window.location.href =
                            `/enterprise/inventory?id=${inventoryId}`;

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Error cargando Inventory:",
            error
        );


        container.innerHTML = `

            <div
                class="enterprise-inventory__error"
            >

                <h2>
                    No se pudo cargar el inventario
                </h2>

                <p>
                    Ocurrió un error al consultar
                    los registros de inventario.
                </p>

            </div>

        `;

    }

}


// ========================================
// RENDER DETAIL
// ========================================

async function renderInventoryDetail(
    container,
    inventoryId
) {

    try {

        const item =
            await getInventoryItem(
                inventoryId
            );


        console.log(
            "✓ Inventory detalle cargado:",
            item
        );


        // =================================
        // NOT FOUND
        // =================================

        if (!item) {

            container.innerHTML = `

                <div
                    class="enterprise-inventory__empty"
                >

                    <h2>
                        Inventario no encontrado
                    </h2>

                    <p>
                        El registro solicitado
                        no existe.
                    </p>


                    <button
                        type="button"
                        class="enterprise-inventory__card-action"
                        id="enterprise-inventory-back"
                    >

                        <i class="fa-solid fa-arrow-left"></i>

                        Volver al inventario

                    </button>

                </div>

            `;


            initBackButton();

            return;

        }


        // =================================
        // LOAD MOVEMENTS
        // =================================

        const movements =
            await getInventoryMovementsByInventoryId(
                inventoryId
            );


        console.log(
            "✓ Movimientos de Inventory cargados:",
            movements
        );


        // =================================
        // DETAIL VIEW
        // =================================

        container.innerHTML = `

            <div
                class="enterprise-inventory__detail"
            >

                <button
                    type="button"
                    class="enterprise-inventory__back"
                    id="enterprise-inventory-back"
                >

                    <i class="fa-solid fa-arrow-left"></i>

                    Volver al inventario

                </button>


                <div
                    class="enterprise-inventory__detail-header"
                >

                    <div>

                        <span>
                            Inventario
                        </span>

                        <h2>
                            ${
                                item.productName ||
                                "Producto sin nombre"
                            }
                        </h2>

                        <p>
                            ${
                                item.variantName ||
                                "Sin variante"
                            }
                            ·
                            ${
                                item.sizeName ||
                                "Sin talla"
                            }
                        </p>

                    </div>


                    <div
                        class="enterprise-inventory__detail-stock"
                    >

                        <strong>
                            ${
                                item.stock ?? 0
                            }
                        </strong>

                        <span>
                            Stock actual
                        </span>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-info"
                >

                    <div>

                        <span>
                            SKU
                        </span>

                        <strong>
                            ${
                                item.sku ||
                                "Sin SKU"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Variante
                        </span>

                        <strong>
                            ${
                                item.variantName ||
                                "Sin variante"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Talla
                        </span>

                        <strong>
                            ${
                                item.sizeName ||
                                "Sin talla"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Estado catálogo
                        </span>

                        <strong>
                            ${
                                item.catalogStatus ===
                                "active"
                                    ? "Activo"
                                    : "Retirado"
                            }
                        </strong>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-actions"
                >

                    <button
                        type="button"
                        class="enterprise-inventory__action enterprise-inventory__action--entry"
                        id="enterprise-inventory-entry-button"
                    >

                        <i class="fa-solid fa-arrow-down"></i>

                        Registrar entrada

                    </button>


                    <button
                        type="button"
                        class="enterprise-inventory__action enterprise-inventory__action--exit"
                        id="enterprise-inventory-exit-button"
                    >

                        <i class="fa-solid fa-arrow-up"></i>

                        Registrar salida

                    </button>

                </div>


                <div
                    class="enterprise-inventory__entry-form"
                    id="enterprise-inventory-entry-form"
                    hidden
                >

                    <div
                        class="enterprise-inventory__entry-form-header"
                    >

                        <div>

                            <span>
                                Entrada de inventario
                            </span>

                            <h3>
                                Registrar ingreso
                            </h3>

                        </div>

                        <button
                            type="button"
                            class="enterprise-inventory__entry-close"
                            id="enterprise-inventory-entry-close"
                            aria-label="Cerrar"
                        >

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>


                    <div
                        class="enterprise-inventory__entry-form-body"
                    >

                        <label>

                            <span>
                                Cantidad
                            </span>

                            <input
                                type="number"
                                id="enterprise-inventory-entry-quantity"
                                min="1"
                                step="1"
                                inputmode="numeric"
                                placeholder="Ej. 5"
                            />

                        </label>


                        <label>

                            <span>
                                Motivo
                            </span>

                            <select
                                id="enterprise-inventory-entry-reason"
                            >

                                <option value="purchase">
                                    Compra
                                </option>

                                <option value="return">
                                    Devolución
                                </option>

                                <option value="initial_stock">
                                    Inventario inicial
                                </option>

                                <option value="other">
                                    Otro
                                </option>

                            </select>

                        </label>


                        <label>

                            <span>
                                Notas
                            </span>

                            <textarea
                                id="enterprise-inventory-entry-notes"
                                rows="3"
                                placeholder="Opcional"
                            ></textarea>

                        </label>


                        <div
                            class="enterprise-inventory__entry-form-error"
                            id="enterprise-inventory-entry-error"
                            hidden
                        ></div>


                        <div
                            class="enterprise-inventory__entry-form-actions"
                        >

                            <button
                                type="button"
                                class="enterprise-inventory__entry-cancel"
                                id="enterprise-inventory-entry-cancel"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                class="enterprise-inventory__entry-submit"
                                id="enterprise-inventory-entry-submit"
                            >
                                Registrar entrada
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__exit-form"
                    id="enterprise-inventory-exit-form"
                    hidden
                >

                    <div
                        class="enterprise-inventory__exit-form-header"
                    >

                        <div>

                            <span>
                                Salida de inventario
                            </span>

                            <h3>
                                Registrar salida
                            </h3>

                        </div>

                        <button
                            type="button"
                            class="enterprise-inventory__exit-close"
                            id="enterprise-inventory-exit-close"
                            aria-label="Cerrar"
                        >

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>


                    <div
                        class="enterprise-inventory__exit-form-body"
                    >

                        <div
                            class="enterprise-inventory__exit-stock-reference"
                        >

                            <span>
                                Stock disponible
                            </span>

                            <strong>
                                ${
                                    item.stock ?? 0
                                }
                            </strong>

                        </div>


                        <label>

                            <span>
                                Cantidad
                            </span>

                            <input
                                type="number"
                                id="enterprise-inventory-exit-quantity"
                                min="1"
                                step="1"
                                inputmode="numeric"
                                placeholder="Ej. 5"
                            />

                        </label>


                        <label>

                            <span>
                                Motivo
                            </span>

                            <select
                                id="enterprise-inventory-exit-reason"
                            >

                                <option value="sale">
                                    Venta
                                </option>

                                <option value="damage">
                                    Daño / pérdida
                                </option>

                                <option value="transfer">
                                    Traslado
                                </option>

                                <option value="other">
                                    Otro
                                </option>

                            </select>

                        </label>


                        <label>

                            <span>
                                Notas
                            </span>

                            <textarea
                                id="enterprise-inventory-exit-notes"
                                rows="3"
                                placeholder="Opcional"
                            ></textarea>

                        </label>


                        <div
                            class="enterprise-inventory__exit-form-error"
                            id="enterprise-inventory-exit-error"
                            hidden
                        ></div>


                        <div
                            class="enterprise-inventory__exit-form-actions"
                        >

                            <button
                                type="button"
                                class="enterprise-inventory__exit-cancel"
                                id="enterprise-inventory-exit-cancel"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                class="enterprise-inventory__exit-submit"
                                id="enterprise-inventory-exit-submit"
                            >
                                Registrar salida
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="enterprise-inventory__detail-movements"
                >

                    <div
                        class="enterprise-inventory__detail-section-header"
                    >

                        <div>

                            <span>
                                Historial
                            </span>

                            <h3>
                                Movimientos de inventario
                            </h3>

                        </div>

                        <strong>
                            ${movements.length}
                        </strong>

                    </div>


                    ${
                        movements.length
                            ? `
                                <div
                                    class="enterprise-inventory__movement-list"
                                >

                                    ${movements.map(
                                        movement => `

                                            <div
                                                class="
                                                    enterprise-inventory__movement
                                                    enterprise-inventory__movement--${movement.type || "unknown"}
                                                "
                                            >

                                                <div
                                                    class="enterprise-inventory__movement-main"
                                                >

                                                    <strong>
                                                        ${
                                                            movement.type === "entry"
                                                                ? "Entrada"
                                                                : movement.type === "exit"
                                                                    ? "Salida"
                                                                    : movement.type === "adjustment"
                                                                        ? "Ajuste"
                                                                        : "Movimiento"
                                                        }
                                                    </strong>

                                                    <span>
                                                        ${
                                                            movement.reason ||
                                                            "Sin motivo"
                                                        }
                                                    </span>

                                                    ${
                                                        movement.notes
                                                            ? `
                                                                <small
                                                                    class="enterprise-inventory__movement-note"
                                                                >
                                                                    ${movement.notes}
                                                                </small>
                                                            `
                                                            : ""
                                                    }

                                                    ${
                                                        movement.createdBy
                                                            ? `
                                                                <small
                                                                    class="enterprise-inventory__movement-user"
                                                                >
                                                                    <i class="fa-solid fa-user"></i>

                                                                    ${
                                                                        movement.createdBy.name ||
                                                                        movement.createdBy.email ||
                                                                        "Usuario"
                                                                    }
                                                                </small>
                                                            `
                                                            : ""
                                                    }

                                                </div>


                                                <div
                                                    class="enterprise-inventory__movement-quantity"
                                                >

                                                    ${
                                                        movement.type === "entry"
                                                            ? "+"
                                                            : movement.type === "exit"
                                                                ? "-"
                                                                : movement.direction === "increase"
                                                                    ? "+"
                                                                    : "-"
                                                    }${
                                                        movement.quantity ?? 0
                                                    }

                                                </div>

                                            </div>

                                        `
                                    ).join("")}

                                </div>
                            `
                            : `
                                <div
                                    class="enterprise-inventory__movement-empty"
                                >

                                    No hay movimientos registrados
                                    para este inventario.

                                </div>
                            `
                    }

                </div>

            </div>

        `;


        initBackButton();

        initInventoryEntryForm(
            inventoryId
        );

        initInventoryExitForm(
            inventoryId
        );

    } catch (error) {

        console.error(
            "Error cargando detalle de Inventory:",
            error
        );


        container.innerHTML = `

            <div
                class="enterprise-inventory__error"
            >

                <h2>
                    No se pudo cargar el inventario
                </h2>

                <p>
                    Ocurrió un error al consultar
                    el registro solicitado.
                </p>


                <button
                    type="button"
                    class="enterprise-inventory__card-action"
                    id="enterprise-inventory-back"
                >

                    <i class="fa-solid fa-arrow-left"></i>

                    Volver al inventario

                </button>

            </div>

        `;


        initBackButton();

    }

}


// ========================================
// INVENTORY ENTRY FORM
// ========================================

function initInventoryEntryForm(
    inventoryId
) {

    const openButton =
        document.querySelector(
            "#enterprise-inventory-entry-button"
        );

    const form =
        document.querySelector(
            "#enterprise-inventory-entry-form"
        );

    const closeButton =
        document.querySelector(
            "#enterprise-inventory-entry-close"
        );

    const cancelButton =
        document.querySelector(
            "#enterprise-inventory-entry-cancel"
        );

    const submitButton =
        document.querySelector(
            "#enterprise-inventory-entry-submit"
        );

    const quantityInput =
        document.querySelector(
            "#enterprise-inventory-entry-quantity"
        );

    const reasonInput =
        document.querySelector(
            "#enterprise-inventory-entry-reason"
        );

    const notesInput =
        document.querySelector(
            "#enterprise-inventory-entry-notes"
        );

    const errorBox =
        document.querySelector(
            "#enterprise-inventory-entry-error"
        );


    if (
        !openButton ||
        !form ||
        !closeButton ||
        !cancelButton ||
        !submitButton ||
        !quantityInput ||
        !reasonInput ||
        !notesInput ||
        !errorBox
    ) {

        console.error(
            "No se pudo inicializar el formulario de entrada."
        );

        return;

    }


    const closeForm =
        () => {

            form.hidden = true;

            errorBox.hidden = true;

            errorBox.textContent = "";

            quantityInput.value = "";

            reasonInput.value = "purchase";

            notesInput.value = "";

        };


    const openForm =
        () => {

            form.hidden = false;

            errorBox.hidden = true;

            quantityInput.focus();

        };


    openButton.addEventListener(
        "click",
        openForm
    );


    closeButton.addEventListener(
        "click",
        closeForm
    );


    cancelButton.addEventListener(
        "click",
        closeForm
    );


    submitButton.addEventListener(
        "click",
        async () => {

            const quantity =
                Number(
                    quantityInput.value
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                errorBox.textContent =
                    "La cantidad debe ser un número entero mayor que 0.";

                errorBox.hidden = false;

                quantityInput.focus();

                return;

            }


            const reason =
                reasonInput.value;


            const notes =
                notesInput.value.trim();


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Registrando...";

                errorBox.hidden = true;


                const result =
                    await registerInventoryEntry(
                        inventoryId,
                        quantity,
                        {
                            reason,
                            notes
                        }
                    );


                console.log(
                    "✓ Entrada registrada desde Inventory:",
                    result
                );


                // Recarga el detalle para reflejar
                // stock e historial inmediatamente.
                window.location.reload();

            } catch (error) {

                console.error(
                    "Error registrando entrada:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "No se pudo registrar la entrada.";

                errorBox.hidden = false;

                submitButton.disabled = false;

                submitButton.textContent =
                    "Registrar entrada";

            }

        }
    );

}

// ========================================
// INVENTORY EXIT FORM
// ========================================

function initInventoryExitForm(
    inventoryId
) {

    const openButton =
        document.querySelector(
            "#enterprise-inventory-exit-button"
        );

    const form =
        document.querySelector(
            "#enterprise-inventory-exit-form"
        );

    const closeButton =
        document.querySelector(
            "#enterprise-inventory-exit-close"
        );

    const cancelButton =
        document.querySelector(
            "#enterprise-inventory-exit-cancel"
        );

    const submitButton =
        document.querySelector(
            "#enterprise-inventory-exit-submit"
        );

    const quantityInput =
        document.querySelector(
            "#enterprise-inventory-exit-quantity"
        );

    const reasonInput =
        document.querySelector(
            "#enterprise-inventory-exit-reason"
        );

    const notesInput =
        document.querySelector(
            "#enterprise-inventory-exit-notes"
        );

    const errorBox =
        document.querySelector(
            "#enterprise-inventory-exit-error"
        );


    if (
        !openButton ||
        !form ||
        !closeButton ||
        !cancelButton ||
        !submitButton ||
        !quantityInput ||
        !reasonInput ||
        !notesInput ||
        !errorBox
    ) {

        console.error(
            "No se pudo inicializar el formulario de salida."
        );

        return;

    }


    const closeForm =
        () => {

            form.hidden = true;

            errorBox.hidden = true;

            errorBox.textContent = "";

            quantityInput.value = "";

            reasonInput.value = "sale";

            notesInput.value = "";

        };


    openButton.addEventListener(
        "click",
        () => {

            form.hidden = false;

            errorBox.hidden = true;

            quantityInput.focus();

        }
    );


    closeButton.addEventListener(
        "click",
        closeForm
    );


    cancelButton.addEventListener(
        "click",
        closeForm
    );


    submitButton.addEventListener(
        "click",
        async () => {

            const quantity =
                Number(
                    quantityInput.value
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                errorBox.textContent =
                    "La cantidad debe ser un número entero mayor que 0.";

                errorBox.hidden = false;

                quantityInput.focus();

                return;

            }


            const reason =
                reasonInput.value;


            const notes =
                notesInput.value.trim();


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Registrando...";

                errorBox.hidden = true;


                const result =
                    await registerInventoryExit(
                        inventoryId,
                        quantity,
                        {
                            reason,
                            notes
                        }
                    );


                console.log(
                    "✓ Salida registrada desde Inventory:",
                    result
                );


                window.location.reload();

            } catch (error) {

                console.error(
                    "Error registrando salida:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "No se pudo registrar la salida.";

                errorBox.hidden = false;

                submitButton.disabled = false;

                submitButton.textContent =
                    "Registrar salida";

            }

        }
    );

}

// ========================================
// BACK BUTTON
// ========================================

function initBackButton() {

    const backButton =
        document.querySelector(
            "#enterprise-inventory-back"
        );


    if (!backButton) {

        return;

    }


    backButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "/enterprise/inventory";

        }
    );

}
