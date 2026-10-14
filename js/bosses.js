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
        D.r(c, cx - 40, y - 4, 14, 3, '#9aa3ad'); D.r(c, cx - 44, y - 10, 2, 8, '#9aa3ad'); D.r(c, cx - 40, y - 10, 2, 8, '#9aa3ad'); D.r(c, cx - 36, y - 10, 2, 8, '#9aa3ad');
        D.r(c, cx + 26, y - 4, 16, 3, '#9aa3ad'); D.r(c, cx + 38, y - 12, 4, 10, '#bdc3cc');
        c.fillStyle = K; c.beginPath(); c.ellipse(cx, y, 29, 24, 0, 0, 7); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(cx, y, 28, 23, 0, 0, 7); c.fill();
        c.fillStyle = '#e4e8ee'; c.beginPath(); c.ellipse(cx, y, 20, 16, 0, 0, 7); c.fill();
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
        if (b.t % 120 === 30) { const g = SL.mkE('gear', cx - 6, FLOOR, { always: true, vx: G.hero.x < cx ? -1 : 1 }); G.addEnt(g); }
        if (b.t % 140 === 90) { const n = SL.mkE('notif', ar.x0 + 30 + Math.random() * 260, 40, { always: true }); G.addEnt(n); }
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
     Ciclo: flutua → atira 3 tesouras → mira e dá o bote → se errar, a cabeça crava no chão (corpo inofensivo) e o
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
          if (mode === 'float' && mt > 70) { mode = 'shoot'; mt = 0; shots = 0; }
          if (mode === 'shoot' && mt % 30 === 15 && shots < 3) {
            shots++; G.sfx('throw'); open = 1;
            const sp = 2.4, dx = h.x + 5 - b.hx, dy = h.y + 9 - b.hy, d = Math.hypot(dx, dy) || 1;
            const z = G.hz({ x: b.hx - 6, y: b.hy - 6, w: 12, h: 12, vx: dx / d * sp, vy: dy / d * sp, life: 300, rot: 0 });
            z.update = (G, z) => { z.x += z.vx; z.y += z.vy; z.rot += .35; if (z.y > FLOOR - 6) z.dead = true; };
            z.draw = (c, G, z) => smallScissor(c, z.x + 6, z.y + 6, z.rot, .5 + Math.sin(z.rot * 2) * .3);
          }
          if (mode === 'shoot' && shots >= 3 && mt > 110) { mode = 'aim'; mt = 0; }
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
  F.polvo = (G, ar) => {
    const px = ar.x1 - 90, py = FLOOR - 70;
    // plataformas para alcançar os canos altos
    for (let x = 0; x < 3; x++) { G.setTile(Math.floor(ar.x0 / 16) + 4 + x, 7, '-'); G.setTile(Math.floor(ar.x0 / 16) + 10 + x, 7, '-'); }
    const pipes = [
      { x: ar.x0 + 20, y: FLOOR - 16 }, { x: ar.x0 + 74, y: 112 - 14 }, { x: ar.x0 + 170, y: 112 - 14 }, { x: ar.x0 + 130, y: FLOOR - 16 }
    ].map((p, i) => Object.assign(p, { w: 14, h: 14, i, done: false }));
    const safes = [0, 1, 2, 3].map(i => ({ full: true, a: i }));
    const b = base(G, ar, {
      name: C.fases[11].chefeNome[0], hp: 4, invT: 10, dieT: 150,
      step(G) {
        for (const p of pipes) if (!p.done && G.shotIn(p, ['ink'])) { p.done = true; safes[p.i].full = false; G.sfx('break'); G.objInc(); b.hit(G); }
        // tentáculo varre o chão saindo dos bueiros
        if (b.t % 150 === 50) {
          const x = G.hero.x - 4;
          G.sfx('suck');
          const z = G.hz({ x, y: FLOOR - 24, w: 8, h: 24, life: 90, harm: false, t0: 0 });
          z.update = (G, z) => { z.t0++; z.harm = z.t0 > 35 && z.t0 < 80; };
          z.draw = (c, G, z) => { const k = z.t0 < 35 ? 0 : Math.min(1, (z.t0 - 35) / 10) * (z.t0 > 75 ? Math.max(0, (90 - z.t0) / 15) : 1); D.r(c, z.x - 3, FLOOR - 2, 14, 2, z.t0 < 35 && (G.t >> 2) % 2 ? '#ffd21f' : '#3a3d45'); const hh = 24 * k; for (let i = 0; i < hh; i += 2) { D.r(c, z.x, FLOOR - hh + i, 8, 2, K); D.r(c, z.x + 1, FLOOR - hh + i, 6, 2, '#7a3a9a'); } };
        }
        hurtIf(G, { x: px + 8, y: py + 6, w: 40, h: 36 });
      },
      die(G) {},
      draw(c, G) {
        for (const p of pipes) { D.r(c, p.x + 4, p.y + 14, 6, FLOOR - p.y - 14, '#2e6a3a'); D.box(c, p.x, p.y, 14, 14, p.done ? '#5a5f68' : (blink(G) ? '#3ec04a' : '#7ae08a')); if (!p.done && (G.t >> 3) % 3 === 0) D.r(c, p.x + 5, p.y + 5, 4, 4, '#ffd21f'); }
        if (b.dying) { const a = Math.max(0, 1 - b.dying / 60); c.fillStyle = `rgba(20,10,30,${.8 * (1 - a)})`; c.beginPath(); c.arc(px + 28, py + 30, 10 + b.dying * .6, 0, 7); c.fill(); if (a <= 0) { D.box(c, px + 10, FLOOR - 22, 36, 22, '#8a8f99'); return; } c.globalAlpha = a; }
        D.box(c, px + 10, FLOOR - 22, 36, 22, '#8a8f99'); D.r(c, px + 24, FLOOR - 16, 8, 8, '#5a5f68');
        // tentáculos com cofres
        safes.forEach((s, i) => {
          const a = -2.6 + i * .9 + Math.sin(G.t * .04 + i) * .2, len = s.full ? 34 : 22;
          const tx = px + 28 + Math.cos(a) * len, ty = py + 26 + Math.sin(a) * len * .8;
          c.strokeStyle = '#4a1a5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(px + 28, py + 30); c.lineTo(tx, ty); c.stroke(); c.lineWidth = 1;
          if (s.full) { D.box(c, tx - 5, ty - 5, 10, 10, '#8a8f99'); D.r(c, tx - 1, ty - 1, 3, 3, '#ffd21f'); }
        });
        c.fillStyle = K; c.beginPath(); c.ellipse(px + 28, py + 22, 25, 21, 0, 0, 7); c.fill();
        c.fillStyle = '#4a1a5a'; c.beginPath(); c.ellipse(px + 28, py + 22, 24, 20, 0, 0, 7); c.fill();
        D.r(c, px + 16, py + 18, 7, 7, '#fff'); D.r(c, px + 33, py + 18, 7, 7, '#fff'); D.r(c, px + 18, py + 21, 3, 3, K); D.r(c, px + 35, py + 21, 3, 3, K);
        c.globalAlpha = 1;
      }
    });
    return b;
  };

  /* ---------- Fase 12 · O Leão Faminto (A-09) ---------- */
  function drawLion(c, x, y, t, sleep, sc) {
    c.save(); c.translate(x, y); if (sc && sc !== 1) c.scale(sc, sc);
    // corpo cinza, juba sépia, boca grande (sem logo nem cores oficiais)
    const step = sleep ? 0 : Math.floor(t / 6) % 2;
    D.box(c, 14, 14, 38, 20, '#9aa0aa');
    D.r(c, 18, 32, 6, 8 - step * 2, K); D.r(c, 28, 32, 6, 6 + step * 2, K); D.r(c, 38, 32, 6, 8 - step * 2, K); D.r(c, 46, 32, 6, 6 + step * 2, K);
    D.r(c, 50, 12, 8, 3, '#9aa0aa'); D.r(c, 56, 8, 4, 6, '#7a5a3a');
    c.fillStyle = K; c.beginPath(); c.arc(14, 16, 17, 0, 7); c.fill(); c.fillStyle = '#9a7a4a'; c.beginPath(); c.arc(14, 16, 16, 0, 7); c.fill();
    D.box(c, 2, 6, 22, 20, '#b4bac4');
    if (sleep) { D.r(c, 6, 13, 5, 1, K); D.r(c, 15, 13, 5, 1, K); D.r(c, 9, 20, 8, 2, K); }
    else { D.r(c, 6, 11, 4, 4, K); D.r(c, 15, 11, 4, 4, K); D.r(c, 7, 12, 1, 1, '#fff'); D.r(c, 16, 12, 1, 1, '#fff'); D.r(c, 4, 18, 18, 6, K); D.r(c, 5, 19, 16, 4, '#d8322c'); D.r(c, 6, 18, 2, 2, '#fff'); D.r(c, 18, 18, 2, 2, '#fff'); }
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
      b.eatX = tx * 16; b.eat = 160; b.hit(G);
    };
    const b = base(G, ar, {
      name: C.fases[12].chefeNome[0], hp: 4, invT: 10, dieT: 220, x: ar.x1 - 90, vx: -1, eat: 0, lunge: 0,
      step(G) {
        const h = G.hero;
        for (const c of coins) if (!c.on) { c.vy += .25; c.x += c.vx; c.y += c.vy; if (c.y >= FLOOR - 12) { c.y = FLOOR - 12; c.on = true; } }
        if (b.eat > 0) { b.eat--; const tx = b.eatX - 10; b.x += Math.sign(tx - b.x) * Math.min(2, Math.abs(tx - b.x)); if (Math.abs(tx - b.x) < 3) coins.length = Math.max(0, coins.length - (b.t % 20 === 0 ? 1 : 0)); }
        else if (b.lunge > 0) { b.lunge--; b.x += b.vx * 3.2; if (b.x < ar.x0 || b.x > ar.x1 - 56) { b.vx = -b.vx; b.lunge = 0; } }
        else {
          b.x += b.vx; if (b.x < ar.x0 + 10 || b.x > ar.x1 - 60) b.vx = -b.vx;
          if (b.t % 150 === 70) { b.vx = h.x < b.x ? -1 : 1; b.lunge = 40; }
          if (b.t % 220 === 140) { G.sfx('roar'); b.roar = 50; }
        }
        if (b.roar > 0) { b.roar--; h.push = (h.x < b.x ? -1.1 : 1.1); }
        hurtIf(G, { x: b.x + 4, y: FLOOR - 36, w: 50, h: 34 });
      },
      draw(c, G) {
        for (const cn of coins) D.coin(c, cn.x, cn.y, G.t);
        const sleep = b.dying > 30;
        drawLion(c, b.x, FLOOR - 40 + (sleep ? 6 : 0), b.t, sleep, 1);
        if (b.roar > 0) for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(b.x + 4, FLOOR - 22, 10 + ((b.roar * 2 + i * 12) % 36), 2.2, 4); c.stroke(); }
        if (sleep) D.text(c, C.fases[12].textoMotor.zzz.slice(0, 1 + (Math.floor(b.dying / 20) % 3)), b.x + 10, FLOOR - 52 - (b.dying % 20) / 4, '#ffffff', 6, 'left');
      }
    });
    return b;
  };
  SL.Bosses.drawLion = drawLion;
  SL.Bosses.drawRei = drawRei;
  SL.Bosses.bigScissor = bigScissor;
  SL.Bosses.smallScissor = smallScissor;

  /* ---------- Fase 13 · Trator do Atraso (A-10) ---------- */
  F.trator = (G, ar) => {
    const tx = ar.x1 - 96, ty = FLOOR - 48;
    const L = G.L;
    const b = base(G, ar, {
      name: C.fases[13].chefeNome[0], hp: 9, invT: 30, dieT: 220, form: 0, arm: 0, x: tx,
      step(G) {
        const h = G.hero; b.form = Math.min(2, Math.floor((9 - b.hp) / 3));
        b.x = tx + Math.sin(b.t * .02) * 10;
        b.arm = (b.t % 160);
        const sweep = b.arm > 60 && b.arm < 110;
        const reach = sweep ? Math.sin((b.arm - 60) / 50 * Math.PI) * 150 : 0;
        b.reach = reach;
        if (b.form === 0) {
          // tesourão: lâmina rente ao chão — pular a lâmina e atirar na cabine
          if (sweep) hurtIf(G, { x: b.x - reach, y: FLOOR - 10, w: reach, h: 10 });
          if (G.shotIn({ x: b.x + 30, y: ty - 4, w: 26, h: 20 }, ['ink'])) hitT(G);
        } else if (b.form === 1) {
          // draga: braço varre o chão — pular e atirar na junta
          if (sweep) hurtIf(G, { x: b.x - reach, y: FLOOR - 14, w: reach, h: 14 });
          if (G.shotIn({ x: b.x - 8, y: FLOOR - 30, w: 14, h: 16 }, ['ink'])) hitT(G);
        } else {
          // pincel verde e amarelo tenta riscar a Constituição: tinta bate no escudo e volta
          if (b.t % 70 === 20) { const z = G.hz({ x: b.x - 10, y: FLOOR - 30, w: 8, h: 8, vx: -2.4, vy: -1.6, g: .06, life: 300 }); z.update = (G, z) => { z.vy += z.g; z.x += z.vx; z.y += z.vy; if (z.y > FLOOR - 8) { z.y = FLOOR - 8; z.vy = -1.5; } if (z.x < ar.x0 + 26) { z.vx = 2.4; z.vy = -2; z.harm = false; z.ric = true; G.sfx('block'); } if (z.ric && z.x > b.x) z.dead = true; }; z.draw = (c, G, z) => { D.r(c, z.x, z.y, 8, 8, K); D.r(c, z.x + 1, z.y + 1, 6, 6, (G.t >> 2) % 2 ? '#169c3c' : '#ffd21f'); }; }
          if (G.shotIn({ x: b.x - 14, y: FLOOR - 36, w: 16, h: 18 }, ['ink'])) hitT(G);
        }
        hurtIf(G, { x: b.x + 4, y: ty + 4, w: 60, h: 44 });
      },
      die(G) { if (b.dying % 6 === 0) G.fx({ kind: 'part', x: b.x + 30, y: ty + 10, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 3, col: '#8a8f99', sz: 3, life: 60 }); },
      draw(c, G) {
        const x = b.x;
        // Constituição gigante atrás do Lula
        const cxx = ar.x0 + 4; D.box(c, cxx, FLOOR - 32, 24, 32, '#efe3c0'); D.r(c, cxx + 2, FLOOR - 30, 3, 28, '#c9b98a'); D.r(c, cxx + 8, FLOOR - 24, 12, 2, '#5a3a24'); D.r(c, cxx + 8, FLOOR - 18, 12, 1, '#5a3a24'); D.r(c, cxx + 8, FLOOR - 14, 12, 1, '#5a3a24');
        if (b.dying > 40) {
          // desmonta em parafusos; o Herdeiro sai correndo atrás da bússola
          for (let i = 0; i < 14; i++) D.r(c, x + 6 + (i * 37 % 60), FLOOR - 4 - (i % 3) * 2, 3, 2, '#8a8f99');
          const fx = x + 30 + (b.dying - 40) * 1.8; SL.drawSprite(c, SL.S.flavio, Math.floor(b.dying / 6) % 2 ? 'walk' : 'stand', 1, fx, FLOOR - 20);
          D.r(c, fx + 26 + (b.dying - 40) * .3, FLOOR - 28 - Math.sin(b.dying * .2) * 4, 4, 4, '#ffd21f');
          return;
        }
        const vis = b.inv > 0 ? blink(G) : true;
        // rodas e corpo cinza
        c.fillStyle = K; c.beginPath(); c.arc(x + 46, FLOOR - 14, 15, 0, 7); c.fill(); c.fillStyle = '#3a3d45'; c.beginPath(); c.arc(x + 46, FLOOR - 14, 13, 0, 7); c.fill();
        c.fillStyle = K; c.beginPath(); c.arc(x + 14, FLOOR - 9, 9, 0, 7); c.fill(); c.fillStyle = '#3a3d45'; c.beginPath(); c.arc(x + 14, FLOOR - 9, 7, 0, 7); c.fill();
        D.box(c, x + 4, ty + 16, 60, 18, '#8a8f99');
        // cabine com o Herdeiro e a bússola no painel
        D.box(c, x + 30, ty - 6, 28, 24, b.form === 0 && vis ? ((G.t >> 3) % 2 ? '#ffd21f' : '#8a8f99') : '#8a8f99');
        D.r(c, x + 33, ty - 3, 22, 14, '#bfe6ff');
        SL.drawSprite(c, SL.S.flavio, 'stand', -1, x + 37, ty - 6);
        D.r(c, x + 33, ty + 8, 22, 4, '#8a8f99'); D.r(c, x + 36, ty + 6, 4, 4, '#ffd21f');
        // capangas em silhueta na caçamba
        D.r(c, x + 8, ty + 6, 6, 10, '#3a3d45'); D.r(c, x + 16, ty + 4, 6, 12, '#3a3d45');
        // braço frontal
        const r = b.reach || 0;
        D.r(c, x - 6, FLOOR - 26, 12, 6, '#5a5f68');
        if (b.form === 0) { D.r(c, x - r - 6, FLOOR - 10, r + 6, 4, '#bdc3cc'); D.r(c, x - r - 6, FLOOR - 6, r + 6, 2, '#5a5f68'); D.r(c, x - r - 10, FLOOR - 12, 6, 8, '#d8322c'); }
        else if (b.form === 1) { D.r(c, x - r - 4, FLOOR - 14, r + 4, 4, '#5a5f68'); D.box(c, x - r - 14, FLOOR - 16, 12, 14, '#ffd21f'); D.box(c, x - 8, FLOOR - 30, 14, 16, vis && (G.t >> 3) % 2 ? '#ffd21f' : '#8a8f99'); }
        else { D.r(c, x - 12, FLOOR - 26, 10, 3, '#8a5a30'); D.box(c, x - 16, FLOOR - 36, 10, 14, vis && (G.t >> 3) % 2 ? '#ffffff' : '#169c3c'); D.r(c, x - 15, FLOOR - 24, 8, 4, '#ffd21f'); }
      }
    });
    function hitT(G) { if (b.hit(G)) { if (L.obj && L.obj.meter != null) L.obj.meter = Math.min(100, L.obj.meter + 12); } }
    return b;
  };
})();
