# The World Unfolder — Design & Publishing Specification

**Status:** Repository and static site structure initialised. Public deployment has not been configured.

## Identity

The World Unfolder is **an atlas of understanding**. It takes a concept as its unit of research, moves from the subject's essence to its elements, and develops an integrated account of the whole. The sister project [The World Slicer](https://github.com/shuminli1111/the-world-slicer) explores alternative perspectives instead.

## Source of truth

- `README.md` is the single homepage and all-domain index.
- `domains/<slug>.md` is the concise domain hub.
- `domains/<slug>/<concept>.md` is a complete standalone inquiry.
- `methodology/` contains an opening essay.
- `templates/` defines the editorial form.
- `navigation.json` maps existing Markdown to the website, without inventing routes for unwritten pages.
- `site/` is a zero-build, GitHub Docs-inspired Markdown reader.

## Domains

Nature & Life; Mind & Human Experience; Arts & Culture; Ideas & Beliefs; Society & Institutions; Economy & Finance; Technology & Infrastructure; History & Civilisations. These are navigational, overlapping spaces; they do not establish the primary nature of their contents.

## Inquiry method

**01 The Essence → 02 The Elements → 03 The Whole.** Research-method selection sits inside The Essence, rather than as an independent major chapter. Internally compare options before settling on the essence, disciplinary approaches, element-discovery method and integration model. Evidence and uncertainty must be made clear.

Each concept gets one Markdown article. The stages are H2 headings, while distinctions and method explanations live inside them as paragraphs, subheadings or compact tables. Do not force three disconnected mini-articles.

## Homepage and article experience

Match The World Slicer's interface architecture: a compact **All Domains** homepage with methodology and domain groups; a three-column reading layout with collapsible left navigation (domain → concept), central article, and a separate right **On this page** table of contents; search over actual articles; responsive mobile drawer.

Keep planned concepts as plain text without fake links. No extra artificial ranking or prescribed reading order. No decorative cards, gradient treatments or forced diagrams.

## Quality

Favour conceptual fit over tidy symmetry. Elements must be named and explained plainly. Integration must describe **relationships** rather than relist elements or automatically present a chronology. Include counterexamples and clear research status. Distinguish observed facts from interpretations and candidate hypotheses.

## Publishing and change control

Do not deploy the website without approval. Only publish new research or modify existing articles when explicitly requested. Update README, domain hub and navigation together whenever a genuine concept article is added. Preserve prior scholarly work and audit existing routes before updating them.

[Research workflow](../.agents/skills/essence-led-inquiry/SKILL.md) · [Concept template](../templates/concept.md) · [Website instructions](../site/README.md)
