from pathlib import Path
import re,hashlib,base64,json
root=Path(__file__).resolve().parents[1];source=root/'Browser'
names=re.findall(r'<script defer src="([^"?]+)(?:\?[^"]*)?"></script>',(source/'index.html').read_text())
assert len(names)==len(set(names)) and names.index('stock-pricing.js')<names.index('engine.js')
expected=[]
for name in names:
 text=(source/name).read_bytes().replace(b'src="icon.svg"',b'src="data:image/svg+xml;base64,'+base64.b64encode((source/'icon.svg').read_bytes())+b'"');h=hashlib.sha256()
 if name=='station-cast.js':
  for portrait in (source/'station-portraits').glob('*.svg'):
   text=text.replace(('station-portraits/'+portrait.name).encode(),b'data:image/svg+xml;base64,'+base64.b64encode(portrait.read_bytes()))
 if name=='portraits.js':
  end=0
  for match in re.finditer(rb'portraits/[^"\s]+\.jpg',text):
   h.update(text[end:match.start()]);h.update(b'data:image/jpeg;base64,');h.update(base64.b64encode((source/match.group().decode()).read_bytes()));end=match.end()
  h.update(text[end:])
 else:h.update(text)
 expected.append(h.hexdigest())
actual=[];inside=False;buffer=b'';h=None
with (root/'Spacetrader Browser.html').open('rb') as stream:
 while True:
  chunk=stream.read(65536)
  if not chunk:break
  buffer+=chunk
  while True:
   marker=b'</script>' if inside else b'<script>';index=buffer.find(marker)
   if index<0:
    if len(buffer)>len(marker):
     if inside:h.update(buffer[:-len(marker)])
     buffer=buffer[-len(marker):]
    break
   if inside:h.update(buffer[:index]);actual.append(h.hexdigest());inside=False
   else:h=hashlib.sha256();inside=True
   buffer=buffer[index+len(marker):]
print('matches',[(n,a==e) for n,a,e in zip(names,actual,expected)])
assert not inside and actual==expected,'Portable code/artwork does not match canonical source'
report={'portable':str(root/'Spacetrader Browser.html'),'scripts':dict(zip(names,actual)),'allScriptsMatch':True,'inlinePortraitBytesMatchSource':True,'legacyAliasMatches':(root/'Heliocline Browser.html').resolve()==(root/'Spacetrader Browser.html').resolve()}
(root/'Build/transition-portable-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
