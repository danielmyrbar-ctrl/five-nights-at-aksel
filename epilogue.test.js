const {test}=require('node:test'),assert=require('node:assert/strict');
const {RainEpilogue}=require('./epilogue');
function travel(e,x,y){for(let i=0;i<1000&&Math.hypot(e.x-x,e.y-y)>3;i++)e.tick(.03,Math.abs(e.x-x)>2?Math.sign(x-e.x):0,Math.abs(e.y-y)>2?Math.sign(y-e.y):0);}
test('Complete journey requires walking outside, entering the car, driving and entering the new building',()=>{
 const e=new RainEpilogue();e.action();assert.equal(e.phase,'inside');
 for(let i=0;i<150&&e.phase==='inside';i++)e.tick(.03,0,-1);assert.equal(e.phase,'outside');
 e.action();assert.equal(e.phase,'outside');travel(e,440,270);assert.ok(e.canAct);e.action();assert.equal(e.phase,'drive');
 for(let i=0;i<500&&e.phase==='drive';i++)e.tick(.03,1,0);assert.equal(e.phase,'arrival');
 e.action();assert.equal(e.phase,'arrival');travel(e,452,184);e.action();assert.equal(e.phase,'ending');
 for(let i=0;i<130;i++)e.tick(.1);assert.equal(e.done,false);for(let i=0;i<12;i++)e.tick(.1);assert.equal(e.done,true);
});
test('Outdoor walking and car movement stay within scene boundaries',()=>{
 const e=new RainEpilogue();for(let i=0;i<200;i++)e.tick(.1,-1,0);assert.equal(e.x,100);assert.equal(e.phase,'inside');
 e.enter('drive',100,260);for(let i=0;i<100;i++)e.tick(.1,-1,-1);assert.equal(e.x,100);assert.equal(e.y,230);
});
