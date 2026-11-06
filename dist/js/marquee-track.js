document.addEventListener("DOMContentLoaded", function () {

    const marquees =
        document.querySelectorAll("[data-pmex-marquee]");

    marquees.forEach((marquee) => {

        const track =
            marquee.querySelector("[data-pmex-marquee-track]");

        if (!track) return;


        /* PAUSE WHEN MOUSE ENTERS */
        marquee.addEventListener("mouseenter", function () {
            track.style.animationPlayState = "paused";
        });


        /* CONTINUE WHEN MOUSE LEAVES */
        marquee.addEventListener("mouseleave", function () {
            track.style.animationPlayState = "running";
        });

    });

});