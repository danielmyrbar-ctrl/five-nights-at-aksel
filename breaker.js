/* Mandatory post-night-three encounter. Progress persists when looking away. */
class BreakerGame {
  constructor(random=Math.random){
    this.random=random;this.stage=0;this.view='daniel';this.turn=0;this.nextView='daniel';this.age=0;
    this.moveIn=7+random()*4;this.lastChance=null;this.status='playing';this.events=[];
    this.systems=[['Ruter',6],['3D Printer',11],['Varmepumpe',8],['Kamerasystem',14]].map(([name,duration])=>({name,duration,progress:0}));this.active=-1;
  }
  look(){if(this.status!=='playing'||this.turn>0)return;this.nextView=this.view==='daniel'?'panel':'daniel';this.turn=.55;this.events.push('camera');}
  reboot(i){if(this.status!=='playing'||this.age<1.5||this.turn>0||this.view!=='panel'||this.active!==-1||!this.systems[i]||this.systems[i].progress>=this.systems[i].duration)return;this.active=i;this.events.push('camera');}
  tick(dt){
    if(this.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);this.age+=dt;if(this.age<1.5)return;
    if(this.turn>0){this.turn=Math.max(0,this.turn-dt);if(this.turn===0)this.view=this.nextView;}
    if(this.stage===4){this.lastChance-=dt;if(this.lastChance<=0){this.status='lost';this.events.push('scare');return;}}
    else if(this.view==='panel'||this.turn>0){this.moveIn-=dt;if(this.moveIn<=0){this.stage++;this.moveIn=7+this.random()*4;if(this.stage===4)this.lastChance=14+this.random()*6;}}
    if(this.active>=0){const s=this.systems[this.active];s.progress=Math.min(s.duration,s.progress+dt);if(s.progress>=s.duration){this.active=-1;this.events.push('complete');}}
    if(this.systems.every(s=>s.progress>=s.duration)){this.status='won';this.events.push('win');}
  }
}
class BreakerView {
  constructor(sound,onWin,onExit){
    this.sound=sound;this.onWin=onWin;this.onExit=onExit;this.game=null;this.paused=false;this.endTime=0;
    this.root=document.getElementById('breakerPanel');this.photo=document.getElementById('breakerPhoto');this.systemUI=document.getElementById('breakerSystems');this.label=document.getElementById('breakerText');
    document.getElementById('breakerTurn').onclick=()=>{if(!this.paused)this.game?.look();};
    document.getElementById('breakerPause').onclick=()=>this.pause(!this.paused);
    document.getElementById('breakerRetry').onclick=()=>this.begin();
    document.getElementById('breakerExit').onclick=()=>{this.dispose();this.onExit();};
  }
  begin(){
    this.sound.resetNight();this.sound.ctx?.resume();this.game=new BreakerGame();this.paused=false;this.endTime=0;this.root.hidden=false;this.root.className='breaker-intro';
    document.getElementById('breakerRetry').hidden=true;document.getElementById('breakerExit').hidden=true;
    this.systemUI.replaceChildren();
    this.game.systems.forEach((s,i)=>{const b=document.createElement('button');b.onclick=()=>{if(!this.paused)this.game.reboot(i);};b.innerHTML='<span>'+s.name+'</span><small>RESTART</small><i></i>';this.systemUI.append(b);});this.draw();
  }
  pause(value){if(!this.game||this.game.status!=='playing')return;this.paused=value;if(value)this.sound.ctx?.suspend();else this.sound.ctx?.resume();this.draw();}
  dispose(){this.root.hidden=true;this.game=null;this.sound.resetNight();this.sound.ctx?.resume();}
  draw(){
    const g=this.game;if(!g)return;
    const turning=g.turn>0,view=turning&&g.turn<.275?g.nextView:g.view;
    const file=g.status==='lost'?'daniel2.png':view==='panel'?'sikring.png':'daniel-stage'+g.stage+'.png';
    if(this.photo.getAttribute('src')!==file)this.photo.src=file;
    const scale=Math.min(this.root.clientWidth/1448,this.root.clientHeight/1086),iw=1448*scale,ih=1086*scale;
    Object.assign(this.systemUI.style,{left:((this.root.clientWidth-iw)/2+iw*.28)+'px',top:((this.root.clientHeight-ih)/2+ih*.17)+'px',width:(iw*.41)+'px',height:(ih*.40)+'px'});
    const p=turning?1-g.turn/.55:0,amount=Math.sin(p*Math.PI);
    this.photo.style.transform='perspective(1000px) translateX('+(g.nextView==='panel'?-1:1)*amount*18+'%) rotateY('+(g.nextView==='panel'?1:-1)*amount*19+'deg) scale('+(1+amount*.3)+')';
    this.photo.style.filter='blur('+amount*13+'px) brightness('+(1-amount*.65)+')';
    this.systemUI.hidden=view!=='panel'||turning||g.status!=='playing';
    [...this.systemUI.children].forEach((b,i)=>{const s=g.systems[i],done=s.progress>=s.duration;b.disabled=this.paused||g.active!==-1||done;b.querySelector('small').textContent=done?'ONLINE':g.active===i?'RESTARTER '+Math.floor(s.progress/s.duration*100)+'%':'RESTART';b.querySelector('i').style.width=s.progress/s.duration*100+'%';});
    document.getElementById('breakerTurn').hidden=g.status!=='playing';document.getElementById('breakerTurn').disabled=turning||this.paused;
    document.getElementById('breakerTurn').textContent=view==='daniel'?'❯':'❮';document.getElementById('breakerTurn').setAttribute('aria-label',view==='daniel'?'Se bakover på sikringsskapet':'Se tilbake på Daniel');
    document.getElementById('breakerPause').textContent=this.paused?'FORTSETT':'PAUSE';
    this.label.textContent=this.paused?'PAUSE':g.status==='won'?'ALLE SYSTEMER ONLINE':g.status==='lost'?'HAN VAR IKKE DØD':g.stage===4&&view==='daniel'?'STOLEN ER TOM. FULLFØR RESTARTENE.':g.active>=0?g.systems[g.active].name+' restarter …':view==='daniel'?'Han beveger seg når du ser bort. Restart alle fire systemer.':'Velg et system. Du kan se tilbake mens det restarter.';
    this.root.style.opacity=g.status==='won'?Math.max(0,1-this.endTime/2):Math.min(1,g.age/1.5);
    this.root.classList.toggle('breaker-scare',g.status==='lost'&&this.endTime<1.6);
  }
  tick(dt){
    if(!this.game)return;const g=this.game;
    if(!this.paused){g.tick(dt);for(const e of g.events.splice(0)){if(e==='complete')this.sound.chip(2);else if(e!=='win')this.sound.play(e);}if(g.status!=='playing')this.endTime+=dt;}
    this.draw();
    if(g.status==='won'&&this.endTime>=2){this.dispose();this.onWin();}
    else if(g.status==='lost'&&this.endTime>=1.6){document.getElementById('breakerRetry').hidden=false;document.getElementById('breakerExit').hidden=false;}
  }
}
if(typeof module!=='undefined')module.exports={BreakerGame};
