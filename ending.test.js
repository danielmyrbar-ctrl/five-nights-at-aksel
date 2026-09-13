const {test}=require('node:test'),assert=require('node:assert/strict');
const {CarEnding}=require('./ending');
test('Car sequence waits for each video and delays starter until 2.5s after fade-in',()=>{
 const e=new CarEnding();assert.equal(e.phase,'dawn');assert.equal(e.musicVolume,0);
 e.tick(2);assert.equal(e.phase,'intro');e.tick(20);assert.equal(e.phase,'intro');
 e.videoEnded();assert.equal(e.phase,'choose');e.walk();assert.equal(e.phase,'walk');e.tick(20);assert.equal(e.phase,'walk');
 e.videoEnded();assert.equal(e.phase,'carEnter');assert.equal(e.black,1);
 e.tick(2);assert.equal(e.black,0);assert.equal(e.attempt(),null);e.tick(2.49);assert.equal(e.phase,'carEnter');e.tick(.02);assert.equal(e.phase,'idle');
});
test('Unlimited randomized starter attempts finish only on sound completion, then permit returning',()=>{
 for(const r of [.1,.9]){
  const e=new CarEnding(()=>r);e.enter('idle');e.goBack();assert.equal(e.phase,'idle');
  for(let i=0;i<50;i++){
   assert.equal(e.attempt(),r<.5?'start1':'start2');assert.equal(e.attempt(),null);
   e.tick(60);assert.equal(e.phase,'trying');e.goBack();assert.equal(e.phase,'trying');
   e.attemptEnded();assert.equal(e.phase,'idle');assert.equal(e.attempts,i+1);
  }
  e.goBack();assert.equal(e.phase,'return');e.tick(1.5);assert.equal(e.musicVolume,.5);assert.equal(e.black,.5);
  e.tick(1.5);assert.equal(e.phase,'done');assert.equal(e.musicVolume,0);
 }
});
test('Failed starter loading permits retry without pretending an attempt completed',()=>{
 const e=new CarEnding();e.enter('idle');e.attempt();e.attemptFailed();assert.equal(e.phase,'idle');assert.equal(e.attempts,0);
});
