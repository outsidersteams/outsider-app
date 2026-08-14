const FAQ_ITEMS = [
    {
        question: "Cuanto tarda mi pedido?",
        answer: "Los pedidos se procesan y entregan en un plazo aproximado de 5 a 6 días hábiles."
    },
    {
        question: "Realizan envíos a toda Guatemala?",
        answer: "Sí, realizamos envíos a toda Guatemala."
    },
    {
        question: "Puedo cancelar mi pedido?",
        answer: "Puedes solicitar la cancelación de tu pedido mientras este no haya sido enviado."
    },
    {
        question: "Puedo cambiar mi talla?",
        answer: "Puedes solicitar un cambio de talla siguiendo nuestras políticas de cambios."
    }
];

export function CustomerFooter() {
    return `
        <footer class="customer-footer">

            <div class="customer-footer__inner">

                <a
                    href="/"
                    class="customer-footer__logo"
                    data-spa-link
                    aria-label="Outsider"
                >
                    <img
                        src="/assets/outsider-logo.svg"
                        alt="Outsider"
                    >
                </a>

                <section
                    class="customer-footer__faq"
                    aria-labelledby="customer-footer-faq-title"
                >

                    <h2
                        id="customer-footer-faq-title"
                        class="customer-footer__faq-title"
                    >
                        Preguntas frecuentes
                    </h2>

                    <div class="customer-footer__faq-list">

                        ${FAQ_ITEMS.map((item, index) => `
                            <div class="customer-footer__faq-item">

                                <button
                                    type="button"
                                    class="customer-footer__faq-question"
                                    data-faq-index="${index}"
                                    aria-expanded="false"
                                >
                                    <span>
                                        ${escapeHTML(item.question)}
                                    </span>

                                    <span
                                        class="customer-footer__faq-icon"
                                        aria-hidden="true"
                                    >
                                        +
                                    </span>
                                </button>

                                <div
                                    class="customer-footer__faq-answer"
                                    data-faq-answer="${index}"
                                    hidden
                                >
                                    <p>
                                        ${escapeHTML(item.answer)}
                                    </p>
                                </div>

                            </div>
                        `).join("")}

                    </div>

                </section>

                <section class="customer-footer__social">

                    <h2 class="customer-footer__social-title">
                        Follow us
                    </h2>

                    <nav
                        class="customer-footer__social-links"
                        aria-label="Redes sociales"
                    >

                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <i
                                class="fa-brands fa-instagram"
                                aria-hidden="true"
                            ></i>
                        </a>

                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <i
                                class="fa-brands fa-facebook-f"
                                aria-hidden="true"
                            ></i>
                        </a>

                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                        >
                            <i
                                class="fa-brands fa-tiktok"
                                aria-hidden="true"
                            ></i>
                        </a>

                    </nav>

                </section>

                <div class="customer-footer__copyright">
                    © ${new Date().getFullYear()} Outsider
                </div>

            </div>

        </footer>
    `;
}

export function initCustomerFooter() {
    const footer = document.querySelector(".customer-footer");

    if (!footer) return;

    const questions = footer.querySelectorAll(
        ".customer-footer__faq-question"
    );

    questions.forEach(question => {

        question.addEventListener("click", () => {

            const index = question.dataset.faqIndex;

            const answer = footer.querySelector(
                `[data-faq-answer="${index}"]`
            );

            if (!answer) return;

            const isOpen =
                question.getAttribute("aria-expanded") === "true";

            questions.forEach(otherQuestion => {

                const otherIndex =
                    otherQuestion.dataset.faqIndex;

                const otherAnswer = footer.querySelector(
                    `[data-faq-answer="${otherIndex}"]`
                );

                otherQuestion.setAttribute(
                    "aria-expanded",
                    "false"
                );

                otherAnswer?.setAttribute(
                    "hidden",
                    ""
                );

                otherQuestion
                    .closest(".customer-footer__faq-item")
                    ?.classList.remove("is-open");
            });

            if (!isOpen) {

                question.setAttribute(
                    "aria-expanded",
                    "true"
                );

                answer.removeAttribute("hidden");

                question
                    .closest(".customer-footer__faq-item")
                    ?.classList.add("is-open");
            }
        });

    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}