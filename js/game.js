/* game.js — motor: loop, física, câmera, input (teclado/toque), HUD, caixas, cartões, pausa, salvamento, debug */
(function () {
  const C = SL.C, A = SL.Audio, D = SL.D;
  const $ = id => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d');
  SL.mainCtx = ctx;
  const H = 192;
  const DEBUG = /[?&]debug=1/.test(location.search);

  const G = SL.G = {
    W: 336, t: 0, state: 'boot', L: null, hero: null, cam: 0, shakeT: 0,
    in: { L: 0, R: 0, J: 0, A: 0 }, pr: {}, touch: false,
    dbg: { inv: false, box: false, fps: false }
  };

  /* ================= salvamento ================= */
  const SAVE_KEY = 'sl_save_v1';
  const fresh = () => ({ won: {}, lives: 13, votes: 0, bone: false, act: 1, node: 0, alck: 0, act2: false, end: false });
  G.save = fresh();
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.won) G.save = Object.assign(fresh(), s); } catch (e) {}
  G.persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) {} };
  G.hasProgress = () => Object.keys(G.save.won).length > 0;

  /* ================= textos ================= */
  G.tk = s => String(s).replace(/\{PULO\}/g, G.touch ? 'A' : 'Z').replace(/\{ACAO\}/g, G.touch ? 'B' : 'X').replace(/\{PAUSA\}/g, G.touch ? 'II' : 'Esc');
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  G.esc = esc;
  function fontesHTML(keys) {
    return keys.map(k => {
      const f = C.fontes[k]; if (!f) return '';
      return f[1] ? `<a href="${esc(f[1])}" target="_blank" rel="noopener">${esc(f[0])}</a>` : esc(f[0]);
    }).filter(Boolean).join(' · ');
  }
  G.fontesHTML = fontesHTML;

  /* ================= input ================= */
  const KEYMAP = { ArrowLeft: 'L', ArrowRight: 'R', KeyZ: 'J', Space: 'J', Enter: 'J', NumpadEnter: 'J', KeyX: 'A', Escape: 'P', KeyM: 'M', KeyA: 'L', KeyD: 'R' };
  const pressQ = {};
  function press(k) { pressQ[k] = true; }
  addEventListener('keydown', e => {
    const k = KEYMAP[e.code] || KEYMAP[e.key];
    if (!k) { if (DEBUG) debugKey(e); return; }
    if (e.target && e.target.tagName === 'SELECT') return;
    e.preventDefault();
    A.unlock();
    if (!e.repeat) press(k);
    if (k in G.in) G.in[k] = 1;
  });
  addEventListener('keyup', e => { const k = KEYMAP[e.code] || KEYMAP[e.key]; if (k && k in G.in) G.in[k] = 0; });
  addEventListener('blur', () => { G.in.L = G.in.R = G.in.J = G.in.A = 0; });

  function touchOn() {
    if (G.touch) return;
    G.touch = true; document.documentElement.classList.add('touch-on');
    resize(); refreshTexts();
  }
  try { if (matchMedia('(pointer:coarse)').matches) touchOn(); } catch (e) {}
  addEventListener('touchstart', () => { touchOn(); A.unlock(); }, { passive: true });

  const vib = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
  // botões A, B, II
  function bindBtn(el, key) {
    const on = e => { e.preventDefault(); touchOn(); A.unlock(); el.classList.add('on'); vib(); press(key); if (key in G.in) G.in[key] = 1; try { el.setPointerCapture(e.pointerId); } catch (x) {} };
    const off = e => { el.classList.remove('on'); if (key in G.in) G.in[key] = 0; };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  }
  bindBtn($('tA'), 'J'); bindBtn($('tB'), 'A'); bindBtn($('tP'), 'P');
  // direcional: o bloco inteiro é área de toque; deslizar troca a direção
  (function () {
    const pad = $('dpad'), spans = pad.querySelectorAll('span'); const ptrs = new Map();
    function recompute() {
      let l = 0, r = 0; for (const d of ptrs.values()) { if (d === 'L') l = 1; if (d === 'R') r = 1; }
      if (l && !G.in.L) { press('L'); vib(); } if (r && !G.in.R) { press('R'); vib(); }
      G.in.L = l; G.in.R = r;
      spans[0].classList.toggle('on', !!l); spans[1].classList.toggle('on', !!r);
    }
    const dirAt = e => { const b = pad.getBoundingClientRect(); return e.clientX < b.left + b.width / 2 ? 'L' : 'R'; };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); touchOn(); A.unlock(); try { pad.setPointerCapture(e.pointerId); } catch (x) {} ptrs.set(e.pointerId, dirAt(e)); recompute(); });
    pad.addEventListener('pointermove', e => { if (ptrs.has(e.pointerId)) { ptrs.set(e.pointerId, dirAt(e)); recompute(); } });
    const up = e => { ptrs.delete(e.pointerId); recompute(); };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); pad.addEventListener('lostpointercapture', up);
  })();
  // toque no palco: na abertura começa; nas caixas avança
  $('stage').addEventListener('pointerup', e => {
    if (e.target.closest('a,button,.btn,#debug,select')) return;
    if (['title', 'dialog', 'card', 'item', 'final'].includes(G.state)) { A.unlock(); press('J'); }
    if (G.state === 'title') goFullscreen();
  });
  $('skip').addEventListener('click', e => { e.stopPropagation(); if (G.state === 'cut') G.cutSkip(); });
  $('uCf').addEventListener('pointerdown', e => { e.preventDefault(); press('J'); });

  function goFullscreen() {
    if (!G.touch) return;
    const de = document.documentElement, d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) return;
    const fn = de.requestFullscreen || de.webkitRequestFullscreen;
    if (!fn) return;
    try {
      const p = fn.call(de, { navigationUI: 'hide' });
      const lock = () => { try { const q = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); q && q.catch && q.catch(() => {}); } catch (e) {} };
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) {}
  }

  /* ================= tela / redimensionamento ================= */
  // tamanho real da área visível: mede a régua fixa #vp (imune ao zoom do Safari e a valores
  // velhos de innerWidth/innerHeight durante a rotação dos iPhones)
  function viewSize() {
    const vp = $('vp'); let vw = vp ? vp.clientWidth : 0, vh = vp ? vp.clientHeight : 0;
    if (!vw || !vh) { const de = document.documentElement; vw = de.clientWidth || innerWidth; vh = de.clientHeight || innerHeight; }
    return [vw, vh];
  }
  function resize() {
    const html = document.documentElement, st = $('stage');
    const full = G.touch;
    html.classList.toggle('full', full);
    const [vw, vh] = viewSize();
    let w = 336;
    if (full) {
      if (scrollX || scrollY) scrollTo(0, 0);
      w = Math.max(336, Math.min(600, Math.floor(192 * vw / vh)));
      const hh = Math.min(vh, vw * 192 / w), ww = hh * w / 192;
      st.style.width = ww + 'px'; st.style.height = hh + 'px'; st.style.setProperty('--u', (hh * 1.75 / 100) + 'px');
    } else { st.style.width = ''; st.style.height = ''; st.style.removeProperty('--u'); }
    if (cv.width !== w) { cv.width = w; cv.height = H; }
    G.W = w; ctx.imageSmoothingEnabled = false;
    const portrait = vh > vw && (G.touch || vw <= 900);
    $('rotate').hidden = !portrait;
    if (portrait && G.state === 'play') pauseOpen();
  }
  // o iOS dispara os eventos antes de terminar a rotação: mede de novo quando assentar
  const resizeSoon = () => { resize(); [120, 350, 800].forEach(t => setTimeout(resize, t)); };
  addEventListener('resize', resizeSoon); addEventListener('orientationchange', resizeSoon);
  addEventListener('pageshow', resizeSoon);
  if (window.visualViewport) visualViewport.addEventListener('resize', resize);
  try { new ResizeObserver(() => resize()).observe($('vp')); } catch (e) {}
  document.addEventListener('fullscreenchange', resizeSoon); document.addEventListener('webkitfullscreenchange', resizeSoon);
  // trava o zoom de pinça e de toque duplo (o iOS ignora user-scalable=no)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd < 320 && !(e.target.closest && e.target.closest('a,button,select,.btn'))) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  /* ================= textos estáticos ================= */
  function logoHTML(s) { return [...s].map(ch => ch === ' ' ? '<span class="sp"> </span>' : `<span>${esc(ch)}</span>`).join(''); }
  function refreshTexts() {
    $('logoS').textContent = C.abertura.logoTopo; $('rLogoS').textContent = C.abertura.logoTopo;
    $('logoF').innerHTML = logoHTML(C.abertura.logo);
    $('rLogo').innerHTML = logoHTML(C.abertura.logo);
    $('logoSub').textContent = C.abertura.subtitulo; $('rLogoW').textContent = C.abertura.subtitulo;
    $('titlePress').textContent = G.tk(C.abertura.aperte);
    $('titleDisc').textContent = C.abertura.rodape;
    if($('titleSeal'))$('titleSeal').remove(); if($('rSeal'))$('rSeal').remove();
    $('rT').textContent = C.rotate.titulo; $('rP').textContent = C.rotate.texto; $('rS').textContent = C.rotate.rodape;
    $('legend').innerHTML = esc(C.legenda).replace(/(Setas|Z|X|Esc|M)(?= )/g, '<b>$1</b>');
    $('skip').textContent = C.pular;
    if (G.state === 'map' && SL.Map) SL.Map.bar(G);
    if (G.state === 'dialog') renderDlg(true);
  }

  /* ================= estados e camadas DOM ================= */
  function show(id, on) { $(id).hidden = !on; }
  G.setState = function (s) {
    G.state = s;
    show('title', s === 'title');
    show('mapbar', s === 'map');
    show('hud', !!G.L && ['play', 'dialog', 'dying', 'clear', 'card', 'pause', 'bossintro', 'povo', 'item'].includes(s) && G.dlgOver !== 'map' && s !== 'item');
    show('dlg', s === 'dialog' || s === 'placar');
    show('card', s === 'card' || s === 'item' || s === 'final');
    show('pause', s === 'pause');
    show('urna', s === 'urna' || s === 'credits');
    show('skip', s === 'cut');
    show('cutcap', s === 'cut');
    if (s !== 'bossintro') show('banner', false);
    if (s !== 'clear' && s !== 'povo') show('big', false);
    hudDirty = true; if (G.L) hud();
    document.documentElement.classList.toggle('txt-open', ['dialog', 'card', 'placar', 'item', 'final', 'urna', 'credits'].includes(s));
    hudDirty = true;
  };

  /* ================= HUD ================= */
  let hudDirty = true, hudKey = '';
  function hud() {
    const L = G.L; if (!L) return;
    let obj = '';
    if (L.boss && L.boss.active && !L.boss.done) {
      const b = L.boss; const k = Math.max(0, b.max - b.hp);
      obj = `${esc(b.name)} <span class="bbar">${'■'.repeat(b.hp)}${'□'.repeat(k)}</span>`;
    } else if (L.obj) {
      if (L.obj.meter != null) obj = `${esc(L.obj.label)} <span class="meter"><i style="width:${Math.max(0, Math.min(100, L.obj.meter))}%"></i></span>`;
      else obj = `${esc(L.obj.label)} ${Math.min(L.obj.n, L.obj.max)}/${L.obj.max}`;
    }
    if (L.objExtra && !(L.boss && L.boss.active && !L.boss.done)) obj += ' ' + L.objExtra();
    const key = G.save.lives + '|' + L.n + '|' + obj + '|' + G.save.votes;
    if (key === hudKey && !hudDirty) return;
    hudKey = key; hudDirty = false;
    $('hLives').textContent = `LULA × ${G.save.lives}`;
    $('hFase').textContent = `FASE ${L.n}`;
    $('hObj').innerHTML = obj;
    $('hCoins').querySelector('span').textContent = `× ${G.save.votes}`;
  }

  let toastT = 0;
  G.toast = (s, f) => { const el = $('toast'); el.textContent = s; el.hidden = false; toastT = f || 100; };
  G.big = (s, on) => { const el = $('big'); el.textContent = s; el.hidden = !on; };

  /* ================= diálogos ================= */
  let dlg = null;
  G.dlgOver = null;
  G.dialog = function (pages, done, over) {
    dlg = { pages, i: 0, n: 0, done };
    G.dlgOver = over || null;
    G.setState('dialog');
    renderDlg(true);
  };
  function pageText(p) { return (p.body || '') + (p.cmd ? '\n' + p.cmd : ''); }
  function renderDlg(top) {
    if (!dlg) return;
    const p = dlg.pages[dlg.i], full = G.tk(pageText(p)), shown = full.slice(0, Math.floor(dlg.n)), complete = dlg.n >= full.length;
    let h = '';
    if (p.tag) h += `<div class="tag ${p.tagClass || ''}">${esc(p.tag)}</div>`;
    if (p.title) h += `<h2>${esc(p.title)}</h2>`;
    const body = G.tk(p.body || '');
    const bShown = shown.slice(0, body.length), cShown = shown.slice(body.length + 1);
    h += `<p>${esc(bShown)}${!complete && cShown === '' ? '<span style="opacity:.4">▌</span>' : ''}</p>`;
    if (p.cmd && shown.length > body.length) h += `<p class="cmd">${esc(cShown)}${!complete ? '<span style="opacity:.4">▌</span>' : ''}</p>`;
    if (complete) {
      if (p.score) h += `<div class="score">${esc(p.score)}</div>`;
      if (p.html) h += p.html;
      if (p.src && p.src.length) h += `<div class="src">Fontes: ${fontesHTML(p.src)}</div>`;
    }
    h += `<div class="next" id="dlgNext"></div>`;
    const el = $('dlg'); el.innerHTML = h;
    if (top) el.scrollTop = 0; else if (!complete) el.scrollTop = el.scrollHeight;
    updNext(p);
  }
  function remain() { const el = $('dlg'); return el.scrollHeight - el.clientHeight - el.scrollTop; }
  function updNext(p) {
    const n = $('dlgNext'); if (!n) return;
    const more = remain() > 8;
    n.classList.toggle('more', more);
    n.textContent = G.tk(more ? C.missao.rolar : (p.next || C.missao.continuar));
  }
  $('dlg').addEventListener('scroll', () => { if (dlg) updNext(dlg.pages[dlg.i]); });
  function dlgStep() {
    const p = dlg.pages[dlg.i], len = G.tk(pageText(p)).length;
    if (dlg.n < len) {
      dlg.n = Math.min(len, dlg.n + 1.6);
      if (G.pr.J) dlg.n = len;
      renderDlg(false);
      if (G.t % 3 === 0) A.sfx('type');
      return;
    }
    if (G.pr.J) {
      A.sfx('sel');
      const el = $('dlg');
      if (remain() > 8) { el.scrollBy({ top: el.clientHeight * .75, behavior: 'smooth' }); return; }
      if (dlg.i < dlg.pages.length - 1) { dlg.i++; dlg.n = 0; renderDlg(true); }
      else { const d = dlg.done; dlg = null; d && d(); }
    }
  }

  /* ================= cartões ================= */
  let cardMode = null;
  function card(html, mode) { $('roll').innerHTML = html; const r = $('roll'); r.style.animation = 'none'; void r.offsetWidth; r.style.animation = ''; cardMode = mode; G.setState('card'); }

  /* ================= física e tiles ================= */
  const SOLID = new Set(['#', 'X', 'B', '?', 'U', 'V', '>', '<', '=', 'G', 'W', 'P', 'D', 'I', 'T', 'K']);
  const ONEWAY = new Set(['-', 'C']);
  G.SOLID = SOLID;
  G.tile = (tx, ty) => { const L = G.L; if (!L) return ' '; if (tx < 0 || tx >= L.w) return 'W'; if (ty < 0 || ty >= 12) return ' '; return L.g[ty][tx]; };
  G.setTile = (tx, ty, ch) => { const L = G.L; if (tx >= 0 && tx < L.w && ty >= 0 && ty < 12) L.g[ty][tx] = ch; };
  const isSolid = (ch, e, down, prevBottom, ty) => {
    if (ONEWAY.has(ch)) return down && prevBottom <= ty * 16 + .01;
    return SOLID.has(ch);
  };
  G.solidAt = (px, py) => SOLID.has(G.tile(Math.floor(px / 16), Math.floor(py / 16)));
  function moveStep(e, dx, dy) {
    const r = {};
    if (dx) {
      e.x += dx;
      const y0 = Math.floor(e.y / 16), y1 = Math.floor((e.y + e.h - .01) / 16);
      if (dx > 0) {
        const tx = Math.floor((e.x + e.w - .01) / 16);
        for (let ty = y0; ty <= y1; ty++) if (isSolid(G.tile(tx, ty), e, false)) { e.x = tx * 16 - e.w; r.wall = 1; break; }
      } else {
        const tx = Math.floor(e.x / 16);
        for (let ty = y0; ty <= y1; ty++) if (isSolid(G.tile(tx, ty), e, false)) { e.x = (tx + 1) * 16; r.wall = -1; break; }
      }
      if (e === G.hero && G.L.wallL != null) {
        if (e.x < G.L.wallL) { e.x = G.L.wallL; r.wall = -1; }
        if (G.L.wallR != null && e.x + e.w > G.L.wallR) { e.x = G.L.wallR - e.w; r.wall = 1; }
      }
    }
    const prevBottom = e.y + e.h;
    e.y += dy;
    const x0 = Math.floor(e.x / 16), x1 = Math.floor((e.x + e.w - .01) / 16);
    if (dy > 0) {
      const ty = Math.floor((e.y + e.h - .01) / 16);
      for (let tx = x0; tx <= x1; tx++) if (isSolid(G.tile(tx, ty), e, true, prevBottom, ty)) { e.y = ty * 16 - e.h; r.land = true; r.landT = G.tile(tx, ty); r.ltx = tx; r.lty = ty; break; }
    } else if (dy < 0 && e.y >= 0) {
      const ty = Math.floor(e.y / 16), cx = Math.floor((e.x + e.w / 2) / 16);
      for (const tx of [cx, x0, x1]) {
        const ch = G.tile(tx, ty);
        if (!ONEWAY.has(ch) && SOLID.has(ch)) { e.y = (ty + 1) * 16; r.head = { tx, ty, ch }; break; }
      }
    }
    return r;
  }
  G.move = function (e, dx, dy) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
    if (n === 1) return moveStep(e, dx, dy);
    const out = {}; let sx = dx / n, sy = dy / n;
    for (let i = 0; i < n; i++) {
      const r = moveStep(e, sx, sy);
      if (r.wall) { out.wall = r.wall; sx = 0; }
      if (r.land) { Object.assign(out, r); sy = 0; }
      if (r.head) { out.head = r.head; sy = 0; }
      if (!sx && !sy) break;
    }
    return out;
  };
  G.overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  // herói caindo sobre o topo de um retângulo
  G.stomps = (r) => { const h = G.hero; return h.vy > 0 && G.overlap(h, r) && (h.y + h.h - h.vy) <= r.y + 6; };
  G.bounce = (big) => { const h = G.hero; h.vy = G.in.J || big ? -5 : -3.6; h.on = false; };
  G.shotIn = function (r, kinds) {
    const S = G.L.shots;
    for (let i = 0; i < S.length; i++) {
      const s = S[i];
      if (s.dead || (kinds && !kinds.includes(s.kind))) continue;
      if (G.overlap(s, r)) { s.dead = true; burst(s.x, s.y, s.col || '#5aa0ff', 4); return s; }
    }
    return null;
  };
  G.addEnt = e => { G.L.ents.push(e); return e; };
  G.hz = o => { const z = Object.assign({ vx: 0, vy: 0, g: 0, life: 400, w: 8, h: 8, harm: true }, o); G.L.hazards.push(z); return z; };
  G.fx = o => { G.L.fx.push(Object.assign({ life: 60, f: 0 }, o)); };
  G.sfx = n => A.sfx(n);
  G.shake = n => { G.shakeT = Math.max(G.shakeT, n || 10); };
  function burst(x, y, col, n) {
    for (let i = 0; i < (n || 6); i++) G.fx({ kind: 'part', x, y, vx: (Math.random() - .5) * 3, vy: -Math.random() * 3, col, life: 30 });
  }
  G.burst = burst;
  G.pop = (x, y, s, col) => G.fx({ kind: 'pop', x, y, s, col: col || '#fff', life: 50 });
  G.balloon = (text, who, frames, dy) => G.fx({ kind: 'balloon', text, who, life: frames || 120, dy: dy || 0 });
  G.objInc = function (k) {
    const L = G.L; if (!L.obj) return;
    L.obj.n = Math.min(L.obj.max, L.obj.n + (k || 1));
    hudDirty = true;
    if (L.obj.n >= L.obj.max && (!L.gateCond || L.gateCond(G))) G.openGate();
  };
  G.openGate = function () {
    const L = G.L;
    if (!L.gateTiles || L.gateOpen) return;
    L.gateOpen = true;
    for (const [x, y] of L.gateTiles) { G.setTile(x, y, ' '); burst(x * 16 + 8, y * 16 + 8, '#ffd21f', 2); }
    A.sfx('gate');
  };
  G.addVotes = function (n) {
    G.save.votes += n;
    while (G.save.votes >= 100) { G.save.votes -= 100; G.save.lives++; A.sfx('life'); G.pop(G.hero.x, G.hero.y - 8, '+1 VIDA', '#3ec04a'); }
    hudDirty = true;
  };

  /* ================= herói ================= */
  function newHero(x, y) {
    return { x, y, w: 10, h: 18, vx: 0, vy: 0, on: false, face: 1, coyote: 0, jbuf: 0, anim: 0, inv: 0, star: 0, mount: false, cool: 0, lantern: false, lock: 0, onMover: null };
  }
  G.spriteFor = function () {
    const h = G.hero, L = G.L, base = L.lula;
    const starOn = h.star > 0 && Math.floor(G.t / 4) % 2 === 0;
    if (h.mount) return SL.S['vice_' + base];
    if (h.inv > 0 && Math.floor(G.t / 4) % 2 === 0 && !h.star) return SL.S[base + '_hit'] || SL.S[base];
    let id = base;
    if (starOn && SL.S[id + '_star']) id += '_star';
    return SL.S[id] || SL.S[base];
  };

  function heroUpdate() {
    const h = G.hero, L = G.L, inp = G.in;
    if (h.lock > 0) { h.lock--; h.vx = 0; }
    const ctl = h.lock <= 0;
    let max = 1.4;
    if (L.action === 'run' && inp.A && ctl) max = 2.3;
    if (h.mount) max += .5;
    if (h.star > 0) max *= 1.3;
    const acc = h.on ? .12 : .085;
    if (ctl && inp.L && !inp.R) { h.face = -1; if (h.vx > -max) h.vx = Math.max(-max, h.vx - acc); }
    else if (ctl && inp.R && !inp.L) { h.face = 1; if (h.vx < max) h.vx = Math.min(max, h.vx + acc); }
    else { h.vx *= h.on ? .8 : .97; if (Math.abs(h.vx) < .05) h.vx = 0; }
    if (Math.abs(h.vx) > max) h.vx = Math.sign(h.vx) * Math.max(max, Math.abs(h.vx) - .08);
    if (G.pr.J && ctl) h.jbuf = 7; else if (h.jbuf > 0) h.jbuf--;
    if (h.on) h.coyote = 6; else if (h.coyote > 0) h.coyote--;
    if (h.jbuf > 0 && h.coyote > 0) {
      let v = 4.3 + Math.abs(h.vx) * .25; if (h.mount) v += .6;
      h.vy = -v; h.on = false; h.coyote = 0; h.jbuf = 0; h.onMover = null; A.sfx('jump');
    }
    const gr = (inp.J && h.vy < 0) ? .14 : .34;
    h.vy = Math.min(h.vy + gr, 5.5);
    let dx = h.vx + (L.pull || 0) + (h.push || 0); h.push = 0;
    if (h.on) {
      const t1 = G.tile(Math.floor((h.x + h.w / 2) / 16), Math.floor((h.y + h.h + 1) / 16));
      if (t1 === '>') dx += .7; else if (t1 === '<') dx -= .7;
    }
    const r = G.move(h, dx, h.vy);
    h.on = false;
    if (r.land) { h.vy = 0; h.on = true; h.onMover = null; if (r.landT === '=') bridgeTouch(r.ltx, r.lty); }
    if (r.head) { h.vy = 1; bumpTile(r.head.tx, r.head.ty); }
    if (r.wall && Math.sign(r.wall) === Math.sign(dx)) h.vx = 0;
    // plataformas móveis
    for (const m of L.movers) {
      if (m.solidTop === false) continue;
      const prevB = h.y + h.h - h.vy;
      if (h.vy >= 0 && h.x + h.w > m.x + 1 && h.x < m.x + m.w - 1 && prevB <= m.y + 2 + Math.max(0, m.dy || 0) && h.y + h.h >= m.y) {
        h.y = m.y - h.h; h.vy = 0; h.on = true; h.onMover = m; m.onTouch && m.onTouch(G);
      }
    }
    if (h.onMover && (h.x + h.w <= h.onMover.x || h.x >= h.onMover.x + h.onMover.w)) h.onMover = null;
    // ação da fase
    actionUpdate();
    if (h.inv > 0) h.inv--;
    if (h.star > 0 && --h.star === 0) A.overrideOff();
    if (h.cool > 0) h.cool--;
    h.anim += Math.abs(h.vx) > .1 ? Math.abs(h.vx) : 0;
  }

  function actionUpdate() {
    const h = G.hero, L = G.L, a = L.action;
    h.lantern = false;
    if (h.lock > 0) return;
    if (a === 'lantern') { h.lantern = !!G.in.A; return; }
    if (!G.pr.A) return;
    if (a === 'lever') {
      const lv = L.targets.find(t => t.kind === 'lever' && !t.done && Math.abs(t.x + t.w / 2 - (h.x + h.w / 2)) < 26 && Math.abs(t.y - h.y) < 30);
      if (lv) { lv.hit(G, 'lever'); return; }
      return shootInk();
    }
    if (a === 'ink') return shootInk();
    if (a === 'fan') {
      if (h.cool > 0) return;
      h.cool = 30; A.sfx('mega');
      for (const vy of [-1, 0, 1]) L.shots.push({ kind: 'card', x: h.x + (h.face > 0 ? h.w : -8), y: h.y + 6, w: 8, h: 6, vx: 3.2 * h.face, vy: vy * .9, g: 0, life: 42, col: '#2449c9' });
      return;
    }
    if (a === 'bolsa' || a === 'med') {
      if (L.shots.filter(s => s.kind === a).length >= 2) return;
      A.sfx(a === 'bolsa' ? 'sel' : 'throw');
      if (a === 'bolsa') L.shots.push({ kind: a, x: h.x + (h.face > 0 ? h.w - 2 : -8), y: h.y + 6, w: 10, h: 7, vx: 2.8 * h.face + h.vx * .5, vy: -2.2, g: .12, life: 120, col: '#2fae4f' });
      else L.shots.push({ kind: a, x: h.x + (h.face > 0 ? h.w - 2 : -6), y: h.y + 4, w: 8, h: 7, vx: 2.6 * h.face + h.vx * .5, vy: -3.2, g: .2, life: 120, col: '#ffffff' });
    }
  }
  function shootInk() {
    const h = G.hero, L = G.L, kind = L.inkKind || 'ink';
    if (kind !== 'constituicao') {
      if (L.shots.filter(s => s.kind === kind).length >= 2) return;
      A.sfx('ink');
    }
    if (kind === 'constituicao') { // fase 13: cópias da Constituição (contam como 'ink' para alvos e inimigos)
      if (L.shots.filter(s => s.kind === 'ink').length >= 2) return;
      A.sfx('throw');
      L.shots.push({ kind: 'ink', skin: 'constituicao', x: h.x + (h.face > 0 ? h.w : -8), y: h.y + 4, w: 8, h: 10, vx: 3.8 * h.face, vy: 0, g: 0, life: 75, col: '#efe3c0' });
      return;
    }
    if (kind === 'bandeirinha') L.shots.push({ kind, x: h.x + (h.face > 0 ? h.w : -9), y: h.y + 6, w: 9, h: 6, vx: 3.8 * h.face, vy: 0, g: 0, life: 75, col: '#17a34a', face: h.face });
    else L.shots.push({ kind: 'ink', x: h.x + (h.face > 0 ? h.w : -6), y: h.y + 8, w: 6, h: 4, vx: 4 * h.face, vy: 0, g: 0, life: 70, col: '#2a5adf' });
  }

  function bridgeTouch(tx, ty) { const L = G.L; L.crumble = L.crumble || []; if (!L.crumble.some(c => c.x === tx && c.y === ty)) L.crumble.push({ x: tx, y: ty, t: 60 }); }
  G.bridgeTouch = bridgeTouch;

  function bumpTile(tx, ty) {
    const L = G.L, ch = G.tile(tx, ty);
    L.bumps.push({ tx, ty, t: 8 });
    if (ch === '?') {
      const c = L.qc[tx + ',' + ty] || 'coin';
      G.setTile(tx, ty, 'U'); A.sfx('block');
      if (c === 'flag' && G.save.bone) { G.addVotes(1); A.sfx('coin'); G.fx({ kind: 'coinpop', x: tx * 16 + 5, y: ty * 16 - 12, life: 24 }); }
      else if (c === 'coin') { G.addVotes(1); A.sfx('coin'); G.fx({ kind: 'coinpop', x: tx * 16 + 5, y: ty * 16 - 12, life: 24 }); }
      else spawnItem(c, tx * 16, ty * 16);
    } else if (ch === 'B') {
      G.setTile(tx, ty, ' '); A.sfx('break');
      for (let i = 0; i < 6; i++) G.fx({ kind: 'part', x: tx * 16 + 8, y: ty * 16 + 8, vx: (Math.random() - .5) * 4, vy: -2 - Math.random() * 2, col: L.theme.brick, life: 40, sz: 3 });
    } else if (ch === 'V') {
      const regen = L.qc[tx + ',' + ty] === 'regen';
      if (G.hero.mount || L.items.some(i => i.kind === 'alckmin')) { A.sfx('block'); return; }
      if (!regen) G.setTile(tx, ty, 'U');
      A.sfx('block'); spawnItem('alckmin', tx * 16, ty * 16);
    } else A.sfx('block');
    // derruba inimigos em cima
    for (const e of L.ents) if (!e.dead && e.harm && e.y + e.h >= ty * 16 - 2 && e.y + e.h <= ty * 16 + 2 && e.x + e.w > tx * 16 && e.x < tx * 16 + 16) killEnt(e);
    L.onBump && L.onBump(G, tx, ty, ch);
  }
  G.bumpTile = bumpTile;

  function spawnItem(kind, x, y) {
    const it = { kind, x: x + 2, y, w: 12, h: 12, vx: 0, vy: 0, rise: 16, phys: true };
    if (kind === 'alckmin') {
      it.w = 10; it.h = 18; it.rise = 18; it.x = x + 3;
      if (!G.save.alck) { it.firstTalk = true; G.balloon(C.alckmin.fala1, it, 170, -2); }
    }
    G.L.items.push(it);
  }
  G.spawnItem = spawnItem;

  function killEnt(e, how) {
    if (e.dead) return;
    if (e.onKill) { e.onKill(G, how); if (!e.dead) return; }
    e.dead = true; A.sfx('stomp');
    G.fx({ kind: 'squash', x: e.x, y: e.y, w: e.w, h: e.h, draw: e.render ? e : null, life: 24 });
  }
  G.killEnt = killEnt;

  /* ---------- golpe, tropeço, buraco ---------- */
  G.hurt = function (why) {
    const h = G.hero, L = G.L;
    if (G.state !== 'play' || G.dbg.inv || h.star > 0 || h.inv > 0) return;
    L.onHurt && L.onHurt(G);
    if (h.mount) { dismount(); h.inv = 90; A.sfx('hit'); return; }
    if (G.save.bone) {
      G.save.bone = false; G.persist(); h.inv = 90; A.sfx('hit');
      G.fx({ kind: 'capefly', x: h.x, y: h.y + 4, vx: -h.face * 1.5, vy: -3, life: 80 });
      return;
    }
    tropeco(false);
  };
  function dismount() {
    const h = G.hero; h.mount = false; h.y += 10; h.h = 18;
    G.fx({ kind: 'alckleave', x: h.x, y: h.y, face: h.face, life: 170 });
  }
  function tropeco(pit) {
    const h = G.hero;
    G.save.lives = Math.max(0, G.save.lives - 1); G.persist(); hudDirty = true;
    A.sfx('hit');
    G.dying = { t: 0, pit };
    if (h.mount) { h.mount = false; h.h = 18; h.y += 10; }
    h.vy = pit ? 0 : -3; h.vx = 0;
    G.setState('dying');
  }
  function dyingStep() {
    const d = G.dying, h = G.hero; d.t++;
    if (!d.pit) { h.vy = Math.min(h.vy + .25, 5); h.y += h.vy; if (h.y > d.y0) h.y = d.y0; }
    if (d.t === 1) d.y0 = h.y;
    if (d.t > 45) {
      if (G.save.lives <= 0) return povoStart();
      showTropecoCard(d.pit);
    }
  }
  function showTropecoCard(pit) {
    const L = G.L, ph = C.fases[L.n];
    const t = pit ? [C.tropeco.buraco.titulo, C.tropeco.buraco.linha] : ph.tropeco;
    const inBoss = L.boss && L.boss.active && !L.boss.done;
    card(`<div class="go-head">${esc(t[0])}</div><div class="go-sub">${esc(t[1])}</div><div class="go-lives">LULA × ${G.save.lives}</div><div class="go-hint">${esc(G.tk(inBoss ? C.tropeco.chefe : C.tropeco.tentar))}</div>`, inBoss ? 'boss' : 'retry');
  }
  function cardStep() {
    if (cardMode === 'retry' && G.pr.J) { respawn(); }
    else if (cardMode === 'boss') { if (G.pr.J) respawnBoss(); }
    else if (cardMode === 'item' && G.pr.J) { const f = G.itemDone; G.itemDone = null; f && f(); }
    else if (cardMode === 'final') { if (G.pr.J) { G.L = null; goMap(); } else if (G.pr.A) share('final'); }
  }
  function respawn() {
    const L = G.L, h = G.hero;
    // depois de chegar no chefão, sempre volta direto na luta (nunca no checkpoint anterior)
    if (L.arena && L.arena.locked && L.boss && !L.boss.done) return respawnBoss();
    const x = L.cpX != null ? L.cpX : L.start.x;
    Object.assign(h, newHero(x, 0)); h.y = groundY(x) - h.h; h.inv = 60;
    L.hazards.length = 0; L.shots.length = 0; L.pull = 0;
    L.crumble = [];
    if (L.bridges) for (const b of L.bridges) G.setTile(b.x, b.y, '=');
    if (L.scissors) for (const s of L.scissors) if (s[0] * 16 >= x - 80) s.done = false;
    G.cam = clampCam(h.x - G.W * .4);
    L.onRespawn && L.onRespawn(G);
    clearDpad(G.cam);
    G.setState('play');
  }
  /* Arena do chefe do tamanho da tela: a arena original tem 320 px (20 blocos) e a parede da esquerda
     ficava no começo dela. Em telas mais largas (celulares compridos) a câmera mostra mais à esquerda e a
     parede ficava no meio da tela, invisível. Aqui a borda esquerda da arena acompanha a borda esquerda
     da tela: o chão dessa faixa é completado (buracos e pontes viram chão), portões e portas saem, e
     inimigos e plataformas soltas que sobraram ali são retirados. No desktop (336 px) nada muda. */
  function arenaGround(grid, tx0, tx1) {
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = 0; ty < 10; ty++) { const ch = grid[ty] && grid[ty][tx]; if (ch === 'G' || ch === 'D') grid[ty][tx] = ' '; }
      for (const ty of [10, 11]) { const ch = grid[ty] && grid[ty][tx]; if (grid[ty] && (!SOLID.has(ch) || ch === '=')) grid[ty][tx] = '#'; }
    }
  }
  function fitArena(clean) {
    const L = G.L, ar = L && L.arena; if (!ar) return;
    if (ar.x0orig == null) ar.x0orig = ar.x0;
    const want = Math.max(0, Math.min(ar.x0orig, L.w * 16 - G.W));
    if (want < ar.x0orig && (ar.prep == null || want < ar.prep)) {
      const tx0 = Math.floor(want / 16), tx1 = ar.x0orig / 16 - 1;
      arenaGround(L.g, tx0, tx1); if (ar.snap) arenaGround(ar.snap.tiles, tx0, tx1);
      ar.prep = want;
    }
    if (clean && want < ar.x0orig) {
      const inside = (x, w) => x + (w || 0) > want && x < ar.x0orig;
      for (const e of L.ents) if (!e.npc && !e.dead && (e.harm || e.kind === 'crusher') && !e.collect && inside(e.x, e.w)) e.dead = true; // só inimigos; itens e contracheques ficam
      L.movers = L.movers.filter(m => !inside(m.x, m.w));
      L.bridges = (L.bridges || []).filter(b => !inside(b.x * 16, 16));
    }
    ar.x0 = want;
    if (ar.locked) L.wallL = want;
  }
  G.fitArena = fitArena;
  function respawnBoss() {
    const L = G.L, h = G.hero;
    // reseta a arena: tira tudo o que o chefe criou (inimigos, plataformas, itens, blocos) antes de recomeçar
    if (L.boss && L.boss.cleanup) try { L.boss.cleanup(G); } catch (e) {}
    const sn = L.arena.snap;
    if (sn) {
      L.ents = L.ents.slice(0, sn.ents); L.movers = L.movers.slice(0, sn.movers); L.items = L.items.slice(0, sn.items);
      L.g = sn.tiles.map(r => r.slice()); L.crumble = []; L.bumps = [];
      L.drawTile = L.drawTile0 || L.drawTile; L.onBump = L.onBump0 || null;
    }
    L.fx.length = 0;
    L.hazards.length = 0; L.shots.length = 0; L.pull = 0;
    L.boss = SL.Bosses.make(L.bossList[L.bossIdx], G, L.arena);
    Object.assign(h, newHero(L.arena.x0 + 24, 0)); h.y = groundY(h.x) - h.h; h.inv = 60;
    L.onRespawn && L.onRespawn(G);
    clearDpad(L.arena.cam(G)); h.inv = 60;
    bossIntro(true);
  }
  // no celular, o herói começa 10px à frente dos botões direcionais (canto esquerdo), para não ficar escondido embaixo deles
  function touchSafeX() {
    if (!G.touch) return 0;
    const sp = $('dpad').querySelectorAll('span'), r = cv.getBoundingClientRect();
    if (!sp.length || !r.width) return 0;
    const right = sp[sp.length - 1].getBoundingClientRect().right;
    if (!right) return 0;
    return Math.max(0, Math.ceil((right + 10 - r.left) * G.W / r.width));
  }
  function clearDpad(cam) {
    const h = G.hero, min = touchSafeX();
    if (!h || !min || h.x - cam >= min) return;
    h.x = cam + min; h.y = groundY(h.x) - h.h;
  }
  G.clearDpad = clearDpad; G.touchSafeX = touchSafeX;
  function groundY(px) {
    const tx = Math.floor((px + 5) / 16);
    for (let ty = 1; ty < 12; ty++) { const ch = G.tile(tx, ty); if (SOLID.has(ch) || ONEWAY.has(ch)) return ty * 16; }
    return 160;
  }
  G.groundY = groundY;

  /* ---------- o povo te levanta ---------- */
  let povo = null;
  function povoStart() { povo = { t: 0 }; G.setState('povo'); A.play('povo'); }
  function povoStep() {
    povo.t++;
    if (povo.t === 120) { G.big(C.povo, true); G.save.lives = 13; G.persist(); hudDirty = true; A.sfx('life'); }
    if (povo.t > 300 || (povo.t > 140 && G.pr.J)) { G.big('', false); povo = null; A.play(G.L.music); respawn(); }
  }
  function povoDraw() {
    const W = G.W, t = povo.t;
    ctx.fillStyle = `rgba(6,6,22,${Math.min(.85, t / 40)})`; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, gy = 150;
    const crowd = SL.Scenes.crowd();
    crowd.forEach((p, i) => {
      const side = i % 2 ? 1 : -1, slot = Math.floor(i / 2);
      const tx = cx + side * (14 + slot * 13);
      const sx = side < 0 ? -20 - slot * 16 : W + 20 + slot * 16;
      const k = Math.min(1, t / 100);
      const x = sx + (tx - sx) * k;
      SL.drawSprite(ctx, p.child ? SL.npcChild(p) : SL.npc(p), k < 1 ? (Math.floor(t / 8) % 2 ? 'walk' : 'stand') : (t > 120 ? 'jump' : 'stand'), -side, x - 7, gy - (p.child ? 14 : 20));
    });
    const lift = t > 100 ? Math.min(8, (t - 100) / 3) : 0;
    const sp = SL.S[G.L.lula];
    // braços da multidão levantando o Lula
    if (lift > 0) { D.r(ctx, cx - 12, gy - 18 - lift / 2, 5, 2, '#c8875a'); D.r(ctx, cx + 7, gy - 18 - lift / 2, 5, 2, '#a0663e'); }
    SL.drawSprite(ctx, sp, lift > 0 ? 'jump' : 'stand', 1, cx - 7, gy - 20 - lift);
  }

  /* ================= fases ================= */
  function clampCam(x) { const L = G.L; return Math.max(0, Math.min(L.w * 16 - G.W, x)); }
  G.clampCam = clampCam;

  function startPhase(n, skipCut) {
    A.overrideOff();
    const L = SL.Levels.build(n, G);
    L.n = n; L.t = 0;
    L.ents = L.ents || []; L.items = L.items || []; L.targets = L.targets || []; L.movers = L.movers || [];
    L.hazards = []; L.shots = []; L.fx = []; L.bumps = []; L.cps = L.cps || [];
    L.bossIdx = 0; L.boss = null; L.boneLost = false;
    L.drawTile0 = L.drawTile; L.onBump0 = L.onBump;
    L.bridges = [];
    if (L.g) for (let y = 0; y < L.g.length; y++) if (L.g[y]) for (let x = 0; x < L.g[y].length; x++) if (L.g[y][x] === '=') L.bridges.push({ x, y });
    G.L = L; hudKey = ''; hudDirty = true;
    G.hero = newHero(L.start.x, 0); G.hero.y = groundY(L.start.x) - 18;
    G.cam = clampCam(G.hero.x - G.W * .4);
    clearDpad(G.cam);
    hudDirty = true;
    const goMission = () => {
      A.play(L.music);
      const ph = C.fases[n];
      G.dialog([{ tag: C.missao.etiqueta, title: `FASE ${n} · ${ph.nome}`, body: ph.abertura, cmd: ph.comando }], () => {
        clearDpad(G.cam);
        G.setState('play');
        L.onStart && L.onStart(G);
      }, 'play');
    };
    if (skipCut) goMission();
    else G.cutscene(SL.Scenes.cut(n), goMission);
  }
  G.startPhase = startPhase;

  function bossIntro(short) {
    const L = G.L, b = L.boss;
    b.active = true;
    G.intro = { t: short ? 120 : 0 };
    const dica = C.chefeDicas[L.bossList[L.bossIdx]];
    $('banner').innerHTML = `<div class="bname">${esc(b.name)}</div>` + (dica ? `<div class="btip">${esc(G.tk(dica))}</div><div class="bgo">${esc(G.tk(C.missao.continuar))}</div>` : '');
    show('banner', true);
    A.play('suspense'); A.sfx('boss');
    G.setState('bossintro');
  }
  G.bossIntro = bossIntro;
  G.nextBoss = function () {
    const L = G.L;
    if (L.bossIdx < L.bossList.length - 1) {
      L.bossIdx++;
      L.boss = SL.Bosses.make(L.bossList[L.bossIdx], G, L.arena);
      L.hazards.length = 0;
      bossIntro();
    } else levelClear();
  };

  function levelClear() {
    const L = G.L;
    if (L.cleared) return; L.cleared = true;
    A.overrideOff(); G.hero.star = 0;
    G.setState('clear'); G.clearT = 0;
    G.big(C.concluida, true); A.play(null); A.sfx('clear');
  }
  G.levelClear = levelClear;
  function clearStep() {
    G.clearT++;
    // Ato 1: com a vitória, as cores e a música normais voltam
    const LL = G.L;
    if (LL.musicOk && G.clearT === 25) { A.play(LL.musicOk); G.toast(C.normalidade, 110); }
    if (LL.gloom > 0 && G.clearT > 20) {
      LL.gloom = Math.max(0, LL.gloom - 1 / 80);
      if (G.clearT % 4 === 0) G.burst(G.cam + Math.random() * G.W, 20 + Math.random() * 120, ['#ffd21f', '#3ec04a', '#ffffff', '#d8322c'][G.clearT % 16 / 4 | 0], 3);
    }
    // herói comemora no lugar
    const h = G.hero; h.vx = 0;
    if (G.clearT === 30 && h.on) h.vy = -3;
    h.vy = Math.min(h.vy + .34, 5.5); const r = G.move(h, 0, h.vy); if (r.land) { h.vy = 0; h.on = true; }
    if (G.clearT >= (LL.musicOk ? 170 : 90)) {
      G.big('', false); LL.gloom = 0;
      const n = G.L.n;
      if (n === 3 && !G.save.bone) {
        G.save.bone = true; G.persist();
        G.itemDone = () => showResult(n);
        const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 40; cvs.className = 'item-ic';
        const bc = cvs.getContext('2d'); bc.imageSmoothingEnabled = false;
        // bandeira do Brasil grande (a capa do Lula)
        D.flagIcon(bc, 4, 4, 56, 32);
        $('roll').innerHTML = `<div class="go-tag">PRÊMIO</div><div id="boneIc"></div><div class="go-big">${esc(C.bone.tela)}</div><div class="go-hint">${esc(G.tk(C.missao.continuar))}</div>`;
        $('boneIc').appendChild(cvs);
        cardMode = 'item'; G.setState('item');
        return;
      }
      showResult(n);
    }
  }
  function showResult(n) {
    const ph = C.fases[n];
    A.play('win');
    G.dialog([{
      tag: C.concluida.replace('!', ''), tagClass: 'fact', title: `FASE ${n} · ${ph.nome}`, body: ph.final,
      score: ph.placar ? `${ph.placar[0]} · ${ph.placar[1]}` : null, src: ph.fontes, next: C.resultado.voltar
    }], () => afterPhase(n), 'play');
  }
  function afterPhase(n) {
    const first = !G.save.won[n];
    G.save.won[n] = true; G.save.node = n; G.persist();
    G.L = null;
    if (n === 4 && !G.save.act2) return placarAto1();
    if (n === 13 && first) return SL.Scenes.urna(G);
    if (n === 13) G.save.node = 14;
    if (first && n < 13 && n !== 4) G.save.node = n + 1;
    G.persist();
    goMap();
  }

  function goMap() {
    G.L = null;
    G.save.act = G.save.node >= 5 ? 2 : 1;
    A.play(G.save.act === 2 ? 'map2' : 'map1');
    G.setState('map');
    SL.Map.enter(G);
  }
  G.goMap = goMap;

  /* ---------- Placar do Ato 1 ---------- */
  function placarAto1() {
    const P = C.placarAto1;
    let h = `<div class="tag fact">PLACAR · ATO 1</div><h2>${esc(P.titulo)}</h2><div class="stats">`;
    h += P.colunas.map((c, i) => `<div class="hd${i ? ' v' : ''}" style="animation-delay:0s">${esc(c)}</div>`).join('');
    P.linhas.forEach((l, i) => {
      const d = (0.6 + i * 0.6).toFixed(1) + 's';
      h += `<div style="animation-delay:${d}">${esc(l[0])}</div><div class="o" style="animation-delay:${d}">${esc(l[1])}</div><div class="v" style="animation-delay:${d}">${esc(l[2])}</div>`;
    });
    h += `</div><div class="src">${esc(P.rodape)}</div><div class="row"><button class="btn alt" id="bShare">${esc(P.compartilhar)} (${G.touch ? 'B' : 'X'})</button><button class="btn" id="bCont">${esc(P.continuar)} (${G.touch ? 'A' : 'Z'})</button></div>`;
    $('dlg').innerHTML = h; $('dlg').scrollTop = 0;
    G.setState('placar'); A.play('win');
    $('bShare').onclick = () => share('placar');
    $('bCont').onclick = () => placarCont();
  }
  G.placarAto1 = placarAto1;
  function placarCont() {
    if (G.state !== 'placar') return;
    G.cutscene(SL.Scenes.condenacao(), () => { G.save.act2 = true; G.save.act = 2; G.save.node = 5; G.persist(); ato2Cartela(); }, true);
  }
  G.placarCont = placarCont;
  // cartela de entrada do Ato 2: a névoa do retrocesso volta a ameaçar o país
  function ato2Cartela() {
    const K = C.ato2Cartela; G.L = null; G.fogCard = { t: 0 };
    G.itemDone = () => { G.fogCard = null; goMap(); };
    card(`<div class="go-tag">${esc(K.tag)}</div><div class="go-head">${esc(K.titulo)}</div><div class="go-sub">${esc(K.texto)}</div><div class="go-hint">${esc(G.tk(C.missao.continuar))}</div>`, 'item');
    A.play('suspense');
  }
  G.ato2Cartela = ato2Cartela;

  /* ---------- cutscene ---------- */
  let cut = null;
  G.cutscene = function (frames, done, long) {
    if (!frames || !frames.length) { done(); return; }
    cut = { frames, i: 0, t: 0, done, long };
    $('cutcap').classList.toggle('long', !!long);
    G.setState('cut'); setCap();
    if (long) A.play('suspense');
  };
  function setCap() { const f = cut.frames[cut.i]; $('cutcap').textContent = f.cap || ''; $('cutcap').hidden = !f.cap; }
  G.cutSkip = () => { if (!cut) return; const d = cut.done; cut = null; d(); };
  function cutStep() {
    cut.t++;
    const f = cut.frames[cut.i], dur = f.dur || 200;
    if (cut.t >= dur || G.pr.J) {
      if (cut.i < cut.frames.length - 1) { cut.i++; cut.t = 0; setCap(); A.sfx('sel'); }
      else G.cutSkip();
    }
  }

  /* ---------- pausa ---------- */
  function pauseOpen() {
    if (G.state !== 'play') return;
    $('pTitle').textContent = C.pausa.titulo;
    $('pLine').textContent = G.touch ? C.pausa.linhaToque : C.pausa.linha;
    $('pCont').textContent = G.touch ? 'A ▶' : 'Z ▶';
    $('pMap').textContent = (G.touch ? 'B' : 'X') + ' MAPA';
    $('pSom').textContent = C.pausa.som + (A.muted ? ' · OFF' : ' · ON');
    G.setState('pause');
  }
  $('pCont').onclick = () => { if (G.state === 'pause') G.setState('play'); };
  $('pMap').onclick = () => { if (G.state === 'pause') { A.overrideOff(); goMap(); } };
  $('pSom').onclick = () => { A.toggle(); $('pSom').textContent = C.pausa.som + (A.muted ? ' · OFF' : ' · ON'); };

  /* ================= compartilhar (card 9:16) ================= */
  function share(kind) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0b0f2e'); g.addColorStop(1, '#2a2a5e');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    // chão e Lula
    x.fillStyle = '#9ccc3c'; x.fillRect(0, 1620, 1080, 30); x.fillStyle = '#c2703a'; x.fillRect(0, 1650, 1080, 270);
    const sp = SL.S[kind === 'placar' ? 'lula_ato1' : 'lula_ato2'];
    x.drawImage(sp.jump[0], 440, 1380, 14 * 14, 20 * 14);
    const font = (s) => `${s}px "Press Start 2P", monospace`;
    const colors = ['#e8412c', '#ffd21f', '#17a34a', '#2449c9'];
    x.textAlign = 'center'; x.textBaseline = 'top';
    x.textAlign = 'center'; x.lineWidth = 12; x.strokeStyle = '#000';
    x.font = font(48); x.strokeText(C.abertura.logoTopo, 540, 110); x.fillStyle = '#fff8e7'; x.fillText(C.abertura.logoTopo, 540, 110);
    x.font = font(150); const lw = x.measureText(C.abertura.logo).width; let lx = 540 - lw / 2; x.textAlign = 'left';
    [...C.abertura.logo].forEach((ch, i) => { const w = x.measureText(ch).width; x.lineWidth = 18; x.strokeText(ch, lx, 180); x.fillStyle = colors[i % 4]; x.fillText(ch, lx, 180); lx += w; });
    x.textAlign = 'center'; x.font = font(56); x.lineWidth = 12; x.strokeText(C.abertura.subtitulo, 540, 350); x.fillStyle = '#17a34a'; x.fillText(C.abertura.subtitulo, 540, 350);
    const wrap = (s, maxW, lh, y, f, col) => {
      x.font = f; x.fillStyle = col; const words = s.split(' '); let line = '';
      for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW) { x.fillText(line, 540, y); y += lh; line = w; } else line = t; }
      if (line) { x.fillText(line, 540, y); y += lh; } return y;
    };
    let y = 470;
    if (kind === 'placar') {
      const P = C.placarAto1;
      y = wrap(P.titulo, 920, 56, y, font(34), '#ffd21f') + 40;
      x.font = '44px VT323, monospace';
      for (const l of P.linhas) {
        x.textAlign = 'left'; x.fillStyle = '#fff8e7'; x.fillText(l[0], 90, y);
        x.textAlign = 'right'; x.fillStyle = '#c8cde8'; x.fillText(l[1], 990, y);
        x.fillStyle = '#ffd21f'; x.fillText(l[2], 990, y + 44);
        y += 112;
      }
      x.textAlign = 'center';
      wrap(P.rodape, 920, 40, y + 10, '34px VT323, monospace', '#b8bde8');
    } else {
      y = wrap(C.urna.compartilhar || C.urna.texto, 900, 64, y + 40, '60px VT323, monospace', '#fff8e7');
    }
    // selo de IA
    if (C.selo) {
      x.font = font(22); const sw = x.measureText(C.selo).width + 40;
      x.fillStyle = '#8a8f99'; x.fillRect(540 - sw / 2 - 4, 1770, sw + 8, 76); x.fillStyle = '#fff'; x.fillRect(540 - sw / 2, 1774, sw, 68);
      x.fillStyle = '#1a1020'; x.fillText(C.selo, 540, 1797);
    }
    c.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'super-lula.png', { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Super Lula' }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'super-lula.png';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  }
  G.share = share;
  G.finalCard = function () {
    $('roll').innerHTML = `<canvas id="finalPrev" width="432" height="768" style="width:calc(18*var(--u));height:calc(32*var(--u));image-rendering:auto;border:calc(.3*var(--u)) solid #fff"></canvas>
      <div class="row" style="display:flex;gap:calc(2*var(--u))"><button class="btn alt" id="fShare">${esc(C.placarAto1.compartilhar)} (${G.touch ? 'B' : 'X'})</button><button class="btn" id="fMap">MAPA (${G.touch ? 'A' : 'Z'})</button></div>
      `;
    const fp = $('finalPrev'); fp.width = 432; fp.height = 768;
    const pc = fp.getContext('2d'); pc.scale(4, 4); pc.imageSmoothingEnabled = false;
    pc.fillStyle = '#0b0f2e'; pc.fillRect(0, 0, 108, 192); pc.fillStyle = '#9ccc3c'; pc.fillRect(0, 160, 108, 4); pc.fillStyle = '#c2703a'; pc.fillRect(0, 164, 108, 28);
    pc.drawImage(SL.S.lula_ato2.jump[0], 40, 136);
    D.text(pc, C.abertura.logoTopo, 54, 16, '#fff8e7', 7, 'center'); D.text(pc, C.abertura.logo, 54, 27, '#ffd21f', 14, 'center'); D.text(pc, C.abertura.subtitulo, 54, 45, '#17a34a', 8, 'center');
    D.text(pc, 'CONFIRMA', 54, 70, '#3ec04a', 7, 'center');
    $('fShare').onclick = () => share('final');
    $('fMap').onclick = () => { G.L = null; goMap(); };
    cardMode = 'final'; G.setState('final');
    A.play('urna');
  };

  /* ================= laço principal ================= */
  function step() {
    // entradas
    G.pr = Object.assign({}, pressQ); for (const k in pressQ) delete pressQ[k];
    if (G.pr.M) { A.toggle(); if (G.state === 'pause') $('pSom').textContent = C.pausa.som + (A.muted ? ' · OFF' : ' · ON'); }
    if (toastT > 0 && --toastT === 0) $('toast').hidden = true;
    G.t++;
    if (!$('rotate').hidden) return;
    switch (G.state) {
      case 'title':
        if (G.pr.J) { A.unlock(); goFullscreen(); goMap(); }
        break;
      case 'map': SL.Map.update(G); if (G.pr.P && DEBUG) {} break;
      case 'cut': cutStep(); break;
      case 'dialog': dlgStep(); if (G.L) hud(); break;
      case 'placar':
        if (G.pr.J) placarCont(); else if (G.pr.A) share('placar');
        break;
      case 'play':
        if (G.pr.P) { pauseOpen(); break; }
        worldStep();
        break;
      case 'bossintro':
        G.intro.t++;
        updFx(); hud();
        if (G.intro.t > 360 || (G.intro.t > 50 && G.pr.J)) { show('banner', false); A.play('boss'); G.setState('play'); }
        break;
      case 'dying': dyingStep(); break;
      case 'card': case 'item': case 'final': cardStep(); break;
      case 'clear': clearStep(); G.L.t++; updFx(); break;
      case 'povo': povoStep(); break;
      case 'pause':
        if (G.pr.J || G.pr.P) G.setState('play');
        else if (G.pr.A) { A.overrideOff(); goMap(); }
        break;
      case 'urna': case 'credits': SL.Scenes.urnaStep(G); break;
    }
  }

  function worldStep() {
    const L = G.L, h = G.hero;
    L.t++;
    // plataformas móveis
    for (const m of L.movers) {
      const ox = m.x, oy = m.y;
      m.update(G);
      m.dx = m.x - ox; m.dy = m.y - oy;
      if (h.onMover === m) { h.x += m.dx; h.y = m.y - h.h; G.move(h, 0, 0); }
    }
    heroUpdate();
    // pontes que caem
    if (L.crumble) for (const c of L.crumble) if (--c.t === 0) { G.setTile(c.x, c.y, ' '); G.fx({ kind: 'fallblock', x: c.x * 16, y: c.y * 16, vy: 0, life: 50, col: L.theme.plat }); }
    if (L.crumble) L.crumble = L.crumble.filter(c => c.t > 0);
    // inimigos e figurantes
    for (const e of L.ents) {
      if (e.dead) continue;
      if (e.sleep !== false && Math.abs(e.x - (G.cam + G.W / 2)) > G.W + 64 && !e.always) continue;
      e.update && e.update(G);
      if (e.dead || e.npc || G.state !== 'play') continue;
      if (G.overlap(h, e)) {
        if (e.collect) { e.collect(G); continue; }
        if (h.star > 0 && e.harm && e.starKill !== false) { killEnt(e, 'star'); G.addVotes(0); continue; }
        if (e.stomp && G.stomps(e)) { if (e.stomp === 'kill') killEnt(e, 'stomp'); else e.onStomp && e.onStomp(G); G.bounce(); A.sfx('stomp'); continue; }
        if (e.platform && h.vy >= 0 && h.y + h.h - h.vy <= e.y + 3) { h.y = e.y - h.h; h.vy = 0; h.on = true; continue; }
        if (e.harm) G.hurt();
      }
    }
    if (L.t % 120 === 0) L.ents = L.ents.filter(e => !e.dead);
    // itens
    updItems();
    // tiros do herói
    updShots();
    // perigos
    for (const z of L.hazards) {
      if (z.dead) continue;
      if (z.update) z.update(G, z);
      else { z.vy += z.g; z.x += z.vx; z.y += z.vy; }
      if (z.solidDie && G.solidAt(z.x + z.w / 2, z.y + z.h)) { z.dead = true; z.onDie && z.onDie(G, z); }
      if (--z.life <= 0 || z.y > 220 || z.x < G.cam - 80 || z.x > G.cam + G.W + 80) z.dead = true;
      if (!z.dead && z.harm && G.state === 'play' && G.overlap(h, z)) {
        if (z.stompable && G.stomps(z)) { z.dead = true; G.bounce(); A.sfx('stomp'); }
        else G.hurt();
      }
      if (z.shootable) { const s = G.shotIn(z, z.shootable); if (s) { z.dead = true; z.onShot && z.onShot(G, z, s); } }
    }
    L.hazards = L.hazards.filter(z => !z.dead);
    // alvos (objetivo)
    for (const t of L.targets) {
      t.update && t.update(G);
      if (t.done) continue;
      if (t.accept.includes('touch') && G.overlap(h, t) && (!t.canTouch || t.canTouch(G))) t.hit(G, 'touch');
      else if (t.accept.includes('stomp') && G.stomps(t)) { t.hit(G, 'stomp'); G.bounce(); }
    }
    // chefe
    if (L.boss && L.boss.active) L.boss.update(G);
    L.update && L.update(G);
    updFx();
    // checkpoints
    for (const cp of L.cps) if (!cp.on && h.x > cp.x) { cp.on = true; L.cpX = cp.x; A.sfx('gate'); }
    // meta
    if (L.goalX != null && h.x > L.goalX && !L.cleared) { L.onGoal ? L.onGoal(G) : levelClear(); }
    // arena do chefe
    if (L.arena && !L.arena.locked && h.x > L.arena.x0 + 24 && (!L.arenaNeed || L.arenaNeed(G))) {
      L.arena.locked = true; fitArena(true); L.wallL = L.arena.x0; L.wallR = L.arena.x1;
      L.hazards.length = 0;
      // retrato da arena antes da luta, para resetar tudo ao voltar no chefão
      L.arena.snap = { ents: L.ents.length, movers: L.movers.length, items: L.items.length, tiles: L.g.map(r => r.slice()) };
      L.boss = SL.Bosses.make(L.bossList[0], G, L.arena);
      bossIntro();
    }
    // buraco
    if (h.y > 200 && G.state === 'play') {
      if (G.dbg.inv) { h.y = 0; h.vy = 0; }
      else if (h.mount) { dismount(); tropeco(true); }
      else tropeco(true);
    }
    // câmera
    camera();
    if (G.state === 'play') hud();
  }

  function camera() {
    const L = G.L, h = G.hero;
    if (L.arena && L.arena.locked) { fitArena(false); G.cam += (L.arena.cam(G) - G.cam) * .15; return; }
    if (L.autoscroll && L.autoscroll(G)) return;
    h.look = (h.look || 0) + ((h.face * 18) - (h.look || 0)) * .04;
    const target = clampCam(h.x + h.w / 2 - G.W * .42 + h.look);
    G.cam += (target - G.cam) * .2;
    G.cam = clampCam(G.cam);
  }

  function updItems() {
    const L = G.L, h = G.hero;
    for (const it of L.items) {
      if (it.dead) continue;
      if (it.rise > 0) { it.y -= 1; it.rise--; continue; }
      if (it.kind === 'coin') {
        if (G.overlap(h, it)) { it.dead = true; G.addVotes(1); A.sfx('coin'); L.onCoin && L.onCoin(G, it); }
        continue;
      }
      if (it.phys) {
        if (it.kind === 'picanha' || it.kind === 'flag') it.vx = it.vx || .7;
        if (it.kind === 'star') { it.vx = it.vx || 1.2; }
        if (it.kind === 'alckmin') it.vx = it.vx || .6;
        it.vy = Math.min(it.vy + .3, 5);
        const r = G.move(it, it.vx, it.vy);
        if (r.wall) it.vx = -it.vx;
        if (r.land) { it.vy = it.kind === 'star' ? -3.5 : 0; }
        if (it.y > 210) it.dead = true;
        it.anim = (it.anim || 0) + Math.abs(it.vx);
      }
      if (it.dead || !G.overlap(h, it)) continue;
      if (it.kind === 'picanha') {
        it.dead = true; G.save.lives++; hudDirty = true; A.sfx('bite'); A.sfx('life');
        G.balloon(C.picanha, h, 120);
      } else if (it.kind === 'flag') {
        it.dead = true; G.save.bone = true; G.persist(); A.sfx('life'); G.toast(C.bone.pega || 'BANDEIRA DO BRASIL', 120);
      } else if (it.kind === 'star') {
        it.dead = true; h.star = 600; A.sfx('star'); A.overrideOn('star');
      } else if (it.kind === 'alckmin' && !h.mount) {
        it.dead = true; h.mount = true; h.y -= 10; h.h = 28; A.sfx('mount');
        if (it.firstTalk && !G.save.alck) {
          G.save.alck = 1; G.persist();
          G.fx({ kind: 'alckseq', life: 200 });
        }
      } else if (it.onTouch) it.onTouch(G, it);
    }
    L.items = L.items.filter(i => !i.dead);
  }

  function updShots() {
    const L = G.L;
    for (const s of L.shots) {
      if (s.dead) continue;
      s.vy += s.g; s.x += s.vx; s.y += s.vy;
      if (--s.life <= 0 || s.x < G.cam - 20 || s.x > G.cam + G.W + 20 || s.y > 200) { s.dead = true; continue; }
      // alvos
      let hit = false;
      for (const t of L.targets) {
        if (t.done || !t.accept.includes(s.kind) || !G.overlap(s, t)) continue;
        if (t.canShot && !t.canShot(G, s)) continue;
        t.hit(G, s.kind, s); s.dead = true; hit = true; burst(s.x, s.y, s.col, 5); break;
      }
      if (hit) continue;
      // inimigos
      for (const e of L.ents) {
        if (e.dead || e.npc || !e.shot || !G.overlap(s, e)) continue;
        if (Array.isArray(e.shot) && !e.shot.includes(s.kind)) continue;
        s.dead = true; burst(s.x, s.y, s.col, 5);
        if (e.onShot) e.onShot(G, s); else killEnt(e, 'shot');
        hit = true; break;
      }
      if (hit) continue;
      // parede
      const tx = Math.floor((s.x + s.w / 2) / 16), ty = Math.floor((s.y + s.h / 2) / 16);
      const ch = G.tile(tx, ty);
      if (SOLID.has(ch) && !(s.kind === 'card' && ch === 'W')) {
        s.dead = true; burst(s.x + s.w / 2, s.y + s.h / 2, s.col, 4);
        L.onShotTile && L.onShotTile(G, s, tx, ty, ch);
      }
    }
    L.shots = L.shots.filter(s => !s.dead);
  }

  function updFx() {
    const L = G.L; if (!L) return;
    for (const f of L.fx) {
      f.f++; f.life--;
      if (f.kind === 'part' || f.kind === 'capefly') { f.vy += .2; f.x += f.vx; f.y += f.vy; }
      if (f.kind === 'pop') f.y -= .5;
      if (f.kind === 'coinpop') f.y -= f.f < 12 ? 2 : -2;
      if (f.kind === 'fallblock') { f.vy += .3; f.y += f.vy; }
      if (f.kind === 'alckleave') { if (f.f > 70) f.x += -f.face * 1; }
      if (f.kind === 'alckseq' && f.f === 20) { G.toast(C.alckmin.legenda, 180); G.balloon(C.alckmin.fala2, G.hero, 180, -2); }
      f.upd && f.upd(G, f);
    }
    L.fx = L.fx.filter(f => f.life > 0);
  }

  /* ================= desenho ================= */
  // camada DOM de texto do motor (nítida em qualquer escala)
  const tl = $('tl'); const tlPool = [];
  function flushText() {
    const q = SL.TQ, sc = cv.getBoundingClientRect().width / G.W || 1;
    for (let i = 0; i < q.length; i++) {
      let el = tlPool[i]; if (!el) { el = document.createElement('span'); tl.appendChild(el); tlPool.push(el); }
      const t = q[i];
      if (el._s !== t.s) { el.textContent = t.s; el._s = t.s; }
      // fonte em px inteiros (mínimo 8 px, o tamanho nativo da Press Start 2P) e posição alinhada ao pixel
      const fs = Math.max(8, Math.round(t.size * sc));
      const x = Math.round(t.x * sc), y = Math.round(t.y * sc - (fs - t.size * sc) / 2);
      const st = el.style, W2 = 1200;
      st.display = ''; st.top = y + 'px'; st.fontSize = fs + 'px'; st.color = t.col; st.opacity = t.a == null ? 1 : t.a;
      if (t.align === 'center') { st.left = (x - W2 / 2) + 'px'; st.width = W2 + 'px'; st.textAlign = 'center'; }
      else if (t.align === 'right') { st.left = (x - W2) + 'px'; st.width = W2 + 'px'; st.textAlign = 'right'; }
      else { st.left = x + 'px'; st.width = ''; st.textAlign = 'left'; }
      const sh = Math.max(1, Math.round(sc * .7));
      st.textShadow = t.shadow ? `${sh}px ${sh}px 0 ${t.shadow}` : 'none';
    }
    for (let i = q.length; i < tlPool.length; i++) if (tlPool[i].style.display !== 'none') tlPool[i].style.display = 'none';
    q.length = 0;
  }
  // cabeçalho legível: se o topo da tela estiver claro, o HUD ganha uma faixa escura atrás (vale para todas as fases)
  let hudLight = false;
  function hudContrast() {
    let d; try { d = ctx.getImageData(0, 0, G.W, 14).data; } catch (e) { return; }
    let s = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 5) { s += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; n++; }
    const l = s / n / 255, on = hudLight ? l > .38 : l > .45;
    if (on !== hudLight) { hudLight = on; $('hud').classList.toggle('claro', on); }
  }
  function render() {
    SL.TQ.length = 0;
    render0();
    if (G.L && G.t % 12 === 0) hudContrast();
    flushText();
  }
  function render0() {
    const W = G.W;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const s = G.state;
    if (s === 'title' || s === 'boot') { SL.Scenes.titleDraw(ctx, G); return; }
    if (s === 'map' || (s === 'dialog' && G.dlgOver === 'map')) { SL.Map.draw(ctx, G); return; }
    if (s === 'cut' && cut) { const f = cut.frames[cut.i]; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); f.draw(ctx, cut.t, G); return; }
    if (s === 'card' && G.fogCard) { fogDraw(); return; }
    if (s === 'placar') { SL.Map.draw(ctx, G, true); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); return; }
    if (s === 'urna' || s === 'credits' || s === 'final') { SL.Scenes.urnaBg(ctx, G); return; }
    if (G.L) {
      drawWorld();
      if (s === 'bossintro') {
        ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.translate(-Math.round(G.cam), 0); G.L.boss && G.L.boss.draw(ctx, G, true); ctx.restore();
      }
      if (s === 'povo') povoDraw();
    }
  }

  function fogDraw() {
    const W = G.W, t = ++G.fogCard.t;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1528'); g.addColorStop(1, '#3a3448'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const sp = .15 + (i % 5) * .07, x = ((i * 53 + t * sp) % (W + 120)) - 60, y = 20 + ((i * 37) % 160) + Math.sin(t * .01 + i) * 6, r = 22 + (i % 4) * 9;
      ctx.fillStyle = `rgba(${150 + (i % 3) * 12},${140 + (i % 3) * 10},${165 + (i % 3) * 8},${.10 + (i % 4) * .03})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.arc(x + r * .8, y + 4, r * .7, 0, 7); ctx.fill();
    }
  }
  function drawWorld() {
    const L = G.L, W = G.W, th = L.theme;
    let shx = 0;
    if (G.shakeT > 0) { G.shakeT--; shx = (Math.random() - .5) * 4; }
    const cam = Math.round(G.cam + shx);
    // céu em 2 cores
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    L.bg && L.bg(ctx, cam, G);
    ctx.save(); ctx.translate(-cam, 0);
    L.deco && L.deco(ctx, G, cam);
    drawTiles(cam);
    if (L.gloom > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); gloomPass(L.gloom); ctx.restore(); }
    for (const cp of L.cps) D.flag(ctx, cp.x, 160 - 32, cp.on, G.t);
    if (L.goalX != null) D.goal(ctx, L.goalX, 160 - 64, G.t);
    for (const t of L.targets) t.draw(ctx, G);
    for (const m of L.movers) m.draw(ctx, G);
    for (const it of L.items) drawItem(it);
    for (const e of L.ents) if (!e.dead && e.npc && e.x > cam - 40 && e.x < cam + W + 40) e.render(ctx, G);
    for (const e of L.ents) if (!e.dead && !e.npc && e.x > cam - 60 && e.x < cam + W + 60) e.render(ctx, G);
    if (L.boss && (L.boss.active || L.boss.done)) L.boss.draw(ctx, G);
    drawHero();
    for (const s of L.shots) drawShot(s);
    for (const z of L.hazards) z.draw ? z.draw(ctx, G, z) : SL.drawHz(ctx, z, G);
    drawFx();
    if (G.dbg.box) { ctx.strokeStyle = '#0f0'; const h = G.hero; ctx.strokeRect(h.x + .5, h.y + .5, h.w, h.h); for (const e of L.ents) if (!e.dead) ctx.strokeRect(e.x + .5, e.y + .5, e.w, e.h); ctx.strokeStyle = '#f00'; for (const z of L.hazards) ctx.strokeRect(z.x + .5, z.y + .5, z.w, z.h); }
    L.fgWorld && L.fgWorld(ctx, G, cam);
    ctx.restore();
    L.fg && L.fg(ctx, cam, G);
  }

  // Ato 1: tom sombrio (dessatura e escurece o cenário; personagens e itens ficam por cima, com cor)
  function gloomPass(a) {
    const W = G.W;
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${(.75 * a).toFixed(3)})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(70,62,104,${(.6 * a).toFixed(3)})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawTiles(cam) {
    const L = G.L, th = L.theme;
    const x0 = Math.max(0, Math.floor(cam / 16)), x1 = Math.min(L.w - 1, Math.floor((cam + G.W) / 16));
    for (let ty = 0; ty < 12; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = L.g[ty][tx]; if (ch === ' ' || ch === 'W') continue;
      let x = tx * 16, y = ty * 16;
      const b = L.bumps.find(b => b.tx === tx && b.ty === ty); if (b) y -= Math.sin(b.t / 8 * Math.PI) * 4;
      drawTile(ch, x, y, tx, ty, th);
    }
    L.bumps.forEach(b => b.t--); L.bumps = L.bumps.filter(b => b.t > 0);
  }
  function drawTile(ch, x, y, tx, ty, th) {
    const c = ctx;
    switch (ch) {
      case '#': {
        const above = G.tile(tx, ty - 1);
        D.r(c, x, y, 16, 16, th.fill);
        const dt = (tx * 7 + ty * 13) % 5;
        D.r(c, x + 3 + dt, y + 6, 2, 2, th.dot); D.r(c, x + 11 - dt, y + 12, 2, 2, th.dot);
        if (above !== '#') { D.r(c, x, y, 16, 4, th.top); D.r(c, x, y + 4, 16, 1, SL.shade(th.top, -.3)); }
        break;
      }
      case 'X': case 'P': D.box(c, x, y, 16, 16, ch === 'P' ? '#9aa0aa' : th.block); D.r(c, x + 2, y + 2, 12, 2, SL.shade(ch === 'P' ? '#9aa0aa' : th.block, .25));
        if (ch === 'P') { D.r(c, x + 5, y + 6, 1, 4, '#5a5f68'); D.r(c, x + 6, y + 9, 3, 1, '#5a5f68'); } break;
      case 'B': D.r(c, x, y, 16, 16, '#1a1020'); D.r(c, x, y + 1, 16, 7, th.brick); D.r(c, x, y + 9, 16, 6, th.brick);
        D.r(c, x + 7, y + 1, 1, 7, '#1a1020'); D.r(c, x + 3, y + 9, 1, 6, '#1a1020'); D.r(c, x + 12, y + 9, 1, 6, '#1a1020'); break;
      case '?': { const f = Math.floor(G.t / 10) % 4 === 3; D.box(c, x, y, 16, 16, f ? '#ffe37a' : '#ffd21f'); D.r(c, x + 2, y + 2, 1, 1, '#c89400'); D.r(c, x + 13, y + 2, 1, 1, '#c89400');
        D.r(c, x + 5, y + 3, 6, 2, '#c45a00'); D.r(c, x + 9, y + 5, 2, 3, '#c45a00'); D.r(c, x + 7, y + 8, 2, 2, '#c45a00'); D.r(c, x + 7, y + 11, 2, 2, '#c45a00'); break; }
      case 'U': D.box(c, x, y, 16, 16, '#8a5a30'); D.r(c, x + 2, y + 2, 1, 1, '#5a3a1a'); D.r(c, x + 13, y + 13, 1, 1, '#5a3a1a'); break;
      case 'V': D.box(c, x, y, 16, 16, '#b07a3a'); D.r(c, x + 1, y + 5, 14, 1, '#7a4a20'); D.r(c, x + 1, y + 10, 14, 1, '#7a4a20');
        D.r(c, x + 1, y + 5, 14, 6, '#d8a050'); D.text(c, 'VICE', x + 8, y + 5.5, '#1a1020', 4, 'center', false); break;
      case '-': D.r(c, x, y, 16, 6, '#1a1020'); D.r(c, x, y + 1, 16, 4, th.plat); D.r(c, x, y + 1, 16, 1, SL.shade(th.plat, .3)); break;
      case 'C': D.r(c, x - 1, y, 18, 7, '#1a5a24'); D.r(c, x, y + 1, 16, 5, '#2f8a3a'); D.r(c, x + 3, y + 2, 3, 2, '#5ac85a'); D.r(c, x + 10, y + 2, 3, 2, '#5ac85a'); break;
      case '>': case '<': { D.box(c, x, y, 16, 16, '#3a3d45'); const o = Math.floor(G.t / 4) % 8 * (ch === '>' ? 1 : -1); for (let i = -1; i < 3; i++) { const ax = x + ((i * 8 + o + 64) % 16); D.r(c, ax, y + 4, 3, 2, '#e8c040'); } D.r(c, x, y + 10, 16, 2, '#1a1020'); break; }
      case '=': D.r(c, x, y, 16, 6, '#1a1020'); D.r(c, x, y + 1, 16, 4, '#c8a06a'); for (let i = 0; i < 16; i += 4) D.r(c, x + i, y + 1, 1, 4, '#8a6a3a'); break;
      case 'G': D.r(c, x + 2, y, 3, 16, '#5a5f68'); D.r(c, x + 7, y, 3, 16, '#5a5f68'); D.r(c, x + 12, y, 3, 16, '#5a5f68'); D.r(c, x, y + 6, 16, 2, '#3a3d45'); break;
      case 'D': D.box(c, x, y, 16, 16, '#dfe4ea'); D.r(c, x + 3, y + 3, 10, 10, '#9ad0c0'); break;
      case 'T': if (!G.L.conts) D.box(c, x, y, 16, 16, th.block); break;
      case 'I': if (G.L.litTile && G.L.litTile(tx, ty)) { D.r(c, x, y, 16, 6, '#1a1020'); D.r(c, x, y + 1, 16, 4, '#ffe37a'); } else { D.r(c, x + 2, y + 2, 2, 1, 'rgba(255,255,255,.15)'); } break;
      default: if (G.L.drawTile) G.L.drawTile(c, ch, x, y, tx, ty);
    }
  }

  function drawItem(it) {
    const c = ctx;
    if (it.kind === 'coin') return D.coin(c, it.x, it.y, G.t + it.x, G.L.altCoin);
    if (it.kind === 'picanha') return D.picanha(c, it.x, it.y);
    if (it.kind === 'flag') { D.r(c, it.x, it.y - 2, 1, 14, '#5a3a24'); return D.flagIcon(c, it.x + 1, it.y - 2, 13, 9); }
    if (it.kind === 'star') return D.star(c, it.x, it.y, G.t);
    if (it.kind === 'alckmin') return SL.drawSprite(c, SL.S.alckmin, Math.floor((it.anim || 0) / 8) % 2 ? 'walk' : 'stand', it.vx >= 0 ? 1 : -1, it.x - 2, it.y - 2);
    if (it.draw) it.draw(c, G, it);
  }

  function drawHero() {
    const h = G.hero; if (!h) return;
    const sp = G.spriteFor();
    let pose = 'stand';
    if (!h.on) pose = 'jump'; else if (Math.abs(h.vx) > .1 && Math.floor(h.anim / 8) % 2) pose = 'walk';
    if (G.state === 'dying') pose = 'jump';
    const yOff = h.mount ? -2 : -2;
    // capa da bandeira do Brasil (prêmio da fase 3), atrás do Lula
    if (G.save.bone && !(h.inv > 0 && Math.floor(G.t / 4) % 2 === 0)) D.cape(ctx, h.x - 2, h.y + yOff + 9, h.face, G.t, h.vx); // ombros = linha 9 do sprite
    SL.drawSprite(ctx, sp, pose, h.face, h.x - (h.mount ? 3 : 2), h.y + yOff);
    // lanterna
    if (h.lantern) {
      const ox = h.x + h.w / 2 + h.face * 5, oy = h.y + 9;
      ctx.fillStyle = 'rgba(255,240,160,.28)';
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + h.face * 84, oy - 30); ctx.lineTo(ox + h.face * 84, oy + 30); ctx.closePath(); ctx.fill();
      D.r(ctx, ox - 2, oy - 1, 4, 3, '#ffd21f');
    }
    // item de ação na mão
    const L = G.L;
    if (L.handItem && G.state === 'play') L.handItem(ctx, G, h);
  }
  // cone da lanterna: ponto iluminado?
  G.lit = function (px, py) {
    const h = G.hero; if (!h || !h.lantern) return false;
    const ox = h.x + h.w / 2 + h.face * 5, oy = h.y + 9;
    const dx = (px - ox) * h.face; if (dx < 0 || dx > 88) return false;
    return Math.abs(py - oy) <= 6 + dx * .36;
  };

  function drawShot(s) {
    const c = ctx;
    if (s.skin === 'constituicao') D.constSmall(c, s.x, s.y);
    else if (s.kind === 'ink') { D.r(c, s.x, s.y, 6, 4, '#1a1020'); D.r(c, s.x + 1, s.y + 1, 4, 2, '#2a5adf'); D.r(c, s.x + (s.vx > 0 ? 3 : 1), s.y + 1, 1, 1, '#9fd3f5'); }
    else if (s.kind === 'card') { D.r(c, s.x, s.y, 8, 6, '#1a1020'); D.r(c, s.x + 1, s.y + 1, 6, 4, '#2449c9'); D.r(c, s.x + 2, s.y + 2, 4, 1, '#ffd21f'); }
    else if (s.kind === 'bandeirinha') { // bandeirinha do Brasil
      const fx = s.vx > 0 ? s.x : s.x + 1; D.r(c, s.vx > 0 ? s.x : s.x + 8, s.y, 1, 7, '#5a3a24');
      D.flagIcon(c, s.vx > 0 ? s.x + 1 : s.x, s.y - 1, 8, 6); }
    else if (s.kind === 'bolsa') { // cartão do Bolsa Família (genérico, sem logotipo)
      D.r(c, s.x, s.y, 10, 7, '#1a1020'); D.r(c, s.x + 1, s.y + 1, 8, 5, '#2fae4f'); D.r(c, s.x + 1, s.y + 4, 8, 1, '#ffd21f'); D.r(c, s.x + 2, s.y + 2, 2, 1, '#ffd21f'); }
    else if (s.kind === 'med') { D.r(c, s.x, s.y, 8, 7, '#1a1020'); D.r(c, s.x + 1, s.y + 1, 6, 5, '#ffffff'); D.r(c, s.x + 3, s.y + 2, 2, 3, '#20aba6'); D.r(c, s.x + 2, s.y + 3, 4, 1, '#20aba6'); }
  }

  function drawFx() {
    const L = G.L, c = ctx;
    for (const f of L.fx) {
      switch (f.kind) {
        case 'part': D.r(c, f.x, f.y, f.sz || 2, f.sz || 2, f.col); break;
        case 'pop': D.text(c, f.s, f.x, f.y, f.col, 5, 'center'); break;
        case 'coinpop': D.coin(c, f.x, f.y, f.f * 3); break;
        case 'fallblock': D.r(c, f.x, f.y, 16, 6, '#1a1020'); D.r(c, f.x, f.y + 1, 16, 4, f.col); break;
        case 'squash': if (f.draw && f.draw.renderSquash) f.draw.renderSquash(c, G, f); else { D.r(c, f.x, f.y + f.h - 4, f.w, 4, '#1a1020'); D.r(c, f.x + 1, f.y + f.h - 3, f.w - 2, 2, '#9aa0aa'); } break;
        case 'balloon': { const w = f.who; if (!w || (w.dead && w !== G.hero)) break; D.balloon(c, f.text, w.x + (w.w || 10) / 2, w.y + f.dy, { minX: G.cam, maxX: G.cam + G.W }); break; }
        case 'capefly': c.save(); c.translate(f.x + 6, f.y + 4); c.rotate(f.f * .15 * Math.sign(f.vx || 1)); D.flagIcon(c, -7, -5, 14, 10); c.restore(); break;
        case 'alckleave': {
          const fr = f.f;
          const pose = fr < 25 ? 'jump' : (fr > 70 ? (Math.floor(fr / 8) % 2 ? 'walk' : 'stand') : 'stand');
          const fy = f.y + (fr < 25 ? -Math.sin(fr / 25 * Math.PI) * 6 : 0);
          SL.drawSprite(c, SL.S.alckmin, pose, fr > 70 ? -f.face : f.face, f.x - 2, fy - 2);
          if (fr > 40 && fr < 70) D.r(c, f.x + 1, fy + 3, 10, 1, '#ffffff'); // ajeita os óculos
          if (fr > 70 && Math.floor(fr / 10) % 2) D.r(c, f.x + (f.face > 0 ? 10 : -2), fy - 4, 2, 4, '#f2b98f'); // aceno
          break;
        }
        default: f.draw && f.draw(c, G, f);
      }
    }
  }
  SL.drawHz = function (c, z, G) {
    D.r(c, z.x, z.y, z.w, z.h, '#1a1020'); D.r(c, z.x + 1, z.y + 1, z.w - 2, z.h - 2, z.col || '#e8412c');
  };

  /* ================= debug ================= */
  function debugKey(e) {
    if (e.key === 'i') { G.dbg.inv = !G.dbg.inv; G.toast('INVENCÍVEL ' + (G.dbg.inv ? 'ON' : 'OFF')); }
    if (e.key === 'h') G.dbg.box = !G.dbg.box;
    if (e.key === 'f') G.dbg.fps = !G.dbg.fps;
    if (e.key === 'n' && G.L && G.state === 'play') levelClear();
    if (e.key === 'k' && G.L && G.L.boss && G.L.boss.active) { G.L.boss.hp = 0; G.L.boss.forceDefeat && G.L.boss.forceDefeat(G); }
  }
  function buildDebug() {
    if (!DEBUG) return;
    const el = $('debug'); el.hidden = false;
    let opts = '<option value="">fase…</option>';
    for (let i = 0; i <= 13; i++) opts += `<option value="${i}">${i} · ${C.fases[i].nome}</option>`;
    opts += '<option value="placar">Placar Ato 1</option><option value="cond">Condenação</option><option value="urna">Urna</option><option value="unlock">Liberar tudo</option><option value="reset">Apagar progresso</option>';
    el.innerHTML = `<select id="dbgSel">${opts}</select><span>i invencível · h colisões · f fps · n concluir · k chefe</span><span id="dbgFps"></span>`;
    $('dbgSel').onchange = e => {
      const v = e.target.value; e.target.blur(); e.target.value = '';
      A.unlock();
      if (v === 'placar') placarAto1();
      else if (v === 'cond') G.cutscene(SL.Scenes.condenacao(), () => ato2Cartela(), true);
      else if (v === 'urna') SL.Scenes.urna(G);
      else if (v === 'unlock') { for (let i = 0; i <= 13; i++) G.save.won[i] = true; G.save.act2 = true; G.save.bone = true; G.persist(); goMap(); }
      else if (v === 'reset') { G.save = fresh(); G.persist(); G.setState('title'); }
      else if (v !== '') startPhase(+v);
    };
  }

  /* ================= início ================= */
  let last = 0, acc = 0, fpsC = 0, fpsT = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!last) last = ts;
    let dt = Math.min(100, ts - last); last = ts; acc += dt;
    let n = 0;
    while (acc >= 1000 / 60 && n < 5) { step(); acc -= 1000 / 60; n++; }
    if (n === 5) acc = 0;
    render();
    if (DEBUG && G.dbg.fps) { fpsC++; if (ts - fpsT > 1000) { $('dbgFps').textContent = fpsC + ' fps'; fpsC = 0; fpsT = ts; } }
  }
  let booted = false;
  function boot() {
    if (booted) return; booted = true;
    SL.buildSprites();
    resize(); refreshTexts(); buildDebug();
    G.setState('title');
    A.play('title');
    requestAnimationFrame(frame);
    // DEBUG: atalho ?fase=N
    const m = /[?&]fase=(\d+)/.exec(location.search); if (m && DEBUG) setTimeout(() => startPhase(+m[1], true), 50);
  }
  G.hudDirty = () => { hudDirty = true; };
  // espera as fontes locais carregarem antes de desenhar (o canvas mede o texto dos balões com elas)
  if (document.fonts && document.fonts.load) Promise.all(['8px "Press Start 2P"', '16px "VT323"'].map(f => document.fonts.load(f))).then(boot, boot); else boot();
  setTimeout(() => { if (G.state === 'boot') boot(); }, 2500);
})();
