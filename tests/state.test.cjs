const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initialScene,takeScene,clearScene,operateTimer,remaining,parseDuration,formatDuration}=require('../dist/shared/state');
const {validateScene}=require('../dist/main/validation');
test('Preview remains separate until TAKE and TAKE is a deep copy',()=>{
 const program=initialScene(),preview=initialScene();preview.text.enabled=true;preview.text.text='LUNCH BREAK';
 assert.notEqual(program.text.text,preview.text.text);const next=takeScene(preview,program);
 preview.text.text='OTHER';assert.equal(next.text.text,'LUNCH BREAK');assert.equal(next.text.enabled,true);
});
test('CLEAR preserves background playback and countdown deadline',()=>{
 const state=initialScene();state.clock.enabled=state.text.enabled=state.countdown.enabled=true;
 state.media.item={id:'video',name:'video',url:'av-media://video/content.mp4',type:'video'};state.countdown=operateTimer(state.countdown,'start',1000);
 const cleared=clearScene(state);assert.deepEqual(cleared.media,state.media);assert.equal(cleared.countdown.deadline,state.countdown.deadline);
 for(const key of ['text','clock','countdown'])assert.equal(cleared[key].enabled,false);assert.equal(state.text.enabled,true);
});
test('Timer uses elapsed time, pauses accurately, and resets',()=>{
 const timer=operateTimer(initialScene().countdown,'start',1000);assert.equal(remaining(timer,61000),540000);
 const paused=operateTimer(timer,'pause',61000);assert.equal(remaining(paused,200000),540000);
 const resumed=operateTimer(paused,'start',200000);assert.equal(remaining(resumed,201000),539000);
 assert.equal(remaining(resumed,1000000),0);assert.equal(operateTimer(resumed,'reset').remainingMs,600000);
});
test('Unrelated TAKE preserves on-air countdown; new cue replaces it',()=>{
 const program=initialScene();program.countdown=operateTimer(program.countdown,'start',1000);
 const preview=structuredClone(program);preview.text.text='New title';preview.countdown.deadline=999999;
 assert.equal(takeScene(preview,program).countdown.deadline,601000);
 preview.countdown=operateTimer(preview.countdown,'reset');assert.equal(takeScene(preview,program).countdown.running,false);
});
test('Duration parsing and formatting',()=>{
 assert.equal(parseDuration('10:00'),600000);assert.equal(parseDuration('01:30:00'),5400000);
 for(const text of ['00:00','10:60','abc','-1:00','1000:00','01:60:00'])assert.equal(parseDuration(text),null);
 assert.equal(formatDuration(599001),'10:00');assert.equal(formatDuration(3600000),'01:00:00');assert.equal(formatDuration(-1),'00:00');
});
test('IPC rejects unregistered media and invalid style data',()=>{
 const scene=initialScene();scene.media.item={id:'missing',name:'bad',url:'file:///private',type:'video'};
 assert.throws(()=>validateScene(scene,[]));scene.media.item=null;scene.text.x=NaN;assert.throws(()=>validateScene(scene,[]));
 scene.text.x=50;assert.doesNotThrow(()=>validateScene(scene,[]));
});
