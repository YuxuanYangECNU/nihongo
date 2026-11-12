import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAnswer,matchesAnswer,mergeState,filterVocabulary,highlight} from '../assets/core.js';
const music={word:'音楽',kana:'おんがく',answers:['音楽','おんがく']};
test('Japanese forms accepted only in the appropriate typing mode',()=>{
 assert(matchesAnswer(' 音楽 ',music,'meaning'));
 assert(matchesAnswer('おんがく',music,'meaning'));
 assert(matchesAnswer('ｵﾝｶﾞｸ',music,'reading'));
 assert(!matchesAnswer('音楽',music,'reading'));
 assert(!matchesAnswer('ongaku',music,'reading'));
});
test('long vowels, small kana and gemination remain meaningful',()=>{
 for(const [wrong,right] of [['きて','きって'],['びよういん','びょういん'],['おばさん','おばあさん'],['かど','かーど']])assert.notEqual(normalizeAnswer(wrong),normalizeAnswer(right));
});
test('merge preserves newer fields independently and is idempotent',()=>{
 const local={kana:{value:false,updatedAt:9},reading:{value:{id:'noun'},updatedAt:5}};
 const cloud={kana:{value:true,updatedAt:2},reading:{value:{id:'verb'},updatedAt:10}};
 const result=mergeState(local,cloud);assert.equal(result.kana.value,false);assert.equal(result.reading.value.id,'verb');assert.deepEqual(mergeState(result,cloud),result);assert.equal(local.reading.value.id,'noun');
});
test('combine search, source, part of speech, verb type and date range',()=>{
 const words=[{word:'聴く',kana:'きく',meaning:'听',pos:'动词',verbClass:'一类',songId:'rock',addedAt:'2026-11-12'},{word:'音楽',kana:'おんがく',meaning:'音乐',pos:'名词',addedAt:'2026-11-10'}];
 const songs=[{id:'rock',title:'君はロックを聴かない',artist:'あいみょん'}];
 assert.equal(filterVocabulary(words,songs,{search:'キク',pos:'动词',verbClass:'一类',artist:'あいみょん',from:'2026-11-12',to:'2026-11-12'}).length,1);
 assert.equal(filterVocabulary(words,songs,{search:'音楽',artist:'あいみょん'}).length,0);
 assert.equal(filterVocabulary(words,songs,{from:'2026-11-13'}).length,0);
});
test('highlight escapes source text before adding emphasis',()=>{
 assert.equal(highlight('<script>寒い</script>','寒い'),'&lt;script&gt;<strong>寒い</strong>&lt;/script&gt;');
});
