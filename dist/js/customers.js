function switchAccordion(index) {
    for (let i = 0; i < 4; i++) {
        const item = document.getElementById('acc-item-' + i);
        const dot = document.getElementById('acc-dot-' + i);
        const label = document.getElementById('acc-label-' + i);
        const content = document.getElementById('acc-content-' + i);

        if (i === index) {
            item.style.background = 'linear-gradient(90deg in srgb, var(--c-E3ECDA) 0%, var(--c-F4F6F0) 60%)';
            dot.className = 'u-w-7px u-h-7px u-rounded-full u-flex-shrink-0 u-bg-7FB35C';
            label.className = 'u-text-11px u-font-bold u-tracking-1-5px u-uppercase u-text-6A6A62';
            content.classList.remove('u-hidden');
        } else {
            item.style.background = '';
            dot.className = 'u-w-7px u-h-7px u-rounded-full u-flex-shrink-0 u-bg-C4C4BC';
            label.className = 'u-text-11px u-font-bold u-tracking-1-5px u-uppercase u-text-9A9A92';
            content.classList.add('u-hidden');
        }
    }
}

switchAccordion(0);