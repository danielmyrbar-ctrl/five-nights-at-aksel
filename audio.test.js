const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Sound,AUDIO_FILES}=require('./audio');
const fs=require('node:fs');
test('All sound assets exist',()=>{for(const path of Object.values(AUDIO_FILES))assert.ok(fs.statSync(__dirname+'/'+path).size>100);});
function mockSound(){
 const s=new Sound(); s.buffers=Object.fromEntries(Object.keys(AUDIO_FILES).map(k=>[k,{}]));
 const node=()=>({gain:{setTargetAtTime(){}},connect(){return this;},disconnect(){},start(){},stop(){this.stopped=true;}});
 s.ctx={currentTime:0,createBufferSource:node,createGain:node};s.master=node();return s;
}
test('Music loop keeps phase across camera changes and stops on rage',()=>{
 const s=mockSound(),g={status:'playing',monitor:false,camera:'stage',alvarAngry:false};
 s.sync('play',g);const source=s.loops.musicbox.source;assert.equal(s.loops.musicbox.volume,0);
 g.monitor=true;g.camera='alvar';s.sync('play',g);assert.equal(s.loops.musicbox.source,source);assert.ok(s.loops.musicbox.volume>0);
 g.camera='gang';s.sync('play',g);assert.equal(s.loops.musicbox.source,source);assert.equal(s.loops.musicbox.volume,0);
 g.alvarAngry=true;s.sync('play',g);assert.ok(source.stopped);assert.equal(s.loops.musicbox,undefined);assert.ok(s.loops.angry.volume>0);
 g.monitor=false;s.sync('play',g);assert.ok(s.loops.angry.volume>0);
});
test('Office, menu, and rewind follow view and hold state',()=>{
 const s=mockSound(),g={status:'playing',monitor:false,camera:'stage',alvarAngry:false};
 s.sync('menu',null);assert.ok(s.loops.menu.volume>0);s.sync('play',g);assert.equal(s.loops.menu.volume,0);assert.ok(s.loops.office.volume>0);
 g.monitor=true;g.camera='alvar';g.winding=g.canWind=true;s.sync('play',g);assert.equal(s.loops.office.volume,0);assert.ok(s.loops.rewind);
 g.winding=false;s.sync('play',g);assert.equal(s.loops.rewind,undefined);s.resetNight();assert.equal(Object.keys(s.loops).length,0);
});
