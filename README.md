# UDL Lernbegleiter

Interaktiver Lernbegleiter zu S. J. D. Prince, *Understanding Deep Learning* (MIT Press).
Pro Kapitel: Theorie in eigenen Worten, interaktive Abbildungen, ein Praxisbeispiel aus der Industrie und Multiple-Choice-Verständnisfragen.

Veröffentlicht als Artifact: https://claude.ai/artifact/T6p9T8ZPidaoKXshisnvxy

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/page.html` | Gerüst mit Header, Kapitel-Tabs, Footer und Platzhaltern |
| `src/styles.css` | Design-Tokens (Light und Dark), Layout, Komponenten |
| `src/chapters/<id>.html` | Ein `<article class="chapter">` je Kapitel mit Abschnitten, Figuren, SVG-Diagrammen |
| `src/js/00-core.js` | Helfer (`prep`, `tok`, `axes`), Speicher, Kapitel-Navigation, `widgets`, `pauseHooks` |
| `src/js/10-kap1.js` ff. | Interaktive Widgets je Kapitel |
| `src/js/30-quiz.js` | Quiz-Rendering |
| `src/js/40-init.js` | Start |
| `content/chapters.json` | Manifest: Reihenfolge, Titel, nächstes angekündigtes Kapitel |
| `content/quiz/<id>.json` | Fragen je Kapitel |
| `scripts/build.py` | Baut `dist/index.html` als eine selbstständige Datei |
| `scripts/check.js` | Smoke-Test: JS-Fehler, Überlauf auf 390 px, Light und Dark |

## Workflow

```bash
python3 scripts/build.py
NODE_PATH=$(npm root -g) node scripts/check.js
```

`dist/index.html` wird mit eingecheckt und ist die Datei, die als Artifact veröffentlicht wird.

## Neues Kapitel anlegen

1. `src/chapters/kapN.html` mit `<article class="chapter" id="ch-kapN" data-ch="kapN" hidden>` anlegen, Struktur wie Kapitel 2: Hero mit drei Kernaussagen, `subnav`, Abschnitte, Praxis, `<div id="quiz-kapN">`.
2. Widgets in `src/js/NN-kapN.js`. Jede Zeichenfunktion mit `widgets.push(fn)` registrieren, Animationen über `pauseHooks` beim Kapitelwechsel stoppen. Bestehende JS-Dateien umnummerieren, sodass Quiz und Init zuletzt laden.
3. `content/quiz/kapN.json` anlegen und Kapitel in `content/chapters.json` eintragen, `upcoming` hochzählen.
4. Bauen, prüfen, committen, veröffentlichen.

## Konventionen

* Quizfragen: genau 4 Optionen, **Index 0 ist immer die richtige Antwort**. Die Anzeige mischt deterministisch nach Frage-ID.
* Frage-IDs (`1-01`, `2-17`, …) nie ändern, sonst passt gespeicherter Fortschritt nicht mehr. Speicherschlüssel: `udl-quiz-v1`.
* Texte auf Deutsch, ohne Gedankenstriche und ohne Semikolons, keine Rechenaufgaben im Quiz.
* Farben nur über CSS-Tokens, Canvas-Farben über `tok()`, damit Light und Dark stimmen.
* Keine externen Ressourcen außer Google Fonts. Alles andere inline.
