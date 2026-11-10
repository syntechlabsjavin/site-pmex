(function () {
    let modalLoadingPromise = null;

    // Timezone Data
    const timezonesData = [
        { category: 'US/CANADA', name: 'Pacific Time - US & Canada', iana: 'America/Los_Angeles' },
        { category: 'US/CANADA', name: 'Vancouver Time', iana: 'America/Vancouver' },
        { category: 'US/CANADA', name: 'Mountain Time - US & Canada', iana: 'America/Denver' },
        { category: 'US/CANADA', name: 'Central Time - US & Canada', iana: 'America/Chicago' },
        { category: 'US/CANADA', name: 'Eastern Time - US & Canada', iana: 'America/New_York' },
        { category: 'US/CANADA', name: 'Alaska Time', iana: 'America/Anchorage' },
        { category: 'US/CANADA', name: 'Hawaii Time', iana: 'Pacific/Honolulu' },

        { category: 'EUROPE & ASIA', name: 'London Time (GMT/BST)', iana: 'Europe/London' },
        { category: 'EUROPE & ASIA', name: 'Paris / Berlin Time (CET)', iana: 'Europe/Paris' },
        { category: 'EUROPE & ASIA', name: 'Dubai Time (GST)', iana: 'Asia/Dubai' },
        { category: 'EUROPE & ASIA', name: 'Tokyo Time (JST)', iana: 'Asia/Tokyo' },
        { category: 'EUROPE & ASIA', name: 'Sydney Time (AEST)', iana: 'Australia/Sydney' }
    ];

    let selectedTz = timezonesData[0]; // Default: Pacific Time
    let is24HourFormat = false;
    let tzSearchQuery = '';

    async function ensureModalLoaded() {
        if (document.getElementById('booking-modal-overlay')) {
            return document.getElementById('booking-modal-overlay');
        }

        if (!modalLoadingPromise) {
            modalLoadingPromise = (async () => {
                try {
                    let response;
                    try {
                        response = await fetch('/company/demo.html');
                        if (!response.ok) response = await fetch('/company/demo.html');
                        if (!response.ok) response = await fetch('/company/demo.html');
                    } catch (e) {
                        try { response = await fetch('/company/demo.html'); }
                        catch (e2) { response = await fetch('/company/demo.html'); }
                    }

                    const htmlText = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');
                    const overlay = doc.getElementById('booking-modal-overlay');
                    if (overlay) {
                        overlay.classList.add('hidden');
                        overlay.classList.remove('flex');
                        document.body.appendChild(overlay);
                        setupModalEvents(overlay);
                        updateTzTriggerText();
                        return overlay;
                    }
                } catch (err) {
                    console.error('Failed to load demo modal HTML:', err);
                } finally {
                    modalLoadingPromise = null;
                }
            })();
        }

        return modalLoadingPromise;
    }

    function setupModalEvents(overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                window.closeBookingModal();
            }
        });

        // Close timezone dropdown if clicking outside dropdown
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('booking-tz-dropdown');
            const isTrigger = e.target.closest('.tz-trigger-btn');
            if (dropdown && !dropdown.contains(e.target) && !isTrigger) {
                dropdown.classList.add('hidden');
            }
        });
    }

    function getFormattedTimeForZone(ianaZone, is24h) {
        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: ianaZone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: !is24h
            });
            return formatter.format(now).toLowerCase().replace(/\s+/g, '');
        } catch (e) {
            return '';
        }
    }

    window.toggleTzDropdown = function (e) {
        if (e) e.stopPropagation();
        const dropdown = document.getElementById('booking-tz-dropdown');
        if (!dropdown) return;
        const isHidden = dropdown.classList.contains('hidden');
        if (isHidden) {
            renderTzList();
            dropdown.classList.remove('hidden');
            const searchInput = document.getElementById('tz-search-input');
            if (searchInput) searchInput.focus();
        } else {
            dropdown.classList.add('hidden');
        }
    };

    window.toggleTzFormat = function () {
        is24HourFormat = !is24HourFormat;
        const toggleDot = document.getElementById('tz-format-toggle-dot');
        const toggleBtn = document.getElementById('tz-format-toggle-btn');
        const amLabel = document.getElementById('tz-format-am-label');
        const pmLabel = document.getElementById('tz-format-24-label');

        if (toggleBtn) { toggleBtn.classList.toggle('is-on', is24HourFormat); toggleBtn.setAttribute('aria-pressed', String(is24HourFormat)); }
        if (amLabel) amLabel.classList.toggle('is-on', !is24HourFormat);
        if (pmLabel) pmLabel.classList.toggle('is-on', is24HourFormat);

        renderTzList();
        updateTzTriggerText();
    };

    window.filterTzList = function (query) {
        tzSearchQuery = (query || '').toLowerCase().trim();
        renderTzList();
    };

    function renderTzList() {
        const container = document.getElementById('tz-list-container');
        if (!container) return;

        container.innerHTML = '';

        const filtered = timezonesData.filter(tz =>
            tz.name.toLowerCase().includes(tzSearchQuery) ||
            tz.category.toLowerCase().includes(tzSearchQuery)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p class="bk-tz-empty">No time zones found</p>';
            return;
        }

        const categories = {};
        filtered.forEach(tz => {
            if (!categories[tz.category]) categories[tz.category] = [];
            categories[tz.category].push(tz);
        });

        Object.keys(categories).forEach(cat => {
            const catHeader = document.createElement('div');
            catHeader.className = 'bk-tz-cat';
            catHeader.textContent = cat;
            container.appendChild(catHeader);

            categories[cat].forEach(tz => {
                const timeStr = getFormattedTimeForZone(tz.iana, is24HourFormat);
                const isSelected = selectedTz.iana === tz.iana;

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'bk-tz-item' + (isSelected ? ' is-selected' : '');

                btn.innerHTML = `
                    <span>${tz.name}</span>
                    <span class="bk-tz-time">${timeStr}</span>
                `;

                btn.onclick = (e) => {
                    e.stopPropagation();
                    selectedTz = tz;
                    updateTzTriggerText();
                    renderTzList();
                    const dropdown = document.getElementById('booking-tz-dropdown');
                    if (dropdown) dropdown.classList.add('hidden');
                };

                container.appendChild(btn);
            });
        });
    }

    function updateTzTriggerText() {
        const timeStr = getFormattedTimeForZone(selectedTz.iana, is24HourFormat);
        const text = `${selectedTz.name} (${timeStr})`;

        document.querySelectorAll('.tz-trigger-text').forEach(el => {
            el.textContent = text;
        });

        const tzSelectedText = document.getElementById('booking-selected-tz-text');
        if (tzSelectedText) tzSelectedText.textContent = selectedTz.name;
    }

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTime = null;

    const timeSlots = ["6:00am", "6:15am", "7:00am", "7:15am", "7:30am", "7:45am", "8:00am", "8:15am", "9:00am", "9:30am"];

    function resetModalState() {
        selectedDate = null;
        selectedTime = null;
        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();

        const sdt = document.getElementById('booking-selected-datetime');
        if (sdt) {
            sdt.classList.add('hidden');
            sdt.classList.remove('flex');
        }

        const form = document.querySelector('#booking-step-3 form');
        if (form) form.reset();

        const dropdown = document.getElementById('booking-tz-dropdown');
        if (dropdown) dropdown.classList.add('hidden');

        goToStep(1);
    }

    window.openBookingModal = async function () {
        const overlay = await ensureModalLoaded();
        if (!overlay) return;

        resetModalState();
        updateTzTriggerText();

        const card = document.getElementById('booking-modal-card');
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            if (card) {
                card.classList.remove('opacity-0', 'scale-95');
                card.classList.add('opacity-100', 'scale-100');
            }
        });
    };

    window.closeBookingModal = function () {
        const overlay = document.getElementById('booking-modal-overlay');
        const card = document.getElementById('booking-modal-card');
        if (!overlay) return;

        overlay.classList.add('opacity-0');
        if (card) {
            card.classList.remove('opacity-100', 'scale-100');
            card.classList.add('opacity-0', 'scale-95');
        }

        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            resetModalState();
        }, 300);
    };

    window.bookingBack = function () {
        const step2 = document.getElementById('booking-step-2');
        const step3 = document.getElementById('booking-step-3');
        if (step3 && !step3.classList.contains('hidden')) {
            goToStep(2);
        } else if (step2 && !step2.classList.contains('hidden')) {
            selectedDate = null;
            selectedTime = null;
            const dt = document.getElementById('booking-selected-datetime');
            if (dt) dt.classList.add('hidden');
            goToStep(1);
        } else {
            window.closeBookingModal();
        }
    };

    function goToStep(step) {
        [1, 2, 3].forEach(n => {
            const el = document.getElementById('booking-step-' + n);
            if (el) el.classList.toggle('hidden', n !== step);
        });
        renderCalendar();
    }

    window.changeMonth = function (delta) {
        currentMonth += delta;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    };

    function renderCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const label = monthNames[currentMonth] + " " + currentYear;
        const labelEl1 = document.getElementById('booking-month-label');
        const labelEl2 = document.getElementById('booking-month-label-2');
        if (labelEl1) labelEl1.textContent = label;
        if (labelEl2) labelEl2.textContent = label;

        const grids = [document.getElementById('booking-calendar-grid'), document.getElementById('booking-calendar-grid-2')];
        const firstDay = new Date(currentYear, currentMonth, 1);
        let startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        grids.forEach(grid => {
            if (!grid) return;
            grid.innerHTML = '';
            for (let i = 0; i < startOffset; i++) {
                grid.appendChild(Object.assign(document.createElement('span'), { className: 'bk-day-empty' }));
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const cellDate = new Date(currentYear, currentMonth, d);
                cellDate.setHours(0, 0, 0, 0);
                const isPast = cellDate < today;
                const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();
                const isToday = cellDate.getTime() === today.getTime();

                const btn = document.createElement('button');
                btn.textContent = d;
                btn.type = 'button';
                btn.className = 'bk-day' + (isSelected ? ' is-selected' : isPast ? ' is-past' : '') + (isToday ? ' is-today' : '');
                if (isSelected) btn.setAttribute('aria-pressed', 'true');
                btn.setAttribute('aria-label', cellDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (isToday ? ' (today)' : ''));
                if (!isPast) {
                    btn.onclick = () => selectDate(cellDate);
                } else {
                    btn.disabled = true;
                }
                grid.appendChild(btn);
            }
        });
    }

    function selectDate(date) {
        selectedDate = date;
        selectedTime = null;
        goToStep(2);
        const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const lbl = document.getElementById('booking-slots-date-label');
        if (lbl) lbl.textContent = dateLabel;
        renderSlots();
        // Stacked layout (phones, small tablets): the slots sit below the calendar, so bring them into view.
        if (lbl && window.matchMedia('(max-width: 899px)').matches) {
            requestAnimationFrame(() => lbl.scrollIntoView({ block: 'start', behavior: 'smooth' }));
        }
    }

    function renderSlots() {
        const list = document.getElementById('booking-slots-list');
        if (!list) return;
        list.innerHTML = '';
        timeSlots.forEach(time => {
            const isSelected = selectedTime === time;
            const wrap = document.createElement('div');
            if (isSelected) {
                wrap.className = 'bk-slot-pair';
                wrap.innerHTML = `<button type="button" class="bk-slot is-picked" aria-pressed="true">${time}</button><button type="button" class="bk-slot-next">Next</button>`;
                wrap.querySelector('.bk-slot-next').onclick = () => confirmTime(time);
            } else {
                wrap.innerHTML = `<button type="button" class="bk-slot">${time}</button>`;
                wrap.querySelector('button').onclick = () => { selectedTime = time; renderSlots(); };
            }
            list.appendChild(wrap);
        });
    }

    function confirmTime(time) {
        selectedTime = time;
        const start = time;
        const endMinutes = to24hMinutes(time) + 15;
        const end = fromMinutesTo12h(endMinutes);
        const dateLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        const sdt = document.getElementById('booking-selected-datetime');
        if (sdt) {
            sdt.classList.remove('hidden');
            sdt.classList.add('flex');
        }
        const sdtt = document.getElementById('booking-selected-datetime-text');
        if (sdtt) sdtt.textContent = `${start} - ${end}, ${dateLabel}`;
        updateTzTriggerText();

        goToStep(3);
    }

    function to24hMinutes(t) {
        const [time, ampm] = [t.slice(0, -2), t.slice(-2)];
        let [h, m] = time.split(':').map(Number);
        if (ampm === 'pm' && h !== 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        return h * 60 + m;
    }
    function fromMinutesTo12h(totalMin) {
        let h = Math.floor(totalMin / 60) % 24;
        let m = totalMin % 60;
        const ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12; if (h === 0) h = 12;
        return `${h}:${m.toString().padStart(2, '0')}${ampm}`;
    }

    window.submitBookingForm = function (e) {
        e.preventDefault();
        alert('Demo booked! (hook this up to your backend/email service)');
        window.closeBookingModal();
    };

    // Event Delegation to handle all "Book a demo" clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;

        const href = (target.getAttribute('href') || '').toLowerCase();
        const text = (target.textContent || '').trim().toLowerCase();

        const isDemoHref = href.includes('demo') || href === '#demo';
        const isDemoText = text === 'book a demo' || text === 'demo' || text === 'book demo' || text.includes('book a demo');

        if (isDemoHref || isDemoText) {
            e.preventDefault();
            e.stopPropagation();
            window.openBookingModal();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeBookingModal();
        }
    });

    // Auto-open if query parameter or hash specifies demo
    const checkAutoOpen = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'open' || window.location.hash === '#demo') {
            window.openBookingModal();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAutoOpen);
    } else {
        checkAutoOpen();
    }
})();
