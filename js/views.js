// HTML-Bausteine für alle Ansichten
import { esc, eur, eur2, fl, num, deDate, deDayMonth, yearOf, plural, today } from './util.js';
import { TYPES, STYLES, TYPE_COLOR, CAP_COLORS, BUY_AGAIN, faecher, layout, matcher, totals, groupSum, capOf, tintOf } from './model.js';
import { VERSION } from './version.js';

/* ---------- Icons ---------- */
const P = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  stats: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  glass: '<path d="M7 3h10l-.8 6.5a4.2 4.2 0 0 1-8.4 0L7 3z"/><path d="M12 14v6M8.5 21h7"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.2C19.5 15.4 12 20 12 20z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  ext: '<path d="M7 17L17 7M9 7h8v8"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  shelf: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'
};
export const icon = (n, cls = 'i') => '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>';

/* ---------- Grundgerüst ---------- */
export function nav(tab) {
  const a = (href, key, ic, label) => '<a href="#/' + href + '"' + (tab === key ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>';
  return '<nav class="tabs" aria-label="Hauptnavigation"><div class="wrap">' +
    a('', 'home', 'grid', 'Übersicht') + a('statistik', 'stats', 'stats', 'Statistik') +
    '<a href="#/neu" class="plus" aria-label="Neuen Wein anlegen"' + (tab === 'neu' ? ' aria-current="page"' : '') + '>' + icon('plus') + '</a>' +
    a('vorschlaege', 'reco', 'glass', 'Vorschläge') + a('wunschliste', 'wish', 'heart', 'Wunschliste') + '</div></nav>';
}
const homeSeg = (cur) => '<div class="seg" role="navigation" aria-label="Ansicht">' +
  [['', 'Kennzahlen', 'home'], ['regal', 'Regal', 'regal'], ['getrunken', 'Getrunken', 'drunk']]
    .map(([h, l, k]) => '<a href="#/' + h + '"' + (cur === k ? ' aria-current="page"' : '') + '>' + l + '</a>').join('') + '</div>';
const head = (eyebrow, title, right = '') => '<div class="top"><div><div class="eyebrow">' + esc(eyebrow) + '</div><h1>' + esc(title) + '</h1></div>' + right + '</div>';
const backBtn = (href, label) => '<a class="back" href="' + href + '">' + icon('back') + esc(label) + '</a>';

export const cap = (color, cls = '', hit = false) => '<span class="cap ' + cls + (hit ? ' hit' : '') + '" style="--c:' + esc(color) + '"></span>';

export function labelImg(w, urls, cls) {
  const u = w.label_path && urls[w.label_path];
  return u ? '<img class="' + cls + '" src="' + esc(u) + '" alt="Etikett ' + esc(w.name) + '" loading="lazy">'
    : '<span class="' + cls + '" aria-hidden="true">' + cap(capOf(w), 's28') + '</span>';
}

/* ---------- Login ---------- */
export function loginView(err, busy, email) {
  return '<div class="login"><svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#7A1F35"/><circle cx="32" cy="32" r="21" fill="none" stroke="#FBF3EE" stroke-opacity=".35" stroke-width="2"/><circle cx="25" cy="24" r="6" fill="#fff" fill-opacity=".22"/></svg>' +
    '<div class="eyebrow">Wine Database</div><h1 class="title">Mein Weinkeller</h1>' +
    '<form data-form="login"><div class="field"><label for="em">E-Mail</label><input id="em" name="email" type="email" autocomplete="username" required value="' + esc(email || '') + '"></div>' +
    '<div class="field"><label for="pw">Passwort</label><input id="pw" name="password" type="password" autocomplete="current-password" required></div>' +
    (err ? '<p class="err" role="alert">' + esc(err) + '</p>' : '') +
    '<button class="btn" type="submit"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Anmelden …' : 'Anmelden') + '</button></form></div>';
}

/* ---------- Übersicht / Kennzahlen ---------- */
export function homeView(S, D) {
  const t = totals(D);
  if (!D.wines.length) {
    return head('Mein Keller', 'Übersicht', settingsBtn()) + homeSeg('home') +
      '<div class="empty"><b>Noch keine Weine</b>Lege deinen ersten Wein über das + an oder importiere deine Daten in den Einstellungen.</div>' +
      '<div class="btns"><a class="btn" href="#/neu">Wein anlegen</a><button class="btn ghost" data-act="settings">Daten importieren</button></div>';
  }
  const order = ['Weißwein', 'Rotwein', 'Champagner', 'Schaumwein', 'Rosé', 'Süßwein'].filter((k) => t.byType[k]);
  const bar = order.map((k) => '<i style="width:' + (t.byType[k] / t.stock * 100).toFixed(1) + '%;background:' + TYPE_COLOR[k] + '"></i>').join('');
  const lg = order.map((k) => '<span>' + esc(shortType(k)) + ' ' + num(t.byType[k]) + '</span>').join('');
  const last = D.wines.flatMap((w) => w.drinks.filter((d) => d.drunk_on).map((d) => ({ w, d }))).sort((a, b) => b.d.drunk_on.localeCompare(a.d.drunk_on))[0];
  const prod = groupSum(D.wines.filter((w) => w.stock > 0), (w) => w.producer, (w) => w.stock).slice(0, 3);
  const pval = (name) => D.wines.filter((w) => w.producer === name).reduce((s, w) => s + w.value, 0);
  return head('Mein Keller', 'Übersicht', settingsBtn()) + homeSeg('home') +
    '<div class="hero"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
    '<div><div class="l">Im Keller</div><div style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span class="big">' + num(t.stock) + '</span><span style="color:#D8C8BE">Flaschen</span></div></div>' +
    '<div style="text-align:right"><div class="l">Lagerwert</div><div style="font:600 24px var(--head);margin-top:2px">' + eur(t.value, 0) + '</div>' +
    '<div class="l" style="margin-top:4px">Ø ' + eur2(t.stock ? t.value / t.stock : 0) + ' / Flasche</div></div></div>' +
    '<div class="bar">' + bar + '</div><div class="legend">' + lg + '</div></div>' +
    '<a class="search" href="#/regal?focus=1" style="display:block"><span class="box">' + icon('search') + '<span>Wein, Weingut oder Rebsorte suchen</span></span></a>' +
    (last ? '<div class="sec">Zuletzt getrunken</div><a class="card" href="#/wein/' + last.w.id + '" style="display:flex;gap:14px;padding:14px 16px">' +
      '<span style="width:6px;border-radius:3px;flex:none;background:' + TYPE_COLOR[last.w.wine_type] + '"></span><span style="min-width:0">' +
      '<span style="display:block;font:600 17px/1.25 var(--head)">' + esc(last.w.name) + '</span>' +
      '<span class="sub" style="display:block;margin-top:2px;font-size:13px">' + esc([last.w.producer, last.w.region, deDate(last.d.drunk_on)].filter(Boolean).join(' · ')) + '</span>' +
      (last.d.note ? '<span style="display:block;margin-top:8px;font-size:13px">„' + esc(last.d.note) + '“</span>' : '') + '</span></a>' : '') +
    (prod.length ? '<div class="sec">Größte Bestände nach Weingut</div><div class="card list">' +
      prod.map(([n, c]) => '<a class="row" href="#/regal?q=' + encodeURIComponent(n) + '"><span class="tx"><span class="t">' + esc(n) + '</span></span><span class="r" style="color:var(--muted);font-size:13px">' + fl(c) + ' · ' + eur(pval(n), 0) + '</span></a>').join('') + '</div>' : '') +
    '<div class="btns"><a class="btn ghost" href="#/regal">' + icon('shelf') + 'Zum Weinregal</a></div>';
}
const settingsBtn = () => '<button class="ibtn" data-act="settings" aria-label="Einstellungen">' + icon('gear') + '</button>';
const shortType = (t) => ({ 'Weißwein': 'Weiß', 'Rotwein': 'Rot', 'Champagner': 'Champagner', 'Schaumwein': 'Schaum', 'Rosé': 'Rosé', 'Süßwein': 'Süß' }[t] || t);

/* ---------- Regal ---------- */
export function regalView(S, D) {
  const t = totals(D), F = faecher(D);
  return head('Mein Keller', 'Weinregal', '<div class="meta">' + fl(t.stock) + '<br>' + plural(F.length, 'Fach', 'Fächer') + '</div>') + homeSeg('regal') +
    '<div class="search" id="regal-search"><div class="box">' + icon('search') +
    '<label for="q" class="sr">Im Regal suchen</label><input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Wein, Weingut, Rebsorte, Region, Jahrgang …" value="' + esc(S.q) + '">' +
    '<button class="clr' + (S.q ? '' : ' hidden') + '" data-act="clear-q" aria-label="Suche leeren">' + icon('x') + '</button></div><div id="drop"></div></div>' +
    '<div class="chips" id="chips"></div><div id="shelf"></div><p class="hint" id="hint"></p>';
}
export function chipsHtml(top, recent, q) {
  const ql = q.trim().toLowerCase();
  const c = (l, r) => '<button class="chip' + (r ? ' recent' : '') + '" data-act="chip" data-q="' + esc(l) + '" aria-pressed="' + (l.toLowerCase() === ql) + '">' + (r ? icon('clock') : '') + esc(l) + '</button>';
  return top.map((l) => c(l, false)).join('') + recent.map((l) => c(l, true)).join('');
}
export function shelfHtml(D, q) {
  const m = matcher(q);
  return '<div class="shelf"><div class="grid">' + faecher(D).map((f) => {
    const wines = f.wines.map((w, i) => ({ w, i, hit: m ? m(w) : false }));
    const hits = wines.filter((x) => x.hit).length;
    if (m) wines.sort((a, b) => (b.hit - a.hit) || (a.i - b.i));
    const L = layout(wines.length), shown = [];
    L.rows.forEach((k) => { for (let j = 0; j < k; j++) shown.push(wines[shown.length]); });
    const rows = []; let p = 0;
    for (let r = L.rows.length - 1; r >= 0; r--) {
      const caps = [];
      for (let j = 0; j < L.rows[r]; j++) { const x = shown[p++]; caps.unshift(cap(tintOf(x.w), '', x.hit)); }
      rows.unshift('<div class="lr' + (L.stacked ? ' st' : '') + '">' + caps.join('') + '</div>');
    }
    const n = wines.length, empty = !n;
    const cnt = empty ? '' : '<span class="cnt' + (m && hits ? ' hit' : '') + '">' + (m ? (hits ? hits + ' von ' + n : '0') : n) + '</span>';
    const aria = f.name + ', ' + plural(n, 'Wein', 'Weine') + ', ' + fl(f.bottles) + (m ? ', ' + hits + ' Treffer' : '');
    return '<a class="fach' + (m && !hits ? ' dim' : '') + (empty ? ' empty-f' : '') + '" href="#/fach/' + encodeURIComponent(f.name) + '" aria-label="' + esc(aria) + '">' +
      '<span class="in">' + rows.join('') + cnt + '</span><span class="lab"><span>' + esc(f.name) + '</span></span></a>';
  }).join('') + '</div></div>';
}
export function dropHtml(D, q) {
  const m = matcher(q); if (!m) return '';
  const hits = D.wines.filter((w) => w.stock > 0 && m(w)).sort((a, b) => b.stock - a.stock);
  const gone = D.wines.filter((w) => w.stock === 0 && m(w)).length;
  const nF = new Set(hits.map((w) => w.fach)).size, b = hits.reduce((s, w) => s + w.stock, 0);
  const sum = hits.length ? plural(hits.length, 'Wein', 'Weine') + ' · ' + fl(b) + ' · in ' + plural(nF, 'Fach', 'Fächern') : 'Keine Treffer im Bestand für „' + esc(q) + '“';
  return '<div class="drop"><div class="sum">' + sum + (gone ? ' · ' + plural(gone, 'weiterer', 'weitere') + ' bereits getrunken' : '') + '</div>' +
    hits.slice(0, 5).map((w) => wineRow(w, true)).join('') +
    '<div class="acts"><button data-act="show-shelf">Im Regal zeigen</button>' + (hits.length > 5 ? '<button data-act="all-hits">Alle ' + hits.length + ' anzeigen</button>' : '') + '</div></div>';
}
export function hintText(D, q) {
  const m = matcher(q);
  if (!m) return D.wines.some((w) => w.stock > 0) ? 'Jede Kapsel ist ein Wein · Zahl = alle Weine im Fach. Die Suche umfasst Wein, Weingut, Rebsorte, Weinart, Geschmack, Region, Jahrgang und Händler.' : 'Noch keine Weine im Regal.';
  return 'Gold = Treffer für „' + q.trim() + '“ · Zahl = Treffer von allen Weinen im Fach';
}
// mode: true/'stock' = Bestand rechts, 'drunk' = getrunkene Flaschen, 'bought' = gekaufte Flaschen
function wineRow(w, mode) {
  const right = mode === 'drunk' ? w.drunk + '× getr.' : mode === 'bought' ? fl(w.bought) + ' gek.' : (w.stock ? fl(w.stock) : '<span style="color:var(--muted)">leer</span>');
  return '<a class="row" href="#/wein/' + w.id + '">' + cap(capOf(w), 's28') +
    '<span class="tx"><span class="t">' + esc(w.name) + '</span><span class="s">' + esc([w.producer, w.grape, w.vintage, w.region].filter(Boolean).join(' · ')) + '</span></span>' +
    (mode ? '<span class="r">' + right + '</span>' : '') + icon('chev', 'i chev') + '</a>';
}

/* ---------- Fach / Trefferliste ---------- */
// opts: { eyebrow, back: [href, label], mini, scope: 'stock' | 'drunk' | 'bought' }
export function fachView(S, D, name, list, opts = {}) {
  const o = { eyebrow: 'Fach', back: ['#/regal', 'Weinregal'], mini: true, scope: 'stock', ...opts };
  const firstSort = o.scope === 'drunk' ? ['Getrunken', (a, b) => b.drunk - a.drunk || a.name.localeCompare(b.name)]
    : o.scope === 'bought' ? ['Gekauft', (a, b) => b.bought - a.bought || a.name.localeCompare(b.name)]
    : ['Bestand', (a, b) => b.stock - a.stock || a.name.localeCompare(b.name)];
  const sorters = { stock: firstSort, producer: ['Weingut', (a, b) => a.producer.localeCompare(b.producer) || a.name.localeCompare(b.name)], vintage: ['Jahrgang', (a, b) => (b.vintage || 0) - (a.vintage || 0)], region: ['Region', (a, b) => String(a.region || '').localeCompare(String(b.region || ''))] };
  const sorted = list.slice().sort(sorters[S.fachSort] ? sorters[S.fachSort][1] : sorters.stock[1]);
  const b = list.reduce((s, w) => s + w.stock, 0), v = list.reduce((s, w) => s + w.value, 0);
  const nProd = new Set(list.map((w) => w.producer).filter(Boolean)).size, nReg = new Set(list.map((w) => w.region).filter(Boolean)).size;
  const nine = sorted.slice().sort(sorters.stock[1]).slice(0, 9).map((w) => cap(capOf(w), 's20'));
  const mini = [nine.slice(6, 9), nine.slice(3, 6), nine.slice(0, 3)].filter((r) => r.length).map((r) => '<div class="lr">' + r.join('') + '</div>').join('');
  return backBtn(o.back[0], o.back[1]) +
    '<div class="top" style="align-items:center"><div><div class="eyebrow">' + esc(o.eyebrow) + '</div><h1 class="title">' + esc(name) + '</h1>' +
    '<div class="sub">' + plural(nProd, 'Weingut', 'Weingüter') + ' · ' + plural(nReg, 'Region', 'Regionen') + '</div></div>' +
    (o.mini ? '<div class="mini" aria-hidden="true"><div class="in">' + mini + '</div></div>' : '') + '</div>' +
    '<div class="kpis"><div class="kpi dark"><div class="l">Weine</div><div class="v">' + num(list.length) + '</div></div>' +
    (o.scope === 'stock'
      ? '<div class="kpi"><div class="l">Flaschen</div><div class="v">' + num(b) + '</div></div><div class="kpi"><div class="l">Lagerwert</div><div class="v">' + eur(v, 0) + '</div></div>'
      : '<div class="kpi"><div class="l">' + (o.scope === 'drunk' ? 'Getrunken' : 'Gekauft') + '</div><div class="v">' + fl(list.reduce((s, w) => s + (o.scope === 'drunk' ? w.drunk : w.bought), 0)) + '</div></div><div class="kpi"><div class="l">Noch im Keller</div><div class="v">' + fl(b) + '</div></div>') + '</div>' +
    '<div class="chips" style="margin-top:16px">' + Object.entries(sorters).map(([k, [l]]) => '<button class="chip" data-act="fach-sort" data-k="' + k + '" aria-pressed="' + (S.fachSort === k) + '">' + l + '</button>').join('') + '</div>' +
    (list.length ? '<p class="note" style="margin-top:12px">Kapselfarbe je Weingut, festgelegt beim Erfassen. ' + cap('#262C29', 's12') + ' = noch offen</p>' +
      '<div class="card list" style="margin-top:10px;overflow:hidden">' + sorted.map((w) => wineRow(w, o.scope)).join('') + '</div>'
      : o.scope !== 'stock' || !o.mini ? '<div class="empty"><b>Keine Weine gefunden</b></div>'
      : '<div class="empty"><b>Dieses Fach ist leer</b>Sobald du einen passenden Wein anlegst, landet er hier.</div><div class="btns"><a class="btn" href="#/neu">Wein anlegen</a></div>');
}

/* ---------- Detail ---------- */
export function detailView(S, D, w) {
  const typeBg = { 'Weißwein': '#F1E3B8', 'Rotwein': '#F3DDDF', 'Rosé': '#F6E1E6', 'Champagner': '#E6EAD8', 'Schaumwein': '#E6EAD8', 'Süßwein': '#F1E3B8' }[w.wine_type] || '#E9E1D2';
  const ba = w.buyAgain ? BUY_AGAIN.find((x) => x[0] === w.buyAgain)[1] : '';
  const facts = [['Weingut', w.producer], ['Region', w.region], ['Jahrgang', w.vintage], ['Geschmack', w.style],
    ['Preis', w.avgPrice != null ? eur2(w.avgPrice) + ' / Fl.' : ''], ['Gekauft gesamt', w.bought ? fl(w.bought) + (w.spent ? ' · ' + eur2(w.spent) : '') : ''],
    ['Fach', w.fach], ['Händler', w.merchants.join(', ')]].filter((x) => x[1] !== '' && x[1] != null);
  if (facts.length % 2) facts.push(['', '']);
  const evs = [...w.purchases.map((p) => ({ k: 'p', d: p.purchased_on, x: p })), ...w.drinks.map((d) => ({ k: 'd', d: d.drunk_on, x: d }))]
    .sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
  const ev = (e) => e.k === 'p'
    ? '<div class="ev"><span class="ico">' + icon('plus') + '</span><span class="tx"><span class="t" style="display:block">Kauf · ' + fl(e.x.qty) + (e.x.price != null ? ' à ' + eur2(e.x.price) : '') + '</span><span class="s">' + esc([deDate(e.x.purchased_on) || 'Datum unbekannt', e.x.merchant].filter(Boolean).join(' · ')) + '</span></span>' +
      (e.x.price != null ? '<span style="font:500 14px var(--sans)">' + eur2(e.x.price * e.x.qty) + '</span>' : '') + '<button class="del" data-act="edit-purchase" data-id="' + e.x.id + '" aria-label="Kauf bearbeiten">' + icon('edit') + '</button></div>'
    : '<div class="ev"><span class="ico dr">' + icon('glass') + '</span><span class="tx"><span class="t" style="display:block">Getrunken' + (e.x.qty > 1 ? ' · ' + fl(e.x.qty) : '') + (e.x.buy_again ? ' · nochmal kaufen: ' + BUY_AGAIN.find((y) => y[0] === e.x.buy_again)[1] : '') + '</span>' +
      '<span class="s">' + esc([deDate(e.x.drunk_on) || 'Datum unbekannt', e.x.occasion].filter(Boolean).join(' · ')) + '</span>' + (e.x.note ? '<span class="n" style="display:block">„' + esc(e.x.note) + '“</span>' : '') + '</span>' +
      '<button class="del" data-act="edit-drink" data-id="' + e.x.id + '" aria-label="Getrunken-Eintrag bearbeiten">' + icon('edit') + '</button></div>';
  const url = w.label_path && S.urls[w.label_path];
  return '<div style="display:flex;justify-content:space-between;align-items:center">' + backBtn(S.backHref || '#/regal', S.backLabel || 'Zurück') +
    '<button class="ibtn" data-act="edit-wine" data-id="' + w.id + '" aria-label="Wein bearbeiten" style="margin-top:-8px">' + icon('edit') + '</button></div>' +
    '<div class="label-box">' + (url ? '<img src="' + esc(url) + '" alt="Etikett ' + esc(w.name) + '">' : '<label class="label-ph" for="lblfile">' + icon('camera') + 'Etikett fotografieren</label>') + '</div>' +
    '<div style="display:flex;justify-content:center"><label class="back" for="lblfile" style="margin:6px 0 0;color:var(--muted);font-size:13px;cursor:pointer">' + icon('camera') + (url ? 'Etikett neu fotografieren' : 'Foto auswählen') + '</label>' +
    '<input id="lblfile" class="sr" type="file" accept="image/*" data-change="label" data-id="' + w.id + '"></div>' +
    '<h1 class="title" style="font-size:26px;line-height:1.2;margin-top:6px">' + esc(w.name) + '</h1>' +
    '<div class="sub" style="font-size:15px">' + esc([w.producer, w.region, w.vintage].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="tags"><span class="tag" style="background:' + typeBg + '">' + esc(w.wine_type) + '</span>' + (w.grape ? '<span class="tag">' + esc(w.grape) + '</span>' : '') +
    (w.style ? '<span class="tag">' + esc(w.style) + '</span>' : '') + (ba ? '<span class="tag" style="background:#DCE5D0">Nochmal kaufen: ' + ba + '</span>' : '') + '</div>' +
    '<div class="kpis"><div class="kpi dark"><div class="l">Im Keller</div><div class="v">' + fl(w.stock) + '</div></div><div class="kpi"><div class="l">Getrunken</div><div class="v">' + fl(w.drunk) + '</div></div><div class="kpi"><div class="l">Lagerwert</div><div class="v">' + eur(w.value) + '</div></div></div>' +
    '<div class="btns"><button class="btn" data-act="drink" data-id="' + w.id + '"' + (w.stock ? '' : ' disabled') + '>' + icon('glass') + 'Flasche getrunken</button><button class="btn ghost" data-act="purchase" data-id="' + w.id + '">' + icon('plus') + 'Kauf erfassen</button></div>' +
    '<div class="sec">Steckbrief</div><div class="card facts">' + facts.map(([l, v]) => '<div><div class="l">' + esc(l) + '</div><div class="v">' + esc(v) + '</div></div>').join('') + '</div>' +
    (evs.length ? '<div class="sec">Verlauf</div><div class="card">' + evs.map(ev).join('') + '</div>' : '') +
    (w.my_note ? '<div class="sec">Meine Notiz</div><div class="card quote">' + esc(w.my_note) + '</div>' : '') +
    '<div class="sec">Beschreibung</div>' + (w.description ? '<p class="prose" style="margin:0">' + esc(w.description) + '</p>' : '<p class="note" style="margin-top:0">Noch keine Beschreibung. Über die Händler-Suche findest du den Wein und kannst die Beschreibung per „Bearbeiten“ einfügen.</p>') +
    '<div class="sec">Beim Händler suchen</div>' + shopLinks(w) +
    '<div class="btns" style="margin-top:28px"><button class="btn ghost" data-act="del-wine" data-id="' + w.id + '" style="color:#8A2B33">' + icon('trash') + 'Wein löschen</button></div>';
}
// Kurzer Suchbegriff für Shop-Suchen: Weingut + Wein, ohne Jahrgang, Anführungszeichen und doppelte Wörter
export function shopTerm(w) {
  const prod = String(w.producer || '').replace(/^(Weingut|Weinhaus|Domaine|Château|Chateau)\s+/i, '').trim();
  const name = String(w.name || '').replace(/["„“”'‘’]/g, ' ').replace(/\b(19|20)\d{2}\b/g, ' ');
  const seen = new Set(), out = [];
  for (const t of (prod + ' ' + name).split(/\s+/)) { const k = t.toLowerCase(); if (t && !seen.has(k)) { seen.add(k); out.push(t); } }
  return out.join(' ');
}
const slug = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// [Beschriftung, Such-URL, Erkennung im Händlernamen]
export const SHOPS = {
  hawesko: ['Hawesko', (t) => 'https://www.hawesko.de/suche/' + slug(t) + '?q=' + encodeURIComponent(t), /hawesko/i],
  rindchen: ["Rindchen's", (t) => 'https://www.rindchen.de/search?search=' + encodeURIComponent(t), /rindchen/i],
  dallmayr: ['Dallmayr', (t) => 'https://www.dallmayr.com/de/suche?q=' + encodeURIComponent(t), /dallmayr/i],
  moevenpick: ['Mövenpick', (t) => 'https://www.moevenpick-wein.de/catalogsearch/result/?q=' + encodeURIComponent(t), /m(ö|oe|o)venpick/i],
  vivino: ['Vivino', (t) => 'https://www.vivino.com/search/wines?q=' + encodeURIComponent(t), /vivino/i]
};
export const shopFor = (merchant) => Object.keys(SHOPS).find((k) => SHOPS[k][2].test(String(merchant || '')));
export function shopUrl(key, w) { return SHOPS[key][1](shopTerm(w)); }
export const webUrl = (w, extra = '') => 'https://www.google.com/search?q=' + encodeURIComponent([w.producer, w.name, w.vintage, extra].filter(Boolean).join(' '));
export function shopLinks(w) {
  const a = (href, l) => '<a class="btn ghost small" target="_blank" rel="noopener" href="' + esc(href) + '">' + esc(l) + icon('ext') + '</a>';
  return '<div class="shops">' + Object.keys(SHOPS).map((k) => a(shopUrl(k, w), SHOPS[k][0])).join('') + a(webUrl(w, 'Wein'), 'Web') + '</div>';
}

/* ---------- Getrunken ---------- */
export function drunkView(S, D) {
  const t = totals(D);
  let items = D.wines.flatMap((w) => w.drinks.map((d) => ({ w, d })));
  if (S.drunkFilter === 'again') items = items.filter((x) => x.d.buy_again === 'ja');
  if (S.drunkFilter === 'occasion') items = items.filter((x) => x.d.occasion);
  items.sort((a, b) => String(b.d.drunk_on || '').localeCompare(String(a.d.drunk_on || '')) || String(b.d.created_at).localeCompare(String(a.d.created_at)));
  const groups = [];
  for (const x of items) {
    const y = yearOf(x.d.drunk_on) || 'Ohne Datum';
    if (!groups.length || groups[groups.length - 1].y !== y) groups.push({ y, items: [] });
    groups[groups.length - 1].items.push(x);
  }
  const shown = groups.reduce((acc, g) => { if (acc.n < S.drunkLimit) { const take = g.items.slice(0, S.drunkLimit - acc.n); acc.n += take.length; acc.g.push({ y: g.y, items: take }); } return acc; }, { n: 0, g: [] });
  const fchip = (k, l) => '<button class="chip" data-act="drunk-filter" data-k="' + k + '" aria-pressed="' + (S.drunkFilter === k) + '">' + l + '</button>';
  return head('Meine Erinnerungen', 'Getrunken') + homeSeg('drunk') +
    '<div class="kpis"><div class="kpi dark"><div class="l">Flaschen</div><div class="v">' + num(t.drunk) + '</div></div><div class="kpi"><div class="l">Genossen für</div><div class="v">' + eur(t.drunkValue, 0) + '</div></div><div class="kpi"><div class="l">Nochmal kaufen</div><div class="v">' + num(t.again) + '×</div></div></div>' +
    '<div class="chips" style="margin-top:14px">' + fchip('all', 'Alle') + fchip('again', 'Nochmal kaufen') + fchip('occasion', 'Mit Anlass') + '</div>' +
    (items.length ? shown.g.map((g) => '<div class="year"><b>' + esc(g.y) + '</b><i></i></div>' + g.items.map(({ w, d }) =>
      '<div class="mem"><a class="go" href="#/wein/' + w.id + '">' + labelImg(w, S.urls, 'th') + '<span class="tx"><span class="d">' + esc(d.drunk_on ? deDayMonth(d.drunk_on) : 'Datum unbekannt') + (d.qty > 1 ? ' · ' + fl(d.qty) : '') + '</span>' +
      '<span class="w">' + esc(w.name) + '</span><span class="s">' + esc([w.producer, w.grape].filter(Boolean).join(' · ')) + '</span>' +
      (d.note ? '<span class="n">„' + esc(d.note) + '“</span>' : '') + (d.occasion ? '<span class="an">Anlass: ' + esc(d.occasion) + '</span>' : '') + '</span></a>' +
      '<button class="ed" data-act="edit-drink" data-id="' + d.id + '" aria-label="Notiz und Anlass bearbeiten">' + icon('edit') + '</button></div>').join('')).join('') +
      (items.length > S.drunkLimit ? '<button class="more card" style="margin-top:4px" data-act="drunk-more">Weitere ' + (items.length - S.drunkLimit) + ' Einträge anzeigen</button>' : '')
      : '<div class="empty"><b>Noch nichts getrunken</b>Markiere in der Detailansicht eines Weins „Flasche getrunken“.</div>');
}

/* ---------- Neuer Wein / Bearbeiten ---------- */
function datalists(D) {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  const dl = (id, arr) => '<datalist id="' + id + '">' + uniq(arr).map((v) => '<option value="' + esc(v) + '">').join('') + '</datalist>';
  return dl('dl-prod', D.producers.map((p) => p.name)) + dl('dl-grape', D.wines.map((w) => w.grape).concat(['Riesling', 'Sauvignon Blanc', 'Chardonnay', 'Grauburgunder', 'Weißburgunder', 'Spätburgunder', 'Lagrein', 'Merlot'])) +
    dl('dl-region', D.wines.map((w) => w.region)) + dl('dl-style', D.wines.map((w) => w.style).concat(STYLES)) + dl('dl-merch', D.purchases.map((p) => p.merchant));
}
const fld = (id, label, attrs = '', val = '') => '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + id + '" ' + attrs + ' value="' + esc(val == null ? '' : val) + '"></div>';
function wineFields(D, w = {}) {
  return '<div class="fgrid">' + fld('producer', 'Weingut', 'list="dl-prod" autocomplete="off" data-input="producer"', w.producer) +
    fld('name', 'Wein *', 'required autocomplete="off"', w.name) +
    '<div class="frow">' + fld('grape', 'Rebsorte', 'list="dl-grape" autocomplete="off"', w.grape) + '<div class="field" style="flex:0 0 104px">' + '<label for="vintage">Jahrgang</label><input id="vintage" name="vintage" type="number" inputmode="numeric" min="1900" max="2100" value="' + esc(w.vintage || '') + '"></div></div>' +
    '<div class="frow"><div class="field"><label for="wine_type">Weinart</label><select id="wine_type" name="wine_type">' + TYPES.map((t) => '<option' + ((w.wine_type || 'Weißwein') === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
    fld('style', 'Geschmack', 'list="dl-style" autocomplete="off"', w.style) + '</div>' +
    fld('region', 'Region', 'list="dl-region" autocomplete="off"', w.region) + '</div>';
}
function capPicker(sel, producerName) {
  return '<div class="sec" style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span>Kapselfarbe</span><span id="cap-hint" style="text-transform:none;letter-spacing:0;font-weight:400">' + (producerName ? 'gilt für alle Weine von ' + esc(producerName) : 'gilt für alle Weine dieses Weinguts') + '</span></div>' +
    '<div class="swatches" role="group" aria-label="Kapselfarbe wählen">' + CAP_COLORS.map(([l, c]) => '<button type="button" class="sw" data-act="cap" data-c="' + c + '" aria-label="' + l + '" aria-pressed="' + ((sel || '') === c) + '">' + cap(c || '#262C29', 's32') + '</button>').join('') + '</div>';
}
export function newView(S, D) {
  const f = S.form;
  return head(f.wishId ? 'Von der Wunschliste' : 'Neu im Keller', 'Neuer Wein') + datalists(D) +
    '<form data-form="new" style="margin-top:14px" novalidate>' +
    '<div class="photo">' + (f.photoUrl ? '<img src="' + esc(f.photoUrl) + '" alt="Etikett-Vorschau">' : '<div class="frame"><i></i><i></i><i></i><i></i><span>Etikett im Rahmen ausrichten</span></div>') + '</div>' +
    '<div class="btns" style="margin-top:10px"><label class="btn" for="ph-cam" style="flex:1.6">' + icon('camera') + (f.photoUrl ? 'Neu fotografieren' : 'Etikett fotografieren') + '</label><label class="btn ghost" for="ph-gal">Galerie</label></div>' +
    '<input id="ph-cam" class="sr" type="file" accept="image/*" capture="environment" data-change="photo"><input id="ph-gal" class="sr" type="file" accept="image/*" data-change="photo">' +
    '<div class="sec">Wein</div>' + wineFields(D, f.wine) +
    '<div class="sec">Kauf</div><div class="fgrid"><div class="frow">' + fld('qty', 'Anzahl', 'type="number" inputmode="numeric" min="0" max="999"', f.qty) + fld('price', 'Preis / Fl. (€)', 'type="text" inputmode="decimal" autocomplete="off"', f.price) + '</div>' +
    '<div class="frow">' + fld('merchant', 'Bezogen über', 'list="dl-merch" autocomplete="off"', f.merchant) + fld('purchased_on', 'Kaufdatum', 'type="date"', f.date || today()) + '</div></div>' +
    capPicker(f.cap, f.wine.producer) +
    '<div class="sec">Beschreibung</div><div class="field"><label for="description">z. B. vom Händler übernommen</label><textarea id="description" name="description" rows="4">' + esc(f.wine.description || '') + '</textarea></div>' +
    '<p class="note">Beschreibung suchen (öffnet die Suche in einem neuen Tab, Text dann hier einfügen):</p><div id="shop-links">' + shopLinks(f.wine) + '</div>' +
    '<div class="sec">Eigene Notiz</div><div class="field"><label for="my_note">optional</label><textarea id="my_note" name="my_note" rows="2">' + esc(f.wine.my_note || '') + '</textarea></div>' +
    '<button class="btn dark" type="submit" style="width:100%;margin-top:18px"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? 'Speichern …' : 'Wein speichern') + '</button></form>';
}
export function editSheet(S, D, w) {
  return '<h2>Wein bearbeiten</h2>' + datalists(D) + '<form data-form="edit" data-id="' + w.id + '" novalidate>' + wineFields(D, w) + capPicker(S.form.cap, w.producer) +
    '<div class="sec">Beschreibung</div><div class="field"><label for="description">z. B. vom Händler übernommen</label><textarea id="description" name="description" rows="5">' + esc(w.description || '') + '</textarea></div>' +
    '<div class="sec">Eigene Notiz</div><div class="field"><label for="my_note">allgemein zum Wein</label><textarea id="my_note" name="my_note" rows="2">' + esc(w.my_note || '') + '</textarea></div>' +
    '<div class="btns"><button type="button" class="btn ghost" data-act="close">Abbrechen</button><button class="btn" type="submit">Speichern</button></div></form>';
}
// d = vorhandener Eintrag (Bearbeiten) oder null (neu)
export function drinkSheet(S, w, d = null) {
  const sel = S.form.buyAgain;
  const max = Math.max(1, w.stock + (d ? d.qty : 0));
  return '<h2>' + (d ? 'Getrunken bearbeiten' : 'Flasche getrunken') + '</h2><p class="sub" style="margin:-6px 0 14px">' + esc([w.name, w.producer, w.vintage].filter(Boolean).join(' · ')) + '</p>' +
    '<form data-form="drink" data-id="' + w.id + '"' + (d ? ' data-did="' + d.id + '"' : '') + ' novalidate><div class="fgrid"><div class="frow">' + fld('drunk_on', 'Datum', 'type="date"', d ? (d.drunk_on || '') : today()) +
    '<div class="field" style="flex:0 0 104px"><label for="dqty">Flaschen</label><input id="dqty" name="qty" type="number" inputmode="numeric" min="1" max="' + max + '" value="' + (d ? d.qty : 1) + '"></div></div>' +
    '<div class="field"><label for="note">Meine Notiz</label><textarea id="note" name="note" rows="3" placeholder="Wie war er? Aromen, Begleitung, Eindruck …">' + esc(d ? d.note || '' : '') + '</textarea></div>' +
    fld('occasion', 'Anlass (optional)', 'autocomplete="off" placeholder="z. B. Geburtstag, Essen mit Freunden"', d ? d.occasion : '') + '</div>' +
    '<div class="sec">Würdest du ihn nochmal kaufen?</div><div class="opts" role="group" aria-label="Nochmal kaufen">' +
    BUY_AGAIN.map(([k, l]) => '<button type="button" data-act="buy-again" data-k="' + k + '" aria-pressed="' + (sel === k) + '">' + l + '</button>').join('') + '</div>' +
    '<div class="btns" style="margin-top:20px">' + (d ? '<button type="button" class="btn ghost" data-act="del-drink" data-id="' + d.id + '" style="color:#8A2B33">Löschen</button>' : '<button type="button" class="btn ghost" data-act="close">Abbrechen</button>') +
    '<button class="btn" type="submit">Speichern</button></div></form>';
}
export function purchaseSheet(S, D, w, p = null) {
  const price = p ? p.price : w.avgPrice != null ? Math.round(w.avgPrice * 100) / 100 : null;
  return '<h2>' + (p ? 'Kauf bearbeiten' : 'Kauf erfassen') + '</h2><p class="sub" style="margin:-6px 0 14px">' + esc([w.name, w.producer].filter(Boolean).join(' · ')) + '</p>' + datalists(D) +
    '<form data-form="purchase" data-id="' + w.id + '"' + (p ? ' data-pid="' + p.id + '"' : '') + ' novalidate><div class="fgrid"><div class="frow">' + fld('qty', 'Anzahl', 'type="number" inputmode="numeric" min="1" max="999"', p ? p.qty : 1) +
    fld('price', 'Preis / Fl. (€)', 'type="text" inputmode="decimal" autocomplete="off"', price != null ? String(price).replace('.', ',') : '') + '</div>' +
    '<div class="frow">' + fld('merchant', 'Bezogen über', 'list="dl-merch" autocomplete="off"', p ? p.merchant : (w.merchants[0] || '')) + fld('purchased_on', 'Kaufdatum', 'type="date"', p ? (p.purchased_on || '') : today()) + '</div></div>' +
    '<div class="btns" style="margin-top:20px">' + (p ? '<button type="button" class="btn ghost" data-act="del-purchase" data-id="' + p.id + '" style="color:#8A2B33">Löschen</button>' : '<button type="button" class="btn ghost" data-act="close">Abbrechen</button>') +
    '<button class="btn" type="submit">Speichern</button></div></form>';
}

/* ---------- Wunschliste ---------- */
export function wishView(S, D) {
  const list = D.wishlist.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return head('Noch zu kaufen', 'Wunschliste', '<button class="ibtn" data-act="wish-new" aria-label="Wein zur Wunschliste hinzufügen">' + icon('plus') + '</button>') +
    (list.length ? '<div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">' + list.map((x) => {
      const shop = shopFor(x.merchant);
      const link = x.url || (shop ? shopUrl(shop, x) : webUrl(x, x.merchant && !/weingut|online/i.test(x.merchant) ? x.merchant : 'Wein'));
      return '<div class="card" style="padding:14px 16px 10px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span style="font:600 17px/1.25 var(--head)">' + esc(x.name) + (x.vintage ? ' ' + esc(x.vintage) : '') + '</span>' +
        (x.price != null ? '<span style="flex:none;font:600 15px var(--head)">' + eur(x.price) + '</span>' : '') + '</div>' +
        '<div class="sub" style="font-size:13px">' + esc([x.producer, x.grape, x.region].filter(Boolean).join(' · ')) + '</div>' +
        ((x.idea_source || x.note) ? '<div class="note" style="margin-top:6px">' + esc([x.idea_source ? 'Idee: ' + x.idea_source : '', x.note].filter(Boolean).join(' · ')) + '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><a class="btn ghost small" target="_blank" rel="noopener" href="' + esc(link) + '">' + esc(x.merchant || 'Suchen') + icon('ext') + '</a>' +
        '<button class="btn small" data-act="wish-take" data-id="' + x.id + '">In Keller übernehmen</button>' +
        '<button class="ibtn" style="width:44px;height:44px;margin-left:auto" data-act="wish-edit" data-id="' + x.id + '" aria-label="Bearbeiten">' + icon('edit') + '</button></div></div>';
    }).join('') + '</div>' : '<div class="empty"><b>Deine Wunschliste ist leer</b>Notiere hier Weine, die du kaufen möchtest.</div><div class="btns"><button class="btn" data-act="wish-new">Wein hinzufügen</button></div>');
}
export function wishSheet(D, x = {}) {
  return '<h2>' + (x.id ? 'Wunsch bearbeiten' : 'Auf die Wunschliste') + '</h2>' + datalists(D) + '<form data-form="wish"' + (x.id ? ' data-id="' + x.id + '"' : '') + ' novalidate><div class="fgrid">' +
    fld('producer', 'Weingut', 'list="dl-prod" autocomplete="off"', x.producer) + fld('name', 'Wein *', 'required autocomplete="off"', x.name) +
    '<div class="frow">' + fld('grape', 'Rebsorte', 'list="dl-grape" autocomplete="off"', x.grape) + '<div class="field" style="flex:0 0 104px"><label for="vintage">Jahrgang</label><input id="vintage" name="vintage" type="number" inputmode="numeric" value="' + esc(x.vintage || '') + '"></div></div>' +
    '<div class="frow">' + fld('region', 'Region', 'list="dl-region" autocomplete="off"', x.region) + fld('price', 'Preis (€)', 'type="text" inputmode="decimal"', x.price != null ? String(x.price).replace('.', ',') : '') + '</div>' +
    '<div class="frow">' + fld('idea_source', 'Woher die Idee?', 'autocomplete="off"', x.idea_source) + fld('merchant', 'Bezug über', 'list="dl-merch" autocomplete="off"', x.merchant) + '</div>' +
    fld('url', 'Link (optional)', 'type="url" autocomplete="off"', x.url) +
    '<div class="field"><label for="wnote">Notiz</label><textarea id="wnote" name="note" rows="2">' + esc(x.note || '') + '</textarea></div></div>' +
    '<div class="btns" style="margin-top:20px">' + (x.id ? '<button type="button" class="btn ghost" data-act="wish-del" data-id="' + x.id + '" style="color:#8A2B33">Löschen</button>' : '<button type="button" class="btn ghost" data-act="close">Abbrechen</button>') + '<button class="btn" type="submit">Speichern</button></div></form>';
}

/* ---------- Statistik ---------- */
// Felder für die Weinliste aus der Statistik; Funktionen liefern einen Wert oder eine Liste von Werten
const BA_LABEL = Object.fromEntries(BUY_AGAIN);
export const LIST_FIELDS = {
  grape: ['Rebsorte', (w) => w.grape], region: ['Region', (w) => w.region], producer: ['Weingut', (w) => w.producer],
  type: ['Weinart', (w) => w.wine_type], vintage: ['Jahrgang', (w) => (w.vintage == null ? '' : String(w.vintage))],
  merchant: ['Händler', (w) => w.merchants],
  dyear: ['Getrunken im Jahr', (w) => w.drinks.map((d) => yearOf(d.drunk_on)).filter(Boolean)],
  byear: ['Gekauft im Jahr', (w) => w.purchases.map((p) => yearOf(p.purchased_on)).filter(Boolean)],
  again: ['Nochmal kaufen', (w) => w.drinks.map((d) => BA_LABEL[d.buy_again]).filter(Boolean)]
};
export const listMatch = (field, v) => (w) => { const x = LIST_FIELDS[field][1](w); return Array.isArray(x) ? x.includes(v) : x === v; };
export const listHref = (field, value, scope) => '#/liste?k=' + field + '&v=' + encodeURIComponent(value) + (scope ? '&s=' + scope : '');
function donut(parts, total, label, link) {
  const C = 2 * Math.PI * 52; let off = 0;
  const segs = parts.map(([k, v, col]) => { const len = v / total * C; const s = '<circle cx="70" cy="70" r="52" fill="none" stroke="' + col + '" stroke-width="20" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += len; return s; }).join('');
  const item = (k, v, col) => '<i style="background:' + col + '"></i><span>' + esc(k) + '</span><em>' + num(v) + '</em>';
  return '<div class="donut"><div class="c"><svg width="128" height="128" viewBox="0 0 140 140" role="img" aria-label="' + esc(parts.map(([k, v]) => k + ' ' + v).join(', ')) + '" style="transform:rotate(-90deg)">' + segs + '</svg><div><b>' + num(total) + '</b><span>' + label + '</span></div></div>' +
    '<div class="lg">' + parts.map(([k, v, col]) => link ? '<a href="' + esc(link(k)) + '">' + item(k, v, col) + icon('chev', 'i hchev') + '</a>' : '<div>' + item(k, v, col) + '</div>').join('') + '</div></div>';
}
// opt: { key, open, link } – key/open: aufklappbar ab 6 Einträgen, link: Balken führt zur Weinliste
const TOP_N = 5;
function hbars(rows, fmt = num, opt = {}) {
  const LIMIT = TOP_N, max = Math.max(1, ...rows.map((r) => r[1]));
  const shown = opt.key && !opt.open ? rows.slice(0, LIMIT) : rows;
  const inner = (k, v) => '<span class="n">' + esc(k) + '</span><span class="tr"><i style="width:' + (v / max * 100).toFixed(1) + '%"></i></span><span class="v">' + fmt(v) + '</span>';
  return '<div class="hbars">' + shown.map(([k, v]) => opt.link
    ? '<a class="hbar link" href="' + esc(opt.link(k)) + '" aria-label="' + esc(k + ': ' + fmt(v) + ', Weine anzeigen') + '">' + inner(k, v) + icon('chev', 'i hchev') + '</a>'
    : '<div class="hbar">' + inner(k, v) + '</div>').join('') + '</div>' +
    (opt.key && rows.length > LIMIT ? '<button class="xp" data-act="expand" data-k="' + opt.key + '" aria-expanded="' + !!opt.open + '">' +
      (opt.open ? 'Weniger anzeigen' : 'Alle ' + rows.length + ' anzeigen') + icon('chev', 'i') + '</button>' : '');
}
function cols(rows, fmt = num, link) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const bar = (v) => '<span>' + fmt(v) + '</span><i style="height:' + Math.max(2, v / max * 80).toFixed(0) + 'px"></i>';
  // Mit Link: ganze Säule inkl. Beschriftung ist antippbar
  if (link) return '<div class="cols lk">' + rows.map(([k, v]) => '<a class="col" href="' + esc(link(k)) + '" aria-label="' + esc(k + ': ' + fmt(v) + ', Weine anzeigen') + '">' + bar(v) + '<b>' + esc(k) + '</b></a>').join('') + '</div>';
  return '<div class="cols">' + rows.map(([k, v]) => '<div class="col">' + bar(v) + '</div>').join('') + '</div>' +
    '<div class="cols-x">' + rows.map(([k]) => '<span>' + esc(k) + '</span>').join('') + '</div>';
}
const boxT = (title, right, inner) => '<div class="card chart" style="margin-top:12px"><div class="chart-head"><div class="eyebrow">' + esc(title) + '</div>' + right + '</div>' + inner + '</div>';
// Balken-Box: „Top-5 …“ solange zugeklappt und mehr als 5 Einträge, sonst Titel ohne Zusatz
function barBox(S, title, rows, fmt, key, link, right = '') {
  const open = S.expand.has(key);
  return boxT((!open && rows.length > TOP_N ? 'Top-5 ' : '') + title, right, hbars(rows, fmt, { key, open, link }));
}
function metricSeg(S, g) {
  const cur = (S.metric || {})[g] || 'eur';
  return '<div class="mseg" role="group" aria-label="Einheit">' + [['eur', 'Euro'], ['qty', 'Flaschen']].map(([k, l]) => '<button data-act="metric" data-g="' + g + '" data-k="' + k + '" aria-pressed="' + (cur === k) + '">' + l + '</button>').join('') + '</div>';
}
const box = (title, inner) => '<div class="card chart" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:12px;letter-spacing:.1em">' + esc(title) + '</div>' + inner + '</div>';
export function statsView(S, D) {
  const tab = S.statTab;
  const seg = '<div class="seg">' + [['stock', 'Bestand'], ['drunk', 'Getrunken'], ['buy', 'Einkauf']].map(([k, l]) => '<button data-act="stat-tab" data-k="' + k + '" aria-pressed="' + (tab === k) + '">' + l + '</button>').join('') + '</div>';
  let body = '';
  if (tab === 'stock') {
    const inS = D.wines.filter((w) => w.stock > 0), t = totals(D);
    if (!inS.length) body = '<div class="empty"><b>Noch kein Bestand</b></div>';
    else {
      const parts = Object.entries(t.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v, TYPE_COLOR[k]]);
      const vint = groupSum(inS, (w) => w.vintage, (w) => w.stock).sort((a, b) => a[0] - b[0]).slice(-8);
      // Bestand je Händler: Restbestand eines Weins anteilig auf seine Käufe verteilt
      const sEur = ((S.metric || {}).stock || 'eur') === 'eur';
      const alloc = inS.flatMap((w) => {
        const tot = w.purchases.reduce((s, p) => s + p.qty, 0) || 1;
        return w.purchases.map((p) => { const fl2 = w.stock * p.qty / tot; return { m: p.merchant, fl: fl2, eur: fl2 * (p.price != null ? Number(p.price) : (w.avgPrice || 0)) }; });
      });
      body = box('Rot, Weiß & Co.', donut(parts, t.stock, 'Flaschen', (k) => listHref('type', k))) +
        barBox(S, 'Rebsorten im Keller', groupSum(inS, (w) => w.grape, (w) => w.stock), num, 'grape', (k) => listHref('grape', k)) +
        barBox(S, 'Regionen', groupSum(inS, (w) => w.region, (w) => w.stock), num, 'region', (k) => listHref('region', k)) +
        (vint.length ? box('Jahrgänge im Keller', cols(vint, num, (k) => listHref('vintage', k))) : '') +
        barBox(S, 'Weingüter nach Lagerwert', groupSum(inS, (w) => w.producer, (w) => w.value), (v) => eur(v, 0), 'producer', (k) => listHref('producer', k)) +
        barBox(S, 'Händler im Bestand', groupSum(alloc, (x) => x.m, (x) => (sEur ? x.eur : x.fl)), sEur ? (v) => eur(v, 0) : num, 'smerch', (k) => listHref('merchant', k), metricSeg(S, 'stock'));
    }
  } else if (tab === 'drunk') {
    const items = D.wines.flatMap((w) => w.drinks.map((d) => ({ w, d })));
    if (!items.length) body = '<div class="empty"><b>Noch nichts getrunken</b></div>';
    else {
      const years = groupSum(items.filter((x) => x.d.drunk_on), (x) => yearOf(x.d.drunk_on), (x) => x.d.qty).sort((a, b) => a[0] - b[0]).slice(-8);
      const ba = BUY_AGAIN.map(([k, l]) => [l, items.filter((x) => x.d.buy_again === k).length]).filter((x) => x[1]);
      const fav = groupSum(items.filter((x) => x.d.buy_again === 'ja'), (x) => x.w.producer, () => 1);
      body = (years.length ? box('Flaschen pro Jahr', cols(years, num, (k) => listHref('dyear', k, 'drunk'))) : '') +
        barBox(S, 'Getrunkene Rebsorten', groupSum(items, (x) => x.w.grape, (x) => x.d.qty), num, 'dgrape', (k) => listHref('grape', k, 'drunk')) +
        (fav.length ? barBox(S, 'Lieblings-Weingüter (nochmal kaufen: ja)', fav, num, 'fav', (k) => listHref('producer', k, 'drunk')) : '') +
        (ba.length ? barBox(S, 'Nochmal kaufen?', ba, num, 'again', (k) => listHref('again', k, 'drunk')) : '');
    }
  } else {
    const ps = D.wines.flatMap((w) => w.purchases.map((p) => ({ w, p })));
    if (!ps.length) body = '<div class="empty"><b>Noch keine Käufe</b></div>';
    else {
      const val = (x) => (x.p.price != null ? x.p.qty * Number(x.p.price) : 0);
      const eurM = ((S.metric || {}).buy || 'eur') === 'eur';
      const mval = eurM ? val : (x) => x.p.qty, mfmt = eurM ? (v) => eur(v, 0) : num;
      const spent = ps.reduce((s, x) => s + val(x), 0), bottles = ps.reduce((s, x) => s + x.p.qty, 0), priced = ps.filter((x) => x.p.price != null).reduce((s, x) => s + x.p.qty, 0);
      body = '<div class="kpis"><div class="kpi dark"><div class="l">Ausgegeben</div><div class="v">' + eur(spent, 0) + '</div></div><div class="kpi"><div class="l">Flaschen</div><div class="v">' + num(bottles) + '</div></div><div class="kpi"><div class="l">Ø je Flasche</div><div class="v">' + eur2(priced ? spent / priced : 0) + '</div></div></div>' +
        boxT(eurM ? 'Ausgaben pro Jahr' : 'Flaschen pro Jahr', metricSeg(S, 'buy'), cols(groupSum(ps.filter((x) => x.p.purchased_on), (x) => yearOf(x.p.purchased_on), mval).sort((a, b) => a[0] - b[0]).slice(-8), mfmt, (k) => listHref('byear', k, 'bought'))) +
        barBox(S, 'Händler', groupSum(ps, (x) => x.p.merchant, mval), mfmt, 'merch', (k) => listHref('merchant', k, 'bought'), metricSeg(S, 'buy'));
    }
  }
  return head('Keller in Zahlen', 'Statistik') + seg + body;
}

/* ---------- Vorschläge ---------- */
export function recoView(S, D) {
  const again = D.wines.filter((w) => w.buyAgain === 'ja' && w.stock <= 1).sort((a, b) => String(b.lastDrunk || '').localeCompare(String(a.lastDrunk || ''))).slice(0, 4);
  const old = D.wines.filter((w) => w.stock > 0 && w.firstBought).sort((a, b) => a.firstBought.localeCompare(b.firstBought)).slice(0, 4);
  const card = (w, tag, text, extra = '') => '<div class="card" style="padding:16px;margin-bottom:10px"><a href="#/wein/' + w.id + '" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><span><span style="display:block;font:600 18px/1.25 var(--head)">' + esc(w.name) + (w.vintage ? ' ' + w.vintage : '') + '</span>' +
    '<span class="sub" style="display:block;font-size:13px;margin-top:3px">' + esc([w.producer, w.grape, w.region].filter(Boolean).join(' · ')) + '</span></span><span class="tag" style="flex:none">' + tag + '</span></a>' +
    (text ? '<div style="font-size:13px;line-height:1.45;margin-top:10px">' + text + '</div>' : '') + extra + '</div>';
  return head('Für dich ausgewählt', 'Vorschläge') +
    '<div class="sec">Mal wieder aufmachen</div>' + (old.length ? old.map((w) => card(w, fl(w.stock), 'Seit ' + esc(deDate(w.firstBought)) + ' im Keller' + (w.lastNote ? ' · Deine Notiz: „' + esc(w.lastNote) + '“' : ''))).join('') : '<p class="note">Noch keine Weine im Keller.</p>') +
    '<div class="sec">Nachkaufen</div>' + (again.length ? again.map((w) => card(w, w.stock ? 'Letzte Fl.' : 'Ausgetrunken', w.lastNote ? 'Deine Notiz: „' + esc(w.lastNote) + '“' : '', shopLinks(w))).join('') : '<p class="note">Hier erscheinen Weine, die du nochmal kaufen würdest und die fast oder ganz leer sind.</p>') +
    (D.wishlist.length ? '<div class="sec">Von deiner Wunschliste</div>' + D.wishlist.slice(0, 3).map((x) => '<a class="card" href="#/wunschliste" style="display:block;padding:14px 16px;margin-bottom:10px"><span style="display:block;font:600 16px var(--head)">' + esc(x.name) + '</span><span class="sub" style="display:block;font-size:13px">' + esc([x.producer, x.grape, x.price != null ? eur(x.price) : ''].filter(Boolean).join(' · ')) + '</span></a>').join('') : '');
}

/* ---------- Einstellungen / Import ---------- */
export function settingsSheet(S, D) {
  const t = totals(D);
  return '<h2>Einstellungen</h2><div class="card" style="padding:14px 16px"><div class="l eyebrow" style="letter-spacing:.08em">Angemeldet als</div><div style="font-weight:500;margin-top:2px">' + esc(S.email) + '</div>' +
    '<div class="note">' + plural(D.wines.length, 'Wein', 'Weine') + ' · ' + fl(t.stock) + ' im Keller · ' + plural(D.wishlist.length, 'Wunsch', 'Wünsche') + '</div></div>' +
    '<div class="sec">Daten</div><div class="fgrid">' +
    '<label class="btn ghost" for="imp">Import-Datei laden (.json)</label><input id="imp" class="sr" type="file" accept="application/json,.json" data-change="import">' +
    '<button class="btn ghost" data-act="export">Sicherung herunterladen (ohne Etiketten)</button></div>' +
    '<p class="note">Der Import fügt Weine, Käufe, Getrunken-Einträge, Wunschliste und Etiketten aus einer Wine-Database-Datei zu deinem Konto hinzu.</p>' +
    '<div class="btns" style="margin-top:22px"><button class="btn ghost" data-act="logout">Abmelden</button></div><p class="note" style="text-align:center">Version ' + VERSION + '</p>';
}
export function progressSheet(title, text, pct) {
  return '<h2>' + esc(title) + '</h2><p class="sub" id="prog-text">' + esc(text) + '</p><div class="progress"><i id="prog-bar" style="width:' + pct + '%"></i></div>';
}
