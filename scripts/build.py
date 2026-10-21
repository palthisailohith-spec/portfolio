#!/usr/bin/env python3
"""Dependency-free static build. Editorial content is in src/content.json."""
from pathlib import Path
import json, shutil, html, argparse
from urllib.parse import urlparse, urljoin
root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url', default=json.loads((root/'site.json').read_text())['url'])
args = parser.parse_args()
url = args.base_url.rstrip('/') + '/'
parsed = urlparse(url)
if parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment:
    parser.error('--base-url must be an absolute HTTPS site URL without a query or fragment')
content = json.loads((root/'src/content.json').read_text())
escape = html.escape
capabilities=[]
for i,c in enumerate(content['capabilities']):
    capabilities.append(f'<button role="tab" id="capability-{c["id"]}" aria-controls="capability-panel" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}" data-capability="{c["id"]}"><span>0{i+1}</span>{escape(c["name"])}<b aria-hidden="true">↗</b></button>')
journey=[]
for i,j in enumerate(content['journey']):
    # Associate-role delivery work is explained locally; do not link it to a different employer's CI/CD case.
    action=f'<button class="inline-link" data-case="{j["case"]}">Related work ↗</button>' if j.get('case') else ''
    journey.append(f'<article><span class="timeline-dot" aria-hidden="true"></span><p class="career-period">{escape(j["period"])}</p><h3>{escape(j["role"])}</h3><p class="career-company">{escape(j["company"])}</p><p>{escape(j["summary"])}</p>{action}</article>')
page=(root/'src/template.html').read_text().replace('{{CAPABILITY_TABS}}',''.join(capabilities)).replace('{{TIMELINE}}',''.join(journey))
for key, field in [('LINE', 'line'), ('EXAMPLE', 'example'), ('TOOLS', 'tools')]:
    page=page.replace('{{CAPABILITY_'+key+'}}', escape(content['capabilities'][0][field]))
page=page.replace('{{SOCIAL_IMAGE}}', escape(urljoin(url, 'assets/social-card.png'), quote=True))
page=page.replace('{{DEPLOYMENT_METADATA}}', f'<link rel="canonical" href="{escape(url, quote=True)}"><meta property="og:url" content="{escape(url, quote=True)}">')
(root/'dist').mkdir(exist_ok=True)
(root/'dist/robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {url}sitemap.xml\n')
(root/'dist/sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{escape(url)}</loc></url></urlset>\n')
(root/'dist/index.html').write_text(page)
for name in ['styles.css','app.js','pipeline.js','content.json']:
    shutil.copy2(root/'src'/name,root/'dist'/name)
print('Built static portfolio → dist/')
