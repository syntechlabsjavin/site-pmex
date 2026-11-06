document.addEventListener("DOMContentLoaded", function () {

  "use strict";


  const section =
    document.getElementById("billing-results");


  if (!section) {
    return;
  }


  const header =
    section.querySelector("[data-results-header]");

  const cards =
    section.querySelectorAll("[data-result-card]");

  const counters =
    section.querySelectorAll(".pmex-counter");


  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;



  /* ============================================================
     COUNTER
  ============================================================= */

  function animateCounter(counter) {

    if (!counter) return;

    if (counter.dataset.animated === "true") {
      return;
    }


    counter.dataset.animated = "true";


    const target =
      parseFloat(counter.dataset.target || "0");

    const prefix =
      counter.dataset.prefix || "";

    const suffix =
      counter.dataset.suffix || "";

    const decimals =
      parseInt(
        counter.dataset.decimals || "0",
        10
      );


    if (reduceMotion) {

      counter.textContent =
        prefix +
        target.toFixed(decimals) +
        suffix;

      return;

    }


    const duration = 1250;

    const startTime =
      performance.now();


    function update(currentTime) {

      const elapsed =
        currentTime - startTime;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );


      /*
       * Smooth ease-out:
       * quicker at the start,
       * settles naturally near final value.
       */
      const eased =
        1 - Math.pow(
          1 - progress,
          3
        );


      const currentValue =
        target * eased;


      counter.textContent =
        prefix +
        currentValue.toFixed(decimals) +
        suffix;


      if (progress < 1) {

        requestAnimationFrame(update);

      } else {

        counter.textContent =
          prefix +
          target.toFixed(decimals) +
          suffix;

      }

    }


    requestAnimationFrame(update);

  }



  /* ============================================================
     SHOW HEADER
  ============================================================= */

  function showHeader() {

    if (!header) return;


    header.classList.remove(
      "opacity-0",
      "translate-y-5"
    );


    header.classList.add(
      "opacity-100",
      "translate-y-0"
    );

  }



  /* ============================================================
     SHOW CARD
  ============================================================= */

  function showCard(card) {

    if (!card) return;


    card.classList.remove(
      "opacity-0",
      "-translate-x-4",
      "translate-x-4",
      "-translate-y-4",
      "translate-y-3",
      "translate-y-5"
    );


    card.classList.add(
      "opacity-100",
      "translate-x-0",
      "translate-y-0"
    );


    const icon =
      card.querySelector(
        "[data-result-icon]"
      );


    if (icon) {

      setTimeout(function () {

        icon.classList.remove(
          "opacity-0",
          "scale-90"
        );


        icon.classList.add(
          "opacity-100",
          "scale-100"
        );

      }, 160);

    }


    const counter =
      card.querySelector(
        ".pmex-counter"
      );


    if (counter) {

      setTimeout(function () {

        animateCounter(counter);

      }, 180);

    }

  }



  /* ============================================================
     REDUCED MOTION
  ============================================================= */

  if (reduceMotion) {

    showHeader();


    cards.forEach(function (card) {

      showCard(card);

    });


    return;

  }



  /* ============================================================
     SECTION OBSERVER
  ============================================================= */

  let sectionAnimated = false;


  const sectionObserver =
    new IntersectionObserver(
      function (entries, observer) {

        entries.forEach(function (entry) {

          if (
            !entry.isIntersecting ||
            sectionAnimated
          ) {
            return;
          }


          sectionAnimated = true;


          /*
           * Header first.
           */
          showHeader();


          /*
           * Cards enter in a controlled wave.
           * Because each starts from a slightly
           * different direction, the movement feels
           * more designed without becoming distracting.
           */
          cards.forEach(
            function (card, index) {

              setTimeout(function () {

                showCard(card);

              }, 150 + index * 110);

            }
          );


          observer.unobserve(section);

        });

      },
      {
        threshold: 0.12,
        rootMargin:
          "0px 0px -40px 0px"
      }
    );


  sectionObserver.observe(section);

});