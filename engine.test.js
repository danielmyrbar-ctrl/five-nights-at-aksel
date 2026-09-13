const { test } = require('node:test');
const assert = require('node:assert/strict');
const Night = require('./engine');
function advance(n, seconds) { for (let t = 0; t < seconds; t += .05) n.tick(.05); }

test('Normal office uses no power; every powered device draws power', () => {
  const n = new Night(); advance(n, 5); assert.equal(n.power, 100);
  for (const key of ['door', 'light', 'monitor']) {
    const g = new Night(); g.toggle(key); advance(g, 2); assert.ok(g.power < 100, key);
  }
});
test('Two washing-room positions share one camera and progress in order', () => {
  const n = new Night(); assert.equal(n.cameraState('vaskerom'), 'aksel1');
  n.move(); assert.equal(n.room, 'vaskerom'); assert.equal(n.cameraState('vaskerom'), 'aksel2');
  n.move(); assert.equal(n.room, 'kjokken'); assert.equal(n.cameraState('vaskerom'), 'empty');
  assert.equal(n.cameraState('kjokken'), 'aksel');
});
test('Office image priority is closed, Aksel, light, normal', () => {
  const n = new Night(); assert.equal(n.officeState, 'empty');
  n.light = true; assert.equal(n.officeState, 'light');
  n.room = 'office'; assert.equal(n.officeState, 'aksel');
  n.door = true; assert.equal(n.officeState, 'closed');
});
test('Open office is the last chance; closing the door repels Aksel', () => {
  const n = new Night(); n.room = 'office'; advance(n, 3); assert.equal(n.status, 'playing');
  n.toggle('door'); advance(n, 2); assert.equal(n.room, 'gang'); assert.equal(n.status, 'playing');
  assert.ok(n.events.includes('knock'));
  const lost = new Night(); lost.room = 'office'; advance(lost, 6); assert.equal(lost.status, 'lost');
});
test('All movements follow connections on the supplied map', () => {
  for (const choice of [.1, .3, .6, .9]) {
    const n = new Night(1, () => choice);
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
  for (let level = 1; level <= 5; level++) for (const random of [.1, .3, .6, .9]) {
    const n = new Night(level, () => random); n.monitor = true;
    for (let i = 0; i < 5000 && n.status === 'playing'; i++) {
      n.door = n.room === 'office'; n.tick(.05);
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
