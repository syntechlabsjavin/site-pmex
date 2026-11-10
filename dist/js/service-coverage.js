// Home "Complete Service Coverage" reveal.
// Cards show as soon as they reach the viewport (starting a little before they enter it). The stagger only counts the
// cards that arrive together in one batch and is capped, so a card further down the list never waits for the ones above.
document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("pmex-service-coverage");
    if (!section) return;

    const items = Array.from(section.querySelectorAll(".pmex-service-reveal"));

    function show(item) {
        item.classList.remove("opacity-0", "translate-y-5", "translate-y-6");
        item.classList.add("opacity-100", "translate-y-0");
    }

    // No observer support or reduced motion: show everything right away.
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        items.forEach(show);
        return;
    }

    const STEP = 60;      // ms between cards that appear together
    const MAX_DELAY = 180; // never wait longer than this

    const observer = new IntersectionObserver(function (entries) {
        const arriving = entries
            .filter(function (entry) { return entry.isIntersecting; })
            .map(function (entry) { return entry.target; });

        arriving.forEach(function (item, i) {
            observer.unobserve(item);
            const delay = Math.min(i * STEP, MAX_DELAY);
            if (delay === 0) show(item);
            else setTimeout(function () { show(item); }, delay);
        });
    }, {
        threshold: 0,
        rootMargin: "0px 0px 10% 0px"
    });

    items.forEach(function (item) { observer.observe(item); });
});
