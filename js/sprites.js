/* sprites.js — matrizes 14 x 20 copiadas de super_lula_personagens_v2.md e desenhos simples em retângulos */
(function () {
  const PAL = {
    k: '#1a1020', w: '#f4f2ec', W: '#bdbab3', s: '#f2b98f', S: '#cf8e68', e: '#3a2416', r: '#d8322c',
    c: '#ffffff', n: '#2a3a8c', N: '#18215a', b: '#17171f', g: '#9aa3ad', h: '#1e1610', H: '#5a3a24',
    G: '#5a5f68', L: '#8a8f99', y: '#ffd21f', v: '#17a34a', a: '#9fd3f5', A: '#5aa0d0', o: '#f57e2c',
    O: '#c74e17', p: '#efe3c0', P: '#c9b98a', m: '#9a6a3a', M: '#5a3a24'
  };

  const LEGS = {
    stand: ['...kNNNNNNk...', '...kNNk.kNNk..', '...kbbk.kbbk..', '..kkkkk.kkkkk.'],
    walk: ['...kNNNNNNk...', '..kNNNk.kNNNk.', '..kbbk...kbbk.', '.kkkk.....kkkk'],
    jump: ['...kNNNNNNNk..', '..kNNNk..kNNNk', '..kbbk....kbbk', '.kkkk......kkk']
  };

  const M = {
    lula_ato1: ['....kkkkkk....', '...kwwwwwwk...', '..kwwsssswwk..', '..kwssssssswk.', '.kSsessssesSk.', '.kSssssssssSk.', '..kwsrccrswk..', '..kwwwccwwwk..', '..kwwwwwwwwk..', '...kWwwwwWk...', '..kvyvcrcnnk..', '.knnvyvrcnnnk.', '.ksnnvyvcnnsk.', '.ksnnnvyvnnsk.', '..knnnnvyvnnk.', '..kkNNNNNNkk..'],
    lula_prologo: ['....kkkkkk....', '...kwwwwwwk...', '..kwwsssswwk..', '..kwssssssswk.', '.kSsessssesSk.', '.kSssssssssSk.', '..kwsrccrswk..', '..kwwwccwwwk..', '..kwwwwwwwwk..', '...kWwwwwWk...', '..knnccrcnnk..', '.knnnccrcnnnk.', '.ksnnncrcnnsk.', '.ksnnnnrnnnsk.', '..knnnnnnnnk..', '..kkNNNNNNkk..'],
    lula_ato2: ['...kkkkkkkk...', '..kpppppppppk.', '..khhhhhhhhhk.', 'kpppppppppppPk', '.kSsessssesSk.', '.kSssssssssSk.', '..kwsrccrswk..', '..kwwwccwwwk..', '..kwwwwwwwwk..', '...kWwwwwWk...', '..kccWWWWcck..', '.kcccccWcccck.', '.ksccccWcccsk.', '.ksccccWcccsk.', '..kccccWccck..', '..kkNNNNNNkk..'],
    alckmin: ['....kkkkkk....', '...kssssssk...', '..kWssssssWk..', '..kWssssssWk..', '.kSgggsgggsSk.', '.kSgesgsgesSk.', '..kssssssssk..', '..ksrccccrsk..', '...kssssssk...', '....kkkkkk....', '..knnccccnnk..', '.knnnccccnnnk.', '.ksnnnccnnnsk.', '.ksnnnnnnnnsk.', '..knnnnnnnnk..', '..kkNNNNNNkk..'],
    dallagnol: ['....kkkkkk....', '...kHHHHHHk...', '..kHHHHHHHHk..', '..kHsssHHHHk..', '.kSHhssshhSk..', '.kSsessssesSk.', '.kSssssssssSk.', '..ksrccccrsk..', '..kssccccssk..', '...kssssssk...', '..kGGccNcGGk..', '.kGGGccNcGGGk.', '.ksGGGcNcGGsk.', '.ksGGGGNGGGsk.', '..kGGGGGGGGk..', '..kkGGGGGGkk..'],
    moro: ['....kkkkkk........', '...khhhhhhk.......', '..khhhhhhhhk......', '..khsssssshk......', '.kShhhsshhhSk.....', '.kSsessssesSk.....', '..kssssssssk..kkkk', '..ksskkkkssk..MmmM', '..kssssssssk..kkkk', '...kssssssk...m...', '..kbbcccccbbkm....', '.kbbbbccbbbbs.....', '.ksbbbbbbbbsk.....', '.ksbbbbbbbbsk.....', '..kbbbbbbbbk......', '..kbbbbbbbbk......'],
    salles: ['....kkkkkk....', '...kHHHHHHk...', '..kHHssssHHk..', '..kHssssssHk..', '.kShhssssshSk.', '.kSrerrrrerSk.', '.kSssssssssSk.', '..ksssrrrrsk..', '..kssssssssk..', '...kssssssk...', '..kLLccccLLk..', '.kLLLccccLLLk.', '.kssLLccLLssk.', '.kssLLLLLLssk.', '..kLLLLLLLLk..', '..kkGGGGGGkk..'],
    flavio: ['....kkkkkk....', '...khhhhhhk...', '..khhhhhhhhk..', '..khhhhssssk..', '.kShhssssssSk.', '.kSsessssesSk.', '.kSssssssssSk.', '..kssrrrrssk..', '..kssssssssk..', '...kkssssk....', '..kaaAAAAaak..', '.kaaaaaAaaaak.', '.ksaaaaAaaask.', '.ksaaaaAaaask.', '..kaaaaAaaak..', '..kkNNNNNNkk..'],
    jair: ['....kkkkkk....', '...kGGGGGGk...', '..kGWGGGGWGGk.', '..kWGGGGGsssk.', '.kSGGssssGGSk.', '.kSsessssesSk.', '..kssssssssk..', '..ksskkkkssk..', '..kssssssssk..', '..kkssssssk...', '..kcccccccck..', '.kbbbbbbbbbbk.', '.ksccccccccsk.', '.ksbbbbbbbbsk.', '..kcccccccck..', '..kkbbbbbbkk..']
  };
  const LEGS_MORO = {
    stand: ['..kbbbbbbbbk..', '..kbbbbbbbbk..', '..kkkkkkkkkk..', '...kbbk.kbbk..'],
    walk: ['..kbbbbbbbbk..', '.kbbbbbbbbbbk.', '.kkkkkkkkkkkk.', '..kbbk...kbbk.'],
    jump: ['..kbbbbbbbbk..', '.kbbbbbbbbbbk.', '.kkkkkkkkkkkk.', '.kbbk.....kbbk']
  };
  const LEGS_JAIR = {
    stand: ['...kcccccck...', '...kbbk.kbbk..', '...kbbk.kbbk..', '..kkkkk.kkkkk.'],
    walk: ['...kcccccck...', '..kbbbk.kbbbk.', '..kbbk...kbbk.', '.kkkk.....kkkk'],
    jump: ['...kccccccck..', '..kbbbk..kbbbk', '..kbbk....kbbk', '.kkkk......kkk']
  };

  function paint(rows, pal, flip, w) {
    w = w || Math.max(...rows.map(r => r.length));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = rows.length;
    const x = cv.getContext('2d');
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch !== '.' && ch !== ' ' && pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(flip ? w - 1 - i : i, j, 1, 1); }
      }
    });
    return cv;
  }
  const pad = (rows, w) => rows.map(r => (r + '..................').slice(0, w));

  // monta {stand:[dir,esq], walk:[..], jump:[..]}
  function build(top, pal, legs, w) {
    legs = legs || LEGS; w = w || 14;
    const o = {};
    for (const p of ['stand', 'walk', 'jump']) {
      const rows = pad(top.concat(legs[p]), w);
      o[p] = [paint(rows, pal, false, w), paint(rows, pal, true, w)];
    }
    o.rows = top; o.w = w;
    return o;
  }

  // boné vermelho liso (só nos figurantes, ex.: cozinheiros solidários)
  // badge: círculo branco com um mapinha do Brasil em verde na frente do boné
  function withBone(top, plain) {
    const t = top.slice();
    t[0] = plain ? '...krrrrrrk...' : '...krrrcrrk...';
    t[1] = plain ? '..krrrrrrrrk..' : '..krrrcvcrrk..';
    t[2] = plain ? '..krrrrrrrrrrk' : '..krrrrcrrrrrk';
    return t;
  }

  const S = {};
  SL.PAL = PAL;
  SL.M = M;

  const starPal = Object.assign({}, PAL, { n: '#DA3732', N: '#F6D144' });
  const whitePal = {}; for (const k in PAL) whitePal[k] = k === 'k' ? '#1a1020' : '#ffffff';

  SL.buildSprites = function () {
    for (const id of ['lula_ato1', 'lula_prologo', 'lula_ato2']) {
      S[id] = build(M[id], PAL);
      S[id + '_star'] = build(M[id], starPal);
      S[id + '_hit'] = build(M[id], whitePal);
    }
    // Ato 2 sem o chapéu (o chapéu voa no golpe protegido pelo Boné e volta na fase seguinte)
    const noHat = M.lula_ato1.slice(0, 4).concat(M.lula_ato2.slice(4));
    S.lula_ato2_nohat = build(noHat, PAL);
    S.lula_ato2_nohat_star = build(noHat, starPal);
    S.alckmin = build(M.alckmin, PAL);
    S.dallagnol = build(M.dallagnol, Object.assign({}, PAL, { N: PAL.G }));
    S.moro = build(pad(M.moro, 18), PAL, { stand: pad(LEGS_MORO.stand, 18), walk: pad(LEGS_MORO.walk, 18), jump: pad(LEGS_MORO.jump, 18) }, 18);
    S.salles = build(M.salles, Object.assign({}, PAL, { N: PAL.G }));
    S.flavio = build(M.flavio, PAL);
    S.jair = build(M.jair, PAL, LEGS_JAIR);
    // cavalinho do Vice para cada versão do Lula
    for (const id of ['lula_ato1', 'lula_prologo', 'lula_ato2']) {
      const top = M[id];
      S['vice_' + id] = buildVice(top);
    }
    SL.S = S;
  };

  // P-03: 16 x 30. Lula (linhas 0-13) 10 px acima, 2 px para trás; Alckmin inteiro embaixo
  function buildVice(lulaTop) {
    const o = {};
    for (const p of ['stand', 'walk']) {
      const pair = [];
      for (const flip of [false, true]) {
        const cv = document.createElement('canvas'); cv.width = 16; cv.height = 30;
        const x = cv.getContext('2d');
        const lula = paint(lulaTop.slice(0, 14), PAL, flip, 14);
        const alk = paint(M.alckmin.concat(LEGS[p]), PAL, flip, 14);
        const back = flip ? 2 : 0;           // olhando p/ direita: Lula 2 px para trás (esquerda)
        x.drawImage(lula, back, 0);
        // braços do Lula nos ombros do Alckmin (2 px de n)
        x.fillStyle = PAL.n;
        x.fillRect((flip ? 2 : 0) + 2, 12, 2, 2); x.fillRect((flip ? 2 : 0) + 10, 12, 2, 2);
        x.drawImage(alk, flip ? 0 : 2, 10);
        // mãos do Alckmin segurando os joelhos do Lula dos lados
        x.fillStyle = PAL.s;
        x.fillRect(flip ? 0 : 15, 22, 1, 2); x.fillRect(flip ? 13 : 2, 22, 1, 2);
        pair.push(cv);
      }
      o[p] = pair;
    }
    o.jump = o.walk;
    return o;
  }

  /* Figurantes: molde do Lula trocando cores. opts: skin, hair, beard, shirt, suit, pants, cap(cor), long(cabelo) */
  const SKINS = ['#5c3a24', '#7a4a2c', '#a0663e', '#c8875a', '#e0a878', '#fdd3bb'];
  const HAIRS = ['#1e1610', '#3b2417', '#6a3a1a', '#b5541c', '#9a9a9a', '#f4f2ec'];
  const npcCache = {};
  SL.npc = function (o) {
    const key = JSON.stringify(o);
    if (npcCache[key]) return npcCache[key];
    const skin = o.skin || SKINS[2];
    const pal = Object.assign({}, PAL, {
      s: skin, S: shade(skin, -0.18), w: o.hair || HAIRS[0], W: shade(o.hair || HAIRS[0], -0.2),
      n: o.suit || '#3a7ad8', N: o.pants || '#2a3a5a', c: o.shirt || o.suit || '#3a7ad8', r: o.tie || o.shirt || o.suit || '#3a7ad8'
    });
    let t = M.lula_prologo.slice();
    if (!o.beard) {
      t[6] = '..kssrccrssk..'; t[7] = '..kssssssssk..'; t[8] = '...kssssssk...'; t[9] = '....kkkkkk....';
    }
    if (o.long) { t[4] = '.kwsessssesSk.'; t[5] = '.kwssssssssSk.'; t[6] = t[6].replace(/^..k/, '.kw'); }
    if (o.cap) { t = withBone(t, true); pal.r = o.cap; }
    if (o.cocar) { t[0] = '.yryryryryry..'; t[1] = '.kryryryryrk..'; }
    if (o.apron) { t[11] = '.kncccccccnnk.'; t[12] = '.kscccccccnsk.'; t[13] = '.kscccccccnsk.'; }
    if (o.backpack) { t[11] = 'Hknnnnnnnnnnk.'; t[12] = 'Hksnnnnnnnnsk.'; }
    const sp = build(t, pal);
    npcCache[key] = sp;
    return sp;
  };
  SL.npcChild = function (o) {
    const key = 'c' + JSON.stringify(o);
    if (npcCache[key]) return npcCache[key];
    const big = SL.npc(o);
    const make = (flip) => {
      const cv = document.createElement('canvas'); cv.width = 14; cv.height = 14;
      const x = cv.getContext('2d');
      const src = big.stand[flip ? 1 : 0];
      x.drawImage(src, 0, 0, 14, 10, 0, 0, 14, 10);   // cabeça
      x.drawImage(src, 0, 11, 14, 2, 0, 10, 14, 2);   // tronco
      x.drawImage(src, 0, 17, 14, 3, 0, 11, 14, 3);   // pernas
      return cv;
    };
    const o2 = { stand: [make(false), make(true)] }; o2.walk = o2.stand; o2.jump = o2.stand;
    npcCache[key] = o2; return o2;
  };
  SL.SKINS = SKINS; SL.HAIRS = HAIRS;

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = f < 0 ? 0 : 255, a = Math.abs(f);
    r = Math.round(r + (m - r) * a); g = Math.round(g + (m - g) * a); b = Math.round(b + (m - b) * a);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  SL.shade = shade;

  /* ---------- desenho em retângulos ---------- */
  const D = {};
  SL.D = D;
  D.r = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  D.box = (c, x, y, w, h, fill, line) => { D.r(c, x, y, w, h, line || PAL.k); D.r(c, x + 1, y + 1, w - 2, h - 2, fill); };
  // texto do motor (Press Start 2P)
  // Texto do motor: na tela principal vai para uma camada DOM nítida (#tl); em outros canvases é desenhado no canvas
  SL.TQ = [];
  D.text = (c, s, x, y, col, size, align, shadow) => {
    if (SL.mainCtx && c === SL.mainCtx) {
      const m = c.getTransform();
      SL.TQ.push({ s: String(s), x: x * m.a + m.e, y: y * m.d + m.f, col: col || '#fff', size: Math.max(4, size || 6) * m.a, align: align || 'left', shadow: shadow === false ? null : (shadow || 'rgba(0,0,0,.6)'), a: c.globalAlpha });
      return;
    }
    c.font = (size || 6) + 'px "Press Start 2P", monospace';
    c.textAlign = align || 'left'; c.textBaseline = 'top';
    if (shadow !== false) { c.fillStyle = shadow || 'rgba(0,0,0,.6)'; c.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
    c.fillStyle = col || '#fff'; c.fillText(s, Math.round(x), Math.round(y));
  };
  // balão de fala
  D.balloon = (c, s, cx, by, opt) => {
    opt = opt || {};
    const size = opt.size || 5;
    c.font = size + 'px "Press Start 2P", monospace';
    const lines = String(s).split('\n');
    const w = Math.ceil(Math.max(...lines.map(l => c.measureText(l).width))) + 8;
    const h = lines.length * (size + 3) + 5;
    let x = Math.round(cx - w / 2), y = Math.round(by - h - 4);
    if (opt.minX != null) x = Math.max(opt.minX + 2, x);
    if (opt.maxX != null) x = Math.min(opt.maxX - w - 2, x);
    D.r(c, x, y, w, h, '#1a1020'); D.r(c, x + 1, y + 1, w - 2, h - 2, opt.bg || '#f4f0e0');
    D.r(c, Math.round(cx) - 2, y + h - 1, 4, 2, opt.bg || '#f4f0e0'); D.r(c, Math.round(cx) - 1, y + h + 1, 2, 2, '#1a1020');
    lines.forEach((l, i) => D.text(c, l, x + 4, y + 4 + i * (size + 3), opt.col || '#120c18', size, 'left', false));
  };

  // produtos do tarifaço (fase 10), desenho de cartoon: 'carne' (filé), 'cafe' (xícara de cafezinho), 'fruta' (cacho de banana).
  // cx = centro, by = base; s = escala (1 = cerca de 24 px de largura); sq = achatamento (1 normal, <1 esmagado pelo carimbo)
  D.product = (c, kind, cx, by, s, sq) => {
    s = s || 1; sq = sq == null ? 1 : sq;
    c.save(); c.translate(cx, by); c.scale(s, s * sq);
    const K = '#1a1020'; c.lineJoin = 'round'; c.lineWidth = 2;
    if (kind === 'carne') {
      // filé: bife em forma de feijão, borda de gordura branca e osso redondo
      const blob = () => { c.beginPath(); c.moveTo(-11, -9); c.bezierCurveTo(-4, -17, 9, -15, 12, -8); c.bezierCurveTo(15, -2, 10, 2, 4, 0); c.bezierCurveTo(-1, -1, 2, 4, -4, 1); c.bezierCurveTo(-12, 1, -14, -5, -11, -9); c.closePath(); };
      c.save(); c.translate(0, -1);
      blob(); c.fillStyle = K; c.strokeStyle = K; c.lineWidth = 3; c.stroke();
      blob(); c.fillStyle = '#f4f2ec'; c.fill();
      c.save(); c.translate(.5, .2); c.scale(.82, .78); c.translate(.5, -2); blob(); c.fillStyle = '#c8323c'; c.fill(); c.restore();
      c.fillStyle = '#e8606a'; c.fillRect(-6, -10, 5, 2); c.fillRect(2, -11, 4, 2); c.fillRect(5, -6, 3, 2); c.fillRect(-3, -6, 3, 2);
      c.fillStyle = K; c.beginPath(); c.arc(-5, -5, 3.2, 0, 7); c.fill(); c.fillStyle = '#f4f2ec'; c.beginPath(); c.arc(-5, -5, 2.2, 0, 7); c.fill();
      c.restore();
    } else if (kind === 'cafe') {
      // cafezinho: pires, xícara branca com café, asa e fumacinha
      c.fillStyle = K; c.fillRect(-12, -3, 24, 3); c.fillStyle = '#f4f2ec'; c.fillRect(-11, -2.5, 22, 1.5);
      c.fillStyle = K; c.beginPath(); c.moveTo(-8, -15); c.lineTo(8, -15); c.lineTo(6, -3); c.lineTo(-6, -3); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-7, -14); c.lineTo(7, -14); c.lineTo(5.2, -4); c.lineTo(-5.2, -4); c.closePath(); c.fill();
      c.fillStyle = '#5a2e14'; c.fillRect(-7, -14, 14, 2.5);
      c.fillStyle = '#d8322c'; c.fillRect(-6, -9, 12, 1.5);
      c.strokeStyle = K; c.lineWidth = 2; c.beginPath(); c.arc(8.5, -10, 3, -Math.PI / 2, Math.PI / 2); c.stroke();
      c.strokeStyle = '#ffffffcc'; c.lineWidth = 1.2;
      for (const ox of [-3, 2]) { c.beginPath(); c.moveTo(ox, -17); c.bezierCurveTo(ox - 2, -19, ox + 2, -21, ox, -23); c.stroke(); }
    } else {
      // cacho de banana: 3 bananas curvas presas no talo
      const ban = (ang) => {
        c.save(); c.rotate(ang);
        const path = () => { c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(9, -10, 3, 0); c.quadraticCurveTo(1, 1, -1, 0); c.quadraticCurveTo(4, -10, -3, -17); c.closePath(); };
        path(); c.strokeStyle = K; c.lineWidth = 2.4; c.stroke(); path(); c.fillStyle = '#ffd21f'; c.fill();
        c.fillStyle = '#f0a81a'; c.beginPath(); c.moveTo(1, -16); c.quadraticCurveTo(6, -9, 2, -1); c.lineTo(3, -1); c.quadraticCurveTo(7, -9, 2, -16); c.fill();
        c.fillStyle = '#5a3a1a'; c.fillRect(1, -1, 2, 2);
        c.restore();
      };
      c.save(); c.translate(-3, -2); ban(-.55); ban(-.05); ban(.45); c.restore();
      c.fillStyle = K; c.fillRect(-6, -22, 6, 6); c.fillStyle = '#6a8a2a'; c.fillRect(-5, -21, 4, 4);
    }
    c.restore();
  };
  D.coin = (c, x, y, t, alt) => { // 6 x 12 (Voto) — alt: Pé-de-Meia
    const f = Math.floor(t / 10) % 4;
    const w = f === 1 || f === 3 ? 4 : (f === 2 ? 2 : 6);
    const ox = (6 - w) / 2;
    if (alt) {
      D.r(c, x + ox, y + 1, w, 10, '#1a1020'); D.r(c, x + ox + (w > 2 ? 1 : 0), y + 2, Math.max(1, w - 2), 8, '#3ec04a');
      if (w > 2) D.r(c, x + ox + 1, y + 4, w - 2, 2, '#ffd21f');
      return;
    }
    D.r(c, x + ox, y, w, 12, '#1a1020');
    D.r(c, x + ox + (w > 2 ? 1 : 0), y + 1, Math.max(1, w - 2), 10, '#ffd21f');
    if (w > 2) D.r(c, x + ox + 1, y + 2, 1, 6, '#fff6b0');
  };
  D.picanha = (c, x, y) => { // 12 x 12 espetinho
    D.r(c, x + 1, y + 10, 11, 1, '#7a4a20'); D.r(c, x, y + 9, 12, 1, '#5a3a1a');
    D.r(c, x + 2, y + 2, 8, 7, '#1a1020'); D.r(c, x + 3, y + 3, 6, 5, '#c84a4a'); D.r(c, x + 3, y + 3, 6, 2, '#f4ece0');
    D.r(c, x + 5, y, 2, 12, '#7a4a20');
  };
  D.star = (c, x, y, t) => { // 12 x 12 estrela vermelha borda dourada
    const pts = [[6, 0], [8, 4], [12, 4], [9, 7], [10, 12], [6, 9], [2, 12], [3, 7], [0, 4], [4, 4]];
    c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(x + a, y + b) : c.moveTo(x + a, y + b)); c.closePath();
    c.fillStyle = (Math.floor(t / 6) % 2) ? '#ffd21f' : '#f6d144'; c.fill();
    c.save(); c.translate(x + 6, y + 6.5); c.scale(.62, .62); c.translate(-x - 6, -y - 6.5);
    c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(x + a, y + b) : c.moveTo(x + a, y + b)); c.closePath();
    c.fillStyle = '#da3732'; c.fill(); c.restore();
  };
  // Bandeira do Brasil usada como capa: presa nos ombros, esvoaça para trás do Lula
  D.cape = (c, x, y, face, t, speed) => {
    // x,y = canto do sprite (14 x 20) na altura dos ombros; a capa cai pelas costas e esvoaça com a velocidade
    const sp = Math.min(1, Math.abs(speed) / 2.3);
    const wave = Math.sin(t * (sp > .1 ? .4 : .08)) * (sp > .1 ? 1.5 : .5);
    const back = -face;                                     // lado das costas
    const sx = x + 7 + back * 2;                            // centro dos ombros, puxado para trás
    const len = 13 - sp * 3;                                // correndo, sobe
    const out = 4 + sp * 9 + wave;                          // quanto a ponta vai para trás
    const p = [[sx - 4, y], [sx + 4, y], [sx + back * out + 5, y + len + 1], [sx + back * out - 5, y + len - 1]];
    const path = (pts) => { c.beginPath(); pts.forEach(([a, b2], i) => i ? c.lineTo(a, b2) : c.moveTo(a, b2)); c.closePath(); };
    c.save();
    path(p.map(([a, b2], i) => [a + (i < 2 ? (i ? 1 : -1) : (i === 2 ? 1 : -1)), b2 + (i > 1 ? 1 : -1)])); c.fillStyle = '#1a1020'; c.fill();
    path(p); c.fillStyle = '#17a34a'; c.fill(); c.clip();
    // losango amarelo e círculo azul no meio da capa
    const mx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, my = y + len * .55;
    c.fillStyle = '#ffd21f'; c.beginPath(); c.moveTo(mx, my - 5); c.lineTo(mx + 7, my); c.lineTo(mx, my + 5); c.lineTo(mx - 7, my); c.closePath(); c.fill();
    c.fillStyle = '#2449c9'; c.beginPath(); c.arc(mx, my, 2.4, 0, 7); c.fill();
    c.restore();
  };
  D.flagIcon = (c, x, y, w, h) => { // bandeira do Brasil retangular (ícone)
    D.r(c, x, y, w, h, '#1a1020'); D.r(c, x + 1, y + 1, w - 2, h - 2, '#17a34a');
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = '#ffd21f'; c.beginPath(); c.moveTo(cx, y + 2); c.lineTo(x + w - 3, cy); c.lineTo(cx, y + h - 2); c.lineTo(x + 3, cy); c.closePath(); c.fill();
    c.fillStyle = '#2449c9'; c.beginPath(); c.arc(cx, cy, Math.min(w, h) * .22, 0, 7); c.fill();
  };
  D.boneIcon = (c, x, y) => {
    D.r(c, x + 2, y, 10, 1, '#1a1020'); D.r(c, x + 1, y + 1, 12, 5, '#1a1020'); D.r(c, x + 2, y + 1, 10, 5, '#d8322c');
    D.r(c, x + 8, y + 5, 7, 2, '#1a1020'); D.r(c, x + 9, y + 5, 5, 1, '#b8221c');
    // círculo branco com mapinha do Brasil em verde
    D.r(c, x + 5, y + 1, 3, 1, '#ffffff'); D.r(c, x + 4, y + 2, 5, 2, '#ffffff'); D.r(c, x + 5, y + 4, 3, 1, '#ffffff');
    D.r(c, x + 5, y + 2, 3, 1, '#17a34a'); D.r(c, x + 6, y + 3, 1, 1, '#17a34a');
  };
  D.flag = (c, x, y, on) => { // checkpoint: bandeirola vermelha lisa
    D.r(c, x + 1, y, 2, 32, '#5a3a24');
    D.r(c, x + 3, y + 1, 12, 8, '#1a1020'); D.r(c, x + 3, y + 2, 11, 6, on ? '#3ec04a' : '#e8412c');
  };
  D.goal = (c, x, y, t) => {
    D.r(c, x + 6, y, 3, 64, '#f4f2ec'); D.r(c, x + 5, y - 3, 5, 5, '#ffd21f');
    const wv = Math.sin(t / 10) * 1.5;
    D.r(c, x + 9, y + 4 + wv, 18, 12, '#1a1020'); D.r(c, x + 10, y + 5 + wv, 16, 10, '#e8412c');
    D.r(c, x + 15, y + 8 + wv, 6, 4, '#ffd21f');
  };

  // Slide do PowerPoint (versão simplificada): círculos ao redor com setas para o círculo central "LULA"
  D.ppt = (c, x, y, w, h, mini) => {
    D.r(c, x, y, w, h, '#1a1020'); D.r(c, x + 1, y + 1, w - 2, h - 2, '#6a6670');
    const cx = x + w / 2, cy = y + h / 2, n = mini ? 8 : 14;
    const rx = w / 2 - (mini ? 3 : w * .1), ry = h / 2 - (mini ? 3 : h * .12);
    const rr = mini ? 1.5 : Math.max(3, Math.min(w, h) * .075), rc = mini ? 3 : Math.min(w, h) * .17;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i / n * Math.PI * 2;
      const ox = cx + Math.cos(a) * rx, oy = cy + Math.sin(a) * ry;
      c.strokeStyle = '#f4f2ec'; c.lineWidth = mini ? .6 : Math.max(1, w / 160);
      const ex = cx + Math.cos(a) * (rc + 1), ey = cy + Math.sin(a) * (rc + 1);
      c.beginPath(); c.moveTo(ox - Math.cos(a) * rr, oy - Math.sin(a) * rr); c.lineTo(ex, ey); c.stroke();
      if (!mini) { const hs = Math.max(2, w / 70); c.fillStyle = '#f4f2ec'; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - Math.cos(a - .5) * hs * 1.6, ey - Math.sin(a - .5) * hs * 1.6); c.lineTo(ex - Math.cos(a + .5) * hs * 1.6, ey - Math.sin(a + .5) * hs * 1.6); c.fill(); }
      c.fillStyle = '#c8cde0'; c.beginPath(); c.arc(ox, oy, rr, 0, 7); c.fill();
    }
    c.lineWidth = 1;
    c.fillStyle = '#5a78b8'; c.beginPath(); c.arc(cx, cy, rc, 0, 7); c.fill();
    if (!mini) { c.strokeStyle = '#f4f2ec'; c.beginPath(); c.arc(cx, cy, rc, 0, 7); c.stroke(); D.text(c, 'LULA', cx, cy - Math.max(3, rc * .3), '#ffffff', Math.max(5, Math.round(rc * .55)), 'center', false); }
  };
  // seta em pixel apontando para o ângulo a (0 = direita)
  D.arrow = (c, x, y, a, len) => {
    len = len || 14; c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
    D.r(c, -len / 2 - 1, -2, len - 4, 4, '#1a1020'); D.r(c, -len / 2, -1, len - 5, 2, '#d8322c');
    c.fillStyle = '#1a1020'; c.beginPath(); c.moveTo(len / 2 + 1, 0); c.lineTo(len / 2 - 6, -5); c.lineTo(len / 2 - 6, 5); c.fill();
    c.fillStyle = '#d8322c'; c.beginPath(); c.moveTo(len / 2 - 1, 0); c.lineTo(len / 2 - 5, -3); c.lineTo(len / 2 - 5, 3); c.fill();
    c.restore();
  };

  // pessoinha genérica 'lula' desenhada
  SL.drawSprite = (c, sp, pose, face, x, y) => {
    const img = (sp[pose] || sp.stand)[face < 0 ? 1 : 0];
    c.drawImage(img, Math.round(x), Math.round(y));
  };
})();
