/* scenes.js — abertura, mapas, cutscenes, condenação, multidão, urna e créditos */
(function () {
  const D = SL.D, C = SL.C, K = '#1a1020', BG = SL.BG;
  const $ = id => document.getElementById(id);
  const S = {};
  SL.Scenes = S;
  const spr = (c, sp, pose, face, x, y) => SL.drawSprite(c, sp, pose, face, x, y);
  const walkPose = (t) => Math.floor(t / 8) % 2 ? 'walk' : 'stand';
  function sky(c, W, a, b) { const g = c.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, 192); }
  function ground(c, W, y, top, fill) { D.r(c, 0, y, W, 192 - y, fill); D.r(c, 0, y, W, 4, top); }

  /* ================= abertura ================= */
  S.titleDraw = function (c, G) {
    const W = G.W, t = G.t;
    sky(c, W, '#ff9a6b', '#ffd9a0');
    BG.sun(c, W * .5, 132, 30, '#fff1c8');
    // silhuetas de Brasília
    BG.congresso(c, W * .5 - 8, 150, '#c86a4a');
    BG.planalto(c, W * .5 + 70, 150, '#d87a5a');
    BG.stf(c, W * .5 - 140, 150, '#d87a5a');
    BG.hills(c, t * .2, .3, 170, '#e8a070', 3, W);
    ground(c, W, 150, '#9ccc3c', '#c2703a');
    for (let x = 0; x < W; x += 16) { D.r(c, x + 4, 160, 2, 2, '#a4582a'); D.r(c, x + 11, 172, 2, 2, '#a4582a'); }
    // Lula andando no chão
    if (SL.S) { const lx = ((t * .6) % (W + 40)) - 20; spr(c, SL.S.lula_ato1, walkPose(t), 1, lx, 130); }
  };

  /* ================= mapas ================= */
  const NODES1 = [[40, 132], [96, 100], [158, 128], [218, 96], [284, 118]];
  const NODES2 = [[60, 62], [106, 52], [150, 74], [196, 60], [240, 86], [206, 118], [168, 138], [120, 126], [92, 150], [268, 140]]; // 5..13 + urna(14)
  const M = { pos: null, from: 0, to: 0, k: 1 };
  SL.Map = M;
  const unlocked = (G, n) => {
    const w = G.save.won;
    if (n === 0) return true;
    if (n === 5) return !!G.save.act2;
    if (n === 14) return !!w[13];
    return !!w[n - 1];
  };
  const nodeXY = (G, n) => { const off = (G.W - 336) / 2; const p = n <= 4 ? NODES1[n] : NODES2[n - 5]; return [p[0] + off, p[1]]; };
  M.enter = function (G) {
    let n = G.save.node || 0;
    if (!unlocked(G, n)) n = 0;
    M.cur = n; M.to = n; M.k = 1; M.t = 0;
    M.bar(G);
  };
  M.bar = function (G) {
    const n = M.cur, tk = G.tk;
    if (n === 14) {
      $('mb1').textContent = 'URNA · 25/10';
      $('mb2').textContent = C.urna.confirma;
    } else {
      const ph = C.fases[n];
      $('mb1').textContent = `FASE ${n} · ${ph.ano}`;
      $('mb2').textContent = ph.nome + (G.save.won[n] ? ' ★' : '');
    }
    $('mb3').textContent = tk(C.mapa.entrar);
    $('mb4').textContent = tk(C.mapa.andar.replace('{N}', G.save.lives));
  };
  M.update = function (G) {
    M.t++;
    if (M.k < 1) { M.k = Math.min(1, M.k + .05); if (M.k >= 1) { M.cur = M.to; G.save.node = M.cur; G.persist(); M.bar(G); } return; }
    const act2 = M.cur >= 5;
    const lo = act2 ? 5 : 0, hi = act2 ? 14 : 4;
    if (G.pr.R) {
      if (M.cur < hi && unlocked(G, M.cur + 1)) { M.from = M.cur; M.to = M.cur + 1; M.k = 0; G.sfx('sel'); }
      else if (!act2 && M.cur === 4 && G.save.act2) { G.save.node = 5; G.persist(); G.goMap(); }
    }
    if (G.pr.L) {
      if (M.cur > lo) { M.from = M.cur; M.to = M.cur - 1; M.k = 0; G.sfx('sel'); }
      else if (act2) { G.save.node = 4; G.persist(); G.goMap(); }
    }
    if (G.pr.J) {
      G.sfx('sel');
      if (M.cur === 14) S.urna(G); else G.startPhase(M.cur);
    }
  };
  M.draw = function (c, G, noHero) {
    const W = G.W, t = G.t, act2 = (M.cur != null ? M.cur : G.save.node) >= 5;
    const off = (W - 336) / 2;
    if (!act2) {
      // Brasília estilizada vista de cima, com o Congresso no horizonte
      sky(c, W, '#5aa8ff', '#bfe6ff');
      BG.congresso(c, off + 250, 44, '#f4f2ec'); D.r(c, 0, 44, W, 3, '#dfe4ea');
      D.r(c, 0, 47, W, 145, '#2f78c8');
      c.fillStyle = '#1a6a2a'; c.beginPath(); c.ellipse(W / 2, 124, 160 + off, 66, 0, 0, 7); c.fill();
      c.fillStyle = '#3ec04a'; c.beginPath(); c.ellipse(W / 2, 120, 156 + off, 62, 0, 0, 7); c.fill();
      // eixo monumental e quadras
      D.r(c, off + 20, 118, 300, 6, '#dfe4ea'); D.r(c, W / 2 - 3, 66, 6, 104, '#dfe4ea');
      for (let i = 0; i < 10; i++) D.r(c, off + 30 + i * 28, 104 + (i % 2) * 22, 12, 8, '#2f8a3a');
    } else {
      // Brasil estilizado visto de cima, com a Névoa do Atraso nas regiões não vencidas
      sky(c, W, '#1f78d0', '#5fb2ff');
      c.fillStyle = '#1a6a2a'; poly(c, off, 2); c.fillStyle = '#3ec04a'; poly(c, off, 0);
      for (let n = 5; n <= 13; n++) if (!G.save.won[n]) { const [x, y] = nodeXY(G, n); fog(c, x, y, t, n); }
    }
    // pontinhos entre nós
    const lo = act2 ? 5 : 0, hi = act2 ? 14 : 4;
    for (let n = lo; n < hi; n++) {
      const [ax, ay] = nodeXY(G, n), [bx, by] = nodeXY(G, n + 1);
      for (let k = .15; k < .9; k += .12) D.r(c, ax + (bx - ax) * k - 1, ay + (by - ay) * k - 1, 3, 3, unlocked(G, n + 1) ? '#ffe98a' : '#ffffff55');
    }
    for (let n = lo; n <= hi; n++) {
      const [x, y] = nodeXY(G, n);
      if (n === 14) { D.box(c, x - 9, y - 8, 18, 14, unlocked(G, 14) ? '#efe3c0' : '#8a8f99'); D.r(c, x - 6, y - 5, 8, 6, '#1f4a2a'); D.r(c, x + 4, y - 4, 3, 2, '#2fae4f'); continue; }
      c.fillStyle = K; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
      c.fillStyle = G.save.won[n] ? '#ffd21f' : (unlocked(G, n) ? '#e8412c' : '#8a8f99'); c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
      D.text(c, String(n), x, y - 3, '#fff', 5, 'center', false);
      if (G.save.won[n]) D.r(c, x + 4, y - 9, 4, 4, '#fff');
    }
    if (!act2 && G.save.act2) { const [x, y] = nodeXY(G, 4); D.text(c, '▶ 2027', x + 10, y + 8, '#fff', 5, 'left'); }
    if (act2) { const [x, y] = nodeXY(G, 5); D.text(c, '◀ ATO 1', x - 6, y + 12, '#fff', 5, 'center'); }
    D.text(c, act2 ? 'ATO 2 · BRASIL 2027' : 'ATO 1 · RECONSTRUÇÃO', 10, G.touch ? 30 : 8, '#fff', 6, 'left');
    if (noHero) return;
    const [ax, ay] = nodeXY(G, M.from != null && M.k < 1 ? M.from : M.cur), [bx, by] = nodeXY(G, M.k < 1 ? M.to : M.cur);
    const hx = ax + (bx - ax) * M.k, hy = ay + (by - ay) * M.k;
    const sp = SL.S[(M.cur >= 5 || M.to >= 5) ? 'lula_ato2' : (G.save.won[0] ? 'lula_ato1' : 'lula_prologo')];
    spr(c, sp, M.k < 1 ? walkPose(t) : 'stand', (bx >= ax) ? 1 : -1, hx - 7, hy - 22);
  };
  function poly(c, off, d) {
    const p = [[70, 40], [130, 30], [190, 40], [250, 56], [296, 80], [286, 110], [260, 130], [236, 150], [200, 168], [168, 180], [140, 176], [118, 160], [96, 140], [64, 120], [44, 96], [40, 70]];
    c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x + off + d, y + d) : c.moveTo(x + off + d, y + d)); c.closePath(); c.fill();
  }
  function fog(c, x, y, t, n) { c.fillStyle = 'rgba(150,155,165,.82)'; for (let i = 0; i < 5; i++) { const a = i * 1.3 + n; c.beginPath(); c.arc(x + Math.cos(a) * 12 + Math.sin(t * .01 + i) * 2, y + Math.sin(a) * 7, 11, 0, 7); c.fill(); } }

  /* ================= multidão (N-03) ================= */
  let crowd = null;
  S.crowd = function () {
    if (crowd) return crowd;
    const P = SL.person;
    crowd = [
      P(1, { suit: '#2449c9', pants: '#18215a' }), P(2, { cocar: true, skin: SL.SKINS[1], hair: '#1e1610', suit: '#c8743a', shirt: '#c8743a' }),
      P(3, { hair: '#9a9a9a', long: true }), P(4, { suit: '#f4f2ec', shirt: '#f4f2ec', backpack: true }),
      P(5, { child: true }), P(6, { hair: '#f4f2ec', beard: true }), P(7, { long: true, skin: SL.SKINS[0] }),
      P(8, { child: true, suit: '#ffd21f', shirt: '#ffd21f' }), P(9, { suit: '#3ec04a', shirt: '#3ec04a' }), P(10, { long: true, skin: SL.SKINS[5] }),
      P(11, { cap: '#d8322c' }), P(12, { long: true, hair: '#b5541c' })
    ];
    return crowd;
  };

  /* ================= cutscenes das fases ================= */
  const LEG = C.cutLegendas;
  function fr(n, i, draw, dur) { return { cap: LEG[n][i], draw, dur: dur || 170 }; }
  S.cut = function (n) { return (CUT[n] || (() => []))(); };
  const CUT = [];

  CUT[0] = () => [
    fr(0, 0, (c, t, G) => {
      const W = G.W; c.fillStyle = '#0b0f2e'; c.fillRect(0, 0, W, 192);
      const on = t > 30, sx = W / 2 - 40, sw = W / 2 + 10;
      D.r(c, sx - 4, 22, sw + 8, 100, '#1a1a3a');
      if (on) {
        c.fillStyle = 'rgba(255,255,220,.16)'; c.beginPath(); c.moveTo(82, 140); c.lineTo(sx, 26); c.lineTo(sx, 118); c.fill();
        c.globalAlpha = Math.min(1, (t - 30) / 30); D.ppt(c, sx, 26, sw, 92, false); c.globalAlpha = 1;
      }
      D.box(c, 40, 130, 40, 24, '#c8b48a'); c.fillStyle = on ? '#fff6b0' : '#3a3a3a'; c.beginPath(); c.arc(80, 140, 6, 0, 7); c.fill();
      for (let i = 0; i < 3; i++) D.r(c, 46 + i * 12, 127, 6, 3, '#d8322c');
      ground(c, W, 154, '#c8ccd4', '#9aa0aa');
    }, 150),
    fr(0, 1, (c, t, G) => {
      const W = G.W; c.fillStyle = '#0b0f2e'; c.fillRect(0, 0, W, 192);
      D.ppt(c, 30, 26, W - 60, 120, false);
      ground(c, W, 154, '#c8ccd4', '#9aa0aa');
      SL.drawSprite(c, SL.S.dallagnol, 'stand', -1, W - 40, 134);
    }, 130),
    fr(0, 2, (c, t, G) => {
      const W = G.W; c.fillStyle = '#1a1a3a'; c.fillRect(0, 0, W, 192);
      D.r(c, W / 2 - 70, 110, 140, 44, '#6b3a1e'); D.r(c, W / 2 - 74, 106, 148, 6, '#8a5a30');
      spr(c, SL.S.moro, t > 50 ? 'jump' : 'stand', -1, W / 2 - 9, 88);
      if (t > 50 && t < 80) D.text(c, 'TOC!', W / 2 + 24, 76, '#ffd21f', 8, 'center');
      spr(c, SL.S.lula_prologo, 'stand', -1, W / 2 + 90, 134);
      ground(c, W, 154, '#c8ccd4', '#9aa0aa');
    }, 120)
  ];

  // Palácio do Planalto: prédio baixo e comprido, colunas brancas curvas, rampa reta ligando o chão ao piso principal
  function planalto(c, W, x0, floorY, roofY) {
    const x1 = W - 6;
    D.r(c, x0, roofY - 4, x1 - x0, 5, '#f4f2ec');                // laje de cobertura
    D.r(c, x0 + 8, roofY + 1, x1 - x0 - 16, floorY - roofY - 1, '#7aa0b8'); // vidro recuado
    for (let x = x0 + 10; x < x1 - 8; x += 9) D.r(c, x, roofY + 2, 1, floorY - roofY - 2, '#5a7a90');
    D.r(c, x0 - 4, floorY, x1 - x0 + 4, 5, '#f4f2ec');             // piso principal
    D.r(c, x0 + 6, floorY + 5, x1 - x0 - 12, 160 - floorY - 5, '#d8d4c8');
    // colunas brancas em forma de "folha" (finas no meio, largas nas pontas)
    for (let x = x0 + 2; x < x1 - 4; x += 22) {
      c.fillStyle = '#f4f2ec';
      c.beginPath(); c.moveTo(x - 6, roofY); c.quadraticCurveTo(x, (roofY + floorY) / 2, x - 6, floorY); c.lineTo(x + 6, floorY); c.quadraticCurveTo(x, (roofY + floorY) / 2, x + 6, roofY); c.fill();
      c.beginPath(); c.moveTo(x - 4, floorY + 5); c.quadraticCurveTo(x, (floorY + 160) / 2, x - 4, 160); c.lineTo(x + 4, 160); c.quadraticCurveTo(x, (floorY + 160) / 2, x + 4, floorY + 5); c.fill();
    }
  }
  CUT[1] = () => {
    const P = SL.person;
    // na ordem da fila: o primeiro vai mais longe
    const ppl = [
      { p: P(30, { cocar: true, skin: SL.SKINS[1], hair: '#f4f2ec', suit: '#c8743a', shirt: '#c8743a' }) }, // Raoni
      { p: P(31, { long: true, suit: '#3ec04a', shirt: '#3ec04a' }) },  // Aline Sousa
      { p: P(32, {}), child: true },                                      // o menino Francisco
      { p: P(33, { suit: '#2449c9', shirt: '#2449c9' }) },               // Weslley
      { lula: true },
      { p: P(34, { suit: '#f4f2ec', shirt: '#f4f2ec' }) },               // Murilo
      { p: P(35, { long: true, apron: true, suit: '#e85a9a', shirt: '#e85a9a' }) }, // Jucimara
      { p: P(36, { suit: '#ffd21f', shirt: '#ffd21f' }), wheel: true },  // Ivan Baron
      { p: P(37, { suit: '#9250b4', shirt: '#9250b4', hair: '#9a9a9a', beard: true }) }, // Flávio Pereira
      { dog: true }                                                      // Resistência
    ];
    const N = ppl.length, sp = .75, gap = 16;
    const W0 = SL.G.W, rx0 = 18, ry0 = 160, rx1 = Math.round(W0 * .42), floorY = 112, ry1 = floorY;
    const rampLen = Math.hypot(rx1 - rx0, ry0 - ry1);
    const finalX = (i) => rx1 + 12 + (N - 1 - i) * 15;
    const total = (i) => rampLen + (finalX(i) - rx1);
    const arrive = Math.max(...ppl.map((_, i) => i * gap + total(i) / sp));
    const pos = (i, t) => {
      const d = Math.max(0, Math.min(total(i), (t - i * gap) * sp));
      if (d < rampLen) { const k = d / rampLen; return { x: rx0 + (rx1 - rx0) * k, y: ry0 - (ry0 - ry1) * k, moving: d > 0 && d < total(i) }; }
      return { x: rx1 + (d - rampLen), y: ry1, moving: d < total(i) };
    };
    return [
      { cap: LEG[1][0], dur: Math.ceil(arrive + 70), draw(c, t, G) {
        const W = G.W; sky(c, W, '#ff9a6b', '#ffd9a0');
        BG.sun(c, W * .12, 40, 16, '#fff1c8');
        D.r(c, 0, 160, W, 32, '#9ccc3c');
        planalto(c, W, rx1, floorY, 70);
        // rampa reta com guarda-corpo
        c.fillStyle = '#e4e2dc'; c.beginPath(); c.moveTo(rx0 - 6, 160); c.lineTo(rx1, floorY); c.lineTo(rx1, floorY + 6); c.lineTo(rx0 + 8, 160); c.fill();
        c.strokeStyle = '#bdbab3'; c.beginPath(); c.moveTo(rx0 - 6, 160); c.lineTo(rx1, floorY); c.stroke();
        for (let i = N - 1; i >= 0; i--) {
          const q = ppl[i], ps = pos(i, t), pose = ps.moving ? walkPose(t + i * 3) : 'stand';
          const x = ps.x - 7, fy = ps.y;
          if (q.dog) { const dx = ps.x - 6, dy = fy - 8; D.r(c, dx, dy, 12, 6, K); D.r(c, dx + 1, dy + 1, 10, 4, '#c8843a'); D.r(c, dx + 9, dy - 3, 4, 4, '#c8843a'); D.r(c, dx + 1, dy + 5, 2, 3, '#c8843a'); D.r(c, dx + 8, dy + 5, 2, 3, '#c8843a'); D.r(c, dx - 2, dy - 1, 3, 2, '#c8843a'); continue; }
          if (q.lula) { spr(c, t > arrive ? SL.S.lula_ato1 : SL.S.lula_prologo, pose, 1, x, fy - 20); continue; }
          if (q.wheel) { spr(c, SL.npc(q.p), 'stand', 1, x, fy - 26); D.r(c, x + 1, fy - 10, 12, 4, '#3a3d45'); c.fillStyle = K; c.beginPath(); c.arc(x + 5, fy - 4, 4, 0, 7); c.fill(); continue; }
          spr(c, q.child ? SL.npcChild(q.p) : SL.npc(q.p), pose, 1, x, fy - (q.child ? 14 : 20));
        }
      } },
      fr(1, 1, (c, t, G) => {
        const W = G.W; c.fillStyle = '#3a2a4a'; c.fillRect(0, 0, W, 192);
        for (let i = 0; i < 4; i++) D.box(c, 30 + i * ((W - 60) / 4), 40, (W - 60) / 4 - 10, 34, (G.t >> 4) % 2 ? '#d8322c' : '#7a1a1a');
        for (let i = 0; i < 14; i++) { const x = (i * 53) % W, y = 120 + (i * 17) % 30; c.fillStyle = '#bfe6ff'; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + 4, y); c.lineTo(x + 8, y + 6); c.fill(); }
        ground(c, W, 150, '#9aa0aa', '#6f7580');
        spr(c, SL.S.lula_ato1, 'stand', 1, W / 2 - 7, 130);
      }, 140)
    ];
  };

  // desempregados: cabisbaixos, com currículo na mão
  function jobless(c, i, x, y, face, t) {
    const p = SL.person(i + 70, i % 4 === 0 ? { suit: '#2449c9', pants: '#18215a' } : {});
    spr(c, SL.npc(p), 'stand', face, x, y);
    D.r(c, x + 3, y + 5, 8, 1, '#1a1020'); // olhar para baixo
    D.box(c, x + (face > 0 ? 9 : -2), y + 11, 6, 7, '#ffffff'); D.r(c, x + (face > 0 ? 10 : -1), y + 13, 4, 1, '#9aa0aa');
  }
  CUT[2] = () => [
    fr(2, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#6d7b93', '#b8c2ce');
      const shops = [['#c8a06a', 'FÁBRICA'], ['#e8a0c0', 'SALÃO'], ['#6ac0a0', 'MERCADINHO'], ['#a0b0d8', 'ESCRITÓRIO']];
      const sw = (W - 16) / 4;
      shops.forEach(([col, lab], i) => {
        const x = 8 + i * sw; D.r(c, x, 86, sw - 6, 64, col); D.r(c, x, 80, sw - 6, 8, SL.shade(col, -.3));
        D.text(c, lab, x + (sw - 6) / 2, 81, '#fff', 4, 'center', false);
        D.r(c, x + 6, 100, sw - 18, 50, '#3a3d45'); for (let y = 102; y < 150; y += 4) D.r(c, x + 6, y, sw - 18, 3, '#8a8f99');
        D.box(c, x + (sw - 6) / 2 - 16, 112, 32, 10, '#f4f2ec'); D.text(c, 'FECHADO', x + (sw - 6) / 2, 115, '#d8322c', 4, 'center', false);
      });
      ground(c, W, 150, '#b4bac4', '#8a8f99');
      for (let i = 0; i < 9; i++) jobless(c, i, 14 + i * ((W - 40) / 9), 130, i % 2 ? 1 : -1, t);
    }, 170),
    fr(2, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#6d7b93', '#b8c2ce');
      const bx = W - 120; D.r(c, bx, 60, 112, 90, '#9aa3b4'); D.r(c, bx + 40, 104, 30, 46, '#3a3d45');
      D.box(c, bx + 6, 66, 100, 14, '#2449c9'); D.text(c, 'AGÊNCIA DE EMPREGO', bx + 56, 70, '#fff', 4, 'center', false);
      D.box(c, bx + 28, 86, 56, 12, '#f4f2ec'); D.text(c, 'SEM VAGAS', bx + 56, 89, '#d8322c', 5, 'center', false);
      ground(c, W, 150, '#b4bac4', '#8a8f99');
      const n = 18; for (let i = 0; i < n; i++) jobless(c, i + 9, bx + 30 - i * 15 - ((t * .05) % 1), 130, 1, t);
    }, 170),
    fr(2, 2, (c, t, G) => {
      const W = G.W; sky(c, W, '#5d6b83', '#a8b2be');
      ground(c, W, 150, '#b4bac4', '#8a8f99');
      c.save(); c.translate(0, -10); SL.Bosses.drawRei(c, W / 2 - 22, 34, t, { laugh: (t >> 4) % 2 === 0 }); c.restore();
      D.balloon(c, 'HA HA HA', W / 2 + 40, 60, { size: 6 });
    }, 140)
  ];

  CUT[3] = () => [
    fr(3, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#ffb36b', '#ffe4b0');
      D.r(c, W - 110, 80, 100, 70, '#c8743a'); D.r(c, W - 70, 110, 20, 40, '#5a3a1a');
      D.box(c, W - 106, 84, 92, 12, '#f4f2ec'); D.text(c, 'AÇOUGUE', W - 60, 87, '#d8322c', 5, 'center', false);
      D.r(c, W - 61, 98, 2, 6, '#5a3a24'); D.box(c, W - 84, 100, 48, 11, '#ffd21f'); D.text(c, 'FILA DO OSSO', W - 60, 103, '#1a1020', 4, 'center', false);
      ground(c, W, 150, '#c89a5a', '#8b5a2b');
      for (let i = 0; i < 14; i++) { const x = W - 82 - i * 17; spr(c, SL.npc(SL.person(i + 40)), 'stand', 1, x, 130); }
      const bx = W - 64, by = 140; if ((t >> 4) % 2) { D.r(c, bx, by, 10, 3, '#f4ece0'); D.r(c, bx - 1, by - 1, 3, 5, '#f4ece0'); D.r(c, bx + 8, by - 1, 3, 5, '#f4ece0'); }
    }, 170),
    fr(3, 1, (c, t, G) => {
      const W = G.W; c.fillStyle = '#c8a070'; c.fillRect(0, 0, W, 192);
      for (let i = 0; i < 3; i++) { const x = 30 + i * 46; D.box(c, x, 70, 30, 80, '#f4f2ec'); D.r(c, x + 3, 74, 24, 72, '#cfe6f0'); D.r(c, x + 29, 72, 14, 76, '#e4e2dc'); }
      ground(c, W, 150, '#c89a5a', '#8b5a2b');
      const cx = W - 70, cy = 90 + Math.sin(t * .1) * 3;
      c.fillStyle = K; c.beginPath(); c.ellipse(cx, cy, 29, 24, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx, cy, 28, 23, 0, 0, 7); c.fill();
      D.r(c, cx - 12, cy - 12, 6, 6, K); D.r(c, cx + 6, cy - 12, 6, 6, K); D.r(c, cx - 12, cy + 1, 24, 10, K); D.r(c, cx - 10, cy + 3, 20, 6, '#d8322c');
      D.balloon(c, 'HA HA HA', cx, cy - 26, { size: 6 });
    }, 140)
  ];

  CUT[4] = () => [
    fr(4, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#d9844a', '#ffd9a0');
      for (let i = 0; i < 20; i++) D.r(c, i * 19, 140, 6, 10, '#5a3a24');
      const fx = W / 2 - 60; D.r(c, fx, 70, 120, 80, '#7a7a80'); for (let i = 0; i < 6; i++) D.r(c, fx + i * 20, 62, 12, 8, '#7a7a80'); D.r(c, fx + 46, 110, 28, 40, '#4a4a50');
      ground(c, W, 150, '#5a7a3a', '#5a3a24');
      spr(c, SL.S.salles, 'stand', -1, W / 2 - 7, 42); D.r(c, W / 2 - 14, 50, 8, 5, '#9aa0aa');
      if (t > 30) D.balloon(c, C.fases[4].falaCutscene, W / 2, 40, { size: 6 });
    }, 170),
    fr(4, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#d9844a', '#ffd9a0');
      ground(c, W, 150, '#5a7a3a', '#5a3a24');
      const fx = W - 130; D.r(c, fx, 70, 120, 80, '#7a7a80'); D.r(c, fx + 46 - Math.min(20, t / 4), 110, 28 + Math.min(40, t / 2), 40, '#2a2a30');
      for (let i = 0; i < 5; i++) { const x = fx + 40 - ((t * 1.8 + i * 40) % 260); SL.SKIN.boi.draw(c, { x, y: 136, t: t + i * 3 }, G); }
      for (let i = 0; i < 3; i++) { const x = fx + 30 - ((t * 1.3 + i * 70) % 240); SL.SKIN.moto.draw(c, { x, y: 140 - Math.abs(Math.sin(t * .2 + i)) * 10 }, G); }
    }, 150)
  ];

  // operário de capacete (fábrica) e trabalhadora em home office (computador)
  const OPER = () => SL.person(50, { suit: '#2449c9', pants: '#18215a', cap: '#ffd21f', skin: SL.SKINS[1] });
  const REMOTA = () => SL.person(51, { long: true, suit: '#e85a9a', shirt: '#e85a9a', skin: SL.SKINS[4], hair: SL.HAIRS[1] });
  CUT[5] = () => [
    fr(5, 0, (c, t, G) => {
      const W = G.W, h = Math.floor(W / 2), punch = Math.floor(t / 26), down = (t % 26) < 8, n = Math.min(6, punch);
      // ESQUERDA: fábrica (parede de tijolo, máquinas, esteira com caixas, relógio de ponto de cartão)
      D.r(c, 0, 0, h, 192, '#5a3a3a'); for (let y = 30; y < 150; y += 8) for (let x = (y / 8 % 2) * 8; x < h; x += 16) D.r(c, x, y, 15, 7, '#6a4444');
      D.box(c, 6, 60, 46, 90, '#7a8090'); D.r(c, 12, 68, 34, 10, '#3a3d45'); D.r(c, 14, 82, 8, 8, '#e8c040'); D.r(c, 26, 82, 8, 8, '#d8322c'); c.fillStyle = '#5a5f68'; c.beginPath(); c.arc(29, 112, 9, 0, 7); c.fill();
      D.r(c, 52, 96, h - 52, 5, '#3a3d45'); for (let i = 0; i < 5; i++) { const bx = 52 + ((i * 30 + t * .6) % (h - 60)); D.box(c, bx, 86, 12, 10, '#c8a06a'); }
      D.text(c, 'FÁBRICA', h / 2, 34, '#ffd21f', 6, 'center');
      // relógio de ponto na parede + porta-cartões
      const cx = h - 40; D.box(c, cx, 112, 22, 30, '#c0302a'); D.r(c, cx + 3, 116, 16, 12, '#f4f2ec'); D.r(c, cx + 10, 118, 1, 5, K); D.r(c, cx + 10, 122, 4, 1, K);
      D.r(c, cx + 6, 132, 10, 3, K); D.text(c, 'PONTO', cx + 11, 104, '#fff', 4, 'center');
      for (let i = 0; i < 5; i++) D.r(c, cx + 26 + i * 3, 118, 2, 10, '#f4f2ec');
      D.r(c, 0, 150, h, 42, '#4a3a2a'); D.r(c, 0, 150, h, 3, '#9aa0aa');
      spr(c, SL.npc(OPER()), down ? 'jump' : 'stand', 1, cx - 14, 130 - (down ? 1 : 0));
      D.box(c, cx + 8, down ? 128 : 136, 6, 9, '#f4f2ec'); D.r(c, cx - 2, 141, 10, 2, SL.SKINS[1]);                         // cartão de ponto entrando no relógio
      if (down && t > 8) D.text(c, 'CLACK!', cx - 4, 118, '#ffd21f', 4, 'center');
      // DIREITA: casa (janela, quadro, mesa, cadeira e computador com botão "BATER PONTO")
      D.r(c, h, 0, W - h, 192, '#e8d8b8'); D.r(c, h, 120, W - h, 30, '#d8c8a8');
      D.box(c, h + 12, 44, 40, 30, '#9fd3f5'); D.r(c, h + 31, 44, 2, 30, '#f4f2ec'); D.r(c, h + 12, 58, 40, 2, '#f4f2ec');
      D.r(c, W - 30, 100, 10, 20, '#3a8a3a'); D.r(c, W - 32, 118, 14, 8, '#c8743a');
      D.text(c, 'HOME OFFICE', h + (W - h) / 2, 34, '#2449c9', 6, 'center', false);
      const dx = h + 40; D.r(c, dx, 126, 70, 4, '#8a5a30'); D.r(c, dx + 4, 130, 3, 20, '#6a4a2a'); D.r(c, dx + 63, 130, 3, 20, '#6a4a2a');
      D.box(c, dx + 18, 92, 40, 30, '#1a1020'); D.r(c, dx + 20, 94, 36, 24, '#2a5adf'); D.r(c, dx + 36, 122, 4, 4, '#3a3d45');
      D.box(c, dx + 22, 98, 28, 10, down ? '#3ec04a' : '#f4f2ec'); D.text(c, 'PONTO', dx + 36, 101, down ? '#fff' : '#2449c9', 4, 'center', false);
      if (down) D.r(c, dx + 38, 104, 2, 3, '#ffffff');
      D.r(c, dx - 6, 128, 14, 4, '#3a3d45'); D.r(c, dx - 4, 132, 3, 18, '#3a3d45'); D.r(c, dx - 8, 104, 4, 26, '#3a3d45');
      spr(c, SL.npc(REMOTA()), 'stand', 1, dx - 4, 110);                        // sentada à mesa
      D.r(c, dx + 8, 118 + (down ? 2 : 0), 6, 2, SL.SKINS[4]);                  // mão no mouse
      D.r(c, dx + 12, 122, 5, 3, '#f4f2ec');
      D.r(c, h, 150, W - h, 42, '#b08850');
      D.r(c, h - 1, 0, 2, 192, '#fff');
      D.box(c, W / 2 - 34, 168, 68, 14, '#1a1020'); D.text(c, 'PONTO × ' + n, W / 2, 171, '#ffd21f', 5, 'center', false);
    }, 200),
    fr(5, 1, (c, t, G) => {
      const W = G.W; c.fillStyle = '#4a3f7a'; c.fillRect(0, 0, W, 192);
      const d = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      D.text(c, 'ESCALA 6 × 1', W / 2, 40, '#ffd21f', 6, 'center');
      d.forEach((s2, i) => {
        const x = W / 2 - 112 + i * 32, isDom = i === 6;
        const fly = isDom && t > 110 ? (t - 110) : 0;
        if (isDom && fly > 60) return;
        c.save(); c.globalAlpha = isDom ? Math.max(0, 1 - fly / 60) : 1;
        D.box(c, x, 70 - fly * 1.5, 28, 40, '#f4f2ec');
        D.text(c, s2, x + 14, 76 - fly * 1.5, isDom ? '#d8322c' : '#1a1020', 5, 'center', false);
        if (!isDom && t > 15 + i * 14) { D.r(c, x + 1, 92, 26, 10, '#c0302a'); D.text(c, 'PONTO', x + 14, 95, '#fff', 4, 'center', false); }
        c.restore();
      });
    }, 190)
  ];

  // compradores com chapéu nas cores dos EUA e plaquinha de lance
  function bidder(c, i, x, y, t) {
    spr(c, SL.npc(SL.person(90 + i, { suit: '#2a2a3a', shirt: '#f4f2ec' })), 'stand', -1, x, y);
    D.r(c, x + 2, y - 5, 10, 7, K); D.r(c, x + 3, y - 4, 8, 1, '#c0302a'); D.r(c, x + 3, y - 3, 8, 1, '#f4f2ec'); D.r(c, x + 3, y - 2, 8, 1, '#c0302a'); D.r(c, x + 3, y - 1, 8, 1, '#2449c9'); D.r(c, x, y + 1, 14, 1, K);
    const up = ((t >> 4) + i) % 3 === 0;
    D.r(c, x - 2, y + (up ? -4 : 4), 1, 8, '#5a3a24'); D.box(c, x - 6, y + (up ? -11 : -3), 9, 8, '#f4f2ec'); D.text(c, '$', x - 1.5, y + (up ? -9.5 : -1.5), '#169c3c', 4, 'center', false);
  }
  CUT[6] = () => [
    fr(6, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#4fb2ff', '#ffe9b0');
      BG.congresso(c, W - 70, 150, '#c8d2de');
      ground(c, W, 150, '#dfe4ea', '#b8bec8');
      // faixa e púlpito do leilão
      D.box(c, 20, 24, W - 40, 16, '#1a2a6a'); D.text(c, 'LEILÃO DO BRASIL', W / 2, 26, '#ffd21f', 5, 'center', false); D.text(c, 'COMPRADORES DOS EUA', W / 2, 33, '#ffffff', 4, 'center', false);
      D.box(c, 30, 120, 40, 30, '#8a5a30'); D.r(c, 26, 116, 48, 6, '#6b3a1e');
      spr(c, SL.S.flavio, 'stand', 1, 43, 98);
      const bang = (t % 50) < 8; D.r(c, 62, bang ? 106 : 96, 2, 10, '#5a3a24'); D.box(c, 58, bang ? 112 : 92, 9, 5, '#8a5a30');
      if (bang && t > 10) D.text(c, 'VENDIDO!', 70, 84, '#d8322c', 5, 'left');
      for (let i = 0; i < 6; i++) bidder(c, i, 110 + i * ((W - 140) / 6), 130, t);
    }, 160),
    fr(6, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#4fb2ff', '#ffe9b0');
      ground(c, W, 150, '#dfe4ea', '#b8bec8');
      const items = [['REFINARIA', (x) => { D.r(c, x + 4, 70, 8, 80, '#8a8f99'); D.r(c, x + 16, 96, 24, 54, '#9aa0aa'); }],
        ['USINA', (x) => { D.r(c, x, 100, 46, 50, '#c8d2de'); D.r(c, x + 10, 80, 12, 20, '#c8d2de'); }],
        ['BANCO', (x) => { D.r(c, x, 96, 46, 54, '#e4e2dc'); for (let i = 0; i < 4; i++) D.r(c, x + 4 + i * 11, 104, 4, 46, '#bdbab3'); D.r(c, x - 2, 90, 50, 6, '#bdbab3'); }],
        ['CORREIO', (x) => { D.r(c, x, 104, 46, 46, '#ffd21f'); D.r(c, x + 16, 124, 14, 26, '#2449c9'); }],
        ['ENERGIA', (x) => { D.r(c, x + 22, 60, 3, 90, '#5a5f68'); D.r(c, x + 8, 68, 30, 2, '#5a5f68'); D.r(c, x + 12, 80, 22, 2, '#5a5f68'); }]];
      const sp = (W - 20) / items.length;
      items.forEach(([lab, draw], i) => {
        const x = 10 + i * sp + (sp - 46) / 2; draw(x);
        D.text(c, lab, x + 23, 154, '#1a1020', 4, 'center', false);
        if (t > 20 + i * 22) SL.usTag(c, x - 2, 74 + (i % 2) * 10, 50, 13, 'VENDE-SE');
      });
    }, 170)
  ];

  CUT[7] = () => [
    fr(7, 0, (c, t, G) => {
      const W = G.W; c.fillStyle = '#e8f4f0'; c.fillRect(0, 0, W, 192);
      // a Serpente do Tesouraço (mesmo desenho do chefão) atravessa a farmácia cortando as prateleiras
      const path = (k) => ({ x: W + 50 - k * 1.9, y: 92 + Math.sin(k * .07) * 38 });
      const hd = path(t), nx = path(t + 1), ang = Math.atan2(nx.y - hd.y, nx.x - hd.x);
      for (let j = 0; j < 4; j++) {
        D.r(c, 20, 50 + j * 24, W - 40, 3, '#9ad0c0');
        for (let k = 0; k < 16; k++) { const x = 26 + k * ((W - 52) / 16); const cut = x > hd.x + 10; D.r(c, x, 40 + j * 24, 10, cut ? 4 : 10, cut ? '#bdc3cc' : ['#ffffff', '#ffd21f', '#20aba6', '#e85a9a'][k % 4]); }
      }
      ground(c, W, 150, '#c8d2de', '#aab4c0');
      for (let i = 7; i >= 1; i--) { const p = path(t - 4 - i * 9); SL.Bosses.smallScissor(c, p.x, p.y, t * .15 + i, .5); }
      SL.Bosses.bigScissor(c, hd.x, hd.y, ang, .3 + Math.abs(Math.sin(t * .18)) * .7, ang, false, false);
    }, 220)
  ];

  CUT[8] = () => [
    // a placa de SAÍDA puxa os alunos para fora da escola, um de cada vez
    fr(8, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#ffb36b', '#ffe9b0');
      ground(c, W, 150, '#3ec04a', '#b0703a');
      const sx = 20; D.r(c, sx - 4, 54, 132, 6, '#c8a030'); D.r(c, sx, 60, 124, 90, '#e8c040');
      for (const [wx, wy] of [[10, 72], [88, 72], [10, 104], [88, 104]]) { D.box(c, sx + wx, wy, 24, 18, '#7ab8e0'); }
      D.box(c, sx + 32, 40, 60, 13, '#f4f2ec'); D.text(c, C.fases[8].escola, sx + 62, 42, '#2449c9', 7, 'center', false);
      const dx = sx + 50; D.r(c, dx, 116, 24, 34, '#1a1020'); D.r(c, dx + 2, 118, 20, 32, '#7a4a2a');
      const ex = W - 70, ey = 44 + Math.sin(t * .05) * 3;
      for (let i = 0; i < 5; i++) {
        const t0 = 20 + i * 26, k = t - t0; if (k < 0) continue;
        const x = dx + 6 + k * 1.3; if (x > W + 20) continue;
        spr(c, SL.npc(SL.person(i + 60, { suit: '#f4f2ec', shirt: '#f4f2ec', pants: '#2449c9', backpack: true })), (k >> 3) % 2 ? 'walk' : 'stand', 1, x, 130);
      }
      // braço puxando o aluno da vez
      const cur = Math.min(4, Math.max(0, Math.floor((t - 20) / 26))), k = t - 20 - cur * 26, hx = dx + 14 + Math.max(0, k) * 1.3, hy = 132;
      c.strokeStyle = '#0a3a18'; c.lineWidth = 4; c.beginPath(); c.moveTo(ex - 30, ey + 10); c.lineTo((ex - 30 + hx) / 2, (ey + hy) / 2 - 10); c.lineTo(hx, hy); c.stroke(); c.lineWidth = 1;
      SL.Bosses.drawHand(c, Math.round(hx), hy, true, false);
      SL.Bosses.drawExit(c, ex, Math.round(ey), t, Math.PI * .8, true);
    }, 190),
    // o Pé-de-Meia: a meia enche de moedas e o aluno volta para a escola
    fr(8, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#ffb36b', '#ffe9b0');
      ground(c, W, 150, '#3ec04a', '#b0703a');
      const mx = W / 2 - 20, my = 30, fill = Math.min(1, t / 120);
      // meia gigante
      const sock = () => { c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + 30, my); c.lineTo(mx + 30, my + 70); c.lineTo(mx + 56, my + 82); c.lineTo(mx + 56, my + 100); c.lineTo(mx + 6, my + 100); c.lineTo(mx, my + 90); c.closePath(); };
      c.fillStyle = '#1a1020'; sock(); c.save(); c.translate(0, 0); c.lineWidth = 3; c.strokeStyle = '#1a1020'; c.stroke(); c.restore();
      c.fillStyle = '#f4f2ec'; sock(); c.fill();
      c.save(); sock(); c.clip(); D.r(c, mx - 2, my + 100 - 100 * fill, 60, 100 * fill, '#ffd21f'); for (let i = 0; i < 12; i++) D.r(c, mx + (i * 13) % 54, my + 100 - (i * 7) % Math.max(1, 100 * fill), 4, 2, '#c8a030'); c.restore();
      D.r(c, mx, my, 30, 6, '#d8322c');
      for (let i = 0; i < 4; i++) { const k = (t + i * 30) % 60; if (fill < 1) D.coin(c, mx + 8 + i * 4, my - 40 + k, t + i * 9, true); }
      D.text(c, C.fases[8].peDeMeia, mx + 28, my + 108, '#1a1020', 7, 'center', false);
      // aluno volta para a escola (à esquerda)
      const x = W - 40 - Math.max(0, t - 50) * 1.2;
      spr(c, SL.npc(SL.person(61, { suit: '#f4f2ec', shirt: '#f4f2ec', pants: '#2449c9', backpack: true })), t > 50 ? ((t >> 3) % 2 ? 'walk' : 'stand') : 'stand', -1, x, 130);
      D.r(c, 6, 90, 40, 60, '#e8c040'); D.r(c, 20, 116, 14, 34, '#7a4a2a');
    }, 170)
  ];

  CUT[9] = () => [
    fr(9, 0, (c, t, G) => {
      const W = G.W; c.fillStyle = '#4a2a1a'; c.fillRect(0, 0, W, 192);
      for (let i = 0; i < 26; i++) { const x = (i * 71) % W, y = 20 + (i * 37) % 120; const s = (t + i * 7) % 40 < 20; D.r(c, x, y, 5, 8, i % 2 ? '#9250b4' : '#20aba6'); if (s) D.r(c, x + 1, y + 1, 2, 3, '#fff'); }
      ground(c, W, 150, '#d86a3a', '#b8502a');
    }, 120),
    fr(9, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#5aa8ff', '#bfe6ff');
      D.r(c, 0, 110, W, 40, '#1f78d0');
      D.r(c, W - 60, 96, 40, 14, '#5a5f68'); D.r(c, W - 54, 86, 14, 10, '#5a5f68');
      ground(c, W, 150, '#d86a3a', '#b8502a');
      const dx = 40; D.box(c, dx, 104, 64, 40, '#e8e4dc'); for (let i = 0; i < 5; i++) D.r(c, dx + 1, 112 + i * 6, 62, 3, '#c0302a'); D.r(c, dx + 40, 108, 20, 14, '#2449c9');
      D.r(c, dx + 64, 112, W - 60 - dx - 64, 4, '#8a8f99');
      for (let i = 0; i < 6; i++) { const k = (t * 2 + i * 30) % (W - 60 - dx - 64); D.r(c, dx + 64 + k, 111, 4, 4, i % 2 ? '#9250b4' : '#20aba6'); }
    }, 150)
  ];

  CUT[10] = () => [
    fr(10, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#4fb2ff', '#bfe6ff');
      D.r(c, 0, 120, W, 30, '#1f78d0');
      ground(c, W, 150, '#b4bac4', '#6f7580');
      const goods = [['cafe', 'CAFÉ'], ['carne', 'CARNE'], ['fruta', 'FRUTAS']];
      goods.forEach(([kind, lab], i) => {
        const x = 50 + i * ((W - 100) / 2), drop = Math.min(1, Math.max(0, (t - 30 - i * 30) / 20));
        const sy = 10 + drop * 104;
        const crushed = drop >= 1;
        D.product(c, kind, x, 150, 1.1, crushed ? .3 : 1); D.text(c, lab, x, crushed ? 132 : 112, '#fff', 4, 'center');
        D.r(c, x - 4, 0, 8, sy, '#d8322c'); for (let y = 0; y < sy; y += 6) D.r(c, x - 4, y, 8, 3, '#fff');
        D.box(c, x - 16, sy, 32, 10, '#2449c9'); D.box(c, x - 18, sy + 10, 36, 16, '#e8e0d0'); D.text(c, '50%', x, sy + 14, '#d8322c', 6, 'center', false);
      });
    }, 200)
  ];

  CUT[11] = () => [
    fr(11, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#0b0f2e', '#2a2a5e'); BG.stars(c, W, G.t);
      for (let i = 0; i < 16; i++) { const x = i * 24, hh = 40 + (8 - Math.abs(i - 7)) * 10; D.r(c, x, 160 - hh, 22, hh, ['#c8743a', '#e8c040', '#5aa8ff', '#e85a9a'][i % 4]); D.r(c, x + 6, 160 - hh + 8, 4, 4, '#ffd21f'); }
      const sx = W / 2 - 16, sy = 34; D.box(c, sx, sy, 32, 26, '#8a8f99'); D.r(c, sx + 13, sy + 9, 6, 6, '#5a5f68');
      for (let i = 0; i < 6; i++) { const a = .3 + i * .45, len = Math.min(110, t * 1.2); c.strokeStyle = '#4a1a5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx + 16, sy + 26); c.quadraticCurveTo(sx + 16 + Math.cos(a + 2) * 40, sy + 60, sx + 16 + Math.cos(Math.PI - a) * len, sy + 26 + Math.sin(a) * len * .9); c.stroke(); }
      c.lineWidth = 1;
      ground(c, W, 160, '#9a9aa0', '#5a4a5a');
    }, 200)
  ];

  CUT[12] = () => [
    fr(12, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#ff9a6b', '#ffd9a0');
      BG.city(c, 0, 0, 150, '#e8a07a', 3, W);
      ground(c, W, 150, '#5a5d65', '#3a3d45');
      const P = SL.person; const fila = [P(20, { long: true, suit: '#e85a9a' }), P(21, { suit: '#9250b4' }), P(22, { suit: '#2449c9' }), P(23, { long: true, suit: '#d8322c' })];
      fila.forEach((p, i) => { const x = 50 + i * 60; spr(c, SL.npc(p), 'stand', -1, x, 130); const bit = t > 40 + i * 30; D.box(c, x - 4, 140, 8, 10, '#fff'); if (bit) D.r(c, x + 1, 140, 3, 4, '#3a3d45'); });
      const lx = W + 20 - t * 1.6; SL.Bosses.drawLion(c, lx, 110, t, false, 1, -1);
    }, 200),
    fr(12, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#ff9a6b', '#4a3f7a');
      D.r(c, W / 2 - 60, 50, 120, 142, '#6cc2f1'); for (let y = 56; y < 192; y += 10) D.r(c, W / 2 - 56, y, 112, 2, '#4a90b8');
      D.r(c, W / 2 - 40, 30, 80, 20, '#3a3d45'); for (let i = 0; i < 3; i++) D.box(c, W / 2 - 34 + i * 24, 34, 16, 14, '#ffd21f');
      D.box(c, W / 2 - 28, 18, 56, 10, '#ffd21f'); D.text(c, C.fases[12].textoMotor.placa, W / 2, 21, '#1a1020', 4, 'center', false);
      SL.Bosses.drawLion(c, 20, 132, 0, false, 1, 1);
    }, 130)
  ];

  CUT[13] = () => [
    fr(13, 0, (c, t, G) => {
      const W = G.W; sky(c, W, '#5a5f68', '#8a7f78');
      BG.congresso(c, W / 2, 150, '#7a7f88'); BG.planalto(c, W / 2 + 60, 150, '#7a7f88'); BG.stf(c, W / 2 - 120, 150, '#7a7f88');
      ground(c, W, 150, '#dfe4ea', '#b8bec8');
      c.fillStyle = `rgba(150,155,165,${Math.max(0, .8 - t / 200)})`; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(40 + i * 34, 120 + Math.sin(i) * 10, 26, 0, 7); c.fill(); }
    }, 110),
    fr(13, 1, (c, t, G) => {
      const W = G.W; sky(c, W, '#5a5f68', '#8a7f78');
      ground(c, W, 150, '#dfe4ea', '#b8bec8');
      D.box(c, 30, 70, 48, 80, '#efe3c0'); D.r(c, 34, 74, 5, 72, '#c9b98a'); D.r(c, 44, 90, 26, 3, '#5a3a24'); D.r(c, 44, 100, 26, 2, '#5a3a24');
      const x = W - 20 - Math.min(110, t * .7);
      D.box(c, x, 104, 64, 30, '#8a8f99'); D.box(c, x + 26, 80, 28, 26, '#8a8f99'); D.r(c, x + 29, 83, 22, 14, '#bfe6ff'); spr(c, SL.S.flavio, 'stand', -1, x + 33, 80);
      D.r(c, x + 32, 96, 4, 4, '#ffd21f'); D.r(c, x + 6, 92, 6, 12, '#3a3d45'); D.r(c, x + 14, 90, 6, 14, '#3a3d45');
      c.fillStyle = K; c.beginPath(); c.arc(x + 46, 138, 14, 0, 7); c.arc(x + 12, 142, 9, 0, 7); c.fill();
    }, 150)
  ];

  /* ================= condenação (abertura do Ato 2) ================= */
  S.condenacao = function () {
    const q = C.condenacao.quadros;
    return [
      { cap: q[0], dur: 300, draw(c, t, G) {
        const W = G.W; c.fillStyle = '#2a2a5e'; c.fillRect(0, 0, W, 192);
        // plenário
        for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) D.r(c, W / 2 - 132 + i * 22 + (r % 2) * 11, 120 + r * 12, 14, 8, '#6b3a1e');
        D.r(c, W / 2 - 80, 80, 160, 30, '#8a5a30'); D.r(c, W / 2 - 84, 76, 168, 6, '#6b3a1e');
        for (let i = 0; i < 11; i++) { const x = W / 2 - 75 + i * 14; D.r(c, x, 66, 10, 14, '#17171f'); D.r(c, x + 2, 60, 6, 7, '#f2b98f'); }
        const bang = (t % 90) < 12; D.r(c, W / 2 + 60, bang ? 70 : 56, 14, 8, '#9a6a3a'); D.r(c, W / 2 + 66, bang ? 78 : 64, 2, 12, '#5a3a24');
        if (bang && t > 20) D.text(c, 'TOC!', W / 2 + 90, 54, '#ffd21f', 7, 'center');
      } },
      { cap: q[1], dur: 300, draw(c, t, G) {
        const W = G.W; c.fillStyle = '#3a3a5a'; c.fillRect(0, 0, W, 192);
        ground(c, W, 150, '#9aa0aa', '#6f7580');
        spr(c, SL.S.jair, 'stand', 1, W / 2 - 7, 130);
        const sy = Math.min(70, -60 + t * 2.2);
        D.r(c, W / 2 - 3, sy - 60, 6, 60, '#5a3a24'); D.box(c, W / 2 - 50, sy, 100, 22, '#d8322c'); D.r(c, W / 2 - 46, sy + 18, 92, 3, '#7a1a1a');
        D.text(c, 'INELEGÍVEL', W / 2, sy + 7, '#fff', 7, 'center', false);
      } },
      { cap: q[2], dur: 300, draw(c, t, G) {
        const W = G.W; sky(c, W, '#ff9a6b', '#4a3f7a');
        BG.congresso(c, W / 2 - 40, 150, '#6a4a6a'); BG.planalto(c, W / 2 + 40, 150, '#6a4a6a');
        ground(c, W, 150, '#5a5d65', '#3a3d45');
        // placa PAPUDINHA
        const px = W - 70; D.r(c, px + 22, 108, 3, 42, '#5a5f68'); D.box(c, px, 96, 60, 14, '#169c3c'); D.text(c, 'PAPUDINHA', px + 30, 100, '#fff', 4, 'center', false);
        const vx = Math.min(px - 90, -80 + t * 1.6);
        D.box(c, vx, 122, 80, 22, '#f4f2ec'); D.r(c, vx + 2, 132, 76, 4, '#2449c9'); D.box(c, vx + 30, 110, 40, 14, '#f4f2ec'); D.r(c, vx + 34, 112, 14, 10, '#9fd3f5'); D.r(c, vx + 52, 112, 14, 10, '#9fd3f5');
        // cabeça e ombros de V-05 na janela da viatura
        c.save(); c.beginPath(); c.rect(vx + 34, 112, 14, 10); c.clip(); c.drawImage(SL.S.jair.stand[1], 0, 0, 14, 14, vx + 34, 110, 14, 14); c.restore();
        D.r(c, vx + 32, 108, 8, 3, (t >> 3) % 2 ? '#d8322c' : '#2449c9');
        c.fillStyle = K; c.beginPath(); c.arc(vx + 16, 146, 7, 0, 7); c.arc(vx + 64, 146, 7, 0, 7); c.fill();
      } },
      { cap: q[3], dur: 300, draw(c, t, G) {
        const W = G.W; c.fillStyle = '#1a2a2a'; c.fillRect(0, 0, W, 192);
        for (let i = 0; i < 3; i++) { const x = 20 + i * ((W - 40) / 3); D.box(c, x, 30, (W - 40) / 3 - 10, 40, '#17a34a'); D.r(c, x + 6, 40, 40, 3, '#c8ffc8'); D.r(c, x + 6, 48, 26, 3, '#c8ffc8'); }
        D.r(c, W / 2 - 80, 82, 160, 90, '#5a3a24'); D.r(c, W / 2 - 76, 86, 152, 82, '#1f78d0');
        c.fillStyle = '#3ec04a'; c.beginPath(); c.ellipse(W / 2, 126, 54, 36, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(150,155,165,.85)'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(W / 2 - 40 + i * 13, 120 + Math.sin(i + t * .03) * 8, 12, 0, 7); c.fill(); }
        const k = Math.min(1, t / 120); spr(c, SL.S.flavio, 'stand', 1, W / 2 - 7, 140 - k * 30);
        D.r(c, W / 2 - 2, 151 - k * 30, 4, 4, '#ffd21f');
      } }
    ];
  };

  /* ================= urna, créditos e card final ================= */
  let U = null;
  S.urna = function (G) {
    U = { t: 0, n: 0, phase: 'type' };
    G.L = null;
    G.setState('urna');
    SL.Audio.play('urna');
    $('uCf').classList.remove('blink');
    renderUrna(G);
  };
  function renderUrna(G) {
    const txt = C.urna.texto, s = txt.slice(0, Math.floor(U.n));
    const done = U.n >= txt.length;
    let h = `<div class="u-top">${SL.G.esc('SUPER LULA · ' + C.abertura.subtitulo)}</div>`;
    if (C.urna.titulo) h += `<h2>${SL.G.esc(C.urna.titulo)}</h2>`;
    h += `<p>${SL.G.esc(s)}${done ? '' : '<span style="opacity:.4">▌</span>'}</p>`;
    if (done) h += `<div class="u-hint">${SL.G.esc(G.tk('{PULO} ▶ ' + C.urna.confirma))}</div>`;
    const scr = $('uScr'); scr.innerHTML = h;
    // o texto é longo: acompanha a digitação rolando para baixo
    scr.scrollTop = scr.scrollHeight;
    $('uCf').classList.toggle('blink', done);
  }
  S.urnaStep = function (G) {
    if (!U) return;
    U.t++;
    if (U.phase === 'type') {
      const len = C.urna.texto.length;
      if (U.n < len) { U.n = Math.min(len, U.n + .8); if (G.pr.J) U.n = len; renderUrna(G); if (U.t % 3 === 0) SL.Audio.sfx('type'); return; }
      if (G.pr.J) { SL.Audio.sfx('confirma'); U.phase = 'fim'; U.t = 0; $('uCf').classList.remove('blink'); $('uScr').innerHTML = '<div style="margin:auto;font-family:var(--pixel);font-size:clamp(20px,calc(7*var(--u)),70px);color:#fff">FIM</div>'; }
      return;
    }
    if (U.phase === 'fim') {
      if (U.t > 110) { U = null; G.save.end = true; G.persist(); G.finalCard(); }
      return;
    }
    if (U.phase === 'credits') {
      const cr = $('crawl'); if (!cr) return;
      const scr = $('uScr'), H = scr.clientHeight;
      U.y = (U.y == null ? 0 : U.y) + .45;
      cr.style.transform = `translateY(${-U.y}px)`;
      if (U.y > cr.scrollHeight + H || (U.t > 60 && G.pr.J)) { U = null; G.save.end = true; G.persist(); G.finalCard(); }
    }
  };
  function buildCredits(G) {
    const e = SL.G.esc;
    let h = '<div class="crawl" id="crawl"><div class="cr-big">SUPER LULA</div><div class="cr-big">' + e(C.abertura.subtitulo) + '</div>';
    h += `<p>${e(C.urna.equipe)}</p><div class="cr-big">FONTES</div>`;
    for (const k of C.creditosFontes) { const f = C.fontes[k]; h += `<p class="sm">${f[1] ? `<a href="${e(f[1])}" target="_blank" rel="noopener" style="color:inherit">${e(f[0])}</a>` : e(f[0])}</p>`; }
    h += "</div>";
    $('uScr').innerHTML = h;
  }
  S.urnaBg = function (c, G) { c.fillStyle = '#e6dbbd'; c.fillRect(0, 0, G.W, 192); };
})();
