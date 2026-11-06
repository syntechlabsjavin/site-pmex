document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.getElementById("pmex-service-coverage");

    if (!section) return;


    const items =
        section.querySelectorAll(".pmex-service-reveal");


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;


                    const item = entry.target;

                    const cards =
                        Array.from(
                            section.querySelectorAll(".pmex-service-card")
                        );

                    const cardIndex =
                        cards.indexOf(item);


                    if (cardIndex !== -1) {

                        setTimeout(function () {

                            item.classList.remove(
                                "opacity-0",
                                "translate-y-6"
                            );

                            item.classList.add(
                                "opacity-100",
                                "translate-y-0"
                            );

                        }, cardIndex * 70);

                    } else {

                        item.classList.remove(
                            "opacity-0",
                            "translate-y-5"
                        );

                        item.classList.add(
                            "opacity-100",
                            "translate-y-0"
                        );

                    }


                    observer.unobserve(item);

                });

            },
            {
                threshold: 0.12
            }
        );


    items.forEach(function (item) {
        observer.observe(item);
    });

});