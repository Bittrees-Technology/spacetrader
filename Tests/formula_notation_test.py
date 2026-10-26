"""Presentation regression: original rules, valid MathML and reviewed source coverage."""
from pathlib import Path
import hashlib,json,sys,unittest,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'Local'))
from formula_notation import cards,guide_cards,typeset,present_reference,mul,add,diff,val
from html.parser import HTMLParser

class SourceBlocks(HTMLParser):
    def __init__(self):super().__init__();self.on=False;self.text='';self.rows=[]
    def handle_starttag(self,t,a):
        if t=='pre':self.on=True;self.text=''
    def handle_data(self,d):
        if self.on:self.text+=d
    def handle_endtag(self,t):
        if t=='pre':self.on=False;self.rows.append(self.text)
def blocks(page):
    parser=SourceBlocks();parser.feed(page);return parser.rows

class NotationTests(unittest.TestCase):
    def test_every_source_block_retained_and_fingerprinted(self):
        witness=json.loads((ROOT/'Local/formula-notation-witness.json').read_text())
        for scope,path,count in [('formulas','Local/goods-catalogue/formulas.html',40),('guide','Local/guide-catalogue/fragment.html',4)]:
            source=(ROOT/path).read_text();output=typeset(source,scope)
            self.assertEqual(blocks(source),blocks(output))
            self.assertEqual(len(blocks(output)),count)
            self.assertEqual(output.count('<figure class="equation-card">'),count)
            self.assertEqual([hashlib.sha256(s.encode()).hexdigest() for s in blocks(output)],[w['sha256'] for w in witness[scope]])
            self.assertEqual(typeset(output,scope),output)
    def test_changed_rule_cannot_receive_a_stale_summary(self):
        source=(ROOT/'Local/goods-catalogue/formulas.html').read_text().replace('0.026 + 0.020','0.027 + 0.020',1)
        with self.assertRaisesRegex(ValueError,'source changed'):typeset(source,'formulas')
    def test_mathml_has_real_fractions_powers_and_valid_arity(self):
        count=0
        for item in cards+guide_cards:
            self.assertTrue(item[3],item[0])
            for expression in item[3]:
                root=ET.fromstring(expression)
                for el in root.iter():
                    self.assertNotIn('<m',el.text or '')
                    if el.tag in ['mfrac','msub','msup','munder']:self.assertEqual(len(el),2,(item[0],el.tag))
                count+=1
        self.assertGreater(count,60)
        bank=ET.fromstring(cards[38][3][0]);self.assertEqual(bank.find('.//msup')[1].tag,'mfrac')
    def test_grouping_preserves_arithmetic_precedence(self):
        for expression in [mul(val(2),add(val(3),val(4))),diff(val(10),add(val(3),val(4)))]:
            tree=ET.fromstring(expression)
            self.assertEqual(tree[-1][0].text,'(')
            self.assertEqual(tree[-1][-1].text,')')
    def test_generated_page_is_current_and_static(self):
        source=(ROOT/'Local/goods-catalogue/formulas.html').read_text()
        page=(ROOT/'Local/goods-catalogue/formulas-presented.html').read_text()
        self.assertEqual(present_reference(source),page)
        self.assertNotIn('cdn.',page)
        self.assertNotIn('MathJax',page)
        self.assertIn('Society of Actuaries',page)

if __name__=='__main__':unittest.main()
