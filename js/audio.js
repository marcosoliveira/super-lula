/* audio.js — motor de música em Web Audio (acordes + melodia em onda quadrada/triângulo + bateria de ruído).
 * Todas as melodias são geradas por regras próprias (originais). Nenhuma melodia de jogo existente nem jingle. */
(function () {
  let ac = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('sl_mute') === '1'; } catch (e) {}
  let cur = null, curId = null, step = 0, nextT = 0, timer = null, override = null;

  // escalas
  const SC = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
  // padrões de bateria (16 passos): k bumbo, s caixa, h chimbal, t surdo/tamborim
  const DR = {
    samba: { k: 'x..x..x.x..x..x.', s: '..x...x...x.x..x', h: 'xxxxxxxxxxxxxxxx' },
    noir: { k: 'x.......x.......', s: '........x.......', h: 'x...x...x...x...' },
    funk: { k: 'x..x..x...x.....', s: '....x.......x..x', h: 'x.x.x.x.x.x.x.x.' },
    baiao: { k: 'x..x....x..x....', s: '....x.......x...', h: '..x...x...x...x.' },
    forro: { k: 'x..x....x..x....', s: '..x.x.x...x.x.x.', h: 'xxxxxxxxxxxxxxxx' },
    carimbo: { k: 'x...x.x.x...x.x.', s: '..x...x...x...x.', h: 'x.xxx.xxx.xxx.xx' },
    indus: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    valsa: { k: 'x.....x.....', s: '....x.....x.', h: '..x.x...x.x.' },
    rock: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    maracatu: { k: 'x..x..x...x.x...', s: 'x.xx.xx.x.xx.xx.', h: '................' },
    breque: { k: 'x..x...x..x.....', s: '..x...x.x...x...', h: 'x.x.x.x.x.x.x.x.' },
    pagode: { k: 'x..x..x.x..x..x.', s: '....x.......x...', h: '.xx..xx..xx..xx.' },
    epic: { k: 'x.x.....x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    lofi: { k: 'x......x..x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    none: { k: '', s: '', h: '' }
  };
  // faixas: bpm, tônica (midi), escala, progressão (graus), timbre da melodia, bateria, compasso
  /* ===== Música da Estrela Vermelha: partitura MML (3 canais) =====
     Edite aqui para trocar a música. t = andamento (semínima por minuto), o = oitava, v = volume (0-127),
     notas c d e f g a b (# = sustenido), número = duração (4 semínima, 8 colcheia, 2 mínima), "." = pontuada, r = pausa.
     @1 melodia (onda quadrada) · @5 harmonia (onda triangular suave) · @6 baixo (triangular) */
  const STAR_MML = `t384 w255
#0 v120 y10 @1 o4 c4 e4 g2 g8 f8 e8 f4. r8 d4 f4 a2 a8 g8 f#8 g4. r8 e4 g4 b2 b8 a8 g#8 a4. r8 a8 a8 a8 g4 f4 e4 d4 c2
#1 v90 y10 @5 o4 g2. r4 g2. r4 b2. r4 b2. r4 c2. r4 c2. r4 f4. f4. d4 c2. r4
#2 v110 y10 @6 o3 c4 r4 c4 r4 g4 r4 g4 r4 a4 r4 a4 r4 e4 r4 e4 r4 f4 r4 f4 r4 c4 r4 c4 r4 d4 r4 d4 r4 g4 r4 g4 r4`;
  // Só o refrão: toca em loop os primeiros N tempos da partitura (16 = as duas primeiras frases da melodia,
  // "c4 e4 g2 g8 f8 e8 f4." e "d4 f4 a2 a8 g8 f#8 g4.", com a harmonia e o baixo do mesmo trecho). 0 = partitura inteira.
  const STAR_REFRAO_TEMPOS = 16;
  const INSTR = { 1: { wave: 'square', g: .055 }, 5: { wave: 'triangle', g: .07 }, 6: { wave: 'triangle', g: .12 } };
  // converte MML em eventos por passo de semicolcheia (1/4 de tempo)
  function parseMML(src) {
    const out = { bpm: 120, ch: [] }; let cur = null;
    const tok = src.replace(/;[^\n]*/g, ' ').match(/#\d+|[a-gr][#+-]?\d*\.?|[tovyw@]\d+/gi) || [];
    const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    for (const tk of tok) {
      const c0 = tk[0].toLowerCase();
      if (c0 === '#') { cur = { ev: [], pos: 0, oct: 4, vol: 100, ins: 1 }; out.ch.push(cur); continue; }
      if (c0 === 't') { out.bpm = +tk.slice(1); continue; }
      if (!cur) continue;
      if (c0 === 'o') { cur.oct = +tk.slice(1); continue; }
      if (c0 === 'v') { cur.vol = +tk.slice(1); continue; }
      if (c0 === '@') { cur.ins = +tk.slice(1); continue; }
      if ('abcdefgr'.includes(c0)) {
        const m = /^([a-gr])([#+-]?)(\d*)(\.?)$/i.exec(tk); if (!m) continue;
        const len = +(m[3] || 4); let steps = 16 / len; if (m[4]) steps *= 1.5;
        if (c0 !== 'r') {
          const semi = NOTE[c0] + (m[2] === '#' || m[2] === '+' ? 1 : m[2] === '-' ? -1 : 0);
          cur.ev.push({ at: cur.pos, len: steps, midi: 12 * (cur.oct + 1) + semi });
        }
        cur.pos += steps;
      }
    }
    out.n = Math.max(...out.ch.map(c => c.pos));
    return out;
  }
  const T = {
    title: { bpm: 112, root: 57, sc: 'min', prog: [0, 5, 3, 4], lead: 'square', dr: 'samba', seed: 3 },
    map1: { bpm: 104, root: 60, sc: 'maj', prog: [0, 3, 4, 0], lead: 'triangle', dr: 'baiao', seed: 7 },
    map2: { bpm: 100, root: 62, sc: 'mix', prog: [0, 6, 3, 4], lead: 'triangle', dr: 'samba', seed: 11 },
    p0: { bpm: 84, root: 50, sc: 'harm', prog: [0, 5, 3, 4], lead: 'triangle', dr: 'noir', seed: 21 },
    p1: { bpm: 108, root: 57, sc: 'min', prog: [0, 3, 6, 4], lead: 'square', dr: 'rock', seed: 22 },
    p2: { bpm: 118, root: 55, sc: 'dor', prog: [0, 3, 0, 4], lead: 'square', dr: 'funk', seed: 23 },
    p3: { bpm: 120, root: 60, sc: 'mix', prog: [0, 6, 3, 0], lead: 'square', dr: 'forro', seed: 24 },
    p4: { bpm: 126, root: 62, sc: 'maj', prog: [0, 4, 3, 4], lead: 'square', dr: 'carimbo', seed: 25 },
    p5: { bpm: 110, root: 52, sc: 'min', prog: [0, 0, 5, 4], lead: 'square', dr: 'indus', seed: 26 },
    p6: { bpm: 124, root: 60, sc: 'mix', prog: [0, 3, 4, 0], lead: 'square', dr: 'forro', seed: 27 },
    p7: { bpm: 132, root: 60, sc: 'maj', prog: [0, 3, 4, 4], lead: 'triangle', dr: 'valsa', seed: 28, bar: 12 },
    p8: { bpm: 128, root: 64, sc: 'maj', prog: [0, 4, 5, 3], lead: 'square', dr: 'rock', seed: 29 },
    p9: { bpm: 96, root: 50, sc: 'dor', prog: [0, 6, 0, 4], lead: 'square', dr: 'maracatu', seed: 30 },
    p10: { bpm: 100, root: 53, sc: 'mix', prog: [0, 6, 3, 0], lead: 'square', dr: 'maracatu', seed: 31 },
    p11: { bpm: 112, root: 57, sc: 'dor', prog: [0, 3, 4, 0], lead: 'triangle', dr: 'breque', seed: 32 },
    p12: { bpm: 116, root: 58, sc: 'maj', prog: [0, 5, 1, 4], lead: 'square', dr: 'pagode', seed: 33 },
    p13: { bpm: 120, root: 50, sc: 'min', prog: [0, 5, 2, 6], lead: 'square', dr: 'epic', seed: 34 },
    boss: { bpm: 140, root: 52, sc: 'harm', prog: [0, 0, 5, 4], lead: 'square', dr: 'indus', seed: 41 },
    suspense: { bpm: 70, root: 47, sc: 'harm', prog: [0, 1], lead: 'triangle', dr: 'none', seed: 42, sparse: true },
    star: { mml: STAR_MML, refrao: STAR_REFRAO_TEMPOS },
    povo: { bpm: 104, root: 60, sc: 'maj', prog: [0, 3, 4, 0], lead: 'triangle', dr: 'samba', seed: 44 },
    urna: { bpm: 90, root: 60, sc: 'maj', prog: [0, 5, 3, 4], lead: 'triangle', dr: 'lofi', seed: 45 },
    win: { bpm: 112, root: 60, sc: 'maj', prog: [0, 3, 4, 0], lead: 'square', dr: 'samba', seed: 46 }
  };

  // Ato 1: cada fase toca uma versão sombria da própria faixa (mesma melodia em tom menor, mais lenta e mais grave);
  // quando o jogador vence a fase, volta a versão normal (a "normalidade" se restaura)
  for (const n of [0, 1, 2, 3, 4]) {
    const b = T['p' + n];
    T['p' + n + 'd'] = Object.assign({}, b, { sc: (b.sc === 'maj' || b.sc === 'mix') ? 'min' : 'harm', bpm: Math.round(b.bpm * .8), root: b.root - 3, lead: 'triangle' });
  }

  // acordes (baixo, notas) em MIDI
  const CH = {
    'C': [36, [60, 64, 67]], 'G': [43, [59, 62, 67]], 'G#dim': [44, [59, 62, 68]], 'Am': [45, [57, 60, 64]],
    'Em': [40, [59, 64, 67]], 'F': [41, [57, 60, 65]], 'C/E': [40, [60, 64, 67]], 'Dm': [38, [57, 62, 65]], 'F/C': [36, [57, 60, 65]]
  };
  function seqAt(t, i) { let k = i; for (const [name, len] of t.seq) { if (k < len) return { ch: CH[name], start: k === 0 }; k -= len; } return { ch: CH.C, start: false }; }
  function composeSeq(t) {
    const r = rng(t.seed); t.n = t.seq.reduce((a, b) => a + b[1], 0);
    const rhythm = 'x.xx.x.xx.x.x.x.'; t.mel = [];
    let last = 72;
    for (let i = 0; i < t.n; i++) {
      if (rhythm[i % 16] !== 'x' || i >= t.n - 2) { t.mel.push(null); continue; }
      const tones = seqAt(t, i).ch[1].map(m => m + 12).concat(seqAt(t, i).ch[1].map(m => m + 24));
      tones.sort((a, b) => Math.abs(a - last) - Math.abs(b - last));
      last = tones[Math.floor(r() * 2.2)];
      t.mel.push(last);
    }
  }
  function rng(seed) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  // compõe uma melodia original de 4 compassos para a faixa
  function compose(t) {
    if (t.mel) return;
    if (t.seq) return composeSeq(t);
    if (t.mml) {
      const p = parseMML(t.mml); t.bpm = p.bpm; t.n = Math.round(p.n); t.mm = p.ch;
      if (t.refrao) { const lim = t.refrao * 4; t.n = Math.min(t.n, lim); for (const ch of t.mm) ch.ev = ch.ev.filter(e => e.at < lim).map(e => Object.assign({}, e, { len: Math.min(e.len, lim - e.at) })); }
      return;
    }
    const r = rng(t.seed), bar = t.bar || 16, n = bar * 4;
    const rhythm = t.sparse ? 'x.......x.......' : (t.bar === 12 ? 'x..x.xx..x..' : ['x.x.x..x..x.x...', 'x..x..x.x.x.x...', 'x.xx.x..x.x..x..'][Math.floor(r() * 3)]);
    const mel = []; let deg = 4;
    for (let i = 0; i < n; i++) {
      const b = Math.floor(i / bar), pos = i % bar;
      if (rhythm[pos % rhythm.length] !== 'x' || (b === 3 && pos > bar - 5)) { mel.push(null); continue; }
      const chord = t.prog[b % t.prog.length];
      const tones = [chord, chord + 2, chord + 4];
      if (pos === 0 || r() < .45) deg = tones[Math.floor(r() * 3)] + (r() < .3 ? 7 : 0);
      else deg += r() < .5 ? 1 : -1;
      deg = Math.max(0, Math.min(11, deg));
      mel.push(deg);
    }
    // repete o primeiro compasso no terceiro (frase com resposta)
    for (let i = 0; i < bar; i++) if (mel[i] != null && r() < .7) mel[2 * bar + i] = mel[i];
    t.mel = mel; t.n = n;
  }
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  function note(t, deg, oct) {
    const sc = SC[t.sc]; const o = Math.floor(deg / 7);
    return t.root + (oct || 0) * 12 + o * 12 + sc[((deg % 7) + 7) % 7];
  }

  function tone(freq, t0, dur, type, vol, bus, opt) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (opt && opt.slide) o.frequency.exponentialRampToValueAtTime(opt.slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(bus || musicBus); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, vol, hp, bus) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f).connect(g).connect(bus || musicBus); s.start(t0, Math.random() * .5); s.stop(t0 + dur + .02);
  }
  function kick(t0) { tone(120, t0, .12, 'sine', .35, musicBus, { slide: 40 }); }

  function schedule() {
    if (!ac || !cur) return;
    const t = cur, sp = 60 / t.bpm / 4;
    if (nextT < ac.currentTime - .2) nextT = ac.currentTime + .05;
    while (t.mm && nextT < ac.currentTime + .2) {
      const i = step % t.n;
      for (const ch of t.mm) { const ins = INSTR[ch.ins] || INSTR[1]; for (const e of ch.ev) if (e.at === i) tone(midi(e.midi), nextT, sp * e.len * .92, ins.wave, ins.g * ch.vol / 127); }
      nextT += sp; step++;
    }
    while (t.seq && nextT < ac.currentTime + .2) {
      const i = step % t.n, at = seqAt(t, i), pos = i % 16;
      const d = t.mel[i];
      if (d != null) { let len = 1; while (len < 4 && t.mel[(i + len) % t.n] == null) len++; tone(midi(d), nextT, sp * len * .9, t.lead, .05); }
      if (at.start || pos % 4 === 0) tone(midi(at.ch[0]), nextT, sp * 3, 'triangle', .1);
      if (pos % 2 === 1) tone(midi(at.ch[1][(pos >> 1) % 3]), nextT, sp * .8, 'square', .014);
      const dr = DR[t.dr], hit = (p) => p && p[pos % p.length] === 'x';
      if (hit(dr.k)) kick(nextT); if (hit(dr.s)) noise(nextT, .1, .08, 1400); if (hit(dr.h)) noise(nextT, .03, .025, 7000);
      nextT += sp; step++;
    }
    while (!t.seq && !t.mm && nextT < ac.currentTime + .2) {
      const i = step % t.n, bar = t.bar || 16, b = Math.floor(i / bar), pos = i % bar;
      const chord = t.prog[b % t.prog.length];
      // melodia
      const d = t.mel[i];
      if (d != null) {
        let len = 1; while (len < 4 && t.mel[(i + len) % t.n] == null) len++;
        tone(midi(note(t, d, 1)), nextT, sp * len * .9, t.lead, .045);
      }
      // baixo
      if (pos % (bar === 12 ? 6 : 4) === 0) tone(midi(note(t, chord, -1)), nextT, sp * 3, 'triangle', .09);
      // acorde arpejado
      if (!t.sparse && pos % 2 === 1) tone(midi(note(t, chord + [0, 2, 4][(pos >> 1) % 3], 0)), nextT, sp * .8, 'square', .012);
      if (t.sparse && pos === 0) [0, 2, 4].forEach(k => tone(midi(note(t, chord + k, 0)), nextT, sp * 14, 'triangle', .03));
      // bateria
      const dr = DR[t.dr];
      const at = (p) => p && p[pos % p.length] === 'x';
      if (at(dr.k)) kick(nextT);
      if (at(dr.s)) noise(nextT, .1, .08, 1400);
      if (at(dr.h)) noise(nextT, .03, .025, 7000);
      nextT += sp; step++;
    }
  }

  const A = {
    init() {
      if (ac) return;
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = muted ? 0 : .8; master.connect(ac.destination);
        musicBus = ac.createGain(); musicBus.gain.value = .55; musicBus.connect(master);
        sfxBus = ac.createGain(); sfxBus.gain.value = .9; sfxBus.connect(master);
        noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        timer = setInterval(schedule, 25);
      } catch (e) { ac = null; }
    },
    unlock() { A.init(); if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); },
    play(id) {
      if (override && id !== override) { A._after = id; return; }
      if (curId === id) return;
      curId = id; cur = T[id] || null; step = 0;
      if (cur) compose(cur);
      if (ac) nextT = ac.currentTime + .08;
    },
    // Estrela Vermelha: toca a faixa 'star' (partitura MML abaixo) por cima da música da fase
    overrideOn(id) { A._after = curId; override = id; curId = null; A.play(id); },
    overrideOff() {
      const back = A._after; override = null; curId = null; if (back) A.play(back);
    },
    stop() { curId = null; cur = null; },
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem('sl_mute', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : .8;
      return muted;
    },
    // mugido da boiada (mesma síntese do Super Flávio World 2: duas dente-de-serra desafinadas + filtro passa-baixa)
    moo(pitch) {
      if (!ac || muted) return;
      try {
        const e = pitch || 1, n = ac.currentTime + .005, r = .75;
        const f = ac.createBiquadFilter(); f.type = 'lowpass';
        f.frequency.setValueAtTime(500, n); f.frequency.linearRampToValueAtTime(900, n + .25); f.frequency.linearRampToValueAtTime(350, n + r);
        const g = ac.createGain();
        g.gain.setValueAtTime(1e-4, n); g.gain.exponentialRampToValueAtTime(.09, n + .12); g.gain.setValueAtTime(.09, n + r - .25); g.gain.exponentialRampToValueAtTime(1e-4, n + r);
        for (const t of [1, 1.006]) {
          const o = ac.createOscillator(); o.type = 'sawtooth';
          o.frequency.setValueAtTime(150 * e * t, n); o.frequency.linearRampToValueAtTime(175 * e * t, n + .2); o.frequency.exponentialRampToValueAtTime(110 * e * t, n + r);
          o.connect(f); o.start(n); o.stop(n + r + .05);
        }
        f.connect(g).connect(sfxBus);
      } catch (x) {}
    },
    sfx(name) {
      if (!ac || muted) return;
      const t = ac.currentTime + .005, B = sfxBus;
      switch (name) {
        case 'jump': tone(300, t, .14, 'square', .06, B, { slide: 620 }); break;
        case 'ink': tone(900, t, .07, 'square', .04, B, { slide: 1400 }); noise(t, .05, .03, 4000, B); break;
        case 'mega': tone(220, t, .18, 'sawtooth', .06, B, { slide: 330 }); tone(330, t, .18, 'square', .03, B); break;
        case 'throw': tone(500, t, .12, 'triangle', .07, B, { slide: 260 }); break;
        case 'stomp': tone(260, t, .1, 'square', .07, B, { slide: 90 }); noise(t, .06, .05, 900, B); break;
        case 'hit': tone(400, t, .3, 'square', .07, B, { slide: 80 }); break;
        case 'coin': tone(988, t, .06, 'square', .05, B); tone(1319, t + .06, .16, 'square', .05, B); break;
        case 'life': [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .07, .12, 'square', .05, B)); break;
        case 'bite': noise(t, .07, .12, 600, B); noise(t + .12, .07, .12, 600, B); tone(180, t + .26, .12, 'triangle', .08, B); break;
        case 'stamp': tone(90, t, .25, 'sine', .3, B, { slide: 40 }); noise(t, .2, .15, 200, B); break;
        case 'gate': tone(330, t, .08, 'square', .05, B); tone(247, t + .08, .16, 'square', .05, B); noise(t + .08, .1, .06, 500, B); break;
        case 'block': tone(150, t, .08, 'square', .07, B, { slide: 260 }); break;
        case 'break': noise(t, .2, .12, 800, B); break;
        case 'target': [660, 880, 1100].forEach((f, i) => tone(f, t + i * .05, .09, 'square', .045, B)); break;
        case 'boss': tone(140, t, .25, 'sawtooth', .07, B, { slide: 60 }); break;
        case 'pow': tone(200, t, .5, 'square', .06, B, { slide: 50 }); noise(t, .4, .08, 300, B); break;
        case 'bell': tone(1568, t, .3, 'triangle', .06, B); tone(2093, t + .05, .3, 'triangle', .04, B); break;
        case 'sel': tone(880, t, .04, 'square', .03, B); break;
        case 'type': tone(1400, t, .02, 'square', .012, B); break;
        case 'confirma': // som de confirmação recriado (sintetizado, não gravado da urna real)
          [0, .09, .18, .27, .36].forEach((d, i) => tone(i % 2 ? 1760 : 1568, t + d, .085, 'square', .05, B));
          tone(1568, t + .45, .5, 'square', .05, B); break;
        case 'mount': tone(392, t, .08, 'square', .05, B); tone(523, t + .08, .12, 'square', .05, B); break;
        case 'star': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * .05, .1, 'square', .05, B)); break;
        case 'clear': [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .11, .14, 'square', .055, B)); break;
        case 'roar': noise(t, .5, .12, 150, B); tone(110, t, .5, 'sawtooth', .05, B, { slide: 70 }); break;
        case 'suck': tone(200, t, .4, 'sine', .06, B, { slide: 600 }); break;
      }
    }
  };
  SL.Audio = A;
})();
