/* Simulation of the supplied floor plan. Rendering never decides where Aksel is. */
class Night {
  static rooms = ['vaskerom', 'kjokken', 'stua', 'gang', 'stage', 'alvar'];
  static connections = {
    vaskerom: ['kjokken'], kjokken: ['vaskerom', 'stua', 'gang'],
    stua: ['kjokken', 'gang'], gang: ['kjokken', 'stua', 'stage', 'alvar', 'office'],
    stage: ['gang'], alvar: ['gang'], office: ['gang']
  };
  constructor(level = 1, random = Math.random) {
    this.level = Math.max(1, Math.min(5, level));
    this.random = random;
    this.time = 0;
    this.power = 100;
    this.door = false;
    this.light = false;
    this.monitor = false;
    this.camera = 'vaskerom';
    this.room = 'vaskerom';
    this.washStage = 1;
    this.moveIn = 12;
    this.attack = 0;
    this.blockedFor = 0;
    this.blackout = 0;
    this.detoured = false;
    this.status = 'playing';
    this.events = [];
  }
  get usage() { return Number(this.door) * 3 + Number(this.light) + Number(this.monitor); }
  get drain() { return Number(this.door) * .75 + Number(this.light) * .27 + Number(this.monitor) * .18; }
  get officeState() {
    if (this.door) return 'closed';
    if (this.room === 'office') return 'aksel';
    return this.light ? 'light' : 'empty';
  }
  cameraState(room) {
    if (this.room !== room) return 'empty';
    return room === 'vaskerom' ? 'aksel' + this.washStage : 'aksel';
  }
  toggle(kind) {
    if (this.status !== 'playing' || this.power <= 0 || !['door', 'light', 'monitor'].includes(kind)) return;
    this[kind] = !this[kind];
    this.events.push(kind);
  }
  selectCamera(room) {
    if (this.status === 'playing' && this.power > 0 && this.monitor && Night.rooms.includes(room)) {
      this.camera = room;
      this.events.push('camera');
    }
  }
  travel(room) {
    if (!Night.connections[this.room].includes(room)) throw new Error('Disconnected room: ' + this.room + ' -> ' + room);
    this.room = room;
    this.moveIn = 10.5 - this.level * 1.15 + this.random() * 5;
    this.events.push(room === 'office' ? 'arrival' : 'step');
  }
  move() {
    if (this.room === 'vaskerom') {
      if (this.washStage === 1) {
        this.washStage = 2;
        this.moveIn = 8 - this.level * .6 + this.random() * 3;
        this.events.push('step');
      } else this.travel('kjokken');
    } else if (this.room === 'kjokken') this.travel(this.random() < .45 ? 'stua' : 'gang');
    else if (this.room === 'stua' || this.room === 'stage' || this.room === 'alvar') this.travel('gang');
    else if (this.room === 'gang') {
      const choice = this.random();
      if (!this.detoured && choice < .4) {
        this.detoured = true;
        this.travel(choice < .2 ? 'stage' : 'alvar');
      } else this.travel('office');
    }
  }
  tick(dt) {
    if (this.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    this.time += dt;
    if (this.time >= 240) { this.time = 240; this.status = 'won'; this.events.push('win'); return; }
    this.power = Math.max(0, this.power - dt * this.drain);
    if (this.power <= 0) {
      if (!this.blackout) {
        this.door = this.light = this.monitor = false;
        this.events.push('blackout');
      }
      this.blackout += dt;
      if (this.blackout >= 9) { this.status = 'lost'; this.events.push('scare'); }
      return;
    }
    if (this.room === 'office') {
      if (this.door) {
        this.blockedFor += dt;
        if (this.blockedFor >= 1.8) {
          this.events.push('knock');
          this.travel('gang');
          this.attack = this.blockedFor = 0;
          this.moveIn = 10 + this.random() * 5;
          this.detoured = false;
        }
      } else {
        this.blockedFor = 0;
        this.attack += dt;
        if (this.attack >= 5.5 - this.level * .45) { this.status = 'lost'; this.events.push('scare'); }
      }
      return;
    }
    this.moveIn -= dt;
    if (this.moveIn <= 0) this.move();
  }
}
if (typeof module !== 'undefined') module.exports = Night;
