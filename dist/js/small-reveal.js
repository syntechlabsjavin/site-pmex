
document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".pmex-reveal");

    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("u-opacity-0", "u-translate-y-6");
                entry.target.classList.add("u-opacity-100", "u-translate-y-0");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    items.forEach((item) => observer.observe(item));
});