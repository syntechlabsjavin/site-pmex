(function () {
    "use strict";

    const section =
        document.getElementById("pmex-faq");

    if (!section) {
        return;
    }


    /* ==========================================================
       ACCORDION
    ========================================================== */

    const items =
        section.querySelectorAll("[data-faq-item]");


    const closeItem = (item) => {

        const button =
            item.querySelector("[data-faq-button]");

        const answer =
            item.querySelector("[data-faq-answer]");

        const icon =
            item.querySelector("[data-faq-icon]");


        button.setAttribute(
            "aria-expanded",
            "false"
        );


        answer.classList.remove(
            "grid-rows-[1fr]"
        );

        answer.classList.add(
            "grid-rows-[0fr]"
        );


        icon.classList.remove(
            "rotate-180",
            "bg-[var(--c-EEF5EB)]"
        );

        icon.classList.add(
            "bg-[var(--c-F5F7F3)]"
        );

    };


    const openItem = (item) => {

        const button =
            item.querySelector("[data-faq-button]");

        const answer =
            item.querySelector("[data-faq-answer]");

        const icon =
            item.querySelector("[data-faq-icon]");


        button.setAttribute(
            "aria-expanded",
            "true"
        );


        answer.classList.remove(
            "grid-rows-[0fr]"
        );

        answer.classList.add(
            "grid-rows-[1fr]"
        );


        icon.classList.remove(
            "bg-[var(--c-F5F7F3)]"
        );

        icon.classList.add(
            "rotate-180",
            "bg-[var(--c-EEF5EB)]"
        );

    };


    items.forEach((item) => {

        const button =
            item.querySelector("[data-faq-button]");


        button.addEventListener(
            "click",
            () => {

                const isOpen =
                    button.getAttribute(
                        "aria-expanded"
                    ) === "true";


                /*
                 * Close other FAQs.
                 * Remove this loop if you want
                 * multiple answers open together.
                 */
                items.forEach((otherItem) => {

                    if (otherItem !== item) {
                        closeItem(otherItem);
                    }

                });


                if (isOpen) {
                    closeItem(item);
                } else {
                    openItem(item);
                }

            }
        );

    });



    /* ==========================================================
       SCROLL REVEAL
    ========================================================== */

    const revealItems =
        section.querySelectorAll(
            "[data-faq-reveal]"
        );


    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reduceMotion) {

        revealItems.forEach((item) => {

            item.classList.remove(
                "opacity-0",
                "translate-y-5"
            );

            item.classList.add(
                "opacity-100",
                "translate-y-0"
            );

        });

        return;
    }


    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.remove(
                        "opacity-0",
                        "translate-y-5"
                    );

                    entry.target.classList.add(
                        "opacity-100",
                        "translate-y-0"
                    );


                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -25px 0px"
            }
        );


    revealItems.forEach((item) => {
        observer.observe(item);
    });

})();