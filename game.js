'use strict';
const $ = id => document.getElementById(id);
const canvas = $('scene'), ctx = canvas.getContext('2d');
const rooms = [
  { id: 'vaskerom', name: 'Vaskerom', x: 14.5, y: 79 },
  { id: 'kjokken', name: 'Kjøkken', x: 34.5, y: 78 },
  { id: 'stua', name: 'Stua', x: 35, y: 43 },
  { id: 'gang', name: 'Gang', x: 60, y: 44 },
  { id: 'stage', name: 'Stage', x: 58.5, y: 19 },
  { id: 'alvar', name: 'Alvar-rom', x: 91, y: 27 }
];
let game = null, paused = false, mode = 'menu', last = 0, scareLeft = 0;
let unlocked = 1, muted = false, ready = false, frameNo = 0;
let menuClock = 0, glitchIn = 4, glitchLeft = 0, glitchImage = 1, signalLeft = 0;
const images = new Map();
try { unlocked = Math.max(1, Math.min(5, Number(localStorage.getItem('aksel-night')) || 1)); } catch {}

const sound = new Sound();
let memory = null, memoryCleared = false, memoryBeat = 0, memoryDirection = null;
const memoryView = new MemoryView($('memoryCanvas'), images);
function beginMemory() {
  memory = new MemoryGame(game.level); mode = 'memory'; paused = false; memoryBeat = 0;
  sound.resetNight(); memoryDirection = null;
  $('modal').hidden = $('hud').hidden = $('controls').hidden = $('cameraUI').hidden = true;
  $('memoryPanel').hidden = false; document.body.classList.remove('camera');
  $('memoryTitle').textContent = memory.story.title;
  $('memoryFinish').hidden = true;
  $('memoryCanvas').focus();
}
$('memoryFinish').onclick = () => {
  if (!memory?.done) return;
  memoryCleared = true; memory = null; mode = 'play';
  $('memoryPanel').hidden = true; finish();
};
const memoryKeys = {arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
$('memoryPause').onclick = togglePause;
for (const b of document.querySelectorAll('[data-move]')) {
  b.onpointerdown = e => {e.preventDefault(); if(mode!=='memory'||paused)return;memoryDirection=memoryKeys[b.dataset.move];memory.move(...memoryDirection);b.setPointerCapture(e.pointerId);};
  for(const event of ['pointerup','pointercancel','lostpointercapture']) b.addEventListener(event,()=>memoryDirection=null);
}
window.addEventListener('keyup',e=>{if(memoryKeys[e.key.toLowerCase()]) memoryDirection=null;});
window.addEventListener('blur',()=>memoryDirection=null);


async function preload() {
  const files = [...new Set(Object.values(ASSETS).flatMap(value => typeof value === 'string' ? [value] : Object.values(value)))];
  let loaded = 0, cursor = 0;
  const failures = [];
  async function worker() {
    while (cursor < files.length) {
      const path = files[cursor++];
      try {
        const img = new Image(); img.src = encodeURI(path);
        await img.decode(); images.set(path, img);
      } catch { failures.push(path); }
      loaded++;
      $('loadstatus').textContent = `LASTER BILDER · ${loaded} / ${files.length}`;
    }
  }
  sound.load(() => {}).catch(error => console.warn('Audio unavailable:', error));
  await Promise.all(Array.from({ length: 4 }, worker));
  ready = failures.length === 0;
  $('start').disabled = $('continue').disabled = !ready;
  $('loadstatus').textContent = ready ? 'ALLE KAMERAER TILKOBLET' : 'Kunne ikke laste: ' + failures.join(', ') + '. Last siden på nytt.';
  $('loadstatus').classList.toggle('error', !ready);
}
function drawPhoto(path, { shade = 0, shake = 0, zoom = 1 } = {}) {
  const img = images.get(path); if (!img) return;
  const w = canvas.width, h = canvas.height;
  const scale = Math.min(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale, dh = img.height * scale;
  const x = (w - dw) / 2 + (Math.random() - .5) * shake;
  const y = (h - dh) / 2 + (Math.random() - .5) * shake;
  ctx.drawImage(img, x, y, dw, dh);
  if (shade) { ctx.fillStyle = `rgba(0,0,0,${shade})`; ctx.fillRect(0, 0, w, h); }
}
function drawAlvar(scare) {
  const img = images.get(ASSETS.alvarEntity); if (!img) return;
  const crop = scare ? [240, 0, 520, 900] : [350, 0, 310, 360];
  const height = canvas.height * (scare ? 1.25 : .88);
  const width = height * crop[2] / crop[3];
  const shake = scare ? 30 : 3;
  ctx.save(); ctx.globalAlpha = scare ? 1 : .43;
  ctx.drawImage(img, ...crop, (canvas.width-width)/2+(Math.random()-.5)*shake,
    (canvas.height-height)/2+(Math.random()-.5)*shake, width, height);
  ctx.restore();
}
function staticNoise(amount = 1) {
  const w = canvas.width, h = canvas.height;
  for (let i = 0; i < 90 * amount; i++) {
    ctx.fillStyle = `rgba(210,224,199,${Math.random() * .15 * amount})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 30 + 1, Math.max(1, h / 650));
  }
  if (amount > 1) {
    ctx.fillStyle = '#e5eadb30';
    ctx.fillRect(0, Math.random() * h, w, 3 + Math.random() * 18);
  }
}
function render(dt) {
  const ratio = Math.min(devicePixelRatio, 1.5);
  const w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx.fillStyle = '#030505'; ctx.fillRect(0, 0, w, h);
  if (mode === 'menu') {
    menuClock += dt; glitchIn -= dt;
    if (glitchIn <= 0 && ready) {
      glitchLeft = .12 + Math.random() * .14;
      glitchImage = Math.random() < .5 ? 2 : 3;
      glitchIn = 3.5 + Math.random() * 5.5;

    }
    glitchLeft = Math.max(0, glitchLeft - dt);
    const variant = glitchLeft > 0 ? glitchImage : 1;
    drawPhoto(ASSETS.menu[variant], { shade: .28, shake: glitchLeft > 0 ? 15 : 0 });
    const g = ctx.createLinearGradient(w * .35, 0, w, 0);
    g.addColorStop(0, 'transparent'); g.addColorStop(.45, '#020708df'); g.addColorStop(1, '#020708');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (glitchLeft > 0) staticNoise(4);
    $('scene').dataset.view = 'start' + variant;
  } else if (scareLeft > 0) {
    if (game.killer === 'daniel') drawPhoto(ASSETS.danielFace, { shake: 30, zoom: 1.15 });
    else if (game.killer === 'alvar') drawAlvar(true);
    else drawPhoto(ASSETS.jumpscare, { shake: 35, zoom: 1.12 });
    staticNoise(2);
    $('scene').dataset.view = 'jumpscare';
  } else if (game) {
    if (game.monitor) {
      const state = game.cameraState(game.camera);
      drawPhoto(ASSETS[game.camera][state], { shade: .08 });
      if (game.alvarAngry) drawAlvar(false);
      staticNoise(signalLeft > 0 ? 4 : .7);
      $('scene').dataset.view = game.camera + ':' + state;
    } else {
      drawPhoto(ASSETS.office[game.officeState], { shade: game.power <= 0 ? .97 : .06 });
      if(game.daniel){ctx.save();ctx.globalAlpha=.8;drawPhoto(ASSETS.danielFigure,{zoom:.85});ctx.restore();ctx.fillStyle='#d8ca8e';ctx.font='16px monospace';ctx.textAlign='center';ctx.fillText('SE BORT',w/2,h*.82);ctx.textAlign='start';}
      $('scene').dataset.view = game.daniel?'office:daniel':'office:' + game.officeState;
    }
  }
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, Math.max(w, h) * .7);
  vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, '#00000099');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
}
function ui() {
  if (!game) return;
  $('night').textContent = String(game.level).padStart(2, '0');
  $('clock').textContent = String(Math.floor(game.time / 40)).padStart(2, '0') + ':00';
  $('power').textContent = Math.ceil(game.power) + '%';
  $('meter').style.width = game.power + '%';
  $('meter').style.background = game.power < 20 ? '#e76e54' : '#d7ec9b';
  $('usage').textContent = game.usage ? 'FORBRUK ' + '▮'.repeat(game.usage) : 'FORBRUK 0 · INGEN STRØM';
  $('cameraUI').hidden = !game.monitor;
  $('monitor').textContent = game.monitor ? 'LUKK KAMERAER [SPACE]' : 'ÅPNE KAMERAER [SPACE]';
  $('roomname').textContent = rooms.find(r => r.id === game.camera).name;
  $('camnumber').textContent = 'KAMERA 0' + (rooms.findIndex(r => r.id === game.camera) + 1) + ' / LIVE';
  document.body.classList.toggle('camera', game.monitor);
  document.body.classList.toggle('blackout', game.power <= 0);
  document.querySelectorAll('[data-kind]').forEach(b => {
    b.classList.toggle('active', game[b.dataset.kind]);
    b.setAttribute('aria-pressed', game[b.dataset.kind]);
    b.disabled = (game.power <= 0 && !game.alvarAngry) || game.status !== 'playing';
  });
  document.querySelectorAll('[data-cam]').forEach(b => {
    b.classList.toggle('selected', b.dataset.cam === game.camera);
    b.setAttribute('aria-pressed', b.dataset.cam === game.camera);
  });
  $('doorstate').textContent = game.door ? 'DØR LUKKET' : 'DØR ÅPEN';
  $('status').textContent = game.power <= 0 ? 'STRØMBRUDD' : paused ? 'VAKT PAUSET' : 'VAKT AKTIV';
  $('monitor').disabled = (game.power <= 0 && !game.alvarAngry) || game.status !== 'playing';
  $('musicbox').hidden = !game.monitor || game.camera !== 'alvar';
  $('boxpie').style.setProperty('--charge', game.musicBox * 3.6 + 'deg');
  $('boxpie').setAttribute('aria-valuenow', Math.round(game.musicBox));
  $('boxvalue').textContent = Math.ceil(game.musicBox) + '%';
  $('wind').classList.toggle('active', game.winding);
  $('denied').hidden = game.deniedFor <= 0;
}
async function start(level) {
  if (!ready) return;
  try { await sound.start(); } catch { $('mute').textContent = 'LYD UTILGJENGELIG'; }
  sound.resetNight();
  memoryCleared = false; memory = null; $('memoryPanel').hidden = true;
  game = new Night(level); mode = 'play'; paused = false; scareLeft = 0;
  $('overlay').hidden = $('modal').hidden = true;
  $('hud').hidden = $('controls').hidden = false;
  document.body.classList.remove('scaring'); ui();
}
function modal(label, title, description, button) {
  $('resultlabel').textContent = label; $('resulttitle').textContent = title;
  $('resulttext').textContent = description; $('resume').textContent = button;
  $('modal').hidden = false;
}
function finish() {
  paused = true; document.body.classList.remove('scaring');
  if (game.status === 'won') {
    if (!memoryCleared) { beginMemory(); return; }
    unlocked = Math.max(unlocked, Math.min(5, game.level + 1));
    try { localStorage.setItem('aksel-night', unlocked); } catch {}
    modal('NATT ' + game.level + ' FULLFØRT', '06:00', game.level === 5 ? 'Du overlevde alle fem nettene hos Aksel.' : 'Du overlevde. Neste natt beveger Aksel seg raskere.', game.level === 5 ? 'SPILL IGJEN' : 'SPILL NATT ' + (game.level + 1));
  } else { sound.stopShots(); sound.play('jingle'); modal('SIGNAL TAPT', 'HAN FANT DEG', game.killer === 'daniel' ? 'Daniel følger ikke dørene. Åpne kameraene for å se bort før han kommer nærmere.' : game.killer === 'alvar' ? 'Musikkboksen gikk tom. Hold inne MUSIC BOX på Alvar-kameraet før den tømmes.' : game.power <= 0 ? 'Strømmen gikk. Vanlig kontorvisning bruker ikke strøm. Slå av utstyret når du ikke trenger det.' : 'Når Aksel står utenfor kontoret, har du bare noen sekunder på å lukke døren. Bankingen varsler at han har kommet. Bruk lyset for å sjekke når han har gått.', 'PRØV IGJEN'); }
}
function togglePause() {
  if(mode==='memory'){ paused=!paused;memoryDirection=null;if(paused)sound.ctx?.suspend();else sound.ctx?.resume();return; }
  if (mode !== 'play' || game.status !== 'playing') return;
  game.setWinding(false);
  paused = !paused;
  if (paused) { modal('VAKT PAUSET', 'PUST UT', 'Klokken og Aksel står stille til du fortsetter.', 'FORTSETT VAKTEN'); sound.ctx?.suspend(); }
  else { $('modal').hidden = true; sound.ctx?.resume(); }
  ui();
}
function menu() {
  sound.resetNight(); memory=null; $('memoryPanel').hidden=true; $('denied').hidden = true;
  game = null; mode = 'menu'; paused = false; scareLeft = 0;
  $('modal').hidden = $('hud').hidden = $('controls').hidden = $('cameraUI').hidden = true;
  $('overlay').hidden = false; document.body.className = '';
  $('continue').hidden = unlocked === 1;
  $('continue').textContent = 'FORTSETT NATT ' + unlocked;
  $('status').textContent = 'SYSTEM KLART'; sound.ctx?.resume();
}
function control(kind) {
  if (mode === 'play' && !paused && game.status === 'playing') { game.toggle(kind); if (kind === 'monitor') signalLeft = .18; }
  ui();
}
$('start').onclick = () => start(1);
$('continue').hidden = unlocked === 1; $('continue').textContent = 'FORTSETT NATT ' + unlocked;
$('continue').onclick = () => start(unlocked);
$('resume').onclick = () => game.status === 'playing' ? togglePause() : start(game.status === 'won' ? Math.min(5, game.level + 1) : game.level);
$('restart').onclick = menu;
$('monitor').onclick = () => control('monitor'); $('pause').onclick = togglePause;
document.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => control(b.dataset.kind));
$('mute').onclick = () => { muted = !muted; sound.start(); sound.setMuted(muted); $('mute').textContent = muted ? 'LYD AV' : 'LYD PÅ'; };
rooms.forEach((room, i) => {
  const b = document.createElement('button'); b.textContent = '0' + (i + 1); b.dataset.cam = room.id;
  b.title = room.name; b.setAttribute('aria-label', 'Kamera ' + (i + 1) + ': ' + room.name);
  b.style.left = room.x + '%'; b.style.top = room.y + '%';
  b.onclick = () => { if (game && !paused) { game.selectCamera(room.id); signalLeft = .14; ui(); } };
  $('mapbuttons').appendChild(b);
});
window.addEventListener('keydown', e => {
  if(mode==='memory'){ const k=e.key.toLowerCase(); if(memoryKeys[k]){e.preventDefault();if(!paused){memoryDirection=memoryKeys[k];memory.move(...memoryDirection);}} if(k==='escape'&&!e.repeat)togglePause();return; }
  if (e.target.id === 'wind' && [' ', 'Enter'].includes(e.key)) { e.preventDefault(); if (!paused) game?.setWinding(true); return; }
  if (e.repeat || e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); control('monitor'); }
  else if (k === 'a' || k === 'd') control('door');
  else if (k === 'q' || k === 'e') control('light');
  else if (k === 'escape') togglePause();
  else if (/^[1-6]$/.test(k) && game?.monitor && !paused) { game.selectCamera(rooms[Number(k) - 1].id); signalLeft = .14; ui(); }
});
document.addEventListener('visibilitychange', () => {
  if(document.hidden && mode==='memory' && !paused)togglePause();
  if (document.hidden && mode === 'play' && !paused && game.status === 'playing') togglePause();
});
function frame(ms) {
  const dt = Math.min(.05, (ms - last) / 1000 || 0); last = ms;
  signalLeft = Math.max(0, signalLeft - dt);
  if (mode === 'play' && !paused) {
    game.tick(dt);
    for (const event of game.events.splice(0)) {
      sound.play(event);
      if (event === 'scare') { scareLeft = 1.6; game.monitor = false; document.body.classList.add('scaring'); }
    }
    if (game.status === 'won') finish();
    else if (game.status === 'lost') { scareLeft = Math.max(0, scareLeft - dt); if (!scareLeft) finish(); }
    if (frameNo++ % 3 === 0) ui();
  }
  if(mode==='memory' && memory) {
    if(!paused){memory.tick(dt);if(memoryDirection)memory.move(...memoryDirection);memoryBeat-=dt;if(memoryBeat<=0){sound.chip(Math.floor(memory.age)%4);memoryBeat=.65;}if(memory.note!==undefined){sound.chip(memory.note);delete memory.note;}}
    memoryView.draw(memory);
    $('memoryText').textContent=paused?'PAUSE / ESC FOR Å FORTSETTE':memory.messageFor>0?memory.message:memory.story.task;
    $('memoryCount').textContent=memory.collected.length+'/3 · '+(memory.collected.length===3?'GÅ TIL STOLEN ØVERST TIL HØYRE':memory.story.task);
    $('memoryFinish').hidden=!memory.done;
  }
  sound.sync(mode, game);
  render(dt); requestAnimationFrame(frame);
}
// Attempt autoplay, and unlock automatically on the first ordinary interaction.
const unlockAudio = () => { if (!paused) sound.start().catch(() => {}); };
window.addEventListener('pointerdown', unlockAudio, { capture: true });
window.addEventListener('keydown', unlockAudio, { capture: true });
$('wind').addEventListener('pointerdown', e => { e.preventDefault(); if (!paused) game?.setWinding(true); $('wind').setPointerCapture(e.pointerId); });
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) $('wind').addEventListener(event, () => game?.setWinding(false));
window.addEventListener('keyup', e => { if ([' ', 'Enter'].includes(e.key)) game?.setWinding(false); });
window.addEventListener('blur', () => game?.setWinding(false));
preload(); requestAnimationFrame(frame);
