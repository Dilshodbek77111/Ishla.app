(() => {
  const formatNumber = (value) => {
    const n = Number(String(value).replace(/\s/g, ''));
    return Number.isFinite(n) ? new Intl.NumberFormat('uz-UZ').format(n) : value;
  };

  const fix = () => {
    document.querySelectorAll('.salary-pill').forEach(el => {
      const text = el.textContent.trim();
      const currency = (text.match(/\b[A-Z]{3}\b$/) || [''])[0];
      const body = currency ? text.slice(0, -currency.length).trim() : text;
      const nums = body.match(/\d[\d\s]*/g) || [];
      if (nums.length) {
        const formatted = nums.map(formatNumber);
        el.textContent = formatted.join(' – ') + (currency ? ` ${currency}` : '');
      }
    });

    document.querySelectorAll('.job-meta .pill').forEach(el => {
      if (el.classList.contains('salary-pill')) return;
      const text = el.textContent.trim();
      if (!/\b(?:UZS|USD|EUR|RUB)\b$/.test(text)) return;
      const currency = text.match(/\b(?:UZS|USD|EUR|RUB)\b$/)[0];
      const body = text.slice(0, -currency.length).trim();
      const nums = body.match(/\d[\d\s]*/g) || [];
      if (nums.length) el.textContent = nums.map(formatNumber).join(' – ') + ` ${currency}`;
    });

    document.querySelectorAll('.brand').forEach(brand => {
      const i = brand.querySelector('i');
      if (!i) return;
      i.style.marginLeft = '0';
      i.style.paddingLeft = '0';
      brand.style.gap = '0';
      const mark = brand.querySelector('.brand-mark');
      const name = brand.querySelector('span:not(.brand-mark)');
      if (mark) mark.style.marginRight = '9px';
      if (name) name.style.marginRight = '0';
    });
  };

  const observer = new MutationObserver(fix);
  observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  window.addEventListener('load', fix);
  fix();
})();