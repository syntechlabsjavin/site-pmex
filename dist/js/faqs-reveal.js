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
            "u-grid-rows-1fr"
        );

        answer.classList.add(
            "u-grid-rows-0fr"
        );


        icon.classList.remove(
            "u-rotate-180",
            "u-bg-EEF5EB"
        );

        icon.classList.add(
            "u-bg-F5F7F3"
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
            "u-grid-rows-0fr"
        );

        answer.classList.add(
            "u-grid-rows-1fr"
        );


        icon.classList.remove(
            "u-bg-F5F7F3"
        );

        icon.classList.add(
            "u-rotate-180",
            "u-bg-EEF5EB"
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
                "u-opacity-0",
                "u-translate-y-5"
            );

            item.classList.add(
                "u-opacity-100",
                "u-translate-y-0"
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
                        "u-opacity-0",
                        "u-translate-y-5"
                    );

                    entry.target.classList.add(
                        "u-opacity-100",
                        "u-translate-y-0"
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