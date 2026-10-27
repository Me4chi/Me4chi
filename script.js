document.documentElement.classList.add('js');

const storage = {
  get: key => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } },
};

// ── Language: English markup, Russian from data-ru ─────────
(() => {
  const toggle = document.getElementById('lang');
  const nodes = [...document.querySelectorAll('[data-ru]')];
  nodes.forEach(el => (el.dataset.en = el.innerHTML));
  const titles = { en: 'Me4chi — Game, Desktop & Web Developer', ru: 'Me4chi — разработчик игр, приложений и сайтов' };
  const apply = lang => {
    document.documentElement.lang = lang;
    nodes.forEach(el => (el.innerHTML = el.dataset[lang]));
    toggle.textContent = lang === 'en' ? 'RU' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Переключить на русский' : 'Switch to English');
    document.title = titles[lang];
    storage.set('portfolio-language', lang);
  };
  const saved = storage.get('portfolio-language');
  apply(saved || (navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'));
  toggle.addEventListener('click', () => apply(document.documentElement.lang === 'en' ? 'ru' : 'en'));
})();

const ru = () => document.documentElement.lang === 'ru';
const toast = text => {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2000);
};

// ── World of the day: fall back to a bundled world if the daily branch is unreachable ──
document.getElementById('daily').addEventListener('error', e => {
  e.target.src = 'assets/projects/pixel-world.gif';
  e.target.style.aspectRatio = '16 / 9';
}, { once: true });

// ── Copy email ─────────────────────────────────────────────
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      toast(ru() ? 'Почта скопирована' : 'Email copied');
    } catch {
      toast(button.dataset.copy);
    }
  });
});

// ── Reveal sections as they scroll in ──────────────────────
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();

// ── Easter egg: firefly hunt ───────────────────────────────
(() => {
  const dialog = document.getElementById('game');
  const firefly = document.getElementById('firefly');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const start = document.getElementById('start');
  let score = 0;
  let time = 15;
  let clock = 0;
  let wander = 0;
  const move = () => {
    firefly.style.left = `${8 + Math.random() * 84}%`;
    firefly.style.top = `${12 + Math.random() * 76}%`;
  };
  const stop = () => {
    clearInterval(clock);
    clearInterval(wander);
  };
  const finish = () => {
    stop();
    firefly.hidden = true;
    const rank = score >= 18 ? (ru() ? 'Хранитель леса' : 'Forest keeper') : score >= 9 ? (ru() ? 'Ночной разведчик' : 'Night scout') : ru() ? 'Ученик' : 'Apprentice';
    toast(`${ru() ? 'Поймано' : 'Caught'}: ${score} · ${rank}`);
    start.textContent = ru() ? 'Ещё раз' : 'Play again';
  };
  start.addEventListener('click', () => {
    stop();
    score = 0;
    time = 15;
    scoreEl.textContent = '0';
    timeEl.textContent = '15';
    firefly.hidden = false;
    move();
    firefly.focus();
    wander = setInterval(move, 900);
    clock = setInterval(() => {
      time -= 1;
      timeEl.textContent = String(time);
      if (time <= 0) finish();
    }, 1000);
  });
  firefly.addEventListener('click', () => {
    score += 1;
    scoreEl.textContent = String(score);
    move();
  });
  document.getElementById('egg').addEventListener('click', () => dialog.showModal());
  document.getElementById('close-game').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    stop();
    firefly.hidden = true;
  });
})();
