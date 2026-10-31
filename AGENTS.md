# Instructions for AI Collaborators

This repository is **The World Unfolder**, a Markdown-first inquiry atlas and sister project to [The World Slicer](https://github.com/shuminli1111/the-world-slicer).

## Purpose and authorial control

Develop an integrated understanding of an individual concept: **The Essence → The Elements → The Whole**. The author retains final authority over conceptual direction, aesthetics, scope, and publication.

## Repository architecture

Match the sister repository's structural conventions:

- `README.md`: concise, GitHub-readable homepage with **On Unfolding Itself** and eight domain groups. Candidate concepts are plain text until developed.
- `domains/<domain>.md`: domain overview / landing page.
- `domains/<domain>/<concept>.md`: one complete concept inquiry; do not split Essence, Elements, and Whole into independent files.
- `methodology/on-unfolding-the-world.md`: methodological essay.
- `templates/concept.md` and `templates/domain.md`: canonical Markdown scaffolds.
- `navigation.json`: routes and homepage groupings for the zero-build `site/` reader; keep it in sync with Markdown.
- `.agents/skills/essence-led-inquiry/SKILL.md`: reusable research workflow.
- `design/`: editorial guidance and exploration notes.
- `.github/workflows/`: content/site validation.

The eight broad, overlapping navigation spaces are Nature & Life; Mind & Human Experience; Arts & Culture; Ideas & Beliefs; Society & Institutions; Economy & Finance; Technology & Infrastructure; History & Civilisations.

## Essence-Led Inquiry

Use the repository-local [Essence-Led Inquiry skill](.agents/skills/essence-led-inquiry/SKILL.md). Iterate and select separately for **essence**, **research methods**, **elements**, and **integration**. The published report presents exactly three major sections.

- **The Essence:** Primary Nature (IS-A), Higher-Level Category, provisional Defining Essence, and appropriate Research Methods.
- **The Elements:** choose a fitting element-discovery method; distinguish parts from actors, conditions, mechanisms, and explanatory factors.
- **The Whole:** select an integration method suited to the actual subject; explain natural architecture, key relationships, and testing/refinement.

Do not confuse IS-A, PART-OF, ROLE-IN, and INTERACTS-WITH. Do not force timeless essences or universal checklists across unrelated subjects. No fictional sources or claimed verification without evidence.

## Editorial and navigation rules

1. Write for an intelligent general reader. Use concrete words, short definitions, and explicit explanations of each element's significance.
2. Treat candidate concepts in a domain as **ideas for future inquiry**, not finished articles.
3. Use relative Markdown links. Link only to existing files and existing headings.
4. A domain's placement is for navigation and does not determine its concept's Primary Nature.
5. Preserve existing researched material; propose changes rather than silently overwrite.
6. On the homepage, show domain → candidate concept lists. The left website sidebar shows domains and *developed* concepts only; the right **On this page** panel shows article H2 headings.
7. Keep the site visually aligned with the sister repository: GitHub Docs-inspired, minimal, sans-serif, white canvas, restrained links and dividers, no decorative cards, no italic styling.
8. Markdown is authoritative. The site is a static, zero-build prototype. **Do not deploy publicly without explicit approval.**
9. Do not update The World Slicer when editing this repository.

## Publishing

Preview changes first when appropriate. Use an approved PR for substantial conceptual changes; direct commits require explicit authorisation for the specific change. Read the live branch and file versions before writes.

Validate with `python3 site/check.py` and `node --check site/app.js` if Node is available.

See [design specification](design/WORLD-UNFOLDER-SPEC.md).
