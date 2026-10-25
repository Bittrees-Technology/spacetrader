#!/usr/bin/env python3
"""Read-only pricing lab: drive the real local JavaScript engine from Python."""
import argparse, json, pathlib, shutil, subprocess, tempfile, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--years',type=int,default=100,help='Minimum calendar game years, rounded up to complete pricing cycles, 4–1000 (default 100)')
    parser.add_argument('--engine',type=pathlib.Path,default=pathlib.Path.home()/'Applications/Spacetrader.app/Contents/Resources/Browser/engine.js')
    parser.add_argument('--catalogue',type=pathlib.Path,help='Existing goods JSON; default reads the loopback catalogue')
    parser.add_argument('--output',type=pathlib.Path,required=True,help='New output folder; existing results are preserved')
    args=parser.parse_args()
    if not 4<=args.years<=1000:parser.error('--years must be 4–1000')
    if not args.engine.is_file():parser.error('Game engine is unavailable; specify --engine')
    if args.output.exists():parser.error('Output folder exists; choose a new folder to preserve earlier results')
    node=shutil.which('node')
    if not node:parser.error('Existing Node runtime is required; nothing will be installed')
    catalogue=args.catalogue.read_bytes() if args.catalogue else urllib.request.urlopen('http://127.0.0.1:8877/api/goods',timeout=90).read()
    if len(catalogue)>32*1024*1024:parser.error('Catalogue exceeds bounded input size')
    json.loads(catalogue)
    args.output.mkdir(parents=True)
    with tempfile.TemporaryDirectory(prefix='spacetrader-pricing-') as temp:
        source=pathlib.Path(temp)/'catalogue.json';source.write_bytes(catalogue)
        result=subprocess.run([node,str(ROOT/'Tools/pricing_lab.cjs'),str(args.engine.resolve()),str(args.years),str(source),str(args.output.resolve())],cwd=ROOT,timeout=max(300,args.years*5))
    if result.returncode:raise SystemExit(result.returncode)
    print('Pricing models and audit:',args.output.resolve())
if __name__=='__main__':main()
