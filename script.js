(function () {
  let defaults = window.PORTFOLIO_DEFAULTS || {};
  const CATEGORY_LABELS = {
    all: "All",
    "analog-ic": "Analog / IC",
    "digital-fpga": "Digital / FPGA",
    "pcb-hardware": "PCB / Hardware",
    "embedded-iot": "Embedded / IoT",
    "signal-processing": "Signal Processing",
    "sensors-instrumentation": "Sensors / Instrumentation",
    "robotics-control": "Robotics / Control",
    "rf-wireless": "RF / Wireless",
    "power-energy": "Power / Energy",
    "software-cpp": "Software / C++",
    "ai-ml": "AI / ML",
    silicon: "Analog / IC",
    fpga: "Digital / FPGA",
    pcb: "PCB / Hardware",
    embedded: "Embedded / IoT"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slug(value) {
    return String(value || "project")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project";
  }

  function initials(value) {
    return String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(part => part.charAt(0).toUpperCase())
      .join("") || "KMT";
  }

  function githubUsername(profile) {
    if (!profile || !profile.github) return "";
    const match = String(profile.github).match(/github\.com\/([^/?#]+)/i);
    return match ? match[1] : "";
  }

  function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    const units = [
      ["year", 31536000],
      ["month", 2592000],
      ["week", 604800],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60]
    ];
    for (const [name, secondsInUnit] of units) {
      const value = Math.floor(seconds / secondsInUnit);
      if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }

  function normalizeProject(project) {
    return {
      id: project.id || `${slug(project.title)}-${Date.now()}`,
      partNumber: project.partNumber || "",
      title: project.title || "Untitled project",
      category: project.category || "analog-ic",
      status: project.status || "Draft",
      stack: project.stack || "",
      summary: project.summary || project.oneLiner || "",
      details: project.details || "",
      image: project.image || "",
      imageAlt: project.imageAlt || `${project.title || "Project"} preview`,
      linkLabel: project.linkLabel || "",
      linkUrl: project.linkUrl || "",
      featured: Boolean(project.featured),
      tags: Array.isArray(project.tags) ? project.tags.filter(Boolean) : [],
      oneLiner: project.oneLiner || project.summary || "",
      overview: project.overview || project.details || "",
      role: project.role || "",
      specs: Array.isArray(project.specs)
        ? project.specs.filter(pair => Array.isArray(pair) && (pair[0] || pair[1]))
        : [],
      detail: Array.isArray(project.detail)
        ? project.detail.filter(item => item && (item.heading || item.body))
        : [],
      gallery: Array.isArray(project.gallery)
        ? project.gallery.filter(item => item && item.src)
        : [],
      skills: Array.isArray(project.skills) ? project.skills.filter(Boolean) : [],
      links: {
        github: (project.links && project.links.github) || "",
        report: (project.links && project.links.report) || "",
        demo: (project.links && project.links.demo) || ""
      }
    };
  }

  function splitList(value) {
    return String(value || "").split(",").map(part => part.trim()).filter(Boolean);
  }

  function normalizeExperience(item) {
    return {
      period: item.period || "",
      title: item.title || "Experience",
      tag: item.tag || "",
      place: item.place || "",
      badge: item.badge || "",
      summary: item.summary || "",
      details: item.details || "",
      highlights: Array.isArray(item.highlights) ? item.highlights.filter(Boolean) : [],
      image: item.image || "",
      imageAlt: item.imageAlt || `${item.title || "Experience"} image`
    };
  }

  function normalizeCertificate(item) {
    return {
      title: item.title || "Certificate",
      issuer: item.issuer || "",
      date: item.date || "",
      summary: item.summary || "",
      skills: Array.isArray(item.skills) ? item.skills.filter(Boolean) : [],
      image: item.image || "",
      imageAlt: item.imageAlt || `${item.title || "Certificate"} image`,
      linkLabel: item.linkLabel || "",
      linkUrl: item.linkUrl || ""
    };
  }

  function normalizeToolGroup(group) {
    return {
      group: group.group || group.title || "Tools",
      summary: group.summary || "",
      context: group.context || "",
      tools: Array.isArray(group.tools) ? group.tools.filter(Boolean) : []
    };
  }

  function normalizeSite(site) {
    const fallback = window.PORTFOLIO_DEFAULTS || {};
    return {
      profile: Object.assign({}, fallback.profile || {}, site.profile || {}),
      skills: Array.isArray(site.skills) ? site.skills : clone(fallback.skills || []),
      skillMap: Array.isArray(site.skillMap) ? site.skillMap : clone(fallback.skillMap || []),
      toolGroups: Array.isArray(site.toolGroups)
        ? site.toolGroups.map(normalizeToolGroup)
        : clone(fallback.toolGroups || []).map(normalizeToolGroup),
      projects: Array.isArray(site.projects) ? site.projects.map(normalizeProject) : defaultProjects(),
      experience: Array.isArray(site.experience)
        ? site.experience.map(normalizeExperience)
        : clone(fallback.experience || []).map(normalizeExperience),
      education: Array.isArray(site.education)
        ? site.education.map(normalizeExperience)
        : clone(fallback.education || []).map(normalizeExperience),
      certificates: Array.isArray(site.certificates)
        ? site.certificates.map(normalizeCertificate)
        : clone(fallback.certificates || []).map(normalizeCertificate)
    };
  }

  function defaultProjects() {
    return clone(defaults.projects || []).map(normalizeProject);
  }

  function getProjects() {
    return defaultProjects();
  }

  function placeholderSvg(project) {
    const label = CATEGORY_LABELS[project.category] || "Project";
    const colors = {
      "analog-ic": ["#153F4A", "#D8A23A"],
      "digital-fpga": ["#263A63", "#54B0A8"],
      "pcb-hardware": ["#28513B", "#D8A23A"],
      "embedded-iot": ["#4B315E", "#54B0A8"],
      "signal-processing": ["#28485E", "#9FCB68"],
      "sensors-instrumentation": ["#234C55", "#D2A747"],
      "robotics-control": ["#4A3D65", "#72B8A9"],
      "rf-wireless": ["#253F69", "#E0B348"],
      "power-energy": ["#5B3B26", "#E0B348"],
      "software-cpp": ["#263247", "#7DA1D6"],
      "ai-ml": ["#2F3B63", "#D56F7A"],
      silicon: ["#153F4A", "#D8A23A"],
      fpga: ["#263A63", "#54B0A8"],
      pcb: ["#28513B", "#D8A23A"],
      embedded: ["#4B315E", "#54B0A8"]
    };
    const palette = colors[project.category] || colors["analog-ic"];
    const text = escapeHtml(project.partNumber || label);
    const title = escapeHtml(label);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560">
        <rect width="960" height="560" fill="${palette[0]}"/>
        <g opacity="0.18" stroke="#ffffff" stroke-width="2">
          <path d="M80 120h800M80 220h800M80 320h800M80 420h800"/>
          <path d="M160 70v420M320 70v420M480 70v420M640 70v420M800 70v420"/>
        </g>
        <g fill="none" stroke="${palette[1]}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
          <path d="M120 350h90l48-150 65 260 70-300 60 190h95l42-90 50 90h200"/>
        </g>
        <rect x="80" y="70" width="800" height="420" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>
        <text x="96" y="116" fill="#ffffff" font-family="IBM Plex Mono, monospace" font-size="28">${text}</text>
        <text x="96" y="462" fill="${palette[1]}" font-family="IBM Plex Mono, monospace" font-size="22">${title.toUpperCase()}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function projectImage(project) {
    return project.image || placeholderSvg(project);
  }

  const THEME_KEY = "portfolio-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(stored || (prefersDark ? "dark" : "light"));

    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    });
  }

  const ENGINEER_TRIGGER = "engineer";
  const ENGINEER_KEY = "portfolio-engineer-mode";
  let engineerKeyBuffer = "";

  function ensureEngineerChrome() {
    if (document.querySelector(".engineer-scanlines")) return;

    const scanlines = document.createElement("div");
    scanlines.className = "engineer-scanlines";
    scanlines.setAttribute("aria-hidden", "true");
    document.body.appendChild(scanlines);

    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.className = "engineer-exit";
    exitButton.textContent = "Exit engineer mode";
    exitButton.addEventListener("click", () => setEngineerMode(false));
    document.body.appendChild(exitButton);
  }

  function playEngineerBootSequence() {
    const lines = [
      "[BOOT] initializing engineer mode...",
      "[ OK ] loading kaung.portfolio...",
      "[ OK ] mounting /dev/scope0",
      "[ OK ] firmware signature verified",
      "[READY] welcome, engineer."
    ];

    const overlay = document.createElement("div");
    overlay.className = "engineer-boot-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.addEventListener("click", () => overlay.remove());
    document.body.appendChild(overlay);

    let index = 0;
    function nextLine() {
      if (index >= lines.length) {
        setTimeout(() => overlay.remove(), 500);
        return;
      }
      const line = document.createElement("p");
      line.textContent = lines[index];
      overlay.appendChild(line);
      index += 1;
      setTimeout(nextLine, 220);
    }
    nextLine();
  }

  function setEngineerMode(active, options) {
    const silent = Boolean(options && options.silent);
    if (active && !silent) playEngineerBootSequence();
    document.documentElement.setAttribute("data-engineer-mode", String(active));
    localStorage.setItem(ENGINEER_KEY, String(active));
  }

  function initEngineerMode() {
    ensureEngineerChrome();

    if (localStorage.getItem(ENGINEER_KEY) === "true") {
      setEngineerMode(true, { silent: true });
    }

    document.addEventListener("keydown", event => {
      if (event.key.length !== 1) return;
      engineerKeyBuffer = (engineerKeyBuffer + event.key.toLowerCase()).slice(-ENGINEER_TRIGGER.length);
      if (engineerKeyBuffer === ENGINEER_TRIGGER) {
        const isActive = document.documentElement.getAttribute("data-engineer-mode") === "true";
        setEngineerMode(!isActive);
        engineerKeyBuffer = "";
      }
    });

    console.log("%cpsst... try typing \"engineer\" anywhere on this page.", "color:#156F78;font-family:monospace;font-size:12px;");
  }

  function setActivePage() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-page-link]").forEach(link => {
      const active = link.dataset.pageLink === page;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function renderFeaturedProjects() {
    const target = document.querySelector("[data-featured-projects]");
    if (!target) return;

    const featured = getProjects().filter(project => project.featured).slice(0, 3);
    const projects = featured.length ? featured : getProjects().slice(0, 3);
    target.innerHTML = projects.map(project => projectCard(project, true)).join("");
  }

  function projectDetailHref(project) {
    return `project.html?id=${encodeURIComponent(project.id)}`;
  }

  function projectCard(project, compact) {
    const details = compact ? escapeHtml(project.summary) : escapeHtml(project.overview || project.details || project.summary);
    const action = project.linkUrl && project.linkLabel
      ? `<a class="inline-link" href="${escapeHtml(project.linkUrl)}" target="_blank" rel="noopener">${escapeHtml(project.linkLabel)}</a>`
      : "";
    const detailHref = projectDetailHref(project);

    return `
      <article class="project-card" data-category="${escapeHtml(project.category)}" data-project-card="${escapeHtml(project.id)}">
        <a class="project-image-link" href="${detailHref}">
          <img class="project-image" src="${projectImage(project)}" alt="${escapeHtml(project.imageAlt || project.title)}">
        </a>
        <div class="project-card-body">
          <div class="project-meta">
            <span>${escapeHtml(project.partNumber)}</span>
            <span>${escapeHtml(CATEGORY_LABELS[project.category] || project.category)}</span>
          </div>
          <h2><a class="project-card-title-link" href="${detailHref}">${escapeHtml(project.title)}</a></h2>
          <p>${details}</p>
          <div class="project-card-foot">
            <span class="status-pill">${escapeHtml(project.status)}</span>
            ${action}
          </div>
        </div>
      </article>`;
  }

  function renderProjectGrid() {
    const target = document.querySelector("[data-project-grid]");
    if (!target) return;

    const projects = getProjects();
    target.innerHTML = projects.map(project => projectCard(project, false)).join("");

    const count = document.querySelector("[data-project-count]");
    const tabs = Array.from(document.querySelectorAll("[data-project-filter]"));

    function update(filter) {
      let visible = 0;
      document.querySelectorAll("[data-project-card]").forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `${visible} project${visible === 1 ? "" : "s"} shown`;
      tabs.forEach(tab => {
        const active = tab.dataset.projectFilter === filter;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
    }

    tabs.forEach(tab => {
      if (tab.dataset.filterWired) return;
      tab.dataset.filterWired = "true";
      tab.addEventListener("click", () => update(tab.dataset.projectFilter));
    });

    update("all");
  }

  function projectHeaderBand(project) {
    const tagsHtml = project.tags.map(tag => `<span class="tool-chip">${escapeHtml(tag)}</span>`).join("");
    const stackItems = splitList(project.stack);

    return `
      <section class="section section-compact project-detail-header">
        <div class="project-meta">
          <span>${escapeHtml(project.partNumber)}</span>
          <span>${escapeHtml(CATEGORY_LABELS[project.category] || project.category)}</span>
          ${tagsHtml}
          <span class="status-pill">${escapeHtml(project.status)}</span>
        </div>
        <h1>${escapeHtml(project.title)}</h1>
        ${project.oneLiner ? `<p class="lede">${escapeHtml(project.oneLiner)}</p>` : ""}
        ${stackItems.length ? `
          <div class="project-detail-stack">
            <span class="project-detail-label">Stack</span>
            <div class="tool-chip-grid">
              ${stackItems.map(item => `<span class="tool-chip">${escapeHtml(item)}</span>`).join("")}
            </div>
          </div>` : ""}
      </section>`;
  }

  function projectTextSection(heading, text) {
    if (!text) return "";
    return `
      <section class="section section-compact">
        <h2>${escapeHtml(heading)}</h2>
        <p class="project-section-text">${escapeHtml(text)}</p>
      </section>`;
  }

  function projectSpecsSection(specs) {
    if (!specs.length) return "";
    return `
      <section class="section section-compact">
        <h2>Key Specifications</h2>
        <div class="table-wrap">
          <table class="datasheet-table">
            <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
            <tbody>
              ${specs.map(([key, value]) => `<tr><td class="sym">${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function projectDetailSection(detail) {
    if (!detail.length) return "";
    return `
      <section class="section section-compact">
        <h2>Technical Detail</h2>
        <div class="detail-accordion">
          ${detail.map((item, index) => `
            <details class="detail-item"${index === 0 ? " open" : ""}>
              <summary>${escapeHtml(item.heading)}</summary>
              <p>${escapeHtml(item.body)}</p>
            </details>`).join("")}
        </div>
      </section>`;
  }

  function projectGallerySection(project) {
    const gallery = project.gallery.length
      ? project.gallery
      : (project.image ? [{ src: project.image, caption: project.imageAlt || "" }] : []);
    if (!gallery.length) return "";
    return `
      <section class="section section-compact">
        <h2>Gallery</h2>
        <div class="project-gallery-grid">
          ${gallery.map(item => `
            <figure class="project-gallery-item">
              <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption || project.title)}">
              ${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ""}
            </figure>`).join("")}
        </div>
      </section>`;
  }

  function projectSkillsSection(skills) {
    if (!skills.length) return "";
    return `
      <section class="section section-compact">
        <h2>Skills / Tools</h2>
        <div class="tool-chip-grid">
          ${skills.map(skill => `<span class="tool-chip">${escapeHtml(skill)}</span>`).join("")}
        </div>
      </section>`;
  }

  function projectLinksSection(project) {
    const buttons = [];
    if (project.links.github) buttons.push({ label: "GitHub", url: project.links.github });
    if (project.links.report) buttons.push({ label: "Report", url: project.links.report });
    if (project.links.demo) buttons.push({ label: "Demo", url: project.links.demo });
    if (!buttons.length && project.linkUrl && project.linkLabel) {
      buttons.push({ label: project.linkLabel, url: project.linkUrl });
    }
    if (!buttons.length) return "";
    return `
      <section class="section section-compact">
        <h2>Links</h2>
        <div class="hero-actions">
          ${buttons.map((btn, index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-ghost"}" href="${escapeHtml(btn.url)}" target="_blank" rel="noopener">${escapeHtml(btn.label)}</a>`).join("")}
        </div>
      </section>`;
  }

  function renderProjectDetail() {
    const target = document.querySelector("[data-project-detail]");
    if (!target) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const project = getProjects().find(item => item.id === id);

    if (!project) {
      target.innerHTML = `
        <section class="section">
          ${emptyState("Project not found", "This project may have been removed, or the link is out of date.")}
          <p style="margin-top: 14px;"><a class="inline-link" href="projects.html">Back to all projects</a></p>
        </section>`;
      return;
    }

    document.title = `${project.title} | Kaung Myat Tun`;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute("content", project.oneLiner || project.overview || project.summary || "");

    target.innerHTML = [
      projectHeaderBand(project),
      projectTextSection("Overview", project.overview),
      projectTextSection("My Role", project.role),
      projectSpecsSection(project.specs),
      projectDetailSection(project.detail),
      projectGallerySection(project),
      projectSkillsSection(project.skills),
      projectLinksSection(project)
    ].join("");
  }

  const PROJECT_CATEGORY_OPTIONS = [
    ["analog-ic", "Analog / IC"],
    ["digital-fpga", "Digital / FPGA"],
    ["pcb-hardware", "PCB / Hardware"],
    ["embedded-iot", "Embedded / IoT"],
    ["signal-processing", "Signal Processing"],
    ["sensors-instrumentation", "Sensors / Instrumentation"],
    ["robotics-control", "Robotics / Control"],
    ["rf-wireless", "RF / Wireless"],
    ["power-energy", "Power / Energy"],
    ["software-cpp", "Software / C++"],
    ["ai-ml", "AI / ML"]
  ];

  const OAUTH_BASE = "https://kaung-portfolio-auth.kaungmtun-austin.workers.dev";
  const GITHUB_API_BASE = "https://api.github.com";
  const GITHUB_REPO = "Austin-MgKaung/portfolio";
  const TOKEN_KEY = "portfolio-gh-token";
  const SITE_JSON_PATH = "content/site.json";
  const SKILLS_JSON_PATH = "content/skills.json";
  let projectEditActive = false;
  let skillEditActive = false;
  let cachedToken = localStorage.getItem(TOKEN_KEY) || null;
  let authPopup = null;
  let authListenerBound = false;

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str.replace(/\n/g, ""))));
  }

  function isLoggedIn() {
    return Boolean(cachedToken);
  }

  // Kept as a boolean-returning function (rather than renaming every call
  // site) since nothing outside this module needs the raw token itself.
  function currentIdentityUser() {
    return cachedToken;
  }

  function onAuthChange(handler) {
    document.addEventListener("portfolio-auth-change", handler);
  }

  function emitAuthChange() {
    document.dispatchEvent(new CustomEvent("portfolio-auth-change"));
  }

  function handleAuthMessage(event) {
    const data = event.data;
    if (typeof data !== "string") return;

    if (data === "authorizing:github") {
      // Handshake ping from the popup -- echo back so it learns our origin.
      if (event.source) event.source.postMessage("authorizing:github", event.origin);
      return;
    }

    if (data.indexOf("authorization:github:success:") === 0) {
      try {
        const payload = JSON.parse(data.slice("authorization:github:success:".length));
        cachedToken = payload.token;
        localStorage.setItem(TOKEN_KEY, cachedToken);
      } catch (error) {
        console.error("Failed to parse GitHub auth payload.", error);
      }
      if (authPopup) authPopup.close();
      authPopup = null;
      emitAuthChange();
    }
  }

  function login() {
    if (!authListenerBound) {
      window.addEventListener("message", handleAuthMessage);
      authListenerBound = true;
    }
    authPopup = window.open(`${OAUTH_BASE}/auth`, "portfolio-oauth", "width=600,height=700");
  }

  function logout() {
    cachedToken = null;
    localStorage.removeItem(TOKEN_KEY);
    emitAuthChange();
  }

  // No external widget script to wait for anymore -- kept as a named
  // function purely so the four editors below didn't all need rewiring.
  function onIdentityReady(callback) {
    callback();
  }

  function ensureAuthChrome() {
    const container = document.querySelector(".masthead-right");
    if (!container || document.querySelector("[data-auth-toggle]")) return;

    const loginButton = document.createElement("button");
    loginButton.type = "button";
    loginButton.className = "theme-toggle";
    loginButton.setAttribute("data-auth-login", "");
    loginButton.textContent = "Login";
    loginButton.hidden = true;
    loginButton.addEventListener("click", login);
    container.insertBefore(loginButton, container.firstChild);

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "theme-toggle";
    logoutButton.setAttribute("data-auth-toggle", "");
    logoutButton.textContent = "Logout";
    logoutButton.hidden = true;
    logoutButton.addEventListener("click", logout);
    container.insertBefore(logoutButton, container.firstChild);
  }

  function refreshAuthChrome() {
    const loginButton = document.querySelector("[data-auth-login]");
    const logoutButton = document.querySelector("[data-auth-toggle]");
    const loggedIn = isLoggedIn();
    if (loginButton) loginButton.hidden = loggedIn;
    if (logoutButton) logoutButton.hidden = !loggedIn;
  }

  function initIdentityChrome() {
    ensureAuthChrome();
    refreshAuthChrome();
    onAuthChange(refreshAuthChrome);
  }

  async function fetchJsonFromGitHub(path) {
    if (!cachedToken) throw new Error("Not logged in.");
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${path}?ref=main`, {
      headers: { Authorization: `token ${cachedToken}`, Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error(`Could not load ${path} (HTTP ${response.status}).`);
    const data = await response.json();
    return { sha: data.sha, json: JSON.parse(base64ToUtf8(data.content)) };
  }

  async function saveFieldToGitHub(path, fieldName, value, commitMessage) {
    if (!cachedToken) throw new Error("Not logged in.");
    const { sha, json } = await fetchJsonFromGitHub(path);
    const updated = Object.assign({}, json, { [fieldName]: value });
    const body = {
      message: commitMessage || `Update ${fieldName} via inline editor`,
      content: utf8ToBase64(JSON.stringify(updated, null, 2)),
      sha,
      branch: "main"
    };
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${cachedToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Save failed (HTTP ${response.status}). ${errorText}`);
    }
  }

  function saveSiteFieldToGateway(fieldName, value, commitMessage) {
    return saveFieldToGitHub(SITE_JSON_PATH, fieldName, value, commitMessage);
  }

  function saveSkillsFieldToGateway(fieldName, value, commitMessage) {
    return saveFieldToGitHub(SKILLS_JSON_PATH, fieldName, value, commitMessage);
  }

  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

  async function uploadImageToGitHub(file) {
    if (!cachedToken) throw new Error("Not logged in.");
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("Image is too large (max 8MB). Try a smaller file.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64Content = btoa(binary);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-") || "image";
    const path = `assets/uploads/${Date.now()}-${safeName}`;

    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${cachedToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Upload image via inline editor: ${safeName}`,
        content: base64Content,
        branch: "main"
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Image upload failed (HTTP ${response.status}). ${errorText}`);
    }

    return path;
  }

  function openCropModal(file, aspectRatio) {
    const ratio = aspectRatio || 1;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const overlay = document.createElement("div");
        overlay.className = "crop-modal-overlay";
        overlay.innerHTML = `
          <div class="crop-modal">
            <p class="crop-modal-hint">Click where the center of the photo should be, then confirm.</p>
            <div class="crop-modal-stage">
              <img class="crop-modal-image" src="${objectUrl}" alt="">
              <div class="crop-modal-frame"></div>
            </div>
            <div class="crop-modal-actions">
              <button type="button" class="btn btn-small btn-ghost" data-crop-cancel>Cancel</button>
              <button type="button" class="btn btn-small btn-primary" data-crop-confirm>Use this crop</button>
            </div>
          </div>`;
        document.body.appendChild(overlay);

        const stage = overlay.querySelector(".crop-modal-stage");
        const frame = overlay.querySelector(".crop-modal-frame");
        let centerX = 0.5;
        let centerY = 0.5;

        // The image is shown with object-fit: contain, so it may be
        // letterboxed inside the stage. All coordinates need to be
        // relative to the image's actual rendered rect, not the stage's.
        function imageRect() {
          const rect = stage.getBoundingClientRect();
          const stageRatio = rect.width / rect.height;
          const imgRatio = img.width / img.height;
          let width, height;
          if (imgRatio > stageRatio) {
            width = rect.width;
            height = rect.width / imgRatio;
          } else {
            height = rect.height;
            width = rect.height * imgRatio;
          }
          return {
            left: (rect.width - width) / 2,
            top: (rect.height - height) / 2,
            width,
            height
          };
        }

        function updateFrame() {
          const rect = imageRect();
          let frameWidth = rect.width;
          let frameHeight = frameWidth / ratio;
          if (frameHeight > rect.height) {
            frameHeight = rect.height;
            frameWidth = frameHeight * ratio;
          }
          frame.style.width = `${frameWidth}px`;
          frame.style.height = `${frameHeight}px`;
          frame.style.left = `${rect.left + centerX * rect.width - frameWidth / 2}px`;
          frame.style.top = `${rect.top + centerY * rect.height - frameHeight / 2}px`;
        }

        function cleanup() {
          URL.revokeObjectURL(objectUrl);
          overlay.remove();
          window.removeEventListener("resize", updateFrame);
        }

        stage.addEventListener("click", event => {
          const stageRect = stage.getBoundingClientRect();
          const rect = imageRect();
          const clickX = event.clientX - stageRect.left - rect.left;
          const clickY = event.clientY - stageRect.top - rect.top;
          centerX = Math.min(1, Math.max(0, clickX / rect.width));
          centerY = Math.min(1, Math.max(0, clickY / rect.height));
          updateFrame();
        });

        window.addEventListener("resize", updateFrame);
        requestAnimationFrame(updateFrame);

        overlay.querySelector("[data-crop-cancel]").addEventListener("click", () => {
          cleanup();
          reject(new Error("cancelled"));
        });

        overlay.querySelector("[data-crop-confirm]").addEventListener("click", () => {
          let cropWidth = img.width;
          let cropHeight = cropWidth / ratio;
          if (cropHeight > img.height) {
            cropHeight = img.height;
            cropWidth = cropHeight * ratio;
          }
          let sx = centerX * img.width - cropWidth / 2;
          let sy = centerY * img.height - cropHeight / 2;
          sx = Math.min(Math.max(sx, 0), img.width - cropWidth);
          sy = Math.min(Math.max(sy, 0), img.height - cropHeight);

          const canvas = document.createElement("canvas");
          canvas.width = cropWidth;
          canvas.height = cropHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
          canvas.toBlob(blob => {
            cleanup();
            if (!blob) {
              reject(new Error("Could not process image."));
              return;
            }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          }, "image/jpeg", 0.9);
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not load image."));
      };
      img.src = objectUrl;
    });
  }

  function imageUploadFieldHtml(value) {
    return `
      <label>Image
        <input type="text" data-field="image" value="${escapeHtml(value)}" placeholder="Paste a URL, or upload a file below">
      </label>
      <label>Upload image
        <input type="file" accept="image/*" data-image-upload>
      </label>
      <span class="upload-status" data-upload-status></span>`;
  }

  async function handleInlineImageUpload(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const card = fileInput.closest("[data-project-edit-card], [data-certificate-edit-card]");
    const targetField = card ? card.querySelector('[data-field="image"]') : null;
    const status = card ? card.querySelector("[data-upload-status]") : null;

    if (status) status.textContent = "Uploading...";
    try {
      const path = await uploadImageToGitHub(file);
      if (targetField) targetField.value = path;
      if (status) status.textContent = "Uploaded -- click Save to keep it.";
    } catch (error) {
      if (status) status.textContent = error.message || "Upload failed.";
    } finally {
      fileInput.value = "";
    }
  }

  async function handleGalleryImageUpload(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const row = fileInput.closest("[data-gallery-row]");
    const targetField = row ? row.querySelector("[data-gallery-src]") : null;
    const status = row ? row.querySelector("[data-upload-status]") : null;

    if (status) status.textContent = "Uploading...";
    try {
      const path = await uploadImageToGitHub(file);
      if (targetField) targetField.value = path;
      if (status) status.textContent = "Uploaded -- click Save to keep it.";
    } catch (error) {
      if (status) status.textContent = error.message || "Upload failed.";
    } finally {
      fileInput.value = "";
    }
  }

  function specRowHtml(key, value) {
    return `
      <div class="repeat-row" data-spec-row>
        <input type="text" data-spec-key value="${escapeHtml(key)}" placeholder="Parameter">
        <input type="text" data-spec-value value="${escapeHtml(value)}" placeholder="Value">
        <button type="button" class="repeat-row-remove" data-spec-remove aria-label="Remove spec row">&times;</button>
      </div>`;
  }

  function detailRowHtml(item) {
    return `
      <div class="repeat-row repeat-row-stacked" data-detail-row>
        <div class="repeat-row-head">
          <input type="text" data-detail-heading value="${escapeHtml(item.heading)}" placeholder="Heading">
          <button type="button" class="repeat-row-remove" data-detail-remove aria-label="Remove detail section">&times;</button>
        </div>
        <textarea data-detail-body placeholder="Body">${escapeHtml(item.body)}</textarea>
      </div>`;
  }

  function galleryRowHtml(item) {
    return `
      <div class="repeat-row repeat-row-stacked" data-gallery-row>
        <div class="repeat-row-head">
          <input type="text" data-gallery-src value="${escapeHtml(item.src)}" placeholder="Paste a URL, or upload a file below">
          <button type="button" class="repeat-row-remove" data-gallery-remove aria-label="Remove gallery image">&times;</button>
        </div>
        <input type="file" accept="image/*" data-gallery-upload>
        <span class="upload-status" data-upload-status></span>
        <input type="text" data-gallery-caption value="${escapeHtml(item.caption)}" placeholder="Caption">
      </div>`;
  }

  function blankProject() {
    return normalizeProject({
      id: `project-${Date.now()}`,
      title: "New project",
      category: "analog-ic",
      status: "Draft",
      summary: "Add a summary...",
      featured: false
    });
  }

  function categorySelectHtml(project) {
    return `
      <select class="project-category-select" data-field="category">
        ${PROJECT_CATEGORY_OPTIONS.map(([value, label]) =>
          `<option value="${value}" ${project.category === value ? "selected" : ""}>${escapeHtml(label)}</option>`
        ).join("")}
      </select>`;
  }

  function projectEditCard(project) {
    return `
      <article class="project-card project-card-editable" data-project-edit-card data-id="${escapeHtml(project.id)}">
        <button type="button" class="project-remove-btn" data-project-remove aria-label="Remove project">&times;</button>
        <img class="project-image" src="${projectImage(project)}" alt="${escapeHtml(project.imageAlt || project.title)}">
        <div class="project-card-body">
          <div class="project-meta">
            <span class="editable-field" contenteditable="true" data-field="partNumber">${escapeHtml(project.partNumber)}</span>
            ${categorySelectHtml(project)}
          </div>
          <h2 class="editable-field" contenteditable="true" data-field="title">${escapeHtml(project.title)}</h2>
          <p class="editable-field" contenteditable="true" data-field="summary">${escapeHtml(project.summary)}</p>
          <div class="project-card-foot">
            <span class="editable-field status-pill" contenteditable="true" data-field="status">${escapeHtml(project.status)}</span>
            <label class="project-featured-toggle">
              <input type="checkbox" data-field="featured" ${project.featured ? "checked" : ""}> Featured
            </label>
          </div>
          <details class="project-edit-extra">
            <summary>More fields</summary>
            <label>Stack <input type="text" data-field="stack" value="${escapeHtml(project.stack)}"></label>
            <label>Tags, comma separated <input type="text" data-field="tags" value="${escapeHtml(project.tags.join(", "))}"></label>
            <label>One-liner <input type="text" data-field="oneLiner" value="${escapeHtml(project.oneLiner)}"></label>
            <label>Overview <textarea data-field="overview">${escapeHtml(project.overview)}</textarea></label>
            <label>My role, leave blank to hide <textarea data-field="role">${escapeHtml(project.role)}</textarea></label>
            ${imageUploadFieldHtml(project.image)}
            <label>Image alt text <input type="text" data-field="imageAlt" value="${escapeHtml(project.imageAlt)}"></label>

            <div class="repeat-group">
              <span class="project-detail-label">Key specifications</span>
              <div data-specs-list>${project.specs.map(([key, value]) => specRowHtml(key, value)).join("")}</div>
              <button type="button" class="btn btn-small btn-ghost repeat-add-btn" data-spec-add>+ Add spec</button>
            </div>

            <div class="repeat-group">
              <span class="project-detail-label">Technical detail sections</span>
              <div data-detail-list>${project.detail.map(detailRowHtml).join("")}</div>
              <button type="button" class="btn btn-small btn-ghost repeat-add-btn" data-detail-add>+ Add section</button>
            </div>

            <div class="repeat-group">
              <span class="project-detail-label">Gallery</span>
              <div data-gallery-list>${project.gallery.map(galleryRowHtml).join("")}</div>
              <button type="button" class="btn btn-small btn-ghost repeat-add-btn" data-gallery-add>+ Add image</button>
            </div>

            <label>Skills / tools, comma separated <input type="text" data-field="skills" value="${escapeHtml(project.skills.join(", "))}"></label>

            <div class="repeat-group">
              <span class="project-detail-label">Links</span>
              <label>GitHub URL <input type="text" data-field="linksGithub" value="${escapeHtml(project.links.github)}"></label>
              <label>Report URL <input type="text" data-field="linksReport" value="${escapeHtml(project.links.report)}"></label>
              <label>Demo URL <input type="text" data-field="linksDemo" value="${escapeHtml(project.links.demo)}"></label>
              <label>Other link label <input type="text" data-field="linkLabel" value="${escapeHtml(project.linkLabel)}"></label>
              <label>Other link URL <input type="text" data-field="linkUrl" value="${escapeHtml(project.linkUrl)}"></label>
            </div>
          </details>
        </div>
      </article>`;
  }

  function collectEditedProjects() {
    const cards = Array.from(document.querySelectorAll("[data-project-edit-card]"));
    return cards.map(card => {
      const field = name => card.querySelector(`[data-field="${name}"]`);
      const text = name => {
        const el = field(name);
        return el ? el.textContent.trim() : "";
      };
      const value = name => {
        const el = field(name);
        return el ? el.value.trim() : "";
      };
      const specs = Array.from(card.querySelectorAll("[data-spec-row]")).map(row => [
        row.querySelector("[data-spec-key]")?.value.trim() || "",
        row.querySelector("[data-spec-value]")?.value.trim() || ""
      ]);
      const detail = Array.from(card.querySelectorAll("[data-detail-row]")).map(row => ({
        heading: row.querySelector("[data-detail-heading]")?.value.trim() || "",
        body: row.querySelector("[data-detail-body]")?.value.trim() || ""
      }));
      const gallery = Array.from(card.querySelectorAll("[data-gallery-row]")).map(row => ({
        src: row.querySelector("[data-gallery-src]")?.value.trim() || "",
        caption: row.querySelector("[data-gallery-caption]")?.value.trim() || ""
      }));

      return normalizeProject({
        id: card.dataset.id,
        partNumber: text("partNumber"),
        title: text("title"),
        category: value("category"),
        status: text("status"),
        stack: value("stack"),
        summary: text("summary"),
        image: value("image"),
        imageAlt: value("imageAlt"),
        linkLabel: value("linkLabel"),
        linkUrl: value("linkUrl"),
        featured: Boolean(field("featured") && field("featured").checked),
        tags: splitList(value("tags")),
        oneLiner: value("oneLiner"),
        overview: value("overview"),
        role: value("role"),
        specs,
        detail,
        gallery,
        skills: splitList(value("skills")),
        links: {
          github: value("linksGithub"),
          report: value("linksReport"),
          demo: value("linksDemo")
        }
      });
    });
  }

  function renderProjectEditGrid() {
    const target = document.querySelector("[data-project-grid]");
    if (!target) return;
    target.innerHTML = getProjects().map(projectEditCard).join("");
  }

  function setProjectEditStatus(message, isError) {
    const status = document.querySelector("[data-project-edit-status]");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function enterProjectEditMode() {
    projectEditActive = true;
    document.querySelector("[data-project-toolbar]")?.setAttribute("hidden", "");
    document.querySelector("[data-project-edit-bar]")?.removeAttribute("hidden");
    document.querySelector("[data-project-edit-entry]")?.setAttribute("hidden", "");
    setProjectEditStatus("Editing -- changes are not saved until you click Save.");
    renderProjectEditGrid();
  }

  function exitProjectEditMode() {
    projectEditActive = false;
    document.querySelector("[data-project-toolbar]")?.removeAttribute("hidden");
    document.querySelector("[data-project-edit-bar]")?.setAttribute("hidden", "");
    if (currentIdentityUser()) {
      document.querySelector("[data-project-edit-entry]")?.removeAttribute("hidden");
    }
    renderProjectGrid();
  }

  async function saveProjectEdits() {
    setProjectEditStatus("Saving...");
    try {
      const projects = collectEditedProjects();
      await saveSiteFieldToGateway("projects", projects, "Update projects via inline editor");
      defaults.projects = projects;
      setProjectEditStatus("Saved. Redeploying on GitHub Pages now -- live in a minute or so.");
      setTimeout(() => exitProjectEditMode(), 1200);
    } catch (error) {
      setProjectEditStatus(error.message || "Save failed.", true);
    }
  }

  function ensureProjectEditorChrome() {
    const toolbar = document.querySelector(".project-toolbar");
    if (!toolbar || document.querySelector("[data-project-edit-entry]")) return;
    toolbar.setAttribute("data-project-toolbar", "");

    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "btn btn-small btn-ghost project-edit-entry";
    entryButton.setAttribute("data-project-edit-entry", "");
    entryButton.textContent = "Edit projects";
    entryButton.hidden = true;
    entryButton.addEventListener("click", enterProjectEditMode);
    toolbar.insertAdjacentElement("beforebegin", entryButton);

    const bar = document.createElement("div");
    bar.className = "project-edit-bar";
    bar.setAttribute("data-project-edit-bar", "");
    bar.hidden = true;
    bar.innerHTML = `
      <span class="project-edit-status" data-project-edit-status></span>
      <div class="project-edit-actions">
        <button type="button" class="btn btn-small btn-ghost" data-project-add>+ Add project</button>
        <button type="button" class="btn btn-small btn-primary" data-project-save>Save changes</button>
        <button type="button" class="btn btn-small btn-ghost" data-project-exit-edit>Exit without saving</button>
      </div>`;
    toolbar.insertAdjacentElement("beforebegin", bar);

    bar.querySelector("[data-project-save]").addEventListener("click", saveProjectEdits);
    bar.querySelector("[data-project-exit-edit]").addEventListener("click", exitProjectEditMode);
    bar.querySelector("[data-project-add]").addEventListener("click", () => {
      const grid = document.querySelector("[data-project-grid]");
      if (!grid) return;
      grid.insertAdjacentHTML("afterbegin", projectEditCard(blankProject()));
      const newCard = grid.querySelector("[data-project-edit-card]");
      newCard.querySelector('[data-field="title"]')?.focus();
    });

    document.addEventListener("click", event => {
      if (event.target.closest("[data-project-remove]")) {
        event.target.closest("[data-project-edit-card]")?.remove();
        return;
      }
      if (event.target.closest("[data-spec-add]")) {
        event.target.closest("[data-project-edit-card]")?.querySelector("[data-specs-list]")
          .insertAdjacentHTML("beforeend", specRowHtml("", ""));
        return;
      }
      if (event.target.closest("[data-spec-remove]")) {
        event.target.closest("[data-spec-row]")?.remove();
        return;
      }
      if (event.target.closest("[data-detail-add]")) {
        event.target.closest("[data-project-edit-card]")?.querySelector("[data-detail-list]")
          .insertAdjacentHTML("beforeend", detailRowHtml({ heading: "", body: "" }));
        return;
      }
      if (event.target.closest("[data-detail-remove]")) {
        event.target.closest("[data-detail-row]")?.remove();
        return;
      }
      if (event.target.closest("[data-gallery-add]")) {
        event.target.closest("[data-project-edit-card]")?.querySelector("[data-gallery-list]")
          .insertAdjacentHTML("beforeend", galleryRowHtml({ src: "", caption: "" }));
        return;
      }
      if (event.target.closest("[data-gallery-remove]")) {
        event.target.closest("[data-gallery-row]")?.remove();
      }
    });

    document.addEventListener("change", event => {
      if (event.target.matches("[data-project-edit-card] [data-image-upload]")) {
        handleInlineImageUpload(event.target);
      }
      if (event.target.matches("[data-project-edit-card] [data-gallery-upload]")) {
        handleGalleryImageUpload(event.target);
      }
    });
  }

  function initProjectEditor() {
    if (!document.querySelector("[data-project-grid]")) return;

    function refreshEntryVisibility() {
      const entry = document.querySelector("[data-project-edit-entry]");
      if (!entry || projectEditActive) return;
      entry.hidden = !currentIdentityUser();
    }

    onIdentityReady(() => {
      ensureProjectEditorChrome();
      refreshEntryVisibility();
      onAuthChange(() => {
        if (!isLoggedIn() && projectEditActive) exitProjectEditMode();
        refreshEntryVisibility();
      });
    });
  }

  let certificateEditActive = false;

  function blankCertificate() {
    return normalizeCertificate({
      title: "New certificate",
      issuer: "",
      date: "",
      summary: "Add a summary..."
    });
  }

  function certificateEditCard(cert) {
    const image = cert.image
      ? `<img class="certificate-image" src="${escapeHtml(cert.image)}" alt="${escapeHtml(cert.imageAlt || cert.title)}">`
      : `<div class="certificate-placeholder">Certificate</div>`;

    return `
      <article class="certificate-card project-card-editable" data-certificate-edit-card>
        <button type="button" class="project-remove-btn" data-certificate-remove aria-label="Remove certificate">&times;</button>
        ${image}
        <div class="certificate-body">
          <div class="certificate-meta">
            <span class="editable-field" contenteditable="true" data-field="issuer">${escapeHtml(cert.issuer)}</span>
            <span class="editable-field" contenteditable="true" data-field="date">${escapeHtml(cert.date)}</span>
          </div>
          <h2 class="editable-field" contenteditable="true" data-field="title">${escapeHtml(cert.title)}</h2>
          <p class="editable-field" contenteditable="true" data-field="summary">${escapeHtml(cert.summary)}</p>
          <details class="project-edit-extra">
            <summary>More fields</summary>
            <label>Related skills (comma separated) <input type="text" data-field="skillsCsv" value="${escapeHtml(cert.skills.join(", "))}"></label>
            ${imageUploadFieldHtml(cert.image)}
            <label>Image alt text <input type="text" data-field="imageAlt" value="${escapeHtml(cert.imageAlt)}"></label>
            <label>Link label <input type="text" data-field="linkLabel" value="${escapeHtml(cert.linkLabel)}"></label>
            <label>Link URL <input type="text" data-field="linkUrl" value="${escapeHtml(cert.linkUrl)}"></label>
          </details>
        </div>
      </article>`;
  }

  function collectEditedCertificates() {
    const cards = Array.from(document.querySelectorAll("[data-certificate-edit-card]"));
    return cards.map(card => {
      const field = name => card.querySelector(`[data-field="${name}"]`);
      const text = name => {
        const el = field(name);
        return el ? el.textContent.trim() : "";
      };
      const value = name => {
        const el = field(name);
        return el ? el.value.trim() : "";
      };
      const skillsCsv = value("skillsCsv");
      return normalizeCertificate({
        title: text("title"),
        issuer: text("issuer"),
        date: text("date"),
        summary: text("summary"),
        skills: skillsCsv ? skillsCsv.split(",").map(item => item.trim()).filter(Boolean) : [],
        image: value("image"),
        imageAlt: value("imageAlt"),
        linkLabel: value("linkLabel"),
        linkUrl: value("linkUrl")
      });
    });
  }

  function renderCertificateEditGrid() {
    const target = document.querySelector("[data-certificates-list]");
    if (!target) return;
    const certificates = (defaults.certificates || []).map(normalizeCertificate);
    target.innerHTML = certificates.length
      ? certificates.map(certificateEditCard).join("")
      : "";
  }

  function setCertificateEditStatus(message, isError) {
    const status = document.querySelector("[data-certificate-edit-status]");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function enterCertificateEditMode() {
    certificateEditActive = true;
    document.querySelector("[data-certificate-edit-bar]")?.removeAttribute("hidden");
    document.querySelector("[data-certificate-edit-entry]")?.setAttribute("hidden", "");
    setCertificateEditStatus("Editing -- changes are not saved until you click Save.");
    renderCertificateEditGrid();
  }

  function exitCertificateEditMode() {
    certificateEditActive = false;
    document.querySelector("[data-certificate-edit-bar]")?.setAttribute("hidden", "");
    if (currentIdentityUser()) {
      document.querySelector("[data-certificate-edit-entry]")?.removeAttribute("hidden");
    }
    renderCertificates();
  }

  async function saveCertificateEdits() {
    setCertificateEditStatus("Saving...");
    try {
      const certificates = collectEditedCertificates();
      await saveSiteFieldToGateway("certificates", certificates, "Update certificates via inline editor");
      defaults.certificates = certificates;
      setCertificateEditStatus("Saved. Redeploying on GitHub Pages now -- live in a minute or so.");
      setTimeout(() => exitCertificateEditMode(), 1200);
    } catch (error) {
      setCertificateEditStatus(error.message || "Save failed.", true);
    }
  }

  function ensureCertificateEditorChrome() {
    const list = document.querySelector("[data-certificates-list]");
    if (!list || document.querySelector("[data-certificate-edit-entry]")) return;

    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "btn btn-small btn-ghost project-edit-entry";
    entryButton.setAttribute("data-certificate-edit-entry", "");
    entryButton.textContent = "Edit certificates";
    entryButton.hidden = true;
    entryButton.addEventListener("click", enterCertificateEditMode);
    list.insertAdjacentElement("beforebegin", entryButton);

    const bar = document.createElement("div");
    bar.className = "project-edit-bar";
    bar.setAttribute("data-certificate-edit-bar", "");
    bar.hidden = true;
    bar.innerHTML = `
      <span class="project-edit-status" data-certificate-edit-status></span>
      <div class="project-edit-actions">
        <button type="button" class="btn btn-small btn-ghost" data-certificate-add>+ Add certificate</button>
        <button type="button" class="btn btn-small btn-primary" data-certificate-save>Save changes</button>
        <button type="button" class="btn btn-small btn-ghost" data-certificate-exit-edit>Exit without saving</button>
      </div>`;
    list.insertAdjacentElement("beforebegin", bar);

    bar.querySelector("[data-certificate-save]").addEventListener("click", saveCertificateEdits);
    bar.querySelector("[data-certificate-exit-edit]").addEventListener("click", exitCertificateEditMode);
    bar.querySelector("[data-certificate-add]").addEventListener("click", () => {
      const grid = document.querySelector("[data-certificates-list]");
      if (!grid) return;
      grid.insertAdjacentHTML("afterbegin", certificateEditCard(blankCertificate()));
      const newCard = grid.querySelector("[data-certificate-edit-card]");
      newCard.querySelector('[data-field="title"]')?.focus();
    });

    document.addEventListener("click", event => {
      if (event.target.closest("[data-certificate-remove]")) {
        event.target.closest("[data-certificate-edit-card]")?.remove();
      }
    });

    document.addEventListener("change", event => {
      if (event.target.matches("[data-certificate-edit-card] [data-image-upload]")) {
        handleInlineImageUpload(event.target);
      }
    });
  }

  function initCertificateEditor() {
    if (!document.querySelector("[data-certificates-list]")) return;

    function refreshEntryVisibility() {
      const entry = document.querySelector("[data-certificate-edit-entry]");
      if (!entry || certificateEditActive) return;
      entry.hidden = !currentIdentityUser();
    }

    onIdentityReady(() => {
      ensureCertificateEditorChrome();
      refreshEntryVisibility();
      onAuthChange(() => {
        if (!isLoggedIn() && certificateEditActive) exitCertificateEditMode();
        refreshEntryVisibility();
      });
    });
  }

  function editableSkillMeterHtml(level) {
    const value = skillLevel(level);
    return `
      <div class="skill-meter skill-meter-editable" data-skill-level="${value}">
        ${[1, 2, 3, 4, 5].map(step => `<span class="${step <= value ? "filled" : ""}" data-level-step="${step}"></span>`).join("")}
      </div>`;
  }

  function skillItemEditRow(item) {
    return `
      <li class="skill-item-edit">
        <span class="editable-field" contenteditable="true" data-skill-item>${escapeHtml(item)}</span>
        <button type="button" class="skill-item-remove" data-skill-item-remove aria-label="Remove item">&times;</button>
      </li>`;
  }

  function blankSkill() {
    return { group: "New skill line", summary: "Add a summary...", level: 3, focus: "Growing line", items: [] };
  }

  function skillEditCard(skill) {
    return `
      <article class="skill-card skill-card-editable" data-skill-edit-card>
        <button type="button" class="project-remove-btn" data-skill-remove aria-label="Remove skill group">&times;</button>
        <div class="skill-card-head">
          <div>
            <span class="editable-field feature-tag" contenteditable="true" data-field="focus">${escapeHtml(skill.focus || "")}</span>
            <h2 class="editable-field" contenteditable="true" data-field="group">${escapeHtml(skillTitle(skill))}</h2>
          </div>
          ${editableSkillMeterHtml(skill.level)}
        </div>
        <p class="editable-field" contenteditable="true" data-field="summary">${escapeHtml(skillSummary(skill))}</p>
        <ul class="skill-list-edit" data-skill-items>
          ${skillItems(skill).map(skillItemEditRow).join("")}
        </ul>
        <button type="button" class="btn btn-small btn-ghost" data-skill-item-add>+ Add technology</button>
      </article>`;
  }

  function collectEditedSkills() {
    const cards = Array.from(document.querySelectorAll("[data-skill-edit-card]"));
    return cards.map(card => {
      const field = name => card.querySelector(`[data-field="${name}"]`);
      const text = name => {
        const el = field(name);
        return el ? el.textContent.trim() : "";
      };
      const meter = card.querySelector(".skill-meter-editable");
      const level = meter ? Number(meter.dataset.skillLevel) || 0 : 0;
      const items = Array.from(card.querySelectorAll("[data-skill-item]"))
        .map(el => el.textContent.trim())
        .filter(Boolean);
      return {
        group: text("group") || "New skill line",
        summary: text("summary"),
        level: skillLevel(level),
        focus: text("focus"),
        items
      };
    });
  }

  function renderSkillEditGrid() {
    const target = document.querySelector("[data-skill-groups]");
    if (!target) return;
    target.innerHTML = (defaults.skills || []).map(skillEditCard).join("");
  }

  function setSkillEditStatus(message, isError) {
    const status = document.querySelector("[data-skill-edit-status]");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function enterSkillEditMode() {
    skillEditActive = true;
    document.querySelector("[data-skill-edit-bar]")?.removeAttribute("hidden");
    document.querySelector("[data-skill-edit-entry]")?.setAttribute("hidden", "");
    setSkillEditStatus("Editing -- the Skill Map radar updates from this automatically. Not saved until you click Save.");
    renderSkillEditGrid();
  }

  function exitSkillEditMode() {
    skillEditActive = false;
    document.querySelector("[data-skill-edit-bar]")?.setAttribute("hidden", "");
    if (currentIdentityUser()) {
      document.querySelector("[data-skill-edit-entry]")?.removeAttribute("hidden");
    }
    renderSkills();
  }

  async function saveSkillEdits() {
    setSkillEditStatus("Saving...");
    try {
      const skills = collectEditedSkills();
      await saveSkillsFieldToGateway("skills", skills, "Update skill lines via inline editor");
      defaults.skills = skills;
      setSkillEditStatus("Saved. Redeploying on GitHub Pages now -- live in a minute or so.");
      setTimeout(() => exitSkillEditMode(), 1200);
    } catch (error) {
      setSkillEditStatus(error.message || "Save failed.", true);
    }
  }

  function ensureSkillEditorChrome() {
    const groups = document.querySelector("[data-skill-groups]");
    if (!groups || document.querySelector("[data-skill-edit-entry]")) return;

    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "btn btn-small btn-ghost project-edit-entry";
    entryButton.setAttribute("data-skill-edit-entry", "");
    entryButton.textContent = "Edit skill lines";
    entryButton.hidden = true;
    entryButton.addEventListener("click", enterSkillEditMode);
    groups.insertAdjacentElement("beforebegin", entryButton);

    const bar = document.createElement("div");
    bar.className = "project-edit-bar";
    bar.setAttribute("data-skill-edit-bar", "");
    bar.hidden = true;
    bar.innerHTML = `
      <span class="project-edit-status" data-skill-edit-status></span>
      <div class="project-edit-actions">
        <button type="button" class="btn btn-small btn-ghost" data-skill-group-add>+ Add skill group</button>
        <button type="button" class="btn btn-small btn-primary" data-skill-save>Save changes</button>
        <button type="button" class="btn btn-small btn-ghost" data-skill-exit-edit>Exit without saving</button>
      </div>`;
    groups.insertAdjacentElement("beforebegin", bar);

    bar.querySelector("[data-skill-save]").addEventListener("click", saveSkillEdits);
    bar.querySelector("[data-skill-exit-edit]").addEventListener("click", exitSkillEditMode);
    bar.querySelector("[data-skill-group-add]").addEventListener("click", () => {
      groups.insertAdjacentHTML("afterbegin", skillEditCard(blankSkill()));
      const newCard = groups.querySelector("[data-skill-edit-card]");
      newCard.querySelector('[data-field="group"]')?.focus();
    });

    document.addEventListener("click", event => {
      if (event.target.closest("[data-skill-remove]")) {
        event.target.closest("[data-skill-edit-card]")?.remove();
        return;
      }
      if (event.target.closest("[data-skill-item-remove]")) {
        event.target.closest(".skill-item-edit")?.remove();
        return;
      }
      if (event.target.closest("[data-skill-item-add]")) {
        const card = event.target.closest("[data-skill-edit-card]");
        const list = card?.querySelector("[data-skill-items]");
        if (!list) return;
        list.insertAdjacentHTML("beforeend", skillItemEditRow(""));
        list.lastElementChild.querySelector("[data-skill-item]")?.focus();
        return;
      }
      const step = event.target.closest("[data-level-step]");
      if (step) {
        const meter = step.closest(".skill-meter-editable");
        if (!meter) return;
        const value = Number(step.dataset.levelStep);
        meter.dataset.skillLevel = String(value);
        Array.from(meter.children).forEach(span => {
          span.classList.toggle("filled", Number(span.dataset.levelStep) <= value);
        });
      }
    });
  }

  function initSkillEditor() {
    if (!document.querySelector("[data-skill-groups]")) return;

    function refreshEntryVisibility() {
      const entry = document.querySelector("[data-skill-edit-entry]");
      if (!entry || skillEditActive) return;
      entry.hidden = !currentIdentityUser();
    }

    onIdentityReady(() => {
      ensureSkillEditorChrome();
      refreshEntryVisibility();
      onAuthChange(() => {
        if (!isLoggedIn() && skillEditActive) exitSkillEditMode();
        refreshEntryVisibility();
      });
    });
  }

  let toolEditActive = false;

  function toolChipEditHtml(tool) {
    return `
      <span class="tool-chip tool-chip-editable">
        <span class="editable-field" contenteditable="true" data-tool-chip>${escapeHtml(tool)}</span>
        <button type="button" class="tool-chip-remove" data-tool-chip-remove aria-label="Remove tool">&times;</button>
      </span>`;
  }

  function blankToolGroup() {
    return normalizeToolGroup({ group: "New category", summary: "Add a summary...", context: "", tools: [] });
  }

  function toolGroupEditCard(group) {
    return `
      <article class="toolkit-panel toolkit-panel-editable" data-tool-edit-card>
        <button type="button" class="project-remove-btn" data-tool-group-remove aria-label="Remove tool category">&times;</button>
        <div class="toolkit-copy">
          <h2 class="editable-field" contenteditable="true" data-field="group">${escapeHtml(group.group)}</h2>
          <p class="editable-field" contenteditable="true" data-field="summary">${escapeHtml(group.summary)}</p>
          <p class="editable-field toolkit-context" contenteditable="true" data-field="context">${escapeHtml(group.context)}</p>
        </div>
        <div class="tool-chip-grid" data-tool-chip-list>
          ${group.tools.map(toolChipEditHtml).join("")}
        </div>
        <button type="button" class="btn btn-small btn-ghost" data-tool-chip-add>+ Add tool</button>
      </article>`;
  }

  function collectEditedToolGroups() {
    const cards = Array.from(document.querySelectorAll("[data-tool-edit-card]"));
    return cards.map(card => {
      const field = name => card.querySelector(`[data-field="${name}"]`);
      const text = name => {
        const el = field(name);
        return el ? el.textContent.trim() : "";
      };
      const tools = Array.from(card.querySelectorAll("[data-tool-chip]"))
        .map(el => el.textContent.trim())
        .filter(Boolean);
      return normalizeToolGroup({
        group: text("group") || "New category",
        summary: text("summary"),
        context: text("context"),
        tools
      });
    });
  }

  function renderToolGroupEditGrid() {
    const target = document.querySelector("[data-toolkit]");
    if (!target) return;
    const groups = (defaults.toolGroups || []).map(normalizeToolGroup);
    target.innerHTML = `<div class="toolkit-edit-list">${groups.map(toolGroupEditCard).join("")}</div>`;
  }

  function setToolEditStatus(message, isError) {
    const status = document.querySelector("[data-tool-edit-status]");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function enterToolGroupEditMode() {
    toolEditActive = true;
    document.querySelector("[data-tool-edit-bar]")?.removeAttribute("hidden");
    document.querySelector("[data-tool-edit-entry]")?.setAttribute("hidden", "");
    setToolEditStatus("Editing -- changes are not saved until you click Save.");
    renderToolGroupEditGrid();
  }

  function exitToolGroupEditMode() {
    toolEditActive = false;
    document.querySelector("[data-tool-edit-bar]")?.setAttribute("hidden", "");
    if (currentIdentityUser()) {
      document.querySelector("[data-tool-edit-entry]")?.removeAttribute("hidden");
    }
    renderToolGroups();
  }

  async function saveToolGroupEdits() {
    setToolEditStatus("Saving...");
    try {
      const toolGroups = collectEditedToolGroups();
      await saveSkillsFieldToGateway("toolGroups", toolGroups, "Update tools & technologies via inline editor");
      defaults.toolGroups = toolGroups;
      setToolEditStatus("Saved. Redeploying on GitHub Pages now -- live in a minute or so.");
      setTimeout(() => exitToolGroupEditMode(), 1200);
    } catch (error) {
      setToolEditStatus(error.message || "Save failed.", true);
    }
  }

  function ensureToolGroupEditorChrome() {
    const toolkit = document.querySelector("[data-toolkit]");
    if (!toolkit || document.querySelector("[data-tool-edit-entry]")) return;

    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "btn btn-small btn-ghost project-edit-entry";
    entryButton.setAttribute("data-tool-edit-entry", "");
    entryButton.textContent = "Edit tools & technologies";
    entryButton.hidden = true;
    entryButton.addEventListener("click", enterToolGroupEditMode);
    toolkit.insertAdjacentElement("beforebegin", entryButton);

    const bar = document.createElement("div");
    bar.className = "project-edit-bar";
    bar.setAttribute("data-tool-edit-bar", "");
    bar.hidden = true;
    bar.innerHTML = `
      <span class="project-edit-status" data-tool-edit-status></span>
      <div class="project-edit-actions">
        <button type="button" class="btn btn-small btn-ghost" data-tool-group-add>+ Add category</button>
        <button type="button" class="btn btn-small btn-primary" data-tool-save>Save changes</button>
        <button type="button" class="btn btn-small btn-ghost" data-tool-exit-edit>Exit without saving</button>
      </div>`;
    toolkit.insertAdjacentElement("beforebegin", bar);

    bar.querySelector("[data-tool-save]").addEventListener("click", saveToolGroupEdits);
    bar.querySelector("[data-tool-exit-edit]").addEventListener("click", exitToolGroupEditMode);
    bar.querySelector("[data-tool-group-add]").addEventListener("click", () => {
      const list = document.querySelector(".toolkit-edit-list");
      if (!list) return;
      list.insertAdjacentHTML("afterbegin", toolGroupEditCard(blankToolGroup()));
      const newCard = list.querySelector("[data-tool-edit-card]");
      newCard.querySelector('[data-field="group"]')?.focus();
    });

    document.addEventListener("click", event => {
      if (event.target.closest("[data-tool-group-remove]")) {
        event.target.closest("[data-tool-edit-card]")?.remove();
        return;
      }
      if (event.target.closest("[data-tool-chip-remove]")) {
        event.target.closest(".tool-chip-editable")?.remove();
        return;
      }
      if (event.target.closest("[data-tool-chip-add]")) {
        const card = event.target.closest("[data-tool-edit-card]");
        const list = card?.querySelector("[data-tool-chip-list]");
        if (!list) return;
        list.insertAdjacentHTML("beforeend", toolChipEditHtml(""));
        list.lastElementChild.querySelector("[data-tool-chip]")?.focus();
        return;
      }
    });
  }

  function initToolGroupEditor() {
    if (!document.querySelector("[data-toolkit]")) return;

    function refreshEntryVisibility() {
      const entry = document.querySelector("[data-tool-edit-entry]");
      if (!entry || toolEditActive) return;
      entry.hidden = !currentIdentityUser();
    }

    onIdentityReady(() => {
      ensureToolGroupEditorChrome();
      refreshEntryVisibility();
      onAuthChange(() => {
        if (!isLoggedIn() && toolEditActive) exitToolGroupEditMode();
        refreshEntryVisibility();
      });
    });
  }

  function initProfilePhotoUploadControl(buttonSelector, inputSelector, statusSelector, fieldName, commitMessage, aspectRatio) {
    const button = document.querySelector(buttonSelector);
    const input = document.querySelector(inputSelector);
    const status = document.querySelector(statusSelector);
    if (!button || !input) return;

    function refreshVisibility() {
      button.hidden = !isLoggedIn();
    }

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const croppedFile = await openCropModal(file, aspectRatio);
        if (status) status.textContent = "Uploading...";
        const path = await uploadImageToGitHub(croppedFile);
        const updatedProfile = Object.assign({}, defaults.profile, { [fieldName]: path });
        if (status) status.textContent = "Saving...";
        await saveSiteFieldToGateway("profile", updatedProfile, commitMessage);
        defaults.profile = updatedProfile;
        renderProfile();
        if (status) status.textContent = "Saved -- may take a minute to appear live.";
      } catch (error) {
        if (status) status.textContent = error.message === "cancelled" ? "" : (error.message || "Upload failed.");
      } finally {
        input.value = "";
      }
    });

    onIdentityReady(() => {
      refreshVisibility();
      onAuthChange(refreshVisibility);
    });
  }

  function initProfilePhotoEditor() {
    initProfilePhotoUploadControl(
      "[data-photo-upload-btn]",
      "[data-profile-photo-upload]",
      "[data-profile-photo-status]",
      "photo",
      "Update profile photo via inline editor",
      4 / 3
    );
    initProfilePhotoUploadControl(
      "[data-hero-photo-upload-btn]",
      "[data-hero-photo-upload]",
      "[data-hero-photo-status]",
      "heroPhoto",
      "Update hero photo via inline editor",
      1
    );
  }

  function skillLevel(value) {
    const numeric = Number(value) || 0;
    const normalized = numeric > 5 ? Math.ceil(numeric / 20) : numeric;
    return Math.max(0, Math.min(5, Math.round(normalized)));
  }

  function skillMeter(level) {
    const value = skillLevel(level);
    return `
      <div class="skill-meter" aria-label="${value} out of 5">
        ${[1, 2, 3, 4, 5].map(step => `<span class="${step <= value ? "filled" : ""}"></span>`).join("")}
      </div>`;
  }

  function skillTitle(skill) {
    return skill.group || skill.tag || skill.parameter || "Skill";
  }

  function skillSummary(skill) {
    return skill.summary || skill.notes || "";
  }

  function skillItems(skill) {
    if (Array.isArray(skill.items) && skill.items.length) return skill.items;
    if (skill.notes) return String(skill.notes).split(",").map(item => item.trim()).filter(Boolean);
    return [];
  }

  function wrapLabelLines(text, maxLineLength) {
    const words = String(text || "").split(" ").filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach(word => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxLineLength && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  }

  function renderSkillMap() {
    const target = document.querySelector("[data-skill-map]");
    if (!target) return;

    // Derived live from Skill Lines (not a separately maintained list) so
    // editing a bar or adding/removing a skill group always stays in sync.
    const map = (defaults.skills || []).map(skill => ({
      label: skillTitle(skill),
      value: skillLevel(skill.level)
    }));

    const count = map.length;
    if (!count) {
      target.innerHTML = "";
      return;
    }

    const cx = 210;
    const cy = 210;
    const radius = 126;

    function point(index, value, extraRadius) {
      const angle = (-90 + (360 / count) * index) * Math.PI / 180;
      const distance = extraRadius || radius * (Number(value) || 0) / 5;
      return {
        x: cx + Math.cos(angle) * distance,
        y: cy + Math.sin(angle) * distance
      };
    }

    const rings = [1, 2, 3, 4, 5].map(level => {
      const points = map.map((_, index) => {
        const p = point(index, level);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ");
      return `<polygon class="skill-radar-ring" points="${points}"></polygon>`;
    }).join("");

    const labelFontSize = 14;
    const lineHeight = 17;
    const charWidth = labelFontSize * 0.62;
    const bubblePadX = 8;
    const bubblePadY = 5;

    const axes = map.map((item, index) => {
      const p = point(index, 5);
      const label = point(index, 5, radius + 46);
      const anchor = label.x < cx - 8 ? "end" : label.x > cx + 8 ? "start" : "middle";
      const lines = wrapLabelLines(item.label, 12);
      const tspans = lines.map((line, i) => {
        const dy = i === 0 ? (lines.length > 1 ? -(lineHeight / 2) : 0) : lineHeight;
        return `<tspan x="${label.x.toFixed(1)}" dy="${dy}">${escapeHtml(line)}</tspan>`;
      }).join("");

      const textWidth = Math.max(...lines.map(line => line.length)) * charWidth;
      const bubbleWidth = textWidth + bubblePadX * 2;
      const bubbleHeight = (lines.length > 1 ? lines.length * lineHeight : labelFontSize) + bubblePadY * 2;
      const bubbleCenterY = lines.length > 1 ? label.y : label.y - labelFontSize * 0.35;
      const bubbleX = anchor === "start" ? label.x - bubblePadX
        : anchor === "end" ? label.x - textWidth - bubblePadX
        : label.x - bubbleWidth / 2;
      const bubbleY = bubbleCenterY - bubbleHeight / 2;

      return `
        <line class="skill-radar-axis" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"></line>
        <rect class="skill-radar-label-bg" x="${bubbleX.toFixed(1)}" y="${bubbleY.toFixed(1)}" width="${bubbleWidth.toFixed(1)}" height="${bubbleHeight.toFixed(1)}" rx="${(bubbleHeight / 2).toFixed(1)}"></rect>
        <text class="skill-radar-label" y="${label.y.toFixed(1)}" text-anchor="${anchor}">${tspans}</text>`;
    }).join("");

    const shape = map.map((item, index) => {
      const p = point(index, skillLevel(item.value));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

    target.innerHTML = `
      <div class="skill-map-card">
        <svg class="skill-radar" viewBox="-70 -70 560 560" role="img" aria-label="Engineering skill map">
          ${rings}
          ${axes}
          <polygon class="skill-radar-shape" points="${shape}"></polygon>
        </svg>
        <div class="skill-map-legend">
          ${map.map(item => `
            <div class="skill-map-row">
              <span>${escapeHtml(item.label)}</span>
              ${skillMeter(item.value)}
            </div>`).join("")}
        </div>
      </div>`;
  }

  const SKILL_ITEMS_VISIBLE = 6;

  function skillItemsListHtml(items) {
    const visible = items.slice(0, SKILL_ITEMS_VISIBLE);
    const rest = items.slice(SKILL_ITEMS_VISIBLE);
    const visibleHtml = `<ul class="skill-list">${visible.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    if (!rest.length) return visibleHtml;
    const restHtml = rest.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    return `
      ${visibleHtml}
      <details class="skill-list-more">
        <summary>+${rest.length} more</summary>
        <ul class="skill-list">${restHtml}</ul>
      </details>`;
  }

  function renderSkills() {
    renderSkillMap();
    renderToolGroups();

    const skills = defaults.skills || [];
    const groups = document.querySelector("[data-skill-groups]");
    if (groups) {
      groups.innerHTML = skills.map(skill => `
        <article class="skill-card">
          <div class="skill-card-head">
            <div>
              <span class="feature-tag">${escapeHtml(skill.focus || "Skill line")}</span>
              <h2>${escapeHtml(skillTitle(skill))}</h2>
            </div>
            ${skillMeter(skill.level)}
          </div>
          <p>${escapeHtml(skillSummary(skill))}</p>
          ${skillItemsListHtml(skillItems(skill))}
        </article>`).join("");
    }

    const featureGrid = document.querySelector("[data-skill-features]");
    if (featureGrid) {
      featureGrid.innerHTML = skills.map(skill => `
        <div class="feature">
          <span class="feature-tag">${escapeHtml(skill.focus || skill.tag || "Skill")}</span>
          <p>${escapeHtml(skillSummary(skill))}</p>
          ${skillMeter(skill.level)}
        </div>`).join("");
    }
  }

  function renderToolGroups() {
    const target = document.querySelector("[data-toolkit]");
    if (!target) return;

    const groups = (defaults.toolGroups || []).map(normalizeToolGroup).filter(group => group.tools.length);
    if (!groups.length) {
      target.innerHTML = emptyState("No tools added yet", "Add tool groups in Admin to show technology experience here.");
      return;
    }

    target.innerHTML = `
      <div class="toolkit-tabs" role="tablist" aria-label="Tool categories">
        ${groups.map((group, index) => `
          <button class="toolkit-tab ${index === 0 ? "active" : ""}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-tool-tab="${index}">
            ${escapeHtml(group.group)}
          </button>`).join("")}
      </div>
      <div class="toolkit-panels">
        ${groups.map((group, index) => `
          <article class="toolkit-panel ${index === 0 ? "active" : ""}" role="tabpanel" data-tool-panel="${index}" ${index === 0 ? "" : "hidden"}>
            <div class="toolkit-copy">
              <h2>${escapeHtml(group.group)}</h2>
              <p>${escapeHtml(group.summary)}</p>
              ${group.context ? `<p class="toolkit-context">${escapeHtml(group.context)}</p>` : ""}
            </div>
            <div class="tool-chip-grid">
              ${group.tools.map(tool => `<span class="tool-chip">${escapeHtml(tool)}</span>`).join("")}
            </div>
          </article>`).join("")}
      </div>`;

    const tabs = Array.from(target.querySelectorAll("[data-tool-tab]"));
    const panels = Array.from(target.querySelectorAll("[data-tool-panel]"));

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(item => {
          const active = item === tab;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", String(active));
        });
        panels.forEach(panel => {
          const active = panel.dataset.toolPanel === tab.dataset.toolTab;
          panel.classList.toggle("active", active);
          panel.hidden = !active;
        });
      });
    });
  }

  function renderExperience() {
    const target = document.querySelector("[data-experience-list]");
    if (!target) return;

    const items = (defaults.experience || []).map(normalizeExperience);
    target.innerHTML = items.length
      ? items.map((item, index) => timelineItem(item, index, false)).join("")
      : emptyState("No experience added yet", "Add experience entries in Admin to build this timeline.");
  }

  function renderOverviewTimeline() {
    const target = document.querySelector("[data-overview-timeline]");
    if (!target) return;

    const items = (defaults.experience || []).map(normalizeExperience).slice(0, 3);
    target.innerHTML = items.length
      ? items.map((item, index) => timelineItem(item, index, true)).join("")
      : emptyState("Timeline coming soon", "Add experience entries in Admin and they will appear here.");
  }

  function renderEducation() {
    const target = document.querySelector("[data-education-list]");
    if (!target) return;

    const items = (defaults.education || []).map(normalizeExperience);
    target.innerHTML = items.length
      ? items.map((item, index) => timelineItem(item, index, false)).join("")
      : emptyState("No education added yet", "Add education entries in Admin to show them here.");
  }

  function timelineItem(item, index, compact) {
    const image = item.image && !compact
      ? `<img class="timeline-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}">`
      : "";
    const details = item.details && !compact
      ? `<p class="timeline-details">${escapeHtml(item.details)}</p>`
      : "";
    const highlights = item.highlights && item.highlights.length && !compact
      ? `<ul class="timeline-highlights">${item.highlights.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
      : "";
    const place = item.place ? `<span class="timeline-place">${escapeHtml(item.place)}</span>` : "";
    const badge = item.badge ? `<span class="timeline-badge">${escapeHtml(item.badge)}</span>` : "";
    const org = item.tag && item.title
      ? `<p class="timeline-org">${escapeHtml(item.title)}${badge}</p>`
      : "";

    return `
      <article class="timeline-item ${image ? "has-image" : ""}">
        <div class="timeline-marker">
          <span>${String(index + 1).padStart(2, "0")}</span>
        </div>
        <div class="timeline-card">
          ${image}
          <div class="timeline-copy">
            <div class="timeline-meta">
              <span>${escapeHtml(item.period)}</span>
              ${place}
            </div>
            <h2>${escapeHtml(item.tag || item.title)}</h2>
            ${org}
            <p>${escapeHtml(item.summary)}</p>
            ${details}
            ${highlights}
          </div>
        </div>
      </article>`;
  }

  function emptyState(title, message) {
    return `
      <div class="empty-state">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function renderCertificates() {
    const target = document.querySelector("[data-certificates-list]");
    if (!target) return;

    const certificates = (defaults.certificates || []).map(normalizeCertificate);
    if (!certificates.length) {
      target.innerHTML = emptyState("No certificates added yet", "Use Admin to add certificates, training records, awards, or verified credentials.");
      return;
    }

    target.innerHTML = certificates.map(cert => {
      const link = cert.linkUrl && cert.linkLabel
        ? `<a class="inline-link" href="${escapeHtml(cert.linkUrl)}" target="_blank" rel="noopener">${escapeHtml(cert.linkLabel)}</a>`
        : "";
      const image = cert.image
        ? `<img class="certificate-image" src="${escapeHtml(cert.image)}" alt="${escapeHtml(cert.imageAlt || cert.title)}">`
        : `<div class="certificate-placeholder">Certificate</div>`;

      return `
        <article class="certificate-card">
          ${image}
          <div class="certificate-body">
            <div class="certificate-meta">
              ${cert.issuer ? `<span>${escapeHtml(cert.issuer)}</span>` : ""}
              ${cert.date ? `<span>${escapeHtml(cert.date)}</span>` : ""}
            </div>
            <h2>${escapeHtml(cert.title)}</h2>
            <p>${escapeHtml(cert.summary)}</p>
            ${cert.skills.length ? `<div class="certificate-tags">${cert.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}</div>` : ""}
            ${link}
          </div>
        </article>`;
    }).join("");
  }

  function renderProfile() {
    const profile = defaults.profile || {};
    const favicon = document.getElementById("favicon");
    if (favicon && profile.heroPhoto) {
      favicon.href = profile.heroPhoto;
    }
    document.querySelectorAll("[data-profile-name]").forEach(target => {
      target.textContent = profile.name || "";
    });
    document.querySelectorAll("[data-profile-role]").forEach(target => {
      target.textContent = profile.role || "";
    });
    document.querySelectorAll("[data-profile-summary]").forEach(target => {
      target.textContent = profile.summary || "";
    });
    document.querySelectorAll("[data-profile-why]").forEach(target => {
      target.textContent = profile.why || "";
      target.hidden = !profile.why;
    });
    document.querySelectorAll("[data-profile-next]").forEach(target => {
      target.textContent = profile.nextFocus || "";
      target.hidden = !profile.nextFocus;
    });
    document.querySelectorAll("[data-profile-short-role]").forEach(target => {
      target.textContent = profile.shortRole || profile.role || "";
    });
    document.querySelectorAll("[data-profile-location]").forEach(target => {
      target.textContent = profile.location || "";
    });
    applyProfilePhoto("[data-profile-initials]", "[data-profile-photo]", profile.photo, profile.photoAlt, profile.name);
    applyProfilePhoto("[data-profile-hero-initials]", "[data-profile-hero-photo]", profile.heroPhoto, profile.heroPhotoAlt, profile.name);
  }

  function applyProfilePhoto(initialsSelector, photoSelector, photoValue, photoAlt, name) {
    document.querySelectorAll(initialsSelector).forEach(target => {
      target.textContent = initials(name);
      target.hidden = Boolean(photoValue);
    });
    document.querySelectorAll(photoSelector).forEach(target => {
      if (photoValue) {
        target.src = photoValue;
        target.alt = photoAlt || `${name || "Profile"} photo`;
        target.hidden = false;
      } else {
        target.removeAttribute("src");
        target.alt = "";
        target.hidden = true;
      }
    });
  }

  function renderContact() {
    const profile = defaults.profile || {};
    const primaryEmail = document.querySelector("[data-primary-email-link]");
    const primaryCv = document.querySelector("[data-primary-cv-link]");
    if (primaryEmail && profile.email) {
      primaryEmail.href = `mailto:${profile.email}`;
    }
    if (primaryCv && profile.cv) {
      primaryCv.href = profile.cv;
    }

    const target = document.querySelector("[data-contact-list]");
    if (!target) return;

    const rows = [
      profile.email ? ["Email", "Best for recruiter follow-up", `<a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>`] : null,
      profile.phone ? ["Phone", "Available for scheduled calls", `<a href="tel:${escapeHtml(String(profile.phone).replace(/\s+/g, ""))}">${escapeHtml(profile.phone)}</a>`] : null,
      profile.github ? ["GitHub", "Code, project repositories, and engineering work", `<a href="${escapeHtml(profile.github)}" target="_blank" rel="noopener">${escapeHtml(profile.githubLabel || profile.github)}</a>`] : null,
      profile.linkedin ? ["LinkedIn", "Professional profile and work history", `<a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener">${escapeHtml(profile.linkedinLabel || profile.linkedin)}</a>`] : null,
      profile.location ? ["Location", "Current base", escapeHtml(profile.location)] : null,
      profile.cv ? ["CV", "PDF resume for applications", `<a href="${escapeHtml(profile.cv)}" target="_blank" rel="noopener">Download PDF</a>`] : null
    ].filter(Boolean);

    target.innerHTML = rows.map(row => `
      <article class="contact-card">
        <span class="contact-label">${row[0]}</span>
        <div class="contact-value">${row[2]}</div>
        <p>${row[1]}</p>
      </article>`).join("");
  }

  function initScope() {
    const path = document.getElementById("spike-path");
    const dot = document.getElementById("scope-dot");
    const vmReadout = document.getElementById("vm-readout");
    const status = document.getElementById("scope-status");
    if (!path) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = 480;
    const baseline = 168;
    const peak = 30;
    const reset = 200;
    const cycleWidth = 160;

    function buildCycle(startX) {
      const points = [];
      const restLen = cycleWidth * 0.28;
      const rampLen = cycleWidth * 0.22;
      const spikeLen = cycleWidth * 0.08;
      const resetLen = cycleWidth * 0.10;
      const refracLen = cycleWidth - restLen - rampLen - spikeLen - resetLen;
      let x = startX;

      points.push([x, baseline]);
      x += restLen;
      points.push([x, baseline]);

      for (let i = 1; i <= 6; i += 1) {
        const t = i / 6;
        points.push([x + rampLen * t, baseline - 40 * t]);
      }
      x += rampLen;

      points.push([x + spikeLen * 0.4, peak]);
      points.push([x + spikeLen * 0.7, peak + 12]);
      x += spikeLen;

      points.push([x + resetLen * 0.5, reset]);
      x += resetLen;

      for (let i = 1; i <= 5; i += 1) {
        const t = i / 5;
        points.push([x + refracLen * t, reset - (reset - baseline) * t]);
      }

      return points;
    }

    let allPoints = [];
    for (let x = -cycleWidth; x < width + cycleWidth; x += cycleWidth) {
      allPoints = allPoints.concat(buildCycle(x));
    }

    path.setAttribute("d", allPoints.map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${point[0].toFixed(1)},${point[1].toFixed(1)}`;
    }).join(" "));

    if (prefersReducedMotion) return;

    let offset = 0;
    function animate() {
      offset -= 0.6;
      if (offset <= -cycleWidth) offset += cycleWidth;
      path.setAttribute("transform", `translate(${offset},0)`);

      const sampleX = 340 - offset;
      let nearest = allPoints[0];
      let best = Infinity;
      allPoints.forEach(point => {
        const distance = Math.abs(point[0] - sampleX);
        if (distance < best) {
          best = distance;
          nearest = point;
        }
      });

      if (dot) {
        dot.setAttribute("cx", 340);
        dot.setAttribute("cy", nearest[1]);
      }

      if (vmReadout && status) {
        if (nearest[1] < 60) {
          vmReadout.textContent = "+30";
          status.textContent = "FIRING";
          status.classList.add("firing");
        } else {
          vmReadout.textContent = Math.round(-70 + (baseline - nearest[1]) * 0.6);
          status.textContent = "RESTING";
          status.classList.remove("firing");
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function initLiveSignal() {
    const wave = document.querySelector("[data-live-wave]");
    const fill = document.querySelector("[data-live-wave-fill]");
    const barsGroup = document.querySelector("[data-spectrum-bars]");
    const readout = document.querySelector("[data-signal-readout]");
    const nodes = Array.from(document.querySelectorAll("[data-system-node]"));
    const quality = document.querySelector("[data-monitor-quality]");
    const peak = document.querySelector("[data-monitor-peak]");
    const packets = document.querySelector("[data-monitor-packets]");
    const status = document.querySelector("[data-monitor-status]");
    if (!wave || !fill || !barsGroup) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = 24;
    const right = 496;
    const waveBase = 118;
    const fillBase = 164;
    const barBottom = 260;
    const barCount = 28;
    const barGap = 5;
    const barAreaWidth = right - left;
    const barWidth = (barAreaWidth - barGap * (barCount - 1)) / barCount;

    barsGroup.innerHTML = Array.from({ length: barCount }).map((_, index) => {
      const x = left + index * (barWidth + barGap);
      return `<rect class="spectrum-bar" x="${x.toFixed(2)}" y="${barBottom}" width="${barWidth.toFixed(2)}" height="0" rx="2"></rect>`;
    }).join("");

    const bars = Array.from(barsGroup.querySelectorAll(".spectrum-bar"));

    function gaussian(index, center, spread, gain) {
      return gain * Math.exp(-Math.pow((index - center) / spread, 2));
    }

    function draw(time) {
      const t = (time || 0) / 1000;
      const points = [];

      for (let x = left; x <= right; x += 6) {
        const n = (x - left) / (right - left);
        const y = waveBase
          + Math.sin(n * Math.PI * 4 + t * 2.2) * 24
          + Math.sin(n * Math.PI * 10 - t * 3.1) * 10
          + Math.sin(n * Math.PI * 18 + t * 1.3) * 5;
        points.push([x, y]);
      }

      const line = points.map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command}${point[0].toFixed(1)},${point[1].toFixed(1)}`;
      }).join(" ");

      wave.setAttribute("d", line);
      fill.setAttribute("d", `${line} L${right},${fillBase} L${left},${fillBase} Z`);

      bars.forEach((bar, index) => {
        const movingPeak = 8 + Math.sin(t * 0.8) * 2.5;
        const secondaryPeak = 19 + Math.cos(t * 0.6) * 2;
        const energy = 0.18
          + gaussian(index, movingPeak, 2.5, 0.82)
          + gaussian(index, secondaryPeak, 3.4, 0.58)
          + Math.sin(t * 2.4 + index * 0.65) * 0.08;
        const height = Math.max(8, Math.min(92, energy * 82));
        bar.setAttribute("y", (barBottom - height).toFixed(1));
        bar.setAttribute("height", height.toFixed(1));
      });

      if (readout) {
        const frequency = Math.round(118 + Math.sin(t * 0.9) * 16 + Math.cos(t * 0.35) * 8);
        readout.textContent = `${frequency} Hz`;
        if (peak) peak.textContent = `${frequency} Hz`;
      }

      if (quality) {
        quality.textContent = `${Math.round(91 + Math.sin(t * 0.7) * 4)}%`;
      }

      if (packets) {
        packets.textContent = `${Math.round(44 + Math.cos(t * 1.1) * 6)}/s`;
      }

      if (status) {
        status.textContent = Math.sin(t * 1.6) > -0.72 ? "MQTT connected" : "syncing";
      }

      if (nodes.length) {
        const activeIndex = Math.floor(t * 1.7) % nodes.length;
        nodes.forEach((node, index) => {
          node.classList.toggle("active", index === activeIndex);
        });
      }

      if (!prefersReducedMotion) {
        requestAnimationFrame(draw);
      }
    }

    function drawAtRest() {
      draw(0);
      if (readout) readout.textContent = "128 Hz";
      if (peak) peak.textContent = "128 Hz";
      if (quality) quality.textContent = "92%";
      if (packets) packets.textContent = "48/s";
      if (status) status.textContent = "MQTT connected";
      if (nodes.length) {
        nodes.forEach((node, index) => node.classList.toggle("active", index === 0));
      }
    }

    if (prefersReducedMotion) {
      drawAtRest();
    } else {
      draw(0);
    }
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) return null;
    return response.json();
  }

  async function loadCmsContent() {
    if (window.location.protocol === "file:") return;

    try {
      const siteContent = await loadJson("content/site.json");
      if (siteContent) {
        defaults = normalizeSite(siteContent);
      }

      const skillsContent = await loadJson("content/skills.json");
      if (skillsContent) {
        defaults.skills = Array.isArray(skillsContent.skills) ? skillsContent.skills : defaults.skills;
        defaults.skillMap = Array.isArray(skillsContent.skillMap) ? skillsContent.skillMap : defaults.skillMap;
        defaults.toolGroups = Array.isArray(skillsContent.toolGroups)
          ? skillsContent.toolGroups.map(normalizeToolGroup)
          : defaults.toolGroups;
      }
    } catch (error) {
      defaults = normalizeSite(defaults);
    }
  }

  async function renderGithubActivity() {
    const target = document.querySelector("[data-github-activity]");
    if (!target) return;

    const profile = defaults.profile || {};
    const username = githubUsername(profile);
    if (!username) {
      target.innerHTML = emptyState("GitHub not linked", "Add a GitHub URL in Admin to show live activity here.");
      return;
    }

    try {
      const [user, repos] = await Promise.all([
        loadJson(`https://api.github.com/users/${username}`),
        loadJson(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`)
      ]);

      if (!user || !Array.isArray(repos)) throw new Error("GitHub data unavailable");

      const stats = `
        <div class="github-stats">
          <span>${user.public_repos} public repos</span>
          <span>${user.followers} followers</span>
        </div>`;

      const repoList = repos.length
        ? `<div class="github-repo-list">${repos.map(repo => `
            <article class="github-repo">
              <div class="github-repo-head">
                <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a>
                <span class="github-repo-updated">updated ${timeAgo(repo.pushed_at || repo.updated_at)}</span>
              </div>
              <p>${escapeHtml(repo.description || "No description yet.")}</p>
              ${repo.language ? `<span class="github-repo-lang">${escapeHtml(repo.language)}</span>` : ""}
            </article>`).join("")}</div>`
        : "";

      target.innerHTML = `
        <div class="github-panel">
          ${stats}
          ${repoList}
          <a class="inline-link" href="${escapeHtml(profile.github)}" target="_blank" rel="noopener">View full profile on GitHub</a>
        </div>`;
    } catch (error) {
      target.innerHTML = emptyState("GitHub activity unavailable", "Rate-limited or offline right now.");
      const link = document.createElement("a");
      link.className = "inline-link";
      link.href = profile.github;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "View GitHub profile directly";
      target.querySelector(".empty-state").appendChild(link);
    }
  }

  function renderSite() {
    setActivePage();
    renderFeaturedProjects();
    renderProjectGrid();
    renderProjectDetail();
    renderSkills();
    renderGithubActivity();
    renderOverviewTimeline();
    renderExperience();
    renderEducation();
    renderCertificates();
    renderProfile();
    renderContact();
    initScope();
    initLiveSignal();
  }

  async function init() {
    initTheme();
    initEngineerMode();
    initIdentityChrome();
    await loadCmsContent();
    renderSite();
    initProjectEditor();
    initCertificateEditor();
    initSkillEditor();
    initToolGroupEditor();
    initProfilePhotoEditor();
  }

  init();

  window.PortfolioStore = {
    getProjects,
    defaultProjects
  };
})();
