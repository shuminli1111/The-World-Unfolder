---
name: essence-led-inquiry
description: Understand what a concept fundamentally is, select fitting research methods, discover its key elements, and explain how their relationships form an integrated whole. Iteratively compare and choose the strongest coherent account at every step.
---

# Essence-Led Inquiry — V1.3

Discover the essence. Identify the elements. Understand the whole.

## Goal

Produce **one subject-specific integrated inquiry** into a concept, entity, practice, institution, process or historical phenomenon. The reader-facing report contains **exactly three top-level sections**: **The Essence → The Elements → The Whole**. This is different from The World Slicer, which offers alternative slicing perspectives.

## Inputs

- `object` (required); `inquiry` and `scope` (optional).
- `depth`: `sketch`, `standard` (default) or `deep`.
- `iterations`: meaningful candidate passes per internal choice, default **3**, usual range **2–5**.

Resolve ambiguity by stating a reasonable scope and distinguishing an object from the practices, institutions or disciplines associated with it.

## Four internal selection steps, three public sections

For **each** internal selection step: **generate → compare → select → carry forward**. Explore meaningfully different candidate accounts, test against subject-specific criteria and exceptions, then select the strongest coherent result. Revise earlier selections when later evidence undermines them. Do not print private candidate rounds, invented numerical scores or unverifiable claims of independent model runs.

1. **Essence selection (1A)** — compare candidate packages of Primary Nature, Higher-Level Category and Defining Essence for category accuracy, inheritance, distinctiveness, boundary fidelity and explanatory value.
2. **Research-method selection (1B)** — choose scholarly or well-grounded inquiry approaches suited to the selected kind of object, comparing fit, complementarity and what each reveals.
3. **Element selection (2)** — compare element-discovery methods *together with the elements they reveal* for subject fit, explanatory relevance, distinction of levels and appropriate coverage.
4. **Whole-model selection (3)** — compare integration methods *together with their models of actual relations* for explanatory coherence, subject fit, empirical plausibility and resistance to counterexamples.

### 01 · The Essence

**Central question:** What is it, fundamentally, and how are things of this nature investigated?

Include **Primary Nature** (what kind of thing it IS-A, not what it does), a short **Higher-Level Category** lineage with close-neighbour comparisons, and a **provisional Defining Essence** that helps explain characteristic features. Keep **IS-A**, **PART-OF**, **ROLE-IN** and **INTERACTS-WITH** distinct. Do not force a single unchanging essence where plural, disputed or evolving principles are better supported.

Within this same major section add **Research Methods for This Kind of Subject**, not as a separate main chapter. For each approach provide its name, guiding question and why it fits this subject's nature. These methods are **tools for knowing**, not parts of the subject itself. Avoid generic lists detached from actual scholarship.

### 02 · The Elements

**Central question:** What elements constitute or meaningfully shape the subject?

First select a **subject-specific element-discovery method**, stating its unit of analysis and why it fits. Then define the significant elements clearly. Distinguish constitutive parts, participants, conditions, mechanisms, and explanatory forces; not every factor belongs to the same analytic level. Explain each element's particular contribution, avoid a predetermined item count, and do not mistake an arbitrary checklist for the subject's architecture.

If an item is contextual rather than constitutive, identify it honestly. Elements may overlap or vary across times and cases.

### 03 · The Whole

**Central question:** How do the elements relate, and how does their configuration form a whole?

Select an **Integration Method** fitted to the elements and subject, rather than defaulting to chronology or a generic system diagram. Explain **Natural Architecture & Key Relationships**, then give a genuine **Integrated Understanding** showing how their relations account for the subject's properties, activity, change or meaning.

Include **Testing & Refinement**: compare neighbours and boundary cases, present counterexamples, adjust claims that fail, distinguish supported facts from interpretation and state research limitations. A short **Core Insight** is optional, not a substitute for explanation.

## Quality gates

- **Fidelity to the object:** the scope and primary category accurately describe this kind of thing.
- **Distinctive essence:** the central account distinguishes close neighbours without circular definition.
- **Methods fit the kind:** methods are established or justified and explanatory rather than fashionable.
- **Elements fit the subject:** each is clearly defined and matters; levels of analysis are not silently mixed.
- **Integration adds explanation:** dependencies and relationships explain the whole, not a repetition of the elements.
- **Epistemic humility:** uncertainty, competing accounts, boundary failures and unverified claims are visible.

Do not fabricate sources. The elegance of an explanation does not establish its factual truth.

## Repository publishing

Use [the concept template](../../../templates/concept.md) to save a completed inquiry as `domains/<domain>/<concept>.md`, and keep `domains/<domain>.md`, `README.md` and `navigation.json` coherent. Choose its domain as a navigation convenience, without predetermining its Primary Nature.

Default to **draft in conversation**. For repository changes, inspect current files; offer **preview**, **reviewable PR**, or **direct commit** only with explicit approval for the specific changes. Preserve authored content, never silently delete, do not claim the skill file is automatically installed into a ChatGPT account, and do not deploy the site without separate approval.

## Output template

See [the report scaffold](assets/output-template.md). Keep the final answer readable, concise, explanatory and responsive to the subject, not to a fixed quota.
