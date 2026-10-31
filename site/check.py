#!/usr/bin/env python3
"""Validate the World Unfolder's Markdown-first static site."""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
NAV = json.loads((ROOT / "navigation.json").read_text(encoding="utf-8"))
ISSUES = []

def slug(text):
    return re.sub(r"\s+", "-", re.sub(r"[^a-z0-9\u00c0-\uffff -]", "", text.lower().strip()))

def check_path(path, anchor=None):
    target = ROOT / path
    if not target.is_file():
        ISSUES.append(f"Missing Markdown: {path}")
        return
    if anchor:
        headings = {slug(h) for h in re.findall(r"^#{1,6}\s+(.+)$", target.read_text(encoding="utf-8"), re.M)}
        if anchor not in headings:
            ISSUES.append(f"Missing section: {path}#{anchor}")

def check_item(item):
    if item.get("path"):
        check_path(item["path"], item.get("anchor"))
    elif item.get("route"):
        ISSUES.append(f"Route without content: {item['route']}")
    for sub in item.get("items", []):
        check_item(sub)

for p in ["README.md","AGENTS.md","navigation.json","site/index.html","site/styles.css","site/app.js","site/README.md","templates/concept.md","templates/domain.md",".agents/skills/essence-led-inquiry/SKILL.md"]:
    if not (ROOT / p).is_file():
        ISSUES.append(f"Missing required file: {p}")

check_item(NAV["homepage"])
check_item(NAV["homepage"]["introduction"])
for group in NAV["homepage"]["sections"]:
    check_item(group)
    if not (ROOT / "domains" / f"{group['route'].lstrip('/')}.md").is_file():
        ISSUES.append(f"Missing domain hub: {group['label']}")
    if not (ROOT / "domains" / group["route"].lstrip("/")).is_dir():
        ISSUES.append(f"Missing domain folder: {group['label']}")

expected = ["01 · The Essence", "02 · The Elements", "03 · The Whole"]
templ = ROOT / "templates" / "concept.md"
if templ.is_file():
    actual = re.findall(r"^## (.+)$", templ.read_text(encoding="utf-8"), re.M)
    if actual != expected:
        ISSUES.append(f"Concept template headings differ: {actual}")

for p in (ROOT / "domains").glob("*/*.md"):
    actual = re.findall(r"^## (.+)$", p.read_text(encoding="utf-8"), re.M)
    if actual != expected:
        ISSUES.append(f"Incorrect sections in {p.relative_to(ROOT)}: {actual}")
    if p.as_posix() not in {str(ROOT / item.get("path", "")) for group in NAV["homepage"]["sections"] for item in group.get("items", []) if item.get("path")}:
        ISSUES.append(f"Unlisted published concept: {p.relative_to(ROOT)}")

if shutil.which("node"):
    result = subprocess.run(["node", "--check", str(SITE / "app.js")], capture_output=True, text=True)
    if result.returncode:
        ISSUES.append("JavaScript syntax: " + (result.stderr or result.stdout))

if ISSUES:
    for issue in ISSUES:
        print("FAIL", issue)
    raise SystemExit(1)
print(f"PASS: {len(NAV['homepage']['sections'])} domains, complete navigation targets, concept template, and site assets.")
