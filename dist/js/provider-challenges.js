document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.getElementById("pmex-provider-challenges");

    if (!section) return;


    // ========================================================
    // REVEAL
    // ========================================================

    const revealItems =
        section.querySelectorAll(".pmex-challenge-reveal");


    const revealObserver =
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

                    revealObserver.unobserve(entry.target);

                });

            },
            {
                threshold: 0.15
            }
        );


    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });


    // ========================================================
    // COUNTERS
    // ========================================================

    const counters =
        section.querySelectorAll(".pmex-challenge-counter");


    function animateCounter(counter) {

        if (counter.dataset.animated === "true") {
            return;
        }

        counter.dataset.animated = "true";


        const target =
            parseFloat(counter.dataset.target || "0");

        const suffix =
            counter.dataset.suffix || "";

        const duration = 1400;

        const startTime =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                Math.round(target * eased);


            counter.textContent =
                value.toLocaleString() + suffix;


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                counter.textContent =
                    target.toLocaleString() + suffix;
            }

        }


        requestAnimationFrame(update);
    }


    const counterObserver =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;

                    animateCounter(entry.target);

                    counterObserver.unobserve(entry.target);

                });

            },
            {
                threshold: 0.4
            }
        );


    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });


    // ========================================================
    // CHECKBOX COUNTER + SELECTED CARD STYLE
    // ========================================================

    const checkboxes =
        section.querySelectorAll(".pmex-challenge-checkbox");

    const countDisplay =
        document.getElementById("pmex-challenge-count");


    function updateSelectedCount() {

        let selected = 0;


        checkboxes.forEach(function (checkbox) {

            const item =
                checkbox.closest(".pmex-challenge-item");


            if (checkbox.checked) {

                selected++;

                if (item) {
                    item.style.background = "var(--c-F2F8EF)";
                    item.style.borderColor = "var(--c-AAD39C)";
                    item.style.boxShadow =
                        "0 8px 20px rgba(63,154,75,0.05)";
                }

            } else {

                if (item) {
                    item.style.background = "var(--c-FCFDFC)";
                    item.style.borderColor = "var(--c-E1E6DE)";
                    item.style.boxShadow = "none";
                }

            }

        });


        if (countDisplay) {
            countDisplay.textContent = selected;
        }
    }


    checkboxes.forEach(function (checkbox) {

        checkbox.addEventListener(
            "change",
            updateSelectedCount
        );

    });


    updateSelectedCount();

});