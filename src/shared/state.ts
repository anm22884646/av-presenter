import type { Scene, OverlayStyle, Countdown, TimerAction } from './types';
export function defaultStyle(x: number, y: number, fontSize: number): OverlayStyle {
 return {enabled:false,x,y,fontSize,fontFamily:'Segoe UI',fontWeight:600,color:'#ffffff',align:'center',backgroundEnabled:false,backgroundColor:'#000000',backgroundOpacity:0.6,padding:16};
}
export function initialScene(): Scene {
 return {media:{item:null,playing:true,loop:true,restartToken:0},clock:{...defaultStyle(90,10,48),align:'right',format:'HH:mm:ss'},
 countdown:{...defaultStyle(50,45,100),durationMs:600000,remainingMs:600000,running:false,deadline:null,revision:0},
 text:{...defaultStyle(50,78,64),text:'NEXT SESSION\n10:00 Opening Ceremony'}};
}
export function remaining(timer: Countdown, now = Date.now()): number {
 return timer.running && timer.deadline !== null ? Math.max(0,timer.deadline-now) : timer.remainingMs;
}
export function operateTimer(timer: Countdown, action: TimerAction, now = Date.now()): Countdown {
 const next = {...timer,remainingMs:remaining(timer,now),revision:timer.revision+1};
 if(action === 'start') {next.remainingMs=next.remainingMs || next.durationMs;next.running=true;next.deadline=now+next.remainingMs;}
 if(action === 'pause') {next.running=false;next.deadline=null;}
 if(action === 'reset') {next.remainingMs=next.durationMs;next.running=false;next.deadline=null;}
 return next;
}
export function takeScene(preview: Scene, program: Scene): Scene {
 const next = structuredClone(preview);
 if(next.countdown.revision === program.countdown.revision && next.countdown.durationMs === program.countdown.durationMs) {
  Object.assign(next.countdown,{remainingMs:program.countdown.remainingMs,running:program.countdown.running,deadline:program.countdown.deadline});
 }
 return next;
}
export function clearScene(program: Scene): Scene {
 const next=structuredClone(program);next.clock.enabled=next.countdown.enabled=next.text.enabled=false;return next;
}
export function parseDuration(value:string): number | null {
 if(!/^\d{1,3}:\d{2}(:\d{2})?$/.test(value)) return null;
 const parts=value.split(':').map(Number);
 if(parts.slice(1).some(n=>n>59)) return null;
 const seconds=parts.length===3 ? parts[0]*3600+parts[1]*60+parts[2] : parts[0]*60+parts[1];
 return seconds>0 && seconds<=359999 ? seconds*1000 : null;
}
export function formatDuration(ms: number): string {
 const total=Math.max(0,Math.ceil(ms/1000)),s=String(total%60).padStart(2,'0'),m=String(Math.floor(total/60)%60).padStart(2,'0');
 return total>=3600 ? `${String(Math.floor(total/3600)).padStart(2,'0')}:${m}:${s}` : `${m}:${s}`;
}
