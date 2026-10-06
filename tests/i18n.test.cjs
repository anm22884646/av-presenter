const {test}=require('node:test');const assert=require('node:assert/strict');
const i18n=require('../dist/renderer/control/i18n');
const values=new Map();global.document={documentElement:{lang:''}};
global.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
test('Four languages cover all keys and preserve interpolation values',()=>{
 for(const language of i18n.languages){
  assert.deepEqual(Object.keys(i18n.translations[language]).sort(),Object.keys(i18n.translations.en).sort());
  i18n.setLanguage(language);assert.equal(document.documentElement.lang,language);
  assert.ok(i18n.t('Remove {name}',{name:'Session 日本語.mp4'}).includes('Session 日本語.mp4'));
 }
 i18n.setLanguage('zh-Hant');assert.equal(i18n.t('SAVE CURRENT SETTINGS'),'儲存目前設定');
 i18n.loadLanguage();assert.equal(i18n.getLanguage(),'zh-Hant');
 i18n.setLanguage('unknown');assert.equal(i18n.getLanguage(),'en');
});
