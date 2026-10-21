#!/usr/bin/env python3
"""Reject accidental credentials, private tooling and unrelated public files."""
from pathlib import Path
import re, subprocess

ROOT = Path(__file__).resolve().parents[1]
allowed = {
    '.gitignore', '.github/workflows/pages.yml', 'README.md', 'site.json',
    'scripts/build.py', 'scripts/check.py', 'scripts/check-public.py',
    'src/template.html', 'src/styles.css', 'src/app.js', 'src/pipeline.js', 'src/content.json',
    'tests/responsive.html', 'dist/index.html', 'dist/styles.css', 'dist/app.js',
    'dist/pipeline.js', 'dist/content.json', 'dist/robots.txt', 'dist/sitemap.xml',
    'dist/assets/favicon.svg', 'dist/assets/social-card.png', 'dist/assets/Sai-Lohith-Resume.pdf'
}
patterns = [
    rb'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',
    rb'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}',
    rb'github_pat_[A-Za-z0-9_]{70,}',
    rb'(?:AKIA|ASIA)[A-Z0-9]{16}',
    rb'\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}',
    rb'https?://[^\s/@:]+:[^\s/@]+@',
]
names = subprocess.check_output(
    ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT
).decode().split('\0')
checked = 0
for name in filter(None, names):
    path = ROOT / name
    if not path.exists():  # Locally removed tracked file, before staging.
        continue
    assert name in allowed, f'Unexpected public file: {name}'
    assert not path.is_symlink(), f'Symlink needs explicit review: {name}'
    data = path.read_bytes()
    assert len(data) < 10 * 1024 * 1024, f'Unexpected large public file: {name}'
    assert not any(re.search(pattern, data) for pattern in patterns), f'Potential credential: {name}'
    checked += 1
print(f'PASS: {checked} public files match the reviewed allowlist; no known credential patterns')
