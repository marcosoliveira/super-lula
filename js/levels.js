/* levels.js — temas de cor, construtor de fases, inimigos comuns, alvos do objetivo e as 14 fases */
(function () {
  const D = SL.D, C = SL.C;
  const K = '#1a1020';

  /* ================= temas (7 cores + extras) ================= */
  const TH = [
    { sky: ['#0b0f2e', '#2a2a5e'], top: '#c8ccd4', fill: '#9aa0aa', dot: '#848a94', brick: '#6b3a1e', block: '#6b3a1e', plat: '#c8a06a' },
    { sky: ['#ff9a6b', '#ffd9a0'], top: '#9ccc3c', fill: '#c2703a', dot: '#a4582a', brick: '#b85c38', block: '#8a6a50', plat: '#f0b44a' },
    { sky: ['#7d8ba3', '#c8d2de'], top: '#b4bac4', fill: '#8a8f99', dot: '#767b85', brick: '#9aa0aa', block: '#6f7580', plat: '#dfe4ea' },
    { sky: ['#ffb36b', '#ffe4b0'], top: '#c89a5a', fill: '#8b5a2b', dot: '#6e4420', brick: '#c8743a', block: '#9a7050', plat: '#c8743a' },
    { sky: ['#d9844a', '#ffd9a0'], top: '#2f8a3a', fill: '#5a3a24', dot: '#462c1a', brick: '#7a5a3a', block: '#7a7a80', plat: '#8a6a40' },
    { sky: ['#4a3f7a', '#c39ad0'], top: '#9aa0aa', fill: '#5a4a3a', dot: '#4a3a2d', brick: '#7a2a2a', block: '#9aa0aa', plat: '#c0302a' },
    { sky: ['#4fb2ff', '#ffe9b0'], top: '#dfe4ea', fill: '#b8bec8', dot: '#a0a6b0', brick: '#d9844a', block: '#9aa0aa', plat: '#ffcf4a' },
    { sky: ['#e8f4f0', '#cfe9e0'], top: '#c8d2de', fill: '#aab4c0', dot: '#98a2ae', brick: '#9ad0c0', block: '#9ad0c0', plat: '#ffffff' },
    { sky: ['#ffb36b', '#ffe9b0'], top: '#3ec04a', fill: '#b0703a', dot: '#8a5a2a', brick: '#e8c040', block: '#c8a030', plat: '#3ec04a' },
    { sky: ['#5aa8ff', '#bfe6ff'], top: '#d86a3a', fill: '#b8502a', dot: '#9a4020', brick: '#4a2a1a', block: '#6a3a24', plat: '#9a6a3a' },
    { sky: ['#4fb2ff', '#bfe6ff'], top: '#b4bac4', fill: '#6f7580', dot: '#5a5f68', brick: '#c0302a', block: '#2449c9', plat: '#169c3c' },
    { sky: ['#0b0f2e', '#2a2a5e'], top: '#9a9aa0', fill: '#5a4a5a', dot: '#4a3a4a', brick: '#c8743a', block: '#e8c040', plat: '#5aa8ff' },
    { sky: ['#ff9a6b', '#4a3f7a'], top: '#5a5d65', fill: '#3a3d45', dot: '#2e3138', brick: '#6cc2f1', block: '#4a90b8', plat: '#6cc2f1' },
    { sky: ['#5a5f68', '#ff9a6b'], top: '#dfe4ea', fill: '#b8bec8', dot: '#a0a6b0', brick: '#9aa0aa', block: '#8a8f99', plat: '#ffd21f' }
  ];
  SL.TH = TH;

  /* ================= fundos (formas simples) ================= */
  const BG = {};
  SL.BG = BG;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  BG.hills = (c, cam, par, y, col, seed, W) => {
    const off = cam * par;
    for (let i = Math.floor(off / 120) - 1; i < Math.floor((off + W) / 120) + 2; i++) {
      const r = 40 + rnd(i + seed) * 40, x = i * 120 + rnd(i * 3 + seed) * 50 - off;
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * .8, 0, Math.PI, 0); c.fill();
    }
  };
  // janelas: o padrão é fixo por prédio (não muda com a câmera); só ~10% delas acendem/apagam devagar ao longo da fase (t = quadro)
  BG.city = (c, cam, par, base, col, seed, W, win, t) => {
    const off = cam * par;
    for (let i = Math.floor(off / 34) - 1; i < Math.floor((off + W) / 34) + 2; i++) {
      const h = 30 + rnd(i + seed) * 60, w = 22 + rnd(i * 7 + seed) * 12, x = Math.round(i * 34 - off);
      D.r(c, x, base - h, w, h, col);
      if (!win) continue;
      let row = 0;
      for (let yy = base - h + 5; yy < base - 6; yy += 8, row++) {
        let col2 = 0;
        for (let xx = x + 4; xx < x + w - 4; xx += 6, col2++) {
          const k = i * 1013 + row * 37 + col2 * 7 + seed * 101;
          let on = rnd(k) > .45;
          if (t != null && rnd(k + .5) < .1) { const per = 400 + rnd(k + .25) * 800; if (Math.floor((t + rnd(k + .75) * per) / per) % 2) on = !on; }
          if (on) D.r(c, xx, yy, 2, 3, win);
        }
      }
    }
  };
  BG.sun = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  BG.stars = (c, W, t) => { for (let i = 0; i < 40; i++) { const x = rnd(i) * W, y = rnd(i + 99) * 110; if ((t / 20 + i) % 9 > 1) D.r(c, x, y, 1, 1, '#ffffffaa'); } };
  BG.clouds = (c, cam, W, col) => { for (let i = 0; i < 6; i++) { const x = ((i * 97 - cam * .1) % (W + 80) + W + 80) % (W + 80) - 40, y = 20 + rnd(i) * 40; D.r(c, x, y, 26, 6, col); D.r(c, x + 5, y - 4, 14, 5, col); } };
  // silhuetas de Brasília
  BG.congresso = (c, x, y, col) => { D.r(c, x, y - 40, 7, 40, col); D.r(c, x + 9, y - 40, 7, 40, col); D.r(c, x - 40, y - 6, 100, 6, col);
    c.fillStyle = col; c.beginPath(); c.ellipse(x - 22, y - 6, 12, 7, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(x + 40, y - 12, 13, 7, 0, 0, Math.PI); c.fill(); };
  BG.planalto = (c, x, y, col) => { D.r(c, x, y - 18, 90, 3, col); D.r(c, x + 4, y - 16, 82, 14, col); for (let i = 0; i < 7; i++) D.r(c, x + 2 + i * 14, y - 18, 3, 18, col); D.r(c, x - 30, y - 6, 40, 2, col); };
  BG.stf = (c, x, y, col) => { D.r(c, x, y - 14, 50, 2, col); D.r(c, x + 3, y - 12, 44, 10, col); for (let i = 0; i < 5; i++) D.r(c, x + 1 + i * 12, y - 14, 3, 14, col); };

  /* ================= construtor ================= */
  function builder(n, w) {
    const L = { n, w, g: [], qc: {}, ents: [], items: [], targets: [], movers: [], cps: [], theme: TH[n], obj: null, start: { x: 32 } };
    for (let y = 0; y < 12; y++) L.g.push(new Array(w).fill(' '));
    const set = (x, y, ch) => { if (x >= 0 && x < w && y >= 0 && y < 12) L.g[y][x] = ch; };
    const b = {
      L, set,
      g(a, z, top) { top = top == null ? 10 : top; for (let x = a; x < z; x++) for (let y = top; y < 12; y++) set(x, y, '#'); return b; },
      hole(a, z) { for (let x = a; x < z; x++) for (let y = 0; y < 12; y++) if (L.g[y][x] === '#') set(x, y, ' '); return b; },
      p(x, y, len, ch) { for (let i = 0; i < (len || 1); i++) set(x + i, y, ch || '-'); return b; },
      X(x, y, len, hh, ch) { for (let i = 0; i < (len || 1); i++) for (let j = 0; j < (hh || 1); j++) set(x + i, y + j, ch || 'X'); return b; },
      br(x, y, len) { return b.X(x, y, len, 1, 'B'); },
      q(x, y, c) { set(x, y, '?'); if (c) L.qc[x + ',' + y] = c; return b; },
      v(x, y, regen) { set(x, y, 'V'); if (regen) L.qc[x + ',' + y] = 'regen'; return b; },
      coins(x, y, n, dx) { for (let i = 0; i < (n || 1); i++) L.items.push({ kind: 'coin', x: (x + i * (dx || 1)) * 16 + 5, y: y * 16 + 2, w: 6, h: 12 }); return b; },
      stairs(x, h, dir) { dir = dir || 1; for (let i = 0; i < h; i++) for (let j = 0; j <= i; j++) set(x + i * dir, 9 - j, 'X'); return b; },
      e(kind, tx, row, o) { L.ents.push(mkE(kind, tx * 16, (row == null ? 10 : row) * 16, o || {})); return b; },
      cp(tx) { L.cps.push({ x: tx * 16, on: false }); return b; },
      goal(tx) { L.goalX = tx * 16; return b; },
      t(t) { L.targets.push(t); return b; },
      npc(o, tx, row, extra) { L.ents.push(mkNPC(o, tx * 16, (row == null ? 10 : row) * 16, extra || {})); return b; },
      m(mv) { L.movers.push(mv); return b; },
      gate(tx, top, bottom) { L.gateTiles = []; for (let y = top || 0; y <= (bottom || 9); y++) { set(tx, y, 'G'); L.gateTiles.push([tx, y]); } return b; },
      arena(bosses) {
        const x0 = w - 21;
        b.g(x0 - 1, w);
        for (let y = 0; y < 10; y++) set(w - 1, y, 'X');
        L.arena = { x0: x0 * 16, x1: (w - 1) * 16, cam: G => G.clampCam(L.w * 16 - G.W), locked: false };
        L.bossList = bosses;
        return b;
      }
    };
    return b;
  }

  /* ================= inimigos comuns ================= */
  function mkE(kind, x, feet, o) {
    const S = SKIN[kind] || SKIN.blob;
    const e = Object.assign({ kind, x, y: 0, w: S.w, h: S.h, vx: -.5, vy: 0, t: 0, harm: true, stomp: 'kill', shot: true, face: -1 }, S.def || {}, o);
    e.y = feet - e.h;
    e.y0 = e.y; e.x0 = e.x;
    e.update = (G) => { e.t++; (BEH[e.beh || S.beh || 'walk'])(e, G); };
    e.render = (c, G) => S.draw(c, e, G);
    if (S.init) S.init(e);
    return e;
  }
  SL.mkE = mkE;
  const spd = (G) => (G.L.speedMul || 1);
  const BEH = {
    walk(e, G) {
      e.vy = Math.min(e.vy + .3, 5);
      const r = G.move(e, e.vx * spd(G), e.vy);
      if (r.land) e.vy = 0;
      if (r.wall) e.vx = -e.vx;
      if (e.edge && r.land) { const fx = e.vx > 0 ? e.x + e.w + 1 : e.x - 1; if (!G.solidAt(fx, e.y + e.h + 2)) e.vx = -e.vx; }
      if (e.y > 210) e.dead = true;
      e.face = e.vx > 0 ? 1 : -1;
    },
    fly(e, G) { e.x += e.vx * spd(G); e.y = e.y0 + Math.sin(e.t * .05 + e.x0) * (e.amp == null ? 14 : e.amp); e.face = e.vx > 0 ? 1 : -1; if (e.x < G.cam - 80 && e.vx < 0 && e.respawn) { e.x = G.cam + G.W + 40; } },
    hop(e, G) {
      e.vy = Math.min(e.vy + .3, 5);
      const r = G.move(e, e.vx, e.vy);
      if (r.land) { e.vy = 0; e.vx = 0; if (--e.wait <= 0) { e.wait = e.hopWait || 70; e.vy = -(e.hopV || 4); e.vx = (G.hero.x < e.x ? -1 : 1) * (e.hopX || .9) * spd(G); } }
      if (r.wall) e.vx = -e.vx;
      if (e.y > 210) e.dead = true;
      if (e.wait == null) e.wait = 30 + (e.x % 50);
    },
    drop(e, G) {
      const h = G.hero;
      if (!e.falling) { e.y = e.y0 + Math.sin(e.t * .1) * 1; if (Math.abs(h.x - e.x) < 34 && h.y > e.y) e.falling = true; return; }
      e.vy = Math.min(e.vy + .22, 4); e.y += e.vy; e.x += Math.sin(e.t * .2) * .4;
      if (G.solidAt(e.x + e.w / 2, e.y + e.h)) { e.dead = true; G.burst(e.x + 5, e.y + 4, '#fff', 4); }
    },
    run(e, G) { // boi
      e.vy = Math.min(e.vy + .3, 5);
      const r = G.move(e, e.vx, e.vy); if (r.land) e.vy = 0;
      if (r.wall && e.jumpWall) { e.vy = -4; }
      if (e.x < G.cam - 60 || e.y > 210) e.dead = true;
    },
    roll(e, G) { e.vy = Math.min(e.vy + .3, 5); const r = G.move(e, e.vx, e.vy); if (r.land) e.vy = 0; if (r.wall) e.vx = -e.vx; if (e.y > 210) e.dead = true; e.rot = (e.rot || 0) + e.vx * .3; },
    tent(e, G) {
      const p = (e.t + (e.ph || 0)) % 200;
      let up = 0;
      if (p < 50) up = 0; else if (p < 70) up = (p - 50) / 20; else if (p < 140) up = 1; else if (p < 160) up = 1 - (p - 140) / 20;
      e.up = up; e.h = Math.max(1, Math.round(24 * up)); e.y = e.y0 + 24 - e.h; e.harm = up > .2;
    },
    crush(e, G) {
      const h = G.hero, cx = e.x + e.w / 2;
      if (e.mode == null) e.mode = 'up';
      if (e.mode === 'up' && Math.abs(h.x + 5 - cx) < 22 && h.y > e.y) { e.mode = 'fall'; e.vy = 0; }
      if (e.mode === 'fall') { e.vy = Math.min(e.vy + .5, 6); const r = G.move(e, 0, e.vy); if (r.land) { e.mode = 'rest'; e.rest = 70; G.sfx('stamp'); G.shake(4); } }
      else if (e.mode === 'rest') { if (--e.rest <= 0) e.mode = 'rise'; }
      else if (e.mode === 'rise') { e.y -= 1; if (e.y <= e.y0) { e.y = e.y0; e.mode = 'up'; } }
      e.harm = e.mode === 'fall'; e.platform = e.mode !== 'fall';
    },
    still(e, G) {},
    paper(e, G) { e.x += e.vx; e.y = e.y0 + Math.sin(e.t * .08 + e.x0) * 10; if (e.x < G.cam - 40) e.dead = true; },
    npc(e, G) {
      if (e.walkAway) { e.x += e.walkAway; e.anim = (e.anim || 0) + 1; if (e.x < G.cam - 40 || e.x > G.cam + G.W + 40) e.dead = true; }
    }
  };

  // desenhos dos inimigos (12 a 16 px, retângulos)
  const SKIN = {
    // E-01: slide voador com seta apontando para onde ele voa
    slide: { w: 14, h: 10, beh: 'fly', def: { vx: -.6, amp: 10 }, draw(c, e) {
      D.box(c, e.x, e.y, 14, 10, '#f4f2ec'); const L = e.vx < 0;
      D.r(c, e.x + (L ? 5 : 3), e.y + 4, 6, 2, '#d8322c');
      for (let k = 0; k < 3; k++) D.r(c, L ? e.x + 4 - k : e.x + 8 + k, e.y + 2 + k, 1, 6 - k * 2, '#d8322c'); } },
    // mensagem/slide que cai do teto: miniatura do slide do PowerPoint
    envelope: { w: 16, h: 12, beh: 'drop', def: { stomp: false, shot: false }, draw(c, e) { D.ppt(c, e.x, e.y, 16, 12, true); } },
    placa: {
      w: 14, h: 14, beh: 'hop', def: { shot: ['card'], hopV: 3.6 },
      draw(c, e, G) {
        if (e.worker) { SL.drawSprite(c, SL.npc(e.worker), e.walkAway ? (Math.floor(e.t / 8) % 2 ? 'walk' : 'stand') : 'jump', e.walkAway > 0 ? 1 : -1, e.x - 2, e.y - 6); return; }
        D.r(c, e.x + 6, e.y + 10, 2, 4, '#5a3a24'); D.box(c, e.x, e.y, 14, 11, '#9aa0aa'); D.r(c, e.x + 2, e.y + 4, 10, 3, '#d8322c');
      }
    },
    panela: { w: 14, h: 10, beh: 'walk', def: { vx: -.45, shot: ['bolsa'], edge: true }, draw(c, e) { const lid = Math.abs(Math.sin(e.t * .15)) * 3; D.box(c, e.x, e.y + 2, 14, 8, '#9aa3ad'); D.r(c, e.x - 2, e.y + 4, 2, 2, K); D.r(c, e.x + 14, e.y + 4, 2, 2, K); D.box(c, e.x + 1, e.y - lid, 12, 3, '#bdc3cc'); D.r(c, e.x + 6, e.y - 2 - lid, 2, 2, K); D.r(c, e.x + 3, e.y + 5, 2, 2, K); D.r(c, e.x + 9, e.y + 5, 2, 2, K); } },
    boi: { w: 22, h: 14, beh: 'run', def: { vx: -2.1, shot: false, stomp: 'bounce', starKill: true }, draw(c, e, G) {
      const lg = Math.floor(e.t / 5) % 2 * 2; D.box(c, e.x + 3, e.y + 2, 16, 8, '#8a8f99'); D.box(c, e.x - 2, e.y, 8, 7, '#9aa0aa'); D.r(c, e.x - 2, e.y - 2, 2, 3, '#f4f2ec'); D.r(c, e.x + 5, e.y - 2, 2, 3, '#f4f2ec'); D.r(c, e.x, e.y + 2, 1, 1, K);
      D.r(c, e.x + 4, e.y + 10, 2, 4 - lg / 2, K); D.r(c, e.x + 9, e.y + 10, 2, 2 + lg / 2, K); D.r(c, e.x + 13, e.y + 10, 2, 4 - lg / 2, K); D.r(c, e.x + 17, e.y + 10, 2, 2 + lg / 2, K); D.r(c, e.x + 19, e.y + 3, 3, 1, K); } },
    moto: { w: 14, h: 8, beh: 'hop', def: { shot: ['ink'], hopV: 4.2 }, draw(c, e, G) { D.box(c, e.x, e.y, 8, 8, '#f57e2c'); D.box(c, e.x + 7, e.y + 2, 7, 4, '#9aa0aa'); if (G.t % 6 < 3) { D.r(c, e.x + 13, e.y + 1, 2, 1, '#ffd21f'); D.r(c, e.x + 14, e.y + 6, 1, 1, '#ffd21f'); } D.r(c, e.x + 2, e.y + 2, 2, 2, K); } },
    gear: { w: 12, h: 12, beh: 'walk', def: { vx: -.6 }, draw(c, e) { const a = e.t * .1 * Math.sign(-e.vx || 1); c.save(); c.translate(e.x + 6, e.y + 6); c.rotate(-a); D.r(c, -6, -2, 12, 4, K); D.r(c, -2, -6, 4, 12, K); c.rotate(Math.PI / 4); D.r(c, -6, -2, 12, 4, K); D.r(c, -2, -6, 4, 12, K); c.restore(); c.fillStyle = '#9aa0aa'; c.beginPath(); c.arc(e.x + 6, e.y + 6, 4.5, 0, 7); c.fill(); D.r(c, e.x + 5, e.y + 5, 2, 2, K); } },
    notif: { w: 12, h: 12, beh: 'hop', def: { hopV: 3.8 }, draw(c, e) { D.r(c, e.x + 1, e.y, 10, 10, K); D.r(c, e.x + 2, e.y + 1, 8, 8, '#d8322c'); D.r(c, e.x + 3, e.y + 10, 3, 2, '#d8322c'); D.r(c, e.x + 5, e.y + 2, 2, 4, '#fff'); D.r(c, e.x + 5, e.y + 7, 2, 1, '#fff'); } },
    tesoura: { w: 12, h: 12, beh: 'fly', def: { vx: -1.3, amp: 0, stomp: false, shot: false, respawn: false }, draw(c, e) {
      const o = Math.floor(e.t / 4) % 2; c.save(); c.translate(e.x + 6, e.y + 6); c.rotate(e.t * .2);
      D.r(c, -6, -1 - o, 12, 2, '#5a5f68'); D.r(c, -6, -1 + o, 12, 2, '#bdc3cc'); D.r(c, -3, -4, 3, 3, '#d8322c'); D.r(c, -3, 1, 3, 3, '#d8322c'); c.restore(); } },
    pedra: { w: 12, h: 12, beh: 'roll', def: { vx: -1.1, shot: ['ink'] }, draw(c, e) { c.fillStyle = K; c.beginPath(); c.arc(e.x + 6, e.y + 6, 6, 0, 7); c.fill(); c.fillStyle = '#8a5a3a'; c.beginPath(); c.arc(e.x + 6, e.y + 6, 5, 0, 7); c.fill(); const a = e.rot || 0; D.r(c, e.x + 6 + Math.cos(a) * 2, e.y + 5 + Math.sin(a) * 2, 2, 2, '#5a3a24'); } },
    tentaculo: { w: 8, h: 24, beh: 'tent', def: { stomp: false, shot: false, vx: 0 }, draw(c, e) {
      // bueiro
      D.r(c, e.x - 4, e.y0 + 22, 16, 3, K); D.r(c, e.x - 3, e.y0 + 22, 14, 1, '#5a5f68');
      if (e.h <= 1) return;
      SL.drawTent(c, e.x, e.y + e.h, e.h, e.t, 24); } },
    crusher: { w: 24, h: 22, beh: 'crush', def: { stomp: false, shot: false, harm: false, sleep: false, always: true }, draw(c, e) {
      D.r(c, e.x + 10, 0, 4, e.y, '#5a5f68');
      D.box(c, e.x + 6, e.y, 12, 8, '#c0302a'); D.r(c, e.x + 8, e.y + 2, 2, 4, '#fff'); D.r(c, e.x + 13, e.y + 2, 2, 4, '#fff');
      D.box(c, e.x, e.y + 8, 24, 14, '#2449c9'); D.r(c, e.x + 3, e.y + 10, 1, 1, '#fff'); D.r(c, e.x + 8, e.y + 11, 1, 1, '#fff'); D.r(c, e.x + 15, e.y + 10, 1, 1, '#fff'); D.r(c, e.x + 20, e.y + 11, 1, 1, '#fff');
      D.r(c, e.x + 1, e.y + 18, 22, 3, '#e8e0d0'); D.text(c, '50%', e.x + 12, e.y + 13, '#d8322c', 4, 'center', false); } },
    contracheque: { w: 10, h: 12, beh: 'paper', def: { harm: false, stomp: false, shot: false, vx: -.3 }, draw(c, e) { D.box(c, e.x, e.y, 10, 12, '#ffffff'); D.r(c, e.x + 2, e.y + 3, 6, 1, '#9aa0aa'); D.r(c, e.x + 2, e.y + 6, 5, 1, '#9aa0aa'); D.r(c, e.x + 7, e.y, 3, 3, '#3a3d45'); } },
    // o bico (fase 8): placa "PRECISA-SE" com perninhas, que puxa alunos da fila
    bico: { w: 14, h: 16, beh: 'walk', def: { vx: -.45, edge: true }, draw(c, e, G) {
      const lg = Math.floor(e.t / 6) % 2;
      D.r(c, e.x + 3, e.y + 12, 2, 4 - lg, K); D.r(c, e.x + 9, e.y + 12, 2, 3 + lg, K);
      D.r(c, e.x + 6, e.y + 6, 2, 7, '#5a3a24');
      D.box(c, e.x - 16, e.y - 5, 46, 12, '#f4f2ec'); D.r(c, e.x - 15, e.y - 4, 44, 2, '#d8322c');
      D.text(c, C.fases[8].bico, e.x + 7, e.y - 1, '#d8322c', 4, 'center', false);
      D.r(c, e.x + (e.vx < 0 ? -12 : 23), e.y + 4, 3, 3, '#f4c79a'); } },
    sombra: { w: 14, h: 12, beh: 'walk', def: { vx: -.4, edge: true, shot: false }, draw(c, e) { D.r(c, e.x + 1, e.y + 2, 12, 10, '#5a4a6a'); D.r(c, e.x, e.y + 4, 14, 6, '#5a4a6a'); D.r(c, e.x + 3, e.y + 5, 2, 2, '#e8e0ff'); D.r(c, e.x + 9, e.y + 5, 2, 2, '#e8e0ff'); } },
    blob: { w: 12, h: 12, beh: 'walk', draw(c, e) { D.box(c, e.x, e.y, 12, 12, '#d8322c'); } }
  };
  SL.SKIN = SKIN;

  // E-02: placa atingida vira trabalhador parado (degrau por 5 s)
  SKIN.placa.init = (e) => {
    e.onShot = (G) => {
      if (e.worker) return;
      const opts = [{ suit: '#2449c9', pants: '#18215a', skin: SL.SKINS[1], hair: SL.HAIRS[0] }, { suit: '#e85a9a', shirt: '#e85a9a', skin: SL.SKINS[4], hair: SL.HAIRS[3], long: true }, { suit: '#3ec04a', shirt: '#3ec04a', skin: SL.SKINS[2], hair: SL.HAIRS[1] }];
      e.worker = opts[Math.floor(e.x / 16) % 3];
      e.harm = false; e.stomp = false; e.shot = false; e.platform = true; e.vx = 0; e.beh = 'workerStep'; e.timer = 300;
      e.y -= 6; e.h = 20; e.w = 12; G.sfx('target');
    };
  };
  BEH.workerStep = (e, G) => {
    if (e.timer > 0) { e.timer--; if (e.timer === 0) { e.platform = false; e.npc = true; e.walkAway = .8; } return; }
    BEH.npc(e, G);
  };

  /* ================= figurantes ================= */
  function mkNPC(o, x, feet, extra) {
    const child = extra.child;
    const e = Object.assign({ x, y: feet - (child ? 14 : 20), w: 12, h: child ? 14 : 20, npc: true, harm: false, t: 0, face: extra.face || -1, mode: 'idle' }, extra);
    e.spr = o;
    e.update = (G) => { e.t++; BEH.npc(e, G); if (e.cheer > 0) e.cheer--; e.upd && e.upd(e, G); };
    e.render = (c, G) => {
      if (e.hidden && !e.hidden(G)) return;
      const sp = child ? SL.npcChild(e.spr) : SL.npc(e.spr);
      let pose = 'stand';
      if (e.walkAway) pose = Math.floor(e.t / 8) % 2 ? 'walk' : 'stand';
      if (e.cheer > 0 || e.mode === 'cheer') pose = Math.floor(e.t / 10) % 2 ? 'jump' : 'stand';
      const hop = (e.cheer > 0 || e.mode === 'cheer') && pose === 'jump' ? -2 : 0;
      SL.drawSprite(c, sp, pose, e.walkAway ? Math.sign(e.walkAway) : e.face, e.x - 1, e.y + hop);
      if (e.mode === 'point') D.r(c, e.x + (e.face > 0 ? 12 : -3), e.y + 12, 3, 2, e.spr.skin || '#a0663e');
      if (e.paper) D.box(c, e.x + (e.face > 0 ? 9 : -1), e.y + 12, 5, 4, '#ffffff');
      if (e.draw2) e.draw2(c, e, G);
    };
    return e;
  }
  SL.mkNPC = mkNPC;
  const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
  function person(i, extra) {
    const shirts = ['#3a7ad8', '#e8412c', '#3ec04a', '#ffd21f', '#9250b4', '#f57e2c', '#20aba6', '#e85a9a'];
    return Object.assign({ skin: pick(SL.SKINS, i * 5 + 1), hair: pick(SL.HAIRS, i * 3 + (i > 3 ? 1 : 0)), suit: pick(shirts, i), shirt: pick(shirts, i), pants: pick(['#2a3a5a', '#3a2a1a', '#18215a', '#4a4a52'], i), long: i % 3 === 1 }, extra || {});
  }
  SL.person = person;

  /* ================= alvos do objetivo ================= */
  function tgt(o) { return Object.assign({ done: false, accept: [], hit() {}, draw() {} }, o); }
  const T = {};
  SL.T = T;
  // peça quebrada (fase 1): vira plataforma firme
  T.piece = (tx, ty, len) => tgt({
    kind: 'piece', x: tx * 16, y: ty * 16 - 16, w: len * 16, h: 32, accept: ['ink'],
    hit(G) { this.done = true; for (let i = 0; i < len; i++) G.setTile(tx + i, ty, 'P'); G.sfx('target'); G.objInc(); G.burst(this.x + this.w / 2, ty * 16, '#9aa0aa', 8); },
    draw(c, G) { if (this.done) return; const y = ty * 16; c.strokeStyle = (G.t >> 3) % 2 ? '#ffffff' : '#9aa0aa'; c.setLineDash([2, 2]); c.strokeRect(this.x + .5, y + .5, len * 16 - 1, 15); c.setLineDash([]); D.r(c, this.x + 6, y + 4, 4, 1, '#9aa0aa55'); D.r(c, this.x + 20, y + 9, 5, 1, '#9aa0aa55'); }
  });
  // porta de aço (fase 2)
  T.door = (tx, label) => tgt({
    kind: 'door', x: tx * 16, y: 160 - 40, w: 32, h: 40, accept: ['card'], open: 0, label,
    hit(G) { this.done = true; G.sfx('gate'); G.objInc(); G.addEnt(SL.mkNPC(person(tx), this.x + 10, 160, { cheer: 9999 })); },
    update() { if (this.done && this.open < 34) this.open += .8; },
    draw(c, G) {
      const x = this.x, y = this.y;
      D.r(c, x - 12, y - 14, 56, 54, '#5a5f68'); D.r(c, x - 10, y - 12, 52, 10, '#dfe4ea');
      D.text(c, this.label, x + 16, y - 9, '#1a1020', 4, 'center', false);
      D.r(c, x, y, 32, 40, this.done ? '#ffe9a0' : '#3a3d45');
      const h = 40 - this.open;
      for (let i = 0; i < h; i += 4) { D.r(c, x, y + i, 32, 3, '#8a8f99'); D.r(c, x, y + i + 3, 32, 1, '#6f7580'); }
    }
  });
  // geladeira (fase 3): a família ao lado recebe o cartão do Bolsa Família, compra a cesta básica e enche a geladeira
  T.fridge = (tx) => tgt({
    kind: 'fridge', x: tx * 16 - 14, y: 160 - 28, w: 34, h: 28, accept: ['bolsa'], k: 0,
    look: person(tx + 50, { long: tx % 2 === 0 }),
    hit(G) { this.done = true; G.sfx('target'); G.objInc(); G.burst(this.x + 24, this.y + 10, '#ffd21f', 6); },
    update() { if (this.done && this.k < 120) this.k++; },
    draw(c, G) {
      const x = this.x + 16, y = this.y, px = this.x - 2, k = this.k;
      // família: recebe o cartão e comemora
      const sp = SL.npc(this.look), cheer = this.done && (G.t >> 3) % 2;
      SL.drawSprite(c, sp, cheer ? 'jump' : 'stand', -1, px, 140 - (cheer ? 2 : 0));
      if (this.done) { D.r(c, px + (k < 40 ? -2 : 10), 152, 6, 4, '#1a1020'); D.r(c, px + (k < 40 ? -1 : 11), 153, 4, 2, '#2fae4f'); }
      // cesta básica: aparece com a família e vai para a geladeira
      if (this.done && k > 20) {
        const t2 = Math.min(1, (k - 20) / 40), bx = px + 2 + (x - px - 2) * t2, by = 148 - Math.sin(t2 * Math.PI) * 12;
        if (k < 70) { D.box(c, bx, by, 12, 10, '#c8a06a'); D.r(c, bx + 2, by - 3, 3, 3, '#3ec04a'); D.r(c, bx + 6, by - 2, 3, 2, '#d8322c'); D.r(c, bx + 1, by + 4, 10, 1, '#8a5a30'); }
        if (k > 20 && k < 70) D.text(c, 'CESTA BÁSICA', bx + 6, by - 12, '#ffffff', 4, 'center');
      }
      D.box(c, x, y, 16, 28, '#f4f2ec');
      if (this.done && k >= 70) { D.r(c, x + 12, y + 6, 2, 6, '#9aa0aa'); D.r(c, x + 4, y + 12, 2, 2, K); D.r(c, x + 10, y + 12, 2, 2, K); D.r(c, x + 5, y + 17, 6, 1, K); D.r(c, x + 4, y + 16, 1, 1, K); D.r(c, x + 11, y + 16, 1, 1, K); }
      else {
        D.r(c, x + 2, y + 2, 12, 24, '#cfe6f0'); D.r(c, x + 2, y + 13, 12, 1, '#9aa0aa');
        if (this.done && k >= 60) { D.r(c, x + 3, y + 8, 4, 4, '#3ec04a'); D.r(c, x + 8, y + 9, 5, 3, '#d8322c'); D.r(c, x + 3, y + 18, 10, 4, '#c8a06a'); }
        D.r(c, x + 15, y + 1, 9, 26, K); D.r(c, x + 16, y + 2, 7, 24, '#e4e2dc');
      }
    }
  });
  // estoque/clareira (fase 4): toco atingido vira muda e copa
  T.clearing = (tx, ty) => tgt({
    kind: 'clearing', x: tx * 16, y: 160 - 18, w: 16, h: 18, accept: ['touch'], grow: 0,
    canTouch(G) { if ((G.L.mudas || 0) > 0) return true; if (!this.warn) { G.toast('PEGUE UMA MUDA', 90); this.warn = 120; } return false; },
    hit(G) { this.done = true; G.L.mudas--; G.sfx('target'); for (let i = -1; i <= 1; i++) G.setTile(tx + i, ty, 'C'); G.burst(this.x + 8, ty * 16, '#5ac85a', 8); },
    update() { if (this.done && this.grow < 1) this.grow += .05; if (this.warn > 0) this.warn--; },
    draw(c, G) {
      const x = this.x, y = 160;
      if (!this.done) { D.r(c, x + 3, y - 6, 10, 6, K); D.r(c, x + 4, y - 5, 8, 5, '#8a5a3a'); D.r(c, x + 6, y - 5, 4, 1, '#c8a06a'); if ((G.t >> 4) % 2) D.r(c, x + 7, y - 12, 2, 4, '#5ac85a'); return; }
      const top = ty * 16 + 6; D.r(c, x + 6, top, 4, y - top, '#6a4a2a');
    }
  });
  // relógio de ponto (fase 5)
  T.clock = (tx) => tgt({
    kind: 'clock', x: tx * 16 + 1, y: 160 - 22, w: 14, h: 22, accept: ['stomp'],
    hit(G) { this.done = true; this.k = 0; G.sfx('stamp'); G.objInc(); G.burst(this.x + 7, this.y, '#ffd21f', 8); },
    draw(c, G) {
      const x = this.x, y = this.y;
      if (this.done) { // cartela "PONTO BATIDO" logo acima
        this.k = Math.min(20, (this.k || 0) + 1); const up = this.k / 20 * 6;
        D.box(c, x - 22, y - 16 - up, 58, 11, '#f4f2ec'); D.r(c, x + 5, y - 6 - up, 4, 3, '#f4f2ec');
        D.text(c, C.fases[5].pontoBatido, x + 7, y - 13 - up, '#c0302a', 4, 'center', false);
      }
      D.box(c, x, y, 14, 22, '#c0302a'); D.r(c, x + 2, y + 2, 10, 10, '#f4f2ec');
      const a = this.done ? -Math.PI / 2 : G.t * .2;
      D.r(c, x + 7 + Math.cos(a) * 3, y + 7 + Math.sin(a) * 3, 1, 1, K); D.r(c, x + 6, y + 6, 2, 2, K);
      D.r(c, x + 4, y + 15, 6, 2, K);
    }
  });
  // etiqueta VENDE-SE (fase 6), nas cores dos EUA (listras vermelhas e brancas, canto azul com estrelas)
  function usTag(c, x, y, w, h, txt) {
    D.r(c, x, y, w, h, K);
    for (let i = 0; i < h - 2; i++) D.r(c, x + 1, y + 1 + i, w - 2, 1, (i >> 1) % 2 ? '#f4f2ec' : '#c0302a');
    D.r(c, x + 1, y + 1, 10, Math.min(7, h - 2), '#2449c9');
    for (let i = 0; i < 6; i++) D.r(c, x + 2 + (i % 3) * 3, y + 2 + Math.floor(i / 3) * 3, 1, 1, '#ffffff');
    D.r(c, x + 12, y + 2, w - 14, h - 4, '#f4f2ec');
    D.text(c, txt, x + 12 + (w - 14) / 2, y + (h - 4) / 2 - 0.5, '#1a2a6a', 4, 'center', false);
  }
  SL.usTag = usTag;
  T.tag = (tx, ty, big) => tgt({
    kind: 'tag', x: tx * 16 - (big ? 18 : 14), y: ty * 16 - 16, w: big ? 50 : 46, h: big ? 13 : 12, accept: ['ink', 'bandeirinha'], big, fallY: 0, vy: 0,
    hit(G) { this.done = true; G.sfx('target'); if (big) G.objInc(); else G.addVotes(5); if (!big) G.pop(this.x + 8, this.y - 6, '+5', '#ffd21f'); },
    update(G) { if (this.done && this.fallY < 200) { this.vy += .3; this.fallY += this.vy; } },
    draw(c, G) {
      const sw = this.done ? 0 : Math.sin(G.t * .05 + tx) * 2;
      const x = this.x + sw, y = this.y + this.fallY;
      if (!this.done) {
        D.r(c, x + 8, 0, 1, y, '#5a3a24');
        D.r(c, x + this.w - 9, 0, 1, y, '#5a3a24');
      }
      usTag(c, x, y, this.w, this.h, 'VENDE-SE');
    }
  });
  // paciente (fase 7) — abre a porta do consultório seguinte
  T.patient = (tx, look, doorX) => tgt({
    kind: 'patient', x: tx * 16, y: 160 - 20, w: 12, h: 20, accept: ['med'], t: 0,
    hit(G) { this.done = true; G.sfx('target'); G.objInc(); if (doorX != null) for (let y = 2; y <= 9; y++) if (G.tile(doorX, y) === 'D') { G.setTile(doorX, y, ' '); G.burst(doorX * 16 + 8, y * 16 + 8, '#9ad0c0', 2); } },
    draw(c, G) {
      this.t++;
      const sp = SL.npc(look); const pose = this.done && (this.t >> 3) % 2 ? 'jump' : 'stand';
      SL.drawSprite(c, sp, pose, -1, this.x - 1, this.y - (pose === 'jump' ? 2 : 0));
      if (look.cane) D.r(c, this.x - 3, this.y + 10, 1, 10, '#5a3a24');
      if (look.baby) { D.box(c, this.x + 4, this.y + 10, 6, 6, '#f4f2ec'); D.r(c, this.x + 5, this.y + 11, 3, 3, look.skin); }
      if (!this.done && (G.t >> 4) % 2) D.balloon(c, '+', this.x + 6, this.y - 1, { size: 5, col: '#20aba6' });
    }
  });
  // aluno escondido (fase 8)
  T.student = (tx, row, look) => tgt({
    kind: 'student', x: tx * 16 + 1, y: row * 16 - 20, w: 12, h: 20, accept: ['touch'], seen: 0,
    canTouch() { return this.seen > 0; },
    hit(G) { this.done = true; G.sfx('life'); G.objInc(); G.burst(this.x + 6, this.y + 6, '#ffd21f', 10); G.pop(this.x + 6, this.y - 4, '+1', '#ffd21f'); },
    update(G) { if (G.lit(this.x + 6, this.y + 10)) this.seen = 240; else if (this.seen > 0) this.seen--; },
    draw(c, G) {
      if (this.done) return;
      if (this.seen > 0) SL.drawSprite(c, SL.npc(look), 'stand', -1, this.x - 1, this.y);
      else { D.r(c, this.x + 3, this.y + 7, 2, 1, '#ffffffaa'); D.r(c, this.x + 8, this.y + 7, 2, 1, '#ffffffaa'); }
    }
  });
  // antena (fase 8)
  T.antenna = (tx) => tgt({
    kind: 'antenna', x: tx * 16, y: 160 - 48, w: 16, h: 48, accept: ['touch'],
    hit(G) {
      const L = G.L;
      if (L.obj.n < L.obj.max) { if (!this.warn) { G.toast(`${L.obj.label} ${L.obj.n}/${L.obj.max}`); this.warn = 120; } return; }
      this.done = true; L.antennaOn = true; G.sfx('target'); G.openGate();
    },
    update() { if (this.warn > 0) this.warn--; },
    draw(c, G) {
      const x = this.x + 7, y = this.y;
      D.r(c, x, y + 8, 2, 40, '#5a5f68'); D.r(c, x - 6, y + 14, 14, 2, '#5a5f68'); D.r(c, x - 4, y + 22, 10, 2, '#5a5f68');
      D.r(c, x - 1, y + 4, 4, 4, this.done ? '#3ec04a' : ((G.t >> 4) % 2 ? '#d8322c' : '#5a1a1a'));
      if (this.done) for (let i = 1; i < 4; i++) { const r = ((G.t / 2 + i * 8) % 24); c.strokeStyle = 'rgba(62,192,74,' + (1 - r / 24) + ')'; c.beginPath(); c.arc(x + 1, y + 6, r, -2.4, -.7); c.stroke(); }
    }
  });
  // alavanca (fase 9)
  T.lever = (tx) => tgt({
    kind: 'lever', x: tx * 16 + 2, y: 160 - 16, w: 12, h: 16, accept: ['lever'],
    hit(G) { this.done = true; const L = G.L; L.levers = (L.levers || 0) + 1; G.sfx('gate'); G.toast(`ALAVANCA ${L.levers}/3`); if (L.levers >= 3) G.openGate(); },
    draw(c, G) {
      const x = this.x, y = this.y;
      D.box(c, x, y + 10, 12, 6, '#5a5f68');
      const a = this.done ? .7 : -.7; c.save(); c.translate(x + 6, y + 11); c.rotate(a); D.r(c, -1, -11, 3, 11, K); D.r(c, -2, -13, 5, 4, this.done ? '#3ec04a' : '#d8322c'); c.restore();
      const h = G.hero; if (!this.done && Math.abs(h.x + 5 - (x + 6)) < 26 && (G.t >> 4) % 2) D.text(c, G.touch ? 'B' : 'X', x + 6, y - 14, '#ffd21f', 5, 'center');
    }
  });

  /* ---------- desenhos compartilhados da fase 11 (polvo / crime organizado) ---------- */
  // tentáculo cinza saindo do chão: afina até a ponta, balança, ventosas claras de um lado e ponta enrolada
  const TENT = { k: K, body: '#8a8f99', dark: '#5f656f', lite: '#b9c0ca', cup: '#e4e8ee' };
  SL.drawTent = (c, x, baseY, hh, t, maxH) => {
    if (hh < 2) return;
    const M = maxH || 24, n = Math.floor(hh / 2);
    let cx = x + 4, top = baseY;
    for (let k = 0; k < n; k++) {
      const i = k * 2, f = i / M, y = baseY - i - 2;
      const w = Math.max(2, Math.round(8 - 5.5 * f));
      cx = x + 4 + Math.sin(t * .12 + i * .22) * 2.6 * f;
      const l = Math.round(cx - w / 2);
      D.r(c, l - 1, y, w + 2, 2, TENT.k);
      D.r(c, l, y, w, 2, TENT.body);
      if (w > 3) { D.r(c, l + w - 1, y, 1, 2, TENT.dark); D.r(c, l + 1, y, 1, 2, TENT.lite); }
      if (k % 3 === 1 && w >= 4) { D.r(c, l - 1, y, 2, 2, TENT.k); D.r(c, l - 1, y, 1, 1, TENT.cup); D.r(c, l, y + 1, 1, 1, TENT.cup); }
      top = y;
    }
    // ponta enrolada para o lado
    const s = Math.sin(t * .12 + hh * .22) >= 0 ? 1 : -1, tx = Math.round(cx);
    D.r(c, tx - (s > 0 ? 1 : 3), top - 3, 5, 2, TENT.k); D.r(c, tx + (s > 0 ? 2 : -4), top - 2, 2, 3, TENT.k);
    D.r(c, tx - (s > 0 ? 0 : 2), top - 2, 3, 1, TENT.body);
  };
  // cano do Mario: boca larga em cima, corpo descendo até o chão. state: 'on' (verde, jorrando dinheiro) | 'off' (lacrado, cinza)
  const PIPE_ON = { body: '#2fae4f', lite: '#9af0a0', mid: '#5ad070', dark: '#167a32' };
  const PIPE_OFF = { body: '#7d848f', lite: '#c9d0d8', mid: '#a3aab4', dark: '#4d525b' };
  SL.drawPipe = (c, x, y, w, h, off, t, seed) => {
    const P = off ? PIPE_OFF : PIPE_ON, RH = 8;
    // corpo
    D.r(c, x + 1, y + RH, w - 2, h - RH, K);
    D.r(c, x + 2, y + RH, w - 4, h - RH, P.body);
    D.r(c, x + 3, y + RH, 2, h - RH, P.lite); D.r(c, x + 6, y + RH, 1, h - RH, P.mid);
    D.r(c, x + w - 5, y + RH, 2, h - RH, P.dark);
    D.r(c, x + 2, y + RH, w - 4, 1, P.dark); // sombra da boca sobre o corpo
    // boca (aro)
    D.r(c, x - 1, y, w + 2, RH, K);
    D.r(c, x, y + 1, w, RH - 2, P.body);
    D.r(c, x + 1, y + 1, 2, RH - 2, P.lite); D.r(c, x + 4, y + 1, 1, RH - 2, P.mid);
    D.r(c, x + w - 3, y + 1, 2, RH - 2, P.dark);
    if (off) {
      // lacrado: tampa parafusada + cadeado
      D.r(c, x, y - 2, w, 2, K); D.r(c, x + 1, y - 1, w - 2, 1, '#bdc3cc');
      const lx = x + w / 2 - 3;
      D.r(c, lx + 1, y - 1, 4, 3, K); D.r(c, lx + 2, y, 2, 2, '#7d848f');
      D.box(c, lx, y + 2, 6, 5, '#ffd21f'); D.r(c, lx + 2, y + 4, 2, 2, '#8a6a00');
    } else {
      // abertura escura e notas de dinheiro sujo jorrando
      D.r(c, x + 1, y - 1, w - 2, 2, K); D.r(c, x + 2, y, w - 4, 1, '#0a3a18');
      for (let k = 0; k < 2; k++) {
        const ph = ((t || 0) + (seed || 0) * 17 + k * 30) % 60;
        if (ph < 34) {
          const bx = x + w / 2 - 3 + (k ? 3 : -3) * ph / 34, by = y - 2 - ph * .9 + ph * ph * .02;
          D.r(c, bx, by, 6, 4, K); D.r(c, bx + 1, by + 1, 4, 2, k ? '#7ad07a' : '#ffd21f');
        }
      }
    }
  };
  // cano do dinheiro do crime (fase 11, E-09)
  // vertical, como no Mario: sai do chão (ou do bloco embaixo) e o corpo inteiro é alvo
  T.pipe = (tx, ty) => tgt({
    kind: 'pipe', x: tx * 16, y: ty * 16, w: 16, h: 16, accept: ['ink'], seed: tx,
    hit(G) { this.done = true; G.sfx('break'); G.addVotes(3); G.pop(this.x + 8, this.y - 4, '+3', '#ffd21f'); G.burst(this.x + 8, this.y + 4, '#3ec04a', 8); },
    update(G) {
      if (this.grounded) return;
      let gy = 12;
      for (let y = ty + 1; y < 12; y++) if (G.SOLID.has(G.tile(tx, y))) { gy = y; break; }
      this.h = Math.max(16, (gy - ty) * 16); this.grounded = true;
    },
    draw(c, G) { SL.drawPipe(c, this.x, this.y, 16, this.h, this.done, G.t, this.seed); }
  });

  /* ================= plataformas móveis ================= */
  function mover(o) {
    const m = Object.assign({ w: 32, h: 6, t: 0, sp: .01, style: 'plat' }, o);
    m.x = m.ax; m.y = m.ay;
    m.update = (G) => { m.t++; const k = (Math.sin(m.t * m.sp + (m.ph || 0)) + 1) / 2; m.x = m.ax + (m.bx - m.ax) * k; m.y = m.ay + (m.by - m.ay) * k; };
    m.draw = (c, G) => MV[m.style](c, m, G);
    return m;
  }
  SL.mover = mover;
  const MV = {
    plat(c, m, G) { D.r(c, m.x, m.y, m.w, 6, K); D.r(c, m.x + 1, m.y + 1, m.w - 2, 4, G.L.theme.plat); },
    maca(c, m) { D.r(c, m.x, m.y, m.w, 6, K); D.r(c, m.x + 1, m.y + 1, m.w - 2, 4, '#ffffff'); D.r(c, m.x + 1, m.y + 1, 8, 3, '#9ad0c0'); D.r(c, m.x + 4, m.y + 6, 2, 6, '#5a5f68'); D.r(c, m.x + m.w - 6, m.y + 6, 2, 6, '#5a5f68'); D.r(c, m.x + 3, m.y + 12, 4, 3, K); D.r(c, m.x + m.w - 7, m.y + 12, 4, 3, K); },
    carga(c, m) { D.r(c, m.x + m.w / 2 - 1, 0, 2, m.y, '#3a3d45'); D.box(c, m.x, m.y, m.w, 10, '#c0302a'); D.r(c, m.x + 2, m.y + 2, m.w - 4, 2, '#e85a50'); },
    vagoneta(c, m) { D.box(c, m.x, m.y, m.w, 12, '#6a6a72'); D.r(c, m.x + 2, m.y - 2, m.w - 4, 3, '#9250b4'); D.r(c, m.x + 6, m.y - 3, 4, 2, '#20aba6'); D.r(c, m.x + 3, m.y + 11, 4, 4, K); D.r(c, m.x + m.w - 7, m.y + 11, 4, 4, K); }
  };

  /* ================= desenhos de cenário reutilizáveis ================= */
  function shopFront(c, x, col) { D.r(c, x, 96, 64, 64, col); D.r(c, x, 92, 64, 6, SL.shade(col, -.25)); D.r(c, x + 46, 112, 12, 16, '#bfe6ff'); }
  function cozinha(c, x) { D.r(c, x, 104, 80, 56, '#e8c040'); D.r(c, x - 4, 98, 88, 8, '#d8322c'); D.r(c, x + 8, 118, 18, 14, '#bfe6ff'); D.r(c, x + 54, 118, 18, 14, '#bfe6ff'); D.r(c, x + 34, 124, 12, 36, '#8a5a30'); }
  function window_(c, x, y, w, h, light) { D.r(c, x - 2, y - 2, w + 4, h + 4, '#3a2a1a'); D.r(c, x, y, w, h, light ? '#ffe9a0' : '#1a1a2a'); }

  /* ================= fases ================= */
  const MK = [];
  // Cada fase tem UM só prêmio especial (nunca os três juntos), 1/3 para cada:
  // Picanha nas fases 0, 1, 2, 8 · Bandeira do Brasil (capa) nas 5, 6, 9, 11 · Estrela Vermelha nas 3, 4, 7, 10, 12, 13
  // (fase 3, da Dona Fome, sem picanha: não combina com a distribuição de cesta básica)
  const PREMIO_DA_FASE = { 0: 'picanha', 1: 'picanha', 2: 'picanha', 3: 'star', 8: 'picanha',
    5: 'flag', 6: 'flag', 9: 'flag', 11: 'flag',
    4: 'star', 7: 'star', 10: 'star', 12: 'star', 13: 'star' };
  const ESPECIAIS = ['star', 'picanha', 'flag'];
  SL.PREMIO_DA_FASE = PREMIO_DA_FASE;
  SL.Levels = {
    build(n, G) {
      const L = MK[n](G);
      const premio = PREMIO_DA_FASE[n];
      const ks = Object.keys(L.qc).filter(k => ESPECIAIS.includes(L.qc[k]));
      // fica só um bloco especial: o que já é do tipo certo ou, se não houver, o primeiro (convertido); os outros dão Voto
      let keep = ks.find(k => L.qc[k] === premio) || ks[0];
      if (!keep) { for (let x = 7; x < L.w && !keep; x++) for (let y = 0; y < 12 && !keep; y++) if (L.g[y][x] === '?' && !L.qc[x + ',' + y]) keep = x + ',' + y; }
      for (const k of ks) L.qc[k] = 'coin';
      if (keep && premio) L.qc[keep] = premio;
      L.theme = L.theme || TH[n];
      L.obj = { label: C.objetivos[n], n: 0, max: C.metas[n] };
      L.lula = n === 0 ? 'lula_prologo' : (n <= 4 ? 'lula_ato1' : 'lula_ato2');
      L.music = 'p' + n;
      // Ato 1 (prólogo e fases 1 a 4): cores e música sombrias até a vitória
      if (n <= 4) { L.gloom = 1; L.music = 'p' + n + 'd'; L.musicOk = 'p' + n; }
      return L;
    }
  };

  // ---------- FASE 0 · O Tribunal do PowerPoint (correr) ----------
  MK[0] = () => {
    const b = builder(0, 150), L = b.L;
    L.action = 'run';
    b.g(0, 28).g(31, 58).g(61, 92).g(96, 128);
    b.br(8, 6, 1).q(9, 6).br(10, 6, 1).q(11, 6, 'star').br(12, 6, 1).coins(8, 4, 5);
    b.e('slide', 16, 7).e('slide', 23, 6);
    b.X(20, 8, 1, 2).X(25, 7, 1, 3);
    b.coins(28, 7, 3);
    b.e('envelope', 36, 3).e('envelope', 41, 3).e('envelope', 46, 3);
    b.p(38, 7, 4).p(44, 5, 3).coins(44, 4, 3).q(50, 6).br(51, 6, 2);
    b.e('slide', 50, 8).e('slide', 56, 6);
    b.cp(63);
    b.X(66, 8, 2, 2).X(70, 6, 2, 4).X(74, 8, 2, 2).coins(70, 4, 2);
    b.e('envelope', 78, 3).e('envelope', 82, 3).e('slide', 84, 7).e('slide', 88, 5);
    b.p(91, 7, 6).coins(92, 6, 4);
    b.e('slide', 104, 6).e('slide', 110, 7).e('envelope', 108, 3).e('envelope', 115, 3);
    b.q(112, 6).q(113, 6).br(114, 6, 1).stairs(120, 4);
    b.arena(['projetor', 'juiz']);
    L.bg = (c, cam, G) => {
      BG.stars(c, G.W, G.t);
      // paredes do fórum: colunas e cortinas
      const off = cam * .5;
      for (let i = Math.floor(off / 64) - 1; i < Math.floor((off + G.W) / 64) + 2; i++) {
        const x = i * 64 - off; D.r(c, x, 40, 10, 120, '#3a3a6a'); D.r(c, x - 2, 36, 14, 6, '#4a4a7a');
        D.r(c, x + 22, 56, 26, 40, '#1a1a3a'); D.r(c, x + 24, 58, 22, 36, '#2a3a8a55');
      }
      D.r(c, 0, 150, G.W, 10, '#4a3a2a');
    };
    return L;
  };

  // ---------- FASE 1 · A Posse (Caneta) ----------
  MK[1] = () => {
    const b = builder(1, 170), L = b.L;
    L.action = 'ink';
    b.g(0, 22).coins(6, 7, 4).q(9, 6).q(10, 6, 'picanha').br(11, 6, 2);
    b.g(29, 46); b.t(T.piece(23, 10, 3)); b.e('blob', 0, 0, { dead: true });
    b.coins(24, 8, 3).br(34, 6, 3).q(37, 6);
    b.g(53, 68); b.t(T.piece(48, 10, 3)); b.coins(48, 8, 3);
    b.X(58, 9, 1, 1).X(59, 8, 1, 2).cp(62);
    b.g(75, 92); b.t(T.piece(70, 10, 3)); b.coins(70, 8, 3);
    b.v(86, 6, true).q(84, 6).coins(83, 4, 4);
    b.g(98, 118); // buraco largo de 6 (92-98): precisa do Alckmin
    b.coins(93, 6, 4);
    b.q(104, 6, 'star').br(105, 6, 2);
    b.g(125, 142); b.t(T.piece(120, 10, 3)); b.coins(120, 8, 3);
    b.cp(127);
    b.g(149, 170); b.t(T.piece(144, 10, 3)); b.coins(144, 8, 3);
    b.stairs(131, 3).stairs(138, 3, -1);
    b.goal(160);
    // cacos de vidro (inimigos que andam) — usamos o slide no chão como "caco"
    L.ents = L.ents.filter(e => !e.dead);
    for (const x of [16, 40, 62, 108, 134.5, 154]) L.ents.push(mkE('caco', x * 16, 160));
    // Praça dos Três Poderes depredada (depois do 8 de janeiro): vidros quebrados, fumaça, grades tombadas
    const broken = (c, x, y, w, h) => { D.r(c, x, y, w, h, '#2a2a3a'); c.fillStyle = '#9fd3f5'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .6, y); c.lineTo(x + w * .3, y + h * .5); c.lineTo(x + w * .5, y + h); c.lineTo(x, y + h); c.fill(); };
    const smoke = (c, x, y, t, k) => { for (let i = 0; i < 6; i++) { const yy = y - ((t * .3 + i * 14 + k * 7) % 80), r = 5 + ((t * .3 + i * 14) % 80) / 8; c.fillStyle = 'rgba(90,90,100,' + (.45 - ((t * .3 + i * 14) % 80) / 200) + ')'; c.beginPath(); c.arc(x + Math.sin(i + t * .02) * 6, yy, r, 0, 7); c.fill(); } };
    L.bg = (c, cam, G) => {
      BG.sun(c, G.W * .78, 44, 16, '#fff1c8');
      const o = cam * .3, W = G.W;
      // Congresso (duas torres e cúpulas), Planalto e STF, com janelas quebradas
      const cx = 120 - o; D.r(c, cx, 70, 9, 80, '#e4e2dc'); D.r(c, cx + 11, 70, 9, 80, '#e4e2dc');
      for (let y = 76; y < 146; y += 8) { D.r(c, cx + 2, y, 5, 4, '#5a6a80'); D.r(c, cx + 13, y, 5, 4, '#5a6a80'); }
      broken(c, cx + 2, 92, 5, 12); broken(c, cx + 13, 116, 5, 10);
      D.r(c, cx - 70, 140, 160, 10, '#e4e2dc'); c.fillStyle = '#e4e2dc'; c.beginPath(); c.ellipse(cx - 40, 140, 18, 10, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(cx + 60, 128, 20, 10, 0, 0, Math.PI); c.fill();
      smoke(c, cx - 40, 128, G.t, 1);
      const px = 380 - o; D.r(c, px, 108, 150, 4, '#f4f2ec'); D.r(c, px + 6, 112, 138, 30, '#7aa0b8'); D.r(c, px - 4, 142, 160, 4, '#f4f2ec');
      for (let x = px + 2; x < px + 150; x += 18) { c.fillStyle = '#f4f2ec'; c.beginPath(); c.moveTo(x - 4, 112); c.quadraticCurveTo(x, 127, x - 4, 142); c.lineTo(x + 4, 142); c.quadraticCurveTo(x, 127, x + 4, 112); c.fill(); }
      broken(c, px + 20, 116, 16, 20); broken(c, px + 70, 118, 20, 18); broken(c, px + 112, 114, 14, 22);
      smoke(c, px + 90, 108, G.t, 2);
      const sx = 640 - o; D.r(c, sx, 118, 90, 4, '#f4f2ec'); D.r(c, sx + 6, 122, 78, 24, '#7aa0b8');
      for (let i = 0; i < 6; i++) D.r(c, sx + 2 + i * 17, 118, 4, 28, '#f4f2ec');
      broken(c, sx + 26, 126, 14, 16); broken(c, sx + 54, 124, 12, 18);
      smoke(c, sx + 40, 118, G.t, 3);
      // névoa leve para separar o fundo do caminho
      c.fillStyle = 'rgba(255,214,170,.38)'; c.fillRect(0, 0, W, 160);
      D.r(c, 0, 146, W, 14, '#8ab84a');
    };
    L.deco = ((deco0) => (c, G) => {
      // grades tombadas, cones e cacos pelo chão
      for (let i = 0; i < 26; i++) {
        const x = i * 61 + 30, y = 160;
        if (G.tile(Math.floor(x / 16), 10) !== '#') continue;
        if (i % 3 === 0) { c.save(); c.translate(x, y - 3); c.rotate(-.25); D.r(c, 0, 0, 24, 2, '#8a8f99'); D.r(c, 0, 6, 24, 2, '#8a8f99'); for (let k = 0; k < 24; k += 4) D.r(c, k, 0, 1, 8, '#8a8f99'); c.restore(); }
        else if (i % 3 === 1) { D.r(c, x, y - 7, 6, 7, '#f57e2c'); D.r(c, x + 1, y - 5, 4, 2, '#fff'); }
        else for (let k = 0; k < 4; k++) D.r(c, x + k * 5, y - 2 - (k % 2), 3, 2, '#bfe6ff');
      }
      deco0(c, G);
    })(L.deco0 || (() => {}));
    // sala de comando: telões no vermelho, acendem no fim
    const salaDeco = (c, G) => {
      const x = 156 * 16; D.r(c, x - 8, 72, 140, 88, '#3a2a4a'); D.r(c, x - 8, 66, 140, 6, '#5a4a6a');
      for (let i = 0; i < 4; i++) { const on = L.lights; D.box(c, x + i * 32, 88, 26, 18, on ? '#3ec04a' : ((G.t >> 4) % 2 ? '#d8322c' : '#7a1a1a')); if (on) { D.r(c, x + i * 32 + 4, 94, 18, 2, '#c8ffc8'); D.r(c, x + i * 32 + 4, 99, 10, 2, '#c8ffc8'); } }
    };
    const decoFx = L.deco; L.deco = (c, G) => { decoFx(c, G); salaDeco(c, G); };
    L.onGoal = (G) => { if (!L.lights) { L.lights = true; G.sfx('target'); } G.levelClear(); };
    return L;
  };
  SKIN.caco = { w: 12, h: 8, beh: 'walk', def: { vx: -.35, edge: true }, draw(c, e) { c.fillStyle = K; c.beginPath(); c.moveTo(e.x, e.y + 8); c.lineTo(e.x + 4, e.y); c.lineTo(e.x + 7, e.y + 4); c.lineTo(e.x + 10, e.y + 1); c.lineTo(e.x + 12, e.y + 8); c.fill(); c.fillStyle = '#bfe6ff'; c.beginPath(); c.moveTo(e.x + 2, e.y + 7); c.lineTo(e.x + 4, e.y + 2); c.lineTo(e.x + 7, e.y + 6); c.lineTo(e.x + 10, e.y + 3); c.lineTo(e.x + 11, e.y + 7); c.fill(); D.r(c, e.x + 4, e.y + 5, 1, 1, K); D.r(c, e.x + 8, e.y + 5, 1, 1, K); } };

  // ---------- FASE 2 · Rei Desemprego (Megafone) ----------
  MK[2] = () => {
    const b = builder(2, 168), L = b.L;
    L.action = 'fan';
    b.g(0, 40).g(43, 76).g(80, 120).g(124, 146);
    const doors = [[18, 'FÁBRICA'], [52, 'SALÃO DE MEI'], [92, 'MERCADINHO'], [130, 'ESCRITÓRIO']];
    for (const [x, l] of doors) b.t(T.door(x, l));
    b.coins(8, 7, 3).q(12, 6).q(13, 6, 'picanha');
    for (const x of [26, 33, 58, 66, 86, 101, 110, 138]) b.e('placa', x, 10);
    b.p(30, 7, 3).coins(30, 6, 3).br(46, 6, 2).q(48, 6).br(49, 6, 1);
    b.cp(80);
    b.p(70, 7, 3).X(84, 8, 2, 2).q(100, 6, 'star').br(101, 6, 2).coins(104, 8, 4);
    b.X(118, 8, 1, 2).p(120, 6, 3).coins(120, 5, 3);
    b.gate(145, 2, 9);
    b.arena(['rei']);
    L.arenaNeed = (G) => L.gateOpen;
    L.bg = (c, cam, G) => {
      BG.clouds(c, cam, G.W, '#e8edf4');
      BG.city(c, cam, .25, 150, '#9aa3b4', 2, G.W);
      // fábrica parada ao fundo
      const fx = 500 - cam * .35; D.r(c, fx, 100, 80, 50, '#7a8090'); D.r(c, fx + 10, 70, 10, 30, '#7a8090'); D.r(c, fx + 30, 80, 10, 20, '#7a8090');
    };
    L.deco = (c, G) => {
      const cols = ['#c8a06a', '#e8a0c0', '#6ac0a0', '#a0b0d8'];
      doors.forEach(([x], i) => shopFront(c, x * 16 - 16, cols[i]));
    };
    // início: cai uma arma, Lula examina, reprova, joga longe e tira o megafone (4 s, automático)
    L.onStart = (G) => {
      const h = G.hero; h.lock = 250; L.gun = { t: 0, x: h.x + 2, y: -20 };
    };
    L.update = (G) => {
      const g = L.gun; if (!g || g.done) return;
      g.t++; const h = G.hero;
      if (g.t < 50) { g.y = Math.min(h.y - 10, -20 + g.t * 4); g.x = h.x + 1; }
      else if (g.t < 130) { g.x = h.x + (h.face > 0 ? 8 : -6); g.y = h.y + 6; if (g.t === 50) G.sfx('block'); }
      else if (g.t < 175) { g.x += 4; g.y -= 2.5 - (g.t - 130) * .12; if (g.t === 130) G.sfx('throw'); }
      else if (g.t === 175) { G.sfx('mega'); G.balloon(C.fases[2].falaInicio, h, 170); }
      if (g.t >= 240) g.done = true;
    };
    L.fgWorld = (c, G) => {
      const g = L.gun; if (!g || g.done) return;
      const h = G.hero;
      if (g.t < 175) { D.r(c, g.x, g.y, 9, 3, K); D.r(c, g.x + 1, g.y + 1, 7, 1, '#6f7580'); D.r(c, g.x + 1, g.y + 3, 3, 3, K); }
      if (g.t > 80 && g.t < 130) { D.r(c, h.x + 1, h.y + 3, 4, 1, K); D.r(c, h.x + 6, h.y + 3, 4, 1, K); D.balloon(c, '✗', h.x + 5, h.y - 2, { size: 6, col: '#d8322c' }); }
      if (g.t >= 175) megafone(c, h, G.t, g.t < 200 ? 1 - (g.t - 175) / 25 : 0);
    };
    L.handItem = (c, G, h) => { if (L.gun && !L.gun.done) return; megafone(c, h, G.t, h.cool > 18 ? (h.cool - 18) / 12 : 0); };
    return L;
  };

  // megafone de desenho animado: bocal pequeno na mão e uma boca enorme, com aro vermelho.
  // puff (0–1) = acabou de gritar: o megafone estufa e solta ondas de som
  function megafone(c, h, t, puff) {
    const f = h.face > 0 ? 1 : -1, hx = h.x + (f > 0 ? 9 : 1), hy = h.y + 9;
    const s = 1 + puff * .18, L0 = 3, L1 = 17 * s, r0 = 2, r1 = 7.5 * s;
    c.save(); c.translate(hx, hy); c.scale(f, 1);
    // cabo
    D.r(c, 0, 1, 3, 6, K); D.r(c, 1, 2, 1, 4, '#d8322c');
    // bocal
    D.r(c, -2, -3, 6, 6, K); D.r(c, -1, -2, 4, 4, '#f4f2ec');
    // cone
    const cone = (ex) => { c.beginPath(); c.moveTo(L0, -r0 - ex); c.lineTo(L1, -r1 - ex); c.lineTo(L1, r1 + ex); c.lineTo(L0, r0 + ex); c.closePath(); c.fill(); };
    c.fillStyle = K; cone(1); c.fillStyle = '#ffd21f'; cone(0);
    // faixa vermelha no meio e brilho branco em cima
    const mx = (L0 + L1) / 2, mr = (r0 + r1) / 2;
    c.fillStyle = '#d8322c'; c.fillRect(mx - 1.5, -mr - .2, 3, mr * 2 + .4);
    c.fillStyle = '#fff6b0'; c.beginPath(); c.moveTo(L0 + 1, -r0 + .6); c.lineTo(L1 - 2, -r1 + 1.6); c.lineTo(L1 - 2, -r1 + 3); c.lineTo(L0 + 1, -r0 + 1.6); c.closePath(); c.fill();
    // aro da boca (vermelho) e o "buraco"
    c.fillStyle = K; c.beginPath(); c.ellipse(L1, 0, 3.2, r1 + 1.6, 0, 0, 7); c.fill();
    c.fillStyle = '#d8322c'; c.beginPath(); c.ellipse(L1, 0, 2.4, r1 + .8, 0, 0, 7); c.fill();
    c.fillStyle = '#5a0d06'; c.beginPath(); c.ellipse(L1 + .4, 0, 1.2, r1 - 1.6, 0, 0, 7); c.fill();
    // ondas de som quando grita
    if (puff > 0) {
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { const R = 4 + i * 4 + (1 - puff) * 6; c.globalAlpha = puff * (1 - i * .25); c.beginPath(); c.arc(L1 + 2, 0, R, -.8, .8); c.stroke(); }
      c.globalAlpha = 1; c.lineWidth = 1;
    }
    c.restore();
  }

  // ---------- FASE 3 · Dona Fome (cartão do Bolsa Família) ----------
  MK[3] = () => {
    const b = builder(3, 166), L = b.L;
    L.action = 'bolsa';
    b.g(0, 44).g(48, 86).g(90, 124).g(128, 145);
    const cook = (i) => person(i, { suit: '#f4f2ec', shirt: '#f4f2ec', cap: '#d8322c', apron: true });
    // cozinhas solidárias = checkpoints, com cozinheiros de boné vermelho liso
    const kitchens = [4, 56, 98, 134];
    kitchens.forEach((x, i) => { b.npc(cook(i), x + 1, 10, { face: 1 }); b.npc(cook(i + 3), x + 3, 10, { face: -1 }); if (i) b.cp(x); });
    for (const x of [20, 38, 68, 82, 112]) b.t(T.fridge(x));
    for (const x of [28, 34, 62, 74, 104, 118, 140]) b.e('panela', x, 10);
    b.q(14, 6).q(15, 6, 'star').coins(24, 7, 3).p(44, 7, 4).coins(44, 6, 4);
    b.br(66, 6, 2).q(68, 6, 'star').br(69, 6, 1).X(86, 9, 1, 1);
    b.p(92, 7, 3).coins(92, 6, 3).stairs(120, 3);
    b.gate(144, 2, 9);
    b.arena(['fome']);
    L.arenaNeed = () => L.gateOpen;
    L.bg = (c, cam, G) => {
      BG.sun(c, G.W * .2, 46, 20, '#fff4d0');
      const off = cam * .3;
      for (let i = Math.floor(off / 40) - 1; i < Math.floor((off + G.W) / 40) + 2; i++) { const x = i * 40 - off, hh = 26 + rnd(i) * 22; D.r(c, x, 150 - hh, 34, hh, '#e8b48a'); c.fillStyle = '#c8743a'; c.beginPath(); c.moveTo(x - 3, 150 - hh); c.lineTo(x + 17, 150 - hh - 12); c.lineTo(x + 37, 150 - hh); c.fill(); }
    };
    L.deco = (c, G) => kitchens.forEach(x => cozinha(c, x * 16 - 8));
    L.handItem = (c, G, h) => { const x = h.x + (h.face > 0 ? 8 : -6); D.r(c, x, h.y + 9, 8, 6, K); D.r(c, x + 1, h.y + 10, 6, 4, '#2fae4f'); D.r(c, x + 1, h.y + 12, 6, 1, '#ffd21f'); };
    return L;
  };

  // ---------- FASE 4 · A Fortaleza da Boiada (Caneta) ----------
  MK[4] = () => {
    const b = builder(4, 176), L = b.L;
    L.action = 'ink';
    b.g(0, 176);
    // (1) clareiras: tocos viram mudas e copas
    // mudas para pegar antes de cada clareira
    const muda = (tx) => L.items.push({ kind: 'muda', x: tx * 16 + 3, y: 160 - 14, w: 10, h: 14,
      onTouch(G, it) { it.dead = true; G.L.mudas = (G.L.mudas || 0) + 1; G.sfx('coin'); G.toast('MUDAS × ' + G.L.mudas, 80); },
      draw(c, G, it) { const b = Math.sin(G.t * .1) * 1; D.r(c, it.x + 2, it.y + 9, 6, 5, '#1a1020'); D.r(c, it.x + 3, it.y + 10, 4, 3, '#8a5a3a'); D.r(c, it.x + 4, it.y + 3 + b, 2, 7, '#2f8a3a'); D.r(c, it.x, it.y + 1 + b, 5, 4, '#5ac85a'); D.r(c, it.x + 5, it.y + b, 5, 4, '#3ec04a'); } });
    [5, 20, 34].forEach(muda);
    b.t(T.clearing(12, 7)).X(16, 4, 2, 6).coins(16, 3, 2);
    b.t(T.clearing(26, 7)).X(30, 4, 2, 6).coins(30, 3, 2);
    b.q(8, 6).q(9, 6, 'picanha');
    b.hole(36, 39).t(T.clearing(42, 7)).X(46, 4, 1, 6);
    b.cp(52);
    // (2) estouro da boiada
    L.stampede = { x0: 56 * 16, x1: 92 * 16, t: 0 };
    b.coins(60, 6, 6).p(70, 6, 3).q(80, 6, 'star').br(79, 6, 1).br(81, 6, 1);
    b.cp(94);
    // (3) motosserras
    for (const x of [100, 108, 115, 124, 132, 140]) b.e('moto', x, 10);
    b.hole(118, 121).p(118, 7, 3).X(128, 8, 2, 2).coins(128, 6, 2);
    b.stairs(146, 3);
    b.arena(['boiada']);
    L.update = (G) => {
      const s = L.stampede, h = G.hero;
      if (h.x > s.x0 && h.x < s.x1 + 64) {
        s.t++;
        if (s.t % 150 === 1) G.sfx('bell');
        if (s.t % 150 === 40 || s.t % 150 === 70) G.addEnt(mkE('boi', G.cam + G.W + 20, 160, { always: true }));
      }
      SL.mooHerd(G, L);
    };
    L.bg = (c, cam, G) => {
      BG.sun(c, G.W * .7, 60, 22, '#ffe0a0');
      BG.hills(c, cam, .15, 170, '#c8743a', 7, G.W);
      // tocos e mata
      const off = cam * .35;
      for (let i = Math.floor(off / 30) - 1; i < Math.floor((off + G.W) / 30) + 2; i++) { const x = i * 30 - off; if (rnd(i) > .5) { D.r(c, x, 140, 6, 10, '#5a3a24'); } else { D.r(c, x + 2, 110, 4, 40, '#3a5a2a'); c.fillStyle = '#2f8a3a'; c.beginPath(); c.arc(x + 4, 108, 12, 0, 7); c.fill(); } }
      // fortaleza cinza
      const fx = 1700 - cam * .35; D.r(c, fx, 70, 120, 80, '#7a7a80'); for (let i = 0; i < 6; i++) D.r(c, fx + i * 20, 62, 12, 8, '#7a7a80'); D.r(c, fx + 46, 110, 28, 40, '#4a4a50');
    };
    L.handItem = (c, G, h) => {
      const x = h.x + (h.face > 0 ? 9 : -4);
      if ((L.mudas || 0) > 0) { D.r(c, x, h.y + 9, 4, 4, '#8a5a3a'); D.r(c, x + 1, h.y + 4, 2, 5, '#2f8a3a'); D.r(c, x - 1, h.y + 3, 3, 3, '#5ac85a'); D.r(c, x + 2, h.y + 2, 3, 3, '#3ec04a'); }
      else D.r(c, x, h.y + 8, 4, 1, '#1a2a6a');
    };
    return L;
  };
  SKIN.boi.init = (e) => { e.always = true; };
  // mugidos enquanto há bois na tela: a cada 26 quadros, alternando 5 alturas
  const MOO = [1, .85, 1.15, .92, 1.05];
  SL.mooHerd = (G, L) => {
    const on = L.ents.some(e => !e.dead && e.kind === 'boi' && e.x > G.cam - 30 && e.x < G.cam + G.W + 10);
    if (!on) { L.mooT = 0; return; }
    if (--L.mooT > 0) return;
    L.mooT = 26; L.mooI = ((L.mooI || 0) + 1) % 5; SL.Audio.moo(MOO[L.mooI]);
  };

  // ---------- FASE 5 · Relógio de Ponto Infinito (correr) ----------
  MK[5] = () => {
    const b = builder(5, 178), L = b.L;
    L.action = 'run';
    b.g(0, 178);
    // fábrica: esteiras
    b.X(10, 10, 8, 1, '>').X(26, 10, 6, 1, '<').X(40, 10, 10, 1, '>');
    b.q(20, 6).q(21, 6, 'picanha').coins(34, 7, 4);
    b.t(T.clock(22)).t(T.clock(36)).p(48, 7, 3).t(T.clock(54)).hole(60, 63).p(60, 6, 3);
    b.t(T.clock(70)).cp(74);
    // escritório
    for (const x of [82, 90, 98, 106, 120, 128]) b.e('notif', x, 10);
    b.X(94, 8, 2, 2).X(102, 6, 2, 4).q(108, 6, 'star').coins(102, 4, 2);
    b.t(T.clock(99)).t(T.clock(124));
    b.X(132, 10, 8, 1, '<').t(T.clock(144)).p(116, 7, 3);
    b.gate(156, 2, 9);
    b.arena(['relogio']);
    L.arenaNeed = () => L.gateOpen;
    L.update = (G) => { L.speedMul = 1 + Math.floor(L.t / 3600) * .1; if (!L.cameo && G.hero.x > 80 * 16) { L.cameo = true; L.cameoT = 520; } if (L.cameoT > 0) L.cameoT--; };
    L.bg = (c, cam, G) => {
      const off = cam * .4;
      for (let i = Math.floor(off / 90) - 1; i < Math.floor((off + G.W) / 90) + 2; i++) { const x = i * 90 - off; if (i * 90 < 1200) { D.r(c, x, 80, 70, 80, '#3a2f5a'); D.r(c, x + 10, 50, 12, 30, '#3a2f5a'); D.r(c, x + 40, 60, 10, 20, '#3a2f5a'); } else { D.r(c, x, 50, 70, 110, '#5a4f8a'); for (let yy = 58; yy < 150; yy += 14) for (let xx = 6; xx < 64; xx += 14) D.r(c, x + xx, yy, 8, 8, '#c39ad0'); } }
    };
    L.deco = (c, G) => {
      const wx = 88 * 16; window_(c, wx, 78, 40, 30, true);
      if (L.cameo) {
        const bravo = L.cameoT > 0 && L.cameoT < 300;
        SL.drawSprite(c, SL.S.flavio, 'stand', -1, wx + 13, 86);
        if (bravo) { // sobrancelhas franzidas e rosto vermelho de bravo
          D.r(c, wx + 15, 90, 3, 1, '#1a1020'); D.r(c, wx + 18, 91, 1, 1, '#1a1020'); D.r(c, wx + 23, 91, 1, 1, '#1a1020'); D.r(c, wx + 24, 90, 3, 1, '#1a1020');
          D.r(c, wx + 17, 94, 1, 1, '#e8412c'); D.r(c, wx + 24, 94, 1, 1, '#e8412c'); D.r(c, wx + 18, 94, 6, 1, '#1a1020');
          if ((G.t >> 3) % 2) { D.r(c, wx + 30, 84, 2, 1, '#d8322c'); D.r(c, wx + 31, 83, 1, 3, '#d8322c'); }
        }
        D.r(c, wx, 102, 40, 6, '#3a2a1a');
        if (L.cameoT >= 300) D.balloon(c, C.fases[5].cameo, wx + 20, 84, { size: 5, minX: G.cam, maxX: G.cam + G.W });
        else if (bravo) D.balloon(c, wrapTxt(C.fases[5].cameo2, 24), wx + 20, 84, { size: 5, minX: G.cam, maxX: G.cam + G.W });
      }
    };
    return L;
  };

  // ---------- FASE 6 · O Feirão do Herdeiro (Caneta) ----------
  MK[6] = () => {
    const b = builder(6, 168), L = b.L;
    L.action = 'ink';
    b.g(0, 168);
    // barracas com escadas (blocos) e etiquetas penduradas
    const big = [[14, 8], [40, 4], [66, 8], [92, 3], [126, 8]];
    for (const [x, y] of big) b.t(T.tag(x, y, true));
    for (const [x, y] of [[24, 7], [52, 6], [78, 6], [110, 7]]) b.t(T.tag(x, y, false));
    b.stairs(34, 4).p(38, 5, 4).stairs(45, 4, -1);
    b.stairs(86, 5).p(91, 4, 3).X(94, 5, 1, 5);
    b.q(8, 6).q(9, 6, 'picanha').q(58, 6, 'star').br(57, 6, 1).br(59, 6, 1).coins(38, 4, 4).coins(100, 7, 5);
    b.hole(70, 73).hole(116, 119).p(116, 8, 3);
    for (const x of [20, 30, 60, 84, 104, 132]) b.e('leilao', x, 10);
    b.cp(80);
    b.gate(146, 2, 9);
    b.arena(['herdeiro']);
    L.arenaNeed = () => L.gateOpen;
    L.bg = (c, cam, G) => {
      BG.clouds(c, cam, G.W, '#ffffff');
      const off = cam * .3;
      for (let i = Math.floor(off / 60) - 1; i < Math.floor((off + G.W) / 60) + 2; i++) { const x = i * 60 - off; D.r(c, x, 100, 18, 50, '#c8d2de'); D.r(c, x - 2, 98, 22, 3, '#aab4c0'); }
      BG.congresso(c, 900 - cam * .2, 150, '#aab4c0');
    };
    L.deco = (c, G) => {
      const cols = ['#ffcf4a', '#e8412c', '#3ec04a', '#2449c9'];
      for (let i = 0; i < 9; i++) { const x = (i * 17 + 4) * 16; D.r(c, x, 130, 56, 30, '#c8a06a'); D.r(c, x - 4, 112, 64, 8, cols[i % 4]); for (let j = 0; j < 4; j++) D.r(c, x - 4 + j * 16, 120, 8, 4, cols[i % 4]); D.r(c, x - 2, 120, 2, 40, '#5a3a24'); D.r(c, x + 56, 120, 2, 40, '#5a3a24'); }
      // refinaria, usina e linha de transmissão (patrimônio)
      const px = 128 * 16; D.r(c, px, 70, 8, 90, '#8a8f99'); D.r(c, px + 12, 90, 20, 70, '#9aa0aa'); D.r(c, px + 40, 60, 2, 100, '#5a5f68'); D.r(c, px + 32, 66, 18, 2, '#5a5f68');
    };
    L.inkKind = 'bandeirinha';
    L.handItem = (c, G, h) => { const x = h.x + (h.face > 0 ? 9 : -6); D.r(c, x + (h.face > 0 ? 0 : 6), h.y + 5, 1, 9, '#5a3a24'); D.flagIcon(c, h.face > 0 ? x + 1 : x - 1, h.y + 4, 7, 5); };
    // faixa do leilão e compradores com chapéu nas cores dos EUA no início da fase
    const deco0 = L.deco;
    L.deco = (c, G) => {
      deco0(c, G);
      const x0 = 3 * 16; D.r(c, x0, 60, 2, 100, '#5a3a24'); D.r(c, x0 + 150, 60, 2, 100, '#5a3a24');
      D.box(c, x0, 62, 152, 14, '#1a2a6a'); D.text(c, 'LEILÃO DO BRASIL · COMPRADORES DOS EUA', x0 + 76, 66, '#ffd21f', 4, 'center', false);
      for (let i = 0; i < 4; i++) {
        const bx = x0 + 70 + i * 18, by = 140; SL.drawSprite(c, SL.npc(SL.person(90 + i, { suit: '#2a2a3a', shirt: '#f4f2ec' })), 'stand', -1, bx, by);
        D.r(c, bx + 2, by - 4, 10, 6, '#1a1020'); D.r(c, bx + 3, by - 3, 8, 1, '#c0302a'); D.r(c, bx + 3, by - 2, 8, 1, '#f4f2ec'); D.r(c, bx + 3, by - 1, 8, 1, '#2449c9'); D.r(c, bx, by + 1, 14, 1, '#1a1020');
        if (((G.t >> 5) + i) % 2) { D.r(c, bx - 2, by + 2, 1, 6, '#5a3a24'); D.box(c, bx - 5, by - 3, 7, 6, '#f4f2ec'); D.text(c, '$', bx - 1.5, by - 2, '#169c3c', 4, 'center', false); }
      }
    };
    return L;
  };
  SKIN.leilao = { w: 12, h: 12, beh: 'hop', def: { hopV: 3.6 }, draw(c, e) { D.r(c, e.x + 5, e.y + 4, 2, 8, '#5a3a24'); D.box(c, e.x, e.y, 12, 6, '#8a5a30'); D.r(c, e.x + 2, e.y + 2, 2, 2, '#ffd21f'); D.r(c, e.x + 8, e.y + 2, 2, 2, '#ffd21f'); } };

  // ---------- FASE 7 · A Serpente do Tesouraço (remédio) ----------
  MK[7] = () => {
    const b = builder(7, 172), L = b.L;
    L.action = 'med';
    b.g(0, 30).g(36, 60).g(66, 96).g(104, 130).g(136, 150);
    const looks = [
      person(0, { hair: '#9a9a9a', long: true, skin: SL.SKINS[3], suit: '#c88ae0', shirt: '#c88ae0' }),
      person(1, { hair: '#9a9a9a', beard: false, cane: true, skin: SL.SKINS[1], suit: '#8a6a3a', shirt: '#8a6a3a' }),
      person(2, { long: true, baby: true, skin: SL.SKINS[2], suit: '#20aba6', shirt: '#20aba6' }),
      person(3, { skin: SL.SKINS[4], hair: SL.HAIRS[1], suit: '#f57e2c', shirt: '#f57e2c' }),
      person(4, { hair: '#f4f2ec', long: true, skin: SL.SKINS[0], suit: '#e85a9a', shirt: '#e85a9a' })
    ];
    const pts = [[14, 22], [46, 56], [78, 92], [112, 124], [140, 148]];
    pts.forEach(([x, door], i) => { b.t(T.patient(x, looks[i], door)); b.X(door, 2, 1, 8, 'D'); });
    // macas (plataformas móveis) sobre buracos e pontes que a tesoura corta
    b.m(mover({ ax: 30 * 16, ay: 136, bx: 34 * 16 - 8, by: 136, w: 32, style: 'maca', sp: .02 }));
    b.m(mover({ ax: 96 * 16, ay: 130, bx: 102 * 16, by: 130, w: 32, style: 'maca', sp: .018 }));
    b.X(60, 10, 6, 1, '=');
    b.X(130, 10, 6, 1, '=');
    b.q(8, 6).q(9, 6, 'picanha').q(84, 6, 'star').coins(40, 7, 4).coins(70, 7, 4).coins(116, 7, 4).p(50, 7, 3);
    b.cp(68).cp(106);
    L.scissors = [[40, 7], [72, 8], [88, 6], [118, 8], [140, 7]];
    b.gate(150, 2, 9).g(150, 151);
    b.arena(['serpente']);
    L.arenaNeed = () => L.gateOpen;
    L.update = (G) => {
      // tesouras voadoras entram pela direita quando o herói chega perto
      for (const s of L.scissors) if (!s.done && G.hero.x > s[0] * 16 - 260) { s.done = true; G.addEnt(mkE('tesoura', G.cam + G.W + 10, s[1] * 16 + 12, { always: true, cut: true })); }
      // a tesoura corta as pontes por onde passa (a ponte cai 1 s depois)
      for (const e of L.ents) if (e.cut && !e.dead) { const tx = Math.floor((e.x + 6) / 16); for (let ty = 9; ty <= 10; ty++) if (G.tile(tx, ty) === '=' && Math.abs(e.y + 6 - ty * 16) < 30) { L.crumble = L.crumble || []; if (!L.crumble.some(c => c.x === tx && c.y === ty)) L.crumble.push({ x: tx, y: ty, t: 60 }); } }
    };
    L.bg = (c, cam, G) => {
      const off = cam * .5;
      for (let i = Math.floor(off / 48) - 1; i < Math.floor((off + G.W) / 48) + 2; i++) { const x = i * 48 - off; D.r(c, x, 50, 44, 90, '#bfe0d8'); for (let j = 0; j < 4; j++) { D.r(c, x + 2, 58 + j * 22, 40, 3, '#9ad0c0'); for (let k = 0; k < 5; k++) D.r(c, x + 4 + k * 8, 50 + j * 22, 6, 8, pick(['#ffffff', '#ffd21f', '#20aba6', '#e85a9a'], i + j + k)); } }
    };
    L.handItem = (c, G, h) => { const x = h.x + (h.face > 0 ? 8 : -5); D.r(c, x, h.y + 9, 6, 5, K); D.r(c, x + 1, h.y + 10, 4, 3, '#fff'); };
    return L;
  };

  // ---------- FASE 8 · A Evasão (lanterna) ----------
  MK[8] = () => {
    const b = builder(8, 170), L = b.L;
    L.action = 'ink'; L.altCoin = true;
    b.g(0, 170).hole(34, 37).hole(74, 78).hole(112, 115);
    b.p(44, 7, 4).p(60, 6, 3).p(88, 7, 4).p(100, 5, 3).p(120, 7, 3);
    // a Evasão puxa os alunos: placas "PRECISA-SE" (o bico) andando pelo caminho
    for (const x of [28, 56, 84, 96, 118, 132]) b.e('bico', x, 10);
    b.q(8, 6).q(9, 6, 'picanha').q(70, 6, 'star');
    b.coins(4, 7, 3, 1).coins(20, 7, 4).coins(44, 5, 4).coins(60, 4, 3).coins(66, 7, 4).coins(88, 5, 4).coins(100, 3, 3).coins(106, 7, 4).coins(120, 5, 3).coins(126, 7, 5);
    b.cp(64).cp(104);
    b.gate(148, 2, 9);
    b.arena(['evasao']);
    L.arenaNeed = () => L.gateOpen;

    // ---- alunos que seguem o Lula em fila ----
    const look = (i) => person(i + 2, { suit: '#f4f2ec', shirt: '#f4f2ec', pants: '#2449c9', backpack: true });
    const studs = [[20, 10], [46, 7], [66, 10], [101, 5], [126, 10]].map(([tx, row], i) => ({ i, x: tx * 16 + 2, y: row * 16 - 20, w: 12, h: 20, st: 'wait', cool: 0, look: look(i), face: -1, t: 0 }));
    const trail = [];
    const SCHOOL = { x0: 134 * 16, x1: 146 * 16 }, doorX = 140 * 16 - 2;
    const door = { x: doorX - 8, y: 160 - 34, w: 28, h: 34 };
    L.meia = 0; L.meiaMax = 15;
    const floorAt = (px) => { const tx = Math.floor((px + 6) / 16); for (let ty = 1; ty < 12; ty++) { const ch = L.g[ty] && L.g[ty][tx]; if (ch && '#XBP?UV-'.includes(ch)) return ty * 16; } return null; };
    // o aluno sai da fila e para num chão firme por perto
    function scatter(st, x) {
      for (const d of [0, 10, -10, 20, -20, 32, -32, 48, -48, 64, -64, 96, -96]) {
        const px = x + d; if (px < 16 || px > SCHOOL.x0 - 20) continue;
        const f = floorAt(px); if (f == null) continue;
        st.x = px; st.y = f - 20; st.st = 'wait'; st.cool = 50; st.hop = 12; return;
      }
      st.st = 'wait'; st.cool = 50;
    }
    const followers = () => studs.filter(st => st.st === 'follow');
    L.onHurt = (G) => {
      const f = followers(); if (!f.length) return;
      f.forEach((st, k) => scatter(st, st.x + (k % 2 ? 1 : -1) * (24 + k * 12)));
      G.toast(C.fases[8].espalhou || 'A FILA SE ESPALHOU!', 90);
    };
    L.onRespawn = (G) => { trail.length = 0; for (const st of followers()) scatter(st, st.x); };
    L.onCoin = (G, it) => {
      if (!followers().length || L.meiaDone) return;
      L.meia++;
      if (L.meia >= L.meiaMax) { L.meiaDone = true; G.save.lives++; G.persist(); G.sfx('life'); G.toast(C.fases[8].meiaCheia, 140); G.pop(G.hero.x + 5, G.hero.y - 10, '+1 VIDA', '#3ec04a'); }
    };
    L.objExtra = () => `<span class="meia"><i style="height:${Math.round(L.meia / L.meiaMax * 100)}%"></i></span>`;
    L.fila = studs;
    b.t({
      kind: 'fila', x: -999, y: -999, w: 0, h: 0, accept: [], done: false, k: 0,
      update(G) {
        const h = G.hero, last = trail[0];
        if (!last || Math.hypot(h.x - last.x, h.y - last.y) >= 2) { trail.unshift({ x: h.x, y: h.y, face: h.face, on: h.on }); if (trail.length > 90) trail.pop(); }
        this.moving = Math.abs(h.vx) > .1 || !h.on;
        let k = 0;
        for (const st of studs) {
          st.t++; if (st.cool > 0) st.cool--; if (st.hop > 0) st.hop--;
          if (st.st === 'wait') {
            st.face = h.x < st.x ? -1 : 1;
            if (st.cool <= 0 && G.state === 'play' && G.overlap(h, st)) { st.st = 'follow'; G.sfx('life'); G.pop(st.x + 6, st.y - 6, 'NA FILA!', '#ffd21f'); }
          } else if (st.st === 'follow') {
            k++; const p = trail[Math.min(trail.length - 1, k * 8)];
            if (p) { st.x = p.x; st.y = p.y - 2; st.face = p.face; st.air = !p.on; }
          } else if (st.st === 'enter') {
            st.air = false; st.face = doorX > st.x ? 1 : -1;
            st.x += Math.sign(doorX - st.x) * Math.min(1.6, Math.abs(doorX - st.x)); st.y += (140 - st.y) * .25;
            if (Math.abs(st.x - doorX) < 1) { st.st = 'in'; G.objInc(); G.sfx('coin'); G.burst(doorX + 6, 140, '#ffd21f', 8); G.pop(doorX + 6, 124, '+1', '#ffd21f'); }
          }
        }
        // chegou na porta da escola: a fila entra, um de cada vez
        if (G.overlap(h, door) && followers().length) this.entering = true;
        if (this.entering && G.L.t % 12 === 0) { const f = followers(); if (f.length) f[0].st = 'enter'; else this.entering = false; }
        // o bico puxa quem estiver na fila
        for (const e of L.ents) if (!e.dead && e.kind === 'bico') for (const st of followers()) if (G.overlap(e, st)) {
          scatter(st, st.x + (st.x < e.x ? -40 : 40)); G.sfx('hit'); G.pop(st.x + 6, st.y - 8, 'PUXADO!', '#d8322c');
        }
      },
      draw(c, G) {
        // a escola
        const x0 = SCHOOL.x0, w = SCHOOL.x1 - SCHOOL.x0;
        D.r(c, x0 - 4, 70, w + 8, 6, '#c8a030'); D.r(c, x0, 76, w, 84, '#e8c040');
        for (let i = 0; i < 4; i++) if (i !== 2) for (const y of [88, 118]) { D.box(c, x0 + 12 + i * 46, y, 22, 16, '#7ab8e0'); D.r(c, x0 + 22 + i * 46, y + 1, 2, 14, K); }
        D.box(c, x0 + w / 2 - 34, 56, 68, 14, '#f4f2ec'); D.text(c, C.fases[8].escola, x0 + w / 2, 58, '#2449c9', 7, 'center', false);
        D.r(c, doorX - 8, 126, 28, 34, K); D.r(c, doorX - 6, 128, 24, 32, '#7a4a2a');
        D.r(c, doorX + 4, 128, 1, 32, K);
        const n = G.L.obj ? G.L.obj.n : 0;
        for (let i = 0; i < 5; i++) D.r(c, doorX - 7 + i * 6, 120, 4, 4, i < n ? '#ffd21f' : '#5a3a24');
        if (followers().length && (G.t >> 4) % 2) D.balloon(c, 'ENTRE', doorX + 6, 112, { size: 5, col: '#2449c9' });
        // alunos
        for (const st of studs) {
          if (st.st === 'in') continue;
          const air = st.air || st.hop > 0;
          const pose = air ? 'jump' : ((st.st === 'enter' || (st.st === 'follow' && this.moving)) ? ((st.t >> 3) % 2 ? 'walk' : 'stand') : 'stand');
          SL.drawSprite(c, SL.npc(st.look), pose, st.face, st.x - 1, st.y - (st.hop > 0 ? Math.sin(st.hop / 12 * Math.PI) * 6 : 0));
          if (st.st === 'wait' && (G.t >> 4) % 2) D.balloon(c, '!', st.x + 6, st.y - 1, { size: 5, col: '#d8322c' });
        }
      }
    });
    // ponto de ônibus vazio na beira dos buracos ("o ônibus não passou")
    L.deco = (c, G) => {
      for (const tx of [33, 73, 111]) { const x = tx * 16 + 4; D.r(c, x, 118, 2, 42, '#5a5f68'); D.box(c, x - 19, 106, 40, 13, '#2449c9'); D.text(c, C.fases[8].onibus, x + 1, 109, '#ffffff', 4, 'center', false); }
    };
    L.bg = (c, cam, G) => {
      BG.sun(c, G.W * .8, 58, 18, '#fff1c8');
      const off = cam * .35;
      for (let i = Math.floor(off / 160) - 1; i < Math.floor((off + G.W) / 160) + 2; i++) { const x = i * 160 - off; D.r(c, x, 96, 120, 64, '#e9b27a'); D.r(c, x - 4, 90, 128, 8, '#c8743a'); for (let k = 0; k < 3; k++) D.r(c, x + 12 + k * 36, 108, 18, 14, '#7ab8e0'); }
      D.r(c, 0, 150, G.W, 10, '#3ec04a');
    };
    return L;
  };
  const G0 = () => SL.G;
  // quebra um texto em linhas de até n caracteres (para balões)
  function wrapTxt(t, n) { const out = []; let l = ''; for (const w of t.split(' ')) { if ((l + ' ' + w).trim().length > n) { out.push(l.trim()); l = w; } else l += ' ' + w; } if (l.trim()) out.push(l.trim()); return out.join('\n'); }
  SL.wrapTxt = wrapTxt;

  // ---------- FASE 9 · A Draga Estrangeira (alavanca / Caneta) ----------
  MK[9] = () => {
    const b = builder(9, 172), L = b.L;
    L.action = 'lever';
    b.g(0, 34).g(46, 80).g(92, 122).g(128, 150);
    // teto da galeria
    for (let x = 30; x < 150; x++) { b.set(x, 0, 'X'); b.set(x, 1, 'X'); if (x % 7 === 0) b.set(x, 2, 'X'); }
    b.t(T.lever(24)).t(T.lever(70)).t(T.lever(116));
    // vagonetas nos trilhos (plataformas móveis)
    b.m(mover({ ax: 34 * 16, ay: 140, bx: 44 * 16, by: 140, w: 24, style: 'vagoneta', sp: .016 }));
    b.m(mover({ ax: 80 * 16, ay: 140, bx: 90 * 16, by: 140, w: 24, style: 'vagoneta', sp: .02 }));
    b.m(mover({ ax: 122 * 16, ay: 140, bx: 126 * 16, by: 120, w: 24, style: 'vagoneta', sp: .025 }));
    b.q(8, 6).q(9, 6, 'picanha').q(60, 6, 'star').coins(50, 7, 4).coins(96, 7, 4).p(56, 7, 3).X(104, 8, 2, 2);
    b.cp(48).cp(94);
    L.rockSpots = [56, 74, 104, 118, 140];
    b.gate(149, 2, 9);
    b.arena(['draga']);
    L.arenaNeed = () => L.gateOpen;
    L.update = (G) => { if (L.t % 170 === 0 && G.hero.x > 40 * 16 && !(L.arena && L.arena.locked)) G.addEnt(mkE('pedra', G.cam + G.W + 8, 160 - 40, { always: true })); };
    L.bg = (c, cam, G) => {
      const off = cam * .4;
      D.r(c, 0, 0, G.W, 192, '#bfe6ff');
      if (cam < 600) { BG.hills(c, cam, .2, 160, '#d8a060', 3, G.W); }
      const gx = 30 * 16 - cam * .4 - 140; D.r(c, Math.max(0, gx), 0, G.W, 192, '#4a2a1a');
      for (let i = 0; i < 30; i++) { const x = (rnd(i) * 3000 - off) % (G.W + 40), y = 30 + rnd(i + 5) * 110; if (x + gx * 0 > gx) { D.r(c, x, y, 4, 6, i % 2 ? '#9250b4' : '#20aba6'); D.r(c, x + 1, y + 1, 1, 2, '#fff'); } }
    };
    L.deco = (c, G) => {
      // esteira: no início vai para o navio; cada alavanca desvia para a usina brasileira
      for (let x = 2; x < 148; x += 1) { const y = 120; if (x % 2) D.r(c, x * 16, y, 16, 3, '#3a3d45'); }
      const k = L.levers || 0;
      D.text(c, k >= 3 ? 'USINA ▶' : '◀ NAVIO', 6 * 16, 108, k >= 3 ? '#3ec04a' : '#d8322c', 5, 'left');
    };
    L.handItem = (c, G, h) => { const x = h.x + (h.face > 0 ? 9 : -3); D.r(c, x, h.y + 8, 4, 1, '#1a2a6a'); };
    return L;
  };

  // ---------- FASE 10 · O Tarifaço (correr) ----------
  MK[10] = () => {
    const b = builder(10, 170), L = b.L;
    L.action = 'run';
    b.g(0, 40).g(46, 84).g(92, 128).g(132, 150);
    // pilhas de contêineres como escadaria
    const cont = (x, y, w, h, col) => { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) b.set(x + i, y + j, 'T'); L.conts.push([x, y, w, h, col]); };
    L.conts = [];
    cont(14, 8, 3, 2, '#c0302a'); cont(17, 6, 3, 4, '#2449c9'); cont(20, 8, 2, 2, '#169c3c');
    cont(56, 8, 3, 2, '#169c3c'); cont(59, 7, 3, 3, '#c0302a');
    cont(100, 8, 3, 2, '#2449c9'); cont(103, 6, 2, 4, '#169c3c'); cont(105, 8, 3, 2, '#c0302a');
    // guindastes que levam plataformas
    b.m(mover({ ax: 40 * 16, ay: 110, bx: 45 * 16, by: 110, w: 32, style: 'carga', sp: .02 }));
    b.m(mover({ ax: 84 * 16, ay: 120, bx: 91 * 16 - 16, by: 100, w: 32, style: 'carga', sp: .016 }));
    // carimbos menores (esmagadores)
    for (const x of [30, 70, 78, 116, 124, 142]) b.e('crusher', x, 4);
    // caixas de exportação para pegar
    for (const x of [10, 36, 64, 96, 112, 138]) L.items.push({ kind: 'box', x: x * 16 + 2, y: 160 - 12, w: 12, h: 12, onTouch(G, it) { it.dead = true; G.addVotes(5); G.sfx('coin'); G.pop(it.x + 6, it.y - 4, '+5', '#ffd21f'); }, draw(c, G, it) { D.box(c, it.x, it.y, 12, 12, '#c8a06a'); D.r(c, it.x + 2, it.y + 5, 8, 2, '#8a5a30'); } });
    b.q(6, 6).q(7, 6, 'picanha').q(50, 6, 'star').coins(26, 7, 3).coins(74, 7, 4).coins(120, 7, 4);
    b.cp(48).cp(94);
    b.arena(['carimbos']);
    L.bg = (c, cam, G) => {
      BG.clouds(c, cam, G.W, '#ffffff');
      D.r(c, 0, 128, G.W, 40, '#1f78d0'); for (let i = 0; i < G.W; i += 12) D.r(c, (i - cam * .5 % 12 + 12) % G.W, 132 + (i % 3) * 6, 6, 1, '#5fb2ff');
      const sx = 1900 - cam * .5; D.r(c, sx, 110, 90, 18, '#f4f2ec'); D.r(c, sx + 10, 96, 40, 14, '#f4f2ec'); D.r(c, sx, 122, 90, 6, '#169c3c'); D.r(c, sx, 118, 90, 4, '#ffd21f');
    };
    L.deco = (c, G) => { for (const [x, y, w, h, col] of L.conts) { D.box(c, x * 16, y * 16, w * 16, h * 16, col); for (let i = 4; i < w * 16; i += 6) D.r(c, x * 16 + i, y * 16 + 3, 2, h * 16 - 6, SL.shade(col, -.25)); } };
    return L;
  };

  // ---------- FASE 11 · O Polvo do Cofre (Caneta) ----------
  MK[11] = () => {
    const b = builder(11, 172), L = b.L;
    L.action = 'ink';
    b.g(0, 172);
    // escadarias e lajes subindo o morro
    b.stairs(12, 3).X(15, 7, 6, 3).stairs(21, 3, -1);
    b.X(30, 8, 4, 2).X(34, 6, 4, 4).X(38, 4, 6, 6).X(44, 7, 3, 3);
    b.X(60, 7, 5, 3).X(66, 5, 5, 5).X(72, 8, 4, 2);
    b.X(90, 6, 8, 4).X(98, 8, 3, 2).X(108, 7, 4, 3).X(112, 4, 6, 6).X(118, 7, 3, 3);
    // canos de dinheiro (alvos)
    // canos de dinheiro (alvos): saem do chão/bloco logo abaixo, como os canos do Mario
    for (const [x, y] of [[18, 5], [41, 2], [52, 8], [68, 3], [84, 8], [94, 4], [114, 2], [130, 8]]) b.t(T.pipe(x, y));
    // tentáculos que saem dos bueiros
    for (const [x, ph] of [[26, 0], [50, 60], [80, 30], [104, 90], [126, 0], [136, 100]]) b.e('tentaculo', x, 10, { ph });
    // moradores apontam o caminho (nunca são alvo)
    const res = (i) => person(i + 10);
    for (const [x, y] of [[8, 10], [36, 6], [56, 10], [70, 5], [96, 6], [124, 10], [140, 10]]) b.npc(res(x), x, y, { face: 1, mode: 'point' });
    b.q(5, 6).q(6, 6, 'picanha').q(78, 5, 'star').coins(38, 3, 6).coins(66, 4, 5).coins(112, 3, 6);
    b.cp(58).cp(100);
    b.arena(['polvo']);
    L.bg = (c, cam, G) => {
      BG.stars(c, G.W, G.t);
      const off = cam * .3;
      for (let i = Math.floor(off / 26) - 1; i < Math.floor((off + G.W) / 26) + 2; i++) {
        const x = i * 26 - off, hh = 30 + rnd(i) * 50 + Math.sin(i * .2) * 20, col = pick(['#c8743a', '#e8c040', '#5aa8ff', '#e85a9a', '#3ec04a'], i);
        D.r(c, x, 150 - hh, 24, hh, SL.shade(col, -.35)); for (let yy = 150 - hh + 6; yy < 146; yy += 10) if (rnd(i + yy) > .4) D.r(c, x + 6, yy, 4, 4, '#ffd21f');
      }
    };
    L.handItem = (c, G, h) => { const x = h.x + (h.face > 0 ? 9 : -3); D.r(c, x, h.y + 8, 4, 1, '#1a2a6a'); };
    return L;
  };

  // ---------- FASE 12 · A Mordida do Leão (correr; perseguição com rolagem automática) ----------
  MK[12] = () => {
    const b = builder(12, 176), L = b.L;
    L.action = 'run';
    b.g(0, 112);
    b.hole(40, 43).hole(70, 73);
    b.p(20, 7, 3).p(54, 7, 4).X(86, 9, 1, 1).X(96, 8, 1, 2);
    b.q(10, 6).q(11, 6, 'picanha').q(60, 6, 'star');
    // fila do contracheque
    const fila = [
      person(20, { long: true, suit: '#e85a9a', shirt: '#e85a9a' }), person(21, { suit: '#9250b4', shirt: '#9250b4' }),
      person(22, { suit: '#2449c9', pants: '#18215a' }), person(23, { long: true, suit: '#d8322c', shirt: '#d8322c' })
    ];
    L.line = [];
    // subida do prédio até a cobertura
    b.g(112, 176);
    b.p(114, 8, 3).p(118, 6, 3).p(122, 4, 3).X(126, 4, 2, 6).p(130, 6, 2).p(134, 8, 2);
    b.cp(114);
    b.arena(['leao']);
    // fila espalhada pela avenida e pelo térreo do prédio, até perto da arena (só em chão firme, sem buraco nem bloco em cima)
    const firme = tx => [tx - 1, tx, tx + 1].every(x => L.g[10][x] === '#' && L.g[9][x] === ' ' && L.g[8][x] === ' ');
    for (let i = 0; i < 10; i++) {
      let tx = Math.round(14 + i * 14.5); while (!firme(tx)) tx++;
      const n = SL.mkNPC(fila[i % 4], tx * 16, 160, { face: -1, always: true }); L.ents.push(n); L.line.push(n);
    }
    // leão que corre na frente soltando contracheques
    // começa no meio da tela, em pé sobre o chão (y do chão = 160)
    L.lion = { x: null, t: 0 };
    // 16 contracheques espalhados por igual do começo até o fim da avenida; se ainda faltar algum, continua soltando
    // a perseguição vai até a porta da arena (o leão espera ali e depois vira o chefe)
    const CHASE_END = 150 * 16, LION_MAX = 153 * 16 - 64;
    const lionInit = (G) => {
      const ln = L.lion; if (ln.x != null) return;
      ln.x = G.cam + G.W / 2 - 32; ln.drop = 0; ln.passed = 0; ln.extra = 0;
    };
    L.autoscroll = (G) => {
      const h = G.hero;
      if (h.x > 110 * 16) return false;
      const target = G.clampCam(Math.max(L.scroll || 0, h.x + 5 - G.W * .62));
      L.scroll = Math.min(G.clampCam(110 * 16 - G.W * .4), Math.max(target, (L.scroll || 0) + .75));
      G.cam = L.scroll;
      // no celular, a borda esquerda fica à frente dos direcionais
      const lim = G.cam + Math.max(2, G.touchSafeX ? G.touchSafeX() : 0);
      if (h.x < lim) { h.x = lim; if (h.vx < 0) h.vx = 0; }
      return true;
    };
    L.onRespawn = (G) => { L.scroll = G.clampCam(G.hero.x - 60); G.cam = L.scroll; };
    L.update = (G) => {
      lionInit(G); const ln = L.lion; ln.t++;
      const h = G.hero;
      const chase = h.x < CHASE_END && !(L.arena && L.arena.locked); // na arena (mesmo esticada para a esquerda) a perseguição acabou
      if (chase) {
        ln.x = Math.min(LION_MAX, ln.x + (Math.max(h.x + 140, ln.x + .6) - ln.x) * .03);
        // pula por cima de blocos e paredes que saem do chão (não atravessa)
        const solid = (tx, ty) => { const ch = G.tile(tx, ty); return ch === 'X' || ch === '#' || ch === 'U'; };
        let top = 160;
        for (let px = ln.x + 4; px < ln.x + 60; px += 8) { const tx = Math.floor(px / 16); let r = 10; while (r > 0 && solid(tx, r - 1)) r--; top = Math.min(top, r * 16); }
        const ty = top - 40; ln.y = ln.y == null ? ty : (ty < ln.y ? Math.max(ty, ln.y - 6) : Math.min(ty, ln.y + 4));
        const solta = (x) => { G.addEnt(mkE('contracheque', x, 120 + (ln.drop % 3) * 10, { vx: -.5, always: true, collect: payCollect })); ln.drop++; };
        // só solta o contracheque quando passa por uma pessoa da fila (morde o contracheque dela)
        const fila = L.line;
        while (ln.passed < fila.length && ln.x + 32 >= fila[ln.passed].x + 6) { const p = fila[ln.passed++]; solta(p.x); G.sfx('bite'); }
        // rede de segurança: se já passou por todos e ainda faltam contracheques, solta um de vez em quando na porta da arena
        if (ln.passed >= fila.length && L.obj && L.obj.n < L.obj.max && !L.ents.some(e => e.collect === payCollect && !e.dead && e.x > G.cam - 16) && ++ln.extra % 90 === 0) solta(ln.x + 8);
      }
    };
    function payCollect(G) {
      this.dead = true; G.sfx('coin'); G.objInc();
      const w = L.line.find(n => !n.paid && n.x > G.hero.x - 40) || L.line.find(n => !n.paid);
      if (w) { w.paid = true; w.cheer = 9999; w.paper = true; G.fx({ kind: 'fly', x: this.x, y: this.y, tx: w.x + 4, ty: w.y + 10, life: 40, draw(c, G, f) { const k = f.f / 40; D.box(c, f.x + (f.tx - f.x) * k, f.y + (f.ty - f.y) * k, 8, 10, '#fff'); } }); }
    }
    L.bg = (c, cam, G) => {
      BG.sun(c, G.W * .5, 120, 26, '#ffb36b');
      BG.city(c, cam, .2, 160, '#4a3f6a', 3, G.W, '#ffd21f', G.t);
      BG.city(c, cam, .45, 166, '#3a5a7a', 9, G.W, '#6cc2f1', G.t);
      // prédio espelhado com a cobertura NÃO PERTURBE
      const px = 1700 - cam * .45; D.r(c, px, 20, 120, 150, '#6cc2f1'); for (let y = 26; y < 160; y += 10) D.r(c, px + 4, y, 112, 2, '#4a90b8');
      D.r(c, px + 30, 8, 60, 12, '#3a3d45'); D.box(c, px + 36, 0, 48, 8, '#ffd21f'); D.text(c, C.fases[12].textoMotor.placa, px + 60, 2, '#1a1020', 4, 'center', false);
    };
    // avenida dos bancos: fachadas genéricas (nomes inventados) com caixa eletrônico
    const TM = C.fases[12].textoMotor;
    const BANCOS = [4, 24, 46, 62, 78, 100].map((tx, i) => ({ x: tx * 16, nome: TM.bancos[i % TM.bancos.length], cor: ['#8a8f99', '#7a6a5a', '#6a7a8a'][i % 3] }));
    const banco = (c, b) => {
      const x = b.x;
      D.r(c, x - 2, 109, 68, 3, '#3a3d45');
      D.box(c, x, 112, 64, 48, b.cor);
      D.r(c, x + 1, 113, 62, 10, '#1a2a4a'); D.text(c, b.nome, x + 32, 116, '#ffd21f', 4, 'center', false);
      D.box(c, x + 6, 128, 12, 14, '#bfe6ff'); D.r(c, x + 11, 129, 1, 12, b.cor);
      D.box(c, x + 24, 130, 16, 30, '#6cc2f1'); D.r(c, x + 31, 131, 1, 29, '#4a90b8'); D.r(c, x + 26, 132, 4, 10, '#d8f0ff');
      // caixa eletrônico
      D.box(c, x + 46, 134, 12, 26, '#5a5f68'); D.r(c, x + 48, 137, 8, 6, '#6cc2f1'); D.r(c, x + 48, 146, 8, 5, '#c4c9d1'); D.r(c, x + 49, 153, 6, 1, '#1a1020');
    };
    // painel de LED: as barras se invertem conforme os contracheques voltam para a fila
    L.ledK = 0;
    const PAINEIS = [34 * 16, 90 * 16];
    const painel = (c, x, G) => {
      const k = L.ledK, P = TM.painel;
      D.r(c, x + 46, 84, 4, 76, '#3a3d45');
      D.box(c, x, 34, 96, 52, '#101418', '#3a3d45');
      D.text(c, P.titulo, x + 48, 38, '#ffb000', 4, 'center', false);
      D.text(c, P.pobre, x + 6, 48, '#ffd21f', 4, 'left', false);
      D.r(c, x + 6, 55, 84, 5, '#2a2f38'); D.r(c, x + 6, 55, Math.round(84 * (1 - k)), 5, '#ff5a3a');
      D.text(c, P.rico, x + 6, 64, '#ffd21f', 4, 'left', false);
      D.r(c, x + 6, 71, 84, 5, '#2a2f38'); D.r(c, x + 6, 71, Math.round(84 * (.1 + .9 * k)), 5, '#3ec04a');
    };
    L.deco = (c, G) => {
      const cam = G.cam, W = G.W;
      if (L.obj) L.ledK += ((L.obj.n / L.obj.max) - L.ledK) * .05;
      for (const b of BANCOS) if (b.x + 70 > cam && b.x - 4 < cam + W) banco(c, b);
      for (const px of PAINEIS) if (px + 100 > cam && px < cam + W) painel(c, px, G);
      // leão correndo
      lionInit(G); const ln = L.lion; if (G.hero.x < CHASE_END && !(L.arena && L.arena.locked)) SL.Bosses.drawLion(c, ln.x, ln.y == null ? 120 : ln.y, ln.t, false, 1, 1);
    };
    return L;
  };

  // ---------- FASE 13 · O Dragão do Retrocesso (cópias da Constituição) ----------
  MK[13] = () => {
    const b = builder(13, 150), L = b.L;
    L.action = 'ink';
    L.inkKind = 'constituicao';
    b.g(0, 112).g(118, 150);
    // um inimigo de cada fase anterior
    b.e('slide', 14, 7).e('caco', 20, 10).e('placa', 26, 10).e('panela', 32, 10).e('moto', 38, 10).e('gear', 46, 10).e('leilao', 52, 10, { kind: 'leilao' });
    b.e('pedra', 60, 10).e('sombra', 66, 10).e('notif', 74, 10).e('tentaculo', 82, 10).e('crusher', 90, 4);
    b.q(8, 6).q(9, 6, 'picanha').q(56, 6, 'star').coins(30, 7, 4).coins(64, 7, 4).p(42, 7, 3).X(70, 8, 2, 2);
    b.cp(58);
    b.hole(104, 112).g(98, 104);
    b.v(102, 6, true).coins(105, 5, 5);
    b.cp(100);
    // plataformas sobre o buraco largo (104–117): caem 3 s depois de pisadas (tremem no último segundo)
    const quedas = [106, 110, 114].map(tx => ({
      x0: tx * 16, y0: 144, x: tx * 16, y: 144, w: 32, h: 8, t: -1, vy: 0,
      update(G) {
        if (this.t < 0) return;
        this.t++;
        if (this.t === 180) G.sfx('break');
        if (this.t > 180 && this.y < 260) { this.vy = Math.min(this.vy + .35, 6); this.y += this.vy; }
      },
      onTouch(G) { if (this.t < 0) { this.t = 0; G.sfx('block'); } },
      draw(c, G) {
        if (this.y > 240) return;
        const sh = this.t > 120 && this.t <= 180 ? ((this.t >> 1) % 2 ? 1 : -1) : 0, x = this.x + sh, y = Math.round(this.y);
        D.r(c, x, y, 32, 8, '#1a1020'); D.r(c, x + 1, y + 1, 30, 6, '#c8a06a');
        for (let i = 4; i < 32; i += 6) D.r(c, x + i, y + 1, 1, 6, '#8a6a3a');
        if (this.t > 120) { D.r(c, x + 9, y + 2, 3, 1, '#5a3a24'); D.r(c, x + 21, y + 4, 4, 1, '#5a3a24'); }
      }
    }));
    quedas.forEach(m => b.m(m));
    L.onRespawn = () => { for (const m of quedas) { m.x = m.x0; m.y = m.y0; m.t = -1; m.vy = 0; } };
    b.arena(['trator']);
    L.obj = null;
    L.update = (G) => {
      if (!L.obj) return;
      const fighting = L.arena.locked && L.boss && L.boss.active && !L.boss.done;
      if (G.state === 'play' && fighting) {
        L.obj.meter -= .045;
        if (L.obj.meter <= 0) {
          L.obj.meter = 50;
          G.save.lives = Math.max(1, G.save.lives - 1); G.persist(); G.sfx('hit'); G.toast('LULA × ' + G.save.lives); G.hudDirty();
        }
      }
      G.hudDirty();
    };
    L.bg = (c, cam, G) => {
      const k = Math.min(1, (L.boss && L.boss.done) ? 1 : cam / (L.w * 16));
      BG.sun(c, G.W * .5, 150 - k * 40, 26, '#ffd9a0');
      const px = 160 - cam * .25;
      BG.congresso(c, px + 200, 150, '#7a7f88'); BG.planalto(c, px + 380, 150, '#7a7f88'); BG.stf(c, px + 40, 150, '#7a7f88');
      if (!(L.boss && L.boss.done)) for (let i = 0; i < 8; i++) { const x = ((i * 70 - cam * .2) % (G.W + 70) + G.W + 70) % (G.W + 70) - 35; D.r(c, x, 30 + (i % 3) * 14, 50, 10, '#4a4f58aa'); }
    };
    // Lula segura uma cópia da Constituição
    L.handItem = (c, G, h) => D.constTiny(c, h.x + (h.face > 0 ? 9 : -5), h.y + 6);
    return L;
  };
  MK[4].hand = (c, G, h) => { const x = h.x + (h.face > 0 ? 9 : -3); D.r(c, x, h.y + 8, 4, 1, '#1a2a6a'); };

  // pós-processamento: meta 13 com barra
  const build0 = SL.Levels.build;
  SL.Levels.build = function (n, G) {
    const L = build0(n, G);
    if (n === 13) L.obj = { label: C.objetivos[13], meter: 100, n: 0, max: 0 };
    if (n === 1) L.handItem = MK[4].hand;
    return L;
  };
})();
