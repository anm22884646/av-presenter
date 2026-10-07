import type { DisplayInfo, Snapshot, Scene, OverlayStyle, TimerAction, PlaybackAction, MediaItem, Preferences, StartupSettings } from '../../shared/types';
import { initialScene, operateTimer, parseDuration, remaining, formatDuration } from '../../shared/state';
import { Compositor } from '../compositor';
import { loadLanguage, getLanguage, setLanguage, t, translateInterface, translateMessage } from './i18n';
loadLanguage();
document.body.inert=true;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
let preview=initialScene(),snapshot:Snapshot={program:initialScene(),media:[],output:{open:false,message:'Output closed'},error:null};
const previewRenderer=new Compositor(el('preview'),'preview'),programRenderer=new Compositor(el('program'),'program');
let lastError:string|null=null, durationInvalid=false, currentDisplays:DisplayInfo[]=[],settingsReady=false;
let preferences:Preferences={restoreOnLaunch:false,startAtLogin:false,language:getLanguage()};
let saveStatusKey='';
const run=(task:Promise<unknown>)=>task.catch(e=>{lastError=String(e);el('error').textContent=translateMessage(lastError);});
const refresh=()=>{previewRenderer.update(preview);renderMedia();if(settingsReady)run(window.av.updatePreview(structuredClone(preview)));};
function renderDisplays(items:DisplayInfo[]) {
 currentDisplays=items;
 const select=el<HTMLSelectElement>('displays'),previous=Number(select.value);
 select.replaceChildren(...items.map(d=>{const option=document.createElement('option');option.value=String(d.id);option.textContent=`${/^Display \d+$/.test(d.label)?t('Display {number}',{number:d.label.slice(8)}):d.label} — ${d.width} × ${d.height}${d.primary?` (${t('Primary')})`:''}`;return option;}));
 select.value=String(items.find(d=>d.id===previous)?.id??items.find(d=>!d.primary)?.id??items[0]?.id);
 el('display-note').textContent=items.length===1?t('No secondary display — output will open in a window.'):'';
}
function cueMedia(item:MediaItem){
 preview.media.item=item;preview.media.playing=false;
 // Re-selecting the current item must also return Preview to its first frame.
 preview.media.restartToken++;refresh();
}
function renderMedia() {
 el('media-list').replaceChildren(...snapshot.media.map(item=>{
  const li=document.createElement('li'),select=document.createElement('button'),remove=document.createElement('button');
  select.className=`media-choice${preview.media.item?.id===item.id?' selected':''}`;select.textContent=item.name;select.title=item.name;
  select.onclick=()=>cueMedia(item);
  remove.textContent='×';remove.setAttribute('aria-label',t('Remove {name}',{name:item.name}));remove.disabled=snapshot.program.media.item?.id===item.id;
  remove.onclick=()=>{run(window.av.removeMedia(item.id).then(()=>{if(preview.media.item?.id===item.id){preview.media.item=null;refresh();}}));};
  li.append(select,remove);return li;
 }));
}
function receive(next:Snapshot) {
 // Only explicit Program timer operations synchronize timing back to the cue editor.
 // Style/text edits and media remain independent.
 if(next.program.countdown.revision!==snapshot.program.countdown.revision && preview.countdown.revision===snapshot.program.countdown.revision) {
  const timer=next.program.countdown;Object.assign(preview.countdown,{remainingMs:timer.remainingMs,running:timer.running,deadline:timer.deadline,revision:timer.revision});
  previewRenderer.update(preview);
  if(settingsReady)run(window.av.updatePreview(structuredClone(preview)));
 }
 snapshot=next;programRenderer.update(snapshot.program);renderMedia();
 lastError=snapshot.error;renderLocalizedStatus();
}
for(const key of ['text','clock','countdown'] as const) {
 const checkbox=el<HTMLInputElement>(`${key}-enabled`);checkbox.checked=preview[key].enabled;
 checkbox.onchange=()=>{preview[key].enabled=checkbox.checked;refresh();};
 buildStyleEditor(key);
}
el<HTMLTextAreaElement>('text-content').value=preview.text.text;
el<HTMLTextAreaElement>('text-content').oninput=()=>{preview.text.text=el<HTMLTextAreaElement>('text-content').value;refresh();};
el<HTMLSelectElement>('clock-format').value=preview.clock.format;
el<HTMLSelectElement>('clock-format').onchange=()=>{preview.clock.format=el<HTMLSelectElement>('clock-format').value as Scene['clock']['format'];refresh();};
el('add').onclick=()=>run(window.av.addMedia().then(items=>{if(items[0])cueMedia(items[0]);}));
el('black').onclick=()=>{preview.media.item=null;refresh();};
el('take').onclick=()=>run(window.av.take(structuredClone(preview)));
el('clear').onclick=()=>run(window.av.clear());
el('start').onclick=()=>run(window.av.startOutput(Number(el<HTMLSelectElement>('displays').value)));
el('stop').onclick=()=>run(window.av.stopOutput());
el('program-loop').onclick=()=>run(window.av.playback('loop'));
el<HTMLInputElement>('preview-loop').onchange=()=>{preview.media.loop=el<HTMLInputElement>('preview-loop').checked;refresh();};
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-preview-play]'))b.onclick=()=>{
 const action=b.dataset.previewPlay;
 if(action==='restart'){preview.media.restartToken++;preview.media.playing=true;}else preview.media.playing=action==='play';refresh();
};
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-program-play]'))b.onclick=()=>run(window.av.playback(b.dataset.programPlay as PlaybackAction).then(()=>{
 // Mirror transport when the same media is cued, so a later overlay TAKE does not undo a pause.
 if(preview.media.item?.id===snapshot.program.media.item?.id)Object.assign(preview.media,{playing:snapshot.program.media.playing,restartToken:snapshot.program.media.restartToken});refresh();
}));
el('set-duration').onclick=()=>{
 const ms=parseDuration(el<HTMLInputElement>('duration').value.trim());
 if(ms===null){durationInvalid=true;el('duration-error').textContent=t('Enter a valid duration, e.g. 10:00 or 01:30:00.');return;}
 durationInvalid=false;el('duration-error').textContent='';preview.countdown.durationMs=ms;preview.countdown=operateTimer(preview.countdown,'reset');refresh();
};
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-preview-timer]'))b.onclick=()=>{preview.countdown=operateTimer(preview.countdown,b.dataset.previewTimer as TimerAction);refresh();};
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-program-timer]'))b.onclick=()=>run(window.av.timer(b.dataset.programTimer as TimerAction));
function renderTimerStatus(){el('timer-status').textContent=`${formatDuration(remaining(snapshot.program.countdown))} · ${t(snapshot.program.countdown.running && remaining(snapshot.program.countdown)>0?'Running':'Paused / complete')}`;}
setInterval(renderTimerStatus,100);
function renderLocalizedStatus(){
 el('status').textContent=translateMessage(snapshot.output.message);
 el('error').textContent=lastError?translateMessage(lastError):'';
 el('program-media').textContent=snapshot.program.media.item?.name??t('Black background');
 el('program-loop').textContent=t(snapshot.program.media.loop?'Loop ON':'Loop OFF');
 el('duration-error').textContent=durationInvalid?t('Enter a valid duration, e.g. 10:00 or 01:30:00.'):'';
 el('save-status').textContent=saveStatusKey?t(saveStatusKey):'';
 renderTimerStatus();
}
const languageSelect=el<HTMLSelectElement>('language');languageSelect.value=getLanguage();
languageSelect.onchange=()=>{
 setLanguage(languageSelect.value);translateInterface(document.body);
 languageSelect.setAttribute('aria-label',t('Language'));
 renderDisplays(currentDisplays);renderMedia();renderLocalizedStatus();
 if(settingsReady)run(window.av.updatePreferences({...preferences,language:getLanguage()}).then(applySettings));
};
function buildStyleEditor(key:'text'|'clock'|'countdown') {
 const host=el(`${key}-style`),grid=document.createElement('div');grid.className='style-grid';
 const definitions:[keyof OverlayStyle,string,string,number?,number?,number?][]=[
  ['x','X (%)','number',0,100,1],['y','Y (%)','number',0,100,1],['fontSize','Font size (at 1080p)','number',8,300,1],['fontFamily','Font family','text'],
  ['fontWeight','Weight','weight'],['align','Alignment','align'],['color','Text color','color'],['padding','Padding','number',0,100,1],
  ['backgroundEnabled','Background','checkbox'],['backgroundColor','Background color','color'],['backgroundOpacity','Background opacity','number',0,1,0.05]
 ];
 for(const [property,title,type,min,max,step] of definitions) {
  const label=document.createElement('label');label.textContent=title;
  let input:HTMLInputElement|HTMLSelectElement;
  if(type==='align'||type==='weight') {
   input=document.createElement('select');const choices=type==='align'?['left','center','right']:['400','600','700'];
   input.replaceChildren(...choices.map(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;return o;}));
  }else{input=document.createElement('input');input.type=type;if(min!==undefined)input.min=String(min);if(max!==undefined)input.max=String(max);if(step!==undefined)input.step=String(step);}
  input.id=`${key}-${property}`;const value=preview[key][property];
  if(input instanceof HTMLInputElement && type==='checkbox')input.checked=Boolean(value);else input.value=String(value);
  input.addEventListener('input',()=>{
   if(input instanceof HTMLInputElement && !input.checkValidity())return;
   const next=type==='checkbox'?(input as HTMLInputElement).checked:type==='number'||type==='weight'?Number(input.value):input.value;
   (preview[key] as unknown as Record<string,unknown>)[property]=next;refresh();
  });
  label.append(input);grid.append(label);
 }
 const presets=document.createElement('div');presets.className='presets';
 for(const [title,x,y,align] of [['Top left',5,10,'left'],['Top center',50,10,'center'],['Top right',95,10,'right'],['Center',50,50,'center'],['Bottom left',5,90,'left'],['Bottom center',50,90,'center'],['Bottom right',95,90,'right']] as const) {
  const b=document.createElement('button');b.textContent=title;b.onclick=()=>{Object.assign(preview[key],{x,y,align});el<HTMLInputElement>(`${key}-x`).value=String(x);el<HTMLInputElement>(`${key}-y`).value=String(y);el<HTMLSelectElement>(`${key}-align`).value=align;refresh();};presets.append(b);
 }
 host.append(presets,grid);
}
window.av.onDisplays(renderDisplays);window.av.onSnapshot(receive);
async function initialize(){
 try{
  const initial=await window.av.getStartupSettings();
  preview=structuredClone(initial.preview);applySettings(initial);syncEditor();
  renderDisplays(await window.av.getDisplays());
  if(initial.selectedDisplayId!==undefined && currentDisplays.some(d=>d.id===initial.selectedDisplayId))el<HTMLSelectElement>('displays').value=String(initial.selectedDisplayId);
  receive(await window.av.getSnapshot());settingsReady=true;refresh();
 }catch(e){lastError=String(e);renderLocalizedStatus();}
 finally{document.body.inert=false;}
}
function applySettings(value:StartupSettings){
 preferences=value.preferences;setLanguage(preferences.language);languageSelect.value=getLanguage();translateInterface(document.body);
 languageSelect.setAttribute('aria-label',t('Language'));
 el<HTMLInputElement>('restore-on-launch').checked=preferences.restoreOnLaunch;
 el<HTMLInputElement>('start-at-login').checked=preferences.startAtLogin;
 el<HTMLInputElement>('start-at-login').disabled=!value.loginSupported;
 renderDisplays(currentDisplays);renderMedia();renderLocalizedStatus();
}
function syncEditor(){
 for(const key of ['text','clock','countdown'] as const){
  el<HTMLInputElement>(`${key}-enabled`).checked=preview[key].enabled;
  for(const [property,value] of Object.entries(preview[key])){
   const input=document.getElementById(`${key}-${property}`);
   if(input instanceof HTMLInputElement){if(input.type==='checkbox')input.checked=Boolean(value);else input.value=String(value);}
   else if(input instanceof HTMLSelectElement)input.value=String(value);
  }
 }
 el<HTMLTextAreaElement>('text-content').value=preview.text.text;
 el<HTMLSelectElement>('clock-format').value=preview.clock.format;
 el<HTMLInputElement>('preview-loop').checked=preview.media.loop;
 el<HTMLInputElement>('duration').value=formatDuration(preview.countdown.durationMs);
}
el('save-settings').onclick=()=>run(window.av.saveSettings(structuredClone(preview),Number(el<HTMLSelectElement>('displays').value)).then(value=>{
 saveStatusKey='Settings saved';applySettings(value);
}));
for(const id of ['restore-on-launch','start-at-login']){
 el<HTMLInputElement>(id).onchange=()=>{
  const next={...preferences,restoreOnLaunch:el<HTMLInputElement>('restore-on-launch').checked,startAtLogin:el<HTMLInputElement>('start-at-login').checked};
  run(window.av.updatePreview(structuredClone(preview)).then(()=>window.av.updatePreferences(next)).then(value=>{
   saveStatusKey='Settings saved';applySettings(value);
  }).catch(error=>{el<HTMLInputElement>(id).checked=id==='restore-on-launch'?preferences.restoreOnLaunch:preferences.startAtLogin;throw error;}));
 };
}
void initialize();refresh();
translateInterface(document.body);languageSelect.setAttribute('aria-label',t('Language'));renderLocalizedStatus();
