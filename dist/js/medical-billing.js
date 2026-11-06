document.addEventListener("DOMContentLoaded", function () {

  "use strict";

  const section =
    document.getElementById("pmex-billing-services");

  if (!section) return;


  const mainContent =
    section.querySelector("[data-billing-reveal]");

  const detail =
    section.querySelector("[data-billing-detail]");

  const card =
    section.querySelector("[data-billing-card]");

  const formItems =
    section.querySelectorAll("[data-billing-form-item]");


  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  function showElement(element) {

    if (!element) return;

    element.classList.remove(
      "opacity-0",
      "translate-y-3",
      "translate-y-5",
      "translate-y-6"
    );

    element.classList.add(
      "opacity-100",
      "translate-y-0"
    );

  }


  /* ============================================================
     REDUCED MOTION
  ============================================================= */

  if (reduceMotion) {

    showElement(mainContent);
    showElement(detail);
    showElement(card);

    formItems.forEach(showElement);

    return;

  }


  /* ============================================================
     SCROLL REVEAL
  ============================================================= */

  let animated = false;


  const observer =
    new IntersectionObserver(
      function (entries, observerInstance) {

        entries.forEach(function (entry) {

          if (!entry.isIntersecting || animated) {
            return;
          }

          animated = true;


          /* LEFT CONTENT */
          setTimeout(function () {
            showElement(mainContent);
          }, 40);


          /* RIGHT CARD */
          setTimeout(function () {
            showElement(card);
          }, 120);


          /* CONTACT STRIP */
          setTimeout(function () {
            showElement(detail);
          }, 180);


          /* FORM ELEMENTS */
          formItems.forEach(function (item, index) {

            setTimeout(function () {
              showElement(item);
            }, 260 + index * 70);

          });


          observerInstance.unobserve(section);

        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );


  observer.observe(section);

});