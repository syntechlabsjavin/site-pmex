(function () {
    "use strict";

    const section =
        document.getElementById("pmex-customer-stories");

    if (!section) {
        return;
    }


    const items =
        section.querySelectorAll("[data-story-reveal]");


    /* -----------------------------------------
       REDUCED MOTION
    ------------------------------------------ */

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reduceMotion) {

        items.forEach((item) => {

            item.classList.remove(
                "u-opacity-0",
                "u-translate-y-4",
                "u-translate-y-5",
                "u-translate-y-6"
            );

            item.classList.add(
                "u-opacity-100",
                "u-translate-y-0"
            );

        });

        return;
    }


    /* -----------------------------------------
       INTERSECTION OBSERVER
    ------------------------------------------ */

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const index =
                        Array.from(items).indexOf(
                            entry.target
                        );


                    setTimeout(() => {

                        entry.target.classList.remove(
                            "u-opacity-0",
                            "u-translate-y-4",
                            "u-translate-y-5",
                            "u-translate-y-6"
                        );

                        entry.target.classList.add(
                            "u-opacity-100",
                            "u-translate-y-0"
                        );

                    }, Math.min(index * 70, 280));


                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -30px 0px"
            }
        );


    items.forEach((item) => {
        observer.observe(item);
    });

})();