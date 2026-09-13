/* Five playable low-resolution memories. No night simulation runs here. */
const MEMORY_STORIES = [
  {title:'01 / DEN SISTE GJESTEN', task:'Finn de tre navnelappene.', items:['AKSEL','ALVAR','DANIEL'], lines:['Tre navn. Bare to vakter i loggen.','Den tredje kom aldri gjennom døren.','Hvis du ser ham: se bort.'], ending:'Det sto en stol igjen etter at alle hadde gått.'},
  {title:'02 / DEN SAMME SANGEN', task:'Samle de tre delene av melodien.', items:['C','E','G'], lines:['Alvar spilte for et tomt rom.','Noen svarte fra veggen.','De trakk opp boksen for å slippe å høre svaret.'], ending:'Musikken holdt ikke noen inne. Den holdt noe våkent.'},
  {title:'03 / INGEN PÅ OPPTAKET', task:'Hent de tre tapte opptakene.', items:['01','02','00'], lines:['Kamera 01: Aksel leter.','Kamera 02: ingen går ut.','Kamera 00 finnes ikke på kartet.'], ending:'På hvert opptak er det en person bak kameraet.'},
  {title:'04 / PLASSEN VED BORDET', task:'Finn det som ble lagt igjen.', items:['NØKKEL','BÅND','NAVN'], lines:['Nøkkelen passer ingen dør.','Båndet slutter før bankingen.','Daniel er skrevet på baksiden.'], ending:'De fjernet navnet fra listen. Ikke fra huset.'},
  {title:'05 / IKKE GLEM MEG', task:'Samle minnene. Gå tilbake til stolen.', items:['STOL','SANG','BILDE'], lines:['Aksel har lett etter den samme gjesten hver natt.','Alvar husker bare melodien.','Du husker ansiktet nå.'], ending:'Klokken er seks. Den tomme stolen er vendt mot deg.'},
  {title:'06 / DU KOM TILBAKE', task:'Finn sporene fra natten utenfor.', items:['BIL','LYD','DØR'], lines:['Motoren svarte aldri.','Sangen kom fra huset.','Døren hadde stått åpen hele tiden.'], ending:'Ingen ba deg komme tilbake. Likevel var stolen din varm.'}
];
class MemoryGame {
  constructor(level, random=Math.random) {
    this.level=Math.max(1,Math.min(6,level));this.story=MEMORY_STORIES[this.level-1];
    this.x=2;this.y=10;this.age=0;this.delay=0;this.message='06:00 / ET MINNE KOMMER TILBAKE';this.messageFor=2.5;
    this.collected=[];this.done=false;this.secret=random()<.18;this.secretSeen=false;this.flash=0;
    this.targets=[[[3,2],[10,5],[16,9]],[[3,8],[10,2],[16,6]],[[4,2],[12,8],[16,4]],[[3,5],[9,9],[16,2]],[[4,8],[10,2],[16,7]],[[3,2],[10,8],[16,5]]][this.level-1];this.exit=[17,2];
    this.map=Array.from({length:12},(_,y)=>Array.from({length:20},(_,x)=>x===0||y===0||x===19||y===11?'#':'.'));
    // Different partitions, with wide connecting passages on every floor.
    for(let y=2;y<=8;y++)if(y!==3&&y!==7)this.map[y][5+this.level%3]='#';
    for(let x=8;x<=17;x++)if(x!==11&&x!==15)this.map[3+this.level%5][x]='#';
    for(const [x,y] of [...this.targets,this.exit,[2,10]])this.map[y][x]='.';
  }
  move(dx,dy) {
    if(this.done||this.age<2.5||this.delay>0||Math.abs(dx)+Math.abs(dy)!==1)return;
    const nx=this.x+dx,ny=this.y+dy;
    if(this.map[ny]?.[nx]!=='#'&&this.map[ny]?.[nx]!==undefined){this.x=nx;this.y=ny;}
    this.delay=.13;
    this.targets.forEach(([x,y],i)=>{if(this.x===x&&this.y===y&&!this.collected.includes(i)){
      this.collected.push(i);this.message=this.story.lines[i];this.messageFor=4;this.note=i;
    }});
    if(this.secret&&!this.secretSeen&&this.x>=14&&this.y<=5){
      this.secretSeen=true;this.flash=1.2;this.message=['DU VAR HER FØR.','DET ER FIRE NAVN PÅ LISTEN.','IKKE SE PÅ KAMERA 00.','HAN KJENNER IGJEN DEG.','DETTE ER IKKE DET FØRSTE MINNET.','NØKKELEN LÅ ALLTID I LOMMEN DIN.'][this.level-1];this.messageFor=5;
    }
    if(this.x===this.exit[0]&&this.y===this.exit[1]){
      if(this.collected.length===3){this.done=true;this.message=this.story.ending;this.messageFor=99;}
      else {this.message='Noe mangler. '+this.collected.length+'/3';this.messageFor=2;}
    }
  }
  tick(dt){this.age+=dt;this.delay=Math.max(0,this.delay-dt);this.messageFor=Math.max(0,this.messageFor-dt);this.flash=Math.max(0,this.flash-dt);}
}
class MemoryView {
  constructor(canvas,images) {this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.surface=document.createElement('canvas');this.surface.width=320;this.surface.height=192;this.c=this.surface.getContext('2d');}
  draw(m) {
    const c=this.c;c.imageSmoothingEnabled=false;c.fillStyle='#080812';c.fillRect(0,0,320,192);
    for(let y=0;y<12;y++)for(let x=0;x<20;x++){
      const wall=m.map[y][x]==='#';c.fillStyle=wall?'#293041':(x+y)%2?'#10131e':'#151924';c.fillRect(x*16,y*16,16,16);
      if(wall){c.fillStyle='#41414d';c.fillRect(x*16,y*16,16,2);c.fillStyle='#151922';c.fillRect(x*16+7,y*16+3,1,13);}
    }
    // Empty party tables, extinguished candles, and an unoccupied chair.
    for(const [x,y] of [[3,5],[9,9],[15,5]]){c.fillStyle='#564331';c.fillRect(x*16,y*16,23,9);c.fillStyle='#95814b';c.fillRect(x*16+9,y*16-5,3,5);}
    const [ex,ey]=m.exit;c.fillStyle=m.collected.length===3?'#c4b36d':'#544e3e';c.fillRect(ex*16+2,ey*16+2,12,11);c.fillRect(ex*16+2,ey*16+12,3,4);c.fillRect(ex*16+11,ey*16+12,3,4);
    m.targets.forEach(([x,y],i)=>{if(!m.collected.includes(i)){c.fillStyle=Math.floor(m.age*3)%2?'#d4c889':'#95885b';c.fillRect(x*16+4,y*16+3,8,10);c.fillStyle='#463d3a';c.fillRect(x*16+6,y*16+6,4,1);}});
    // Pixel guard, rendered directly at 320x192 resolution.
    const px=m.x*16,py=m.y*16;c.fillStyle='#ae826b';c.fillRect(px+5,py+1,7,6);c.fillStyle='#708fa4';c.fillRect(px+3,py+7,11,6);c.fillStyle='#c8c7ba';c.fillRect(px+3,py+7,2,2);c.fillStyle='#090b12';c.fillRect(px+4,py+13,3,3);c.fillRect(px+10,py+13,3,3);
    if(m.secretSeen&&!m.done){const img=this.images.get('daniel3.png');if(img){c.globalAlpha=.4;c.drawImage(img,261,75,29,54);c.globalAlpha=1;}}
    if(m.flash>0){const img=this.images.get(m.level%2?'daniel1.jpg':'daniel2.png');if(img){c.globalAlpha=.65;c.drawImage(img,96,10,128,172);c.globalAlpha=1;}}
    c.fillStyle='#00000030';for(let y=0;y<192;y+=3)c.fillRect(0,y,320,1);
    if(m.age<2.5){c.fillStyle='#05060bed';c.fillRect(0,0,320,192);c.fillStyle='#d6d2b7';c.font='18px monospace';c.textAlign='center';c.fillText('06:00',160,95);c.font='8px monospace';c.fillText('SIGNAL FRA EN ANNEN NATT',160,114);}
    this.ctx.imageSmoothingEnabled=false;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.surface,0,0,this.canvas.width,this.canvas.height);
  }
}
if(typeof module!=='undefined')module.exports={MemoryGame,MEMORY_STORIES};
