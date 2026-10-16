import { projects } from './projects.js';

const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

function updateThemeButton() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeColor.setAttribute('content', dark ? '#171816' : '#fafaf9');
}

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try { localStorage.setItem('lohith-theme', nextTheme); } catch {}
  updateThemeButton();
});
updateThemeButton();

document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('palthi.sailohith@gmail.com');
    status.textContent = 'Email copied.';
  } catch {
    status.textContent = 'palthi.sailohith@gmail.com';
  }
});

function updateTime() {
  const now = new Date();
  const time = document.getElementById('local-time');
  time.textContent = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(now) + ' IST';
  time.dateTime = now.toISOString();
  document.getElementById('year').textContent = now.getFullYear();
}
updateTime();
setInterval(updateTime, 60000);

function safeProjectUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

const list = document.getElementById('project-list');
const publishedProjects = projects.filter(project => project.title && project.description);
for (const project of publishedProjects) {
  const article = document.createElement('article');
  article.className = 'project-item';
  const heading = document.createElement('h3');
  heading.textContent = project.title;
  const description = document.createElement('p');
  description.textContent = project.description;
  article.append(heading, description);
  const tags = document.createElement('div');
  tags.className = 'project-tags';
  for (const technology of project.technologies || []) {
    const tag = document.createElement('span');
    tag.textContent = technology;
    tags.append(tag);
  }
  article.append(tags);
  const links = document.createElement('div');
  links.className = 'project-links';
  for (const [label, value] of [['Repository', project.repository], ['Live demo', project.demo]]) {
    const url = safeProjectUrl(value);
    if (!url) continue;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label + ' ↗';
    links.append(link);
  }
  article.append(links);
  list.append(article);
}
if (publishedProjects.length) {
  document.getElementById('projects-empty').hidden = true;
  document.getElementById('project-count').textContent = String(publishedProjects.length).padStart(2, '0');
}
