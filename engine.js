/* Deterministic simulation, independent of graphics and audio. */
class Night {
  constructor(level=1,random=Math.random){this.level=level;this.random=random;this.time=0;this.power=100;this.doors=[false,false];this.lights=[false,false];this.monitor=false;this.camera=0;this.position=0;this.side=0;this.moveIn=12;this.attack=0;this.blackout=0;this.status='playing';this.events=[];}
  toggle(kind,side){if(this.status!=='playing'||this.power<=0)return;if(kind==='monitor')this.monitor=!this.monitor;else this[kind][side]=!this[kind][side];this.events.push(kind);}
  get usage(){return 1+this.doors.filter(Boolean).length*2+this.lights.filter(Boolean).length+Number(this.monitor);}
  get room(){return this.position===0?0:this.position===1?1:this.position===2?2+this.side:4+this.side;}
  tick(dt){if(this.status!=='playing')return;this.time+=dt;if(this.time>=240){this.status='won';this.events.push('win');return;}
    this.power=Math.max(0,this.power-dt*(.135+this.usage*.072));
    if(this.power<=0){if(!this.blackout){this.doors=[false,false];this.lights=[false,false];this.monitor=false;this.events.push('blackout');}this.blackout+=dt;if(this.blackout>=9){this.status='lost';this.events.push('scare');}return;}
    if(this.position===3){this.attack+=dt;if(this.doors[this.side]){if(this.attack>=1.8){this.events.push('knock');this.position=0;this.attack=0;this.moveIn=9+this.random()*5;}}
      else if(this.attack>=Math.max(2.7,5.8-this.level*.5)){this.status='lost';this.events.push('scare');}return;}
    this.moveIn-=dt;if(this.moveIn<=0){this.position++;if(this.position===1)this.side=this.random()<.5?0:1;this.events.push('step');this.moveIn=(11-this.level*1.2)+this.random()*6;this.attack=0;}
  }
}
if(typeof module!=='undefined')module.exports=Night;
