// Trinkreife (ab 1.3): Trinkfenster schätzen, Status, Gefährdung, Anpassung durch Reife-Notizen.
// Fenster = [trinkbar ab, Höhepunkt ab, Höhepunkt bis, trinkbar bis] in Jahren, jeweils einschließlich.

export const nowYear = () => new Date().getFullYear();

export const STATUS = {
  over: { label: 'Fenster vorbei', color: '#8A2B33', bg: '#F6E1E3', hint: 'Ende überschritten – zuerst trinken' },
  now: { label: 'Jetzt trinken', color: '#A55A12', bar: '#C9813F', bg: '#F8E6D3', hint: 'nach dem Höhepunkt oder Ende bis nächstes Jahr' },
  ready: { label: 'Trinkreif', color: '#2F6B45', bg: '#E1EFE4', hint: 'im Fenster, kein Druck' },
  wait: { label: 'Noch warten', color: '#3E6A92', bg: '#E1EAF3', hint: 'Lagern lohnt sich' }
};
export const STATUS_ORDER = ['over', 'now', 'ready', 'wait'];

// Qualitätsstufen für den Vorschlag beim Anlegen
export const TIERS = [['guts', 'Gutswein'], ['ort', 'Ortswein'], ['lage', 'Erste Lage'], ['top', 'Großes Gewächs'], ['suess', 'Restsüß']];

const FRAGILE = /müller|thurgau|rivaner|grau(er)? ?burgunder|pinot grigio|pinot gris|weiß(er)? ?burgunder|weissburgunder|pinot blanc|sauvignon|gewürztraminer|lugana|muskateller|scheurebe|silvaner|vermentino|albariño|verdejo|rosé|rose\b/i;

// Stufe aus Name, Geschmack und Preis
export function detectTier(w) {
  const n = String(w.name || '').toLowerCase(), st = String(w.style || '').toLowerCase();
  if (/kabinett|spätlese|spaetlese|auslese|beerenauslese|eiswein/.test(n) && !/trocken/.test(st)) return 'suess';
  if (/\bgg\b|großes gewächs|grosses gewächs|grand cru|\bicon\b|dom p[eé]rignon|cristal|krug|comtes|belle [eé]poque|grande? si[eè]cle|barolo|brunello|barbaresco|amarone/.test(n)) return 'top';
  if (/erste lage|1\. ?lage|premier cru|1er cru|smaragd|riserva|reserva|lagenwein|alte reben|vieilles vignes|selektion/.test(n)) return 'lage';
  if (/ortswein|village|federspiel/.test(n)) return 'ort';
  if (/gutswein|steinfeder|\bbasis\b|literwein/.test(n)) return 'guts';
  const p = w.avgPrice != null ? w.avgPrice : w.price;
  if (p == null) return 'ort';
  return p < 12 ? 'guts' : p < 20 ? 'ort' : p < 35 ? 'lage' : 'top';
}

// Versatz in Jahren ab Jahrgang (Champagner ohne Jahrgang: ab Kaufjahr)
function offsets(w, tier) {
  const t = w.wine_type, g = String(w.grape || ''), n = String(w.name || '').toLowerCase();
  if (t === 'Champagner') {
    if (/dom p[eé]rignon|cristal|krug|comtes|belle [eé]poque|grande? si[eè]cle|sir winston|dame/.test(n)) return [9, 12, 22, 27];
    if (w.vintage) return [5, 8, 15, 20];
    return /ros[eé]/.test(n) ? [0, 0, 2, 4] : [0, 0, 3, 5];
  }
  if (t === 'Schaumwein') return /prosecco/i.test(n + ' ' + g) ? [0, 0, 1, 2] : [0, 1, 3, 5];
  if (t === 'Rosé') return [0, 1, 2, 3];
  if (t === 'Süßwein') return [2, 5, 20, 30];
  if (t === 'Rotwein') {
    if (/barolo|brunello|barbaresco|amarone/.test(n)) return [6, 10, 20, 25];
    return { guts: [1, 2, 4, 6], ort: [2, 3, 6, 9], lage: [3, 5, 10, 14], top: [4, 7, 14, 20], suess: [2, 4, 10, 15] }[tier];
  }
  // Weißwein
  if (tier === 'suess') return /auslese|eiswein/.test(n) && !/spätlese/.test(n) ? [5, 10, 25, 30] : /spätlese|spaetlese/.test(n) ? [3, 6, 15, 20] : [2, 4, 10, 15];
  const fragile = FRAGILE.test(g);
  const riesling = /riesling/i.test(g);
  if (tier === 'guts') return fragile ? [1, 1, 2, 4] : [1, 1, 3, 5];
  if (tier === 'ort') return fragile ? [1, 1, 3, 5] : riesling ? [1, 2, 5, 8] : [1, 2, 5, 7];
  if (tier === 'lage') return fragile ? [2, 3, 6, 8] : riesling ? [2, 4, 8, 12] : [2, 3, 7, 10];
  return riesling ? [4, 7, 12, 17] : fragile ? [3, 4, 8, 10] : [3, 5, 10, 14];
}

// Regel-Schätzung; w braucht name, grape, wine_type, vintage, style und optional avgPrice/price, firstBought
export function estimate(w, tier = null) {
  const tr = tier || detectTier(w);
  const base = w.vintage || (w.firstBought ? Number(String(w.firstBought).slice(0, 4)) : nowYear() - (w.wine_type === 'Champagner' ? 0 : 1));
  return offsets(w, tr).map((o) => base + o);
}

// Gespeichertes Fenster oder Regel-Schätzung
export function windowOf(w) {
  if (w.drink_from && w.drink_to) return { win: [w.drink_from, w.peak_from || w.drink_from, w.peak_to || w.drink_to, w.drink_to], src: w.window_src || 'est' };
  return { win: estimate(w), src: 'rule' };
}

export function statusOf(win, y = nowYear()) {
  const [a, , pb, b] = win;
  if (y > b) return 'over';
  if (y > pb || b - y <= 1) return 'now';
  if (y < a) return 'wait';
  return 'ready';
}

// Wie schnell kippt ein Wein nach dem Fenster? Riesling, Champagner, Riserva verzeihen mehr.
export function fragility(w) {
  const n = String(w.name || '').toLowerCase(), g = String(w.grape || '');
  if (w.wine_type === 'Champagner' || /\bgg\b|großes gewächs|riserva|reserva|grand cru/.test(n)) return 0.7;
  if (/riesling/i.test(g) || w.wine_type === 'Süßwein') return 0.8;
  if (w.wine_type === 'Rosé' || FRAGILE.test(g)) return 1.3;
  if (/chardonnay|veltliner/i.test(g)) return 1.1;
  return 1;
}

// Gefährdung: Flaschen × Robustheit × wie nah/weit das Ende ist
export function risk(w, win, y = nowYear()) {
  const past = y - win[3];
  const time = past >= 0 ? 1.5 + Math.min(past, 4) * 0.15 : past === -1 ? 1 : 0.6;
  return w.stock * fragility(w) * time;
}

// Alle Weine im Bestand mit Fenster, Status und Gefährdung; dringend zuerst
export function cellar(D, y = nowYear()) {
  return D.wines.filter((w) => w.stock > 0).map((w) => {
    const { win, src } = windowOf(w);
    const st = statusOf(win, y);
    return { w, win, src, st, risk: risk(w, win, y) };
  }).sort((a, b) => STATUS_ORDER.indexOf(a.st) - STATUS_ORDER.indexOf(b.st) || (a.st === 'wait' ? a.win[0] - b.win[0] : a.st === 'ready' ? a.win[3] - b.win[3] : b.risk - a.risk) || a.win[3] - b.win[3] || b.w.stock - a.w.stock);
}

export function summary(list) {
  const s = Object.fromEntries(STATUS_ORDER.map((k) => [k, { wines: 0, fl: 0, eur: 0 }]));
  for (const x of list) { const o = s[x.st]; o.wines++; o.fl += x.w.stock; o.eur += x.w.value || 0; }
  return s;
}

// Reife-Notiz → Fenster der übrigen Flaschen desselben Weins (nur, wenn nicht selbst festgelegt)
export function adjust(win, maturity, year) {
  let [a, pa, pb, b] = win;
  if (maturity === 'jung') {
    const d = Math.max(1, Math.min(3, year + 1 - pa));
    [a, pa, pb, b] = [Math.max(a + d, year + 1), pa + d, pb + d, b + d];
  } else if (maturity === 'drueber') {
    b = Math.min(b, year); pb = Math.min(pb, year - 1); pa = Math.min(pa, pb); a = Math.min(a, pa);
  } else if (maturity === 'ok') {
    pa = Math.min(pa, year); pb = Math.max(pb, year); a = Math.min(a, pa); b = Math.max(b, pb);
  } else return null;
  return [a, pa, pb, b];
}

// Satz für die Detailkarte
export function sentence(win, st, stock, y = nowYear()) {
  const [a, pa, pb, b] = win;
  if (st === 'over') return { t: 'Fenster seit ' + (b + 1) + ' vorbei – bald trinken', s: 'Nach der Schätzung über dem Ende. Oft noch trinkbar, aber nicht mehr auf dem Höhepunkt.' };
  if (st === 'wait') return { t: 'Noch warten – trinkbar ab ' + a, s: 'Höhepunkt ' + span(pa, pb) + '. Lagern lohnt sich.' };
  const months = Math.max(1, (b - y) * 12 + 12 - new Date().getMonth());
  const pace = stock > 1 ? pace_(months / stock) : '';
  if (st === 'now') return { t: (y > pb ? 'Höhepunkt vorbei – ' : '') + 'bis Ende ' + b + ' trinken', s: pace ? fl_(stock) + ' in rund ' + months + ' Monaten: ' + pace + '.' : 'Noch ' + months + ' Monate im Fenster.' };
  if (y >= pa) return { t: 'Auf dem Höhepunkt – bis ' + pb, s: 'Trinkbar bis ' + b + '.' + (pace ? ' ' + fl_(stock) + ': ' + pace + '.' : '') };
  return { t: 'Trinkreif – Höhepunkt ab ' + pa, s: 'Trinkbar bis ' + b + ', am schönsten ' + span(pa, pb) + '.' };
}
const span = (a, b) => (a === b ? String(a) : a + '–' + b);
const fl_ = (n) => n + (n === 1 ? ' Flasche' : ' Flaschen');
function pace_(m) {
  if (m < 1.5) return 'etwa jeden Monat eine';
  const lo = Math.floor(m), hi = Math.ceil(m);
  if (m > 18) return 'etwa eine Flasche pro Jahr';
  return 'etwa eine Flasche alle ' + (lo === hi || hi - m < 0.25 ? Math.round(m) : lo + '–' + hi) + ' Monate';
}
