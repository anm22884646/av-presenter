const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {initialScene,operateTimer}=require('../dist/shared/state');
const {SettingsStore,defaultPreferences}=require('../dist/main/settings');
function withRenderer(callback){
 class Node {
  constructor(){this.style={};this.children=[];this.classList={add(){}};this.clientWidth=1920;this.clientHeight=1080;this.currentTime=0;this.textWrites=0;this.plays=0;this.pauses=0;this.ended=false;this.text='';}
  append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
  remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}
  get textContent(){return this.text;}set textContent(value){this.text=value;this.textWrites++;}
  addEventListener(){}removeAttribute(){}load(){}pause(){this.pauses++;}play(){this.plays++;this.ended=false;return Promise.resolve();}
 }
 const original={document:global.document,ResizeObserver:global.ResizeObserver,setInterval:global.setInterval,Date:global.Date};
 let now=1700000000000;
 global.document={createElement:()=>new Node()};global.ResizeObserver=class{observe(){}};global.setInterval=()=>0;
 global.Date=class extends original.Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 try{const {Compositor}=require('../dist/renderer/compositor');callback(mode=>new Compositor(new Node(),mode),value=>{now=value;});}
 finally{Object.assign(global,original);}
}
function videoScene(){const scene=initialScene();scene.media.item={id:'video',type:'video',name:'test.mp4',url:'av-media://video/content.mp4'};scene.media.playing=true;return scene;}
test('Unchanged overlays do not rewrite text; clocks update only when displayed values change',()=>withRenderer((create,setNow)=>{
 const renderer=create('output'),scene=initialScene();scene.text.enabled=scene.clock.enabled=true;scene.clock.format='HH:mm:ss';renderer.update(scene);
 const text=renderer.overlays.text[0],clock=renderer.overlays.clock[0];const writes=[text.textWrites,clock.textWrites];
 for(let i=0;i<10;i++)renderer.tick();assert.deepEqual([text.textWrites,clock.textWrites],writes);
 setNow(1700000001000);renderer.tick();assert.equal(text.textWrites,writes[0]);assert.equal(clock.textWrites,writes[1]+1);
 scene.text.text='New message';renderer.update(scene);assert.equal(text.textContent,'New message');assert.equal(text.textWrites,writes[0]+1);
}));
test('Control low-load suspension preserves desired playback, timer, and position while Output continues',()=>withRenderer(create=>{
 const control=create('program'),output=create('output'),scene=videoScene();scene.countdown=operateTimer(scene.countdown,'start',1000);
 control.update(scene);output.update(scene);control.video.currentTime=42;
 assert.equal(control.video.preload,'metadata');assert.equal(output.video.preload,'auto');
 const plays=control.video.plays,outputPauses=output.video.pauses;
 control.setControlActivity(true,true);assert.equal(control.scene.media.playing,true);assert.equal(control.video.currentTime,42);assert.equal(control.playbackRequested,false);
 scene.text.text='Overlay edit';control.update(scene);assert.equal(control.video.plays,plays);assert.equal(control.scene.countdown.deadline,601000);
 output.setControlActivity(false,true);assert.equal(output.video.pauses,outputPauses);assert.equal(output.playbackRequested,true);
 control.setControlActivity(true,false);assert.equal(control.video.plays,plays+1);assert.equal(control.video.currentTime,42);
}));
test('Hidden controls stop playback and text updates; visibility restores current overlay and playback',()=>withRenderer((create,setNow)=>{
 const renderer=create('preview'),scene=videoScene();scene.clock.enabled=true;scene.clock.format='HH:mm:ss';renderer.update(scene);
 const clock=renderer.overlays.clock[0],writes=clock.textWrites;
 renderer.setControlActivity(false,false);const plays=renderer.video.plays;setNow(1700000005000);renderer.tick();assert.equal(clock.textWrites,writes);
 renderer.setControlActivity(true,false);assert.equal(clock.textWrites,writes+1);assert.equal(renderer.video.plays,plays+1);assert.equal(renderer.scene.media.playing,true);
}));
test('Overlay edits do not repeatedly request playback; explicit transport and ended videos still work',()=>withRenderer(create=>{
 const renderer=create('output'),scene=videoScene();renderer.update(scene);const plays=renderer.video.plays;
 scene.text.text='Changed';renderer.update(scene);renderer.update(scene);assert.equal(renderer.video.plays,plays);
 scene.media.playing=false;renderer.update(scene);scene.media.playing=true;renderer.update(scene);assert.equal(renderer.video.plays,plays+1);
 renderer.video.ended=true;renderer.update(scene);assert.equal(renderer.video.plays,plays+2);
}));
test('Performance preference migrates safely and survives saved settings',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'av-performance-'));const file=path.join(dir,'settings.json'),store=new SettingsStore(file);
 try{
  const preferences=defaultPreferences();delete preferences.reduceControlVideoLoad;
  store.save({version:1,preferences,session:null});assert.equal(store.load().preferences.reduceControlVideoLoad,false);
  preferences.reduceControlVideoLoad=true;store.save({version:1,preferences,session:null});assert.equal(new SettingsStore(file).load().preferences.reduceControlVideoLoad,true);
  preferences.reduceControlVideoLoad='true';store.save({version:1,preferences,session:null});assert.throws(()=>store.load());
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
