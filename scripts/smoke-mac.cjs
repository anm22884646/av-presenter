// Run on macOS CI against the packaged app, not against the development Electron binary.
const { _electron }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
(async()=>{
 if(process.platform!=='darwin')throw new Error('This smoke test requires macOS');
 const arch=process.argv[2];if(!['arm64','x64'].includes(arch))throw new Error('Expected arm64 or x64');
 const bundle=path.resolve('release',arch==='arm64'?'mac-arm64':'mac','AV Presenter.app');
 const executablePath=path.join(bundle,'Contents','MacOS','AV Presenter');
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'av-presenter-smoke-'));
 const artifactDir=path.resolve('artifacts');await fs.mkdir(artifactDir,{recursive:true});
 const fixture=path.join(directory,'fixture.png');
 await fs.writeFile(fixture,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFElEQVR4nGP4TyJgGNUwqmH4agAAr639H708R/EAAAAASUVORK5CYII=','base64'));
 let application;const errors=[];
 async function launch(){
  application=await _electron.launch({executablePath,args:[`--user-data-dir=${path.join(directory,'user-data')}`],timeout:120000});
  application.process().stderr.on('data',data=>fs.appendFile(path.join(artifactDir,`mac-${arch}-stderr.log`),data).catch(()=>{}));
  const page=await application.firstWindow();page.on('pageerror',error=>errors.push(String(error)));
  await page.waitForFunction(()=>window.av && !document.body.inert,null,{timeout:60000});
  return page;
 }
 try{
  let page=await launch();
  const runtime=await application.evaluate(({app})=>({platform:process.platform,arch:process.arch,packaged:app.isPackaged,userData:app.getPath('userData')}));
  assert.equal(runtime.platform,'darwin');assert.equal(runtime.arch,arch);assert.equal(runtime.packaged,true);
  assert.equal(await fs.realpath(runtime.userData),await fs.realpath(path.join(directory,'user-data')));
  assert.equal((await page.evaluate(()=>window.av.getStartupSettings())).loginSupported,true);
  // Drive the real native media import IPC with a deterministic file-picker result.
  await application.evaluate(({dialog},fixture)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[fixture]});},fixture);
  await page.click('#add');await page.waitForFunction(()=>document.querySelector('#preview img').naturalWidth===16);
  await page.check('#text-enabled');await page.fill('#text-content','macOS smoke test');await page.click('#text-add-position');
  await page.fill('#text-x','2.55');await page.fill('#text-fontSize','30');
  assert.equal(await page.locator('#preview .overlay').filter({hasText:'macOS smoke test'}).count(),2);
  assert.equal(await page.locator('#program .overlay').filter({hasText:'macOS smoke test'}).count(),0);
  await page.click('#take');await page.waitForFunction(()=>document.querySelector('#program img').naturalWidth===16);
  assert.equal(await page.locator('#program .overlay').filter({hasText:'macOS smoke test'}).count(),2);
  const snapshot=await page.evaluate(()=>window.av.getSnapshot());assert.equal(snapshot.program.text.copies[0].x,2.55);
  const outputReady=application.waitForEvent('window');
  await page.evaluate(async()=>{const displays=await window.av.getDisplays();await window.av.startOutput(displays[0].id);});
  const output=await outputReady;await output.waitForFunction(()=>document.querySelector('#program img')?.naturalWidth===16);
  assert.equal(await output.locator('.overlay').filter({hasText:'macOS smoke test'}).count(),2);
  await page.evaluate(async()=>{
   const value=await window.av.getStartupSettings();const state=await window.av.getSnapshot();
   await window.av.saveSettings(value.preview,state.output.displayId);
   await window.av.updatePreferences({...value.preferences,restoreOnLaunch:true,reduceControlVideoLoad:true});
  });
  await page.screenshot({path:path.join(artifactDir,`mac-${arch}-control.png`)});
  await application.close();application=null;
  page=await launch();
  const restored=await page.evaluate(()=>window.av.getStartupSettings());
  assert.equal(restored.preferences.restoreOnLaunch,true);assert.equal(restored.preferences.reduceControlVideoLoad,true);
  assert.equal(restored.preview.text.text,'macOS smoke test');assert.equal(restored.preview.text.copies[0].x,2.55);
  const onAir=await page.evaluate(()=>window.av.getSnapshot());assert.equal(onAir.program.text.text,'macOS smoke test');assert.equal(onAir.output.open,true);
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(artifactDir,`mac-${arch}-smoke.json`),JSON.stringify({success:true,runtime,checks:['packaged app launch','native IPC and media protocol','image decoding','two overlay positions','decimal coordinates','Preview/Program TAKE isolation','output window','save and relaunch restoration']},null,2));
  console.log(`Packaged macOS ${arch} smoke test passed.`);
 }catch(error){
  await fs.writeFile(path.join(artifactDir,`mac-${arch}-smoke.json`),JSON.stringify({success:false,error:String(error),errors},null,2));
  throw error;
 }finally{if(application)await application.close();await fs.rm(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
