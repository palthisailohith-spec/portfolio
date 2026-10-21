# Sai Lohith — Engineering Portfolio

A responsive portfolio for DevOps, Platform Engineering and SRE work. Includes a conceptual infrastructure explorer, three professional case studies, an interactive CI/CD comparison, capability selector, career timeline and downloadable resume.

Built with semantic HTML, CSS and native JavaScript modules. Python's standard library builds the static output; no npm installation, application framework or API keys are required. Google Fonts has system-font fallbacks.

## Local development and production build

Requires Python 3.10+; Node.js is used only for optional syntax checks.

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 scripts/check-public.py
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve over HTTP because the content uses fetch and ES modules.

- `src/template.html`: page structure and editorial copy.
- `src/content.json`: case studies, explorer, capabilities, career and future projects.
- `src/app.js`: explorer, dialogs, theme and email actions.
- `src/pipeline.js`: pipeline comparison and accessible job selection.
- `src/styles.css`: approved visual identity and responsive styles.
- `dist/assets/`: public resume, favicon and social image.
- `site.json`: canonical production URL.

The production build generates `dist/`, including portable relative application assets, absolute social metadata, robots.txt and sitemap.xml. Rebuild after editing source. The public assets and generated output are checked in for convenient inspection; CI rebuilds them before deployment.

## GitHub Pages

The workflow `.github/workflows/pages.yml` builds and checks the site, uploads only `dist/`, and deploys it to the `github-pages` environment. Official actions are pinned to commit SHAs. No deployment secret is needed: Pages uses the workflow's scoped GitHub token and OIDC.

Repository Settings → Pages → Build and deployment → Source must be **GitHub Actions**. A push to `main` or a manual workflow dispatch deploys the site. The deployment job publishes the verified URL in its environment output.

Configured site address: https://palthisailohith-spec.github.io/portfolio/ (deployment verification pending).

To publish future updates: edit `src/` or public assets, run the build and checks above, commit the intended files and push to `main`. The workflow rebuilds and publishes automatically. For another domain, update `site.json` and the Pages domain settings, then rebuild.

## Public content and verification

Diagrams are conceptual, not employer topology or live telemetry. The frontend golden-path migration is distinct from the separately designed Python/FastAPI backend pipeline. NPCI scale is attributed only to NPCI. Future projects remain empty until real repositories ship.

The site has been tested locally in Chromium at 360, 390, 768, 1024, 1440 and 1920px, including explorer modes, pipeline views and jobs, dialogs, keyboard selection, theme, email copy and the PDF. Physical touch devices, Safari/Firefox and a formal screen-reader audit remain separate checks.
