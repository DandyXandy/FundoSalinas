"""Construye el sitio estático de Fundo Salinas.

Une src/partials (head, header, footer) con cada página de src/pages
y escribe el resultado en public/. Vercel publica public/ tal cual.

Uso:  python build.py
Cada página empieza con un comentario JSON:
<!--{"title": "...", "description": "...", "nav": "espacios", "body": "page-x"}-->
"""
import json
import re
from pathlib import Path

SITE_URL = "https://fundosalinas.portfoliodandy.com"  # dominio público (sin barra final)

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "public"

head = (SRC / "partials" / "head.html").read_text(encoding="utf-8")
header = (SRC / "partials" / "header.html").read_text(encoding="utf-8")
footer = (SRC / "partials" / "footer.html").read_text(encoding="utf-8")

META_RE = re.compile(r"^\s*<!--(\{.*?\})-->\s*", re.S)


def render(page: Path) -> str:
    raw = page.read_text(encoding="utf-8")
    m = META_RE.match(raw)
    if not m:
        raise SystemExit(f"{page.name}: falta el comentario JSON de metadatos")
    meta = json.loads(m.group(1))
    body = raw[m.end():]

    slug = page.stem
    path = "/" if slug == "index" else f"/{slug}"
    h = (head.replace("{{SITE_URL}}", SITE_URL)
             .replace("{{URL}}", SITE_URL + path)
             .replace("{{TITLE}}", meta["title"])
             .replace("{{DESCRIPTION}}", meta["description"])
             .replace("{{BODY_CLASS}}", meta.get("body", ""))
             .replace("{{HEAD_EXTRA}}", meta.get("head", "")))

    nav = meta.get("nav")
    hd = header
    if nav:
        hd = re.sub(
            rf'(<(?:a|button)[^>]*?)class="([^"]*)"([^>]*?data-nav="{nav}")',
            r'\1class="\2 is-current"\3 aria-current="page"',
            hd,
        )
        hd = re.sub(
            rf'(<a href="[^"]*" )data-nav="{nav}"',
            r'\1class="is-current" aria-current="page" data-nav="{0}"'.replace("{0}", nav),
            hd,
        )
    return h + hd + "\n  <main id=\"main\">\n" + body.rstrip() + "\n  </main>\n\n" + footer


def main() -> None:
    pages = sorted((SRC / "pages").glob("*.html"))
    for page in pages:
        (OUT / page.name).write_text(render(page), encoding="utf-8")
        print("ok", page.name)


if __name__ == "__main__":
    main()
