# ことば · Nihongo Atlas

A personal Japanese notebook, organized by grammar and connected to J-POP.

## Pages

- **Home:** recent additions and resume reading.
- **Grammar:** 12 topics from the initial learning notes; polite/plain form comparisons, kana, explanations, and sourced short lyric excerpts.
- **Vocabulary:** 24 starter entries, search and combined filters (part of speech, verb class, artist, date); optional Chinese → Japanese and Japanese → kana typing.
- **Songs:** 8 verified songs from YOASOBI, あいみょん, Vaundy and ヨルシカ, linked to grammar and vocabulary.

No quizzes, scores, mastery tracking, wrong-answer collection, or review scheduling. Typing feedback is ephemeral.

## Run locally

Requires Python 3 for the static server and Node 22 for checks. No build dependencies.

```sh
npm test
npm run check
npm run serve
```

Open http://localhost:4173. Serve over HTTP; ES modules and content loading do not work over file://.

## Publishing

`.github/workflows/pages.yml` validates the data and publishes only `index.html`, `assets/`, and `data/`.
Enable **Settings → Pages → Build and deployment → GitHub Actions** once. Then pushes to `main` publish automatically.

The interface follows the existing IELTS Atlas design (light gray background, white cards, blue accents, dark mode). Japanese reading uses Noto Sans JP and Noto Serif JP, with system fallbacks. The frontend is a dependency-free static application rather than MkDocs: this keeps the search, filtering and typing modules together and avoids an unnecessary content-generation dependency. All learning content is in `data/content.json`.

## Sync status

Local reading position and display preferences work immediately. Cross-device sync requires the site's own Supabase project and a personal Auth user. Until configured, the UI explicitly says **本机保存**, never **已同步**. See [docs/SYNC.md](docs/SYNC.md).

## Content updates

Follow [AUTHORING.md](AUTHORING.md). Keep stable IDs and original added dates. Songs store source URLs, verification dates, exact short excerpts, and context notes. Original examples are explicitly labelled. Song cards are original typography, not album covers. Do not add chat transcripts or private learning data to this public repository.
