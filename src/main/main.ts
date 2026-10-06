import { app, BrowserWindow, ipcMain, screen, dialog, protocol, net, powerSaveBlocker } from 'electron';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { access } from 'node:fs/promises';
import { SettingsStore, defaultPreferences, freezeScene, resumeScene, matchDisplay, type SettingsDocument, type SavedDisplay } from './settings';
import { pathToFileURL } from 'node:url';
import type { DisplayInfo, OutputStatus, Snapshot, MediaItem, PlaybackAction, TimerAction, Preferences, StartupSettings } from '../shared/types';
import { initialScene, takeScene, clearScene, operateTimer } from '../shared/state';
import { validateScene } from './validation';
if(!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance',()=>{if(control){if(control.isMinimized())control.restore();control.focus();}});
protocol.registerSchemesAsPrivileged([{scheme:'av-media',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let control:BrowserWindow|null=null,output:BrowserWindow|null=null;
let status:OutputStatus={open:false,message:'Output closed'};
let program=initialScene(),error:string|null=null;
const library=new Map<string,{item:MediaItem;path:string}>();
let powerBlock:number|undefined;
let preview=initialScene(),preferences=defaultPreferences(),store:SettingsStore;
let savedDocument:SettingsDocument={version:1,preferences,session:null};
let savedAt:string|null=null,selectedDisplay:SavedDisplay|null=null,wantsOutput=false,quitting=false,closingForDisconnect=false;
let persistTimer:ReturnType<typeof setTimeout>|undefined;
const startup=():StartupSettings=>({preferences,preview,selectedDisplayId:selectedDisplay?.id,savedAt,loginSupported:process.platform==='win32' && app.isPackaged});
function saveSettings(includeSession:boolean){
 const next:SettingsDocument={version:1,preferences:{...preferences},session:includeSession?{
  preview:freezeScene(preview),program:freezeScene(program),media:[...library.values()],display:selectedDisplay,outputActive:wantsOutput
 }:savedDocument.session};
 store.save(next);savedDocument=next;savedAt=new Date().toISOString();
}
function scheduleSave(){
 if(!preferences.restoreOnLaunch || quitting)return;
 clearTimeout(persistTimer);persistTimer=setTimeout(()=>{
  try{saveSettings(true);}catch(e){error=`Could not save settings: ${e instanceof Error?e.message:String(e)}`;broadcast(false);}
 },300);
}
function restoreSession(){
 const session=savedDocument.session;if(!session)return;
 if(!Array.isArray(session.media) || session.media.length>10000)throw new Error('Saved settings are invalid');
 const restored=new Map<string,{item:MediaItem;path:string}>();
 for(const entry of session.media){
  if(typeof entry.path!=='string' || !path.isAbsolute(entry.path) || !/^[a-z0-9-]+$/i.test(entry.item?.id))throw new Error('Saved settings are invalid');
  const ext=path.extname(entry.path).toLowerCase();if(!['.mp4','.webm','.jpg','.jpeg','.png'].includes(ext))throw new Error('Saved settings are invalid');
  const item:MediaItem={id:entry.item.id,name:path.basename(entry.path),url:`av-media://${entry.item.id}/content${ext}`,type:['.mp4','.webm'].includes(ext)?'video':'image'};
  restored.set(item.id,{item,path:entry.path});
 }
 const items=[...restored.values()].map(v=>v.item);
 const restoredPreview=resumeScene(validateScene(session.preview,items)),restoredProgram=resumeScene(validateScene(session.program,items));
 if(typeof session.outputActive!=='boolean')throw new Error('Saved settings are invalid');
 if(session.display && (!Number.isSafeInteger(session.display.id) || typeof session.display.label!=='string' || typeof session.display.primary!=='boolean'))throw new Error('Saved settings are invalid');
 library.clear();for(const [id,entry] of restored)library.set(id,entry);
 preview=restoredPreview;program=restoredProgram;selectedDisplay=session.display;wantsOutput=session.outputActive;
}
function tryRestoreOutput(){
 if(!wantsOutput || output || !selectedDisplay || quitting)return;
 const target=matchDisplay(selectedDisplay,displays());
 if(target){positionOutput(target.id);}
 else {status={open:false,message:'Saved output display is unavailable — waiting for reconnection'};broadcast();}
}
const media=()=>[...library.values()].map(v=>v.item);
const snapshot=():Snapshot=>({program,media:media(),output:status,error});
const broadcast=(persist=true)=>{if(persist)scheduleSave();for(const w of [control,output]) if(w && !w.isDestroyed()) w.webContents.send('state:changed',snapshot());};
const displays=():DisplayInfo[]=>screen.getAllDisplays().map((d,i)=>({id:d.id,label:d.label||`Display ${i+1}`,width:d.size.width,height:d.size.height,primary:d.id===screen.getPrimaryDisplay().id}));
function createWindow(kind:'control'|'output') {
 const win=new BrowserWindow({width:1200,height:800,backgroundColor:'#000000',show:false,frame:kind==='control',autoHideMenuBar:true,
  webPreferences:{preload:path.join(__dirname,'../preload/preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 win.setMenu(null);
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',e=>e.preventDefault());
 win.webContents.session.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));
 win.webContents.on('render-process-gone',()=>{error=`${kind} renderer stopped. ${kind==='output'?'Restart output.':'Restart the application.'}`;if(kind==='output')win.close();broadcast();});
 win.webContents.on('did-fail-load',(_event,code,description)=>{error=`${kind} failed to load (${code}): ${description}`;broadcast();});
 void win.loadFile(path.join(__dirname,`../renderer/${kind}/index.html`));
 return win;
}
function positionOutput(id:number) {
 const display=screen.getAllDisplays().find(d=>d.id===id);
 if(!display) throw new Error('Selected display is no longer connected');
 selectedDisplay=displays().find(d=>d.id===id)!;wantsOutput=true;
 if(!output) {
  output=createWindow('output');
  output.on('closed',()=>{output=null;if(!quitting && !closingForDisconnect)wantsOutput=false;closingForDisconnect=false;status={open:false,message:'Output closed'};if(powerBlock!==undefined){powerSaveBlocker.stop(powerBlock);powerBlock=undefined;}broadcast();});
  output.webContents.once('did-finish-load',()=>broadcast());
 }
 output.setFullScreen(false);
 const single=screen.getAllDisplays().length===1;
 if(single) {
  const b=display.workArea;
  output.setBounds({x:b.x+20,y:b.y+20,width:Math.max(200,Math.min(960,b.width-40)),height:Math.max(150,Math.min(540,b.height-40))});
  output.setAlwaysOnTop(false);
 } else {output.setBounds(display.bounds);output.setAlwaysOnTop(true,'screen-saver');output.setFullScreen(true);}
 output.show();
 status={open:true,displayId:id,message:single?'Open — single-display window mode':'Connected — fullscreen'};
 if(powerBlock===undefined)powerBlock=powerSaveBlocker.start('prevent-display-sleep');
 broadcast();return status;
}
app.whenReady().then(()=>{
 store=new SettingsStore(path.join(app.getPath('userData'),'settings.json'));
 try{savedDocument=store.load();preferences=savedDocument.preferences;if(preferences.restoreOnLaunch)restoreSession();}
 catch(e){preferences={...preferences,restoreOnLaunch:false};error=`Could not restore settings: ${e instanceof Error?e.message:String(e)}`;}
 if(process.platform==='win32' && app.isPackaged)preferences.startAtLogin=app.getLoginItemSettings().openAtLogin;
 protocol.handle('av-media',async request=>{
  const url=new URL(request.url),entry=library.get(url.hostname);
  if(!entry)return new Response('Unknown media',{status:404});
  try {await access(entry.path);return await net.fetch(pathToFileURL(entry.path).href,{headers:request.headers});}
  catch {error=`Missing or unreadable file: ${entry.item.name}`;broadcast();return new Response('Media unavailable',{status:404});}
 });
 control=createWindow('control');
 const b=screen.getPrimaryDisplay().workArea;
 control.setBounds({x:b.x,y:b.y,width:Math.min(1440,b.width),height:Math.min(960,b.height)});
 control.once('ready-to-show',()=>control?.show());
 control.on('close',()=>{quitting=true;clearTimeout(persistTimer);if(preferences.restoreOnLaunch)try{saveSettings(true);}catch(e){console.error('Could not save settings on exit:',e);}});
 control.on('closed',()=>app.quit());
 const handle=(channel:string,fn:(...args:any[])=>unknown,operatorOnly=true)=>ipcMain.handle(channel,async(event,...args)=>{
  if(operatorOnly ? event.sender!==control?.webContents : ![control?.webContents,output?.webContents].includes(event.sender))throw new Error('Unauthorized window');
  try {return await fn(...args);} catch(e){error=e instanceof Error?e.message:String(e);broadcast();throw e;}
 });
 handle('settings:get',startup);
 handle('preview:update',(value:unknown)=>{preview=validateScene(value,media());scheduleSave();});
 handle('settings:save',(value:unknown,id:number)=>{
  preview=validateScene(value,media());const selected=displays().find(d=>d.id===id);
  if(!selected)throw new Error('Selected display is no longer connected');selectedDisplay=selected;
  clearTimeout(persistTimer);saveSettings(true);return startup();
 });
 handle('settings:preferences',(value:Preferences)=>{
  if(!value || typeof value.restoreOnLaunch!=='boolean' || typeof value.startAtLogin!=='boolean' || !['en','ja','zh-Hant','zh-Hans'].includes(value.language))throw new Error('Invalid preferences');
  if(value.startAtLogin!==preferences.startAtLogin){
   if(process.platform!=='win32' || !app.isPackaged)throw new Error('Windows login startup requires a packaged Windows application');
   app.setLoginItemSettings({openAtLogin:value.startAtLogin,path:process.execPath});
   if(app.getLoginItemSettings().openAtLogin!==value.startAtLogin)throw new Error('Could not update Windows login startup');
  }
  preferences={...value};clearTimeout(persistTimer);saveSettings(preferences.restoreOnLaunch);return startup();
 });
 handle('displays:get',displays,false);handle('state:get',snapshot,false);
 handle('output:start',(id:number)=>positionOutput(id));handle('output:stop',()=>{wantsOutput=false;output?.close();scheduleSave();});
 handle('media:add',async()=>{
  const result=await dialog.showOpenDialog(control!,{properties:['openFile','multiSelections'],filters:[{name:'Media',extensions:['mp4','webm','jpg','jpeg','png']}]});
  if(result.canceled)return [];
  const added:MediaItem[]=[];
  for(const file of result.filePaths){
   const ext=path.extname(file).toLowerCase();
   if(!['.mp4','.webm','.jpg','.jpeg','.png'].includes(ext)){error=`Unsupported media: ${path.basename(file)}`;continue;}
   await access(file);
   const existing=[...library.values()].find(v=>v.path===file);if(existing){added.push(existing.item);continue;}
   const id=randomUUID(),item:MediaItem={id,name:path.basename(file),url:`av-media://${id}/content${ext}`,type:['.mp4','.webm'].includes(ext)?'video':'image'};
   library.set(id,{item,path:file});added.push(item);
  }
  broadcast();return added;
 });
 handle('media:remove',(id:string)=>{
  if(program.media.item?.id===id)throw new Error('This media is on Program. TAKE another media or a black background before removing it.');
  library.delete(id);broadcast();
 });
 handle('program:take',async(value:unknown)=>{
  const next=validateScene(value,media());
  if(next.media.item)await access(library.get(next.media.item.id)!.path);
  program=takeScene(next,program);error=null;broadcast();
 });
 handle('program:clear',()=>{program=clearScene(program);broadcast();});
 handle('program:playback',(action:PlaybackAction)=>{
  if(!['play','pause','restart','loop'].includes(action))throw new Error('Invalid playback action');
  if(action==='play')program.media.playing=true;
  if(action==='pause')program.media.playing=false;
  if(action==='restart'){program.media.restartToken++;program.media.playing=true;}
  if(action==='loop')program.media.loop=!program.media.loop;
  broadcast();
 });
 handle('program:timer',(action:TimerAction)=>{
  if(!['start','pause','reset'].includes(action))throw new Error('Invalid timer action');
  program.countdown=operateTimer(program.countdown,action);broadcast();
 });
 ipcMain.on('media:error',(event,id:string)=>{
  if(![control?.webContents,output?.webContents].includes(event.sender))return;
  const item=library.get(id)?.item;if(item){error=`Cannot load ${item.name}. Check that the file exists and its codec is supported.`;broadcast();}
 });
 ipcMain.on('media:ended',(event,id:string,token:number)=>{
  if(event.sender===output?.webContents && program.media.item?.id===id && program.media.restartToken===token && !program.media.loop){program.media.playing=false;broadcast();}
 });
 const changed=()=>{
  control?.webContents.send('displays:changed',displays());
  if(output && !screen.getAllDisplays().some(d=>d.id===status.displayId)) {
   const reconnect=preferences.restoreOnLaunch && wantsOutput;closingForDisconnect=reconnect;output.close();wantsOutput=reconnect;status={open:false,message:'Display disconnected — select a display and start output'};broadcast();
  } else if(output && status.displayId!==undefined)positionOutput(status.displayId);
  if(preferences.restoreOnLaunch)tryRestoreOutput();
 };
 tryRestoreOutput();
 screen.on('display-added',changed);screen.on('display-removed',changed);screen.on('display-metrics-changed',changed);
});
app.on('before-quit',()=>{if(quitting)return;quitting=true;clearTimeout(persistTimer);if(store && preferences.restoreOnLaunch)try{saveSettings(true);}catch(e){console.error('Could not save settings on exit:',e);}});
app.on('window-all-closed',()=>app.quit());
