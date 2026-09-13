const {test}=require('node:test'),assert=require('node:assert/strict');
const {MemoryGame}=require('./memories');
function route(m,target){const q=[[[m.x,m.y],[]]],seen=new Set();while(q.length){const [[x,y],path]=q.shift();if(x===target[0]&&y===target[1])return path;for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+d[0],ny=y+d[1],k=nx+','+ny;if(m.map[ny]?.[nx]==='.'&&!seen.has(k)){seen.add(k);q.push([[nx,ny],[...path,d]]);}}}throw Error('Unreachable target');}
test('All five memories can be completed with real movement, with and without secrets',()=>{
 for(let level=1;level<=5;level++)for(const r of [0,.9]){
  const m=new MemoryGame(level,()=>r);m.tick(3);
  for(const target of [...m.targets,m.exit])for(const d of route(m,target)){m.tick(.15);m.move(...d);}
  assert.equal(m.done,true);assert.equal(m.collected.length,3);assert.equal(m.message,m.story.ending);
  assert.equal(m.secretSeen,r===0);const x=m.x;m.move(-1,0);assert.equal(m.x,x);
 }
});
test('Intro blocks input, walls block movement, and exit requires all three clues',()=>{
 const m=new MemoryGame(1,()=>1);m.move(1,0);assert.equal(m.x,2);m.tick(3);
 for(const d of route(m,m.exit)){m.tick(.15);m.move(...d);}assert.equal(m.done,false);
 m.x=1;m.y=1;m.tick(1);m.move(-1,0);assert.equal(m.x,1);
});
