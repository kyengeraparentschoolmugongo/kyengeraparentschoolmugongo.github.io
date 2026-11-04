#!/usr/bin/env python3
"""Convert Office/OpenDocument files under public/ to sibling "<file>.pdf" copies.

Runs in GitHub Actions (headless LibreOffice). Originals are never modified; the
list of converted originals is written to src/data/converted-documents.json so
the site previews the PDF while still offering the original for download.
"""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
MANIFEST = ROOT / "src/data/converted-documents.json"
SITE = "https://fresh-teacher.github.io/"
EXTS = {".doc", ".docx", ".ppt", ".pptx", ".pps", ".ppsx", ".xls", ".xlsx", ".odt", ".ods", ".odp", ".rtf"}


def convert(source: Path) -> bool:
    target = source.with_name(source.name + ".pdf")
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return True
    with tempfile.TemporaryDirectory() as out:
        result = subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", out, str(source)],
                                capture_output=True, text=True, timeout=300)
        produced = Path(out) / (source.stem + ".pdf")
        if result.returncode != 0 or not produced.exists():
            print(f"FAILED {source.relative_to(ROOT)}: {result.stderr.strip()}", file=sys.stderr)
            return False
        shutil.move(str(produced), target)
    print(f"converted {source.relative_to(ROOT)}")
    return True


def main():
    converted = []
    for source in sorted(PUBLIC.rglob("*")):
        if source.is_file() and source.suffix.lower() in EXTS and convert(source):
            converted.append(SITE + source.relative_to(PUBLIC).as_posix())
    MANIFEST.write_text(json.dumps(converted, indent=2) + "\n")
    print(f"{len(converted)} converted documents recorded")


if __name__ == "__main__":
    main()
