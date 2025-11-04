// ===== i18n: traduções EN/PT =====
const translations = {
  en: {
    menuTitle: "Menu",
    menuSetunSimulator: "Setun Simulator",
    menuTernaryClock: "Synchronous ternary clock",
    menuHeiSanban: "HeiSanban",
    menuBalancedTextEncoder: "Balanced ternary text encoder",
    menuRadixConverter: "Base converter (balanced ternary)",
  },
  pt: {
    menuTitle: "Menu",
    menuSetunSimulator: "Simulador Setun",
    menuTernaryClock: "Relógio ternário síncrono",
    menuHeiSanban: "HeiSanban",
    menuBalancedTextEncoder: "Codificador de texto ternário balanceado",
    menuRadixConverter: "Conversor de base (ternário balanceado)",
  },
};

// Normaliza ?lang=en-us|pt-br|en|pt → 'en' | 'pt'
function normalizeLang(raw) {
  if (!raw) return null;
  const val = String(raw).toLowerCase();
  if (val.startsWith('en')) return 'en';
  if (val.startsWith('pt')) return 'pt';
  return null;
}

function getLangFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('lang');
  const urlLang = normalizeLang(q);
  if (urlLang) return urlLang;
  // fallback navegador
  return normalizeLang(navigator.language || navigator.userLanguage) || 'en';
}

function updateLangInUrl(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  // Atualiza sem recarregar
  window.history.replaceState({}, '', url);
}

function setDocumentLang(lang) {
  const html = document.documentElement;
  html.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
}

function applyTranslations(lang) {
  const t = translations[lang] || translations.en;
  // Links e outros elementos com data-lang-key
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (t[key]) el.textContent = t[key];
  });
  // Title do botão de menu
  const toggle = document.getElementById('app-menu-toggle');
  if (toggle) toggle.title = t.menuTitle;
}

// Atualiza ?lang= dos destinos que aceitam (somente onde já há ?lang ou data-accepts-lang="true")
function updateMenuLinksLang(lang) {
  const items = document.querySelectorAll('#app-menu a.menu-item');
  items.forEach(a => {
    const accepts = a.hasAttribute('data-accepts-lang') || a.href.includes('?lang=');
    if (!accepts) return;
    try {
      const url = new URL(a.href);
      url.searchParams.set('lang', lang === 'pt' ? 'pt-br' : 'en-us');
      a.href = url.toString();
    } catch (_) { /* ignora */ }
  });
}

function setLanguage(lang) {
  const safeLang = (lang === 'pt' || lang === 'en') ? lang : 'en';
  setDocumentLang(safeLang);
  applyTranslations(safeLang);
  updateLangInUrl(safeLang);
  updateMenuLinksLang(safeLang);
  // Informe a página principal (app.js) para também traduzir todo o conteúdo
  if (typeof window.setPageLanguage === 'function') {
    try { window.setPageLanguage(safeLang, { suppressUrl: true }); } catch (_) { /* ignore */ }
  }
  // Atualiza UI do seletor
  const select = document.getElementById('lang-select');
  if (select && select.value !== safeLang) select.value = safeLang;
}

// ===== Menu: abrir/fechar/toggle, clique fora, ESC, focus-trap =====
const menuState = { open: false };

function openMenu() {
  const btn = document.getElementById('app-menu-toggle');
  const menu = document.getElementById('app-menu');
  if (!btn || !menu) return;
  if (menuState.open) return;
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  menuState.open = true;
  // Foca o primeiro item
  const firstItem = menu.querySelector('a[role="menuitem"]');
  if (firstItem) firstItem.focus();
}

function closeMenu({ returnFocusToButton = true } = {}) {
  const btn = document.getElementById('app-menu-toggle');
  const menu = document.getElementById('app-menu');
  if (!btn || !menu) return;
  if (!menuState.open) return;
  menu.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
  menuState.open = false;
  if (returnFocusToButton) btn.focus();
}

function toggleMenu() {
  if (menuState.open) closeMenu(); else openMenu();
}

function handleOutsidePointerDown(ev) {
  if (!menuState.open) return;
  const btn = document.getElementById('app-menu-toggle');
  const menu = document.getElementById('app-menu');
  const target = ev.target;
  if (btn.contains(target) || menu.contains(target)) return;
  closeMenu({ returnFocusToButton: false });
}

function handleKeydown(ev) {
  if (!menuState.open) return;
  const menu = document.getElementById('app-menu');
  if (!menu) return;
  const KEY_TAB = 9, KEY_ESC = 27;

  if (ev.key === 'Escape' || ev.keyCode === KEY_ESC) {
    ev.preventDefault();
    closeMenu({ returnFocusToButton: true });
    return;
  }

  if (ev.key === 'Tab' || ev.keyCode === KEY_TAB) {
    const focusable = [...menu.querySelectorAll('a[role="menuitem"]')];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (ev.shiftKey) {
      if (active === first) {
        ev.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  }
}

// ===== Inicialização =====
function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;
  if (theme === 'light') {
    // Show moon icon (indicates you can switch to dark)
    themeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"></path>
      </svg>`;
    themeBtn.setAttribute('aria-label', 'Switch to dark theme');
    themeBtn.setAttribute('title', 'Switch to dark theme');
  } else {
    // Show sun icon (indicates you can switch to light)
    themeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
    themeBtn.setAttribute('aria-label', 'Switch to light theme');
    themeBtn.setAttribute('title', 'Switch to light theme');
  }
}

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('dark', 'light');
  // Also swap Tailwind base classes applied on <body>
  // Dark defaults (from HTML): bg-gray-900 text-gray-100
  // Light overrides: bg-gray-50 text-gray-900
  if (theme === 'light') {
    body.classList.add('light');
    body.classList.remove('bg-gray-900', 'text-gray-100');
    body.classList.add('bg-gray-50', 'text-gray-900');
  } else {
    body.classList.add('dark');
    body.classList.remove('bg-gray-50', 'text-gray-900');
    body.classList.add('bg-gray-900', 'text-gray-100');
  }
  updateThemeIcon(theme);
}

function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

function getSavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  // Default is dark per requirement
  return 'dark';
}

document.addEventListener('DOMContentLoaded', () => {
  // Tema inicial (persistente, padrão: dark)
  setTheme(getSavedTheme());

  // Idioma inicial
  const initial = getLangFromUrl();
  setLanguage(initial);

  // Seletor de idioma
  const select = document.getElementById('lang-select');
  if (select) {
    select.value = initial;
    select.addEventListener('change', () => setLanguage(select.value));
  }

  // Toggle de menu
  const btn = document.getElementById('app-menu-toggle');
  if (btn) btn.addEventListener('click', toggleMenu);

  // Clique fora
  document.addEventListener('pointerdown', handleOutsidePointerDown);

  // Teclado: ESC + focus-trap
  document.addEventListener('keydown', handleKeydown);

  // Theme toggle: alterna light/dark com persistência
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    // ensure correct icon after initial applyTheme
    updateThemeIcon(getSavedTheme());
    themeBtn.addEventListener('click', () => {
      const current = getSavedTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
});