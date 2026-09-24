#!/usr/bin/env python3
"""Builds docs/index.html (GitHub Pages) as a single self-contained file from src/ and content/.

Order:
  src/page.html            page shell with placeholders
  src/styles.css           -> /*@STYLES*/
  src/chapters/<id>.html   -> <!--@CHAPTERS-->  (order from content/chapters.json)
  content/quiz/<id>.json   -> /*@DATA*/         (QUIZ, UPCOMING, CH_TITLES)
  src/js/*.js              -> /*@SCRIPTS*/      (alphabetical, hence prefixes 00-, 10-, ...)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, CONTENT, DIST = ROOT / "src", ROOT / "content", ROOT / "docs"
N_CORE, N_TRANSFER = 10, 3  # questions per chapter


def main() -> int:
    manifest = json.loads((CONTENT / "chapters.json").read_text(encoding="utf-8"))
    chapters = manifest["chapters"]

    html_parts, quiz = [], []
    for ch in chapters:
        cid = ch["id"]
        html_parts.append((SRC / "chapters" / f"{cid}.html").read_text(encoding="utf-8").rstrip())
        quiz.append(json.loads((CONTENT / "quiz" / f"{cid}.json").read_text(encoding="utf-8")))

    ids = [q["id"] for q in quiz]
    if ids != [c["id"] for c in chapters]:
        print("Quiz IDs do not match the manifest", file=sys.stderr)
        return 1
    for q in quiz:
        seen = set()
        for item in q["questions"]:
            if item["id"] in seen:
                print(f"Duplicate question ID {item['id']}", file=sys.stderr)
                return 1
            seen.add(item["id"])
            if len(item["opts"]) != 4:
                print(f"Question {item['id']} does not have exactly 4 options (index 0 is correct)", file=sys.stderr)
                return 1
        kinds = [bool(item.get("transfer")) for item in q["questions"]]
        if kinds != [False] * N_CORE + [True] * N_TRANSFER:
            print(f"Quiz {q['id']} needs {N_CORE} core questions followed by {N_TRANSFER} transfer questions", file=sys.stderr)
            return 1

    data = (
        "const QUIZ = " + json.dumps(quiz, ensure_ascii=False) + ";\n"
        "const UPCOMING = " + json.dumps(manifest.get("upcoming")) + ";\n"
        "const CH_TITLES = " + json.dumps({c["id"]: c["title"] for c in chapters}, ensure_ascii=False) + ";\n"
    )
    scripts = "\n".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "js").glob("*.js")))

    page = (SRC / "page.html").read_text(encoding="utf-8")
    for marker, value in [
        ("/*@STYLES*/", (SRC / "styles.css").read_text(encoding="utf-8")),
        ("<!--@CHAPTERS-->", "\n\n".join(html_parts)),
        ("/*@DATA*/", data),
        ("/*@SCRIPTS*/", scripts),
    ]:
        if marker not in page:
            print(f"Placeholder {marker} missing in src/page.html", file=sys.stderr)
            return 1
        page = page.replace(marker, value)

    DIST.mkdir(exist_ok=True)
    out = DIST / "index.html"
    out.write_text(page, encoding="utf-8")
    n = sum(len(q["questions"]) for q in quiz)
    print(f"{out.relative_to(ROOT)}  {out.stat().st_size/1024:.0f} KiB  {len(chapters)} chapters  {n} questions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
