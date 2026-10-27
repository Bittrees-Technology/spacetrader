"""Reviewed mathematical reading layer; never evaluates or changes game rules."""
from pathlib import Path
import hashlib, html, json, re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

def node(tag, *children, **attrs):
    attributes=''.join(' '+k+'="'+html.escape(str(v),quote=True)+'"' for k,v in attrs.items())
    return '<'+tag+attributes+'>'+''.join(children)+'</'+tag+'>'
def txt(s): return node('mtext',html.escape(str(s)))
def op(s): return node('mo',html.escape(s))
def val(s):
    s=str(s)
    if re.fullmatch(r'-?\d+(\.\d+)?',s): return node('mn',s.replace('-', '−'))
    return node('mi',html.escape(s))
def row(*s): return node('mrow',*s)
def sub(s,i): return node('msub',val(s),txt(i))
def power(s,i): return node('msup',s,i if isinstance(i,str) and i.startswith('<m') else val(i))
def frac(a,b): return node('mfrac',a,b)
def fence(s): return row(op('('),s,op(')'))
def fn(name,*args):
    if name in ('ceil','floor') and len(args)==1:
        a,b=('⌈','⌉') if name=='ceil' else ('⌊','⌋')
        return row(op(a),args[0],op(b))
    return row(node('mi',html.escape(name),mathvariant='normal'),fence(row(*sum((([op(',')] if i else [])+[a] for i,a in enumerate(args)),[]))))
def add(*args): return row(*sum((([op('+')] if i else [])+[a] for i,a in enumerate(args)),[]))
def additive(s):
    e=ET.fromstring(s)
    return e.tag=='mrow' and any(c.tag=='mo' and c.text in ('+','−') for c in e) and not (len(e)>0 and e[0].tag=='mo' and e[0].text=='(')
def mul(*args): return row(*sum((([op('×')] if i else [])+[fence(a) if additive(a) else a] for i,a in enumerate(args)),[]))
def diff(a,b): return row(a,op('−'),fence(b) if additive(b) else b)
def eq(a,b): return row(a,op('='),b)
def sum_over(term,index='j'): return row(node('munder',op('∑'),txt(index)),term)
def product(term,index): return row(node('munder',op('∏'),txt(index)),term)
def clamp(x,lo,hi): return fn('clamp',x,val(lo),val(hi))
def pct(s): return row(val(s),op('%'))
def d(name): return txt(name)

# Symbols are local to each card, so readers need not memorize a global alphabet.
q=val('q');K=val('K');spread=val('s');base=val('b');price=sub('p','m')
cards=[]
def card(title, explanation, legend, *equations):
    cards.append((title,explanation,legend,equations))

card('Stock sets the marginal quote','The centered stock curve sets the mid-price; each order clears one lot at a time.',
     [('q','physical stock, in lots'),('K','storage ceiling, in lots'),('s','spread on each side'),('p₀','rounded base value × logistics, with a five-credit floor'),('pₘ(q)','rounded mid-price at stock q'),('f(q), w(q)','bounded fill and scarcity weight')],
     eq(fn('f',q),clamp(frac(q,K),'0','1')),
     eq(fn('w',q),frac(add(val(1),frac(fn('tanh',mul(val(2),fence(diff(val(1),mul(val(2),fn('f',q)))))),fn('tanh',val(2)))),val(2))),
     eq(fn('pₘ',q),fn('max',val(5),fn('round',mul(sub('p','0'),fence(add(fn('exp',val('-0.085')),mul(fence(diff(fn('exp',val('0.085')),fn('exp',val('-0.085')))),fn('w',q)))))))),
     eq(sub('p','ask'),fn('ceil',mul(fn('pₘ',diff(q,val('0.5'))),fence(add(val(1),spread))))),
     eq(sub('p','bid'),fn('max',val(1),fn('floor',mul(fn('pₘ',add(q,val('0.5'))),fence(diff(val(1),spread)))))))
card('A geometric value ladder','Each tier multiplies unrounded base value by 1.25; rounding sets five-credit increments.',
     [('b','base value in credits'),('k','assigned value tier')],eq(base,mul(val(5),fn('round',frac(mul(val(80),power(val('1.25'),'k')),val(5))))))
card('Regional and local geography','The local factor is blended with its regional reference.',
     [('r','local orbital radius, in kilometres'),('R','regional factor'),('L','local factor'),('λ','local blending weight')],
     eq(val('λ'),add(val('0.16'),mul(val('0.12'),fn('min',val(1),node('msqrt',frac(val('r'),val(1000000))))))),
     eq(val('G'),mul(power(val('R'),'0.8'),power(fence(frac(val('L'),val('R'))),'λ'))))
card('Exporter and importer references','Use the exporter case when any station in the system exports the item.',
     [('a','configured distance from the Sun, in AU'),('R','regional factor')],
     eq(sub('R','exporter'),add(val('0.90'),mul(val('0.025'),fn('ln',add(val(1),val('a')))))),
     eq(sub('R','otherwise'),add(val('1.04'),mul(val('0.055'),fn('ln',add(val(1),val('a')))))))
card('Trading eligibility','A good can be offered through production, declared imports or transit stock. Buying eligibility also includes consumption.',[('P','local production'),('C','local consumption')],
     eq(d('Station sells'),row(fence(row(val('P'),op('>'),val(0))),op('∨'),d('retail import'),op('∨'),d('transit stock'))),
     eq(d('Station buys'),row(fence(row(val('C'),op('>'),val(0))),op('∨'),d('station sells'))))
card('Ingredients become outputs','Reviewed process capacities determine output, ingredient use and final demand.',
     [('Bᵍʲ','output lots of good g per batch j'),('Aᵍʲ','input lots of good g per batch j'),('xⱼ','reviewed batches per day')],
     eq(sub('P','0, g'),sum_over(mul(sub('B','g, j'),sub('x','j')))),
     eq(sub('I','0, g'),sum_over(mul(sub('A','g, j'),sub('x','j')))),
     eq(sub('D','g'),sum_over(mul(fence(diff(sub('B','g, j'),sub('A','g, j'))),sub('x','j')))))
card('The production cycle','All three planned output tiers follow the same 1,440-day phase.',
     [('t','game day'),('μ','tier mean: 20,000 / 10,000 / 3,000 lots per day'),('ω','angular frequency in radians per day')],
     eq(val('ω'),frac(mul(val(2),val('π')),val(1440))),
     eq(fn('P',val('t')),mul(val('μ'),fence(add(val(1),mul(val('0.4'),fn('cos',mul(val('ω'),fence(diff(val('t'),val(600)))))))))))
card('Reserves absorb the seasonal imbalance','Seasonal production and use build or draw down the reserve around its mean.',
     [('B(t)','reference stock in lots'),('B̄','mean reserve'),('X, Y','seasonal flow coefficients'),('ω','angular frequency')],
     eq(fn('B',val('t')),add(val('B̄'),frac(diff(mul(val('X'),fn('sin',mul(val('ω'),val('t')))),mul(val('Y'),fn('cos',mul(val('ω'),val('t'))))),val('ω')))),
     eq(d('Reserve ratio'),frac(fn('B',val('t')),val('B̄'))))
card('Availability is bounded','The station’s role and its reserve ratio set the availability diagnostic.',
     [('aᵣ','role availability'),('ρ','reserve divided by mean reserve')],
     eq(val('A'),clamp(mul(sub('a','r'),val('ρ')),'0.25','1.70')))
card('One physical stock balance','Production and received cargo add stock; actual use and dispatch remove it.',
     [('q_d','opening stock on day d'),('P, C','actual production and use'),('R, D','cargo received and dispatched')],
     eq(sub('q','d+1'),diff(add(sub('q','d'),val('P'),val('R')),add(val('C'),val('D')))),
     eq(d('Retail available'),fn('min',fn('floor',diff(q,d('protected stock'))),diff(d('daily allocation'),d('already bought')))))
card('Freight commission has a profit cap','The captain receives a contextual share of the pool, subject to a cap relative to the station’s retained profit.',
     [('Π','positive pool after acquisition and the expense ceiling'),('s','contextual share, capped at 0.25'),('c','captain commission'),('Π − c','station retained profit')],
     eq(val('Π'),fn('max',val(0),diff(diff(d('invoice'),d('source cost')),d('expense ceiling')))),
     eq(val('c'),fn('floor',frac(mul(val('Π'),val('s')),add(val(1),val('s'))))),
     row(val('c'),op('≤'),fn('floor',mul(val('0.25'),fence(diff(val('Π'),val('c')))))))
card('Private exchange cycles','Private-channel stock and demand replenish on deterministic fourteen-day cycles.',
     [('d','game day'),('k','cycle index'),('b, s','lots bought and sold by the captain')],
     eq(val('k'),fn('floor',frac(val('d'),val(14)))),
     eq(d('Remaining stock'),add(diff(d('initial stock'),val('b')),val('s'))),
     eq(d('Remaining demand'),add(diff(d('initial demand'),val('s')),val('b'))))
card('Traveller bid and ask','Traveller quotes apply fixed purchase and sale factors to base value.',
     [('b','base value in credits')],eq(sub('p','ask'),fn('ceil',mul(val('1.12'),base))),eq(sub('p','bid'),fn('floor',mul(val('0.88'),base))))
card('Finite screening-package stock','Each package receives a deterministic small stock allocation.',
     [('z','visit seed'),('i','package index'),('b','packages already bought')],
     eq(d('Stock'),diff(add(val(1),row(fn('floor',frac(val('z'),add(val(359),mul(val(42),val('i'))))),op('mod'),val(3))),val('b'))))
card('Engineering spares','Distance sets the baseline; the captain’s discount applies before upward rounding.',
     [('p₀','distance-adjusted baseline'),('d','captain spare discount'),('ε','rounding guard: 10⁻⁹')],
     eq(val('p'),fn('ceil',diff(mul(sub('p','0'),fence(diff(val(1),val('d')))),val('ε')))))
card('Propellant cost','Fuel is charged on the purchased mass after the applicable discount.',
     [('m','fuel purchased, in tonnes'),('p','station price per tonne'),('d','discount'),('ε','rounding guard: 10⁻⁸')],
     eq(val('C'),fn('ceil',fn('max',val(0),diff(mul(val('m'),val('p'),fence(diff(val(1),val('d')))),val('ε'))))))
card('Upgrade cost by level','The reviewed module rate multiplies the rounded hull-price basis and level factor.',
     [('H','hull price'),('r','module rate'),('ℓ','level multiplier: 1, 2 or 4')],
     eq(val('C'),fn('round',mul(fn('ceil',frac(val('H'),val(200))),val(200),val('r'),val('0.005'),val('ℓ')))))
card('Service discounts','Local standing includes one quarter of wider standing, before the score is bounded.',
     [('l','local score'),('w','wider score')],
     eq(d('Effective standing'),clamp(add(val('l'),fn('round',mul(val('0.25'),val('w')))),'-100','100')))
card('Hull repairs','Discounts combine multiplicatively; the repaired integrity shortfall determines the bill.',
     [('h','current integrity percentage'),('u','unit repair cost'),('dₛ, d꜀','service and captain discounts'),('ε','rounding guard: 10⁻⁸')],
     eq(val('d'),diff(val(1),mul(fence(diff(val(1),sub('d','s'))),fence(diff(val(1),sub('d','c')))))),
     eq(val('C'),fn('max',val(0),fn('ceil',diff(mul(fence(diff(val(100),val('h'))),val('u'),fence(diff(val(1),val('d')))),val('ε'))))))
card('Warehouse tier upgrade','The difference between cumulative tier costs sets the fee; eligible reductions apply before rounding.',
     [('B','station base fee'),('L(q)','cumulative cost multiplier at capacity q'),('F','additional-space fee'),('Rₚ, Rₕ','eligible project and hull reductions'),('d','captain warehouse discount'),('ε','rounding guard: 10⁻⁹')],
     eq(val('F'),mul(val('B'),fence(diff(fn('L',sub('q','next')),fn('L',sub('q','current')))))),
     eq(val('C'),fn('max',val(1),fn('ceil',diff(mul(fence(diff(diff(val('F'),sub('R','p')),sub('R','h'))),fence(diff(val(1),val('d')))),val('ε'))))))
card('Warehouse lease return','The ordinary lease combines a time-proportional property return and a capped cargo component.',
     [('A','allocated property value'),('V','cargo value'),('t','term in game days')],
     eq(sub('R','ordinary'),fn('ceil',add(frac(mul(val('A'),val('0.24'),val('t')),val('365.25')),mul(fn('min',mul(val('A'),val('0.12')),mul(val('V'),val('0.003'))),frac(val('t'),val(30)))))))
card('Berth fees settle locally','Deposits pay the fee first; the remainder becomes branch credit.',
     [('F','daily berth fee'),('D','available local deposit')],
     eq(d('Deposit debit'),fn('min',val('D'),val('F'))),eq(d('Credit charge'),diff(val('F'),fn('min',val('D'),val('F')))))
card('A personal supply offer','The discounted purchase remains at least one credit above the ordinary sale quote.',
     [('pᵦ','today’s buy quote'),('pₛ','today’s sell quote'),('d','relationship discount')],
     eq(val('p'),fn('max',add(sub('p','s'),val(1)),fn('ceil',mul(sub('p','b'),fence(diff(val(1),val('d'))))))))
card('Relic dealer quotes','The selling reference is 45% of catalogue value.',
     [('V','catalogue relic value')],eq(sub('p','sell'),fn('floor',mul(val('V'),val('0.45')))))
card('Antiquity appraisal','Condition and authenticity determine the appraisal basis.',
     [('c','condition score'),('α','authenticity factor: 0.50 / 1.00 / 0.15')],
     eq(val('V'),fn('round',mul(fence(add(val(2500),mul(val(100),val('c')))),val('α')))))
card('Extremes of the quote populations','These compare the best and worst observed buy/sell quotes, before journey costs.',
     [('Amin, Amax','lowest and highest buy quotes'),('Bmin, Bmax','lowest and highest sell quotes')],
     eq(sub('G','max'),fn('max',val(0),diff(sub('B','max'),sub('A','min')))),
     eq(sub('L','max'),fn('min',val(0),diff(sub('B','min'),sub('A','max')))))
card('Expected gross trading margin','Break-even pairs contribute zero. The populations compare quote pairs, without a voyage-timing or transport-cost model.',
     [('M','sell quote minus buy quote'),('p₊, p₋','fractions of winning and losing pairs'),('μ₊, μ₋','mean margin within winning and losing pairs')],
     eq(val('M'),diff(d('sell'),d('buy'))),
     eq(fn('E',val('M')),add(mul(sub('p','+'),sub('μ','+')),mul(sub('p','−'),sub('μ','−')))))
card('Daily quote distributions','Each eligible station-day observation has equal weight over the complete cycle.',
     [('pₖ','observed price'),('nₖ','number of observations at that price'),('N','total observations'),('μ, σ','population mean and standard deviation')],
     eq(val('μ'),frac(sum_over(mul(sub('n','k'),sub('p','k')),'k'),val('N'))),
     eq(power(val('σ'),'2'),frac(sum_over(mul(sub('n','k'),power(fence(diff(sub('p','k'),val('μ'))),'2')),'k'),val('N'))),
     eq(val('σ'),node('msqrt',power(val('σ'),'2'))))
card('Net local production','The net physical flow is converted from 250 kg lots into tonnes.',
     [('P(d), C(d)','daily production and consumption in lots'),('E','mean over the reference cycle')],
     eq(d('Net tonnes/day'),mul(val('0.25'),fn('E',diff(fn('P',val('d')),fn('C',val('d')))))))
card('Commodity discovery','The highest qualifying milestone requires all three conditions.',[],
     eq(d('Stage'),fn('max',d('milestones meeting XP ∧ visits ∧ licensed destinations'))))
card('Cargo margin','Recorded purchase basis is allocated proportionally to the goods actually sold.',
     [('rⱼ','successive marginal sale proceeds'),('C','allocated purchase cost')],
     eq(val('M'),diff(sum_over(sub('r','j')),val('C'))))
card('Crew costs and skill support','Daily wages scale with the hired tier. Matching relic and crew skill bonuses use the larger contribution.',
     [('W','seven-day local work budget'),('k','cost multiplier: 1 / 2 / 4'),('e','earned skill'),('r, c','matching relic and on-duty crew bonuses')],
     eq(d('Daily wage'),mul(fn('ceil',frac(val('W'),val(90))),val('k'))),
     eq(d('Effective skill'),fn('min',val(10),add(val('e'),fn('max',val('r'),val('c'))))))
card('Travelling specialist probability','The contextual factors multiply before the chance is bounded.',
     [('b','career-based encounter baseline'),('r','role affinity'),('s','skill affinity'),('g','grade factor')],
     eq(d('Visit chance'),clamp(mul(val('b'),val('r'),val('s'),val('g')),'0.02','0.90')))
card('Matching support effects','Only on-duty crew and equipped relics contribute their matching ability.',
     [('c','matching crew ability'),('r','matching equipped relic ability')],
     eq(d('Support'),fn('max',val('c'),val('r'))),
     eq(d('Combined modifier'),add(d('background'),d('disposition'),d('support'))))
card('Distance-based outbreak probability','The displayed distance relation approaches 60% and starts at 2.5% at Earth.',
     [('r','distance from Earth, in AU'),('p','outbreak probability in the stated report model')],
     eq(val('p'),add(val('0.025'),mul(fence(diff(val('0.60'),val('0.025'))),fence(diff(val(1),fn('exp',frac(row(op('−'),val('r')),val(8)))))))))
card('Liberation commission payment','The reviewed route, work and combat reserve feed the shared reward quote.',
     [('R','shared service reward for the quoted terms')],
     eq(d('Payment'),mul(val(100),fn('ceil',frac(val('R'),val(100))))))
card('Post-liberation recovery bid','The temporary uplift decays over thirty days and stays below the ordinary ask.',
     [('a','days since liberation, within 0 ≤ a < 30'),('w','bounded demand weight'),('A, B','ordinary ask and bid')],
     eq(val('r'),mul(val('0.20'),fence(diff(val(1),frac(val('a'),val(30)))))),
     eq(sub('B','recovery'),fn('max',val('B'),fn('min',diff(val('A'),val(1)),fn('floor',mul(val('B'),fence(add(val(1),mul(val('r'),val('w'))))))))))
card('Reputation becomes harder near the top','The required public progress per score point includes a quadratic term above seventy.',
     [('s','current public reputation score'),('h(s)','progress needed for the next point')],
     eq(fn('h',val('s')),add(val(400),mul(val(20),fn('max',val(0),val('s'))),mul(val(10),power(fn('max',val(0),diff(val('s'),val(70))),'2')))))
bank_equations=(
     eq(sub('a','s,t'),product(power(fence(add(val(1),sub('i','d'))),frac(val(1),val('365.25'))),'d = s, …, t−1')),
     eq(sub('v','s,t'),frac(val(1),sub('a','s,t'))),
     eq(sub('V','t'),mul(sub('V','s'),sub('a','s,t'))))
card('Accumulation at daily quoted rates','With no intervening cash flows, multiply the balance by the accumulation factor across the elapsed days.',
     [('i_d','annual effective quote applicable on day d'),('aₛ,ₜ','accumulation from day s to day t'),('vₛ,ₜ','corresponding actuarial discount factor'),('Vₛ, Vₜ','starting and ending balance')],*bank_equations)
card('Deterministic integer hashes','Hashes apply a fixed-width wrap after each multiplication; the original character and byte handling remains in the details.',
     [('m','bit width: 32 or 64'),('p','the stated hash multiplier'),('b','character code or UTF-8 byte, as specified')],
     eq(sub('h','k+1'),row(mul(fence(row(sub('h','k'),op('⊕'),val('b'))),val('p')),op('mod'),power(val(2),'m'))))

guide_cards=[
 ('Daily funding conditions','Two public cycles feed the bank’s daily funding reference.', [('d','game day'),('F(d)','annual wholesale funding reference')],
  (eq(fn('F',val('d')),add(val('0.026'),mul(val('0.020'),fn('sin',frac(mul(val(2),val('π'),val('d')),val(1440)))),mul(val('0.006'),fn('sin',frac(mul(val(2),val('π'),val('d')),val(330)))))),)),
 ('Branch rate targets','Consumption pressure, export demand and regional profiles set the daily targets.', [('F','funding reference'),('R, O','regional and local adjustments'),('C, T','consumption and export-demand signals')],
  (eq(sub('i','loan target'),fn('max',val('0.012'),add(val('F'),val('0.010'),mul(val('0.4'),val('R')),mul(val('0.5'),val('O')),mul(val('0.003'),val('C')),mul(val('0.002'),val('T'))))),
   eq(sub('i','deposit target'),fn('clamp',add(diff(val('F'),val('0.006')),mul(val('0.2'),val('R')),val('O'),mul(val('0.005'),val('C')),mul(val('0.003'),val('T'))),val('0.002'),add(val('F'),val('0.008')))))),
 ('Daily rate momentum','The target changes acceleration, which updates daily velocity and then the rate level.', [('x','rate level before the update'),('u','daily rate velocity'),('T','today’s target'),('a','bounded daily acceleration')],
  (eq(val('a'),clamp(diff(mul(val('0.0144'),fence(diff(val('T'),val('x')))),mul(val('0.24'),val('u'))),'-0.000025','0.000025')),
   eq(sub('u','new'),clamp(add(val('u'),val('a')),'-0.00035','0.00035')),
   eq(sub('x','new'),add(val('x'),sub('u','new'))))),
 ('Fixed quotes and accumulated balances','The fixed quote adds the full locking premium. Daily balances use annual effective interest.', [('i_f','floating annual quote'),('π','total fixed-rate premium, including the branch component'),('i','applicable annual effective quote'),('n','elapsed game days')],
  (eq(sub('i','fixed'),fn('round4',add(sub('i','f'),val('π')))),
   eq(fn('a',val('n')),power(fence(add(val(1),val('i'))),frac(val('n'),val('365.25'))))))
]

def render_card(item, original):
    title,explanation,legend,equations=item
    math=''.join('<div class="equation-line" role="region" tabindex="0" aria-label="'+html.escape(title,quote=True)+' equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+e+'</math></div>' for e in equations)
    def symbol_html(symbol):
        base,sep,index=symbol.partition('_')
        return html.escape(base)+('<sub>'+html.escape(index)+'</sub>' if sep else '')
    definitions='<dl class="equation-symbols">'+''.join('<div><dt>'+symbol_html(symbol)+'</dt><dd>'+html.escape(meaning)+'</dd></div>' for symbol,meaning in legend)+'</dl>' if legend else ''
    return '<figure class="equation-card"><figcaption>'+html.escape(title)+'</figcaption><p class="equation-reading">'+html.escape(explanation)+'</p>'+math+definitions+'<details class="equation-details"><summary>Exact calculation details</summary>'+original+'</details></figure>'

def typeset(page,scope):
    # Rerunning retains the exact original code, rather than nesting cards.
    page=re.sub(r'<figure class="equation-card">.*?<details class="equation-details"><summary>Exact calculation details</summary>(<pre\b.*?</pre>)</details></figure>',lambda m:m[1],page,flags=re.S)
    witness=json.loads(Path(__file__).with_name('formula-notation-witness.json').read_text())[scope]
    items=cards if scope=='formulas' else guide_cards
    matches=list(re.finditer(r'<pre\b[^>]*>(.*?)</pre>',page,re.S))
    if len(matches)!=len(items) or len(items)!=len(witness):raise ValueError('Formula notation coverage needs review')
    class SourceText(HTMLParser):
        def __init__(self):super().__init__();self.parts=[]
        def handle_data(self,data):self.parts.append(data)
    for m,w in zip(matches,witness):
        parser=SourceText();parser.feed(m[1]);text=''.join(parser.parts)
        if hashlib.sha256(text.encode()).hexdigest()!=w['sha256']:raise ValueError('Formula notation source changed: '+w['firstLine'])
    it=iter(items)
    return re.sub(r'<pre\b[^>]*>.*?</pre>',lambda m:render_card(next(it),m[0]),page,flags=re.S)

def present_reference(source):
    page=typeset(source,'formulas')
    primer='''<aside class="notation-primer" aria-label="How to read these formulas"><h2>Read the model at a glance</h2><p>Each formula group starts with its main relationship and a local symbol key. Open <strong>Exact calculation details</strong> for all conditions, rounding guards and implementation steps.</p><p>Fractions show division; superscripts show powers; subscripts identify days, goods or quote types. <strong>∑</strong> adds terms, <strong>∏</strong> multiplies them, and <strong>⌈x⌉ / ⌊x⌋</strong> round up / down. Rates use decimals: 0.04 = 4% per year.</p><p>Banking uses actuarial accumulation <em>a</em> and discount <em>v</em>; prices, physical flows and probabilities use their usual mathematical notation. Symbols are defined beside each relationship.</p><a href="#banking">Banking notation</a> · <a href="#ranges">Probability and distributions</a> · <a href="#notation">Full notation key</a></aside>'''
    anchor='<article id="formula-content" class="formula-content">'
    assert page.count(anchor)==1
    page=page.replace(anchor,anchor+primer)
    anchor='<h2>Notation and reference source</h2>'
    assert page.count(anchor)==1
    page=page.replace(anchor,anchor+'<p>Effective interest <em>i</em> and discount <em>v</em> follow <a href="https://www.soa.org/globalassets/assets/Files/Edu/2018/exam-fm-notation-terminology-3.pdf" target="_blank" rel="noopener">Society of Actuaries financial-mathematics notation</a>. Here, <em>a</em> denotes accumulation between the stated dates, and <em>v</em> is its reciprocal. Accumulation examples assume no intervening cash flows. The year basis is 365.25 game days.</p>')
    return page
