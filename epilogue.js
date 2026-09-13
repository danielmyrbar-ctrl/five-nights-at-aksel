/* A continuous, playable journey beyond the surveillance map. */
class RainEpilogue {
  constructor(){this.phase='inside';this.x=320;this.y=290;this.time=0;this.phaseTime=0;this.done=false;}
  enter(phase,x,y){this.phase=phase;this.phaseTime=0;this.x=x;this.y=y;}
  get hint(){return {inside:'06:00 · FINN UTGANGEN MOT NORD',outside:'REGNET SKJULER IKKE ALT · FINN DEN RØDE BILEN',drive:'KJØR ØSTOVER · VEIEN FORTSETTER',arrival:'GÅ TIL DØREN I DEN NYE BYGNINGEN',ending:'',done:''}[this.phase];}
  tick(dt,dx=0,dy=0){
    if(this.done||!Number.isFinite(dt)||dt<=0)return;
    dt=Math.min(dt,.1);this.time+=dt;this.phaseTime+=dt;
    if(this.phase==='ending'){if(this.phaseTime>=14){this.done=true;this.phase='done';}return;}
    const speed=this.phase==='drive'?150:83,n=Math.hypot(dx,dy)||1;
    this.x+=dx/n*speed*dt;this.y+=dy/n*speed*dt;
    if(this.phase==='inside'){
      this.x=Math.max(100,Math.min(540,this.x));this.y=Math.max(52,Math.min(312,this.y));
      if(this.y<65&&Math.abs(this.x-320)<32)this.enter('outside',320,105);
    }else if(this.phase==='outside'){
      this.x=Math.max(25,Math.min(615,this.x));this.y=Math.max(105,Math.min(335,this.y));
    }else if(this.phase==='drive'){
      this.x=Math.max(100,Math.min(1700,this.x));this.y=Math.max(230,Math.min(285,this.y));
      if(this.x>=1650)this.enter('arrival',115,275);
    }else if(this.phase==='arrival'){
      this.x=Math.max(25,Math.min(615,this.x));this.y=Math.max(178,Math.min(335,this.y));
    }
  }
  get canAct(){return this.phase==='outside'&&Math.hypot(this.x-440,this.y-270)<65||this.phase==='arrival'&&Math.hypot(this.x-452,this.y-184)<48;}
  action(){if(!this.canAct)return;if(this.phase==='outside')this.enter('drive',100,260);else this.enter('ending',0,0);}
}
function pixelGuard(c,x,y){
  c.fillStyle='#b58b73';c.fillRect(x-4,y-15,8,7);c.fillStyle='#66829a';c.fillRect(x-6,y-8,12,12);c.fillStyle='#ddd4a0';c.fillRect(x-5,y-7,2,3);c.fillStyle='#151622';c.fillRect(x-5,y+4,4,7);c.fillRect(x+1,y+4,4,7);
}
function pixelSedan(c,x,y){
  // Long bonnet, upright cabin and separate boot: a boxy red Scandinavian sedan.
  c.fillStyle='#10131b';c.fillRect(x-38,y+7,14,13);c.fillRect(x+24,y+7,14,13);
  c.fillStyle='#692127';c.fillRect(x-48,y-4,96,17);c.fillRect(x-29,y-22,47,20);
  c.fillStyle='#a53839';c.fillRect(x-47,y-6,95,6);c.fillRect(x-26,y-24,40,4);
  c.fillStyle='#3c5a69';c.fillRect(x-24,y-19,16,13);c.fillRect(x-4,y-19,18,13);
  c.fillStyle='#98978a';c.fillRect(x-50,y+6,6,5);c.fillRect(x+44,y+5,7,5);
  c.fillStyle='#eedb9a';c.fillRect(x+44,y-3,5,6);c.fillStyle='#f45142';c.fillRect(x-48,y-3,4,5);
}
function pixelBuilding(c,x,y){
  c.fillStyle='#171c29';c.fillRect(x,y,205,125);c.fillStyle='#414753';c.fillRect(x-8,y-8,221,9);
  c.fillStyle='#272f3d';for(let i=0;i<5;i++)c.fillRect(x+15+i*38,y+18,23,40);
  c.fillStyle='#a49963';c.fillRect(x+167,y+23,15,27);
  c.fillStyle='#050509';c.fillRect(x+83,y+70,37,55);c.fillStyle='#72705f';c.fillRect(x+112,y+95,3,4);
  c.fillStyle='#9d9c8b';c.font='9px monospace';c.fillText('ARKIV 02',x+75,y+64);
}
class RainView {
  constructor(canvas){this.canvas=canvas;this.out=canvas.getContext('2d');this.buffer=document.createElement('canvas');this.buffer.width=640;this.buffer.height=360;this.c=this.buffer.getContext('2d');}
  draw(e){
    const c=this.c;c.imageSmoothingEnabled=false;c.fillStyle='#080d18';c.fillRect(0,0,640,360);
    if(e.phase==='inside'){
      c.fillStyle='#29303b';c.fillRect(80,35,480,295);c.fillStyle='#141a27';c.fillRect(96,50,448,264);
      for(let x=96;x<544;x+=32)for(let y=50;y<312;y+=32){c.fillStyle=(x+y)%64?'#1c2230':'#222837';c.fillRect(x,y,31,31);}
      c.fillStyle='#05060c';c.fillRect(292,34,56,30);c.fillStyle='#a8bca1';c.font='10px monospace';c.fillText('UT',313,29);
      for(const x of [145,425]){c.fillStyle='#554735';c.fillRect(x,135,60,25);c.fillStyle='#777260';c.fillRect(x+8,127,12,8);}
    }else if(e.phase==='drive'){
      const scroll=Math.max(0,e.x-220);
      for(let i=0;i<22;i++){const x=i*110-scroll*.65;c.fillStyle='#111d28';c.fillRect(x,75,12,140);c.beginPath();c.moveTo(x-34,170);c.lineTo(x+6,50);c.lineTo(x+42,170);c.fill();}
      c.fillStyle='#202632';c.fillRect(0,216,640,87);c.fillStyle='#848576';for(let x=-scroll%90;x<640;x+=90)c.fillRect(x,257,40,3);
      c.fillStyle='#0d1821';c.fillRect(0,303,640,57);
      if(e.x>1100)pixelBuilding(c,1690-scroll,80);
      const sx=e.x-scroll;c.fillStyle='#dacf7520';c.beginPath();c.moveTo(sx+46,e.y);c.lineTo(sx+240,e.y-40);c.lineTo(sx+240,e.y+30);c.fill();pixelSedan(c,sx,e.y);
      c.fillStyle='#b4baaa';c.font='10px monospace';c.fillText('02 →',520,199);
    }else if(e.phase==='outside'||e.phase==='arrival'){
      c.fillStyle='#152330';c.fillRect(0,185,640,175);c.fillStyle='#293646';for(let i=0;i<15;i++)c.fillRect((i*89)%620,215+(i*31)%110,25,2);
      if(e.phase==='outside'){c.fillStyle='#23222a';c.fillRect(160,10,320,85);c.fillStyle='#050509';c.fillRect(302,51,36,44);pixelSedan(c,440,270);}
      else{pixelBuilding(c,350,55);pixelSedan(c,95,292);}
    }
    if(!['drive','ending','done'].includes(e.phase))pixelGuard(c,e.x,e.y);
    if(!['inside','ending','done'].includes(e.phase)){
      c.strokeStyle='#8badc04d';c.lineWidth=1;for(let i=0;i<130;i++){const x=(i*71+e.time*37)%660-10,y=(i*47+e.time*210)%380-20;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+14);c.stroke();}
    }
    if(e.phase==='ending'||e.phase==='done'){
      c.fillStyle='#000';c.fillRect(0,0,640,360);const t=e.phaseTime;
      c.globalAlpha=Math.min(1,t/2)*Math.max(0,Math.min(1,(14-t)/3));c.fillStyle='#bbb9aa';c.textAlign='center';c.font='13px monospace';
      if(t>1)c.fillText('DETTE VAR BARE DET FØRSTE HUSET.',320,147);
      if(t>4)c.fillText('NOEN HADDE ALLEREDE SKREVET NAVNET DITT.',320,179);
      if(t>7){c.fillStyle='#777e87';c.font='10px monospace';c.fillText('ARKIV 02 / ANKOMST REGISTRERT FØR 06:00',320,219);}
      c.textAlign='start';c.globalAlpha=1;
    }
    c.fillStyle='#0003';for(let y=0;y<360;y+=3)c.fillRect(0,y,640,1);
    this.out.imageSmoothingEnabled=false;this.out.drawImage(this.buffer,0,0,this.canvas.width,this.canvas.height);
  }
}
if(typeof module!=='undefined')module.exports={RainEpilogue};
