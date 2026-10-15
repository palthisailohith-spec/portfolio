# Sai Lohith — Engineering Portfolio

A responsive, buildless portfolio for Sai Lohith, a Platform / DevOps Engineer with an SRE background.

The refined design leads with identity and professional experience, followed by an interactive SVG capability map, engineering work notes, a career timeline, and an engineering approach section. Charcoal surfaces, warm white text and a mint accent keep the presentation focused.

## Files
- `dist/index.html`: identity, experience, selected professional work and contact.
- `dist/styles.css`: responsive design, illustrations, reduced-motion support.
- `dist/app.js`: toolkit explorer, accessible work dialogs, email copy and reading progress.

## Preview locally
Run `python -m http.server 8000 --directory dist` and visit http://localhost:8000.
No build or package installation is required. Fonts load from Google Fonts with local fallbacks.

## GitHub Pages
The included workflow deploys `dist/` on pushes to `main`. Enable GitHub Actions as the Pages source in repository Settings → Pages. Confirm the repository default branch before enabling the workflow.

## Content
Professional contributions are based on supplied career documents. The engineering landscape and work illustrations are conceptual visuals, not live infrastructure telemetry. Employer code and internal deployment details are not included.

## Design research
- https://brittanychiang.com — clear work history and evidence.
- https://rauno.me — restrained visual hierarchy.
- https://bruno-simon.com — memorable subject-specific interaction.
- https://www.reddit.com/r/webdev/comments/1g46qod/favourite_dev_portfolios/ — community references and discussion.
X/Twitter searches did not yield usable direct posts; no findings are attributed to them.

## Editing
Update biography and experience in `index.html`, and detailed work notes and toolkit descriptions in `app.js`. Keep claims and scale figures grounded in verified work. Links point to the verified GitHub and LinkedIn profiles; no private API tokens are used.
