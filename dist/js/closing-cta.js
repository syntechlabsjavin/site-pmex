document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.querySelector("#pmex-closing-cta");

    if (!section) return;


    const revealItems =
        section.querySelectorAll("[data-closing-reveal]");


    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    revealItems.forEach((item, index) => {

                        setTimeout(() => {

                            item.classList.remove(
                                "u-opacity-0",
                                "u-translate-y-5"
                            );

                            item.classList.add(
                                "u-opacity-100",
                                "u-translate-y-0"
                            );

                        }, index * 130);

                    });

                    observerInstance.unobserve(entry.target);

                });

            },
            {
                threshold: 0.18
            }
        );


    observer.observe(section);

});