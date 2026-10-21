#!/usr/bin/env python3
"""Validate generated structure, content references and bundled assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, re
ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.references, self.paths, self.cases = [], [], [], []
        self.headings = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'h1': self.headings += 1
        if 'data-case' in attrs: self.cases.append(attrs['data-case'])
        for name in ('aria-controls', 'aria-labelledby'):
            self.references.extend(attrs.get(name, '').split())
        for name in ('href', 'src'):
            value = attrs.get(name, '')
            if value.startswith('#'): self.references.append(value[1:])
            elif value and not urlsplit(value).scheme: self.paths.append(value)
        if attrs.get('target') == '_blank':
            assert 'noopener' in attrs.get('rel', ''), 'Unsafe new-tab link'
page = (DIST/'index.html').read_text()
doc = Document()
doc.feed(page)
assert doc.headings == 1, 'Expected one primary heading'
assert len(doc.ids) == len(set(doc.ids)), 'Duplicate ID'
assert set(doc.references) <= set(doc.ids), 'Broken anchor or ARIA reference'
assert all((DIST/path).is_file() for path in doc.paths), 'Missing local asset'
assert '{{' not in page, 'Unbuilt template'
assert (DIST/'assets/Sai-Lohith-Resume.pdf').read_bytes().startswith(b'%PDF-')
assert (DIST/'assets/social-card.png').read_bytes().startswith(b'\x89PNG')
content = json.loads((DIST/'content.json').read_text())
case_ids = {case['id'] for case in content['cases']}
assert len(case_ids) == 3
assert set(doc.cases) <= case_ids, 'Unknown case-study button target'
assert page.count('href="assets/Sai-Lohith-Resume.pdf"') == 3
assert 'localhost' not in page and 'terminal.local' not in page, 'Local-only URL in production HTML'
for case in content['cases']:
    assert case['constraints'] and case['delivered']
    assert all(item['title'] and item['description'] for item in case['contributions'])
assert len(content['journey']) == 4
assert len(content['capabilities']) == 6
assert set(content['modes']) == {'delivery', 'platform', 'reliability'}
for mode in content['modes'].values():
    assert len(mode['nodes']) == 5
    assert all(node['case'] in case_ids for node in mode['nodes'])
for item in content['capabilities']:
    assert not item.get('case') or item['case'] in case_ids
for name in ('styles.css', 'app.js', 'pipeline.js', 'content.json'):
    assert (ROOT/'src'/name).read_bytes() == (DIST/name).read_bytes(), f'Stale {name}'
for script in DIST.glob('*.js'):
    for relative in re.findall(r"from\s+['\"](\.[^'\"]+)['\"]", script.read_text()):
        assert (script.parent/relative).is_file(), f'Missing JavaScript module: {relative}'
print('PASS: document structure, anchors, ARIA references, asset paths, resume, content references, build freshness')
