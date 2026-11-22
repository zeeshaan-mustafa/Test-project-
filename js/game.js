// ===== Kingdom of Keys — main game =====
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- Save data ----------
  const SAVE_KEY = 'kingdom-of-keys-v1';
  const DEFAULT_SAVE = () => ({
    name: 'Zayaan', tunic: 'green', sword: 'wood', owned: ['green', 'wood'],
    gems: 0, lessons: {}, unlocked: 0, keyStats: {}, history: [], trials: [], trialBest: 0,
    cps: 0.45, // characters per second (adapts as he gets faster)
    timePlayed: 0,
    settings: { difficulty: 'normal', hints: 'auto', sound: true, voice: true, unlockAll: false },
  });
  let save = load();
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw), d = DEFAULT_SAVE();
        return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings || {}) });
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_SAVE();
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }
  function applySettings() { Sound.setEnabled(save.settings.sound); Voice.setEnabled(save.settings.voice); }
  applySettings();

  const tunic = () => TUNICS.find(t => t.id === save.tunic) || TUNICS[0];
  const sword = () => SWORDS.find(s => s.id === save.sword) || SWORDS[0];
  const isUnlocked = (i) => save.settings.unlockAll || i <= save.unlocked;
  const totalStars = () => Object.values(save.lessons).reduce((a, l) => a + (l.stars || 0), 0);

  // ---------- Screens ----------
  let currentScreen = 'title';
  function show(name) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $('#screen-' + name).classList.add('active');
    currentScreen = name;
    if (name !== 'play') stopLoop();
  }

  // ---------- Title ----------
  $('#hero-name').value = save.name;
  $('#btn-start').onclick = () => {
    Sound.unlock(); Sound.start();
    save.name = ($('#hero-name').value.trim() || 'Hero').slice(0, 14);
    persist();
    openMap();
    if (save.unlocked === 0 && !save.lessons[0]) {
      Voice.say(`Hello ${save.name}! I am Pip the fairy. The Gloom King stole the letters of the kingdom. Let's win them back by typing!`);
    }
  };
  $('#hero-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-start').click(); });

  // ---------- Map ----------
  let selRegion = null;
  function openMap() {
    show('map');
    $('#map-name').textContent = save.name;
    $('#map-gems').textContent = save.gems;
    $('#map-stars').textContent = totalStars();
    $('#map-best').textContent = save.trialBest;
    const nextLesson = Math.min(save.unlocked, LESSONS.length - 1);
    if (selRegion === null) selRegion = LESSONS[nextLesson].region;
    renderRegions();
    renderLessons();
  }
  function regionStars(r) {
    const ls = LESSONS.filter(l => l.region === r);
    const got = ls.reduce((a, l) => a + ((save.lessons[l.id] || {}).stars || 0), 0);
    return `${got}/${ls.length * 3} ⭐`;
  }
  function regionUnlocked(r) {
    const first = LESSONS.find(l => l.region === r);
    return isUnlocked(first.id);
  }
  function renderRegions() {
    const el = $('#region-list');
    el.innerHTML = '';
    REGIONS.forEach(r => {
      const d = document.createElement('div');
      const open = regionUnlocked(r.id);
      d.className = 'region' + (open ? '' : ' locked') + (selRegion === r.id ? ' sel' : '');
      d.style.background = `linear-gradient(135deg, ${r.sky[0]}, ${r.groundDark})`;
      d.innerHTML = `<span class="ico">${open ? r.icon : '🔒'}</span>
        <span><div class="nm">${r.name}</div><div class="sb">${r.sub}</div></span>
        <span class="rs">${open ? regionStars(r.id) : ''}</span>`;
      d.onclick = () => { if (!open) return; Sound.click(); selRegion = r.id; renderRegions(); renderLessons(); };
      el.appendChild(d);
    });
  }
  function renderLessons() {
    const r = REGIONS[selRegion];
    $('#region-title').textContent = `${r.icon} ${r.name}`;
    $('#region-sub').textContent = r.sub;
    const el = $('#lesson-list');
    el.innerHTML = '';
    LESSONS.filter(l => l.region === selRegion).forEach(l => {
      const b = document.createElement('button');
      const res = save.lessons[l.id] || {};
      const open = isUnlocked(l.id);
      b.className = 'lesson' + (l.boss ? ' boss' : '') + (l.id === save.unlocked && open ? ' next' : '');
      b.disabled = !open;
      const stars = [0, 1, 2].map(i => (i < (res.stars || 0) ? '⭐' : '☆')).join('');
      const keysTxt = l.newKeys.trim() ? 'NEW: ' + l.newKeys.split('').map(k => keyName(k)).join(' ') : (l.boss ? 'BOSS BATTLE' : l.kind.toUpperCase());
      b.innerHTML = `<span class="lt">${open ? '' : '🔒 '}${l.boss ? '👑 ' : ''}${l.title}</span>
        <span class="lk">${keysTxt}</span>
        <span class="ls">${stars}</span>
        <span class="lb">${res.bestWpm ? `Best: ${res.bestWpm} WPM · ${res.bestAcc}%` : `Goal: ${l.wpm} WPM`}</span>`;
      b.onclick = () => { Sound.click(); startLesson(l.id); };
      el.appendChild(b);
    });
  }
  $('#btn-shop').onclick = () => { Sound.click(); openShop(); };
  $('#btn-parent').onclick = () => { Sound.click(); openParent(); };
  $('#btn-trial').onclick = () => { Sound.click(); startTrial(); };

  // ---------- On-screen keyboard & hands ----------
  const keyEls = {};
  (function buildKeyboard() {
    const kb = $('#keyboard');
    KEY_ROWS.forEach((row, ri) => {
      const r = document.createElement('div');
      r.className = 'krow r' + (ri + 1);
      row.forEach(k => {
        const d = document.createElement('div');
        d.className = 'key' + (k === 'f' || k === 'j' ? ' bump' : '');
        d.textContent = k.toUpperCase();
        d.style.background = FINGERS[KEY_FINGER[k]].color;
        r.appendChild(d);
        keyEls[k] = d;
      });
      kb.appendChild(r);
    });
    const r = document.createElement('div');
    r.className = 'krow';
    const sp = document.createElement('div');
    sp.className = 'key space';
    sp.textContent = 'SPACE';
    sp.style.background = FINGERS.th.color;
    r.appendChild(sp);
    keyEls[' '] = sp;
    kb.appendChild(r);
  })();

  // Hands: fingers as rounded rectangles. Coordinates in a 420x170 viewBox.
  const HAND_LAYOUT = {
    lp: [20, 62, 26, 58], lr: [52, 34, 28, 86], lm: [86, 22, 28, 98], li: [120, 36, 28, 84], th: [136, 112, 46, 24],
    ri: [272, 36, 28, 84], rm: [306, 22, 28, 98], rr: [340, 34, 28, 86], rp: [374, 62, 26, 58], th2: [238, 112, 46, 24],
  };
  (function buildHands() {
    const svg = $('#hands');
    let html = '';
    // palms
    html += `<rect x="18" y="96" width="134" height="70" rx="26" fill="#ffd2a6" stroke="#2b2118" stroke-width="3"/>`;
    html += `<rect x="268" y="96" width="134" height="70" rx="26" fill="#ffd2a6" stroke="#2b2118" stroke-width="3"/>`;
    for (const [f, [x, y, w, h]] of Object.entries(HAND_LAYOUT)) {
      const fk = f === 'th2' ? 'th' : f;
      const rot = f === 'th' ? `rotate(-25 ${x + w / 2} ${y + h / 2})` : f === 'th2' ? `rotate(25 ${x + w / 2} ${y + h / 2})` : '';
      html += `<rect class="finger" data-f="${fk}" x="${x}" y="${y}" width="${w}" height="${h}" rx="13"
        transform="${rot}" fill="${FINGERS[fk].color}" fill-opacity="0.35" stroke="#2b2118" stroke-width="3"/>`;
    }
    html += `<text x="85" y="150" text-anchor="middle" font-size="18" font-family="Fredoka" font-weight="700" fill="#7a4a1e">LEFT</text>`;
    html += `<text x="335" y="150" text-anchor="middle" font-size="18" font-family="Fredoka" font-weight="700" fill="#7a4a1e">RIGHT</text>`;
    svg.innerHTML = html;
  })();

  function setKeyboardLearned(keys) {
    for (const k in keyEls) keyEls[k].classList.toggle('learned', keys.includes(k));
  }
  let hintedKey = null;
  function setHint(k) {
    if (hintedKey === k) return;
    hintedKey = k;
    for (const kk in keyEls) keyEls[kk].classList.toggle('next', kk === k);
    const f = k != null ? KEY_FINGER[k] : null;
    $$('#hands .finger').forEach(el => {
      const on = el.dataset.f === f;
      el.setAttribute('fill-opacity', on ? '1' : '0.3');
      el.setAttribute('stroke-width', on ? '5' : '3');
    });
    $('#finger-label').innerHTML = f ? `Use your <b>${FINGERS[f].name}</b>` : '&nbsp;';
  }
  function flashKey(k, cls) {
    const el = keyEls[k];
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), cls === 'wrong' ? 250 : 120);
  }

  // ---------- Pip the fairy speech bubble ----------
  let pipTimer = null;
  function pip(text, ms = 3200, speak = false) {
    $('#pip-text').textContent = text;
    $('#pip').classList.remove('hidden');
    clearTimeout(pipTimer);
    if (ms) pipTimer = setTimeout(() => $('#pip').classList.add('hidden'), ms);
    if (speak) Voice.say(text);
  }
  function hidePip() { clearTimeout(pipTimer); $('#pip').classList.add('hidden'); }

  // ---------- Content generation ----------
  function weakWeight(ch) {
    const s = save.keyStats[ch];
    if (!s) return 1;
    const missRate = s.miss / Math.max(1, s.hit + s.miss);
    return 1 + missRate * 6;
  }
  function weightedPick(chars) {
    const ws = chars.map(weakWeight);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < chars.length; i++) { r -= ws[i]; if (r <= 0) return chars[i]; }
    return chars[chars.length - 1];
  }
  function wordsFor(keys) {
    return WORDS.filter(w => [...w].every(c => keys.includes(c)));
  }
  function wordScore(w) { return [...w].reduce((a, c) => a + weakWeight(c), 0) / w.length; }
  function pickWords(pool, n, maxLen) {
    const p = pool.filter(w => w.length <= maxLen);
    const out = [];
    let last = '';
    for (let i = 0; i < n; i++) {
      // Prefer words that use tricky keys
      const a = rand(p), b = rand(p), c = rand(p);
      let w = [a, b, c].sort((x, y) => wordScore(y) - wordScore(x))[0];
      if (w === last) w = rand(p);
      out.push(w); last = w;
    }
    return out;
  }

  function buildItems(lesson) {
    const keys = lesson.keys.replace(' ', '');
    const newKeys = lesson.newKeys.replace(' ', '');
    const items = [];
    const n = lesson.count;
    if (lesson.kind === 'letters') {
      const nk = [...newKeys], all = [...keys];
      const words = wordsFor(lesson.keys).filter(w => w.length >= 2 && w.length <= 5 && [...newKeys].some(c => w.includes(c)));
      for (let i = 0; i < n; i++) {
        const phase = i / n;
        if (phase < 0.35) {
          items.push(nk[i % nk.length]);                       // single new keys
        } else if (phase < 0.7) {
          const len = 2 + (Math.random() < 0.4 ? 1 : 0);        // small combos
          let s = '';
          for (let j = 0; j < len; j++) s += Math.random() < 0.6 ? rand(nk) : weightedPick(all);
          items.push(s);
        } else if (words.length >= 3 && Math.random() < 0.7) {
          items.push(rand(words));                              // real words
        } else {
          let s = '';
          for (let j = 0; j < 3; j++) s += Math.random() < 0.5 ? rand(nk) : weightedPick(all);
          items.push(s);
        }
      }
    } else if (lesson.kind === 'words') {
      const pool = wordsFor(lesson.keys);
      const maxLen = lesson.region < 2 ? 5 : lesson.region < 4 ? 6 : 8;
      const ws = pickWords(pool, n, maxLen);
      // Once space is learned, some items are two short words.
      for (let i = 0; i < n; i++) {
        if (lesson.keys.includes(' ') && i % 4 === 3 && ws[i].length <= 4) {
          const short = pool.filter(w => w.length <= 3);
          items.push(ws[i] + ' ' + rand(short));
        } else items.push(ws[i]);
      }
    } else if (lesson.kind === 'phrases') {
      const pool = WORDS.filter(w => w.length <= 6);
      for (let i = 0; i < n; i++) {
        const k = Math.random() < 0.6 ? 2 : 3;
        items.push(pickWords(pool, k, 6).join(' '));
      }
    } else if (lesson.kind === 'sentences') {
      const s = [...SENTENCES].sort(() => Math.random() - 0.5);
      for (let i = 0; i < n; i++) items.push(s[i % s.length]);
    }
    return items;
  }

  function trialItems(keys) {
    const pool = wordsFor(keys);
    if (pool.length < 5) {
      const ks = keys.replace(' ', '');
      return Array.from({ length: 80 }, () => Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => weightedPick([...ks])).join(''));
    }
    return pickWords(pool, 80, 7);
  }

  // ---------- Battle state ----------
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, GROUND = 262, HERO_X = 150;
  let B = null;       // current battle
  let raf = 0, lastT = 0;

  function hintMode(lesson) {
    const m = save.settings.hints;
    if (m !== 'auto') return m;
    if (!lesson) return 'delayed';
    // New keys: always show. Reviews in later regions: only after a pause.
    if (lesson.kind === 'letters' || lesson.region === 0) return 'always';
    return 'delayed';
  }

  function startLesson(id) {
    const lesson = LESSONS[id];
    const region = REGIONS[lesson.region];
    newBattle({
      lesson, region, items: buildItems(lesson), boss: lesson.boss ? region.boss : null,
      title: lesson.title, trial: false,
    });
    showIntro();
  }

  function startTrial() {
    const keys = LESSONS[Math.min(save.unlocked, LESSONS.length - 1)].keys;
    const ks = keys.length < 2 ? 'fj' : keys;
    const region = REGIONS[LESSONS[Math.min(save.unlocked, LESSONS.length - 1)].region];
    newBattle({
      lesson: null, region, items: trialItems(ks), boss: null, title: '⚡ Speed Trial — 60 seconds', trial: true, keys: ks,
    });
    showIntro();
  }

  function newBattle(cfg) {
    const lesson = cfg.lesson;
    const diff = save.settings.difficulty;
    // Monsters wait (no damage) while learning brand-new keys, in Gentle mode, and in Speed Trials.
    const waitMode = diff === 'gentle' || cfg.trial || (lesson && lesson.kind === 'letters');
    B = Object.assign(cfg, {
      t: 0, state: 'intro', enemies: [], idx: 0, done: 0,
      hearts: 6, maxHearts: 6, gems: 0, combo: 0, bestCombo: 0,
      correct: 0, errors: 0, keyTimes: 0, lastKeyAt: null,
      swing: 0, hurt: 0, scroll: 0, particles: [], floats: [],
      waitMode, revived: false, bossHp: cfg.items.length, bossHurt: 0,
      charStartAt: 0, errKeys: {}, timeLeft: cfg.trial ? 60 : 0, spawnCd: 0,
      maxOnScreen: lesson && (lesson.kind === 'letters' || lesson.boss) ? 1 : (cfg.trial ? 2 : 2),
    });
    show('play');
    $('#play-title').textContent = (cfg.boss ? '👑 ' : '') + cfg.title;
    setKeyboardLearned(lesson ? lesson.keys : cfg.keys);
    setHint(null);
    $('#target').innerHTML = '&nbsp;';
    updateLive();
    hidePip();
    startLoop();
  }

  function showIntro() {
    const L = B.lesson;
    const o = $('#overlay');
    o.classList.remove('hidden');
    let html = '';
    if (B.trial) {
      html += `<h2>Speed Trial</h2><p>Type as many words as you can in 60 seconds!</p>
        <p>Your best: <b>${save.trialBest} WPM</b></p>`;
      Voice.say('Speed trial! Type as many words as you can in sixty seconds.');
    } else {
      html += `<h2>${B.boss ? 'BOSS BATTLE' : B.region.name}</h2><p>${L.story}</p>`;
      const nk = L.newKeys.split('');
      if (nk.length) {
        html += `<div class="keys-big">` + nk.map(k =>
          `<span class="kcap" style="background:${FINGERS[KEY_FINGER[k]].color}">${k === ' ' ? 'SPACE' : k.toUpperCase()}</span>`).join('') + `</div>`;
        html += `<p>` + nk.map(k => `${keyName(k)} = ${FINGERS[KEY_FINGER[k]].name}`).join(' · ') + `</p>`;
        setHint(nk[0]);
      }
      Voice.say(L.story + (nk.length ? ' ' + nk.map(k => `${keyName(k)} uses your ${FINGERS[KEY_FINGER[k]].name}.`).join(' ') : ''));
    }
    html += `<p>👀 Eyes on the screen. Fingers on the home row: <b>A S D F</b> &nbsp; <b>J K L ;</b></p>`;
    html += `<div class="press">Press SPACE with your thumb to start</div>`;
    o.innerHTML = html;
    B.state = 'intro';
  }

  function beginCountdown() {
    B.state = 'count';
    B.count = 3;
    Voice.say('Ready?');
    const o = $('#overlay');
    const tick = () => {
      if (!B || B.state !== 'count') return;
      if (B.count === 0) {
        o.classList.add('hidden');
        B.state = 'play';
        B.lastKeyAt = null;
        Sound.start();
        if (B.boss) { Sound.bossRoar(); pip(`${B.boss.name} appears!`, 2500); }
        return;
      }
      o.innerHTML = `<div class="count">${B.count}</div><p>Fingers on the bumps!</p>`;
      Sound.key(B.count);
      B.count--;
      setTimeout(tick, 650);
    };
    tick();
  }

  // ---------- Enemies ----------
  function travelTime(text) {
    // Seconds an enemy takes to reach the hero, based on his recent speed.
    const mult = { gentle: 0.55, normal: 0.8, hard: 1.1 }[save.settings.difficulty] || 0.8;
    const cps = clamp(save.cps, 0.3, 8) * mult;
    return clamp(text.length / cps + 2.2, 3, 30);
  }

  function spawnEnemy() {
    if (B.idx >= B.items.length) return;
    const text = B.items[B.idx++];
    const [kind, color] = rand(B.region.enemies);
    const startX = B.boss ? W - 210 : W + 40;
    const stopX = HERO_X + 70;
    const tt = travelTime(text);
    B.enemies.push({
      text, typed: 0, kind, color, x: startX, y: B.boss ? GROUND - 110 : GROUND,
      speed: (startX - stopX) / tt, stopX, dying: 0, bounce: 0, err: 0, born: B.t,
    });
  }

  function target() { return B.enemies.find(e => !e.dying); }

  // ---------- Input ----------
  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'play' || !B) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { quitToMap(); return; }
    let k = e.key;
    if (k.length !== 1) return;
    e.preventDefault();
    k = k.toLowerCase();

    if (B.state === 'intro') {
      if (k === ' ') { Sound.unlock(); beginCountdown(); }
      return;
    }
    if (B.state !== 'play') return;
    const tg = target();
    if (!tg) return;
    const expected = tg.text[tg.typed];
    const now = performance.now();
    if (B.lastKeyAt != null) B.keyTimes += Math.min(now - B.lastKeyAt, 3000);
    B.lastKeyAt = now;

    if (k === expected) {
      tg.typed++;
      B.correct++;
      B.charStartAt = B.t;
      stat(expected, true);
      flashKey(k, 'press');
      Sound.key(tg.typed);
      if (tg.typed >= tg.text.length) defeat(tg);
    } else {
      B.errors++;
      B.combo = 0;
      tg.err = 0.3;
      stat(expected, false);
      B.errKeys[expected] = (B.errKeys[expected] || 0) + 1;
      flashKey(k, 'wrong');
      Sound.wrong();
      setHint(expected);     // always show help after a mistake
      B.forceHint = true;
      if (B.errKeys[expected] === 3) pip(`Try your ${FINGERS[KEY_FINGER[expected]].name} for ${keyName(expected)}!`, 2600, true);
    }
    renderTarget();
    updateLive();
  });

  function stat(ch, ok) {
    const s = save.keyStats[ch] || (save.keyStats[ch] = { hit: 0, miss: 0 });
    if (ok) s.hit++; else s.miss++;
  }

  function defeat(e) {
    e.dying = 0.001;
    B.done++;
    B.combo++;
    B.bestCombo = Math.max(B.bestCombo, B.combo);
    B.swing = 0.001;
    B.forceHint = false;
    Sound.swing();
    setTimeout(() => Sound.hit(), 60);
    let g = 1;
    if (B.combo > 0 && B.combo % 5 === 0) {
      g += 2;
      B.floats.push({ x: HERO_X, y: GROUND - 110, text: `${B.combo} combo! +2`, t: 0, color: '#ffe14d' });
      Sound.gem();
    }
    B.gems += g;
    B.floats.push({ x: e.x, y: e.y - 70, text: '+' + g, t: 0, color: '#7dff9a', gem: true });
    for (let i = 0; i < 14; i++) {
      B.particles.push({ x: e.x, y: e.y - 24, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 260, life: 0.7, color: i % 2 ? e.color : '#fff' });
    }
    if (B.boss) { B.bossHp--; B.bossHurt = 0.5; e.reflect = true; }
    if (B.combo === 10) pip('Ten in a row! You are on fire!', 2000);
    else if (Math.random() < 0.12) pip(rand(PRAISE), 1500);
  }

  function heroHit(e) {
    if (B.hurt > 0) return;
    B.hearts -= 1;
    B.hurt = 1;
    B.combo = 0;
    Sound.hurt();
    e.x += 220;
    if (B.hearts <= 0) {
      B.revived = true;
      B.hearts = B.maxHearts;
      Sound.heal();
      pip("Don't give up! Pip heals you! Slow and steady.", 3200, true);
    } else if (B.hearts === 2) {
      pip('Careful! Keep your eyes on the screen.', 2400);
    }
  }

  // ---------- Loop ----------
  function startLoop() { stopLoop(); lastT = performance.now(); raf = requestAnimationFrame(frame); }
  function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    if (B) { update(dt); draw(); }
    raf = requestAnimationFrame(frame);
  }

  function update(dt) {
    B.t += dt;
    if (B.swing > 0) { B.swing += dt * 4; if (B.swing >= 1) B.swing = 0; }
    if (B.hurt > 0) B.hurt = Math.max(0, B.hurt - dt);
    if (B.bossHurt > 0) B.bossHurt = Math.max(0, B.bossHurt - dt);

    if (B.state === 'play') {
      if (B.trial) {
        B.timeLeft -= dt;
        if (B.timeLeft <= 0) { finish(); return; }
        if (B.idx >= B.items.length - 2) B.items.push(...trialItems(B.keys));
      }
      const alive = B.enemies.filter(e => !e.dying).length;
      B.spawnCd -= dt;
      if (alive < B.maxOnScreen && B.idx < B.items.length && (alive === 0 || B.spawnCd <= 0)) {
        spawnEnemy();
        B.spawnCd = 2.2;
      }
      B.scroll += dt * 40;
      for (const e of B.enemies) {
        if (e.dying) continue;
        if (e.err > 0) e.err -= dt;
        const isTarget = e === target();
        // queue behind the target
        const limit = isTarget ? e.stopX : e.stopX + 140;
        if (e.x > limit) e.x = Math.max(limit, e.x - e.speed * dt);
        else if (!B.waitMode && isTarget && e.x <= e.stopX + 1) {
          heroHit(e);
        }
      }
      // hints
      const tg = target();
      if (tg) {
        const ch = tg.text[tg.typed];
        const mode = hintMode(B.lesson);
        const waited = B.t - Math.max(B.charStartAt, tg.born);
        const showHint = B.forceHint || mode === 'always' || waited > 1.6;
        setHint(showHint ? ch : null);
      } else setHint(null);
      if (!B.trial && B.done >= B.items.length && B.enemies.every(e => e.dying)) {
        B.state = 'ending';
        setTimeout(finish, 700);
      }
      renderTarget();
    } else if (B.state === 'intro' || B.state === 'count') {
      B.scroll += dt * 25;
    }

    for (const e of B.enemies) if (e.dying) e.dying += dt;
    B.enemies = B.enemies.filter(e => !e.dying || e.dying < 0.6);
    for (const p of B.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt; }
    B.particles = B.particles.filter(p => p.life > 0);
    for (const f of B.floats) { f.t += dt; f.y -= 40 * dt; }
    B.floats = B.floats.filter(f => f.t < 1.2);
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    drawScenery(ctx, W, H, GROUND, B.region, B.scroll, B.t);

    if (B.boss) drawBoss(ctx, B.boss, W - 110, GROUND, B.t, B.bossHurt);

    // enemies (back to front)
    const tg = target();
    for (const e of [...B.enemies].reverse()) {
      ctx.save();
      if (e.dying) {
        ctx.globalAlpha = 1 - e.dying / 0.6;
      }
      if (B.boss) {
        let ex = e.x, ey = e.y;
        if (e.dying) { ex = e.x + e.dying * 900; ey = e.y - e.dying * 120; }
        drawOrb(ctx, ex, ey, B.boss.color === '#4b2c8a' ? '#b9a6ff' : shade(B.boss.color, 40), B.t);
      } else {
        const s = e.dying ? 1 + e.dying : 1;
        const shake = e.err > 0 ? Math.sin(B.t * 80) * 4 : 0;
        drawMonster(ctx, e.kind, e.color, e.x + shake, e.y, B.t + e.born, s, e === tg);
      }
      ctx.restore();
      if (!e.dying) drawLabel(e, e === tg);
    }

    // hero
    drawHero(ctx, HERO_X, GROUND, B.t, {
      tunic: tunic(), sword: sword(), swing: B.swing, hurt: B.hurt > 0, walking: B.state === 'intro' || B.state === 'count',
    });
    drawFairy(ctx, HERO_X - 50 + Math.sin(B.t * 2) * 14, GROUND - 120 + Math.cos(B.t * 3) * 10, B.t);

    for (const p of B.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 0.7);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 5, 5);
    }
    ctx.globalAlpha = 1;
    for (const f of B.floats) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
      ctx.font = 'bold 22px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#000';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      if (f.gem) drawGem(ctx, f.x + 24, f.y - 7, 0.9);
    }
    ctx.globalAlpha = 1;
    drawHud();
  }

  function drawLabel(e, isTarget) {
    ctx.font = `bold ${isTarget ? 28 : 22}px Fredoka, sans-serif`;
    const txt = e.text.replace(/ /g, '·');
    const w = ctx.measureText(txt).width + 20;
    const ly = B.boss ? e.y - 38 : e.y - (e.kind === 'bat' ? 100 : 80);
    const lx = clamp(e.x, w / 2 + 4, W - w / 2 - 4);
    ctx.fillStyle = isTarget ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)';
    roundRect(ctx, lx - w / 2, ly - 22, w, 36, 10); ctx.fill();
    ctx.strokeStyle = isTarget ? '#f2c230' : '#2b2118'; ctx.lineWidth = isTarget ? 4 : 2; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let x = lx - w / 2 + 10;
    for (let i = 0; i < txt.length; i++) {
      ctx.fillStyle = i < e.typed ? '#2fa84a' : (i === e.typed && isTarget ? '#d9822b' : '#2b2118');
      ctx.fillText(txt[i], x, ly - 3);
      x += ctx.measureText(txt[i]).width;
    }
    ctx.textBaseline = 'alphabetic';
  }

  function drawHud() {
    for (let i = 0; i < B.maxHearts / 2; i++) {
      const left = B.hearts - i * 2;
      drawHeart(ctx, 26 + i * 30, 26, 1.4, left >= 2 ? 2 : left === 1 ? 1 : 0);
    }
    drawGem(ctx, 26, 58, 1);
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.lineWidth = 4; ctx.strokeStyle = '#000';
    ctx.strokeText(String(save.gems + B.gems), 40, 66);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(save.gems + B.gems), 40, 66);

    // progress / timer
    const bx = W - 230, by = 14, bw = 210, bh = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, bx, by, bw, bh, 9); ctx.fill();
    let frac, label;
    if (B.trial) { frac = clamp(B.timeLeft / 60, 0, 1); label = `${Math.ceil(Math.max(0, B.timeLeft))}s`; }
    else if (B.boss) { frac = B.bossHp / B.items.length; label = 'BOSS'; }
    else { frac = B.done / B.items.length; label = `${B.done}/${B.items.length}`; }
    ctx.fillStyle = B.boss ? '#ff3b5c' : B.trial ? '#ffb02e' : '#3fe08a';
    if (frac > 0) { roundRect(ctx, bx + 2, by + 2, (bw - 4) * frac, bh - 4, 7); ctx.fill(); }
    ctx.font = 'bold 14px Fredoka, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText(label, bx + bw / 2, by + 14);

    if (B.combo >= 3) {
      ctx.font = 'bold 20px Fredoka, sans-serif'; ctx.textAlign = 'right';
      ctx.lineWidth = 4; ctx.strokeStyle = '#000';
      ctx.strokeText(`🔥 ${B.combo} in a row`, W - 20, 58);
      ctx.fillStyle = '#ffe14d'; ctx.fillText(`🔥 ${B.combo} in a row`, W - 20, 58);
    }
  }

  function renderTarget() {
    const tg = B && target();
    const el = $('#target');
    if (!tg) { if (B && B.state === 'play') el.innerHTML = '&nbsp;'; return; }
    const key = tg.text + '|' + tg.typed + '|' + (tg.err > 0);
    if (el.dataset.k === key) return;
    el.dataset.k = key;
    el.innerHTML = [...tg.text].map((c, i) => {
      const sp = c === ' ';
      const cls = (i < tg.typed ? 'done' : i === tg.typed ? 'cur' + (tg.err > 0 ? ' err' : '') : '') + (sp ? ' sp' : '');
      return `<span class="${cls}">${sp ? '&nbsp;' : c}</span>`;
    }).join('');
  }

  function liveWpm() {
    const mins = B.keyTimes / 60000;
    return mins > 0.02 ? Math.round((B.correct / 5) / mins) : 0;
  }
  function liveAcc() {
    const tot = B.correct + B.errors;
    return tot ? Math.round((B.correct / tot) * 100) : 100;
  }
  function updateLive() {
    if (!B) return;
    $('#live-acc').textContent = liveAcc() + '%';
    $('#live-wpm').textContent = liveWpm();
  }

  // ---------- Finish ----------
  let lastResult = null;
  function finish() {
    if (!B || B.state === 'done') return;
    B.state = 'done';
    setHint(null);
    const wpm = liveWpm(), acc = liveAcc();
    const secs = B.keyTimes / 1000;
    save.timePlayed += Math.round(secs);
    // Adapt speed: move toward measured chars/sec (only when accurate).
    const cps = secs > 3 ? B.correct / secs : save.cps;
    if (acc >= 75) save.cps = clamp(save.cps * 0.6 + cps * 0.4, 0.3, 8);

    const res = { wpm, acc, gems: B.gems, trial: B.trial, lesson: B.lesson, revived: B.revived, errKeys: B.errKeys };
    let stars = 0, passed = true;
    if (B.trial) {
      res.newBest = wpm > save.trialBest;
      if (res.newBest) save.trialBest = wpm;
      save.trials.push({ t: Date.now(), wpm, acc });
      if (save.trials.length > 100) save.trials.shift();
    } else {
      const L = B.lesson;
      stars = 1;
      if (acc >= 90) stars = 2;
      if (acc >= 95 && wpm >= L.wpm) stars = 3;
      if (B.revived) stars = 1;
      passed = acc >= 80;
      if (!passed) stars = 0;
      const prev = save.lessons[L.id] || { stars: 0, bestWpm: 0, bestAcc: 0, plays: 0 };
      save.lessons[L.id] = {
        stars: Math.max(prev.stars, stars),
        bestWpm: Math.max(prev.bestWpm, wpm),
        bestAcc: Math.max(prev.bestAcc, acc),
        plays: prev.plays + 1,
      };
      if (passed && L.id === save.unlocked && save.unlocked < LESSONS.length) save.unlocked = L.id + 1;
      B.gems += stars * 5;
      save.history.push({ t: Date.now(), id: L.id, wpm, acc });
      if (save.history.length > 300) save.history.shift();
    }
    res.stars = stars; res.passed = passed; res.gems = B.gems;
    save.gems += B.gems;
    persist();
    lastResult = res;
    setTimeout(() => showResults(res), 300);
  }

  function showResults(r) {
    show('results');
    const L = r.lesson;
    let title, msg;
    if (r.trial) {
      title = r.newBest ? 'New Record!' : 'Time Up!';
      msg = r.newBest ? `Amazing! Your fastest ever: ${r.wpm} words per minute!` : `Your best is ${save.trialBest} WPM. Keep practicing to beat it!`;
    } else if (!r.passed) {
      title = 'Almost!';
      msg = `You got ${r.acc}% correct. Get 80% or more to open the next quest. Go slow and use the right fingers!`;
    } else if (L.boss) {
      title = 'Boss Defeated!';
      msg = L.id === LESSONS.length - 1
        ? `${save.name} defeated the Gloom King and saved the Kingdom of Keys! You are a TRUE typing hero!`
        : `${B.boss.name} is defeated! A new land is open!`;
    } else {
      title = 'Victory!';
      msg = r.stars === 3 ? 'Perfect! Three stars!' : r.stars === 2
        ? `Great accuracy! Reach ${L.wpm} WPM with 95% correct for 3 stars.`
        : 'You did it! Try for 90% correct to earn more stars.';
    }
    $('#res-title').textContent = title;
    $('#res-msg').textContent = msg;
    $('#res-wpm').textContent = r.wpm;
    $('#res-acc').textContent = r.acc + '%';
    $('#res-gems').textContent = '+' + r.gems;
    const tricky = Object.entries(r.errKeys).sort((a, b) => b[1] - a[1]).slice(0, 3);
    $('#res-tricky').textContent = tricky.length ? 'Tricky keys this time: ' + tricky.map(([k]) => keyName(k)).join(', ') : 'No mistakes at all — incredible!';
    const st = $('#res-stars');
    if (r.trial) {
      st.innerHTML = '⚡';
    } else {
      st.innerHTML = '<span>⭐</span><span>⭐</span><span>⭐</span>';
      [...st.children].forEach((s, i) => {
        if (i < r.stars) setTimeout(() => { s.classList.add('on'); Sound.star(i); }, 400 + i * 350);
      });
    }
    if (r.passed) Sound.win(); else Sound.wrong();
    Voice.say(title + ' ' + msg);
    const nextId = L ? L.id + 1 : null;
    $('#btn-next').style.display = (r.trial || !r.passed || nextId >= LESSONS.length || !isUnlocked(nextId)) ? 'none' : '';
    $('#btn-next').onclick = () => { Sound.click(); selRegion = LESSONS[nextId].region; startLesson(nextId); };
    $('#btn-retry').onclick = () => { Sound.click(); r.trial ? startTrial() : startLesson(L.id); };
  }
  $('#btn-map').onclick = () => { Sound.click(); if (lastResult && lastResult.lesson) selRegion = LESSONS[Math.min(save.unlocked, LESSONS.length - 1)].region; openMap(); };

  function quitToMap() {
    if (B) B.state = 'done';
    B = null;
    $('#overlay').classList.add('hidden');
    setHint(null);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    openMap();
  }
  $('#btn-quit').onclick = quitToMap;

  // ---------- Shop ----------
  function openShop() {
    show('shop');
    renderShop();
  }
  function renderShop() {
    $('#shop-gems').textContent = save.gems;
    const make = (list, type, el) => {
      el.innerHTML = '';
      list.forEach(it => {
        const b = document.createElement('button');
        const owned = save.owned.includes(it.id);
        const eq = save[type] === it.id;
        b.className = 'item' + (eq ? ' equipped' : '');
        const col = type === 'tunic' ? it.color : it.blade;
        b.innerHTML = `<div class="sw" style="background:${col}"></div><div class="nm">${it.name}</div>
          <div class="pr">${eq ? '✓ Wearing' : owned ? 'Tap to wear' : `💎 ${it.cost}`}</div>`;
        b.disabled = !owned && save.gems < it.cost;
        b.onclick = () => {
          if (!owned) { save.gems -= it.cost; save.owned.push(it.id); Sound.gem(); }
          else Sound.click();
          save[type] = it.id;
          persist(); renderShop();
        };
        el.appendChild(b);
      });
    };
    make(TUNICS, 'tunic', $('#shop-tunics'));
    make(SWORDS, 'sword', $('#shop-swords'));
    const c = $('#shop-canvas'), x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = false;
    drawHero(x, 90, 100, 0, { tunic: tunic(), sword: sword(), swing: 0 });
  }
  $('#btn-shop-back').onclick = () => { Sound.click(); openMap(); };

  // ---------- Parent corner ----------
  function openParent() {
    show('parent');
    const s = save.settings;
    $('#set-diff').value = s.difficulty;
    $('#set-hints').value = s.hints;
    $('#set-sound').checked = s.sound;
    $('#set-voice').checked = s.voice;
    $('#set-unlock').checked = s.unlockAll;

    const mins = Math.round(save.timePlayed / 60);
    const recent = save.history.slice(-10);
    const avgAcc = recent.length ? Math.round(recent.reduce((a, h) => a + h.acc, 0) / recent.length) : 0;
    $('#p-summary').innerHTML = `<div class="p-summary-grid">
      <div><b>${Math.min(save.unlocked, LESSONS.length)}/${LESSONS.length}</b><span class="muted">lessons</span></div>
      <div><b>${save.trialBest}</b><span class="muted">Speed Trial best</span></div>
      <div><b>${avgAcc}%</b><span class="muted">recent accuracy</span></div>
    </div><p class="muted small-txt">Active typing time: ${mins} min · Current adaptive speed: ${Math.round(save.cps * 12)} WPM</p>`;

    // chart
    const c = $('#p-chart'), x = c.getContext('2d');
    const pts = [...save.history.map(h => ({ t: h.t, wpm: h.wpm, trial: false })), ...save.trials.map(h => ({ t: h.t, wpm: h.wpm, trial: true }))]
      .sort((a, b) => a.t - b.t).slice(-40);
    x.clearRect(0, 0, c.width, c.height);
    x.font = '13px Fredoka, sans-serif';
    if (pts.length < 2) {
      x.fillStyle = '#7b6a58'; x.textAlign = 'center';
      x.fillText('Play a few lessons to see the speed chart.', c.width / 2, c.height / 2);
    } else {
      const max = Math.max(10, ...pts.map(p => p.wpm)) * 1.15;
      const px = (i) => 34 + (i / (pts.length - 1)) * (c.width - 50);
      const py = (v) => c.height - 22 - (v / max) * (c.height - 36);
      x.strokeStyle = '#e8dcc0'; x.fillStyle = '#7b6a58'; x.textAlign = 'right';
      for (let v = 0; v <= max; v += Math.ceil(max / 4 / 5) * 5) {
        x.beginPath(); x.moveTo(30, py(v)); x.lineTo(c.width - 10, py(v)); x.stroke();
        x.fillText(v, 26, py(v) + 4);
      }
      x.strokeStyle = '#3f7fe0'; x.lineWidth = 3; x.beginPath();
      pts.forEach((p, i) => (i ? x.lineTo(px(i), py(p.wpm)) : x.moveTo(px(i), py(p.wpm))));
      x.stroke(); x.lineWidth = 1;
      pts.forEach((p, i) => {
        x.fillStyle = p.trial ? '#ffb02e' : '#3f7fe0';
        x.beginPath(); x.arc(px(i), py(p.wpm), p.trial ? 5 : 3.5, 0, Math.PI * 2); x.fill();
      });
      x.textAlign = 'left'; x.fillStyle = '#ffb02e'; x.fillText('● Speed Trial', 40, 14);
      x.fillStyle = '#3f7fe0'; x.fillText('● Lesson', 140, 14);
    }

    // tricky keys
    const ks = Object.entries(save.keyStats)
      .filter(([, v]) => v.hit + v.miss >= 5)
      .map(([k, v]) => [k, v.miss / (v.hit + v.miss)])
      .sort((a, b) => b[1] - a[1]).slice(0, 10);
    $('#p-keys').innerHTML = ks.length
      ? ks.map(([k, r]) => `<span class="p-key" style="background:${FINGERS[KEY_FINGER[k]].color}">${keyName(k)} <small>${Math.round(r * 100)}% missed</small></span>`).join('')
      : '<span class="muted">Not enough data yet.</span>';

    // lessons table
    $('#p-lessons').innerHTML = '<table><tr><th>Lesson</th><th>Stars</th><th>Best WPM</th><th>Best %</th><th>Plays</th></tr>' +
      LESSONS.map(l => {
        const r = save.lessons[l.id];
        return `<tr><td>${l.title}</td><td>${r ? '⭐'.repeat(r.stars) || '—' : '—'}</td><td>${r ? r.bestWpm : '—'}</td><td>${r ? r.bestAcc + '%' : '—'}</td><td>${r ? r.plays : 0}</td></tr>`;
      }).join('') + '</table>';
  }
  $('#set-diff').onchange = (e) => { save.settings.difficulty = e.target.value; persist(); };
  $('#set-hints').onchange = (e) => { save.settings.hints = e.target.value; persist(); };
  $('#set-sound').onchange = (e) => { save.settings.sound = e.target.checked; applySettings(); persist(); };
  $('#set-voice').onchange = (e) => { save.settings.voice = e.target.checked; applySettings(); persist(); };
  $('#set-unlock').onchange = (e) => { save.settings.unlockAll = e.target.checked; persist(); };
  $('#btn-reset').onclick = () => {
    if (!confirm('Erase ALL progress, gems and stats? This cannot be undone.')) return;
    const name = save.name;
    save = DEFAULT_SAVE(); save.name = name;
    persist(); applySettings(); selRegion = null; openParent();
  };
  $('#btn-parent-back').onclick = () => { Sound.click(); openMap(); };

  // Expose a tiny debug hook for testing.
  window.__kok = { get save() { return save; }, get battle() { return B; }, startLesson, startTrial };
})();
