/** Client-side filtering only; no GitHub requests, credentials, analytics or repository discovery. */
export function normalizeSearch(value) {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLocaleLowerCase('ar').trim();
}

if (typeof document !== 'undefined') {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  function closeMenu(restore = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'فتح القائمة');
    if (restore) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => {
    if (!menu?.hidden && !menu?.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const input = document.querySelector('#search');
  const grid = document.querySelector('#project-grid');
  const cards = Array.from(document.querySelectorAll('[data-project]'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const clear = document.querySelector('#clear-search');
  const sort = document.querySelector('#sort');
  const reset = document.querySelector('#reset-filters');
  let category = 'all';
  const collator = new Intl.Collator('ar', { numeric: true });

  function update() {
    if (!input || !grid || !empty) return;
    const query = normalizeSearch(input.value);
    let visible = 0;
    const ordered = [...cards].sort((a,b) => sort?.value === 'name'
      ? collator.compare(a.dataset.title, b.dataset.title)
      : b.dataset.added.localeCompare(a.dataset.added));
    ordered.forEach(card => {
      card.hidden = !((category === 'all' || card.dataset.category === category) && normalizeSearch(card.dataset.search).includes(query));
      if (!card.hidden) visible++;
      grid.append(card);
    });
    clear.hidden = !input.value;
    input.parentElement.querySelector('kbd').hidden = Boolean(input.value);
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const filtered = Boolean(query || category !== 'all');
    count.textContent = cards.length ? `${visible} من ${cards.length} مشروع` : (query ? 'لا توجد نتائج للبحث' : 'لا توجد مشاريع منشورة بعد');
    empty.hidden = visible !== 0;
    document.querySelector('#empty-title').textContent = filtered ? 'ما لقينا تجربة بهذا البحث.' : 'المكتبة تنتظر أول تجربة.';
    document.querySelector('#empty-message').textContent = filtered ? (cards.length ? 'جرّب اسمًا آخر، أو امسح التصفية لعرض جميع المشاريع.' : 'لا تحتوي المكتبة على مشاريع بعد. يمكنك مسح البحث والعودة إلى المعاينة.') : 'لم تُضف أي مشاريع بعد. ستظهر هنا التجارب التي يتم اعتماد إضافتها.';
    document.querySelector('#empty-about').hidden = filtered;
    reset.hidden = !filtered;
  }
  input?.addEventListener('input', update);
  sort?.addEventListener('change', update);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; update(); }));
  clear?.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  reset?.addEventListener('click', () => { input.value = ''; category = 'all'; if(sort) sort.value='added'; update(); input.focus(); });
  document.querySelectorAll('[data-search-link]').forEach(link => link.addEventListener('click', event => {
    if (!input) return;
    event.preventDefault();
    document.querySelector('#library').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    input.focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (menu && !menu.hidden) return closeMenu(true);
      if (document.activeElement === input && input.value) { input.value = ''; update(); }
    }
    const target = event.target;
    if (event.key === '/' && input && !event.ctrlKey && !event.metaKey && !event.altKey && !target.closest('input,textarea,select,[contenteditable]')) {
      event.preventDefault(); input.focus();
    }
  });
  if (input && location.hash === '#search') input.focus();
  update();
}
