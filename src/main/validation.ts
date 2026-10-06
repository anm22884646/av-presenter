import type { Scene, MediaItem, OverlayStyle } from '../shared/types';
function number(v:unknown,min:number,max:number): v is number {return typeof v==='number' && Number.isFinite(v) && v>=min && v<=max;}
function style(v:OverlayStyle): boolean {
 return v && typeof v.enabled==='boolean' && number(v.x,0,100) && number(v.y,0,100) && number(v.fontSize,8,300)
 && typeof v.fontFamily==='string' && v.fontFamily.length<100 && number(v.fontWeight,100,900)
 && /^#[0-9a-f]{6}$/i.test(v.color) && ['left','center','right'].includes(v.align)
 && typeof v.backgroundEnabled==='boolean' && /^#[0-9a-f]{6}$/i.test(v.backgroundColor)
 && number(v.backgroundOpacity,0,1) && number(v.padding,0,100);
}
export function validateScene(value:unknown,media:MediaItem[]): Scene {
 const v=value as Scene;
 if(!v || !v.media || !style(v.clock) || !style(v.countdown) || !style(v.text)
 || !['HH:mm','HH:mm:ss','YYYY/MM/DD HH:mm'].includes(v.clock.format)
 || typeof v.text.text!=='string' || v.text.text.length>10000
 || !number(v.countdown.durationMs,1000,359999000) || !number(v.countdown.remainingMs,0,359999000)
 || typeof v.countdown.running!=='boolean' || !(v.countdown.deadline===null || number(v.countdown.deadline,0,Number.MAX_SAFE_INTEGER))
 || !Number.isSafeInteger(v.countdown.revision) || v.countdown.revision<0
 || typeof v.media.playing!=='boolean' || typeof v.media.loop!=='boolean'
 || !Number.isSafeInteger(v.media.restartToken) || v.media.restartToken<0) throw new Error('Invalid preview state');
 const next=structuredClone(v);
 if(next.media.item) {
  const item=media.find(m=>m.id===next.media.item?.id);
  if(!item) throw new Error('Selected media is no longer in the library');
  next.media.item=item;
 }
 return next;
}
