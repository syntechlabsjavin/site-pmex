function switchAccordion(index) {
    for (let i = 0; i < 4; i++) {
        const item = document.getElementById('acc-item-' + i);
        const dot = document.getElementById('acc-dot-' + i);
        const label = document.getElementById('acc-label-' + i);
        const content = document.getElementById('acc-content-' + i);

        if (i === index) {
            item.style.background = 'linear-gradient(90deg in srgb, var(--c-E3ECDA) 0%, var(--c-F4F6F0) 60%)';
            dot.className = 'w-[7px] h-[7px] rounded-full flex-shrink-0 bg-[var(--c-7FB35C)]';
            label.className = 'text-[11px] font-bold tracking-[1.5px] uppercase text-[var(--c-6A6A62)]';
            content.classList.remove('hidden');
        } else {
            item.style.background = '';
            dot.className = 'w-[7px] h-[7px] rounded-full flex-shrink-0 bg-[var(--c-C4C4BC)]';
            label.className = 'text-[11px] font-bold tracking-[1.5px] uppercase text-[var(--c-9A9A92)]';
            content.classList.add('hidden');
        }
    }
}

switchAccordion(0);