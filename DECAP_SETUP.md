# Decap CMS + GitHub Setup

This site is wired for Decap CMS. The CMS edits:

- `content/site.json` for profile, projects, and experience
- `content/skills.json` for the Skills page, 5-bar proficiency levels, and skill map
- `assets/uploads/` for uploaded images and files

The admin page is:

```text
https://YOUR-SITE/admin/
```

## 1. Push This Site To GitHub

Create a GitHub repository, then push this folder.

## 2. Update Decap Config

Open `admin/config.yml` and replace:

```yaml
repo: YOUR-GITHUB-USERNAME/YOUR-REPO-NAME
site_url: "https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME"
display_url: "https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME"
```

Use your real GitHub username, repo name, and live site URL.

## 3. Choose Authentication

Decap needs an authentication helper so the browser can safely write commits to GitHub.

### Option A: GitHub Backend

Keep this in `admin/config.yml`:

```yaml
backend:
  name: github
  repo: YOUR-GITHUB-USERNAME/YOUR-REPO-NAME
  branch: main
```

Then configure a Decap-compatible GitHub OAuth helper. Editors must have push access to the repo.

### Option B: Netlify Git Gateway

This is usually easier for a simple admin panel.

1. Deploy the GitHub repo on Netlify.
2. Enable Netlify Identity.
3. Enable Git Gateway.
4. Replace the backend block in `admin/config.yml` with:

```yaml
backend:
  name: git-gateway
  branch: main
```

Your content still lives in GitHub, but Netlify handles the login and CMS auth.

## 4. Editing Content

After auth works, open:

```text
/admin/
```

From there you can edit:

- Profile
- Skills
- Skill map / 5-bar levels
- Projects
- Experience
- Project images and CV files

Project categories are broad electronics sections:

- Analog / IC
- Digital / FPGA
- PCB / Hardware
- Embedded / IoT
- Signal Processing
- Sensors / Instrumentation
- Robotics / Control
- RF / Wireless
- Power / Energy
- Software / C++
- AI / ML

When you click publish, Decap commits the change to GitHub. The public pages read `content/site.json` and `content/skills.json`.
