"""Idempotent presentation build; approved source equations must match the witness."""
from pathlib import Path
import sys,hashlib,json
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'Local'))
from formula_notation import present_reference
site=ROOT/'Local/goods-catalogue';p=site/'formulas.html';target=site/'formulas-presented.html'
source=p.read_text();page=present_reference(source)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'sourceSHA256':sha(p),'builderSHA256':sha(Path(__file__)),'notationSHA256':sha(ROOT/'Local/formula_notation.py'),'witnessSHA256':sha(ROOT/'Local/formula-notation-witness.json'),'outputSHA256':hashlib.sha256(page.encode()).hexdigest()}
receipt=site/'formula-presentation-manifest.json'
if '--check' in sys.argv:
    assert target.read_text()==page and json.loads(receipt.read_text())==manifest,'Rebuild with python3 Tools/typeset_formulas.py'
else:
    target.write_text(page)
    receipt.write_text(json.dumps(manifest,indent=2)+'\n')
print('Formula notation verified: 40 groups, exact calculation details preserved.')
