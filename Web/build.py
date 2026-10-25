#!/usr/bin/env python3
"""Build the public guest edition without opening a voyage or running local services."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, re, shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(__file__).resolve().parent
OUTPUT = SITE / '.vercel' / 'output'
STATIC = OUTPUT / 'static'
LINKS = {'8878': '/guide/', '8875': '/characters/', '8876': '/ships/',
         '8877': '/goods/', '8774': '/play/'}
RESERVE = 20 * 1024**3


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(relative, data):
    target = STATIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data.encode() if isinstance(data, str) else data)


def clone(source, relative):
    source = source.resolve(strict=True)
    if not source.is_relative_to(ROOT):
        raise ValueError('Asset outside the source tree')
    target = STATIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if sha(target.read_bytes()) == sha(source.read_bytes()):
            return
        target.unlink()  # Only this builder's generated target is replaced.
    copied = subprocess.run(['cp', '-c', '-p', str(source), str(target)],
                            capture_output=True).returncode == 0
    if not copied:
        shutil.copy2(source, target)


def public_links(text):
    for port, prefix in LINKS.items():
        text = re.sub(r'http://(?:127\.0\.0\.1|localhost):' + port + r'/', prefix, text)
    return text


def page(text, section):
    # First scope old single-site routes, then replace the shared navigation.
    text = re.sub(r'((?:href|src)=")/(?!/)', r'\1/' + section + '/', text)
    text = public_links(text)
    active = {'characters': 'characters', 'ships': 'ships', 'goods': 'goods', 'guide': 'guide'}[section]
    spec = importlib.util.spec_from_file_location('public_catalogue_shell', ROOT / 'Local/catalogue_shell.py')
    shell = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(shell)
    header = public_links(shell.header(active))
    text, count = re.subn(r'<header class="catalogue-header">.*?</header>',
                         lambda _: header, text, count=1, flags=re.S)
    if count != 1:
        raise ValueError('Missing reviewed catalogue header: ' + section)
    return text.replace('</head>', '<link rel="icon" href="/icon.svg" type="image/svg+xml"></head>')


def script(text, section):
    # Explicit routes only: do not rewrite SVG fragments, regexes or arithmetic.
    paths = {
        'characters': {'/api/roster': '/characters/data/roster.json'},
        'goods': {'/api/goods': '/goods/data/goods.json',
                  '/api/formulas': '/goods/data/formulas.json',
                  '/api/bonding-curves': '/goods/data/bonding-curves.json',
                  '/curves': '/goods/curves', '/formulas': '/goods/formulas'},
        'ships': {}, 'guide': {}
    }[section]
    for old, new in paths.items():
        text = re.sub(r'([\'"`])' + re.escape(old) + r'(?=[\'"`?#])',
                      lambda m: m[1] + new, text)
    # Local navigation to the section's index, including dynamic query strings.
    text = re.sub(r'([\'"`])/(?=[\'"`?])', lambda m: m[1] + '/' + section + '/', text)
    return public_links(text)


def verified(path, digest):
    data = path.read_bytes()
    if sha(data) != digest:
        raise ValueError('Reference checksum mismatch: ' + str(path.relative_to(ROOT)))
    return data


def build():
    if shutil.disk_usage(ROOT).free < RESERVE + 300 * 1024**2:
        raise RuntimeError('Insufficient space for the public build and 20 GiB reserve')
    check = subprocess.run(['node', 'Tools/check_balance.cjs'], cwd=ROOT, capture_output=True, text=True)
    if check.returncode:
        raise RuntimeError(check.stdout + check.stderr)
    pointer = json.loads((ROOT / 'Balance/current.json').read_text())
    if not re.fullmatch(r'approved-v[1-9][0-9]*/manifest.json', pointer['manifest']):
        raise ValueError('Invalid balance pointer')
    approved = ROOT / 'Balance' / Path(pointer['manifest']).parent
    manifest = json.loads((approved / 'manifest.json').read_text())
    if manifest['revision'] != pointer['revision']:
        raise ValueError('Wrong reference revision')
    browser = ROOT / 'Browser'
    # The output is a fixed, ignored build directory. Reject unexpected existing files.
    if STATIC.exists():
        prior = OUTPUT / 'build-manifest.json'
        if not prior.exists():
            raise RuntimeError('Unrecognised output directory; preserve it for review')
        known = json.loads(prior.read_text())['files']
        unexpected = [str(p.relative_to(STATIC)) for p in STATIC.rglob('*')
                      if p.is_file() and str(p.relative_to(STATIC)) not in known]
        if unexpected:
            raise RuntimeError('Unexpected output files: ' + ', '.join(unexpected[:5]))
        # Only files recorded by the previous generated manifest may be removed.
        for name in known:
            p = STATIC / name
            if p.is_file() and not p.is_symlink():
                p.unlink()
    for source in sorted(browser.rglob('*')):
        if source.is_symlink():
            raise ValueError('Review Browser symlink before publication')
        if source.is_file() and source.suffix in {'.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.avif', '.webp', '.ogg', '.mp3', '.wav', '.txt'}:
            clone(source, Path('play') / source.relative_to(browser))
    app = (browser / 'app.js').read_text()
    guide = "window.open('http://127.0.0.1:8878/','_blank','noopener,noreferrer');"
    if app.count(guide) != 1:
        raise ValueError('Review the public Guide opening adapter')
    app = app.replace(guide, "window.open('/guide/','_blank','noopener,noreferrer');")
    form = '<form id="character-form">'
    if app.count(form) != 1:
        raise ValueError('Review the browser-save notice location')
    app = app.replace(form, '<p class="muted">Progress saves in this browser on this device. Wallet saves and agent play are coming later.</p>' + form)
    # A fresh engine state is an unsigned template, not an existing captain.
    # Keep its placeholder name, balances and map out of the first-visit UI.
    render_start = "function render(){\n if(blocked||!state)return;"
    if app.count(render_start) != 1:
        raise ValueError('Review the public charter setup adapter')
    app = app.replace(render_start, render_start + "if(!state.profile.created){$('app').innerHTML='<header><a class=\"brand charter-home\" href=\"/\"><img src=\"icon.svg\" alt=\"\"><h1>Spacetrader</h1></a></header><main id=\"main\" class=\"charter-welcome\" aria-label=\"New charter\"></main>';scheduleMainModal();return;}")
    creator_head = "modalHead('Your independent charter')"
    close_start = 'function closeModal(force=false){'
    loaded_notice = 'saveFeedback=`Loaded ${state.profile.name} · day ${state.day}. Your previous voyage is kept.`;'
    for expected in [creator_head, close_start, loaded_notice]:
        if app.count(expected) != 1:
            raise ValueError('Review public charter navigation')
    app = app.replace(creator_head, "modalHead('Your independent charter',false)+ '<p><a href=\"/\">Back to site</a></p>'")
    app = app.replace(close_start, close_start + "if(!force&&modalKind==='creator'&&!state.profile.created){location.assign('/');return;}")
    app = app.replace(loaded_notice, "saveFeedback=state.profile.created?`Loaded ${state.profile.name} · day ${state.day}. Your previous voyage is kept.`:'Ready to create your captain. Your previous voyage is kept.';")
    write('play/app.js', app)
    clone(SITE / 'onboarding.css', 'play/onboarding.css')
    index = (browser / 'index.html').read_text()
    index = index.replace('connect-src \'self\' ipc: http://ipc.localhost', "connect-src 'self'")
    public_revision = sha(app.encode() + (SITE / 'onboarding.css').read_bytes())[:12]
    index = index.replace('app.js?v=0.72.257', 'app.js?v=' + public_revision)
    index = index.replace('</head>', '<link rel="stylesheet" href="onboarding.css?v=' + public_revision + '"><meta name="description" content="Explore the solar system in Spacetrader, a single-player space-trading game. Free browser play with local saves."></head>')
    write('play/index.html', index)
    clone(browser / 'icon.svg', 'icon.svg')
    files = {
        'guide': ['index.html', 'guide.js', 'guide.css'],
        'characters': ['index.html', 'catalogue.js', 'catalogue.css'],
        'ships': ['index.html', 'catalogue.css', 'catalogue.js', 'catalogue-model.js', 'ship-viewer.js',
                  'ship-designs.js', 'approved-ships.js', 'ship-specs.js', 'cargo-specs.js', 'ship-rules.js'],
        'goods': ['index.html', 'catalogue.js', 'catalogue.css', 'goods-view.js', 'quote-prices.js',
                  'distribution-view.js', 'curves.html', 'curves.js', 'curve-domain.js', 'curves.css',
                  'formulas.html', 'formulas.js', 'formulas.css', 'mechanics.html', 'mechanics.css']
    }
    source_dirs = {'characters': 'character', 'ships': 'ship', 'goods': 'goods', 'guide': 'guide'}
    guide_manifest = json.loads((ROOT / 'Local/guide-catalogue/reference-manifest.json').read_text())
    verified(ROOT / 'Local/guide-catalogue/index.html', guide_manifest['indexSHA256'])
    mechanics = json.loads((ROOT / 'Local/goods-catalogue/mechanics-manifest.json').read_text())
    if mechanics['revision'] != pointer['revision'] or mechanics['inputs']['formulas'] != manifest['files']['formulas.json']:
        raise ValueError('Stale trading mechanics')
    verified(ROOT / 'Local/goods-catalogue/mechanics.html', mechanics['outputs']['mechanics.html'])
    for section, names in files.items():
        source_dir = ROOT / 'Local' / (source_dirs[section] + '-catalogue')
        for name in names:
            data = (source_dir / name).read_text()
            write(section + '/' + name, page(data, section) if name.endswith('.html') else
                  script(data, section) if name.endswith('.js') else data)
        clone(ROOT / 'Local/catalogue-shell.css', section + '/catalogue-shell.css')
    for source in (ROOT / 'Local/ship-catalogue/vendor/three').iterdir():
        if source.name in {'three.module.js', 'three.core.min.js', 'OrbitControls.js', 'RoomEnvironment.js', 'LICENSE'}:
            clone(source, 'ships/vendor/three/' + source.name)
    clone(browser / 'portrait-renderer.js', 'characters/portrait-renderer.js')
    for source in (browser / 'station-portraits').glob('*.svg'):
        clone(source, 'characters/station-portraits/' + source.name)
    roster_dir = ROOT / 'Local/character-catalogue'
    roster_manifest = json.loads((roster_dir / 'reference-manifest.json').read_text())
    if roster_manifest['mode'] != 'reference':
        raise ValueError('Characters must be a generic reference')
    write('characters/data/roster.json', verified(roster_dir / 'reference-roster.json', roster_manifest['sha256']))
    for name in ['goods.json', 'formulas.json', 'bonding-curves.json']:
        write('goods/data/' + name, verified(approved / name, manifest['files'][name]))
    write('goods/stock-pricing.js', verified(approved / 'stock-pricing.js', manifest['files']['stock-pricing.js']))
    for name in ['LICENSE', 'THIRD_PARTY_NOTICES.md']:
        clone(ROOT / name, name)
    for name in ['index.html', 'landing.css']:
        clone(SITE / name, name)
    write('404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found · Spacetrader</title><h1>Page not found</h1><p><a href="/play/">Return to Spacetrader</a></p></html>')
    write('robots.txt', 'User-agent: *\nAllow: /\n')
    csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    routes = [{'src': '/(.*)', 'headers': {'X-Content-Type-Options': 'nosniff',
               'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
               'Content-Security-Policy': csp, 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'}, 'continue': True},
              *[{'src': '/' + s, 'status': 308, 'headers': {'Location': '/' + s + '/'}} for s in ['play', 'guide', 'characters', 'ships', 'goods']],
              *[{'src': '/goods/' + n, 'dest': '/goods/' + n + '.html'} for n in ['curves', 'formulas', 'mechanics']],
              {'handle': 'filesystem'}, {'src': '/.*', 'dest': '/404.html', 'status': 404}]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'config.json').write_text(json.dumps({'version': 3, 'routes': routes}, indent=2) + '\n')
    built = {str(p.relative_to(STATIC)): sha(p.read_bytes()) for p in sorted(STATIC.rglob('*')) if p.is_file()}
    receipt = {'version': 1, 'mode': 'public-guest-static', 'gameVersion': re.search(r'application-version" content="([^"]+)', index)[1],
               'balance': pointer['revision'], 'engineSHA256': sha((browser / 'engine.js').read_bytes()),
               'bytes': sum(p.stat().st_size for p in STATIC.rglob('*') if p.is_file()), 'files': built}
    (OUTPUT / 'build-manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({k: v for k, v in receipt.items() if k != 'files'} | {'fileCount': len(built)}, indent=2))


if __name__ == '__main__':
    build()
