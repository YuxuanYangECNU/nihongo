# Content maintenance

1. Preserve the user's note order: four predicate types, verb categories and dictionary form, then constructions. Add new topics without moving prior material unexpectedly.
2. Prioritize YOASOBI, あいみょん, Vaundy and ヨルシカ. Verify each excerpt against a reliable lyrics source, save the source URL and verification date, and read surrounding context before interpreting it.
3. Keep lyric quotations brief and within permitted quotation limits across each song. Do not collect two-line copyrighted passages from external sources. Use a short excerpt plus contextual paraphrase and a source link. User-provided lyrics may be annotated, subject to publication rights.
4. Label examples: 笔记例句, 原创拓展, 歌词短摘录, or 词典例句. Do not fabricate a dictionary or lyric citation. For future dictionary examples store a specific source URL; never label generated examples as dictionary quotations.
5. Add kana, Chinese meaning and an exact focus substring to examples. Song `focus` is rendered bold. Kana readings should be checked manually; particles retain normal spelling. Explain pronunciation when useful.
6. Preserve stable IDs and `addedAt`. Keep updated timestamps separate from original addition dates. Vocabulary defaults to words from the user's notes or referenced songs, and both approved written forms and kana in `answers`.
7. Vocabulary group and meaning should match the illustrated sense. A Japanese verb may have more than one transitivity classification; record the one used in the example where needed.
8. Store additional excerpts from the same song in `extraExcerpts[]` (each has excerpt, focus, kana, meaning, context, analysis, grammar[], and form). The site automatically groups them under the matching grammar topics; mark broader connections as related/extended rather than exact examples.
9. Avoid misleading clipped quotations: the 踊り子 experience example has an explicit preceding frequency restriction. Its full context means “only once”, not “never”.
10. Do not add quizzes, mastery scores, reviews, saved answers, or analytics. Reading position and display preferences are the only synced state.
11. Run `npm test` and `npm run check` after content changes. Check links and kana, then inspect desktop and mobile layouts after UI changes.

## Data shape

`data/content.json` contains `grammar[]`, `vocabulary[]`, and `songs[]`. Cross-links use stable IDs. Each grammar item has ordered `points`, complete `examples`, and optional `forms`. Each song has `grammar[]`; each vocabulary item has one `grammar` ID and optionally `songId`. Update counts are derived automatically, not handwritten in the UI.

### Adding more lyrics to an existing song

Inside that song's record in `data/content.json`, add short, verified fragments to `extraExcerpts`:

```json
{
  "excerpt": "幸せだ",
  "kana": "しあわせだ",
  "focus": "だ",
  "meaning": "很幸福。",
  "context": "用自己的话说明这段歌词的上下文。",
  "analysis": "幸せ为な形容词，だ是简体非过去肯定。",
  "grammar": ["na-adj"],
  "form": "な形容词·非过去肯定"
}
```

When no naturally matching lyric is available, keep the song collection for that grammar empty rather than forcing an inaccurate match. Keep the lyric fragments brief and use independent original complete sentences for context. Do not create review/bookmark/quiz features.
