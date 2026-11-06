/* Testimonial slider (same logic as the cardiology page slider in main.js). Loaded by specialty pages that do not load main.js. */
// ===== Testimonial Slider =====
(function () {
    const track = document.getElementById("testiTrack");
    if (!track) return; // safety check in case this section isn't on the page

    let slidesPerView = 3;
    let currentIndex = 0;
    let isAnimating = false;
    let realSlideCount = 0;

    function getSlidesPerView() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function setWidths() {
        const widthPercent = 100 / slidesPerView;
        track.querySelectorAll(".testi-slide").forEach(function (el) {
            el.style.width = widthPercent + "%";
        });
    }

    function setPosition(animate) {
        const widthPercent = 100 / slidesPerView;
        track.style.transition = animate ? "transform 0.5s ease" : "none";
        track.style.transform = "translateX(-" + (currentIndex * widthPercent) + "%)";
    }

    function buildClones() {
        track.querySelectorAll(".testi-slide[data-clone='true']").forEach(function (el) {
            el.remove();
        });

        const realSlides = Array.prototype.slice.call(track.querySelectorAll(".testi-slide"));
        realSlideCount = realSlides.length;
        slidesPerView = getSlidesPerView();

        const startClones = realSlides.slice(-slidesPerView).map(function (el) {
            const clone = el.cloneNode(true);
            clone.setAttribute("data-clone", "true");
            return clone;
        });
        const endClones = realSlides.slice(0, slidesPerView).map(function (el) {
            const clone = el.cloneNode(true);
            clone.setAttribute("data-clone", "true");
            return clone;
        });

        startClones.reverse().forEach(function (clone) {
            track.insertBefore(clone, track.firstChild);
        });
        endClones.forEach(function (clone) {
            track.appendChild(clone);
        });

        setWidths();
        currentIndex = slidesPerView;
        setPosition(false);
    }

    function testiNext() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex++;
        setPosition(true);
    }

    function testiPrev() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex--;
        setPosition(true);
    }

    track.addEventListener("transitionend", function () {
        isAnimating = false;

        if (currentIndex >= realSlideCount + slidesPerView) {
            currentIndex = currentIndex - realSlideCount;
            setPosition(false);
        }
        if (currentIndex < slidesPerView) {
            currentIndex = currentIndex + realSlideCount;
            setPosition(false);
        }
    });

    window.addEventListener("resize", function () {
        buildClones();
    });

    window.testiNext = testiNext;
    window.testiPrev = testiPrev;

    buildClones();
})();
