# Sai Lohith — Portfolio

A minimal personal site for Sai Lohith, a Platform & DevOps Engineer with an SRE background. A narrow reading layout, quiet typography, light and dark themes, compact experience, and a space for future projects.

## Local preview

```sh
python -m http.server 8000 --directory dist
```

Visit http://localhost:8000. No installation or build is required. Serve the files over HTTP so JavaScript modules can load. The page remains readable without JavaScript; theme switching, email copy and project rendering use JavaScript. DM Sans loads from Google Fonts, with system font fallbacks.

## Editing

- `dist/index.html`: introduction, social links, professional experience, toolkit and contact.
- `dist/styles.css`: responsive layout and both colour themes.
- `dist/app.js`: theme preference, email copy, IST clock and project rendering.
- `dist/projects.js`: shipped projects. Currently empty, as projects will be added later.

To publish a project, add an object to the exported `projects` array:

```js
export const projects = [{
  title: 'Your project',
  description: 'The problem, your implementation, and what works today.',
  technologies: ['Python', 'Kubernetes'],
  repository: 'https://github.com/your-account/your-project',
  demo: 'https://your-project.example' // optional
}];
```

Only add actual projects and verified claims. The empty-state message disappears automatically when a project is added. Project text is rendered with DOM text APIs and outbound project links accept HTTPS URLs only.

## GitHub Pages

The included workflow deploys `dist/` on a push to `main`. In repository Settings → Pages, select GitHub Actions as the source. The separate private preview is published through Sites.

## Content and visual direction

The career content reflects supplied professional experience. Client work is described as employment experience, not as personal projects or open-source contributions. No private source or internal architecture is included. The monogram is intentional and can be replaced with a supplied personal photo later.

Visual reference: https://kaizakin.site/ — minimal navigation, readable content width and restrained section styling. The copy and implementation are original to this portfolio.
