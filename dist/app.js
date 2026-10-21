import { initPipeline } from './pipeline.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const themeButton = $('#theme-toggle');
function updateTheme() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  $('meta[name="theme-color"]').content = dark ? '#181d17' : '#f4f3ee';
}
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('lohith-atlas-theme', theme); } catch { /* Storage is optional. */ }
  updateTheme();
});
updateTheme();
$('#year').textContent = String(new Date().getFullYear());
initPipeline();
async function copyEmail() {
  const email = 'palthi.sailohith@gmail.com';
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    // Local HTTP previews may lack the secure-context Clipboard API.
    const focused = document.activeElement;
    const field = document.createElement('textarea');
    field.value = email;
    field.readOnly = true;
    field.setAttribute('aria-hidden', 'true');
    Object.assign(field.style, { position: 'fixed', opacity: '0', left: '-9999px' });
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Manual fallback below. */ }
    field.remove();
    focused?.focus({ preventScroll: true });
    return copied;
  }
}
$('#copy-email').addEventListener('click', async () => {
  $('#copy-status').textContent = (await copyEmail()) ? 'Email copied' : 'Select and copy: palthi.sailohith@gmail.com';
});

const icons = {
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v10m12-10v1a6 6 0 0 1-6 6H6"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M12 12 3 7m9 5v10M7.5 4.5l9 5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  cluster: '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="1" y="16" width="8" height="6" rx="1"/><rect x="15" y="16" width="8" height="6" rx="1"/><path d="M12 8v4m-7 4v-4h14v4"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
  chart: '<path d="M3 3v18h18M6 15l5-6 4 4 6-8"/>',
  lines: '<path d="M4 5h16M4 10h12M4 15h16M4 20h9"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>'
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;
}
function textElement(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}
function setupTabKeys(buttons, activate) {
  buttons.forEach((button, index) => button.addEventListener('keydown', event => {
    let next = index;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % buttons.length;
    else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    activate(buttons[next]);
    buttons[next].focus();
  }));
}

async function initialise() {
  const response = await fetch(new URL('./content.json', import.meta.url));
  if (!response.ok) throw new Error('Content could not be loaded.');
  const content = await response.json();
  const cases = new Map(content.cases.map(item => [item.id, item]));
  const dialog = $('#case-dialog');
  let lastOpener = null;
  function openCase(id, opener = document.activeElement) {
    const item = cases.get(id);
    if (!item) return;
    lastOpener = opener;
    $('#dialog-number').textContent = `Engineering case study / ${item.number}`;
    $('#dialog-context').textContent = item.context;
    $('#dialog-title').textContent = item.title;
    $('#dialog-description').textContent = item.description;
    $('#dialog-constraints').textContent = item.constraints;
    $('#dialog-delivered').textContent = item.delivered;
    $('#dialog-contributions').replaceChildren(...item.contributions.map(contribution => {
      const article = textElement('article', '', 'dialog-contribution');
      article.append(textElement('h4', contribution.title), textElement('p', contribution.description));
      return article;
    }));
    $('#dialog-decision').textContent = item.decision;
    $('#dialog-scope').textContent = item.scope;
    document.body.classList.add('modal-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    $('.close-dialog', dialog).focus();
  }
  $$('[data-case]').forEach(button => button.addEventListener('click', () => openCase(button.dataset.case, button)));
  $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (lastOpener?.isConnected) lastOpener.focus();
  });

  let selectedMode = 'delivery';
  let selectedNode = 0;
  const map = $('#system-map');
  const svgNS = 'http://www.w3.org/2000/svg';
  function svgElement(name, attributes) {
    const element = document.createElementNS(svgNS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }
  function drawConnections() {
    const nodes = $$('.map-node', map);
    if (nodes.length !== 5) return;
    $('svg.connection-map', map)?.remove();
    const bounds = map.getBoundingClientRect();
    if (!bounds.width) return;
    const svg = svgElement('svg', { class: 'connection-map', viewBox: `0 0 ${bounds.width} ${bounds.height}`, 'aria-hidden': 'true' });
    const defs = svgElement('defs', {});
    const marker = svgElement('marker', { id: 'connection-arrow', viewBox: '0 0 6 6', refX: '5', refY: '3', markerWidth: '5', markerHeight: '5', orient: 'auto' });
    marker.append(svgElement('path', { d: 'M0 0 6 3 0 6', fill: '#9aaf83' }));
    defs.append(marker); svg.append(defs);
    const rectangles = nodes.map(node => {
      const r = node.getBoundingClientRect();
      return { x: r.x - bounds.x, y: r.y - bounds.y, width: r.width, height: r.height };
    });
    for (let i = 0; i < 4; i++) {
      const a = rectangles[i], b = rectangles[i + 1];
      let d;
      if (Math.abs(a.y - b.y) < 10) {
        d = `M${a.x + a.width + 1} ${a.y + a.height / 2} L${b.x - 3} ${b.y + b.height / 2}`;
      } else {
        const x1 = a.x + a.width / 2, y1 = a.y + a.height + 1, x2 = b.x + b.width / 2, y2 = b.y - 3;
        const mid = (y1 + y2) / 2;
        d = `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
      }
      svg.append(svgElement('path', { d, fill: 'none', stroke: '#9aaf83', 'stroke-width': '1.5', opacity: '.85', 'marker-end': 'url(#connection-arrow)' }));
    }
    map.prepend(svg);
  }
  function selectNode(index, focus = false) {
    selectedNode = index;
    const nodes = content.modes[selectedMode].nodes;
    const node = nodes[index];
    $$('.map-node', map).forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      if (focus && i === index) button.focus();
    });
    $('#node-index').textContent = `${String(index + 1).padStart(2, '0')} / ${String(nodes.length).padStart(2, '0')}`;
    $('#node-title').textContent = node.role;
    $('#node-detail').textContent = node.detail;
    $('#node-tools').textContent = node.tools;
    $('#node-connection').textContent = node.connection;
  }
  function setMode(mode, tabFocus = false) {
    selectedMode = mode;
    const data = content.modes[mode];
    $$('[data-mode]').forEach(button => {
      const active = button.dataset.mode === mode;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && tabFocus) button.focus();
    });
    $('#system-panel').setAttribute('aria-labelledby', `tab-${mode}`);
    $('#mode-kicker').textContent = data.kicker;
    $('#mode-title').textContent = data.title;
    $('#mode-description').textContent = data.description;
    map.replaceChildren();
    data.nodes.forEach((node, index) => {
      const button = document.createElement('button');
      button.className = 'map-node';
      button.type = 'button';
      button.dataset.node = node.id;
      button.setAttribute('aria-label', `${node.title}: ${node.subtitle}`);
      button.setAttribute('aria-controls', 'node-inspector');
      button.innerHTML = icon(node.icon);
      button.append(textElement('i', String(index + 1).padStart(2, '0')), textElement('span', node.title), textElement('small', node.subtitle));
      button.addEventListener('click', () => selectNode(index));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? data.nodes.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + data.nodes.length) % data.nodes.length;
        selectNode(target, true);
      });
      map.append(button);
    });
    selectNode(0);
    requestAnimationFrame(drawConnections);
  }
  const modeButtons = $$('[data-mode]');
  modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  setupTabKeys(modeButtons, button => setMode(button.dataset.mode));
  $('#node-case').addEventListener('click', event => openCase(content.modes[selectedMode].nodes[selectedNode].case, event.currentTarget));
  new ResizeObserver(() => requestAnimationFrame(drawConnections)).observe(map);
  setMode('delivery');

  const dependencies = {
    workload: ['Inspect the workload symptom', 'Review readiness, resource pressure, scheduling and recent changes. Identify which pods are affected before tracing their dependencies.'],
    nodes: ['Follow compute and connectivity', 'Inspect Linux CPU, memory and disk conditions; check scheduling, service routing, DNS, TLS and the path to the dependent service.'],
    storage: ['Inspect the storage dependency', 'Check Ceph/OSD health, identify affected volumes and workloads, recover failed components and verify the dependent pods.']
  };
  $$('[data-dependency]').forEach(button => button.addEventListener('click', () => {
    $$('[data-dependency]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
      item.classList.toggle('active', item === button);
    });
    const [title, description] = dependencies[button.dataset.dependency];
    $('#dependency-title').textContent = title;
    $('#dependency-description').textContent = description;
  }));

  let selectedCapability = content.capabilities[0];
  function setCapability(button) {
    const index = content.capabilities.findIndex(item => item.id === button.dataset.capability);
    const item = content.capabilities[index];
    selectedCapability = item;
    $$('[data-capability]').forEach(tab => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    $('#capability-panel').setAttribute('aria-labelledby', button.id);
    $('#capability-index').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
    $('#capability-title').textContent = item.line;
    $('#capability-example').textContent = item.example;
    $('#capability-tools').textContent = item.tools;
    $('#capability-work').hidden = !item.case;
    $('#capability-explore').hidden = item.id === 'ai';
  }
  const capabilityButtons = $$('[data-capability]');
  capabilityButtons.forEach(button => button.addEventListener('click', () => setCapability(button)));
  setupTabKeys(capabilityButtons, setCapability);
  $('#capability-work').addEventListener('click', event => openCase(selectedCapability.case, event.currentTarget));
  $('#capability-explore').addEventListener('click', () => {
    setMode(selectedCapability.mode);
    $('#system').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    $(`#tab-${selectedCapability.mode}`).focus({ preventScroll: true });
  });

  for (const project of content.projects || []) {
    let repository;
    try { repository = new URL(project.repository); } catch { continue; }
    if (repository.protocol !== 'https:' || !project.title || !project.description) continue;
    const article = textElement('article', '', 'published-project');
    article.append(textElement('h3', project.title), textElement('p', project.description));
    const link = textElement('a', 'Inspect source ↗', 'inline-link');
    link.href = repository.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    article.append(link); $('#published-projects').append(article);
  }
}
initialise().catch(error => {
  console.error(error);
  const notice = textElement('p', 'The interactive guide could not load. Please reload, or explore the professional case studies below.', 'noscript-note');
  $('#system-map').replaceChildren(notice);
});
