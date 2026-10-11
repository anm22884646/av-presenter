const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initialScene,copyOverlayStyle,takeScene,clearScene,operateTimer}=require('../dist/shared/state');
const {validateScene}=require('../dist/main/validation');
const {SettingsStore,freezeScene,resumeScene,defaultPreferences}=require('../dist/main/settings');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
test('Old scenes migrate; copied positions are bounded and validated',()=>{
 const legacy=initialScene();for(const key of ['text','clock','countdown'])delete legacy[key].copies;
 const scene=validateScene(legacy,[]);assert.deepEqual(scene.text.copies,[]);assert.equal(legacy.text.copies,undefined);
 scene.text.copies=Array.from({length:7},()=>copyOverlayStyle(scene.text));assert.doesNotThrow(()=>validateScene(scene,[]));
 scene.text.copies.push(copyOverlayStyle(scene.text));assert.throws(()=>validateScene(scene,[]));scene.text.copies.pop();
 scene.text.copies[0].fontSize=NaN;assert.throws(()=>validateScene(scene,[]));
 scene.text.copies=[];scene.clock.copies={};assert.throws(()=>validateScene(scene,[]));
});
test('TAKE isolates all positions and preserves shared running countdown; CLEAR hides each group',()=>{
 const program=initialScene();program.countdown=operateTimer(program.countdown,'start',1000);
 const preview=structuredClone(program);
 for(const key of ['text','clock','countdown']){preview[key].enabled=true;preview[key].copies.push(copyOverlayStyle(preview[key]));preview[key].copies[0].x=15;}
 preview.countdown.deadline=999999;
 const next=takeScene(preview,program);assert.equal(next.countdown.deadline,601000);
 preview.text.copies[0].x=85;assert.equal(next.text.copies[0].x,15);
 assert.equal('text' in next.text.copies[0],false);assert.equal('deadline' in next.countdown.copies[0],false);
 const cleared=clearScene(next);for(const key of ['text','clock','countdown']){assert.equal(cleared[key].enabled,false);assert.equal(cleared[key].copies.length,1);}
 assert.equal(cleared.countdown.deadline,601000);
});
test('Settings preserve separate Preview and Program placements across reopening and timer resume',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'av-positions-'));
 try{
  const preview=initialScene();for(const key of ['text','clock','countdown'])preview[key].copies.push(copyOverlayStyle(preview[key]));
  preview.countdown=operateTimer(preview.countdown,'start',1000);
  const program=structuredClone(preview);program.text.copies[0].x=90;preview.text.copies[0].x=10;
  const store=new SettingsStore(path.join(dir,'settings.json'));
  store.save({version:1,preferences:{...defaultPreferences(),restoreOnLaunch:true},session:{preview:freezeScene(preview,61000),program:freezeScene(program,61000),media:[],display:null,outputActive:true}});
  const restored=new SettingsStore(path.join(dir,'settings.json')).load().session;
  assert.equal(restored.preview.text.copies[0].x,10);assert.equal(restored.program.text.copies[0].x,90);
  const resumed=resumeScene(validateScene(restored.program,[]),90000000);assert.equal(resumed.countdown.deadline,90540000);assert.deepEqual(resumed.countdown.copies,preview.countdown.copies);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Compositor renders synchronized content with independent styles and removes surplus positions',()=>{
 class Node {
  constructor(){this.style={};this.children=[];this.classList={add(){}};this.clientWidth=1920;this.clientHeight=1080;}
  append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
  remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}
  addEventListener(){} removeAttribute(){} pause(){} load(){} play(){return Promise.resolve();}
 }
 const original={document:global.document,ResizeObserver:global.ResizeObserver,setInterval:global.setInterval};
 global.document={createElement:()=>new Node()};global.ResizeObserver=class{observe(){}};global.setInterval=()=>0;
 try{
  const {Compositor}=require('../dist/renderer/compositor');const renderer=new Compositor(new Node(),'preview');
  const scene=initialScene();scene.text.text='Next stage starts at 10:00';
  for(const key of ['text','clock','countdown']){scene[key].enabled=true;scene[key].copies.push(copyOverlayStyle(scene[key]));scene[key].copies[0].x=10;scene[key].copies[0].fontSize=30;}
  renderer.update(scene);
  for(const key of ['text','clock','countdown']){
   const nodes=renderer.overlays[key];assert.equal(nodes.length,2);assert.equal(nodes[0].textContent,nodes[1].textContent);
   assert.equal(nodes[1].style.left,'10%');assert.equal(nodes[1].style.fontSize,'30px');assert.equal(nodes[1].hidden,false);
  }
  assert.equal(renderer.overlays.text[1].textContent,scene.text.text);
  renderer.update(clearScene(scene));for(const nodes of Object.values(renderer.overlays))for(const node of nodes)assert.equal(node.hidden,true);
  scene.text.text='Updated';scene.text.copies=[];renderer.update(scene);assert.equal(renderer.overlays.text.length,1);assert.equal(renderer.overlays.text[0].textContent,'Updated');
 }finally{Object.assign(global,original);}
});
