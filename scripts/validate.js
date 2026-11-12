import fs from 'node:fs';
import assert from 'node:assert/strict';
const d=JSON.parse(fs.readFileSync(new URL('../data/content.json',import.meta.url)));
for(const name of ['grammar','songs','vocabulary']){assert(d[name].length);assert.equal(new Set(d[name].map(x=>x.id)).size,d[name].length,`Duplicate ${name} IDs`);}
const ids=new Set(d.grammar.map(g=>g.id));const songIds=new Set(d.songs.map(s=>s.id));
for(const g of d.grammar){assert(g.examples.length);for(const e of g.examples){assert(e.text.includes(e.focus),g.id+' missing focus');assert(e.kana);assert(['笔记例句','原创拓展','词典例句'].includes(e.source));}if(g.forms.length)assert.equal(g.forms.length,8);}
for(const s of d.songs){assert(new URL(s.url).protocol==='https:');assert(s.verifiedAt&&s.source);for(const e of [s,...(s.extraExcerpts||[])]){assert(e.grammar.every(id=>ids.has(id)),s.id+' invalid grammar link');assert(e.excerpt.includes(e.focus),s.id+' invalid focus');assert(e.kana&&e.context&&e.analysis,s.id+' missing explanation');assert([...e.excerpt].length<=18,'Review lyric quotation budget: '+s.id);}}
for(const v of d.vocabulary){assert(ids.has(v.grammar));assert(v.kana&&v.answers.length);assert(/^\d{4}-\d{2}-\d{2}$/.test(v.addedAt));if(v.songId)assert(songIds.has(v.songId));else assert(v.example&&v.exampleKana&&v.source);}
console.log(`Validated ${d.grammar.length} grammar topics, ${d.vocabulary.length} words, ${d.songs.length} sourced songs and ${d.songs.reduce((n,s)=>n+1+(s.extraExcerpts?.length||0),0)} excerpts.`);
