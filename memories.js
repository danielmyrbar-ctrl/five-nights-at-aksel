/* Five playable low-resolution memories. No night simulation runs here. */
const MEMORY_STORIES = [
  {title:'01 / DEN SISTE GJESTEN', task:'Bær ett navneskilt om gangen til stolen.', items:['AKSEL','ALVAR','DANIEL'], lines:['Tre navn. Bare to vakter i loggen.','Den tredje kom aldri gjennom døren.','Hvis du ser ham: se bort.'], ending:'Det sto en stol igjen etter at alle hadde gått.'},
  {title:'02 / DET SISTE FILAMENTET', task:'AKSEL: Finn ABS-filamentet i verkstedet.', items:['PLA','PETG','ABS'], lines:['PLA. Feil materiale. Noen har flyttet spolene.','PETG. En tom stol står ved printeren.','ABS. Det var allerede merket med navnet ditt.'], ending:"you can't"},
  {title:'03 / INGEN PÅ OPPTAKET', task:'Hent opptakene i rekkefølge: 01, 02, 00.', items:['01','02','00'], lines:['Kamera 01: Aksel leter.','Kamera 02: ingen går ut.','Kamera 00 finnes ikke på kartet.'], ending:'På hvert opptak er det en person bak kameraet.'},
  {title:'04 / PLASSEN VED BORDET', task:'Finn sporene. Ikke la skyggen nå deg.', items:['NØKKEL','BÅND','NAVN'], lines:['Nøkkelen passer ingen dør.','Båndet slutter før bankingen.','Daniel er skrevet på baksiden.'], ending:'De fjernet navnet fra listen. Ikke fra huset.'},
  {title:'05 / IKKE GLEM MEG', task:'Samle minnene. Gå tilbake til stolen.', items:['STOL','SANG','BILDE'], lines:['Aksel har lett etter den samme gjesten hver natt.','Alvar husker bare melodien.','Du husker ansiktet nå.'], ending:'Klokken er seks. Den tomme stolen er vendt mot deg.'},
  {title:'06 / DU KOM TILBAKE', task:'Finn sporene fra natten utenfor.', items:['BIL','LYD','DØR'], lines:['Motoren svarte aldri.','Sangen kom fra huset.','Døren hadde stått åpen hele tiden.'], ending:'Ingen ba deg komme tilbake. Likevel var stolen din varm.'}
];
class MemoryGame {
  constructor(level, random=Math.random) {
    this.level=Math.max(1,Math.min(6,level));this.story=MEMORY_STORIES[this.level-1];
    this.x=2;this.y=10;this.age=0;this.delay=0;this.message='06:00 / ET MINNE KOMMER TILBAKE';this.messageFor=2.5;
    this.carry=null;this.delivered=[];this.reveal=null;this.shadow=[17,9];this.shadowIn=.8;this.grace=3;
    this.collected=[];this.done=false;this.secret=this.level!==2&&random()<.18;this.secretSeen=false;this.flash=0;
    this.targets=[[[3,2],[10,5],[16,9]],[[3,8],[10,2],[16,6]],[[4,2],[12,8],[16,4]],[[3,5],[9,9],[16,2]],[[4,8],[10,2],[16,7]],[[3,2],[10,8],[16,5]]][this.level-1];this.exit=[17,2];
    this.map=Array.from({length:12},(_,y)=>Array.from({length:20},(_,x)=>x===0||y===0||x===19||y===11?'#':'.'));
    // Different partitions, with wide connecting passages on every floor.
    for(let y=2;y<=8;y++)if(y!==3&&y!==7)this.map[y][5+this.level%3]='#';
    for(let x=8;x<=17;x++)if(x!==11&&x!==15)this.map[3+this.level%5][x]='#';
    for(const [x,y] of [...this.targets,this.exit,[2,10]])this.map[y][x]='.';
  }
  move(dx,dy) {
    if(this.done||this.reveal!==null||this.age<2.5||this.delay>0||Math.abs(dx)+Math.abs(dy)!==1)return;
    const nx=this.x+dx,ny=this.y+dy;
    if(this.map[ny]?.[nx]!=='#'&&this.map[ny]?.[nx]!==undefined){this.x=nx;this.y=ny;}
    this.delay=.13;
    this.targets.forEach(([x,y],i)=>{if(this.x===x&&this.y===y&&!this.collected.includes(i)){
      if(this.level===1&&this.carry!==null)return;
      if(this.level===3&&i!==this.collected.length){this.message='BÅNDET KAN IKKE SPILLES ENNÅ. FINN '+this.story.items[this.collected.length];this.messageFor=2;return;}
      this.collected.push(i);this.message=this.story.lines[i];this.messageFor=4;this.note=i;
      if(this.level===1)this.carry=i;
      if(this.level===2&&i===2){this.reveal=0;this.message='';this.messageFor=0;}
    }});
    if(this.secret&&!this.secretSeen&&this.x>=14&&this.y<=5){
      this.secretSeen=true;this.flash=1.2;this.message=['DU VAR HER FØR.','DET ER FIRE NAVN PÅ LISTEN.','IKKE SE PÅ KAMERA 00.','HAN KJENNER IGJEN DEG.','DETTE ER IKKE DET FØRSTE MINNET.','NØKKELEN LÅ ALLTID I LOMMEN DIN.'][this.level-1];this.messageFor=5;
    }
    if(this.x===this.exit[0]&&this.y===this.exit[1]){
      if(this.level===1&&this.carry!==null){this.delivered.push(this.carry);this.carry=null;this.message='NAVNET ER LEVERT. STOLEN ER FORTSATT TOM.';this.messageFor=3;}
      if(this.level!==2&&this.collected.length===3&&(this.level!==1||this.delivered.length===3)){this.done=true;this.message=this.story.ending;this.messageFor=99;}
      else {this.message='Noe mangler. '+this.collected.length+'/3';this.messageFor=2;}
    }
  }
  get objective(){
    if(this.reveal!==null)return '';
    if(this.level===1)return this.delivered.length+'/3 LEVERT · '+(this.carry!==null?'TA '+this.story.items[this.carry]+' TIL STOLEN':this.story.task);
    if(this.level===2)return this.story.task;
    return this.collected.length+'/3 · '+(this.collected.length===3?'GÅ TIL STOLEN ØVERST TIL HØYRE':this.story.task);
  }
  tick(dt){
    this.age+=dt;this.delay=Math.max(0,this.delay-dt);this.messageFor=Math.max(0,this.messageFor-dt);this.flash=Math.max(0,this.flash-dt);
    if(this.reveal!==null){this.reveal+=dt;if(this.reveal>=7){this.done=true;this.message=this.story.ending;}return;}
    if(this.level!==4||this.done||this.age<2.5)return;
    this.grace=Math.max(0,this.grace-dt);this.shadowIn-=dt;
    if(this.shadowIn<=0){
      this.shadowIn=.5;
      const q=[[...this.shadow,[]]],seen=new Set([this.shadow.join(',')]);let step=null;
      while(q.length){const [x,y,path]=q.shift();if(x===this.x&&y===this.y){step=path[0];break;}
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(this.map[ny]?.[nx]==='.'&&!seen.has(k)){seen.add(k);q.push([nx,ny,[...path,[nx,ny]]]);}}
      }
      if(step)this.shadow=step;
      if(this.grace===0&&this.shadow[0]===this.x&&this.shadow[1]===this.y){this.x=2;this.y=10;this.shadow=[17,9];this.grace=3;this.message='DU HAR GÅTT DENNE VEIEN FØR.';this.messageFor=3;this.flash=.4;}
    }
  }
}
class MemoryView {
  constructor(canvas,images) {this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.surface=document.createElement('canvas');this.surface.width=320;this.surface.height=192;this.c=this.surface.getContext('2d');}
  draw(m) {
    const c=this.c;c.imageSmoothingEnabled=false;c.fillStyle='#080812';c.fillRect(0,0,320,192);
    for(let y=0;y<12;y++)for(let x=0;x<20;x++){
      const wall=m.map[y][x]==='#';const palette=[['#293041','#10131e','#151924'],['#37382e','#161b18','#20271f'],['#24363d','#0c1821','#10212b'],['#3c2939','#1b101b','#251620'],['#343131','#141414','#202020']][Math.min(4,m.level-1)];c.fillStyle=palette[wall?0:(x+y)%2?1:2];c.fillRect(x*16,y*16,16,16);
      if(wall){c.fillStyle='#41414d';c.fillRect(x*16,y*16,16,2);c.fillStyle='#151922';c.fillRect(x*16+7,y*16+3,1,13);}
    }
    // Empty party tables, extinguished candles, and an unoccupied chair.
    for(const [x,y] of (m.level===2?[[3,3],[10,8],[15,3]]:m.level===3?[[3,6],[9,7],[15,8]]:[[3,5],[9,9],[15,5]])){c.fillStyle='#564331';c.fillRect(x*16,y*16,23,9);c.fillStyle='#95814b';c.fillRect(x*16+9,y*16-5,3,5);}
    if(m.level===2){
      c.fillStyle='#8b9973';c.font='6px monospace';c.textAlign='left';c.fillText('VERKSTED / 03:17',18,24);
      for(const [x,y] of [[3,3],[10,8],[15,3]]){c.strokeStyle='#73786b';c.strokeRect(x*16+2,y*16-16,18,17);c.fillStyle='#ba7139';c.fillRect(x*16+9,y*16-9,4,4);}
    }
    if(m.level===3){c.fillStyle='#789c9d';c.font='6px monospace';c.fillText('ARCHIVE / PLAY 01 > 02 > 00',20,22);}
    const [ex,ey]=m.exit;c.fillStyle=m.collected.length===3?'#c4b36d':'#544e3e';c.fillRect(ex*16+2,ey*16+2,12,11);c.fillRect(ex*16+2,ey*16+12,3,4);c.fillRect(ex*16+11,ey*16+12,3,4);
    m.targets.forEach(([x,y],i)=>{if(!m.collected.includes(i)){c.fillStyle=Math.floor(m.age*3)%2?'#d4c889':'#95885b';c.fillRect(x*16+4,y*16+3,8,10);c.fillStyle='#463d3a';c.fillRect(x*16+6,y*16+6,4,1);
      if(m.level===2){c.strokeStyle='#c3b58b';c.beginPath();c.arc(x*16+8,y*16+8,6,0,Math.PI*2);c.stroke();c.fillStyle='#b6be9e';c.font='6px monospace';c.textAlign='center';c.fillText(m.story.items[i],x*16+8,y*16-2);c.textAlign='left';}}});
    // Pixel guard, rendered directly at 320x192 resolution.
    const px=m.x*16,py=m.y*16;c.fillStyle='#ae826b';c.fillRect(px+5,py+1,7,6);c.fillStyle=m.level===2?'#171719':'#708fa4';c.fillRect(px+3,py+7,11,6);c.fillStyle='#c8c7ba';c.fillRect(px+3,py+7,2,2);c.fillStyle='#090b12';c.fillRect(px+4,py+13,3,3);c.fillRect(px+10,py+13,3,3);
    if(m.level===2){c.fillStyle='#62452e';c.fillRect(px+3,py,11,4);c.fillRect(px+3,py+2,3,5);c.fillStyle='#b5b6ad';c.fillRect(px+6,py+9,5,1);}
    if(m.level===1&&m.carry!==null){c.fillStyle='#dac57c';c.fillRect(px+12,py+7,4,6);}
    if(m.level===4){const [sx,sy]=m.shadow;c.fillStyle='#080309';c.fillRect(sx*16+2,sy*16+2,12,14);c.fillStyle='#9c3c44';c.fillRect(sx*16+4,sy*16+5,2,1);c.fillRect(sx*16+10,sy*16+5,2,1);}
    if(m.level===5){const glow=c.createRadialGradient(px+8,py+8,20,px+8,py+8,95);glow.addColorStop(0,'#0000');glow.addColorStop(1,'#000e');c.fillStyle=glow;c.fillRect(0,0,320,192);}
    if(m.secretSeen&&!m.done){const img=this.images.get('daniel3.png');if(img){c.globalAlpha=.4;c.drawImage(img,261,75,29,54);c.globalAlpha=1;}}
    if(m.flash>0){const img=this.images.get(m.level%2?'daniel1.jpg':'daniel2.png');if(img){c.globalAlpha=.65;c.drawImage(img,96,10,128,172);c.globalAlpha=1;}}
    c.fillStyle='#00000030';for(let y=0;y<192;y+=3)c.fillRect(0,y,320,1);
    if(m.age<2.5){c.fillStyle='#05060bed';c.fillRect(0,0,320,192);c.fillStyle='#d6d2b7';c.font='18px monospace';c.textAlign='center';c.fillText('06:00',160,95);c.font='8px monospace';c.fillText('SIGNAL FRA EN ANNEN NATT',160,114);}
    if(m.reveal!==null){
      c.fillStyle='#000';c.fillRect(0,0,320,192);const img=this.images.get('daniel1.jpg');
      if(img&&m.reveal>1){c.globalAlpha=Math.min(1,(m.reveal-1)/2);c.drawImage(img,32,0,256,192);c.globalAlpha=1;}
      if(m.reveal>2){c.fillStyle='#e4d7ca';c.font='14px monospace';c.textAlign='center';c.fillText("you can't",160,173);}
      if(m.reveal>5.2){for(let i=0;i<14;i++){const y=Math.random()*192;c.fillStyle=Math.random()>.5?'#000':'#a9a49d55';c.fillRect(0,y,320,Math.random()*12+2);}if(Math.floor(m.reveal*18)%3===0){c.fillStyle='#000';c.fillRect(0,0,320,192);}}
    }
    this.ctx.imageSmoothingEnabled=false;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.surface,0,0,this.canvas.width,this.canvas.height);
  }
}
if(typeof module!=='undefined')module.exports={MemoryGame,MEMORY_STORIES};
