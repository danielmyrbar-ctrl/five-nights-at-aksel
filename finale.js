/* The final memory: Alvar brings two offerings to the silent room. */
class FinaleGame {
 constructor(){this.level=7;this.x=10;this.y=10;this.age=0;this.delay=0;this.done=false;this.ending=null;this.collected=[];this.delivered=[];this.message='Du er Alvar. Aksel og Daniel ligger urørlige på gulvet.';this.messageFor=5;this.story={title:'07 / DEN SISTE PRESANGEN',task:'Finn snus til Daniel og Urge til Aksel.'};this.items=[{name:'SNUS',x:3,y:9},{name:'URGE',x:16,y:9}];this.people=[{name:'DANIEL',x:4,y:3},{name:'AKSEL',x:15,y:3}];this.exit=[10,6];}
 get objective(){return this.ending!==null?'':this.delivered.length===2?'GÅ TIL DEN STORE PRESANGEN MIDT I ROMMET':this.delivered.length+'/2 · '+this.story.task;}
 move(dx,dy){if(this.done||this.ending!==null||this.age<2.5||this.delay>0||Math.abs(dx)+Math.abs(dy)!==1)return;this.x=Math.max(1,Math.min(18,this.x+dx));this.y=Math.max(1,Math.min(10,this.y+dy));this.delay=.14;
 this.items.forEach((item,i)=>{if(this.x===item.x&&this.y===item.y&&!this.collected.includes(i)){this.collected.push(i);this.note=i;this.message='Du fant '+item.name+'. Ta den til '+this.people[i].name+'.';this.messageFor=4;}});
 this.people.forEach((person,i)=>{if(Math.abs(this.x-person.x)+Math.abs(this.y-person.y)<=1&&this.collected.includes(i)&&!this.delivered.includes(i)){this.delivered.push(i);this.note=2;this.message=person.name+' fikk '+this.items[i].name+'. Ingen svarer.';this.messageFor=4;}});
 if(this.x===10&&this.y===6){if(this.delivered.length===2){this.ending=0;this.message='';this.messageFor=0;}else{this.message='Presangen er ikke til deg. Ikke ennå.';this.messageFor=3;}}
 }
 tick(dt){this.age+=dt;this.delay=Math.max(0,this.delay-dt);this.messageFor=Math.max(0,this.messageFor-dt);if(this.ending!==null){this.ending+=dt;if(this.ending>=9)this.done=true;}}
}
class FinaleView {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.surface=document.createElement('canvas');this.surface.width=320;this.surface.height=192;this.c=this.surface.getContext('2d');}
 draw(m){const c=this.c;c.imageSmoothingEnabled=false;c.fillStyle='#050509';c.fillRect(0,0,320,192);
 for(let y=1;y<11;y++)for(let x=1;x<19;x++){c.fillStyle=(x+y)%2?'#201723':'#291d2c';c.fillRect(x*16,y*16,15,15);}
 c.fillStyle='#594452';c.fillRect(16,16,288,3);c.font='7px monospace';c.textAlign='center';
 m.people.forEach((p,i)=>{const x=p.x*16,y=p.y*16;c.fillStyle='#a57d67';c.fillRect(x-8,y+3,7,7);c.fillStyle=i?'#141419':'#393342';c.fillRect(x-1,y+2,15,9);c.fillRect(x+14,y+2,9,3);c.fillRect(x+14,y+8,9,3);c.fillStyle='#a99caa';c.fillText(p.name,x+5,y-4);if(m.delivered.includes(i)){c.fillStyle=i?'#bfdf42':'#c1b9ac';c.fillRect(x,y+16,6,5);}});
 m.items.forEach((p,i)=>{if(m.collected.includes(i))return;c.fillStyle=i?'#bddc45':'#b7b8c2';if(i){c.fillRect(p.x*16+5,p.y*16,6,12);c.fillRect(p.x*16+7,p.y*16-3,2,3);}else{c.beginPath();c.arc(p.x*16+8,p.y*16+7,6,0,Math.PI*2);c.fill();}c.fillStyle='#c6bea2';c.fillText(p.name,p.x*16+8,p.y*16+23);});
 c.fillStyle='#70323f';c.fillRect(146,78,36,32);c.fillStyle='#d3bb70';c.fillRect(160,78,7,32);c.fillRect(146,87,36,6);c.strokeStyle='#d3bb70';c.strokeRect(151,71,10,7);c.strokeRect(167,71,10,7);
 const x=m.x*16,y=m.y*16;c.fillStyle='#aa7e64';c.fillRect(x+5,y+1,7,6);c.fillStyle='#533d2c';c.fillRect(x+4,y,9,3);c.fillStyle='#728346';c.fillRect(x+3,y+7,11,7);c.fillStyle='#c9c8a4';c.fillRect(x+7,y+8,3,3);c.fillStyle='#080a0a';c.fillRect(x+4,y+14,3,2);c.fillRect(x+10,y+14,3,2);
 if(m.age<2.5){c.fillStyle='#000';c.fillRect(0,0,320,192);c.fillStyle='#d5d1b3';c.font='18px monospace';c.fillText('06:00',160,90);c.font='8px monospace';c.fillText('ALVAR HUSKER VEIEN',160,113);}
 if(m.ending!==null){c.fillStyle='rgba(0,0,0,'+Math.min(1,m.ending/1.6)+')';c.fillRect(0,0,320,192);if(m.ending>1.6){c.globalAlpha=Math.min(1,(m.ending-1.6)/1.2,Math.max(0,(9-m.ending)/1.5));c.fillStyle='#e6dfc3';c.font='32px monospace';c.fillText('Du vant',160,90);if(m.ending>3.4){c.font='13px monospace';c.fillStyle='#aaa094';c.fillText('denne gang...',160,120);}c.globalAlpha=1;}}
 c.fillStyle='#0003';for(let y=0;y<192;y+=3)c.fillRect(0,y,320,1);this.ctx.imageSmoothingEnabled=false;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.surface,0,0,this.canvas.width,this.canvas.height);
 }
}
if(typeof module!=='undefined')module.exports={FinaleGame};
