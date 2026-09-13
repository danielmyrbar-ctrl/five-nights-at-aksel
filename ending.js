/* Media completion, not guessed durations, advances videos and starter attempts. */
class CarEnding {
  constructor(random=Math.random){this.random=random;this.phase='dawn';this.elapsed=0;this.attempts=0;this.events=[];}
  enter(phase){this.phase=phase;this.elapsed=0;this.events.push(phase);}
  tick(dt){
    if(!Number.isFinite(dt)||dt<=0)return;this.elapsed+=dt;
    if(this.phase==='dawn'&&this.elapsed>=2)this.enter('intro');
    else if(this.phase==='carEnter'&&this.elapsed>=4.5)this.enter('idle');
    else if(this.phase==='return'&&this.elapsed>=3)this.enter('done');
  }
  videoEnded(){if(this.phase==='intro')this.enter('choose');else if(this.phase==='walk')this.enter('carEnter');}
  walk(){if(this.phase==='choose')this.enter('walk');}
  attempt(){if(this.phase!=='idle')return null;this.enter('trying');return this.random()<.5?'start1':'start2';}
  attemptEnded(){if(this.phase==='trying'){this.attempts++;this.enter('idle');}}
  attemptFailed(){if(this.phase==='trying')this.enter('idle');}
  goBack(){if(this.phase==='idle'&&this.attempts>0)this.enter('return');}
  get musicVolume(){if(this.phase==='dawn')return 0;if(this.phase==='intro')return Math.min(1,this.elapsed/1.5);if(this.phase==='return')return Math.max(0,1-this.elapsed/3);if(this.phase==='done')return 0;return 1;}
  get black(){if(this.phase==='dawn')return 1;if(this.phase==='intro')return Math.max(0,1-this.elapsed/1.5);if(this.phase==='carEnter')return 1-Math.min(1,Math.max(0,this.elapsed-.5)/1.5);if(this.phase==='return')return Math.min(1,this.elapsed/3);if(this.phase==='done')return 1;return 0;}
}
class EndingView {
  constructor(sound,onReturn){
    this.sound=sound;this.onReturn=onReturn;this.model=null;this.session=0;this.paused=false;
    this.root=document.getElementById('endingPanel');this.video=document.getElementById('endingVideo');this.photo=document.getElementById('endingPhoto');
    this.music=document.getElementById('endingMusic');this.music.loop=true;
    this.video.muted=true;this.video.defaultMuted=true;this.video.volume=0;
    this.video.onended=()=>this.model?.videoEnded();
    this.video.onerror=()=>this.mediaError();
    this.video.onplaying=()=>{document.getElementById('endingRetry').hidden=true;this.message('');};
    document.getElementById('goCar').onclick=()=>this.model?.walk();
    document.getElementById('startCar').onclick=()=>this.attempt();
    document.getElementById('goInside').onclick=()=>this.model?.goBack();
    document.getElementById('endingRetry').onclick=()=>this.playVideo(true);
    document.getElementById('endingPause').onclick=()=>this.pause(!this.paused);
    document.getElementById('endingMute').onclick=()=>{sound.setMuted(!sound.muted);};
  }
  begin(){
    this.dispose();this.model=new CarEnding();this.paused=false;this.root.hidden=false;
    this.music.currentTime=0;this.music.volume=0;this.message('');this.update();
    for(const path of ['velgbil.jpg','car not started.png','car trying to start.jpg']){const image=new Image();image.src=path;}
    document.getElementById('endingPause').textContent='PAUSE';
  }
  message(text){document.getElementById('endingStatus').textContent=text;}
  mediaError(){if(!this.model)return;this.message('Videoen kunne ikke starte. Prøv igjen.');document.getElementById('endingRetry').hidden=false;}
  playVideo(retry=false){
    if(!this.model||!['intro','walk'].includes(this.model.phase))return;
    const expected=this.model.phase==='intro'?'introcar.mp4':'walktocar.mp4';
    if(retry||this.video.getAttribute('src')!==expected){this.video.src=expected;this.video.load();}
    this.video.muted=true;this.video.volume=0;
    this.video.play().catch(()=>this.mediaError());this.music.play().catch(()=>{});
  }
  async attempt(){
    const id=this.model?.attempt();if(!id)return;
    const token=this.session;this.message('');this.update();
    try{
      await this.sound.start();await this.sound.ensure(id);
      if(token!==this.session||this.model?.phase!=='trying')return;
      this.sound.play(id,()=>{if(token===this.session){this.model?.attemptEnded();this.update();}});
    }catch{if(token===this.session){this.model.attemptFailed();this.message('Startlyden kunne ikke lastes. Prøv igjen.');this.update();}}
  }
  pause(value){
    if(!this.model)return;this.paused=value;
    if(value){this.video.pause();this.music.pause();this.sound.ctx?.suspend();}
    else{this.sound.ctx?.resume();if(['intro','walk'].includes(this.model.phase))this.playVideo();if(this.model.phase!=='dawn')this.music.play().catch(()=>{});}
    document.getElementById('endingPause').textContent=value?'FORTSETT':'PAUSE';
  }
  tick(dt){
    if(!this.model)return;
    if(!this.paused)this.model.tick(dt);
    for(const event of this.model.events.splice(0)){
      if(event==='intro'||event==='walk')this.playVideo();
      if(event==='choose'||event==='carEnter')this.video.pause();
      if(event==='done'){this.dispose();this.onReturn();return;}
    }
    this.update();
  }
  update(){
    if(!this.model)return;const p=this.model.phase;
    this.root.dataset.phase=p;
    this.video.hidden=!['intro','walk'].includes(p);
    this.photo.hidden=['dawn','intro','walk','done'].includes(p);
    const photo=p==='choose'?'velgbil.jpg':p==='trying'?'car trying to start.jpg':'car not started.png';
    if(this.photo.getAttribute('src')!==photo)this.photo.src=photo;
    document.getElementById('endingBlack').style.opacity=this.model.black;
    document.getElementById('endingClock').hidden=p!=='dawn';
    document.getElementById('endingClock').style.opacity=1-Math.min(1,Math.max(0,this.model.elapsed-1));
    document.getElementById('goCar').hidden=p!=='choose';
    document.getElementById('startCar').hidden=p!=='idle';
    document.getElementById('goInside').hidden=p!=='idle'||this.model.attempts===0;
    document.getElementById('endingMute').textContent=this.sound.muted?'LYD AV':'LYD PÅ';
    this.music.volume=this.sound.muted?0:.55*this.model.musicVolume;
  }
  dispose(){this.session++;this.model=null;this.video.pause();this.video.removeAttribute('src');this.video.load();this.music.pause();this.root.hidden=true;document.getElementById('endingRetry').hidden=true;}
}
if(typeof module!=='undefined')module.exports={CarEnding};
