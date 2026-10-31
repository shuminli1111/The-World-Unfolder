# World Unfolder website · V1

A lightweight, responsive, GitHub Docs-inspired reading interface for **The World Unfolder**, adapted to match the structure of its sister repository.

## Preview locally

From the **repository root**, run:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000/site/**.

Do not open `index.html` directly as a local `file://` URL: browsers commonly block reading local Markdown through `fetch`.

## What works

- GitHub Docs All docs-style homepage with **On Unfolding Itself** and eight domains.
- Markdown pages for the methodology essay and all eight domain landing pages.
- Three-column article view: collapsible domain/concept links on the left, readable Markdown in the middle, and **On this page** on the right.
- Full-text search across available Markdown pages, with **⌘/Ctrl+K** and **/** shortcuts.
- Responsive mobile sidebar.
- Planned concepts appear without fake links.

## Content model

Markdown in `README.md`, `methodology/` and `domains/` is authoritative. `navigation.json` supplies route metadata and the homepage grouping. For a developed concept, add `domains/<domain>/<concept>.md`, a link in the domain hub, an entry in README, and a matching navigation item. Never link a page that does not exist.

The site uses the same zero-build, framework-free approach as The World Slicer. It reads files over HTTP using hash routes, for example `#/arts-and-culture/literature`.

## Validation

From repository root:

```bash
python3 site/check.py
```

The script checks homepage / navigation agreement, Markdown targets and anchors, three-part inquiry headings, template structure, and JavaScript syntax when Node.js is available.

## Visual direction

Minimal system sans-serif, white background, restrained blue links and dividers, left domain/concept navigation, central articles, and separate right-side **On this page** headings. No italic styling or decorative cards. The UI is an original implementation inspired by the general organisation of GitHub Docs.

## Hosting

No deployment is configured. Public deployment requires the author's explicit approval.
