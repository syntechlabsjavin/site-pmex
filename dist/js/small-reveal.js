
document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".pmex-reveal");

    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("opacity-0", "translate-y-6");
                entry.target.classList.add("opacity-100", "translate-y-0");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    items.forEach((item) => observer.observe(item));
});