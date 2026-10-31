/* The World Unfolder — lightweight, dependency-free Markdown website.
 * Serve the repository root through an HTTP server and open /site/.
 * README.md and the domain Markdown files are the intellectual source of truth.
 * navigation.json supplies routes, titles and planned-vs-existing status.
 */
(function () {
  "use strict";

  const el = (id) => document.getElementById(id);
  const content = el("content");
  const sidebar = el("sidebar");
  const sidebarContent = el("sidebarContent");
  const backdrop = el("sidebarBackdrop");
  const menuButton = el("menuButton");
  const overlay = el("searchOverlay");
  const searchInput = el("searchInput");
  const resultsBox = el("searchResults");
  const cache = new Map();
  const expanded = new Set(["/on-unfolding-the-world"]);
  const routeToPath = new Map();
  const pathToRoute = new Map();
  const records = [];
  let navigation = null;
  let currentRoute = "/home";
  let searchResults = [];
  let selectedResult = 0;
  let previousFocus = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function slug(value) {
    return String(value).toLowerCase().trim().replace(/[^a-z0-9\u00c0-\uffff -]/g, "")
      .replace(/\s+/g, "-");
  }

  function normalise(path) {
    const out = [];
    for (const part of path.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") out.pop();
      else out.push(part);
    }
    return out.join("/");
  }

  function register(path, route, title, parent) {
    if (!path || !route || pathToRoute.has(path)) return;
    pathToRoute.set(path, route);
    routeToPath.set(route, path);
    records.push({ path: path, route: route, title: title, parent: parent || "" });
  }

  function buildRoutes(nav) {
    register("README.md", "/home", "The World Unfolder");
    const intro = nav.homepage.introduction;
    register(intro.path, intro.route, intro.label);
    for (const domain of nav.homepage.sections) {
      if (domain.path) register(domain.path, domain.route, domain.label);
      for (const child of domain.items || []) {
        if (child.path) register(child.path, child.route, child.label, domain.label);
      }
    }
  }

  function hrefFor(route, anchor) {
    return "#" + route + (anchor ? "?anchor=" + encodeURIComponent(anchor) : "");
  }

  function routeLink(markdownHref, currentFile) {
    const target = markdownHref.trim();
    if (/^(https?:\/\/|mailto:)/i.test(target)) return target;
    const split = target.split("#");
    const file = split[0];
    const anchor = split[1] || "";
    const base = currentFile.slice(0, currentFile.lastIndexOf("/") + 1);
    const resolved = file ? normalise(base + file) : currentFile;
    const route = pathToRoute.get(resolved);
    return route ? hrefFor(route, anchor) : "#/home";
  }

  function inline(value, currentFile) {
    const tokens = [];
    function hold(html) {
      tokens.push(html);
      return "ATLASHOLD" + (tokens.length - 1) + "END";
    }
    let s = String(value);
    s = s.replace(/\x60([^\x60]+)\x60/g, function (_, inner) {
      return hold("<code>" + esc(inner) + "</code>");
    });
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, target) {
      const url = routeLink(target, currentFile);
      const external = /^(https?:\/\/)/i.test(url);
      return hold("<a href=\"" + esc(url) + "\"" +
        (external ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "") +
        ">" + esc(label) + "</a>");
    });
    s = esc(s);
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
    return s.replace(/ATLASHOLD(\d+)END/g, function (_, index) {
      return tokens[Number(index)];
    });
  }

  function dropFrontmatter(text) {
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
  }

  function stripForSearch(text) {
    return dropFrontmatter(text)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_|]/g, "")
      .replace(/\s+/g, " ").trim();
  }

  function isBoundary(line) {
    return /^\s*(?:#{1,6}\s|[-*]\s|\d+\.\s|>\s|~~~|---\s*$|\|)/.test(line);
  }

  function renderMarkdown(markdown, currentFile) {
    const lines = dropFrontmatter(markdown).replace(/\r/g, "").split("\n");
    const parts = [];
    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line) { i++; continue; }

      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        const level = heading[1].length;
        const name = heading[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*\x60]/g, "");
        parts.push("<h" + level + " id=\"" + esc(slug(name)) + "\">" +
          inline(heading[2], currentFile) + "</h" + level + ">");
        i++; continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(line)) {
        parts.push("<hr>"); i++; continue;
      }

      if (/^\x60{3}/.test(line) || /^~~~/.test(line)) {
        const marker = line.slice(0, 3);
        i++; const code = [];
        while (i < lines.length && !lines[i].trim().startsWith(marker)) {
          code.push(lines[i++]);
        }
        i++;
        parts.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
        continue;
      }
      if (/^>\s?/.test(line)) {
        const quotes = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quotes.push(lines[i++].replace(/^\s*>\s?/, ""));
        }
        parts.push("<blockquote><p>" + inline(quotes.join(" "), currentFile) + "</p></blockquote>");
        continue;
      }

      if (/^\|/.test(line) && i + 1 < lines.length &&
          /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
        function cells(s) {
          return s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(x => x.trim());
        }
        const columns = cells(line);
        let table = "<table><thead><tr>" + columns.map(x => "<th>" + inline(x, currentFile) + "</th>").join("") + "</tr></thead><tbody>";
        i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          const data = cells(lines[i++]);
          table += "<tr>" + data.map(x => "<td>" + inline(x, currentFile) + "</td>").join("") + "</tr>";
        }
        parts.push(table + "</tbody></table>");
        continue;
      }

      const bullet = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(raw);
      if (bullet) {
        const ordered = /\d/.test(bullet[2]);
        let list = "<" + (ordered ? "ol" : "ul") + ">";
        while (i < lines.length) {
          const match = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(lines[i]);
          if (!match || /\d/.test(match[2]) !== ordered) break;
          const indent = match[1].length;
          if (indent > 0) {
            list += "<li>" + inline(match[3], currentFile) + "</li>";
            i++; continue;
          }
          list += "<li>" + inline(match[3], currentFile) + "</li>";
          i++;
        }
        parts.push(list + "</" + (ordered ? "ol" : "ul") + ">");
        continue;
      }

      const paragraph = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !isBoundary(lines[i].trim())) {
        paragraph.push(lines[i].trim());
        i++;
      }
      parts.push("<p>" + inline(paragraph.join(" "), currentFile) + "</p>");
    }
    return parts.join("\n");
  }

  function hashLocation() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, "") || "/home");
    const question = hash.indexOf("?");
    const route = question >= 0 ? hash.slice(0, question) : hash;
    const params = new URLSearchParams(question >= 0 ? hash.slice(question + 1) : "");
    return { route: route || "/home", anchor: params.get("anchor") || "" };
  }

  async function source(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch("../" + path).then(async response => {
        if (!response.ok) throw new Error("Could not load " + path);
        return await response.text();
      }).catch(error => {
        cache.delete(path);
        throw error;
      }));
    }
    return cache.get(path);
  }

  function sidebarEntry(title, route, extraClass) {
    const active = currentRoute === route;
    const classes = (extraClass || "side-link") + (active ? " active" : "");
    if (!route) return "<span class=\"" + classes + " planned\">" + esc(title) + "</span>";
    return "<a class=\"" + classes + "\" href=\"" + hrefFor(route) +
      "\"" + (active ? " aria-current=\"page\"" : "") + ">" + esc(title) + "</a>";
  }

  function sidebarChildren(items) {
    return "<div class=\"side-list\">" + (items || [])
      .map(child => sidebarEntry(child.label, child.route)).join("") + "</div>";
  }

  function buildSidebar() {
    const intro = navigation.homepage.introduction;
    let html = "<div class=\"sidebar-heading\">Explore</div>";
    html += sidebarEntry("Home", "/home", "side-home");
    const groups = [{label:intro.label,route:intro.route,items:[]}, ...navigation.homepage.sections];
    for (const item of groups) {
      const isCurrent = currentRoute === item.route ||
        (item.route && currentRoute.startsWith(item.route + "/"));
      if (isCurrent) expanded.add(item.route);
      const opened = expanded.has(item.route);
      html += "<div class=\"side-block\"><div class=\"side-group-header\">" +
        sidebarEntry(item.label, item.route, "side-parent");
      if (item.items && item.items.length) {
        html += "<button class=\"collapse-button\" type=\"button\" data-collapse=\"" +
          esc(item.route || item.label) + "\" aria-label=\"" +
          esc((opened ? "Collapse " : "Expand ") + item.label) +
          "\" aria-expanded=\"" + opened + "\"></button>";
      }
      html += "</div>";
      if (opened && item.items && item.items.length) html += sidebarChildren(item.items);
      html += "</div>";
    }
    sidebarContent.innerHTML = html;
  }

  function getBreadcrumb(route) {
    const parts = ["<a href=\"#/home\">Home</a>"];
    const sep = "<span class=\"sep\" aria-hidden=\"true\">/</span>";
    if (route === "/on-unfolding-the-world") {
      return parts.join("") + sep + "<span>On Unfolding Itself</span>";
    }
    const domain = navigation.homepage.sections.find(x => route === x.route ||
      (x.route && route.startsWith(x.route + "/")));
    if (domain) {
      const dLink = domain.path ? "<a href=\"" + hrefFor(domain.route) + "\">" +
        esc(domain.label) + "</a>" : esc(domain.label);
      if (route === domain.route) return parts.join("") + sep + "<span>" + esc(domain.label) + "</span>";
      const child = (domain.items || []).find(x => x.route === route);
      return parts.join("") + sep + dLink + sep + "<span>" + esc(child?.label || "") + "</span>";
    }
    return parts.join("");
  }

  function homeGroup(title, route, items) {
    const titleHtml = route ? "<a href=\"" + hrefFor(route) + "\">" + esc(title) + "</a>" : esc(title);
    let html = "<section class=\"home-group\"><h3>" + titleHtml + "</h3><ul>";
    for (const item of items) {
      if (item.path && item.route) {
        html += "<li><a href=\"" + hrefFor(item.route, item.anchor) + "\">" +
          esc(item.label) + "</a></li>";
      } else {
        html += "<li class=\"planned\">" + esc(item.label) + "</li>";
      }
    }
    return html + "</ul></section>";
  }

  function renderHome() {
    document.title = "The World Unfolder";
    const intro = navigation.homepage.introduction;
    const all = [intro, ...navigation.homepage.sections];
    const groups = all.map(section => homeGroup(section.label, section.route, section.items || [])).join("");
    el("tocContent").innerHTML = "";
    content.innerHTML =
      "<section class=\"homepage-header\">" +
      "<div class=\"home-hero-inner\"><h1>The World Unfolder</h1>" +
      "<p class=\"home-subtitle\">An exploration of what things are, what constitutes them, and how they form a whole.</p>" +
      "<button type=\"button\" class=\"home-search\" data-open-search=\"true\" aria-label=\"Search The World Unfolder\">" +
      "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"10.8\" cy=\"10.8\" r=\"6.6\"/><path d=\"m16 16 5 5\"/></svg>" +
      "<span>Search for anything...</span><kbd>/</kbd></button>" +
      "</div></section>" +
      "<section class=\"home-body\"><h2 class=\"home-section-title\">All domains</h2>" +
      "<div class=\"home-grid\">" + groups + "</div>" +
      "<hr class=\"home-divider\">" +
      "<div class=\"home-about\">Integrated inquiries into what things are, what constitutes them, " +
      "and how their parts relate to form a whole.</div></section>";
  }

  function renderToc() {
    const target = el("tocContent");
    const headings = [...content.querySelectorAll(".markdown h2")];
    if (!headings.length) { target.innerHTML = ""; return; }
    target.innerHTML = "<h2 class=\"toc-title\">On this page</h2><nav aria-label=\"On this page sections\">" +
      headings.map((node,index) => "<a class=\"toc-link" + (!index ? " active" : "") +
      "\" href=\"" + hrefFor(currentRoute,node.id) + "\" data-toc=\"" + esc(node.id) +
      "\">" + esc(node.textContent) + "</a>").join("") + "</nav>";
  }

  function updateTocActive() {
    const links = [...el("tocContent").querySelectorAll(".toc-link")];
    if (!links.length) return;
    const headings = [...content.querySelectorAll(".markdown h2")];
    let activeId = headings[0]?.id;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= 165) activeId = heading.id;
    }
    links.forEach(a => {
      const selected = a.dataset.toc === activeId;
      a.classList.toggle("active", selected);
      if (selected) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }

  async function renderArticle(route, anchor) {
    const path = routeToPath.get(route);
    if (!path) {
      content.innerHTML = "<p class=\"error\">This page is not available yet. <a href=\"#/home\">Return to the World Unfolder</a>.</p>";
      el("tocContent").innerHTML = "";
      return;
    }
    content.innerHTML = "<div class=\"loading\">Opening this article…</div>";
    el("tocContent").innerHTML = "";
    try {
      const markdown = await source(path);
      if (currentRoute !== route) return;
      const record = records.find(x => x.route === route);
      document.title = (record?.title || "Article") + " · The World Unfolder";
      content.innerHTML = "<div class=\"doc-page\"><nav class=\"breadcrumbs\" aria-label=\"Breadcrumb\">" +
        getBreadcrumb(route) + "</nav><article class=\"markdown\">" +
        renderMarkdown(markdown, path) + "</article></div>";
      renderToc();
      scrollToSection(anchor);
      requestAnimationFrame(updateTocActive);
    } catch (error) {
      content.innerHTML = "<p class=\"error\">Unable to open this article. " +
        "Serve the repository root with a local HTTP server to load Markdown files. " +
        "<a href=\"#/home\">Return home</a>.</p>";
    }
  }

  function scrollToSection(anchor) {
    if (!anchor) { window.scrollTo({ top: 0, behavior: "auto" }); return; }
    requestAnimationFrame(() => {
      const node = document.getElementById(anchor);
      if (node) node.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  function closeMobile() {
    sidebar.classList.remove("open");
    backdrop.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }

  function navigate() {
    const { route, anchor } = hashLocation();
    if (route === currentRoute && anchor && content.querySelector(".markdown")) {
      scrollToSection(anchor);
      requestAnimationFrame(updateTocActive);
      closeMobile();
      return;
    }
    currentRoute = route;
    document.body.classList.toggle("is-home", route === "/home");
    buildSidebar();
    closeMobile();
    if (route === "/home") {
      renderHome();
      scrollToSection("");
    } else {
      renderArticle(route, anchor);
    }
  }

  function openSearch() {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    searchInput.value = "";
    selectedResult = 0;
    showSearch();
    requestAnimationFrame(() => searchInput.focus());
  }

  function closeSearch() {
    overlay.hidden = true;
    if (previousFocus?.focus) previousFocus.focus();
  }

  async function buildSearchIndex() {
    await Promise.all(records.map(async item => {
      try {
        const raw = await source(item.path);
        item.searchText = stripForSearch(raw).toLowerCase();
        item.preview = stripForSearch(raw).slice(0, 230);
      } catch (_) {
        item.searchText = "";
        item.preview = "";
      }
    }));
    if (!overlay.hidden) showSearch();
  }

  function searchMatches(query) {
    if (!query) return records.slice(0, 10);
    const parts = query.toLowerCase().split(/\s+/).filter(Boolean);
    return records.map(item => {
      const title = (item.title + " " + item.parent).toLowerCase();
      const hay = item.searchText || "";
      if (!parts.every(x => title.includes(x) || hay.includes(x))) return null;
      let score = 0;
      for (const word of parts) {
        if (title.includes(word)) score += title.startsWith(word) ? 12 : 8;
        if (hay.includes(word)) score += 2;
      }
      return { ...item, score: score };
    }).filter(Boolean).sort((a,b) => b.score - a.score).slice(0, 12);
  }

  function showSearch() {
    const q = searchInput.value.trim();
    searchResults = searchMatches(q);
    selectedResult = Math.max(0, Math.min(selectedResult, searchResults.length - 1));
    if (!searchResults.length) {
      resultsBox.innerHTML = "<div class=\"search-empty\">No articles match this search.</div>";
      return;
    }
    resultsBox.innerHTML = searchResults.map((item,i) => {
      const text = item.preview || "Open article";
      return "<button type=\"button\" role=\"option\" aria-selected=\"" + (i === selectedResult) +
        "\" class=\"search-item" + (i === selectedResult ? " selected" : "") +
        "\" data-result=\"" + i + "\"><span class=\"search-item-title\">" + esc(item.title) +
        "</span><span class=\"search-item-path\">" +
        esc(item.parent ? item.parent + " / " + item.title : item.path) +
        "</span><span class=\"search-item-summary\">" +
        esc(text.slice(0, 145)) + (text.length > 145 ? "…" : "") + "</span></button>";
    }).join("");
  }

  function selectSearch(index) {
    const item = searchResults[index];
    if (!item) return;
    closeSearch();
    location.hash = hrefFor(item.route);
    if (currentRoute === item.route) navigate();
  }

  function events() {
    content.addEventListener("click", event => {
      if (event.target.closest("[data-open-search]")) openSearch();
    });
    window.addEventListener("scroll", updateTocActive, {passive:true});
    sidebarContent.addEventListener("click", event => {
      const toggle = event.target.closest("[data-collapse]");
      if (!toggle) return;
      const id = toggle.getAttribute("data-collapse");
      expanded.has(id) ? expanded.delete(id) : expanded.add(id);
      buildSidebar();
    });
    sidebarContent.addEventListener("click", event => {
      if (event.target.closest("a")) closeMobile();
    });
    menuButton.addEventListener("click", () => {
      const open = !sidebar.classList.contains("open");
      sidebar.classList.toggle("open", open);
      backdrop.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    backdrop.addEventListener("click", closeMobile);
    el("searchButton").addEventListener("click", openSearch);
    el("searchClose").addEventListener("click", closeSearch);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeSearch();
    });
    searchInput.addEventListener("input", () => {
      selectedResult = 0;
      showSearch();
    });
    resultsBox.addEventListener("click", event => {
      const choice = event.target.closest("[data-result]");
      if (choice) selectSearch(Number(choice.dataset.result));
    });
    document.addEventListener("keydown", event => {
      const modifier = navigator.platform?.toLowerCase().includes("mac") ? event.metaKey : event.ctrlKey;
      if ((modifier && event.key.toLowerCase() === "k") ||
        (event.key === "/" && overlay.hidden &&
          !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))) {
        event.preventDefault(); openSearch(); return;
      }
      if (event.key === "Escape") {
        if (!overlay.hidden) closeSearch();
        else closeMobile();
      }
      if (overlay.hidden) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedResult = Math.min(searchResults.length - 1, selectedResult + 1);
        showSearch();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedResult = Math.max(0, selectedResult - 1);
        showSearch();
      } else if (event.key === "Enter") {
        event.preventDefault(); selectSearch(selectedResult);
      }
    });
    window.addEventListener("hashchange", navigate);
  }

  async function start() {
    try {
      const response = await fetch("../navigation.json");
      if (!response.ok) throw new Error("Could not read navigation.json");
      navigation = await response.json();
      buildRoutes(navigation);
      events();
      if (!location.hash) location.hash = "#/home";
      navigate();
      buildSearchIndex();
    } catch (error) {
      content.innerHTML = "<p class=\"error\">The World Unfolder could not load. " +
        "Start a local HTTP server from the repository root and open /site/.</p>";
      console.error(error);
    }
  }
  start();
})();