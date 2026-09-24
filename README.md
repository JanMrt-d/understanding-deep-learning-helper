# UDL Study Companion

**An unofficial, interactive study companion to [*Understanding Deep Learning*](https://udlbook.github.io/udlbook/) by Simon J. D. Prince (MIT Press).**

For every chapter: the theory in plain words, interactive figures, an industrial case study, and conceptual multiple-choice questions.

**Live version:** https://janmrt-d.github.io/understanding-deep-learning-helper/

## Why this repository is public

This companion is built chapter by chapter with Claude. The repository is public on purpose, so that nobody has to generate the same material again and spend their own tokens on it. If you are working through the book, feel free to use the site directly, fork it, or add chapters. Pull requests are welcome.

## The book

| | |
|---|---|
| Website with free PDF | https://udlbook.github.io/udlbook/ |
| Official repository with Python notebooks, errata and answers | https://github.com/udlbook/udlbook |
| Author | Simon J. D. Prince |
| Publisher | MIT Press |
| License of the book | [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) |

An unmodified copy of the PDF is stored in [`book/`](book/). The latest version is always available on the official website.

## Usage

**Online:** via GitHub Pages at the link above.

**Offline:** open `docs/index.html` in a browser. The file is self-contained and works offline, only the fonts are loaded from Google Fonts.

GitHub Pages serves *Settings → Pages → Branch `main`, folder `/docs`*. Forks can use the same setting.

## What each chapter contains

* **Theory** in plain words, with equations and diagrams
* **Interactive figures**, for example a latent space with a face generator, tabular Q-learning in a gridworld, a loss surface with animated gradient descent, and under- vs. overfitting as a function of polynomial degree
* **Case study** from industry, such as condition monitoring or an energy baseline
* **Multiple-choice questions** without calculations, with explanations and progress saved in the browser

## Status

| Chapter | Topic | Status |
|---|---|---|
| 1 | Introduction | ✅ |
| 2 | Supervised learning | ✅ |
| 3 | Shallow neural networks | planned |
| 4 to 21 | | open |

## Repository layout

| Path | Contents |
|---|---|
| `src/page.html` | Page shell with header, chapter tabs, footer and placeholders |
| `src/styles.css` | Design tokens (light and dark), layout, components |
| `src/chapters/<id>.html` | One `<article class="chapter">` per chapter with sections, figures and SVG diagrams |
| `src/js/00-core.js` | Helpers (`prep`, `tok`, `axes`), storage, chapter navigation, `widgets`, `pauseHooks` |
| `src/js/10-ch1.js`, `20-ch2.js` | Interactive widgets per chapter |
| `src/js/30-quiz.js` | Quiz rendering |
| `src/js/40-init.js` | Startup |
| `content/chapters.json` | Manifest with order, titles and the next announced chapter |
| `content/quiz/<id>.json` | Questions per chapter |
| `scripts/build.py` | Builds `docs/index.html` as a single self-contained file |
| `scripts/check.js` | Smoke test for JS errors and horizontal overflow at 390 px, in light and dark mode |
| `book/` | Unmodified book PDF and license notice |

## Workflow

```bash
python3 scripts/build.py                          # no dependencies
NODE_PATH=$(npm root -g) node scripts/check.js    # requires Playwright with Chromium
```

`docs/index.html` is committed.

## Adding a chapter

1. Create `src/chapters/chN.html` with `<article class="chapter" id="chapter-chN" data-ch="chN" hidden>`. Follow the structure of chapter 2: hero with three key takeaways, `subnav`, sections, case study, and `<div id="quiz-chN">`.
2. Put widgets in `src/js/NN-chN.js`. Register every draw function with `widgets.push(fn)` and stop animations on chapter switch via `pauseHooks`. Number the JS files so that the quiz and init scripts load last.
3. Create `content/quiz/chN.json`, add the chapter to `content/chapters.json`, and increment `upcoming`.
4. Build, check, commit.

## Conventions

* Quiz questions have exactly 4 options. **Index 0 is always the correct answer**, and the display order is shuffled deterministically per question ID.
* Never change question IDs (`1-01`, `2-17`, …), otherwise saved progress no longer matches. The storage key is `udl-quiz-v1`.
* All text in English, using the standard terminology of ML research and of the book (for example *loss function*, *latent variables*, *temporal credit assignment*, *capacity*). No em dashes, no semicolons. No calculations in the quiz.
* Colors only via CSS tokens, canvas colors via `tok()`, so that light and dark mode both work.
* No external resources except Google Fonts. Everything else is inlined.
* Write explanations and questions in your own words and do not copy passages or figures from the book.

## License

| Part | License |
|---|---|
| Code: `src/js/`, `src/page.html`, `src/styles.css`, `scripts/` | [MIT](LICENSE) |
| Content: `src/chapters/`, `content/`, text and diagrams in `docs/index.html` | [CC BY 4.0](LICENSE-CONTENT) |
| Book PDF in `book/` | CC BY-NC-ND 4.0, © MIT Press, see [`book/README.md`](book/README.md) |

When reusing the content, please credit “UDL Study Companion by Jan Mertes” with a link to https://github.com/JanMrt-d/understanding-deep-learning-helper.

## Disclaimer

This project is not affiliated with the author or MIT Press. The interactive figures are simplified toy models for illustration. Any errors in this companion are the responsibility of this repository, not of the book.
