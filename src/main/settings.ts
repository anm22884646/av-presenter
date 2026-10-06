import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import type { Scene, MediaItem, Preferences } from '../shared/types';
import { remaining } from '../shared/state';
export interface SavedDisplay { id:number; label:string; primary:boolean; width:number; height:number }
export interface SavedSession {
 preview:Scene; program:Scene; media:{item:MediaItem;path:string}[];
 display:SavedDisplay|null; outputActive:boolean;
}
export interface SettingsDocument { version:1; preferences:Preferences; session:SavedSession|null }
export const defaultPreferences=():Preferences=>({restoreOnLaunch:false,startAtLogin:false,language:'en'});
export function freezeScene(scene:Scene,now=Date.now()):Scene {
 const frozen=structuredClone(scene);frozen.countdown.remainingMs=remaining(scene.countdown,now);frozen.countdown.deadline=null;return frozen;
}
export function resumeScene(scene:Scene,now=Date.now()):Scene {
 const resumed=structuredClone(scene);
 resumed.countdown.running=resumed.countdown.running && resumed.countdown.remainingMs>0;
 resumed.countdown.deadline=resumed.countdown.running?now+resumed.countdown.remainingMs:null;
 return resumed;
}
export class SettingsStore {
 constructor(private file:string){}
 load():SettingsDocument {
  try {
   const document=JSON.parse(readFileSync(this.file,'utf8')) as SettingsDocument;
   if(document.version!==1 || typeof document.preferences?.restoreOnLaunch!=='boolean' || typeof document.preferences?.startAtLogin!=='boolean'
    || !['en','ja','zh-Hant','zh-Hans'].includes(document.preferences.language))throw new Error('Saved settings are invalid');
   return document;
  }catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {version:1,preferences:defaultPreferences(),session:null};throw error;}
 }
 save(document:SettingsDocument):void {
  mkdirSync(path.dirname(this.file),{recursive:true});
  const temporary=this.file+'.tmp';
  writeFileSync(temporary,JSON.stringify(document,null,2),{encoding:'utf8',flush:true});
  renameSync(temporary,this.file);
 }
}
export function matchDisplay(saved:SavedDisplay,displays:SavedDisplay[]):SavedDisplay|undefined {
 const exact=displays.find(d=>d.id===saved.id && d.primary===saved.primary);if(exact)return exact;
 // Never silently move a restored secondary output onto the primary operator screen.
 const matches=displays.filter(d=>d.label===saved.label && d.width===saved.width && d.height===saved.height && d.primary===saved.primary);
 return matches.length===1?matches[0]:undefined;
}
