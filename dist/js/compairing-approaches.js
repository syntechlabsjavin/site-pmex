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
                        "opacity-0",
                        "translate-y-5",
                        "translate-y-6"
                    );

                    entry.target.classList.add(
                        "opacity-100",
                        "translate-y-0"
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