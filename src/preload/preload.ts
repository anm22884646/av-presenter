import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopAPI } from '../shared/types';
function subscribe<T>(channel:string,callback:(value:T)=>void) {
 const listener=(_event:unknown,value:T)=>callback(value);ipcRenderer.on(channel,listener);
 return ()=>ipcRenderer.removeListener(channel,listener);
}
const api:DesktopAPI={
 getStartupSettings:()=>ipcRenderer.invoke('settings:get'),updatePreferences:value=>ipcRenderer.invoke('settings:preferences',value),
 updatePreview:scene=>ipcRenderer.invoke('preview:update',scene),saveSettings:(scene,id)=>ipcRenderer.invoke('settings:save',scene,id),
 getDisplays:()=>ipcRenderer.invoke('displays:get'),getSnapshot:()=>ipcRenderer.invoke('state:get'),
 startOutput:id=>ipcRenderer.invoke('output:start',id),stopOutput:()=>ipcRenderer.invoke('output:stop'),
 addMedia:()=>ipcRenderer.invoke('media:add'),removeMedia:id=>ipcRenderer.invoke('media:remove',id),
 take:scene=>ipcRenderer.invoke('program:take',scene),clear:()=>ipcRenderer.invoke('program:clear'),
 playback:action=>ipcRenderer.invoke('program:playback',action),timer:action=>ipcRenderer.invoke('program:timer',action),
 reportMediaError:id=>ipcRenderer.send('media:error',id),reportEnded:(id,token)=>ipcRenderer.send('media:ended',id,token),
 onDisplays:cb=>subscribe('displays:changed',cb),onSnapshot:cb=>subscribe('state:changed',cb)
};
contextBridge.exposeInMainWorld('av',api);
