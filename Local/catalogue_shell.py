"""Shared reference presentation. No engine, profile, save or network access."""
import re
LINKS=[('guide','http://127.0.0.1:8878/','Guide'),('characters','http://127.0.0.1:8875/?collection=roster','Characters'),('ships','http://127.0.0.1:8876/','Ships'),('goods','http://127.0.0.1:8877/','Goods')]
def header(active):
    links=''.join('<a href="'+url+'"'+(' aria-current="page"' if key==active else '')+'>'+label+'</a>' for key,url,label in LINKS)
    return '<header class="catalogue-header"><a class="catalogue-brand" href="/"><svg class="catalogue-emblem" aria-hidden="true" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12"/><ellipse cx="20" cy="20" rx="19" ry="8" transform="rotate(-35 20 20)"/><circle cx="31" cy="9" r="2"/></svg><span>Spacetrader<small class="catalogue-context" title="Complete game reference, independent of players and saved voyages.">Game reference</small></span></a><nav class="catalogue-links" aria-label="Spacetrader sites">'+links+'<a class="play-link" href="http://127.0.0.1:8774/">Play game ↗</a></nav></header>'
def present_header(data,active):
    page=data.decode('utf-8')
    if active=='goods' and '<article id="formula-content" class="formula-content">' in page:
        from formula_notation import present_reference
        page=present_reference(page)
    return re.sub(r'<header class="catalogue-header">.*?</header>',lambda _:header(active),page,count=1,flags=re.S).encode('utf-8')
