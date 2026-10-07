import type { Scene, OverlayStyle } from '../shared/types';
import { initialScene, remaining, formatDuration } from '../shared/state';
export class Compositor {
 private scene=initialScene();
 private video=document.createElement('video');
 private image=document.createElement('img');
 private clock=document.createElement('div');
 private countdown=document.createElement('div');
 private text=document.createElement('div');
 private mediaId:string|null=null;
 private restartToken=-1;
 private surface=document.createElement('div');
 private resize:ResizeObserver;
 constructor(private host:HTMLElement,private mode:'preview'|'program'|'output') {
  host.classList.add('composition');this.surface.className='surface';host.append(this.surface);
  this.video.className='background';this.image.className='background';
  this.video.muted=mode!=='output';this.video.playsInline=true;this.video.preload='auto';
  this.surface.append(this.video,this.image,this.clock,this.countdown,this.text);
  for(const node of [this.clock,this.countdown,this.text])node.className='overlay';
  this.text.style.zIndex='3';this.clock.style.zIndex=this.countdown.style.zIndex='2';
  this.video.addEventListener('error',()=>this.mediaError());this.image.addEventListener('error',()=>this.mediaError());
  this.video.addEventListener('ended',()=>{if(this.mediaId && mode==='output')window.av.reportEnded(this.mediaId,this.scene.media.restartToken);});
  this.resize=new ResizeObserver(()=>this.layout());this.resize.observe(host);
  setInterval(()=>this.tick(),100);this.layout();this.update(this.scene);
 }
 private mediaError(){if(this.mediaId)window.av.reportMediaError(this.mediaId);}
 private layout(){
  const width=this.host.clientWidth,height=this.host.clientHeight;
  const scale=Math.min(width/1920,height/1080);
  this.surface.style.transform=`translate(-50%, -50%) scale(${scale})`;
 }
 update(scene:Scene) {
  this.scene=structuredClone(scene);
  const item=scene.media.item;
  if(item?.id!==this.mediaId) {
   this.video.pause();this.video.removeAttribute('src');this.video.load();this.image.removeAttribute('src');
   this.mediaId=item?.id??null;
   if(item?.type==='video')this.video.src=item.url;
   if(item?.type==='image')this.image.src=item.url;
   this.restartToken=-1;
  }
  this.video.hidden=item?.type!=='video';this.image.hidden=item?.type!=='image';
  this.video.loop=scene.media.loop;
  if(item?.type==='video') {
   if(this.restartToken!==scene.media.restartToken){this.video.currentTime=0;this.restartToken=scene.media.restartToken;}
   if(scene.media.playing){void this.video.play().catch(()=>{/* Media error event supplies the file/codec diagnosis. */});}else this.video.pause();
  }
  this.applyStyle(this.clock,scene.clock);this.applyStyle(this.countdown,scene.countdown);this.applyStyle(this.text,scene.text);
  this.text.textContent=scene.text.text;this.tick();
 }
 private applyStyle(node:HTMLElement,style:OverlayStyle) {
  node.hidden=!style.enabled;
  const offset=style.align==='left'?'0':style.align==='right'?'-100%':'-50%';
  Object.assign(node.style,{left:`${style.x}%`,top:`${style.y}%`,transform:`translate(${offset}, -50%)`,fontSize:`${style.fontSize}px`,
   fontFamily:style.fontFamily,fontWeight:String(style.fontWeight),color:style.color,textAlign:style.align,padding:`${style.padding}px`,
   background:style.backgroundEnabled?rgba(style.backgroundColor,style.backgroundOpacity):'transparent'});
 }
 private tick() {
  const now=new Date(),p=(n:number)=>String(n).padStart(2,'0');
  const hm=`${p(now.getHours())}:${p(now.getMinutes())}`;
  this.clock.textContent=this.scene.clock.format==='HH:mm:ss'?`${hm}:${p(now.getSeconds())}`:this.scene.clock.format==='YYYY/MM/DD HH:mm'?`${now.getFullYear()}/${p(now.getMonth()+1)}/${p(now.getDate())} ${hm}`:hm;
  this.countdown.textContent=formatDuration(remaining(this.scene.countdown));
 }
}
function rgba(hex:string,opacity:number){return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${opacity})`;}
