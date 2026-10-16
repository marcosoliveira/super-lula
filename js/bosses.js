/* bosses.js — chefes (apresentação no motor; aqui: comportamento, ponto fraco, derrota com humor, sem sangue) */
(function () {
  const D = SL.D, C = SL.C, K = '#1a1020';
  const FLOOR = 160;

  function base(G, ar, o) {
    const b = Object.assign({ active: false, done: false, t: 0, inv: 0, dying: 0, ar }, o);
    b.max = b.hp;
    b.hit = function (G, n) {
      if (b.inv > 0 || b.dying) return false;
      b.hp = Math.max(0, b.hp - (n || 1)); b.inv = b.invT || 45;
      G.sfx('pow'); G.shake(8); G.hudDirty();
      b.onHit && b.onHit(G);
      if (b.hp <= 0) { b.dying = 1; G.L.hazards.length = 0; b.onDefeat && b.onDefeat(G); }
      return true;
    };
    b.forceDefeat = (G) => { b.hp = 0; b.dying = 1; G.L.hazards.length = 0; b.onDefeat && b.onDefeat(G); };
    b.update = function (G) {
      b.t++; if (b.inv > 0) b.inv--;
      if (b.dying) {
        b.dying++; b.die && b.die(G);
        if (b.dying > (b.dieT || 150)) { b.done = true; b.cleanup && b.cleanup(G); G.nextBoss(); }
        return;
      }
      b.step(G);
    };
    return b;
  }
  const blink = (G, b) => (G.t >> 2) % 2 === 0;
  const hurtIf = (G, r) => { if (G.overlap(G.hero, r)) G.hurt(); };
  // corpo sólido simples (o herói pode ficar em cima)
  function solidBody(G, r) {
    const h = G.hero;
    if (!G.overlap(h, r)) return false;
    const prevB = h.y + h.h - h.vy;
    if (h.vy >= 0 && prevB <= r.y + 4) { h.y = r.y - h.h; h.vy = 0; h.on = true; return 'top'; }
    if (h.x + h.w / 2 < r.x + r.w / 2) h.x = r.x - h.w; else h.x = r.x + r.w;
    h.vx = 0; return 'side';
  }
  function arcTo(x, y, tx, ty, t) { const vx = (tx - x) / t, vy = (ty - y) / t - .5 * .2 * t; return { vx, vy, g: .2 }; }
  function stars(c, x, y, t) { for (let i = 0; i < 3; i++) { const a = t * .12 + i * 2.1; D.r(c, x + Math.cos(a) * 10, y + Math.sin(a) * 3, 3, 3, '#ffd21f'); } }
  function dust(c, x, y, t) { for (let i = 0; i < 8; i++) { const r = 4 + ((t + i * 7) % 20); c.fillStyle = 'rgba(200,180,140,.6)'; c.beginPath(); c.arc(x + Math.sin(i * 2.3) * 14, y - (i % 3) * 5, r * .5, 0, 7); c.fill(); } }

  const F = {};
  SL.Bosses = { make: (name, G, ar) => F[name](G, ar) };

  /* ---------- Fase 0 · Chefe 1 · Procurador do PowerPoint (V-01) ----------
     O projetor flutua no centro e atira setas em todas as direções (mirando o Lula).
     Para "carregar os slides", desce até o chão ao lado do procurador e fica 5 s:
     é a hora de pular nos 3 botões. */
  F.projetor = (G, ar) => {
    const proX = ar.x1 - 34;
    const homeX = Math.round((ar.x0 + ar.x1) / 2) - 24, homeY = 44;
    const landX = proX - 58, landY = FLOOR - 32;
    let px = homeX, py = homeY, mode = 'fire', mt = 0, volley = 0;
    const btns = [0, 1, 2].map(i => ({ dx: 8 + i * 14, on: false }));
    const shoot = (G, a) => {
      const cx = px + 24, cy = py + 16;
      const z = G.hz({ x: cx - 4, y: cy - 4, w: 8, h: 8, vx: Math.cos(a) * 1.9, vy: Math.sin(a) * 1.9, life: 360, a });
      z.update = (G, z) => { z.x += z.vx; z.y += z.vy; if (z.y < -30 || z.y > FLOOR) z.dead = true; };
      z.draw = (c, G, z) => D.arrow(c, z.x + 4, z.y + 4, z.a, 14);
    };
    const b = base(G, ar, {
      name: C.fases[0].chefeNome[0], hp: 3, invT: 10, dieT: 170,
      step(G) {
        const h = G.hero; mt++;
        if (mode === 'fire') {
          px = homeX + Math.sin(b.t * .02) * 40; py = homeY + Math.sin(b.t * .05) * 4;
          if (mt % 42 === 20) {
            volley++; G.sfx('ink');
            const cx = px + 24, cy = py + 16;
            const ang = Math.atan2(h.y + 9 - cy, h.x + 5 - cx);
            const q = Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);
            if (volley % 3 === 0) for (let k = 0; k < 8; k++) shoot(G, k * Math.PI / 4);
            else shoot(G, q);
          }
          if (mt > 330) { mode = 'down'; mt = 0; G.sfx('suck'); }
        } else if (mode === 'down') {
          px += (landX - px) * .07; py += (landY - py) * .07;
          if (Math.abs(py - landY) < .8 && Math.abs(px - landX) < .8) { px = landX; py = landY; mode = 'rest'; mt = 0; G.sfx('stamp'); G.shake(4); }
        } else if (mode === 'rest') {
          for (const bt of btns) if (!bt.on && G.stomps({ x: px + bt.dx - 3, y: py - 5, w: 14, h: 9 })) { bt.on = true; G.bounce(); G.objInc(); b.hit(G); }
          solidBody(G, { x: px, y: py, w: 48, h: 32 });
          if (mt > 300 && !b.dying) { mode = 'up'; mt = 0; }
        } else if (mode === 'up') {
          px += (homeX - px) * .05; py += (homeY - py) * .05;
          if (Math.abs(py - homeY) < 1) { mode = 'fire'; mt = 0; }
        }
      },
      die(G) { if (b.dying % 8 === 0) G.burst(px + 24, py, '#5a5f68', 3); },
      draw(c, G, intro) {
        // slide projetado na parede do fundo
        if (mode === 'fire' && !b.dying) {
          const sx = ar.x0 + 16, sy = 24, sw = 92, sh = 62;
          c.globalAlpha = .9; D.ppt(c, sx, sy, sw, sh, false); c.globalAlpha = 1;
          c.fillStyle = 'rgba(255,255,220,.10)'; c.beginPath(); c.moveTo(px + 2, py + 16); c.lineTo(sx + sw, sy); c.lineTo(sx + sw, sy + sh); c.fill();
        }
        // procurador ao lado de onde o projetor pousa
        const fx = proX + (b.dying > 40 ? (b.dying - 40) * 1.6 : 0);
        if (fx < ar.x1 + 4) SL.drawSprite(c, SL.S.dallagnol, b.dying > 40 ? (Math.floor(b.dying / 6) % 2 ? 'walk' : 'stand') : 'stand', b.dying > 40 ? 1 : -1, fx, FLOOR - 20);
        // projetor retrô 48 x 32
        const x = Math.round(px), y = Math.round(py);
        if (mode !== 'rest' && !b.dying) { D.r(c, x + 6, y + 32, 4, 3, '#3a3d45'); D.r(c, x + 38, y + 32, 4, 3, '#3a3d45'); }
        D.box(c, x, y, 48, 32, '#c8b48a'); D.r(c, x + 2, y + 20, 44, 10, '#9aa0aa');
        c.fillStyle = K; c.beginPath(); c.arc(x + 2, y + 14, 9, 0, 7); c.fill(); c.fillStyle = b.dying ? '#3a3a3a' : '#bfe6ff'; c.beginPath(); c.arc(x + 2, y + 14, 7, 0, 7); c.fill();
        for (const bt of btns) {
          const vis = mode === 'rest' && !bt.on && blink(G);
          D.r(c, x + bt.dx, y - 4 + (bt.on ? 2 : 0), 8, bt.on ? 2 : 4, K);
          D.r(c, x + bt.dx + 1, y - 3 + (bt.on ? 1 : 0), 6, bt.on ? 1 : 3, bt.on ? '#5a1a1a' : (vis ? '#ffd21f' : '#d8322c'));
        }
        if (mode === 'rest' && !b.dying) {
          const k = Math.min(1, mt / 300);
          D.r(c, x + 4, y + 24, 40, 4, K); D.r(c, x + 5, y + 25, 38 * k, 2, '#3ec04a');
          D.text(c, 'CARREGANDO SLIDES', x + 24, y - 14, '#ffffff', 4, 'center');
        }
        if (b.dying) { for (let i = 0; i < 5; i++) { const r = 6 + ((b.dying + i * 9) % 30); c.fillStyle = 'rgba(60,60,60,.5)'; c.beginPath(); c.arc(x + 24 + Math.sin(i) * 8, y - r, r * .4, 0, 7); c.fill(); } }
      }
    });
    return b;
  };

  /* ---------- Fase 0 · Chefe 2 · Juiz Suspeito (V-02) ---------- */
  F.juiz = (G, ar) => {
    const jx = ar.x1 - 60;
    let slam = 0, stampY = -40;
    const b = base(G, ar, {
      name: C.fases[0].chefeNome[1], hp: 3, invT: 5, dieT: 200,
      step(G) {
        const h = G.hero;
        if (b.t % 120 === 40) slam = 1;
        if (slam) { slam++; if (slam === 30) { G.sfx('stamp'); G.shake(6); const w = G.hz({ x: jx - 14, y: FLOOR - 10, w: 12, h: 10, vx: -2.3, life: 400, wave: true }); w.draw = (c, G, z) => { D.r(c, z.x, z.y + 4, 12, 6, '#ffd21f'); D.r(c, z.x + 3, z.y, 6, 10, '#ffd21f'); D.r(c, z.x + 4, z.y + 2, 4, 6, '#fff6b0'); }; w.update = (G, z) => { z.x += z.vx; if (!z.passed && z.x + z.w < G.hero.x && G.state === 'play') { z.passed = true; b.hit(G); } if (z.x < ar.x0) z.dead = true; }; } if (slam > 44) slam = 0; }
        hurtIf(G, { x: jx + 2, y: FLOOR - 20, w: 12, h: 20 });
      },
      die(G) { if (stampY < FLOOR - 44) stampY += 6; if (stampY >= FLOOR - 44 && !b.stamped) { b.stamped = true; G.sfx('stamp'); G.shake(10); } },
      draw(c, G, intro) {
        SL.drawSprite(c, SL.S.moro, slam > 0 && slam < 30 ? 'jump' : 'stand', -1, jx - 4, FLOOR - 20);
        if (slam > 10 && slam < 34) { const big = slam > 20; D.r(c, jx - 10, FLOOR - (big ? 14 : 28), big ? 12 : 8, big ? 8 : 5, '#9a6a3a'); D.r(c, jx - 4, FLOOR - (big ? 10 : 24), 8, 2, '#5a3a24'); }
        if (b.dying) {
          const sy = Math.min(stampY, FLOOR - 44);
          const words = C.fases[0].textoMotor.carimbo.split(' ');
          D.r(c, jx + 4, sy - 30, 6, 30, '#5a3a24'); D.box(c, jx - 18, sy, 50, 26, '#d8322c'); D.r(c, jx - 16, sy + 23, 46, 2, '#7a1a1a');
          words.forEach((w, i) => D.text(c, w, jx + 7, sy + 4 + i * 9, '#fff', 6, 'center', false));
          if (b.stamped) stars(c, jx + 5, FLOOR - 50, b.dying);
        }
      }
    });
    return b;
  };

  /* ---------- Fase 2 · Rei Desemprego (A-01) ----------
     Um rei sisudo sentado num trono de currículos, com placa "SEM VAGAS" e coroa de placas "FECHADO".
     Ponto fraco: a coroa (acertar com as carteiras de trabalho). A cada acerto o trono encolhe. */
  function drawRei(c, kx, th, t, o) {
    o = o || {};
    // trono de currículos e carteiras de trabalho
    for (let y = 0; y < th; y += 5) {
      const off = (y / 5) % 2 ? 2 : 0;
      D.r(c, kx - 4 + off, FLOOR - 5 - y, 50, 5, K);
      D.r(c, kx - 3 + off, FLOOR - 4 - y, 48, 3, (y / 5) % 3 === 1 ? '#2449c9' : '#f4f2ec');
      if ((y / 5) % 3 !== 1) for (let k = 2; k < 44; k += 6) D.r(c, kx - 1 + off + k, FLOOR - 3 - y, 4, 1, '#9aa0aa');
    }
    if (th >= 14) { D.r(c, kx + 2, FLOOR - Math.round(th / 2) - 5, 40, 8, '#f4f2ec'); D.text(c, 'CURRÍCULOS', kx + 22, FLOOR - Math.round(th / 2) - 3, '#1a1020', 4, 'center', false); }
    const by = FLOOR - th - 30;
    // manto cinza-arroxeado com barra branca
    D.box(c, kx + 4, by + 12, 36, 20, '#5a4a7a'); D.r(c, kx + 5, by + 28, 34, 3, '#f4f2ec'); for (let i = 7; i < 38; i += 5) D.r(c, kx + i, by + 29, 1, 1, K);
    D.r(c, kx + 20, by + 12, 4, 18, '#3a2f5a');
    // rosto emburrado
    D.box(c, kx + 13, by, 18, 14, '#c8c0b0');
    if (o.laugh) { D.r(c, kx + 16, by + 4, 4, 1, K); D.r(c, kx + 24, by + 4, 4, 1, K); D.r(c, kx + 17, by + 8, 10, 4, K); D.r(c, kx + 18, by + 9, 8, 2, '#d8322c'); }
    else { D.r(c, kx + 15, by + 3, 5, 1, K); D.r(c, kx + 24, by + 3, 5, 1, K); D.r(c, kx + 17, by + 5, 2, 2, K); D.r(c, kx + 25, by + 5, 2, 2, K); D.r(c, kx + 18, by + 10, 8, 1, K); D.r(c, kx + 17, by + 11, 1, 1, K); D.r(c, kx + 26, by + 11, 1, 1, K); }
    // coroa de placas "FECHADO" (ponto fraco)
    if (!o.noCrown) {
      const cy = by - 12, col = o.blink ? '#ffe98a' : '#e8d070';
      D.r(c, kx + 4, cy, 36, 12, K); D.r(c, kx + 5, cy + 1, 34, 10, col);
      for (let i = 0; i < 4; i++) { D.r(c, kx + 5 + i * 10, cy - 4, 6, 5, K); D.r(c, kx + 6 + i * 10, cy - 3, 4, 4, col); }
      D.r(c, kx + 6, cy + 3, 32, 6, '#d8322c'); D.text(c, 'FECHADO', kx + 22, cy + 4, '#fff', 4, 'center', false);
    }
    // cetro com a placa "SEM VAGAS"
    D.r(c, kx - 6, by - 6, 2, 36, '#5a3a24'); D.box(c, kx - 30, by - 22, 48, 13, '#f4f2ec');
    D.text(c, 'SEM VAGAS', kx - 6, by - 18, '#d8322c', 4, 'center', false);
  }
  F.rei = (G, ar) => {
    const kx = ar.x1 - 80;
    const b = base(G, ar, {
      name: C.fases[2].chefeNome[0], hp: 3, dieT: 160,
      th() { return 10 + b.hp * 8; },
      step(G) {
        const th = b.th(), crown = { x: kx + 4, y: FLOOR - th - 48, w: 36, h: 18 };
        if (b.t % 85 === 20) {
          const h = G.hero, a = arcTo(kx, FLOOR - th - 30, h.x, FLOOR - 10, 60);
          const kind = (b.t / 85 | 0) % 2;
          G.sfx('throw');
          G.hz({ x: kx, y: FLOOR - th - 30, w: 32, h: 10, vx: a.vx, vy: a.vy, g: a.g, solidDie: true, draw: (c, G, z) => {
            if (kind) { D.box(c, z.x, z.y, 32, 10, '#9aa0aa'); D.r(c, z.x + 1, z.y + 2, 30, 6, '#d8322c'); D.text(c, 'FECHADO', z.x + 16, z.y + 3, '#fff', 4, 'center', false); }
            else { D.r(c, z.x, z.y + 3, 24, 8, K); D.r(c, z.x + 1, z.y + 4, 22, 6, '#e8d070'); for (let i = 0; i < 4; i++) D.r(c, z.x + 1 + i * 6, z.y, 3, 4, '#e8d070'); D.text(c, 'VAGA', z.x + 12, z.y + 5, '#d8322c', 4, 'center', false); } } });
        }
        if (G.shotIn(crown, ['card'])) b.hit(G);
        hurtIf(G, { x: kx, y: FLOOR - th - 32, w: 44, h: th + 32 });
      },
      die(G) { if (b.dying % 5 === 0) G.fx({ kind: 'part', x: kx + 20, y: FLOOR - 30, vx: (Math.random() - .5) * 5, vy: -3 - Math.random() * 3, col: '#f4f2ec', sz: 4, life: 60 }); },
      draw(c, G) {
        if (b.dying > 60) return;
        const th = b.dying ? Math.max(0, 10 - b.dying / 6) : b.th();
        drawRei(c, kx, th, b.t, { blink: b.inv > 0 ? blink(G) : (G.t >> 3) % 2 === 0 });
      }
    });
    return b;
  };
  /* ---------- Fase 3 · Dona Fome (A-02) ---------- */
  F.fome = (G, ar) => {
    const cx = ar.x1 - 70, cy = FLOOR - 40;
    const b = base(G, ar, {
      name: C.fases[3].chefeNome[0], hp: 4, dieT: 180,
      step(G) {
        const h = G.hero, y = cy + Math.sin(b.t * .03) * 6;
        b.y = y;
        // suga a comida da arena: puxa Lula de leve
        const suck = (b.t % 300) > 180;
        G.L.pull = suck ? (h.x < cx ? .45 : -.45) : 0;
        if (suck && b.t % 300 === 181) G.sfx('suck');
        if (b.t % 70 === 10 && !suck) {
          const a = arcTo(cx - 20, y - 10, h.x, FLOOR - 10, 55), k = (b.t / 70 | 0) % 3;
          G.sfx('throw');
          G.hz({ x: cx - 20, y: y - 10, w: 10, h: 6, vx: a.vx, vy: a.vy, g: a.g, solidDie: true, rot: 0, draw: (c, G, z) => { z.rot += .3; c.save(); c.translate(z.x + 5, z.y + 3); c.rotate(z.rot); if (k === 2) { D.r(c, -5, -1, 10, 3, '#f4ece0'); D.r(c, -6, -2, 3, 5, '#f4ece0'); D.r(c, 3, -2, 3, 5, '#f4ece0'); } else { D.r(c, -5, -1, 10, 2, '#bdc3cc'); D.r(c, k ? 2 : -6, -3, 4, 6, '#9aa3ad'); } c.restore(); } });
        }
        // só toma dano do cartão do Bolsa Família, na boca
        if (G.shotIn({ x: cx - 22, y: y - 6, w: 44, h: 26 }, ['bolsa'])) b.hit(G);
        hurtIf(G, { x: cx - 26, y: y - 22, w: 52, h: 44 });
      },
      cleanup(G) { G.L.pull = 0; },
      onDefeat(G) { G.L.pull = 0; },
      draw(c, G) {
        const y = b.y || cy;
        const full = b.dying > 20;
        // garfo e faca como braços
        D.prato(c, cx, y, true);
        if (full) { // prato cheio: arroz, feijão e salada, sorrindo
          D.r(c, cx - 14, y - 6, 12, 10, '#fbfbf2'); D.r(c, cx - 2, y - 4, 10, 9, '#6a3a1a'); D.r(c, cx + 6, y - 9, 9, 8, '#3ec04a'); D.r(c, cx + 9, y - 7, 3, 3, '#d8322c');
          D.r(c, cx - 10, y - 14, 3, 3, K); D.r(c, cx + 7, y - 14, 3, 3, K); D.r(c, cx - 6, y + 8, 12, 2, K); D.r(c, cx - 8, y + 6, 2, 2, K); D.r(c, cx + 6, y + 6, 2, 2, K);
          return;
        }
        const vis = b.inv > 0 ? blink(G) : true;
        D.r(c, cx - 12, y - 12, 6, 6, K); D.r(c, cx + 6, y - 12, 6, 6, K); D.r(c, cx - 10, y - 10, 2, 2, '#fff'); D.r(c, cx + 8, y - 10, 2, 2, '#fff');
        // boca rindo (ponto fraco)
        D.r(c, cx - 12, y + 1, 24, 10, K); D.r(c, cx - 10, y + 3, 20, 6, vis ? '#d8322c' : '#ff8a7a'); D.r(c, cx - 8, y + 1, 4, 2, '#fff'); D.r(c, cx + 4, y + 1, 4, 2, '#fff');
        if ((b.t % 300) > 180) for (let i = 0; i < 4; i++) { const k = ((b.t * 2 + i * 20) % 80); D.r(c, cx - 30 - (80 - k), y + 4 + Math.sin(i) * 8, 3, 1, '#ffffff88'); }
      }
    });
    return b;
  };

  /* ---------- Fase 4 · Ministro da Boiada (V-03) ---------- */
  F.boiada = (G, ar) => {
    const gates = [ar.x0 + 70, ar.x0 + 150, ar.x0 + 230].map(x => ({ x, y: FLOOR - 34, w: 12, h: 34, closed: 0 }));
    const mx = ar.x1 - 30, my = FLOOR - 44;
    const b = base(G, ar, {
      name: C.fases[4].chefeNome[0], hp: 3, invT: 10, dieT: 190,
      step(G) {
        const h = G.hero;
        for (const g of gates) if (!g.closed && G.shotIn({ x: g.x - 4, y: g.y, w: g.w + 8, h: g.h }, ['ink'])) { g.closed = 1; G.sfx('gate'); G.objInc(); b.hit(G); }
        // ondas de bois (sino antes)
        if (b.t % 160 === 20) G.sfx('bell');
        if (b.t % 160 === 60) {
          const boi = SL.mkE('boi', mx - 10, FLOOR, { always: true, vx: -1.9 });
          const up = boi.update; boi.update = (G) => { up(G); for (const g of gates) if (g.closed && boi.x < g.x + g.w && boi.x + boi.w > g.x) { boi.dead = true; G.burst(boi.x, boi.y + 6, '#c8b48a', 8); } if (boi.x < ar.x0) boi.dead = true; };
          G.addEnt(boi);
        }
        SL.mooHerd(G, G.L);
        // papéis "norma revogada"
        if (b.t % 110 === 50) { const a = arcTo(mx, my, h.x, FLOOR - 8, 60); G.hz({ x: mx, y: my, w: 10, h: 8, vx: a.vx, vy: a.vy, g: a.g, solidDie: true, draw: (c, G, z) => { D.box(c, z.x, z.y, 10, 8, '#f4f2ec'); D.r(c, z.x + 2, z.y + 3, 6, 1, '#d8322c'); D.r(c, z.x + 1, z.y + 1, 8, 1, '#d8322c'); } }); }
      },
      onDefeat(G) { for (const e of G.L.ents) if (e.kind === 'boi') e.dead = true; },
      draw(c, G) {
        // torre da fortaleza
        D.box(c, mx - 14, my + 20, 36, FLOOR - my - 20, '#7a7a80'); for (let i = 0; i < 3; i++) D.r(c, mx - 14 + i * 13, my + 14, 9, 6, '#7a7a80');
        for (const g of gates) {
          D.r(c, g.x - 3, g.y - 2, 3, g.h + 2, '#5a3a24'); D.r(c, g.x + g.w, g.y - 2, 3, g.h + 2, '#5a3a24');
          if (g.closed) { for (let i = 0; i < 4; i++) D.r(c, g.x, g.y + 4 + i * 8, g.w, 3, '#c8a06a'); D.r(c, g.x, g.y + 4, 2, 26, '#c8a06a'); }
          else { const col = blink(G) ? '#ffd21f' : '#c8a06a'; for (let i = 0; i < 4; i++) D.r(c, g.x + g.w + 2, g.y + 4 + i * 8, 2, 3, col); c.strokeStyle = 'rgba(255,210,31,.5)'; c.strokeRect(g.x + .5, g.y + .5, g.w, g.h); }
        }
        if (!b.dying) { SL.drawSprite(c, SL.S.salles, 'stand', -1, mx - 6, my); D.r(c, mx - 12, my + 10, 8, 5, '#9aa0aa'); D.r(c, mx - 15, my + 9, 3, 7, '#9aa0aa'); }
        else {
          // a boiada volta e leva o ministro junto: montado num boi, de costas, surpreso, numa nuvem de poeira
          const x = mx - 20 + (b.dying - 20) * 2.2;
          if (x < ar.x1 + 20) {
            const by = FLOOR - 14;
            SL.SKIN.boi.draw(c, { x, y: by, t: b.dying }, G);
            SL.drawSprite(c, SL.S.salles, 'jump', -1, x + 4, by - 16);
            D.r(c, x + 9, by - 9, 3, 3, K);
            dust(c, x + 18, FLOOR - 2, b.dying);
          }
        }
      }
    });
    return b;
  };

  /* ---------- Fase 5 · Relógio de Ponto Infinito (A-03) ---------- */
  F.relogio = (G, ar) => {
    const cx = ar.x0 + 190, cy = 92, R = 32;
    let ang = 0, speed = .012;
    const hands = [0, Math.PI].map(ph => SL.mover({ ax: 0, ay: 0, bx: 0, by: 0, w: 22, style: 'plat' }));
    hands.forEach((m, i) => { m.update = () => { const a = ang + i * Math.PI; m.x = cx + Math.cos(a) * 46 - 11; m.y = cy + Math.sin(a) * 46; }; m.draw = (c) => { D.r(c, m.x, m.y, 22, 6, K); D.r(c, m.x + 1, m.y + 1, 20, 4, '#3a3d45'); }; G.L.movers.push(m); });
    const b = base(G, ar, {
      name: C.fases[5].chefeNome[0], hp: 3, dieT: 150,
      step(G) {
        if (!b.dying) ang += speed;
        const core = { x: cx - 7, y: cy - 7, w: 14, h: 14 };
        if (G.stomps(core)) { G.bounce(true); if (b.hit(G)) speed += .006; }
        // (as engrenagens rolando no chão foram removidas: só as notificações caem do céu)
        if (b.t % 140 === 90 && G.L.ents.filter(e => e.bossNotif && !e.dead).length < 3) { const n = SL.mkE('notif', ar.x0 + 30 + Math.random() * 260, 40, { always: true, bossNotif: true }); G.addEnt(n); }
      },
      cleanup(G) { G.L.movers = G.L.movers.filter(m => !hands.includes(m)); for (const e of G.L.ents) if (e.kind === 'gear' || e.kind === 'notif') e.dead = true; },
      draw(c, G) {
        c.fillStyle = K; c.beginPath(); c.arc(cx, cy, R + 1, 0, 7); c.fill();
        c.fillStyle = '#c0302a'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
        c.fillStyle = '#f4f2ec'; c.beginPath(); c.arc(cx, cy, R - 4, 0, 7); c.fill();
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; D.r(c, cx + Math.cos(a) * (R - 7) - 1, cy + Math.sin(a) * (R - 7) - 1, 2, 2, K); }
        // ponteiros largos (giram, e congelam no sábado na derrota)
        const a = b.dying ? -Math.PI / 2 + .52 : ang;
        c.strokeStyle = K; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a + Math.PI) * 18, cy + Math.sin(a + Math.PI) * 18); c.stroke(); c.lineWidth = 1;
        // olhos
        D.r(c, cx - 14, cy - 16, 6, 6, K); D.r(c, cx + 8, cy - 16, 6, 6, K); D.r(c, cx - 12, cy - 14, 2, 2, '#fff'); D.r(c, cx + 10, cy - 14, 2, 2, '#fff');
        // centro dourado (ponto fraco)
        const vis = b.inv > 0 ? blink(G) : true;
        D.r(c, cx - 7, cy - 7, 14, 14, K); D.r(c, cx - 6, cy - 6, 12, 12, vis ? ((G.t >> 3) % 2 ? '#ffd21f' : '#ffe98a') : '#c89400');
        D.r(c, cx - 5, cy + R + 1, 10, FLOOR - cy - R - 1, '#5a5f68');
        if (b.dying) D.text(c, 'SÁB', cx, cy + 10, '#2449c9', 6, 'center', false);
      }
    });
    return b;
  };

  /* ---------- Fase 6 · O Herdeiro (V-04) ---------- */
  F.herdeiro = (G, ar) => {
    const b = base(G, ar, {
      name: C.fases[6].chefeNome[0], hp: 4, dieT: 170, x: ar.x1 - 60, vx: -.6, warn: 0, swing: 0,
      step(G) {
        const h = G.hero;
        if (b.swing) { b.swing++; if (b.swing === 16) { G.sfx('stamp'); G.shake(5); for (const d of [-1, 1]) { const w = G.hz({ x: b.x + 4, y: FLOOR - 10, w: 12, h: 10, vx: d * 2.2, life: 200, draw: (c, G, z) => { D.r(c, z.x, z.y + 4, 12, 6, '#ffcf4a'); D.r(c, z.x + 3, z.y, 6, 10, '#ffcf4a'); D.r(c, z.x + 4, z.y + 2, 4, 6, '#fff6b0'); } }); w.update = (G, z) => { z.x += z.vx; if (z.x < ar.x0 || z.x > ar.x1) z.dead = true; }; } } if (b.swing > 30) b.swing = 0; }
        else if (b.warn) { if (--b.warn === 0) b.swing = 1; }
        else {
          b.x += b.vx; if (b.x < ar.x0 + 120 || b.x > ar.x1 - 30) b.vx = -b.vx;
          if (b.t % 130 === 60) b.warn = 40;
        }
        if (G.shotIn({ x: b.x, y: FLOOR - 20, w: 14, h: 20 }, ['ink', 'bandeirinha'])) b.hit(G);
        hurtIf(G, { x: b.x + 2, y: FLOOR - 20, w: 10, h: 20 });
      },
      die(G) { b.x += 1.6; },
      draw(c, G) {
        const face = b.dying ? 1 : (G.hero.x < b.x ? -1 : 1);
        if (b.inv > 0 && !blink(G)) return;
        SL.drawSprite(c, SL.S.flavio, b.dying ? (Math.floor(b.t / 6) % 2 ? 'walk' : 'stand') : 'stand', face, b.x, FLOOR - 20);
        // bússola dourada com a cara do pai (pisca antes do golpe)
        const bx = b.dying ? b.x + 30 + b.dying * .4 : b.x + 5, by = b.dying ? FLOOR - 26 - Math.sin(b.dying * .2) * 4 : FLOOR - 9;
        D.r(c, bx - 1, by - 1, 6, 6, K); D.r(c, bx, by, 4, 4, b.warn && (G.t >> 2) % 2 ? '#ffffff' : '#ffd21f'); D.r(c, bx + 1, by + 1, 2, 1, '#5a5f68');
        // martelo de leiloeiro
        if (!b.dying) { const up = b.warn || (b.swing && b.swing < 16); const hx = b.x + (face > 0 ? 12 : -6); D.r(c, hx + 2, FLOOR - (up ? 26 : 14), 2, 10, '#5a3a24'); D.box(c, hx, FLOOR - (up ? 30 : 16), 7, 5, '#8a5a30'); }
      }
    });
    return b;
  };

  /* ---------- Fase 7 · Serpente do Tesouraço (A-04) ----------
     Corpo de tesouras pequenas; a cabeça é uma tesoura 6x maior: os anéis dos dedos são os olhos, as lâminas são a boca.
     Ciclo: flutua → atira 2 tesouras → mira e dá o bote → se errar, a cabeça crava no chão (corpo inofensivo) e o
     jogador pula em cima. 3 acertos vencem. */
  function smallScissor(c, x, y, rot, open) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const o = open == null ? .35 : open;
    c.save(); c.rotate(-o / 2); D.r(c, -1, -1, 8, 2, '#bdc3cc'); c.restore();
    c.save(); c.rotate(o / 2); D.r(c, -1, -1, 8, 2, '#9aa3ad'); c.restore();
    c.fillStyle = '#d8322c'; c.beginPath(); c.arc(-4, -2.5, 2.2, 0, 7); c.arc(-4, 2.5, 2.2, 0, 7); c.fill();
    c.fillStyle = '#1a1020'; c.fillRect(-1, -1, 2, 2);
    c.restore();
  }
  function bigScissor(c, x, y, ang, open, look, stuck, flash) {
    // escala 6x da tesoura pequena: lâminas de ~42 px, anéis de ~9 px de raio
    c.save(); c.translate(x, y); c.rotate(ang);
    const Lb = 42, th = open * .55;
    if (stuck) { c.save(); c.beginPath(); c.rect(-80, -80, 200, 160); }
    for (const sg of [-1, 1]) {
      c.save(); c.rotate(sg * th / 2);
      c.fillStyle = '#1a1020'; c.beginPath(); c.moveTo(-2, -5); c.lineTo(Lb + 2, 0); c.lineTo(-2, 5); c.closePath(); c.fill();
      c.fillStyle = sg < 0 ? (flash ? '#ffffff' : '#dfe4ea') : (flash ? '#ffffff' : '#bdc3cc'); c.beginPath(); c.moveTo(0, -4); c.lineTo(Lb, 0); c.lineTo(0, 4); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(6, sg < 0 ? -2 : 1, Lb - 16, 1);
      // dentes da "boca"
      for (let k = 10; k < Lb - 6; k += 7) { c.fillStyle = '#f4f2ec'; c.fillRect(k, sg < 0 ? 2 : -4, 2, 2); }
      c.restore();
    }
    // braços e anéis dos dedos = olhos
    for (const sg of [-1, 1]) {
      c.fillStyle = '#1a1020'; c.fillRect(-14, sg * 4 - 2, 14, 4); c.fillStyle = '#d8322c'; c.fillRect(-13, sg * 4 - 1, 12, 2);
      const ex = -20, ey = sg * 9;
      c.fillStyle = '#1a1020'; c.beginPath(); c.arc(ex, ey, 10, 0, 7); c.fill();
      c.fillStyle = flash ? '#ff8a7a' : '#d8322c'; c.beginPath(); c.arc(ex, ey, 9, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex, ey, 5.5, 0, 7); c.fill();
      // pupila olhando para o jogador (direção em coordenadas locais)
      const lx = Math.cos(look - ang) * 2.5, ly = Math.sin(look - ang) * 2.5;
      c.fillStyle = '#1a1020'; c.beginPath(); c.arc(ex + lx, ey + ly, 2.5, 0, 7); c.fill();
    }
    // parafuso
    c.fillStyle = '#ffd21f'; c.beginPath(); c.arc(0, 0, 3.5, 0, 7); c.fill(); c.fillStyle = '#1a1020'; c.fillRect(-2, -.5, 4, 1);
    if (stuck) c.restore();
    c.restore();
  }
  F.serpente = (G, ar) => {
    const N = 7, segs = []; for (let i = 0; i < N; i++) segs.push({ x: ar.x1 - 40, y: 60, r: 0 });
    const trail = [];
    let mode = 'float', mt = 0, shots = 0, tgt = null, ang = Math.PI, open = .3;
    const b = base(G, ar, {
      name: C.fases[7].chefeNome[0], hp: 3, invT: 20, dieT: 170, hx: ar.x0 + 220, hy: 56,
      step(G) {
        const h = G.hero, look = Math.atan2(h.y + 9 - b.hy, h.x + 5 - b.hx); mt++;
        if (mode === 'float' || mode === 'shoot') {
          const k = b.t * .018, tx = ar.x0 + 170 + Math.sin(k) * 110, ty = 54 + Math.sin(k * 2.2) * 18;
          b.hx += (tx - b.hx) * .05; b.hy += (ty - b.hy) * .05;
          ang += ((look) - ang) * .08; open = .25 + Math.abs(Math.sin(b.t * .1)) * .35;
          if (mode === 'float' && mt > 130) { mode = 'shoot'; mt = 0; shots = 0; }
          if (mode === 'shoot' && mt % 50 === 20 && shots < 2) { // 2 tesouras por ciclo, bem espaçadas
            shots++; G.sfx('throw'); open = 1;
            const sp = 2.4, dx = h.x + 5 - b.hx, dy = h.y + 9 - b.hy, d = Math.hypot(dx, dy) || 1;
            const z = G.hz({ x: b.hx - 6, y: b.hy - 6, w: 12, h: 12, vx: dx / d * sp, vy: dy / d * sp, life: 300, rot: 0 });
            z.update = (G, z) => { z.x += z.vx; z.y += z.vy; z.rot += .35; if (z.y > FLOOR - 6) z.dead = true; };
            z.draw = (c, G, z) => smallScissor(c, z.x + 6, z.y + 6, z.rot, .5 + Math.sin(z.rot * 2) * .3);
          }
          if (mode === 'shoot' && shots >= 2 && mt > 110) { mode = 'aim'; mt = 0; }
        } else if (mode === 'aim') {
          ang += (look - ang) * .2; open = (mt >> 2) % 2 ? .9 : .2;
          b.hx += Math.sin(mt * 1.3) * .8;
          if (mt > 45) { mode = 'dive'; mt = 0; tgt = { x: h.x + 5, y: FLOOR }; ang = Math.atan2(tgt.y - b.hy, tgt.x - b.hx); G.sfx('suck'); }
        } else if (mode === 'dive') {
          open = .9; const sp = 5.2;
          b.hx += Math.cos(ang) * sp; b.hy += Math.sin(ang) * sp;
          b.hx = Math.max(ar.x0 + 24, Math.min(ar.x1 - 24, b.hx));
          if (b.hy + Math.sin(ang) * 30 >= FLOOR) { mode = 'stuck'; mt = 0; open = .15; G.sfx('stamp'); G.shake(8); G.burst(b.hx + Math.cos(ang) * 30, FLOOR - 2, '#b4bac4', 10); }
          hurtIf(G, { x: b.hx - 22 + Math.cos(ang) * 14, y: b.hy - 14 + Math.sin(ang) * 14, w: 44, h: 28 });
        } else if (mode === 'stuck') {
          open = .15 + Math.abs(Math.sin(mt * .3)) * .1;
          // cabeça presa: pule nos anéis (topo) para atacar; o corpo não machuca
          const top = { x: b.hx - Math.cos(ang) * 20 - 16, y: b.hy - Math.sin(ang) * 20 - 18, w: 32, h: 22 };
          if (G.stomps(top)) { G.bounce(true); if (b.hit(G)) { mode = 'hurt'; mt = 0; segs.pop(); } }
          if (mt > 170) { mode = 'rise'; mt = 0; }
        } else if (mode === 'hurt') {
          // levou o pisão: fica presa piscando por 3 s (inofensiva) para o jogador se reposicionar
          open = .15;
          if (mt > 180) { mode = 'rise'; mt = 0; }
        } else if (mode === 'rise') {
          b.hy += (54 - b.hy) * .06; b.hx += ((ar.x0 + 170) - b.hx) * .03; ang += (look - ang) * .05; open = .3;
          if (b.hy < 62) { mode = 'float'; mt = 0; }
        }
        trail.unshift({ x: b.hx - Math.cos(ang) * 26, y: b.hy - Math.sin(ang) * 26 }); if (trail.length > 120) trail.pop();
        segs.forEach((sg, i) => { const p = trail[Math.min(trail.length - 1, (i + 1) * 9)]; if (p) { sg.x = p.x; sg.y = p.y; } sg.r += .15; });
        if (mode !== 'stuck' && mode !== 'hurt') for (const sg of segs) hurtIf(G, { x: sg.x - 5, y: sg.y - 5, w: 10, h: 10 });
        b.mode = mode;
      },
      die(G) { b.hy = Math.min(FLOOR - 20, b.hy + 1.2); if (b.dying % 6 === 0) G.burst(b.hx, b.hy, '#bdc3cc', 4); },
      draw(c, G) {
        for (let i = segs.length - 1; i >= 0; i--) { const sg = segs[i]; smallScissor(c, sg.x + (b.dying ? Math.sin(b.dying + i) * 3 : 0), sg.y + (b.dying ? b.dying * .3 * (i % 2 ? 1 : .5) : 0), sg.r, .5); }
        const h = G.hero, look = Math.atan2(h.y + 9 - b.hy, h.x + 5 - b.hx);
        const hurtBlink = mode === 'hurt' && !b.dying;
        if (hurtBlink && (G.t >> 2) % 2) { /* pisca: some a cada 4 quadros */ }
        else {
          const flash = (b.inv > 0 || hurtBlink) && blink(G);
          bigScissor(c, b.hx, b.hy, b.dying ? ang + b.dying * .05 : ang, b.dying ? 1 : open, look, mode === 'stuck' || mode === 'hurt', flash);
        }
        if (mode === 'stuck' && !b.dying && blink(G)) { const tx = b.hx - Math.cos(ang) * 20, ty = b.hy - Math.sin(ang) * 20 - 26; D.r(c, tx - 1, ty, 3, 5, '#ffd21f'); D.r(c, tx - 3, ty + 3, 7, 1, '#ffd21f'); D.r(c, tx - 2, ty + 4, 5, 1, '#ffd21f'); D.r(c, tx - 1, ty + 5, 3, 1, '#ffd21f'); }
      }
    });
    return b;
  };

  /* ---------- Fase 8 · A Evasão (A-05) ----------
     Uma placa de SAÍDA gigante com braços. As mãos descem para agarrar os alunos na porta da escola e
     puxá-los para fora; enquanto a mão puxa, pule nela para soltar o aluno. 3 acertos vencem. */
  function drawExit(c, x, y, t, look, angry) {
    // braços ficam por conta de quem chama; aqui só a placa (64 x 28, centro em x,y)
    D.r(c, x - 33, y - 15, 66, 30, '#0a3a18');
    D.r(c, x - 32, y - 14, 64, 28, '#169c3c');
    D.r(c, x - 30, y - 12, 60, 24, '#1fb84a');
    // bonequinho correndo
    const k = (t >> 3) % 2;
    D.r(c, x - 25, y - 9, 4, 4, '#ffffff'); D.r(c, x - 26, y - 5, 5, 7, '#ffffff');
    D.r(c, x - 28 + k, y - 4, 3, 2, '#ffffff'); D.r(c, x - 21, y - 4 + k, 4, 2, '#ffffff');
    D.r(c, x - 27 - k, y + 2, 2, 6, '#ffffff'); D.r(c, x - 22 + k, y + 2, 2, 6, '#ffffff');
    D.r(c, x - 18, y + 7, 4, 2, '#ffffff'); D.r(c, x - 15, y + 6, 1, 4, '#ffffff');
    D.text(c, 'SAÍDA', x + 8, y + 1, '#ffffff', 8, 'center', false);
    // olhos em cima da placa
    for (const sg of [-1, 1]) {
      const ex = x + sg * 11 + 6, ey = y - 18;
      D.r(c, ex - 5, ey - 4, 10, 8, '#0a3a18'); D.r(c, ex - 4, ey - 3, 8, 6, '#ffffff');
      D.r(c, ex - 1 + Math.round(Math.cos(look) * 2), ey - 1 + Math.round(Math.sin(look) * 1.5), 3, 3, '#1a1020');
      if (angry) D.r(c, ex - 5, ey - 5 + (sg > 0 ? 0 : 0), 10, 2, '#0a3a18');
    }
  }
  function drawHand(c, x, y, closed, flash) {
    const col = flash ? '#ffffff' : '#f4f2ec';
    D.r(c, x - 7, y - 5, 14, 11, '#1a1020'); D.r(c, x - 6, y - 4, 12, 9, col);
    if (closed) { D.r(c, x - 6, y + 4, 12, 3, '#1a1020'); D.r(c, x - 5, y + 4, 10, 2, col); }
    else for (let i = 0; i < 4; i++) { D.r(c, x - 6 + i * 3, y + 4, 3, 6, '#1a1020'); D.r(c, x - 5 + i * 3, y + 5, 1, 4, col); }
  }
  F.evasao = (G, ar) => {
    const look = (i) => SL.person(i + 3, { suit: '#f4f2ec', shirt: '#f4f2ec', pants: '#2449c9', backpack: true });
    const kids = [56, 150, 250].map((dx, i) => ({ x: ar.x0 + dx, home: ar.x0 + dx, y: FLOOR - 20, vy: 0, st: 'ok', back: 0, look: look(i), t: 0 }));
    const hands = [1].map((side) => ({ side, st: 'idle', t: 0, x: 0, y: 0, kid: null })); // uma mão só (com duas ficava difícil demais)
    const b = base(G, ar, {
      name: C.fases[8].chefeNome[0], hp: 3, invT: 30, dieT: 170, x: ar.x0 + 160, y: 40,
      step(G) {
        const h = G.hero, fury = 3 - b.hp;
        b.x = ar.x0 + 160 + Math.sin(b.t * .012) * 40; b.y = 40 + Math.sin(b.t * .04) * 3;
        // alunos
        for (const k of kids) {
          k.t++;
          if (k.st === 'ok') { if (Math.abs(k.x - k.home) > 1) k.x += Math.sign(k.home - k.x) * .7; }
          else if (k.st === 'fall') { k.vy = Math.min(k.vy + .3, 5); k.y += k.vy; if (k.y >= FLOOR - 20) { k.y = FLOOR - 20; k.vy = 0; k.st = 'ok'; } }
          else if (k.st === 'gone') { if (--k.back <= 0) { k.st = 'ok'; k.x = k.home; k.y = FLOOR - 20; G.burst(k.x + 6, k.y + 6, '#ffd21f', 8); G.pop(k.x + 6, k.y - 6, C.fases[8].voltou, '#ffd21f'); } }
        }
        // mãos
        for (const hd of hands) {
          const sx = b.x + hd.side * 30, sy = b.y + 10;
          const rest = { x: sx + hd.side * 8, y: sy + 16 };
          hd.t++;
          if (hd.st === 'idle') {
            hd.x += (rest.x - hd.x) * .15; hd.y += (rest.y - hd.y) * .15;
            if (hd.t > 100 - fury * 20) {
              const taken = hands.map(o => o.kid);
              const free = kids.filter(k => k.st === 'ok' && !taken.includes(k));
              if (free.length) { free.sort((p, q) => Math.abs(p.x - sx) - Math.abs(q.x - sx)); hd.kid = free[(b.t >> 3) % Math.min(2, free.length)]; hd.st = 'reach'; hd.t = 0; G.sfx('suck'); }
            }
          } else if (hd.st === 'reach') {
            const tx = hd.kid.x + 6, ty = hd.kid.y + 2, d = Math.hypot(tx - hd.x, ty - hd.y), sp = 1.7 + fury * .5;
            if (d < sp + 1) { hd.st = 'grab'; hd.t = 0; hd.kid.st = 'held'; }
            else { hd.x += (tx - hd.x) / d * sp; hd.y += (ty - hd.y) / d * sp; }
            hurtIf(G, { x: hd.x - 6, y: hd.y - 4, w: 12, h: 10 });
          } else if (hd.st === 'grab' || hd.st === 'pull') {
            if (hd.st === 'grab' && hd.t > 28) { hd.st = 'pull'; hd.t = 0; }
            if (hd.st === 'pull') {
              const d = Math.hypot(sx - hd.x, sy - hd.y), sp = .55 + fury * .15;
              if (d < 6) { hd.kid.st = 'gone'; hd.kid.back = 260; G.sfx('hit'); G.pop(hd.x, hd.y - 10, C.fases[8].evadiu, '#d8322c'); hd.kid = null; hd.st = 'idle'; hd.t = 0; continue; }
              hd.x += (sx - hd.x) / d * sp; hd.y += (sy - hd.y) / d * sp;
            }
            hd.kid.x = hd.x - 6; hd.kid.y = hd.y + 2;
            // pule na mão para soltar o aluno
            if (G.stomps({ x: hd.x - 9, y: hd.y - 7, w: 18, h: 12 })) {
              G.bounce(true); b.hit(G);
              hd.kid.st = 'fall'; hd.kid.vy = 0; hd.kid = null; hd.st = 'back'; hd.t = 0;
              G.burst(hd.x, hd.y, '#ffd21f', 8);
            }
          } else if (hd.st === 'back') {
            hd.x += (rest.x - hd.x) * .12; hd.y += (rest.y - hd.y) * .12;
            if (hd.t > 40) { hd.st = 'idle'; hd.t = 0; }
          }
        }
        // a placa solta panfletos "PRECISA-SE"
        if (b.t % (150 - fury * 30) === 75) {
          const z = G.hz({ x: b.x - 6, y: b.y + 14, w: 14, h: 9, vx: 0, vy: .7, life: 400, harm: true, stompable: true, solidDie: true });
          z.update = (G, z) => { z.y += .7; z.x += Math.sin(z.life * .06) * .8 + Math.sign(G.hero.x - z.x) * .25; };
          z.draw = (c, G, z) => { D.box(c, z.x, z.y, 14, 9, '#f4f2ec'); D.r(c, z.x + 2, z.y + 2, 10, 2, '#d8322c'); D.r(c, z.x + 2, z.y + 5, 7, 1, '#9aa0aa'); };
        }
      },
      die(G) { b.y += .5; for (const k of kids) { if (k.st === 'gone') k.x = k.home; k.st = 'ok'; k.y = Math.min(k.y + 3, FLOOR - 20); } for (const hd of hands) { hd.y += 1.5; } if (b.dying % 8 === 0) G.burst(b.x + (Math.random() - .5) * 60, b.y, '#1fb84a', 4); },
      draw(c, G, intro) {
        const h = G.hero, lk = Math.atan2(h.y - b.y, h.x - b.x);
        const a = b.dying ? Math.max(0, 1 - b.dying / 140) : 1;
        c.globalAlpha = a;
        for (const hd of hands) {
          if (!hd.x && !hd.y) { hd.x = b.x + hd.side * 38; hd.y = b.y + 26; }
          const sx = b.x + hd.side * 30, sy = b.y + 10;
          // braço em zigue-zague (sanfona)
          c.strokeStyle = '#0a3a18'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, sy);
          const n = 5; for (let i = 1; i < n; i++) { const f = i / n; c.lineTo(sx + (hd.x - sx) * f + (i % 2 ? 4 : -4), sy + (hd.y - sy) * f); }
          c.lineTo(hd.x, hd.y); c.stroke();
          c.strokeStyle = '#1fb84a'; c.lineWidth = 2; c.stroke(); c.lineWidth = 1;
        }
        drawExit(c, Math.round(b.x), Math.round(b.y), G.t, lk, b.hp < 3);
        for (const hd of hands) drawHand(c, Math.round(hd.x), Math.round(hd.y), hd.st === 'grab' || hd.st === 'pull', b.inv > 0 && blink(G));
        c.globalAlpha = 1;
        // alunos
        for (const k of kids) {
          if (k.st === 'gone') continue;
          const pose = k.st === 'ok' ? (b.dying ? ((k.t >> 3) % 2 ? 'jump' : 'stand') : (Math.abs(k.x - k.home) > 1 ? ((k.t >> 3) % 2 ? 'walk' : 'stand') : 'stand')) : 'jump';
          SL.drawSprite(c, SL.npc(k.look), pose, h.x < k.x ? -1 : 1, k.x - 1, k.y);
          const tgt = hands.find(hd => hd.kid === k && hd.st === 'reach');
          if (tgt && blink(G)) D.balloon(c, '!', k.x + 6, k.y - 1, { size: 5, col: '#d8322c' });
        }
        // pule na mão que está puxando
        if (!b.dying && !intro) for (const hd of hands) if (hd.st === 'pull' && blink(G)) { const tx = hd.x, ty = hd.y - 16; D.r(c, tx - 1, ty, 3, 5, '#ffd21f'); D.r(c, tx - 3, ty + 3, 7, 1, '#ffd21f'); D.r(c, tx - 2, ty + 4, 5, 1, '#ffd21f'); }
      }
    });
    b._hands = hands; b._kids = kids;
    return b;
  };
  SL.Bosses.drawExit = drawExit;
  SL.Bosses.drawHand = drawHand;

  /* ---------- Fase 9 · Draga Estrangeira (A-06) ---------- */
  F.draga = (G, ar) => {
    const dx = ar.x1 - 76, dy = FLOOR - 40;
    // trilhos (plataforma) para alcançar o motor
    for (let x = 0; x < 5; x++) G.setTile(Math.floor((ar.x0 + 130) / 16) + x, 8, '-');
    const b = base(G, ar, {
      name: C.fases[9].chefeNome[0], hp: 3, dieT: 160,
      step(G) {
        const h = G.hero;
        const suck = (b.t % 260) > 170;
        G.L.pull = suck ? .5 : 0;
        if (suck && b.t % 260 === 171) G.sfx('suck');
        if (!suck && b.t % 80 === 20) { const a = arcTo(dx, dy, h.x, FLOOR - 10, 55); G.hz({ x: dx, y: dy, w: 10, h: 10, vx: a.vx, vy: a.vy, g: a.g, solidDie: true, draw: (c, G, z) => { c.fillStyle = K; c.beginPath(); c.arc(z.x + 5, z.y + 5, 5, 0, 7); c.fill(); c.fillStyle = '#8a5a3a'; c.beginPath(); c.arc(z.x + 5, z.y + 5, 4, 0, 7); c.fill(); } }); }
        if (G.shotIn({ x: dx + 2, y: dy - 10, w: 16, h: 14 }, ['ink'])) { if (b.hit(G)) G.objInc(); }
        hurtIf(G, { x: dx, y: dy, w: 64, h: 40 });
        hurtIf(G, { x: dx - 26, y: FLOOR - 10, w: 26, h: 10 });
      },
      cleanup(G) { G.L.pull = 0; }, onDefeat(G) { G.L.pull = 0; },
      die(G) { if (b.dying % 4 === 0) G.fx({ kind: 'part', x: dx + 30, y: dy, vx: (Math.random() - .5) * 4, vy: -2 - Math.random() * 3, col: '#ffd21f', life: 40 }); },
      draw(c, G) {
        const shake = b.dying ? (Math.random() - .5) * 3 : 0;
        const x = dx + shake;
        D.r(c, x - 4, FLOOR - 3, 72, 3, '#5a5f68');
        D.box(c, x, dy, 64, 40, '#e8e4dc');
        for (let i = 0; i < 5; i++) D.r(c, x + 1, dy + 8 + i * 6, 62, 3, '#c0302a');
        D.r(c, x + 40, dy + 4, 20, 14, '#2449c9'); for (let i = 0; i < 6; i++) D.r(c, x + 42 + (i % 3) * 6, dy + 6 + (i / 3 | 0) * 6, 2, 2, '#fff');
        D.r(c, x + 6, dy + 34, 10, 10, K); D.r(c, x + 46, dy + 34, 10, 10, K);
        // cano de sucção
        D.r(c, x - 26, FLOOR - 10, 28, 8, K); D.r(c, x - 25, FLOOR - 9, 26, 6, '#8a8f99');
        // motor amarelo (ponto fraco)
        const vis = b.inv > 0 ? blink(G) : true;
        D.r(c, x + 2, dy - 10, 16, 14, K); D.r(c, x + 3, dy - 9, 14, 12, vis ? ((G.t >> 3) % 2 ? '#ffd21f' : '#ffe98a') : '#c89400'); D.r(c, x + 6, dy - 6, 8, 2, K);
        D.r(c, x + 22, dy - 6, 6, 6, K); D.r(c, x + 23, dy - 5, 4, 4, '#ffffff');
        if ((b.t % 260) > 170 && !b.dying) for (let i = 0; i < 5; i++) { const k = (b.t * 3 + i * 17) % 60; D.r(c, x - 26 - 60 + k, FLOOR - 8 + (i % 3) * 2, 4, 1, '#ffffffaa'); }
      }
    });
    return b;
  };

  /* ---------- Fase 10 · Carimbos do Tarifaço (A-07) ---------- */
  F.carimbos = (G, ar) => {
    const st = [0, 1, 2].map(i => ({ x: ar.x0 + 60 + i * 90, y: 20, mode: 'wait', t: 0, gone: false }));
    let cur = 0; const cargos = [];
    const b = base(G, ar, {
      name: C.fases[10].chefeNome[0], hp: 3, invT: 10, dieT: 150,
      step(G) {
        const h = G.hero, s = st[cur];
        if (!s || s.gone) return;
        s.t++;
        if (s.mode === 'wait') { s.x += ((h.x - 11) - s.x) * .04; s.x = Math.max(ar.x0, Math.min(ar.x1 - 32, s.x)); if (s.t > 70) { s.mode = 'fall'; s.vy = 0; } }
        else if (s.mode === 'fall') { s.vy = Math.min(s.vy + .5, 7); s.y += s.vy; if (s.y >= FLOOR - 32) { s.y = FLOOR - 32; s.mode = 'rest'; s.t = 0; G.sfx('stamp'); G.shake(8); } }
        else if (s.mode === 'rest') { if (s.t > 90) { s.mode = 'rise'; } }
        else if (s.mode === 'rise') { s.y -= 2; if (s.y <= 20) { s.y = 20; s.mode = 'wait'; s.t = 0; cur = (cur + 1) % 3; while (st[cur].gone) cur = (cur + 1) % 3; } }
        const r = { x: s.x, y: s.y, w: 32, h: 32 };
        if (s.mode === 'rest' && G.stomps({ x: s.x, y: s.y, w: 32, h: 10 })) {
          G.bounce(true);
          if (b.hit(G)) { s.gone = true; G.objInc(); cargos.push({ x: s.x + 8, y: FLOOR - 12, k: cargos.length, t: 0 }); if (b.hp > 0) { cur = (cur + 1) % 3; while (st[cur].gone) cur = (cur + 1) % 3; } }
        } else if (s.mode === 'fall') hurtIf(G, r);
        else if (s.mode === 'rest') solidBody(G, r);
      },
      draw(c, G) {
        // navio brasileiro no horizonte recebe as cargas
        const sx = ar.x1 - 70; D.r(c, sx, 60, 60, 10, '#f4f2ec'); D.r(c, sx, 68, 60, 3, '#169c3c'); D.r(c, sx + 10, 52, 20, 8, '#f4f2ec'); D.r(c, sx + 36, 44, 2, 16, '#5a3a24'); D.r(c, sx + 38, 44, 10, 7, '#169c3c'); D.r(c, sx + 41, 46, 4, 3, '#ffd21f');
        for (const cg of cargos) { cg.t++; const k = Math.min(1, cg.t / 80); const x = cg.x + (sx + 8 + cg.k * 14 - cg.x) * k, y = cg.y + (50 - cg.y) * k - Math.sin(k * Math.PI) * 30; D.product(c, ['cafe', 'carne', 'fruta'][cg.k % 3], x + 6, y + 10, .6); D.text(c, ['CAFÉ', 'CARNE', 'FRUTAS'][cg.k % 3], x + 6, y - 12, '#fff', 4, 'center'); }
        for (let i = 0; i < 3; i++) {
          const s = st[i]; if (s.gone) continue;
          const vis = s.mode === 'rest' ? blink(G) : true;
          D.r(c, s.x + 12, 0, 8, Math.max(0, s.y), '#d8322c'); for (let y = 0; y < s.y; y += 6) D.r(c, s.x + 12, y, 8, 3, '#ffffff');
          D.box(c, s.x, s.y, 32, 12, '#2449c9'); for (let k = 0; k < 6; k++) D.r(c, s.x + 3 + k * 5, s.y + 3 + (k % 2) * 4, 1, 1, '#fff');
          D.box(c, s.x - 2, s.y + 12, 36, 20, vis ? '#e8e0d0' : '#ffffff'); D.text(c, '50%', s.x + 16, s.y + 18, '#d8322c', 6, 'center', false);
          if (s.mode === 'wait') { c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(s.x, FLOOR - 2, 32, 2); }
        }
      }
    });
    return b;
  };

  /* ---------- Fase 11 · Polvo do Cofre (A-08) ---------- */
  // Um cofre-forte de aço com olhos, de onde saem 4 tentáculos cinza, cada um agarrando um saco de dinheiro.
  // Os 4 canos verdes (estilo Mario, saindo do chão) levam o dinheiro até ele: lacrar um cano = 1 dano.
  const VAULT = { k: K, steel: '#7d848f', lite: '#b9c0ca', lite2: '#a3aab4', dark: '#4d525b', dark2: '#5a5f68', door: '#9aa3ad', doorL: '#c9d0d8', doorD: '#6a707a', rivet: '#e4e8ee' };
  function drawVault(c, G, x, y, hero, open, spin) {
    const V = VAULT, R = (a, b, w, h, col) => D.r(c, x + a, y + b, w, h, col);
    // pés
    R(4, 54, 11, 4, V.k); R(37, 54, 11, 4, V.k); R(5, 54, 9, 2, V.dark2); R(38, 54, 9, 2, V.dark2);
    // caixa de aço com bisel
    R(0, 0, 52, 55, V.k); R(1, 1, 50, 53, V.steel);
    R(1, 1, 50, 2, V.lite); R(1, 1, 2, 53, V.lite2); R(1, 52, 50, 2, V.dark); R(49, 1, 2, 53, V.dark2);
    // rebites dos cantos
    for (const [rx, ry] of [[4, 4], [46, 4], [4, 49], [46, 49], [25, 4], [25, 49]]) { R(rx, ry, 2, 2, V.rivet); R(rx + 1, ry + 1, 1, 1, V.dark); }
    // dobradiças
    R(-2, 12, 5, 8, V.k); R(-1, 13, 3, 6, V.lite2); R(-2, 34, 5, 8, V.k); R(-1, 35, 3, 6, V.lite2);
    if (open) {
      // porta escancarada: cofre vazio
      R(6, 7, 40, 41, V.k); R(7, 8, 38, 39, '#20232a'); R(7, 8, 38, 2, '#14161b');
      R(9, 38, 34, 1, '#3a3d45'); R(9, 24, 34, 1, '#3a3d45');
      R(-12, 6, 12, 44, V.k); R(-11, 7, 10, 42, V.door); R(-11, 7, 2, 42, V.doorL); R(-7, 24, 4, 4, V.dark);
      return;
    }
    // porta
    R(6, 7, 40, 41, V.k); R(7, 8, 38, 39, V.door);
    R(7, 8, 38, 1, V.doorL); R(7, 8, 1, 39, V.doorL); R(7, 46, 38, 1, V.doorD); R(44, 8, 1, 39, V.doorD);
    // plaquinha dourada "$"
    R(19, 10, 14, 7, V.k); R(20, 11, 12, 5, '#ffd21f'); R(20, 11, 12, 1, '#fff2a0');
    D.text(c, '$', x + 26, y + 10.5, '#8a6a00', 5, 'center', false);
    // olhos bravos que seguem o herói
    const dx = hero ? Math.max(-1, Math.min(1, Math.round((hero.x - (x + 26)) / 40))) : -1;
    for (const ex of [11, 30]) {
      R(ex, 20, 11, 7, V.k); R(ex + 1, 21, 9, 5, '#ffffff');
      R(ex + 4 + dx * 2, 22, 3, 3, V.k); R(ex + 4 + dx * 2, 22, 1, 1, '#ffffff');
    }
    // sobrancelhas de aço em "V"
    R(10, 17, 4, 2, V.k); R(14, 18, 4, 2, V.k); R(18, 19, 4, 2, V.k);
    R(30, 19, 4, 2, V.k); R(34, 18, 4, 2, V.k); R(38, 17, 4, 2, V.k);
    // segredo (disco com marcações e ponteiro girando)
    const cx = x + 18, cy = y + 37;
    c.fillStyle = V.k; c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill();
    c.fillStyle = '#d6dbe2'; c.beginPath(); c.arc(cx, cy, 7, 0, 7); c.fill();
    c.fillStyle = '#eef1f4'; c.beginPath(); c.arc(cx - 1, cy - 1, 4.5, 0, 7); c.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; D.r(c, cx + Math.cos(a) * 5.6 - .5, cy + Math.sin(a) * 5.6 - .5, 1, 1, V.dark); }
    const ang = G.t * .03 + spin;
    c.strokeStyle = '#d8322c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * 5, cy + Math.sin(ang) * 5); c.stroke(); c.lineWidth = 1;
    D.r(c, cx - 1, cy - 1, 2, 2, V.k);
    // manivela de 3 raios
    const hx = x + 36, hy = y + 37, ha = -G.t * .02 - spin * .5;
    c.strokeStyle = V.k; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { const a = ha + i * 2.094; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + Math.cos(a) * 6, hy + Math.sin(a) * 6); c.stroke(); }
    c.strokeStyle = '#ffd21f'; c.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) { const a = ha + i * 2.094; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + Math.cos(a) * 5.4, hy + Math.sin(a) * 5.4); c.stroke(); }
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) { const a = ha + i * 2.094; D.r(c, hx + Math.cos(a) * 6 - 1.5, hy + Math.sin(a) * 6 - 1.5, 3, 3, V.k); D.r(c, hx + Math.cos(a) * 6 - .5, hy + Math.sin(a) * 6 - .5, 1, 1, '#ffd21f'); }
    D.r(c, hx - 2, hy - 2, 4, 4, V.k); D.r(c, hx - 1, hy - 1, 2, 2, '#ffd21f');
  }
  // tentáculo cinza que sai do cofre: grosso na base, fino e enrolado na ponta, com ventosas claras por baixo
  function drawArm(c, G, rx, ry, a0, curl, len, ph, bag, alpha) {
    const N = 16, step = len / N, pts = [];
    let x = rx, y = ry, a = a0;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push({ x, y, a, r: 4.6 * (1 - t) + 1.1 });
      a = a0 + curl * t * t * 1.6 + Math.sin(G.t * .05 + ph + t * 3) * .35 * t;
      x += Math.cos(a) * step; y += Math.sin(a) * step;
    }
    c.save(); c.globalAlpha = alpha;
    c.fillStyle = K; for (const p of pts) { c.beginPath(); c.arc(p.x, p.y, p.r + 1, 0, 7); c.fill(); }
    c.fillStyle = '#8a8f99'; for (const p of pts) { c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
    // brilho no dorso
    c.fillStyle = '#b9c0ca';
    for (let i = 0; i < N - 2; i++) { const p = pts[i], nx = Math.sin(p.a), ny = -Math.cos(p.a); c.beginPath(); c.arc(p.x - nx * p.r * .45 * Math.sign(curl || 1), p.y - ny * p.r * .45 * Math.sign(curl || 1), p.r * .35, 0, 7); c.fill(); }
    // ventosas na barriga
    for (let i = 1; i < N - 1; i += 2) {
      const p = pts[i], nx = Math.sin(p.a), ny = -Math.cos(p.a), sx = p.x + nx * p.r * .55 * Math.sign(curl || 1), sy = p.y + ny * p.r * .55 * Math.sign(curl || 1), rr = Math.max(.8, p.r * .32);
      c.fillStyle = '#5f656f'; c.beginPath(); c.arc(sx, sy, rr + .5, 0, 7); c.fill();
      c.fillStyle = '#e4e8ee'; c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill();
    }
    if (bag) {
      // saco de dinheiro agarrado pela ponta
      const p = pts[N - 3];
      const bx = Math.round(p.x), by = Math.round(p.y) + 1;
      c.fillStyle = K; c.beginPath(); c.arc(bx, by + 4, 5.5, 0, 7); c.fill();
      c.fillStyle = '#d8a83a'; c.beginPath(); c.arc(bx, by + 4, 4.5, 0, 7); c.fill();
      c.fillStyle = '#f2cf6a'; c.beginPath(); c.arc(bx - 1.5, by + 2.5, 1.8, 0, 7); c.fill();
      D.r(c, bx - 2, by - 2, 4, 2, K); D.r(c, bx - 1, by - 1, 2, 1, '#d8a83a');
      D.text(c, '$', bx, by + 1.5, '#6a4a00', 4, 'center', false);
    }
    c.restore();
  }
  F.polvo = (G, ar) => {
    const X0 = ar.x0orig != null ? ar.x0orig : ar.x0, T0 = Math.floor(X0 / 16);
    const vx = ar.x1 - 80, vy = FLOOR - 58;
    // plataformas para alcançar a boca dos canos altos
    for (let x = 0; x < 3; x++) { G.setTile(T0 + 4 + x, 7, '-'); G.setTile(T0 + 10 + x, 7, '-'); }
    // canos do Mario saindo do chão (tiles sólidos 'Y': dá para subir neles).
    // Baixos: 2 tiles, qualquer tiro conta. Altos: 4 tiles, só a parte de cima (boca) conta — suba na plataforma ao lado.
    if (!G.SOLID.has('Y')) G.SOLID.add('Y');
    const pipes = [
      { tx: T0 + 3, top: 8, hitRows: [8, 9] },
      { tx: T0 + 7, top: 6, hitRows: [6, 7] },
      { tx: T0 + 9, top: 8, hitRows: [8, 9] },
      { tx: T0 + 13, top: 6, hitRows: [6, 7] }
    ].map((p, i) => Object.assign(p, { i, done: false, x: p.tx * 16, y: p.top * 16, h: FLOOR - p.top * 16 }));
    for (const p of pipes) for (let ty = p.top; ty < 10; ty++) G.setTile(p.tx, ty, 'Y');
    const L = G.L, prevDraw = L.drawTile;
    L.drawTile = (c, ch, x, y, tx, ty) => { if (ch === 'Y') return; prevDraw && prevDraw(c, ch, x, y, tx, ty); };
    L.onShotTile = (G, s, tx, ty, ch) => {
      if (ch !== 'Y' || s.kind !== 'ink' || b.dying) return;
      const p = pipes.find(p => p.tx === tx);
      if (!p || p.done || !p.hitRows.includes(ty)) return;
      p.done = true; safes[p.i].full = false; G.sfx('break'); G.objInc(); G.burst(p.x + 8, p.y + 4, '#3ec04a', 8); b.spin = 6; b.hit(G);
    };
    const safes = [0, 1, 2, 3].map(i => ({ full: true, a: i }));
    // raiz, ângulo inicial e curvatura de cada braço (o braço i segura o dinheiro do cano i)
    const ARMS = [
      { rx: 2, ry: 44, a0: Math.PI + .1, curl: .9, ph: 0 },
      { rx: 2, ry: 22, a0: Math.PI + .45, curl: .8, ph: 1.7 },
      { rx: 14, ry: 2, a0: -Math.PI / 2 - .55, curl: -.9, ph: 3.1 },
      { rx: 40, ry: 2, a0: -Math.PI / 2 + .25, curl: .9, ph: 4.4 }
    ];
    const b = base(G, ar, {
      name: C.fases[11].chefeNome[0], hp: 4, invT: 10, dieT: 150, spin: 0,
      step(G) {
        if (b.spin > 0) b.spin = Math.max(0, b.spin - .08);
        // tentáculo cinza sai do bueiro embaixo do herói
        if (b.t % 150 === 50) {
          const x = G.hero.x - 4;
          G.sfx('suck');
          const z = G.hz({ x, y: FLOOR - 24, w: 8, h: 24, life: 90, harm: false, t0: 0 });
          z.update = (G, z) => { z.t0++; z.harm = z.t0 > 35 && z.t0 < 80; };
          z.draw = (c, G, z) => {
            const k = z.t0 < 35 ? 0 : Math.min(1, (z.t0 - 35) / 10) * (z.t0 > 75 ? Math.max(0, (90 - z.t0) / 15) : 1);
            D.r(c, z.x - 4, FLOOR - 2, 16, 2, K); D.r(c, z.x - 3, FLOOR - 2, 14, 1, z.t0 < 35 && (G.t >> 2) % 2 ? '#ffd21f' : '#5a5f68');
            SL.drawTent(c, z.x, FLOOR, Math.round(24 * k), z.t0, 24);
          };
        }
        hurtIf(G, { x: vx + 2, y: vy + 2, w: 48, h: 54 });
      },
      die(G) {},
      cleanup(G) { L.drawTile = prevDraw; L.onShotTile = null; },
      draw(c, G) {
        for (const p of pipes) SL.drawPipe(c, p.x, p.y, 16, p.h, p.done, G.t, p.i * 7);
        const shake = b.inv > 0 ? Math.round(Math.sin(G.t * 2.3) * 1.5) : 0;
        if (b.dying) {
          const a = Math.max(0, 1 - b.dying / 60);
          ARMS.forEach((A, i) => drawArm(c, G, vx + A.rx, vy + A.ry, A.a0 + (1 - a) * .9, A.curl, 14 + 16 * a, A.ph, false, a));
          drawVault(c, G, vx + (a > 0 ? Math.round(Math.sin(G.t) * 2 * a) : 0), vy, G.hero, b.dying > 40, 0);
          return;
        }
        ARMS.forEach((A, i) => {
          const s = safes[i];
          drawArm(c, G, vx + A.rx + shake, vy + A.ry, s.full ? A.a0 : A.a0 + (A.a0 < 0 ? .9 : -.7), s.full ? A.curl : A.curl * 1.6, s.full ? 30 : 17, A.ph, s.full, 1);
        });
        drawVault(c, G, vx + shake, vy, G.hero, false, b.spin);
      }
    });
    return b;
  };

  /* ---------- Fase 12 · O Leão Faminto (A-09) ---------- */
  // paleta do leão (laranja de desenho, sem logo)
  const LION_PAL = { body: '#f0a050', back: '#d07a30', face: '#f4a858', mane: '#a0521e', tuft: '#7a3a14' };
  // Desenhado virado para a direita (64 x 40, pés em y+40); face < 0 espelha para a esquerda.
  function drawLion(c, x, y, t, sleep, sc, face) {
    c.save(); c.translate(Math.round(x), Math.round(y)); if (sc && sc !== 1) c.scale(sc, sc);
    if (face < 0) { c.translate(64, 0); c.scale(-1, 1); }
    const P = LION_PAL, R = (a, b, w, h, col) => D.r(c, a, b, w, h, col);
    const step = sleep ? 0 : Math.floor(t / 6) % 2;
    // rabo caindo com tufo
    R(6, 15, 5, 2, K); R(4, 16, 3, 9, K); R(5, 16, 1, 9, P.body);
    R(0, 24, 7, 7, K); R(1, 25, 5, 5, P.tuft);
    // pernas (as de trás mais escuras)
    const legs = sleep ? [[18, P.back, 0], [44, P.back, 0], [11, P.body, 0], [37, P.body, 0]]
      : [[18, P.back, step * 2], [44, P.back, (1 - step) * 2], [11, P.body, (1 - step) * 2], [37, P.body, step * 2]];
    for (const [lx, col, lift] of legs) D.box(c, lx, 29, 7, sleep ? 5 : 11 - lift, col);
    // corpo com quina arredondada
    D.box(c, 10, 13, 42, 18, P.body);
    R(10, 13, 2, 1, K); R(10, 14, 1, 1, K); R(11, 14, 1, 1, K);
    // juba em blocos
    R(37, -3, 24, 29, K); R(39, -5, 20, 33, K); R(35, -1, 28, 25, K);
    R(38, -2, 22, 27, P.mane); R(40, -4, 18, 31, P.mane); R(36, 0, 26, 23, P.mane);
    // rosto quadrado com orelhinhas
    R(41, -1, 4, 4, K); R(55, -1, 4, 4, K); R(42, 0, 2, 2, P.face); R(56, 0, 2, 2, P.face);
    D.box(c, 41, 1, 18, 17, P.face);
    if (sleep) {
      R(44, 7, 4, 1, K); R(52, 7, 4, 1, K);
      R(49, 11, 2, 1, K); R(48, 14, 4, 1, K);
    } else {
      R(45, 5, 2, 4, K); R(53, 5, 2, 4, K);
      R(48, 10, 4, 2, K); R(49, 12, 2, 1, K);
      // mordida no contracheque
      const mo = Math.floor(t / 8) % 2;
      R(46, 14, 8, 1 + mo, K);
      D.box(c, 51, 14 + mo, 6, 7, '#f4f2ec'); R(52, 16 + mo, 3, 1, '#8a8f99');
    }
    c.restore();
  }
  F.leao = (G, ar) => {
    const L = G.L;
    // 4 cofres dourados pendurados no teto (batidos por baixo, como bloco "?")
    const sx = [ar.x0 + 48, ar.x0 + 112, ar.x0 + 192, ar.x0 + 256].map(x => Math.floor(x / 16));
    sx.forEach(x => G.setTile(x, 6, 'K'));
    L.drawTile = (c, ch, x, y) => { if (ch === 'K') { D.r(c, x + 7, 0, 2, y, '#5a5f68'); D.box(c, x, y, 16, 16, (G.t >> 3) % 2 ? '#ffd21f' : '#ffe37a'); D.r(c, x + 6, y + 5, 4, 4, '#8a6a00'); D.r(c, x + 7, y + 9, 2, 3, '#8a6a00'); } };
    const coins = [];
    L.onBump = (G, tx, ty, ch) => {
      if (ch !== 'K') return;
      G.setTile(tx, ty, 'U'); G.sfx('coin');
      for (let i = 0; i < 6; i++) coins.push({ x: tx * 16 + 4 + i * 2, y: ty * 16 + 16, vy: -1 - Math.random(), vx: (Math.random() - .5) * 2.4, on: false });
      b.eatX = tx * 16; b.eat = 160; b.roar = 0; b.warn = 0; b.lunge = 0; b.hit(G);
    };
    // o leão aspira as moedas até a boca (acelerando) e engole quando chegam
    const pullCoins = () => {
      const mx = b.x + (b.face > 0 ? 54 : 6), my = FLOOR - 26;
      for (let i = coins.length - 1; i >= 0; i--) {
        const cn = coins[i], dx = mx - cn.x, dy = my - cn.y, d = Math.hypot(dx, dy);
        cn.ps = (cn.ps || .5) + .12;
        if (d < 6) { coins.splice(i, 1); continue; }
        const st = Math.min(d, cn.ps); cn.x += dx / d * st; cn.y += dy / d * st; cn.on = false;
      }
    };
    const b = base(G, ar, {
      name: C.fases[12].chefeNome[0], hp: 4, zz: 0, invT: 10, dieT: 220, x: ar.x1 - 90, vx: -1, eat: 0, lunge: 0, face: -1,
      step(G) {
        const h = G.hero, ox = b.x;
        const arrived = b.eat > 0 && Math.abs((b.eatX - 10) - b.x) < 3;
        for (const c of coins) if (!c.on && !c.ps) { c.vy += .25; c.x += c.vx; c.y += c.vy; if (c.y >= FLOOR - 12) { c.y = FLOOR - 12; c.on = true; } }
        if (b.eat > 0) { b.eat--; const tx = b.eatX - 10; b.x += Math.sign(tx - b.x) * Math.min(2, Math.abs(tx - b.x)); if (arrived) { const cx = coins.reduce((s, c) => s + c.x, 0) / (coins.length || 1); if (coins.length) b.face = cx > b.x + 32 ? 1 : -1; pullCoins(); } }
        else if (b.lunge > 0) { b.lunge--; b.x += b.vx * 3.2; if (b.x < ar.x0 || b.x > ar.x1 - 56) { b.vx = -b.vx; b.lunge = 0; } }
        else {
          b.x += b.vx; if (b.x < ar.x0 + 10 || b.x > ar.x1 - 60) b.vx = -b.vx;
          if (b.t % 150 === 70) { b.vx = h.x < b.x ? -1 : 1; b.lunge = 40; }
          // aviso de rugido: puxa o ar e treme por meio segundo, depois ruge e empurra
          if (b.t % 220 === 140) { G.sfx('roarIn'); b.warn = 30; }
        }
        if (b.warn > 0 && --b.warn === 0) { G.sfx('roar'); b.roar = 50; G.shake(6); }
        if (b.roar > 0) { b.roar--; h.push = (h.x < b.x ? -1.1 : 1.1); }
        if (!arrived) { if (b.x - ox > .05) b.face = 1; else if (b.x - ox < -.05) b.face = -1; }
        // enquanto corre atrás das moedas e come, o leão não machuca
        if (b.eat <= 0) hurtIf(G, { x: b.x + 6, y: FLOOR - 36, w: 54, h: 34 });
      },
      // derrotado: antes de dormir, puxa para si todas as moedas que ainda estão na arena (inclusive as que estão caindo)
      die(G) {
        if (coins.length) {
          if (!b.pulling) { b.pulling = true; const cx = coins.reduce((s, c) => s + c.x, 0) / coins.length; b.face = cx > b.x + 32 ? 1 : -1; }
          pullCoins();
          if (b.dying > b.dieT - 40) b.dying = b.dieT - 40;
        } else b.zz++;
      },
      draw(c, G) {
        for (const cn of coins) D.coin(c, cn.x, cn.y, G.t);
        const sleep = b.dying > 0 && !coins.length && b.zz > 20;
        const tremor = b.warn > 0 ? ((b.warn >> 1) % 2 ? 1 : -1) : 0;
        drawLion(c, b.x + tremor, FLOOR - 40 + (sleep ? 6 : 0), b.t, sleep, 1, b.face);
        if (b.roar > 0) for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); const r = 10 + ((b.roar * 2 + i * 12) % 36); if (b.face > 0) c.arc(b.x + 62, FLOOR - 20, r, -.86, .94); else c.arc(b.x + 2, FLOOR - 20, r, 2.2, 4); c.stroke(); }
        if (sleep) D.text(c, C.fases[12].textoMotor.zzz.slice(0, 1 + (Math.floor(b.zz / 20) % 3)), b.x + (b.face > 0 ? 50 : 10), FLOOR - 52 - (b.zz % 20) / 4, '#ffffff', 6, 'left');
      }
    });
    return b;
  };
  SL.Bosses.drawLion = drawLion;
  SL.Bosses.drawRei = drawRei;
  SL.Bosses.bigScissor = bigScissor;
  SL.Bosses.smallScissor = smallScissor;

  /* ---------- Fase 13 · Flavinho Dragão (A-10) ----------
     Com a bússola do pai, o Flavinho vira um dragão com as cores dos EUA e quer queimar a Constituição.
     Mesma estrutura do antigo trator: 9 acertos, 3 pontos fracos em sequência (3 cada).
       forma 0: bússola no peito  · ataque: fogo rente ao chão (pular)
       forma 1: joelho da frente  · ataque: pisada que manda uma onda pelo chão (pular)
       forma 2: boca (cabeça baixa) · ataque: bolas de fogo que batem na Constituição e voltam
     O Lula joga cópias da Constituição (tiro 'ink' com skin 'constituicao'). */
  /* Desenho baseado na referência: corpo quadrado (metade de cima azul com estrelas, de baixo listrada),
     4 pernas listradas com pés azuis, asa pequena nas costas, cauda listrada enrolada e a cabeça grande
     do Flavinho direto no corpo. Virado para a esquerda (para o Lula). */
  function dragonGeo(x, fy, k) {
    const hx = x - 16, hy = fy - 74 + (k || 0) * 22;     // cabeça 42 x 30 (sprite em escala 3x)
    return { hx, hy, mx: hx + 21, my: hy + 22 };          // centro da boca
  }
  function drawDragon(c, x, fy, t, o) {
    o = o || {};
    const B = '#26357a', R = '#c8262c', W_ = '#f4f2ec', Y = '#ffd21f';
    const form = o.form || 0, r = o.reach || 0, vis = o.vis !== false;
    const stripes = (sx, sy, w, h, first) => { for (let i = 0; i < h; i += 3) D.r(c, sx, sy + i, w, Math.min(3, h - i), ((i / 3) & 1) === (first ? 0 : 1) ? R : W_); };
    // cauda listrada, enrolando para cima
    const tail = [[72, -34], [78, -31], [84, -31], [89, -35], [92, -41], [93, -48], [91, -55], [87, -60]];
    tail.forEach(([dx, dy], i) => { D.r(c, x + dx - 1, fy + dy - 1, 7, 7, K); });
    tail.forEach(([dx, dy], i) => { D.r(c, x + dx, fy + dy, 5, 5, i % 2 ? W_ : R); });
    // pernas (a da frente pode esticar para chutar na forma 1)
    const leg = (lx, ly, len) => { D.r(c, lx - 1, ly, 8, len, K); stripes(lx, ly, 6, len - 5, true); D.r(c, lx - 1, fy - 5, 9, 5, K); D.r(c, lx, fy - 4, 7, 4, B); };
    leg(x + 64, fy - 24, 24); leg(x + 50, fy - 24, 24); leg(x + 28, fy - 24, 24);
    // pata da frente: levanta antes de pisar (forma 1)
    const lift = Math.round(o.lift || 0);
    if (!lift) leg(x + 14, fy - 24, 24);
    else { D.r(c, x + 13, fy - 24, 8, 16 - lift, K); stripes(x + 14, fy - 24, 6, 15 - lift, true); D.r(c, x + 13, fy - 9 - lift, 9, 5, K); D.r(c, x + 14, fy - 8 - lift, 7, 4, B); }
    // joelho da frente (ponto fraco da forma 1)
    const jw = form === 1 && vis && (t >> 3) % 2;
    D.box(c, x + 12, fy - 26, 12, 12, jw ? Y : R); D.r(c, x + 14, fy - 24, 8, 2, jw ? '#fff6b0' : W_);
    // corpo: azul com estrelas em cima, listras embaixo
    D.r(c, x + 7, fy - 47, 68, 27, K);
    D.r(c, x + 8, fy - 46, 66, 12, B);
    for (let i = 0; i < 14; i++) { const sx = x + 12 + ((i * 23) % 58), sy = fy - 44 + ((i * 7) % 9); D.r(c, sx, sy, 2, 2, W_); }
    stripes(x + 8, fy - 34, 66, 13, true);
    // asa de morcego nas costas: osso da frente, 2 dedos e borda de baixo bem recortada entre eles
    const fl = Math.round(Math.sin(t * .12) * 3);
    const P = (dx, dy) => [x + dx, fy + dy];
    const S = P(30, -46), Wr = P(36, -78 + fl), F1 = P(44, -46), F2 = P(60, -50 + Math.round(fl / 2)), T = P(80, -66 + fl);
    const LE = P(58, -86 + fl);                                        // curva do bordo de ataque (pulso → ponta)
    const sc = (A, Bp) => [(A[0] + Bp[0]) / 2 + (Wr[0] - (A[0] + Bp[0]) / 2) * .5, (A[1] + Bp[1]) / 2 + (Wr[1] - (A[1] + Bp[1]) / 2) * .5]; // recorte puxado para o pulso
    const panel = (A, Bp, col, lead) => { c.fillStyle = col; c.beginPath(); c.moveTo(Wr[0], Wr[1]); if (lead) c.quadraticCurveTo(LE[0], LE[1], A[0], A[1]); else c.lineTo(A[0], A[1]); const q = sc(A, Bp); c.quadraticCurveTo(q[0], q[1], Bp[0], Bp[1]); c.closePath(); c.fill(); };
    panel(T, F2, R, true); panel(F2, F1, B, false); panel(F1, S, R, false);
    // contorno e ossos
    c.strokeStyle = K; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    c.moveTo(S[0], S[1]); c.lineTo(Wr[0], Wr[1]); c.quadraticCurveTo(LE[0], LE[1], T[0], T[1]);
    let q = sc(T, F2); c.quadraticCurveTo(q[0], q[1], F2[0], F2[1]); q = sc(F2, F1); c.quadraticCurveTo(q[0], q[1], F1[0], F1[1]); q = sc(F1, S); c.quadraticCurveTo(q[0], q[1], S[0], S[1]);
    c.moveTo(Wr[0], Wr[1]); c.lineTo(F1[0], F1[1]); c.moveTo(Wr[0], Wr[1]); c.lineTo(F2[0], F2[1]); c.stroke(); c.lineJoin = 'miter';
    D.r(c, Wr[0] - 2, Wr[1] - 4, 3, 3, W_); D.r(c, T[0], T[1] - 1, 2, 2, W_); D.r(c, F2[0] - 1, F2[1], 2, 2, W_); D.r(c, F1[0] - 1, F1[1], 2, 2, W_);
    D.r(c, x + 46, fy - 62 + fl, 1, 1, W_); D.r(c, x + 50, fy - 66 + fl, 1, 1, W_); D.r(c, x + 49, fy - 58, 1, 1, W_);
    // bússola dourada do pai no peito (ponto fraco da forma 0)
    const bw = form === 0 && vis && (t >> 2) % 2;
    D.r(c, x + 12, fy - 42, 13, 13, K); D.r(c, x + 13, fy - 41, 11, 11, bw ? '#ffffff' : Y); D.r(c, x + 15, fy - 39, 7, 7, bw ? Y : '#c99a1a'); D.r(c, x + 16, fy - 36, 5, 1, '#5a5f68');
    // cabeça grande do Flavinho direto no corpo (só a cabeça, escala 3x)
    const g = dragonGeo(x, fy, o.headDown);
    const fs = SL.S && SL.S.flavio && SL.S.flavio.stand[1];
    if (fs) { c.save(); c.imageSmoothingEnabled = false; c.drawImage(fs, 0, 0, 14, 10, g.hx, g.hy, 42, 30); c.restore(); }
    // boca: abre para cuspir fogo; moldura amarela piscando na forma 2
    const open = o.mouth ? 4 : 0, mw = form === 2 && vis && (t >> 3) % 2;
    if (open) { D.r(c, g.mx - 6, g.my - 2, 12, 3 + open, K); D.r(c, g.mx - 4, g.my, 8, open - 1, '#ff7a1a'); }
    if (mw) { const fx0 = g.mx - 9, fy0 = g.my - 5, fw = 18, fh = 10 + open; D.r(c, fx0, fy0, fw, 1, Y); D.r(c, fx0, fy0 + fh, fw, 1, Y); D.r(c, fx0, fy0, 1, fh, Y); D.r(c, fx0 + fw - 1, fy0, 1, fh + 1, Y); }
    // forma 0: jato de fogo da boca até o chão e tapete de fogo
    if (form === 0 && r > 0) {
      for (let i = 0; i < 9; i++) { const q = i / 8, px = g.mx - 8 - q * 14, py = g.my + 3 + q * (fy - g.my - 8), s = 4 + q * 4; D.r(c, px - s / 2, py - s / 2, s, s, i % 2 ? '#ff7a1a' : '#ffd21f'); }
      for (let i = 0; i < r; i += 6) { const hh = 6 + ((i * 7 + t) % 5); D.r(c, x - 10 - i - 6, fy - hh, 7, hh, ((i / 6 + (t >> 2)) % 3) ? '#ff7a1a' : '#ffd21f'); D.r(c, x - 10 - i - 4, fy - hh + 3, 3, hh - 3, '#e8412c'); }
    }
    return { mx: g.mx, my: g.my };
  }
  // chamas no topo da Constituição gigante, conforme ela queima
  function burnBook(c, bx, fy, burn, t) {
    if (burn <= .02) return;
    c.fillStyle = `rgba(58,36,20,${Math.min(.55, burn * .6)})`; c.fillRect(bx + 1, fy - 31, 22, 30);
    const n = Math.ceil(burn * 4);
    for (let i = 0; i < n; i++) { const fx = bx + 2 + i * 5.5, hh = 5 + ((t >> 2) + i * 3) % 5 + burn * 6; D.r(c, fx, fy - 32 - hh, 5, hh, '#ff7a1a'); D.r(c, fx + 1, fy - 32 - hh + 3, 3, hh - 3, '#ffd21f'); }
  }

  F.trator = (G, ar) => {
    const tx = ar.x1 - 104, ty = FLOOR - 48;
    const L = G.L;
    const b = base(G, ar, {
      name: C.fases[13].chefeNome[0], hp: 9, invT: 30, dieT: 220, form: 0, arm: 0, x: tx, head: 0,
      step(G) {
        const h = G.hero; b.form = Math.min(2, Math.floor((9 - b.hp) / 3));
        if (b.lastForm != null && b.form !== b.lastForm) { G.sfx('roar'); G.shake(10); }
        b.lastForm = b.form;
        b.x = tx + Math.sin(b.t * .02) * 10;
        b.head += ((b.form === 2 ? 1 : 0) - b.head) * .05;
        // ataque a cada 260 quadros (~4,3 s), alcance máximo de 90 px
        const ARM_CICLO = 260, ARM_ALCANCE = 90;
        b.arm = (b.t % ARM_CICLO);
        const sweep = b.arm > 60 && b.arm < 110;
        const reach = sweep ? Math.sin((b.arm - 60) / 50 * Math.PI) * ARM_ALCANCE : 0;
        b.reach = reach;
        b.mouth = (b.form === 0 && b.arm > 40 && b.arm < 110) || (b.form === 2 && b.t % 70 > 4 && b.t % 70 < 26);
        if (b.form === 0 && b.arm === 40) G.sfx('roarIn');
        if (b.form === 0) {
          // fogo rente ao chão: pular o fogo e jogar a Constituição na bússola do peito
          if (sweep) hurtIf(G, { x: b.x - reach, y: FLOOR - 10, w: reach, h: 10 });
          if (G.shotIn({ x: b.x + 8, y: FLOOR - 46, w: 20, h: 20 }, ['ink'])) hitT(G);
        } else if (b.form === 1) {
          // pisada: pular a onda e acertar o joelho
          // levanta a pata (aviso) e pisa: a onda corre pelo chão até a Constituição
          if (b.arm === 64) { G.sfx('stamp'); G.shake(8); const w = G.hz({ x: b.x + 2, y: FLOOR - 10, w: 12, h: 10, vx: -2.2, life: 260 }); w.update = (G, z) => { z.x += z.vx; if (z.x < ar.x0 + 26) z.dead = true; }; w.draw = (c, G, z) => { D.r(c, z.x, z.y + 4, 12, 6, '#f4f2ec'); D.r(c, z.x + 3, z.y, 6, 10, '#f4f2ec'); D.r(c, z.x + 4, z.y + 2, 4, 6, '#c8262c'); }; }
          if (G.shotIn({ x: b.x + 10, y: FLOOR - 31, w: 16, h: 15 }, ['ink'])) hitT(G); // exige um pulinho, como antes
        } else {
          // cabeça baixa cospe bolas de fogo: batem na Constituição e voltam
          if (b.t % 70 === 20) { G.sfx('throw'); const g0 = dragonGeo(b.x, FLOOR, b.head), z = G.hz({ x: g0.mx - 12, y: g0.my - 4, w: 8, h: 8, vx: -2.4, vy: -1.6, g: .06, life: 300 }); z.update = (G, z) => { z.vy += z.g; z.x += z.vx; z.y += z.vy; if (z.y > FLOOR - 8) { z.y = FLOOR - 8; z.vy = -1.5; } if (z.x < ar.x0 + 26) { z.vx = 2.4; z.vy = -2; z.harm = false; z.ric = true; G.sfx('block'); } if (z.ric && z.x > b.x) z.dead = true; }; z.draw = (c, G, z) => { const f = (G.t >> 2) % 2; if (z.ric) { c.fillStyle = 'rgba(170,170,180,.8)'; c.beginPath(); c.arc(z.x + 4, z.y + 4, 3 + f, 0, 7); c.fill(); return; } D.r(c, z.x - 1, z.y - 1, 10, 10, '#e8412c'); D.r(c, z.x, z.y, 8, 8, f ? '#ff7a1a' : '#ffd21f'); D.r(c, z.x + 2, z.y + 2, 4, 4, '#fff6b0'); D.r(c, z.x + (z.vx < 0 ? 8 : -4), z.y + 2, 4, 4, '#ff7a1a'); }; }
          { const g = dragonGeo(b.x, FLOOR, b.head); if (G.shotIn({ x: g.mx - 10, y: g.my - 9, w: 20, h: 18 }, ['ink'])) hitT(G); }
        }
        hurtIf(G, { x: b.x + 8, y: FLOOR - 46, w: 64, h: 46 });
      },
      die(G) { if (b.dying < 50 && b.dying % 4 === 0) G.fx({ kind: 'part', x: b.x + 40, y: ty + 10, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 3, col: ['#2a4fb8', '#c8262c', '#f4f2ec'][Math.floor(Math.random() * 3)], sz: 3, life: 60 }); },
      draw(c, G) {
        const x = b.x;
        // Constituição gigante atrás do Lula, pegando fogo conforme o medidor cai
        const cxx = ar.x0 + 4; D.constBook(c, cxx, FLOOR - 32, 24, 32);
        const meter = L.obj && L.obj.meter != null ? L.obj.meter : 100;
        if (!b.dying) burnBook(c, cxx, FLOOR, 1 - meter / 100, G.t);
        if (b.dying) {
          const d = b.dying;
          if (d < 45) {
            // o dragão encolhe e pisca até sumir numa nuvem de fumaça
            const s = 1 - d / 45 * .85, px = x + 45, py = FLOOR;
            c.save(); c.translate(px, py); c.scale(s, s); c.translate(-px, -py);
            if ((d >> 2) % 2) c.globalAlpha = .55;
            drawDragon(c, x, FLOOR, b.t, { form: b.form, headDown: b.head });
            c.restore();
          }
          if (d > 30 && d < 110) { c.fillStyle = `rgba(170,170,180,${Math.max(0, .8 - (d - 30) / 100)})`; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x + 30 + i * 8, FLOOR - 14 - (i % 2) * 8 - (d - 30) * .15, 9 + (d - 30) * .08, 0, 7); c.fill(); } }
          // sobra o Flavinho, que sai correndo atrás da bússola
          if (d > 40) {
            const fx = x + 30 + (d - 40) * 1.8; SL.drawSprite(c, SL.S.flavio, Math.floor(d / 6) % 2 ? 'walk' : 'stand', 1, fx, FLOOR - 20);
            D.r(c, fx + 26 + (d - 40) * .3, FLOOR - 28 - Math.sin(d * .2) * 4, 4, 4, '#ffd21f');
          }
          return;
        }
        const vis = b.inv > 0 ? blink(G) : true;
        if (b.inv > 0 && (G.t >> 1) % 2) c.globalAlpha = .7;
        const lift = b.form === 1 && b.arm > 30 && b.arm < 64 ? Math.min(10, (b.arm - 30) / 2.5) : 0;
        drawDragon(c, x, FLOOR, b.t, { form: b.form, reach: b.form === 0 ? (b.reach || 0) : 0, vis, headDown: b.head, mouth: b.mouth, lift });
        c.globalAlpha = 1;
      }
    });
    function hitT(G) { if (b.hit(G)) { if (L.obj && L.obj.meter != null) L.obj.meter = Math.min(100, L.obj.meter + 12); } }
    return b;
  };
  SL.Bosses.drawDragon = drawDragon;
  SL.Bosses.burnBook = burnBook;
})();
