const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {SettingsStore,defaultPreferences,freezeScene,resumeScene,matchDisplay}=require('../dist/main/settings');
const {initialScene,operateTimer,remaining}=require('../dist/shared/state');
test('Saved settings survive reopening and overwrite atomically without stale temp files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'av-settings-'));const file=path.join(dir,'nested','settings.json');
 try{
  const store=new SettingsStore(file);assert.equal(store.load().session,null);
  const scene=initialScene();scene.text.fontSize=96;scene.text.x=12;scene.text.text='展覽\n展示会';scene.clock.enabled=true;
  const document={version:1,preferences:{...defaultPreferences(),restoreOnLaunch:true,language:'ja'},session:{preview:scene,program:scene,media:[],display:null,outputActive:false}};
  store.save(document);assert.deepEqual(new SettingsStore(file).load(),document);
  document.session.preview.text.x=80;store.save(document);assert.equal(store.load().session.preview.text.x,80);assert.equal(fs.existsSync(file+'.tmp'),false);
  fs.writeFileSync(file,'invalid');assert.throws(()=>store.load());assert.equal(fs.readFileSync(file,'utf8'),'invalid');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Countdown preserves saved remaining time across a long power-off interval',()=>{
 const scene=initialScene();scene.countdown=operateTimer(scene.countdown,'start',1000);
 const frozen=freezeScene(scene,61000);assert.equal(frozen.countdown.remainingMs,540000);assert.equal(frozen.countdown.deadline,null);
 const reopened=resumeScene(frozen,90000000);assert.equal(remaining(reopened.countdown,90001000),539000);
 assert.equal(scene.countdown.deadline,601000);
 const finished=freezeScene(scene,999999);assert.equal(resumeScene(finished).countdown.running,false);
});
test('Display restore matches a secondary monitor and never silently uses primary',()=>{
 const saved={id:2,label:'Exhibition',primary:false,width:1920,height:1080};
 assert.equal(matchDisplay(saved,[{...saved,id:3}]).id,3);
 assert.equal(matchDisplay(saved,[{...saved,primary:true}]),undefined);
 assert.equal(matchDisplay(saved,[{...saved,id:3},{...saved,id:4}]),undefined);
});
