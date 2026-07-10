# Decap CMS Setup

This site is wired for Decap CMS. The CMS edits:

- `content/site.json` for profile, projects, experience, education, and certificates
- `content/skills.json` for the Skills page, 5-bar proficiency levels, and tools
- `assets/uploads/` for uploaded images and files

The admin page is:

```text
https://austin-mgkaung.github.io/portfolio/admin/
```

## Hosting

The site is hosted on **GitHub Pages**, deployed straight from the `main`
branch of this repo. No build step -- pushing to `main` is the deploy.

## Authentication

Decap's `github` backend needs an OAuth App plus a small proxy to complete
the login handshake without exposing a client secret in the browser. This
site uses:

- A **GitHub OAuth App** ("Kaung Portfolio CMS") registered under
  `github.com/settings/developers`, with its callback URL pointed at the
  Worker below.
- A **Cloudflare Worker** (`kaung-portfolio-auth.kaungmtun-austin.workers.dev`)
  that implements the OAuth proxy: `/auth` redirects to GitHub, `/callback`
  exchanges the code for a token and hands it back to whichever page opened
  the login popup. The Worker holds `GITHUB_CLIENT_ID` and
  `GITHUB_CLIENT_SECRET` as environment variables (the secret is never in
  this repo or in any client-side code).

`admin/config.yml`'s `backend` block points at this Worker via `base_url`
and `auth_endpoint`.

## Two independent logins, same GitHub App

- `/admin/` (Decap CMS itself) manages its own login session internally.
- The inline "click to edit" editors on Projects, Certificates, Skill
  Lines, and Tools & Technologies use a separate login, triggered by the
  **Login** button in the site's masthead. Once logged in there, that
  session is shared across every page (stored in `localStorage`), but it
  is *not* the same session as `/admin/` -- logging into one does not log
  you into the other.

Both logins go through the same GitHub OAuth App and Worker; they just
don't share client-side state with each other.

## Editing content

- **Via `/admin/`**: the full Decap CMS form-based editor -- best for
  adding/removing entries with image uploads (Profile, Projects,
  Experience, Education, Certificates, Skills).
- **Via inline editing**: click **Login** in the masthead, then use the
  "Edit ..." buttons that appear on Projects, Certificates, Skill Lines,
  and Tools & Technologies for fast in-place text edits, add/remove
  cards, and bar/chip editing directly on the live page.

Either path commits straight to this repo's `main` branch and GitHub
Pages redeploys automatically within a minute or so.
