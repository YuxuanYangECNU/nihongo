export function normalizeAnswer(value) {
  return String(value).normalize('NFKC').trim().replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0)-0x60));
}
export function matchesAnswer(value, word, mode) {
  const accepted = mode === 'reading' ? [word.kana] : word.answers;
  return accepted.some(a => normalizeAnswer(a) === normalizeAnswer(value));
}
export function mergeState(a={}, b={}) {
  const merged = {...a};
  for (const [key, entry] of Object.entries(b)) {
    if (!entry || !Number.isFinite(entry.updatedAt)) continue;
    if (!merged[key] || entry.updatedAt >= merged[key].updatedAt) merged[key] = entry;
  }
  return merged;
}
export function filterVocabulary(words, songs, filters) {
  const query = normalizeAnswer(filters.search || '').toLowerCase();
  return words.filter(w => {
    const s = songs.find(s => s.id === w.songId);
    const text = normalizeAnswer([w.word,w.kana,w.meaning,s?.title,s?.artist].join(' ')).toLowerCase();
    return (!query || text.includes(query)) && (!filters.pos || w.pos === filters.pos) &&
      (!filters.verbClass || w.verbClass === filters.verbClass) &&
      (!filters.artist || s?.artist === filters.artist) &&
      (!filters.from || w.addedAt >= filters.from) && (!filters.to || w.addedAt <= filters.to);
  });
}
export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function highlight(text, focus) {
  const index = text.indexOf(focus);
  if (!focus || index < 0) return escapeHTML(text);
  return escapeHTML(text.slice(0,index))+'<strong>'+escapeHTML(focus)+'</strong>'+escapeHTML(text.slice(index+focus.length));
}
