# Content maintenance

1. Preserve the user's note order: four predicate types, verb categories and dictionary form, then constructions. Add new topics without moving prior material unexpectedly.
2. Prioritize YOASOBI, あいみょん, Vaundy and ヨルシカ. Verify each excerpt against a reliable lyrics source, save the source URL and verification date, and read surrounding context before interpreting it.
3. Keep lyric quotations brief and within permitted quotation limits across each song. Do not collect two-line copyrighted passages from external sources. Use a short excerpt plus contextual paraphrase and a source link. User-provided lyrics may be annotated, subject to publication rights.
4. Label examples: 笔记例句, 原创拓展, 歌词短摘录, or 词典例句. Do not fabricate a dictionary or lyric citation. For future dictionary examples store a specific source URL; never label generated examples as dictionary quotations.
5. Add kana, Chinese meaning and an exact focus substring to examples. Song `focus` is rendered bold. Kana readings should be checked manually; particles retain normal spelling. Explain pronunciation when useful.
6. Preserve stable IDs and `addedAt`. Keep updated timestamps separate from original addition dates. Vocabulary defaults to words from the user's notes or referenced songs, and both approved written forms and kana in `answers`.
7. Vocabulary group and meaning should match the illustrated sense. A Japanese verb may have more than one transitivity classification; record the one used in the example where needed.
8. Avoid misleading clipped quotations: the 踊り子 experience example has an explicit preceding frequency restriction. Its full context means “only once”, not “never”.
9. Do not add quizzes, mastery scores, reviews, saved answers, or analytics. Reading position and display preferences are the only synced state.
10. Run `npm test` and `npm run check` after content changes. Check links and kana, then inspect desktop and mobile layouts after UI changes.

## Data shape

`data/content.json` contains `grammar[]`, `vocabulary[]`, and `songs[]`. Cross-links use stable IDs. Each grammar item has ordered `points`, complete `examples`, and optional `forms`. Each song has `grammar[]`; each vocabulary item has one `grammar` ID and optionally `songId`. Update counts are derived automatically, not handwritten in the UI.
