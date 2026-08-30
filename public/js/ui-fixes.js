(() => {
  const formatNumber = (value) => {
    const n = Number(String(value).replace(/\s/g, '').replace(/,/g, ''));
    return Number.isFinite(n) ? new Intl.NumberFormat('uz-UZ').format(n).replace(/\u00a0/g, ' ') : value;
  };

  const formatSalary = (el) => {
    const text = el.textContent.trim();
    const currencyMatch = text.match(/\b(?:UZS|USD|EUR|RUB)\b$/i);
    const currency = currencyMatch ? currencyMatch[0].toUpperCase() : '';
    const body = currency ? text.slice(0, -currency.length).trim() : text;
    const nums = body.match(/\d[\d\s,.-]*/g) || [];
    const clean = nums.map(x => x.replace(/[^0-9]/g, '')).filter(Boolean);
    if (!clean.length) return;
    el.textContent = clean.map(formatNumber).join(' – ') + (currency ? ` ${currency}` : '');
    el.classList.add('salary-pill');
    el.style.whiteSpace = 'nowrap';
    el.style.wordSpacing = '0.08em';
  };

  const fix = () => {
    // Restore the main listings panel title that should be visible on Home.
    document.querySelectorAll('.section-head h2').forEach(el => {
      if (/Eng so['’]?nggi imkoniyatlar/i.test(el.textContent)) el.textContent = 'E’lonlar';
    });

    document.querySelectorAll('.salary-pill').forEach(formatSalary);
    document.querySelectorAll('.job-meta .pill').forEach(el => {
      if (el.classList.contains('salary-pill')) return;
      if (/\b(?:UZS|USD|EUR|RUB)\b$/i.test(el.textContent.trim())) formatSalary(el);
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

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fix(); });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('hashchange', () => setTimeout(fix, 0));
  window.addEventListener('load', fix);
  fix();
})();
