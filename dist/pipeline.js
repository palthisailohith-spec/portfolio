// Illustrative responsibilities, not a reconstruction of employer job commands or run data.
const views = {
  before: {
    label: 'Application-owned pipeline configuration',
    description: 'The frontend already had a custom GitLab CI pipeline. The migration changed how its definition was maintained; it does not establish that testing or security checks were previously absent.',
    items: [
      { id: 'configuration', title: 'Application configuration', purpose: 'A pipeline defined for the application.', detail: 'The frontend used application-specific GitLab CI configuration. This view identifies ownership of that definition; it does not reconstruct the original job graph.' },
      { id: 'existing-jobs', title: 'Existing job definitions', purpose: 'Existing checks, without an invented inventory.', detail: 'The original individual jobs and their policies are not documented here. Their presence or absence cannot be inferred from the move to a reusable component.' }
    ]
  },
  after: {
    label: 'Organisation-standard component / shared job definitions',
    description: 'The implemented frontend migration adopted a reusable golden-path component supplying Build, Lint, Test, Audit and SonarQube jobs. Select a job to inspect its responsibility.',
    items: [
      { id: 'build', title: 'Build', purpose: 'Produce application build output.', detail: 'The shared component supplies the build job definition. Application configuration determines its commands and output artifacts; no particular build tool or artifact format is claimed here.' },
      { id: 'lint', title: 'Lint', purpose: 'Check source against configured static rules.', detail: 'The component provides a consistent place to run lint checks. The specific linter, rules and failure policy depend on configuration and are not reconstructed in this illustration.' },
      { id: 'test', title: 'Test', purpose: 'Run the configured automated tests.', detail: 'The reusable test job executes the application’s configured tests. This view makes no claim about the test framework, coverage, results or successful job runs.' },
      { id: 'audit', title: 'Audit', purpose: 'Provide the pipeline’s audit step.', detail: 'The component includes an audit job for dependency or security review. Its exact scanner, scope and enforcement policy are not specified here; no findings or pass status are shown.' },
      { id: 'sonarqube', title: 'SonarQube', purpose: 'Analyse code with SonarQube.', detail: 'The shared workflow includes SonarQube analysis. Project settings determine analysis and quality-gate conditions; this illustration does not report a gate result or production quality score.' }
    ]
  }
};

export function initPipeline() {
  const study = document.querySelector('.pipeline-study');
  if (!study) return;
  const canvas = study.querySelector('#pipeline-canvas');
  const detail = study.querySelector('#pipeline-detail');
  const switches = [...study.querySelectorAll('[data-pipeline]')];
  const selected = { before: 0, after: 0 };
  let current = 'after';
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  function select(index, focus = false) {
    const item = views[current].items[index];
    selected[current] = index;
    const tabs = [...canvas.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    detail.setAttribute('aria-labelledby', tabs[index].id);
    study.querySelector('#pipeline-detail-index').textContent = `${String(index + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')} · Selected ${current === 'after' ? 'job' : 'configuration'}`;
    study.querySelector('#pipeline-detail-title').textContent = item.purpose;
    study.querySelector('#pipeline-detail-description').textContent = item.detail;
    if (focus) tabs[index].focus();
  }

  function render(view) {
    current = view;
    study.dataset.view = view;
    switches.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pipeline === view)));
    const data = views[view];
    const label = element('p', data.label, 'pipeline-component-label');
    label.id = 'pipeline-component-label';
    const row = element('div', '', 'pipeline-stages');
    row.setAttribute('role', 'tablist');
    row.setAttribute('aria-label', view === 'after' ? 'Golden-path job responsibilities' : 'Custom pipeline definition');
    row.setAttribute('aria-orientation', matchMedia('(max-width: 800px)').matches ? 'vertical' : 'horizontal');
    data.items.forEach((item, index) => {
      const button = element('button', '', 'pipeline-stage');
      button.type = 'button';
      button.id = `pipeline-${view}-${item.id}`;
      button.dataset.stage = item.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'pipeline-detail');
      const number = element('span', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      button.append(number, document.createTextNode(item.title));
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', event => {
        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? data.items.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + data.items.length) % data.items.length;
        select(next, true);
      });
      row.append(button);
    });
    canvas.replaceChildren(label, row);
    study.querySelector('#pipeline-description').textContent = data.description;
    select(selected[view]);
  }
  switches.forEach((button, index) => {
    button.addEventListener('click', () => render(button.dataset.pipeline));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? switches.length - 1 : (index + 1) % switches.length;
      render(switches[next].dataset.pipeline);
      switches[next].focus();
    });
  });
  matchMedia('(max-width: 800px)').addEventListener('change', event => {
    canvas.querySelector('[role="tablist"]').setAttribute('aria-orientation', event.matches ? 'vertical' : 'horizontal');
  });
  render(current);
}
