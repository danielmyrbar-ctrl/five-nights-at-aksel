const {test}=require('node:test'),assert=require('node:assert/strict');
const {BreakerGame}=require('./breaker');
function advance(g,t){for(let n=0;n<Math.ceil(t/.05);n++)g.tick(.05);}
test('Daniel freezes under observation and stages never reverse',()=>{
 const g=new BreakerGame(()=>0);advance(g,30);assert.equal(g.stage,0);
 g.look();advance(g,8);assert.equal(g.stage,1);g.look();advance(g,1);const left=g.moveIn;advance(g,40);assert.equal(g.moveIn,left);assert.equal(g.stage,1);
});
test('Empty-chair deadline continues while looking at Daniel and causes a loss',()=>{
 const g=new BreakerGame(()=>0);advance(g,2);g.look();advance(g,29);assert.equal(g.stage,4);assert.ok(g.lastChance<=14);g.look();advance(g,15);assert.equal(g.status,'lost');assert.equal(g.stage,4);
});
test('One reboot at a time, progress continues while watching, all four required',()=>{
 const g=new BreakerGame(()=>0);advance(g,2);g.reboot(0);assert.equal(g.active,-1);
 for(let i=0;i<4;i++){g.look();advance(g,.6);g.reboot(i);g.reboot((i+1)%4);assert.equal(g.active,i);g.look();advance(g,.6);advance(g,g.systems[i].duration);if(i<3)assert.equal(g.status,'playing');}
 assert.equal(g.status,'won');assert.ok(g.systems.every(s=>s.progress===s.duration));
});
