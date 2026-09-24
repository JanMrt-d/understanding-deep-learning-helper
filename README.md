# UDL Lernbegleiter

**Inoffizieller, interaktiver Lernbegleiter auf Deutsch zu [*Understanding Deep Learning*](https://udlbook.github.io/udlbook/) von Simon J. D. Prince (MIT Press).**

> *English:* Unofficial interactive German study companion for Prince's *Understanding Deep Learning*. Theory in plain words, interactive figures, industrial examples and multiple-choice questions per chapter.

## Warum dieses Repo öffentlich ist

Der Lernbegleiter entsteht Kapitel für Kapitel mit Claude. Das Repo ist bewusst öffentlich, damit nicht jede und jeder dieselbe Arbeit noch einmal generieren und dafür eigene Tokens ausgeben muss. Wer das Buch durcharbeitet, kann die Seite direkt nutzen, forken oder um weitere Kapitel ergänzen. Pull Requests sind willkommen.

## Das Buch

| | |
|---|---|
| Website mit kostenlosem PDF | https://udlbook.github.io/udlbook/ |
| Offizielles Repo mit Python-Notebooks, Errata und Lösungen | https://github.com/udlbook/udlbook |
| Autor | Simon J. D. Prince |
| Verlag | MIT Press |
| Lizenz des Buches | [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) |

Eine unveränderte Kopie des PDFs liegt unter [`book/`](book/). Die aktuelle Fassung gibt es immer auf der offiziellen Website.

## Nutzung

`docs/index.html` im Browser öffnen. Die Datei ist in sich geschlossen und funktioniert offline, nur die Schriften kommen von Google Fonts.

Über GitHub Pages lässt sich die Seite auch online stellen: *Settings → Pages → Branch `main`, Ordner `/docs`*.

## Inhalt je Kapitel

* **Theorie** in eigenen Worten mit Formeln und Diagrammen
* **Interaktive Abbildungen**, zum Beispiel latenter Raum mit Gesichtsgenerator, Q-Learning in einer Gridworld, Verlustlandschaft mit animiertem Gradientenabstieg, Under- und Overfitting über den Polynomgrad
* **Praxisbeispiel** aus der Industrie, etwa Condition Monitoring oder eine Energie-Baseline
* **Multiple-Choice-Verständnisfragen** ohne Rechenaufgaben, mit Begründung und Fortschritt im Browser

## Stand

| Kapitel | Thema | Status |
|---|---|---|
| 1 | Einführung | ✅ |
| 2 | Überwachtes Lernen | ✅ |
| 3 | Flache neuronale Netze | geplant |
| 4 bis 21 | | offen |

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
| `content/chapters.json` | Manifest mit Reihenfolge, Titeln und dem nächsten angekündigten Kapitel |
| `content/quiz/<id>.json` | Fragen je Kapitel |
| `scripts/build.py` | Baut `docs/index.html` als eine selbstständige Datei |
| `scripts/check.js` | Smoke-Test auf JS-Fehler und Überlauf bei 390 px, jeweils in Light und Dark |
| `book/` | Unverändertes Buch-PDF und Lizenzhinweis |

## Workflow

```bash
python3 scripts/build.py                          # keine Abhängigkeiten
NODE_PATH=$(npm root -g) node scripts/check.js    # benötigt Playwright mit Chromium
```

`docs/index.html` wird mit eingecheckt.

## Neues Kapitel anlegen

1. `src/chapters/kapN.html` mit `<article class="chapter" id="ch-kapN" data-ch="kapN" hidden>` anlegen. Struktur wie Kapitel 2: Hero mit drei Kernaussagen, `subnav`, Abschnitte, Praxis und `<div id="quiz-kapN">`.
2. Widgets in `src/js/NN-kapN.js` schreiben. Jede Zeichenfunktion mit `widgets.push(fn)` registrieren und Animationen über `pauseHooks` beim Kapitelwechsel stoppen. Die JS-Dateien so nummerieren, dass Quiz und Init zuletzt laden.
3. `content/quiz/kapN.json` anlegen, das Kapitel in `content/chapters.json` eintragen und `upcoming` hochzählen.
4. Bauen, prüfen, committen.

## Konventionen

* Quizfragen haben genau 4 Optionen. **Index 0 ist immer die richtige Antwort**, die Anzeige mischt deterministisch nach Frage-ID.
* Frage-IDs (`1-01`, `2-17`, …) nie ändern, sonst passt gespeicherter Fortschritt nicht mehr. Der Speicherschlüssel ist `udl-quiz-v1`.
* Texte auf Deutsch, ohne Gedankenstriche und ohne Semikolons. Keine Rechenaufgaben im Quiz.
* Farben nur über CSS-Tokens, Canvas-Farben über `tok()`, damit Light und Dark stimmen.
* Keine externen Ressourcen außer Google Fonts, alles andere inline.
* Erklärungen und Fragen in eigenen Worten formulieren und keine Passagen oder Abbildungen aus dem Buch übernehmen.

## Hinweis

Dieses Projekt ist nicht mit dem Autor oder MIT Press verbunden. Die interaktiven Abbildungen sind vereinfachte Spielzeugmodelle zur Veranschaulichung. Fehler im Lernbegleiter gehen auf dieses Repo zurück, nicht auf das Buch.
