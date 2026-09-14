const { test } = require('node:test');
const assert = require('node:assert/strict');
const Night = require('./engine');
test('Daniel can appear after camera closes; looking away clears him, doors do not',()=>{
 const n=new Night(2,()=>0);n.danielCooldown=0;n.monitor=true;n.toggle('monitor');assert.equal(n.daniel,true);
 n.toggle('door');n.tick(1);assert.equal(n.daniel,true);n.toggle('monitor');assert.equal(n.daniel,false);
 n.danielCooldown=0;n.toggle('monitor');advance(n,5.1);assert.equal(n.killer,'daniel');
 const first=new Night(1,()=>0);first.danielCooldown=0;first.monitor=true;first.toggle('monitor');assert.equal(first.daniel,false);
});
function advance(n, seconds) { for (let t = 0; t < seconds; t += .05) n.tick(.05); }

test('Normal office uses no power; every powered device draws power', () => {
  const n = new Night(); advance(n, 5); assert.equal(n.power, 100);
  for (const key of ['door', 'light', 'monitor']) {
    const g = new Night(); g.toggle(key); advance(g, 2); assert.ok(g.power < 100, key);
  }
});
test('Two washing-room positions share one camera and progress in order', () => {
  const n = new Night(1, () => .1); n.move(); n.move(); n.move(); assert.equal(n.cameraState('vaskerom'), 'aksel1');
  n.move(); assert.equal(n.room, 'vaskerom'); assert.equal(n.cameraState('vaskerom'), 'aksel2');
  n.move(); assert.equal(n.room, 'kjokken'); assert.equal(n.cameraState('vaskerom'), 'empty');
  assert.equal(n.cameraState('kjokken'), 'aksel');
});
test('Aksel is visible outside office only with light on', () => {
  const n = new Night(); assert.equal(n.officeState, 'empty');
  n.light = true; assert.equal(n.officeState, 'light');
  n.room = 'office'; assert.equal(n.officeState, 'aksel');
  n.light = false; assert.equal(n.officeState, 'empty');
  n.door = true; assert.equal(n.officeState, 'closed');
});
test('Open office is the last chance; closing the door repels Aksel', () => {
  const n = new Night(); n.room = 'office'; advance(n, 3); assert.equal(n.status, 'playing');
  n.toggle('door'); advance(n, 2); assert.equal(n.room, 'gang'); assert.equal(n.status, 'playing');
  assert.ok(n.events.includes('retreat')); n.move(); assert.notEqual(n.room, 'gang');
  const lost = new Night(); lost.room = 'office'; advance(lost, 6); assert.equal(lost.status, 'lost');
});
test('All movements follow connections on the supplied map', () => {
  for (const choice of [.1, .3, .6, .9]) {
    const n = new Night(1, () => choice); assert.equal(n.room, 'stage');
    for (let i = 0; i < 10 && n.room !== 'office'; i++) {
      const previous = n.room; n.move();
      if (n.room !== previous) assert.ok(Night.connections[previous].includes(n.room));
    }
    assert.equal(n.room, 'office');
  }
});
test('Power failure opens door, switches off lights/cameras, and leads to loss', () => {
  const n = new Night(); n.power = .001; n.door = n.light = n.monitor = true; n.tick(.1);
  assert.equal(n.power, 0); assert.equal(n.door, false); assert.equal(n.light, false); assert.equal(n.monitor, false);
  n.toggle('door'); assert.equal(n.door, false); advance(n, 10); assert.equal(n.status, 'lost');
});
test('Every night is winnable with timely defense and continuous camera use', () => {
  for (let level = 1; level <= 6; level++) for (const random of [.1, .3, .6, .9]) {
    const n = new Night(level, () => random); n.monitor = true;
    for (let i = 0; i < 5000 && n.status === 'playing'; i++) {
      n.door = n.room === 'office'; n.selectCamera('alvar'); n.setWinding(n.musicBox < 90); n.tick(.05);
    }
    assert.equal(n.status, 'won'); assert.ok(n.power > 0);
  }
});
test('Keeping the door shut all night exhausts power', () => {
  const n = new Night(); n.door = true; advance(n, 240); assert.equal(n.status, 'lost');
});
test('No controls or simulation updates after completion', () => {
  const n = new Night(); n.time = 239.99; n.tick(.02); const power = n.power;
  n.toggle('door'); n.tick(10); assert.equal(n.time, 240); assert.equal(n.power, power); assert.equal(n.door, false);
});
test('Music box winds only while held on Alvar camera; switching cancels', () => {
  const n = new Night(); n.musicBox = 50; n.setWinding(true); assert.equal(n.winding, false);
  n.toggle('monitor'); n.selectCamera('alvar'); n.setWinding(true); n.tick(1);
  assert.ok(n.musicBox > 65); n.selectCamera('gang'); assert.equal(n.winding, false);
  const before = n.musicBox; n.tick(1); assert.ok(n.musicBox < before);
});
test('Alvar is irreversible, disables defenses, allows all cameras, attacks in 20–50 seconds', () => {
  for (const random of [0, .5, .999999]) {
    const n = new Night(1, () => random); n.musicBox = .01; n.door = n.light = true; n.tick(.05);
    assert.equal(n.alvarAngry, true); assert.ok(n.alvarIn >= 20 && n.alvarIn <= 50);
    assert.equal(n.door, false); assert.equal(n.light, false);
    n.toggle('door'); n.toggle('light'); assert.equal(n.door, false); assert.equal(n.light, false); assert.ok(n.deniedFor > 0);
    n.toggle('monitor'); n.selectCamera('alvar'); n.setWinding(true); assert.equal(n.musicBox, 0); assert.equal(n.winding, false);
    for (const room of Night.rooms) { n.selectCamera(room); assert.equal(n.camera, room); }
    const delay = n.alvarIn; advance(n, delay - .2); assert.equal(n.status, 'playing'); advance(n, .3);
    assert.equal(n.status, 'lost'); assert.equal(n.killer, 'alvar');
  }
});
test('Red Daniel camera apparition jingles once only when observed',()=>{
 const g=new Night(1,()=>0);g.redIn=0;g.tickRedFace(.1);
 assert.ok(g.redFor>0);assert.equal(g.events.includes('jingle'),false);
 g.monitor=true;g.camera='danielroom';g.tickRedFace(.1);
 assert.equal(g.events.filter(e=>e==='jingle').length,1);
 g.tickRedFace(.1);g.camera='stage';g.tickRedFace(.1);g.camera='danielroom';g.tickRedFace(.1);
 assert.equal(g.events.filter(e=>e==='jingle').length,1);
 g.alvarAngry=true;g.tickRedFace(.1);assert.equal(g.redFor,0);
});
