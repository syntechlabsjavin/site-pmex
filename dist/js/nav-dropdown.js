// ---- Smooth Navbar Dropdown Controller ----
// Manages all .nav-dropdown items: only one open at a time, smooth fade, no flicker.
(function () {
    function initNavDropdowns() {
        const items = document.querySelectorAll('.nav-dropdown');
        if (!items.length) return;

        let closeTimer = null;
        let activeItem = null;

        function openDropdown(li) {
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            if (activeItem && activeItem !== li) closeDropdown(activeItem, true);

            activeItem = li;
            const panel = li.querySelector('.nav-dropdown-panel');
            const arrow = li.querySelector('.nav-arrow');
            if (!panel) return;

            panel.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
            panel.classList.add('opacity-100', 'visible', 'pointer-events-auto');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }

        function closeDropdown(li, immediate) {
            const panel = li.querySelector('.nav-dropdown-panel');
            const arrow = li.querySelector('.nav-arrow');
            if (!panel) return;

            const doClose = () => {
                panel.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                panel.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
                if (arrow) arrow.style.transform = '';
                if (activeItem === li) activeItem = null;
            };

            if (immediate) {
                doClose();
            } else {
                closeTimer = setTimeout(doClose, 120);
            }
        }

        items.forEach(li => {
            const panel = li.querySelector('.nav-dropdown-panel');

            li.addEventListener('mouseenter', () => openDropdown(li));

            li.addEventListener('mouseleave', (e) => {
                if (panel && panel.contains(e.relatedTarget)) return;
                closeDropdown(li, false);
            });

            if (panel) {
                panel.addEventListener('mouseenter', () => {
                    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
                });
                panel.addEventListener('mouseleave', (e) => {
                    if (li.contains(e.relatedTarget)) return;
                    closeDropdown(li, false);
                });
            }
        });

        // Close all dropdowns when clicking elsewhere on page
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                items.forEach(li => closeDropdown(li, true));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavDropdowns);
    } else {
        initNavDropdowns();
    }
})();
