/* Pure simulation: rooms, power, music box and both attackers. */
class Night {
  static rooms = ['vaskerom', 'kjokken', 'stua', 'gang', 'stage', 'alvar', 'danielroom'];
  static connections = {
    vaskerom: ['kjokken'], kjokken: ['vaskerom', 'stua', 'gang'],
    stua: ['kjokken', 'gang'], gang: ['kjokken', 'stua', 'stage', 'alvar', 'office'],
    stage: ['gang'], alvar: ['gang'], office: ['gang']
  };
  constructor(level = 1, random = Math.random) {
    this.level = Math.max(1, Math.min(6, level)); this.random = random;
    this.time = 0; this.power = 100; this.door = false; this.light = false;
    this.monitor = false; this.camera = 'stage'; this.room = 'stage';
    this.washStage = 1; this.moveIn = 10; this.attack = 0; this.blockedFor = 0;
    this.blackout = 0; this.status = 'playing'; this.events = [];
    this.musicBox = 100; this.winding = false; this.alvarAngry = false;
    this.alvarIn = null; this.killer = null; this.deniedFor = 0;
    this.daniel = false; this.danielStare = 0; this.danielCooldown = 35;
    this.route = random() < .5
      ? ['gang', 'kjokken', 'vaskerom', 'kjokken', 'stua', 'gang', 'office']
      : ['gang', 'alvar', 'gang', 'stua', 'gang', 'office'];
  }
  get usage() { return Number(this.door) * 3 + Number(this.light) + Number(this.monitor); }
  get drain() { return this.alvarAngry ? 0 : Number(this.door) * .75 + Number(this.light) * .27 + Number(this.monitor) * .18; }
  get boxDrain() { return 1.15 + this.level * .12; }
  get canWind() { return this.status === 'playing' && !this.alvarAngry && this.power > 0 && this.monitor && this.camera === 'alvar'; }
  get officeState() {
    if (this.door) return 'closed';
    if (!this.light) return 'empty';
    return this.room === 'office' ? 'aksel' : 'light';
  }
  cameraState(room) { return this.room !== room ? 'empty' : room === 'vaskerom' ? 'aksel' + this.washStage : 'aksel'; }
  deny() { this.deniedFor = 2.5; this.events.push('denied'); }
  toggle(kind) {
    if (this.status !== 'playing' || !['door', 'light', 'monitor'].includes(kind)) return;
    if (this.alvarAngry && kind !== 'monitor') { this.deny(); return; }
    if (this.power <= 0 && !this.alvarAngry) return;
    this[kind] = !this[kind];
    if (kind === 'monitor') {
      if (this.monitor) { this.daniel = false; this.danielStare = 0; }
      else if (this.level >= 2 && !this.alvarAngry && this.danielCooldown <= 0 && this.room !== 'office' && this.random() < .07) {
        this.daniel = true; this.danielStare = 0; this.danielCooldown = 50; this.events.push('daniel');
      }
    }
    if (!this.monitor) this.winding = false;
    this.events.push(kind);
  }
  setWinding(held) {
    if (held && this.alvarAngry) this.deny();
    this.winding = Boolean(held && this.canWind);
  }
  selectCamera(room) {
    if (this.status !== 'playing' || !this.monitor || !Night.rooms.includes(room)) return;
    if (this.power <= 0 && !this.alvarAngry) return;
    if (this.camera !== room) { this.camera = room; this.winding = false; this.events.push('camera'); }
  }
  travel(room) {
    if (!Night.connections[this.room].includes(room)) throw new Error('Disconnected rooms: ' + this.room + ' -> ' + room);
    this.room = room;
    if (room === 'vaskerom') this.washStage = 1;
    this.moveIn = 8.5 - this.level * .8 + this.random() * 4;
    this.events.push(room === 'office' ? 'arrival' : 'step');
  }
  retreat() {
    this.travel('gang'); this.attack = this.blockedFor = 0;
    const routes = [
      ['stage', 'gang', 'alvar', 'gang', 'office'],
      ['kjokken', 'vaskerom', 'kjokken', 'stua', 'gang', 'office'],
      ['stua', 'kjokken', 'gang', 'alvar', 'gang', 'office']
    ];
    this.route = routes[Math.min(2, Math.floor(this.random() * 3))].slice();
    this.moveIn = 3 + this.random() * 3;
    this.events.push('retreat');
  }
  move() {
    if (this.room === 'vaskerom' && this.washStage === 1) {
      this.washStage = 2; this.moveIn = 6 + this.random() * 3; this.events.push('step');
    } else if (this.route.length) this.travel(this.route.shift());
  }
  lose(killer) { this.killer = killer; this.status = 'lost'; this.winding = false; this.events.push('scare'); }
  releaseAlvar() {
    this.daniel = false; this.danielStare = 0;
    this.musicBox = 0; this.alvarAngry = true; this.alvarIn = 20 + this.random() * 30;
    this.winding = false; this.light = false; this.door = false; this.events.push('alvar');
  }
  tick(dt) {
    if (this.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    this.time = Math.min(240, this.time + dt); this.deniedFor = Math.max(0, this.deniedFor - dt);
    this.danielCooldown = Math.max(0, this.danielCooldown - dt);
    if (this.alvarAngry) {
      this.alvarIn -= dt;
      if (this.alvarIn <= 0) this.lose('alvar');
      return;
    }
    if (this.time >= 240) { this.status = 'won'; this.winding = false; this.events.push('win'); return; }
    this.musicBox = Math.max(0, Math.min(100, this.musicBox + dt * ((this.winding && this.canWind ? 19 : 0) - this.boxDrain)));
    if (this.musicBox <= 0) { this.releaseAlvar(); return; }
    if (this.daniel && !this.monitor) { this.danielStare += dt; if (this.danielStare >= 5) { this.lose('daniel'); return; } }
    this.power = Math.max(0, this.power - dt * this.drain);
    if (this.power <= 0) {
      if (!this.blackout) { this.door = this.light = this.monitor = this.winding = false; this.events.push('blackout'); }
      this.blackout += dt;
      if (this.blackout >= 9) this.lose('aksel');
      return;
    }
    if (this.room === 'office') {
      if (this.door) { this.blockedFor += dt; if (this.blockedFor >= 1.8) this.retreat(); }
      else { this.blockedFor = 0; this.attack += dt; if (this.attack >= 5.5 - this.level * .45) this.lose('aksel'); }
      return;
    }
    this.moveIn -= dt;
    if (this.moveIn <= 0) this.move();
  }
}
if (typeof module !== 'undefined') module.exports = Night;
