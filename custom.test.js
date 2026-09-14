const {test}=require('node:test'),assert=require('node:assert/strict');
const Night=require('./engine');const {FinaleGame}=require('./finale');
test('Custom values clamp to 0–20 and zero disables attackers',()=>{
 const c=new Night(7,()=>0,{aksel:999,alvar:-4,daniel:20.9});assert.deepEqual(c.custom,{aksel:20,alvar:0,daniel:20});
 const n=new Night(7,()=>0,{aksel:0,alvar:0,daniel:0});for(let i=0;i<480;i++){n.tick(.5);n.toggle('monitor');}assert.equal(n.status,'won');assert.equal(n.room,'stage');assert.equal(n.musicBox,100);assert.equal(n.daniel,false);
});
test('20/20/20 is survivable across 40 seeds with half-second reactions and resource management',()=>{
 for(let seed=1;seed<=40;seed++){
  let r=seed;const random=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
  const n=new Night(7,random,{aksel:20,alvar:20,daniel:20});let closed=0,winding=false;
  for(let i=0;i<480&&n.status==='playing';i++){
   const events=n.events.splice(0);
   if(events.includes('arrival')&&!n.door){n.toggle('door');closed=0;}
   if(n.door){closed+=.5;if(closed>=3)n.toggle('door');}
   if(n.musicBox<55)winding=true;if(n.musicBox>94)winding=false;
   if(winding||n.daniel){if(!n.monitor)n.toggle('monitor');n.selectCamera('alvar');n.setWinding(winding);}
   else if(n.monitor)n.toggle('monitor');
   n.tick(.5);
  }
  assert.equal(n.status,'won','seed '+seed);assert.ok(n.power>5);
 }
});
test('Finale requires correct offerings before the present, then fades to the final text',()=>{
 const f=new FinaleGame();f.tick(3);
 function walk(x,y){while(f.x!==x||f.y!==y){f.tick(.2);f.move(f.x!==x?Math.sign(x-f.x):0,f.x===x?Math.sign(y-f.y):0);}}
 walk(10,6);assert.equal(f.ending,null);walk(3,9);walk(15,3);assert.deepEqual(f.delivered,[]);walk(4,3);assert.deepEqual(f.delivered,[0]);walk(16,9);walk(15,3);assert.equal(f.delivered.length,2);walk(10,6);assert.equal(f.ending,0);f.tick(8);assert.equal(f.done,false);f.tick(1);assert.equal(f.done,true);
});
