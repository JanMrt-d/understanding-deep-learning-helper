# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Interactive study companion to *Understanding Deep Learning* (S. J. D. Prince), built chapter by chapter and published via GitHub Pages. `README.md` is the authoritative source for workflow and conventions. This file condenses it and adds what is only visible across several source files.

## Commands

```bash
python3 scripts/build.py                          # builds docs/index.html, stdlib only, also validates the quiz data
NODE_PATH=$(npm root -g) node scripts/check.js    # smoke test, needs globally installed Playwright with Chromium
```

There is no other test suite and no linter. `check.js` loads `docs/index.html` at 1100 px and 390 px in light and dark mode, clicks every chapter tab, and fails on JS errors or horizontal overflow. Always run the build before the check, because the check only sees the built file.

## Deployment

- GitHub Pages serves `main`, folder `/docs`. Every push to `main` redeploys, about a minute later.
- Pages serves the committed `docs/index.html` as is. Changes in `src/` or `content/` have no effect until the build has run and `docs/index.html` is committed in the same change.
- `book/` holds the unmodified book PDF (CC BY-NC-ND, never modify it) and is not part of the site.

## Architecture

`scripts/build.py` produces a single self-contained `docs/index.html` by filling placeholders in `src/page.html`:

| Placeholder | Source |
|---|---|
| `/*@STYLES*/` | `src/styles.css` |
| `<!--@CHAPTERS-->` | `src/chapters/<id>.html`, in the order of `content/chapters.json` |
| `/*@DATA*/` | globals `QUIZ` (all `content/quiz/<id>.json`), `UPCOMING`, `CH_TITLES` |
| `/*@SCRIPTS*/` | all `src/js/*.js`, concatenated in alphabetical order |

Consequences that are easy to miss:

- **All JS files share one global scope** in one `<script>`. Top-level names (`const`, `let`, `function`) must be unique across all files. The numeric prefix defines load order: `00-core.js` first, chapter widgets in `10-`, `20-`, …, then `30-quiz.js` and `40-init.js` last.
- `00-core.js` provides the runtime used by every chapter: `prep(canvas)` (DPR-aware sizing, height from the canvas `data-ar` aspect ratio), `tok()` (reads CSS color tokens for canvas drawing), `widgets` (draw functions redrawn on resize, theme change and chapter switch), `pauseHooks` (called with the active chapter id on every switch, used to stop animations), and the `localStorage` state.
- `40-init.js` renders all quizzes, restores the active chapter and contains some chapter-specific widget initialization. A new chapter may need to add its own init there.
- Chapter visibility is driven by `data-ch` on `<article class="chapter">`. Tabs are generated from `QUIZ`, and the disabled "coming soon" tab from `upcoming` in `content/chapters.json`.
- Section anchors inside chapters use the prefix `k<N>-` (for example `k2-quiz`), referenced by the `subnav` buttons via `data-go`.
- Quiz strings are inserted with `innerHTML`, so they may contain inline HTML.

## Adding a chapter

1. `src/chapters/chN.html` with `<article class="chapter" id="chapter-chN" data-ch="chN" hidden>`. Follow the structure of chapter 2: hero with three takeaways, `subnav`, sections, "In practice" industrial case study, and `<div id="quiz-chN">`.
2. Widgets in `src/js/NN-chN.js` with `NN` below 30. Register draw functions with `widgets.push(fn)` and stop animations via `pauseHooks`.
3. `content/quiz/chN.json`, then add the chapter to `content/chapters.json` and increment `upcoming`.
4. Update the status table in `README.md`, build, check, and commit including `docs/index.html`.

## Quiz rules (enforced by `build.py` where noted)

- Exactly 10 core questions followed by exactly 3 transfer questions per chapter (enforced). Transfer questions apply the chapter to an industrial scenario and carry `"sec": "Transfer", "transfer": true`.
- Exactly 4 options (enforced). **Index 0 is always the correct answer.** The display order is shuffled deterministically per question ID.
- Question IDs are unique (enforced) and must never be changed or reused. Saved progress under the `localStorage` key `udl-quiz-v1` is keyed by ID. New questions get the next free number (`1-25`, `2-20`, …).
- Conceptual only, no calculations. Each question has an explanation in `exp`.

## Content and style rules

- All text in English with the standard terminology of ML research and of the book (*loss function*, *latent variables*, *temporal credit assignment*, *capacity*, …).
- No em dashes and no semicolons in any content text.
- Colors only via CSS tokens in `src/styles.css` (light and dark variants), and in canvas only via `tok()`, so both themes work.
- No external resources except Google Fonts. Everything else is inlined.
- Licenses: code (`src/js/`, `src/page.html`, `src/styles.css`, `scripts/`) is MIT, content (`src/chapters/`, `content/`) is CC BY 4.0.
