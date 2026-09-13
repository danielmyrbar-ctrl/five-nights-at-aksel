/* Persistent loop sources keep the music box in time while inaudible. */
const AUDIO_FILES = {
  office: 'office ambiance-compatible.mp3', menu: 'menu.mp3', jingle: 'horror jingle.mp3',
  camera: 'camswitch-compatible.mp3', light: 'light-compatible.mp3', arrival: 'knocks-compatible.mp3', door: 'door-compatible.mp3',
  musicbox: 'musicbox-compatible.mp3', rewind: 'rewind-compatible.mp3', angry: 'angryalvar-compatible.mp3', scare: 'jumpscare.mp3',
  danielroom: 'danielrom-compatible.mp3', start1: 'start1-compatible.mp3', start2: 'start2-compatible.mp3'
};
class Sound {
  constructor() {
    this.buffers = {}; this.loops = {}; this.shots = new Set(); this.muted = false; this.loading = {}; this.mode = 'menu';
    // Stream the menu from the first available audio data, rather than decoding the entire track.
    this.menu = typeof document !== 'undefined' ? document.getElementById('menuMusic') : null;
    if(this.menu){this.menu.volume=.36;this.menu.play().catch(()=>{});}
  }
  ensure(id) {
    if(this.buffers[id])return Promise.resolve(this.buffers[id]);
    if(this.loading[id])return this.loading[id];
    this.loading[id]=(async()=>{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
      try{const response=await fetch(encodeURI(AUDIO_FILES[id]),{signal:controller.signal});
        if(!response.ok)throw new Error(AUDIO_FILES[id]);
        return this.buffers[id]=await this.ctx.decodeAudioData(await response.arrayBuffer());
      }finally{clearTimeout(timeout);delete this.loading[id];}
    })();return this.loading[id];
  }
  async load(progress) {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain(); this.master.gain.value = .65; this.master.connect(this.ctx.destination);
    this.start().catch(() => {});
    let count = 0; this.failures = [];
    await Promise.all(Object.entries(AUDIO_FILES).filter(([id])=>id!=='menu').map(async ([id, path]) => {
      try {
      await this.ensure(id);
      } catch (error) { this.failures.push(path); console.warn('Could not load sound:', path, error); }
      progress(++count, Object.keys(AUDIO_FILES).length);
    }));
  }
  async start() {
    if(this.menu && this.mode==='menu')this.menu.play().catch(()=>{});
    if (this.ctx && this.ctx.state !== 'running') await this.ctx.resume();
  }
  loop(id, volume) {
    if (!this.buffers[id]) return;
    let channel = this.loops[id];
    if (!channel) {
      const source = this.ctx.createBufferSource(), gain = this.ctx.createGain();
      source.buffer = this.buffers[id]; source.loop = true; gain.gain.value = 0;
      source.connect(gain).connect(this.master); source.start();
      channel = this.loops[id] = { source, gain };
    }
    if (channel.volume !== volume) { channel.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, .035); channel.volume = volume; }
  }
  stopLoop(id) { const c = this.loops[id]; if (c) { c.source.stop(); c.source.disconnect(); c.gain.disconnect(); delete this.loops[id]; } }
  play(id, onEnded) {
    if (!this.ctx || !this.buffers[id]) return;
    const source = this.ctx.createBufferSource(); source.buffer = this.buffers[id];
    const gain = this.ctx.createGain(); gain.gain.value = id === 'scare' ? .8 : .65;
    source.connect(gain).connect(this.master); this.shots.add(source);
    source.onended = () => { this.shots.delete(source); source.disconnect(); gain.disconnect(); onEnded?.(); };
    source.start();
    return source;
  }
  stopShots() { for (const s of this.shots) s.stop(); this.shots.clear(); }
  chip(note=0) {
    if(!this.ctx || !this.master) return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='square';o.frequency.value=[130.81,155.56,196,123.47][note%4];
    g.gain.setValueAtTime(.025,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.22);
    o.connect(g).connect(this.master);o.start();o.stop(this.ctx.currentTime+.25);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  resetNight() { this.stopShots(); for (const id of Object.keys(this.loops)) this.stopLoop(id); }
  setMuted(value) { this.muted = value; if (this.master) this.master.gain.value = value ? 0 : .65; if(this.menu)this.menu.muted=value; }
  sync(mode, game) {
    if(this.menu && mode!==this.mode){if(mode==='menu')this.menu.play().catch(()=>{});else this.menu.pause();}
    this.mode=mode;
    if (!this.ctx) return;
    const playing = mode === 'play' && game?.status === 'playing';
    if(!this.menu)this.loop('menu', mode === 'menu' ? .55 : 0);
    this.loop('office', playing && !game.monitor && !game.alvarAngry ? .5 : 0);
    if (playing && !game.alvarAngry) this.loop('musicbox', game.monitor && game.camera === 'alvar' ? .65 : 0);
    else this.stopLoop('musicbox');
    if(playing)this.loop('danielroom',game.monitor && game.camera==='danielroom'?.65:0);
    else this.stopLoop('danielroom');
    if (playing && game.winding && game.canWind) this.loop('rewind', .6); else this.stopLoop('rewind');
    if (playing && game.alvarAngry) this.loop('angry', .75); else this.stopLoop('angry');
  }
}
if (typeof module !== 'undefined') module.exports = { Sound, AUDIO_FILES };
