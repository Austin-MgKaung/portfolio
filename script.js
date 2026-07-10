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
      summary: project.summary || "",
      details: project.details || "",
      image: project.image || "",
      imageAlt: project.imageAlt || `${project.title || "Project"} preview`,
      linkLabel: project.linkLabel || "",
      linkUrl: project.linkUrl || "",
      featured: Boolean(project.featured)
    };
  }

  function normalizeExperience(item) {
    return {
      period: item.period || "",
      title: item.title || "Experience",
      tag: item.tag || "",
      place: item.place || "",
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

  function projectCard(project, compact) {
    const details = compact ? escapeHtml(project.summary) : escapeHtml(project.details || project.summary);
    const action = project.linkUrl && project.linkLabel
      ? `<a class="inline-link" href="${escapeHtml(project.linkUrl)}" target="_blank" rel="noopener">${escapeHtml(project.linkLabel)}</a>`
      : "";

    return `
      <article class="project-card" data-category="${escapeHtml(project.category)}" data-project-card="${escapeHtml(project.id)}">
        <img class="project-image" src="${projectImage(project)}" alt="${escapeHtml(project.imageAlt || project.title)}">
        <div class="project-card-body">
          <div class="project-meta">
            <span>${escapeHtml(project.partNumber)}</span>
            <span>${escapeHtml(CATEGORY_LABELS[project.category] || project.category)}</span>
          </div>
          <h2>${escapeHtml(project.title)}</h2>
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

  const GIT_GATEWAY_BASE = "/.netlify/git/github";
  const SITE_JSON_PATH = "content/site.json";
  let projectEditActive = false;

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str.replace(/\n/g, ""))));
  }

  function currentIdentityUser() {
    return window.netlifyIdentity ? window.netlifyIdentity.currentUser() : null;
  }

  async function fetchSiteJsonFromGateway() {
    const user = currentIdentityUser();
    if (!user) throw new Error("Not logged in.");
    const token = await user.jwt();
    const response = await fetch(`${GIT_GATEWAY_BASE}/contents/${SITE_JSON_PATH}?ref=main`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Could not load ${SITE_JSON_PATH} (HTTP ${response.status}).`);
    const data = await response.json();
    return { sha: data.sha, site: JSON.parse(base64ToUtf8(data.content)) };
  }

  async function saveProjectsToGateway(projects) {
    const user = currentIdentityUser();
    if (!user) throw new Error("Not logged in.");
    const token = await user.jwt();
    const { sha, site } = await fetchSiteJsonFromGateway();
    const updatedSite = Object.assign({}, site, { projects });
    const body = {
      message: "Update projects via inline editor",
      content: utf8ToBase64(JSON.stringify(updatedSite, null, 2)),
      sha,
      branch: "main"
    };
    const response = await fetch(`${GIT_GATEWAY_BASE}/contents/${SITE_JSON_PATH}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Save failed (HTTP ${response.status}). ${errorText}`);
    }
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
            <label>Details <textarea data-field="details">${escapeHtml(project.details)}</textarea></label>
            <label>Image URL <input type="text" data-field="image" value="${escapeHtml(project.image)}"></label>
            <label>Image alt text <input type="text" data-field="imageAlt" value="${escapeHtml(project.imageAlt)}"></label>
            <label>Link label <input type="text" data-field="linkLabel" value="${escapeHtml(project.linkLabel)}"></label>
            <label>Link URL <input type="text" data-field="linkUrl" value="${escapeHtml(project.linkUrl)}"></label>
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
      return normalizeProject({
        id: card.dataset.id,
        partNumber: text("partNumber"),
        title: text("title"),
        category: value("category"),
        status: text("status"),
        stack: value("stack"),
        summary: text("summary"),
        details: value("details"),
        image: value("image"),
        imageAlt: value("imageAlt"),
        linkLabel: value("linkLabel"),
        linkUrl: value("linkUrl"),
        featured: Boolean(field("featured") && field("featured").checked)
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
      await saveProjectsToGateway(projects);
      defaults.projects = projects;
      setProjectEditStatus("Saved. Redeploying on Netlify now -- live in a minute or so.");
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

    function wireIdentity() {
      ensureProjectEditorChrome();
      refreshEntryVisibility();
      window.netlifyIdentity.on("login", refreshEntryVisibility);
      window.netlifyIdentity.on("logout", () => {
        if (projectEditActive) exitProjectEditMode();
        refreshEntryVisibility();
      });
    }

    if (window.netlifyIdentity) {
      wireIdentity();
      return;
    }

    // The identity widget script can still be loading -- poll briefly
    // instead of giving up, since script order/network timing varies.
    let attempts = 0;
    const waitForWidget = setInterval(() => {
      attempts += 1;
      if (window.netlifyIdentity) {
        clearInterval(waitForWidget);
        wireIdentity();
      } else if (attempts > 40) {
        clearInterval(waitForWidget);
      }
    }, 250);
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

  function renderSkillMap() {
    const target = document.querySelector("[data-skill-map]");
    if (!target) return;

    const map = (defaults.skillMap && defaults.skillMap.length)
      ? defaults.skillMap
      : (defaults.skills || []).slice(0, 7).map(skill => ({
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

    const axes = map.map((item, index) => {
      const p = point(index, 5);
      const label = point(index, 5, radius + 42);
      const anchor = label.x < cx - 8 ? "end" : label.x > cx + 8 ? "start" : "middle";
      return `
        <line class="skill-radar-axis" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"></line>
        <text class="skill-radar-label" x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" text-anchor="${anchor}">${escapeHtml(item.label)}</text>`;
    }).join("");

    const shape = map.map((item, index) => {
      const p = point(index, skillLevel(item.value));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

    target.innerHTML = `
      <div class="skill-map-card">
        <svg class="skill-radar" viewBox="0 0 420 420" role="img" aria-label="Engineering skill map">
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
          <ul class="skill-list">
            ${skillItems(skill).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
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
    const tag = item.tag ? `<span>${escapeHtml(item.tag)}</span>` : "";
    const place = item.place ? `<span class="timeline-place">${escapeHtml(item.place)}</span>` : "";

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
              ${tag}
              ${place}
            </div>
            <h2>${escapeHtml(item.title)}</h2>
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
    document.querySelectorAll("[data-profile-initials]").forEach(target => {
      target.textContent = initials(profile.name);
      target.hidden = Boolean(profile.photo);
    });
    document.querySelectorAll("[data-profile-photo]").forEach(target => {
      if (profile.photo) {
        target.src = profile.photo;
        target.alt = profile.photoAlt || `${profile.name || "Profile"} photo`;
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
    const response = await fetch(path, { cache: "no-store" });
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
    renderSkills();
    renderGithubActivity();
    renderOverviewTimeline();
    renderExperience();
    renderCertificates();
    renderProfile();
    renderContact();
    initScope();
    initLiveSignal();
  }

  async function init() {
    initTheme();
    initEngineerMode();
    await loadCmsContent();
    renderSite();
    initProjectEditor();
  }

  init();

  window.PortfolioStore = {
    getProjects,
    defaultProjects
  };
})();
