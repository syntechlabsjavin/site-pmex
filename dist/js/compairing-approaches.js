document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.getElementById("pmex-comparison");

    if (!section) return;

    const items =
        section.querySelectorAll(".pmex-compare-reveal");

    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.remove(
                        "u-opacity-0",
                        "u-translate-y-5",
                        "u-translate-y-6"
                    );

                    entry.target.classList.add(
                        "u-opacity-100",
                        "u-translate-y-0"
                    );

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.15
            }
        );

    items.forEach(function (item) {
        observer.observe(item);
    });

    const traditionalCard = section.querySelector(
        "[data-traditional-compare-card]"
    );

    if (traditionalCard) {
        const label = traditionalCard.querySelector(
            ".traditional-model-label"
        );

        traditionalCard.addEventListener("mouseenter", function () {
            if (!label) return;
            label.style.setProperty("color", "var(--c-F87171)", "important");
        });

        traditionalCard.addEventListener("mouseleave", function () {
            if (!label) return;
            label.style.removeProperty("color");
        });
    }

});