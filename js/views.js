// HTML-Bausteine für alle Ansichten
import { esc, eur, eur2, fl, num, deDate, deDayMonth, yearOf, plural, today } from './util.js';
import { TYPES, STYLES, TYPE_COLOR, CAP_COLORS, BUY_AGAIN, faecher, layout, matcher, totals, groupSum, capOf, tintOf } from './model.js';
import { VERSION } from './version.js';
import { ROLES, headers } from './excel.js';
import * as R from './reife.js';
import * as K from './kauf.js';

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
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ext: '<path d="M7 17L17 7M9 7h8v8"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  shelf: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  hour: '<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4 8 5 8 8.5s-8 4.5-8 8.5M16 3.5c0 4-8 5-8 8.5s8 4.5 8 8.5"/>'
};
export const icon = (n, cls = 'i') => '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>';

/* ---------- Grundgerüst ---------- */
export function nav(tab, side) {
  const a = (href, key, ic, label) => '<a href="#/' + href + '"' + (tab === key ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>';
  const s = (href, key, ic, label) => '<a class="it" href="#/' + href + '"' + (side === key ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>';
  return '<nav class="tabs" aria-label="Hauptnavigation"><div class="wrap">' +
    a('', 'home', 'grid', 'Übersicht') + a('statistik', 'stats', 'stats', 'Statistik') +
    '<a href="#/neu" class="plus" aria-label="Neuen Wein anlegen"' + (tab === 'neu' ? ' aria-current="page"' : '') + '>' + icon('plus') + '</a>' +
    a('vorschlaege', 'reco', 'glass', 'Vorschläge') + a('wunschliste', 'wish', 'heart', 'Wunschliste') + '</div></nav>' +
    // Seitenleiste für breite Bildschirme (iPad quer); per CSS ein- und ausgeblendet
    '<nav class="side" aria-label="Hauptnavigation"><div class="brand">' + logo('lgs') + '<span>Weinkeller</span></div>' +
    s('', 'home', 'grid', 'Übersicht') + s('regal', 'regal', 'shelf', 'Weinregal') + s('getrunken', 'drunk', 'clock', 'Getrunken') +
    '<i class="gap"></i>' + s('statistik', 'stats', 'stats', 'Statistik') + s('weinjahr', 'year', 'cal', 'Weinjahr') + s('reife', 'reife', 'hour', 'Trinkreife') + s('vorschlaege', 'reco', 'glass', 'Vorschläge') + s('wunschliste', 'wish', 'heart', 'Wunschliste') +
    '<div class="foot"><a class="btn" href="#/neu"' + (side === 'neu' ? ' aria-current="page"' : '') + '>' + icon('plus') + 'Neuer Wein</a>' +
    '<button class="it" data-act="settings">' + icon('gear') + '<span>Einstellungen</span></button></div></nav>';
}
const homeSeg = (cur) => '<div class="seg hs" role="navigation" aria-label="Ansicht">' +
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
const logo = (id) => '<svg class="logo" viewBox="0 0 512 512" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="34%" cy="28%" r="62%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><path d="M256 136c6-30 30-46 62-50" fill="none" stroke="#6B8A4E" stroke-width="14" stroke-linecap="round"/><path d="M300 100c34-12 62 4 70 26-30 14-60 4-70-26z" fill="#8FA86B"/><circle cx="174" cy="176" r="40" fill="#7A1F35"/><circle cx="174" cy="176" r="40" fill="url(#' + id + ')"/><circle cx="256" cy="176" r="40" fill="#7A1F35"/><circle cx="256" cy="176" r="40" fill="url(#' + id + ')"/><circle cx="338" cy="176" r="40" fill="#7A1F35"/><circle cx="338" cy="176" r="40" fill="url(#' + id + ')"/><circle cx="215" cy="248" r="40" fill="#7A1F35"/><circle cx="215" cy="248" r="40" fill="url(#' + id + ')"/><circle cx="297" cy="248" r="40" fill="#7A1F35"/><circle cx="297" cy="248" r="40" fill="url(#' + id + ')"/><circle cx="256" cy="320" r="40" fill="#7A1F35"/><circle cx="256" cy="320" r="40" fill="url(#' + id + ')"/><circle cx="256" cy="392" r="40" fill="#E3C36B"/><circle cx="256" cy="392" r="40" fill="url(#' + id + ')"/></svg>';
export function loginView(err, busy, email) {
  return '<div class="login">' + logo('lg4') + '' +
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
    // Erster Start: leeres Regal mit drei Wegen
    return head('Mein Keller', 'Willkommen', settingsBtn()) +
      '<div class="card welcome"><div class="wl-shelf" aria-hidden="true"><i></i><i></i><i></i></div><h2>Dein Weinregal ist noch leer</h2>' +
      '<p>Du hast schon eine Liste in Excel? Dann importiere sie – die App erkennt die Spalten und zeigt vor dem Import eine Vorschau. Sonst lege einfach deinen ersten Wein an.</p>' +
      '<div class="wl-acts"><label class="btn" for="ximp-home">' + icon('plus') + 'Excel-Liste importieren</label><input id="ximp-home" class="sr" type="file" accept="' + IMPORT_ACCEPT + '" data-change="import">' +
      '<a class="btn ghost" href="#/neu">Ersten Wein anlegen</a></div>' +
      '<p class="note">Noch keine Liste? <a href="' + TEMPLATE_URL + '" download style="color:var(--wine);font-weight:600">Vorlage herunterladen</a> – Mindestangaben: Weingut, Wein, Weinart, Rebsorte, Flaschen im Keller.</p></div>' +
      (D.wishlist.length ? '<div class="btns"><a class="btn ghost" href="#/wunschliste">' + icon('heart') + 'Zur Wunschliste (' + D.wishlist.length + ')</a></div>' : '');
  }
  const order = ['Weißwein', 'Rotwein', 'Champagner', 'Schaumwein', 'Rosé', 'Süßwein'].filter((k) => t.byType[k]);
  const bar = order.map((k) => '<i style="width:' + (t.byType[k] / t.stock * 100).toFixed(1) + '%;background:' + TYPE_COLOR[k] + '"></i>').join('');
  const lg = order.map((k) => '<span>' + esc(shortType(k)) + ' ' + num(t.byType[k]) + '</span>').join('');
  const last = D.wines.flatMap((w) => w.drinks.filter((d) => d.drunk_on).map((d) => ({ w, d }))).sort((a, b) => b.d.drunk_on.localeCompare(a.d.drunk_on))[0];
  const prod = groupSum(D.wines.filter((w) => w.stock > 0), (w) => w.producer, (w) => w.stock).slice(0, 3);
  const pval = (name) => D.wines.filter((w) => w.producer === name).reduce((s, w) => s + w.value, 0);
  const main = '<div class="hero"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
    '<div><div class="l">Im Keller</div><div style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span class="big">' + num(t.stock) + '</span><span style="color:#D8C8BE">Flaschen</span></div></div>' +
    '<div style="text-align:right"><div class="l">Lagerwert</div><div style="font:600 24px var(--head);margin-top:2px">' + eur(t.value, 0) + '</div>' +
    '<div class="l" style="margin-top:4px">Ø ' + eur2(t.stock ? t.value / t.stock : 0) + ' / Flasche</div></div></div>' +
    '<div class="bar">' + bar + '</div><div class="legend">' + lg + '</div></div>' + reifeHome(D) +
    '<a class="search" href="#/regal?focus=1" style="display:block"><span class="box">' + icon('search') + '<span>Wein, Weingut oder Rebsorte suchen</span></span></a>' +
    (last ? '<div class="sec">Zuletzt getrunken</div><a class="card" href="#/wein/' + last.w.id + '" style="display:flex;gap:14px;padding:14px 16px">' +
      '<span style="width:6px;border-radius:3px;flex:none;background:' + TYPE_COLOR[last.w.wine_type] + '"></span><span style="min-width:0">' +
      '<span style="display:block;font:600 17px/1.25 var(--head)">' + esc(last.w.name) + '</span>' +
      '<span class="sub" style="display:block;margin-top:2px;font-size:13px">' + esc([last.w.producer, last.w.region, deDate(last.d.drunk_on)].filter(Boolean).join(' · ')) + '</span>' +
      (last.d.note ? '<span style="display:block;margin-top:8px;font-size:13px">„' + esc(last.d.note) + '“</span>' : '') + '</span></a>' : '') +
    (prod.length ? '<div class="sec">Größte Bestände nach Weingut</div><div class="card list">' +
      prod.map(([n, c]) => '<a class="row" href="#/regal?q=' + encodeURIComponent(n) + '"><span class="tx"><span class="t">' + esc(n) + '</span></span><span class="r" style="color:var(--muted);font-size:13px">' + fl(c) + ' · ' + eur(pval(n), 0) + '</span></a>').join('') + '</div>' : '');
  if (!S.wide) return head('Mein Keller', 'Übersicht', settingsBtn()) + yearHomeCard(S, D) + homeSeg('home') + main + '<div class="btns"><a class="btn ghost" href="#/regal">' + icon('shelf') + 'Zum Weinregal</a></div>';
  // iPad quer: Dashboard mit Regal und Jahresverlauf rechts
  const yr = {};
  D.wines.forEach((w) => {
    w.purchases.forEach((p) => { const y = yearOf(p.purchased_on); if (y) (yr[y] = yr[y] || [0, 0])[0] += p.qty; });
    w.drinks.forEach((d) => { const y = yearOf(d.drunk_on); if (y) (yr[y] = yr[y] || [0, 0])[1] += d.qty; });
  });
  const years = Object.keys(yr).sort().slice(-6).map((y) => [y, yr[y][0], yr[y][1]]);
  return head('Mein Keller', 'Übersicht', settingsBtn()) + yearHomeCard(S, D) +
    '<div class="dash"><div>' + main + '</div><div><div class="sec" style="margin-top:18px;display:flex;justify-content:space-between"><span>Weinregal</span><a href="#/regal" style="color:var(--wine);letter-spacing:0;text-transform:none;font-weight:600">Öffnen</a></div>' + shelfHtml(D, '') +
    (years.length ? '<div class="sec">Gekauft und getrunken pro Jahr</div><div class="card chart">' + pairCols(years) + '</div>' : '') + '</div></div>';
}
// Doppel-Säulen je Jahr: gekauft (hell) und getrunken (Weinrot)
function pairCols(rows) {
  const max = Math.max(1, ...rows.flatMap((r) => [r[1], r[2]]));
  const bar = (v, cls, href, label) => '<a class="pb ' + cls + '" href="' + href + '" aria-label="' + esc(label) + '"><span>' + num(v) + '</span><i style="height:' + Math.max(2, v / max * 92).toFixed(0) + 'px"></i></a>';
  return '<div class="pairs">' + rows.map(([y, b, d]) => '<div class="pc"><div class="pbars">' +
    bar(b, 'b', listHref('byear', y, 'bought'), y + ': ' + b + ' gekauft') + bar(d, 'd', listHref('dyear', y, 'drunk'), y + ': ' + d + ' getrunken') + '</div><b>' + esc(y) + '</b></div>').join('') + '</div>' +
    '<div class="plg"><span><i class="b"></i>Gekauft</span><span><i class="d"></i>Getrunken</span><em>Flaschen · ohne undatierte Einträge</em></div>';
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
// Kapsel-Stapel eines Fachs (Regal und Mini-Fach nutzen dieselbe Darstellung).
// items: [{ w, hit }] in Reihenfolge der Priorität – die ersten liegen unten vorne.
export function stackHtml(items, capCls = '', colorOf = tintOf) {
  const L = layout(items.length), shown = [];
  L.rows.forEach((k) => { for (let j = 0; j < k; j++) shown.push(items[shown.length]); });
  const rows = []; let p = 0;
  for (let r = L.rows.length - 1; r >= 0; r--) {
    const caps = [];
    for (let j = 0; j < L.rows[r]; j++) { const x = shown[p++]; caps.unshift(cap(colorOf(x.w), capCls, x.hit)); }
    rows.unshift('<div class="lr' + (L.stacked ? ' st' : '') + '">' + caps.join('') + '</div>');
  }
  return rows.join('');
}
export function shelfHtml(D, q, sel) {
  const m = matcher(q);
  return '<div class="shelf"><div class="grid">' + faecher(D).map((f) => {
    const wines = f.wines.map((w, i) => ({ w, i, hit: m ? m(w) : false }));
    const hits = wines.filter((x) => x.hit).length;
    if (m) wines.sort((a, b) => (b.hit - a.hit) || (a.i - b.i));
    const rows = [stackHtml(wines)];
    const n = wines.length, empty = !n;
    const cnt = empty ? '' : '<span class="cnt' + (m && hits ? ' hit' : '') + '">' + (m ? (hits ? hits + ' von ' + n : '0') : n) + '</span>';
    const aria = f.name + ', ' + plural(n, 'Wein', 'Weine') + ', ' + fl(f.bottles) + (m ? ', ' + hits + ' Treffer' : '');
    return '<a class="fach' + (m && !hits ? ' dim' : '') + (empty ? ' empty-f' : '') + (f.name === sel ? ' sel' : '') + '" href="#/fach/' + encodeURIComponent(f.name) + '" aria-label="' + esc(aria) + '">' +
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
function wineRow(w, mode, date) {
  const right = mode === 'drunk' ? w.drunk + '× getr.' : mode === 'bought' ? fl(w.bought) + ' gek.' : (w.stock ? fl(w.stock) : '<span style="color:var(--muted)">leer</span>');
  return '<a class="row" href="#/wein/' + w.id + '">' + cap(capOf(w), 's28') +
    '<span class="tx"><span class="t">' + esc(w.name) + '</span><span class="s">' + esc([date ? deDate(date) : '', w.producer, w.grape, w.vintage, w.region].filter(Boolean).join(' · ')) + '</span></span>' +
    (mode ? '<span class="r">' + right + '</span>' : '') + icon('chev', 'i chev') + '</a>';
}

/* ---------- Fach / Trefferliste ---------- */
// opts: { eyebrow, back: [href, label], mini, scope: 'stock' | 'drunk' | 'bought', year, split, showBack, sel }
// sel: Wein-ID, die in der Liste markiert wird (Liste | Detail auf dem iPad)
// split: rechte Spalte der geteilten Ansicht (iPad) – ohne Zurück-Knopf und Mini-Fach
// Bei getrunken/gekauft: Standard-Sortierung nach Datum, zuletzt getrunkener/gekaufter Wein zuerst
export function fachView(S, D, name, list, opts = {}) {
  const o = { eyebrow: 'Fach', back: ['#/regal', 'Weinregal'], mini: true, scope: 'stock', ...opts };
  const inYear = (d) => d && (!o.year || String(d).startsWith(o.year));
  const dateOf = o.scope === 'drunk' ? (w) => (w.drinks.find((d) => inYear(d.drunk_on)) || {}).drunk_on || null
    : o.scope === 'bought' ? (w) => (w.purchases.find((p) => inYear(p.purchased_on)) || {}).purchased_on || null : () => null;
  const byDate = (a, b) => String(dateOf(b) || '').localeCompare(String(dateOf(a) || '')) || a.name.localeCompare(b.name);
  const firstSort = o.scope === 'drunk' ? ['Zuletzt getrunken', byDate] : o.scope === 'bought' ? ['Zuletzt gekauft', byDate]
    : ['Bestand', (a, b) => b.stock - a.stock || a.name.localeCompare(b.name)];
  const sorters = { stock: firstSort, producer: ['Weingut', (a, b) => a.producer.localeCompare(b.producer) || a.name.localeCompare(b.name)], vintage: ['Jahrgang', (a, b) => (b.vintage || 0) - (a.vintage || 0)], region: ['Region', (a, b) => String(a.region || '').localeCompare(String(b.region || ''))] };
  const sorted = list.slice().sort(sorters[S.fachSort] ? sorters[S.fachSort][1] : sorters.stock[1]);
  const b = list.reduce((s, w) => s + w.stock, 0), v = list.reduce((s, w) => s + w.value, 0);
  const nProd = new Set(list.map((w) => w.producer).filter(Boolean)).size, nReg = new Set(list.map((w) => w.region).filter(Boolean)).size;
  // Mini-Fach: gleiche Stufe und Reihenfolge wie im Regal, Kapselfarben je Weingut
  const showMini = o.mini && !o.split;
  const mini = showMini ? stackHtml(list.map((w) => ({ w, hit: false })), 's20', capOf) : '';
  return (o.split && !o.showBack ? '' : backBtn(o.back[0], o.back[1])) +
    '<div class="top" style="align-items:center"><div><div class="eyebrow">' + esc(o.eyebrow) + '</div><h1 class="title">' + esc(name) + '</h1>' +
    '<div class="sub">' + plural(nProd, 'Weingut', 'Weingüter') + ' · ' + plural(nReg, 'Region', 'Regionen') + '</div></div>' +
    (showMini ? '<div class="mini" aria-hidden="true"><div class="in">' + mini + '</div></div>' : '') + '</div>' +
    '<div class="kpis"><div class="kpi dark"><div class="l">Weine</div><div class="v">' + num(list.length) + '</div></div>' +
    (o.scope === 'stock'
      ? '<div class="kpi"><div class="l">Flaschen</div><div class="v">' + num(b) + '</div></div><div class="kpi"><div class="l">Lagerwert</div><div class="v">' + eur(v, 0) + '</div></div>'
      : '<div class="kpi"><div class="l">' + (o.scope === 'drunk' ? 'Getrunken' : 'Gekauft') + '</div><div class="v">' + fl(list.reduce((s, w) => s + (o.scope === 'drunk' ? w.drunk : w.bought), 0)) + '</div></div><div class="kpi"><div class="l">Noch im Keller</div><div class="v">' + fl(b) + '</div></div>') + '</div>' +
    (o.fachChips ? '<div class="chips fchips" style="margin-top:14px">' + o.fachChips.map((f) => '<a class="chip" href="#/fach/' + encodeURIComponent(f.name) + '" aria-pressed="' + (f.name === name) + '">' + esc(f.name) + ' <b>' + f.wines.length + '</b></a>').join('') + '</div>' : '') +
    '<div class="fbar"><div class="chips" style="margin-top:0">' + Object.entries(sorters).map(([k, [l]]) => '<button class="chip" data-act="fach-sort" data-k="' + k + '" aria-pressed="' + (S.fachSort === k) + '">' + l + '</button>').join('') + '</div>' +
    (o.wall ? '<div class="seg sm" role="group" aria-label="Ansicht">' + [['list', 'Liste'], ['labels', 'Etiketten']].map(([k, l]) => '<button data-act="fach-mode" data-k="' + k + '" aria-pressed="' + ((S.fachMode || 'list') === k) + '">' + l + '</button>').join('') + '</div>' : '') + '</div>' +
    (list.length && o.wall && S.fachMode === 'labels' && !o.sel ? labelWall(S, sorted) :
    list.length ? '<p class="note" style="margin-top:12px">Kapselfarbe je Weingut, festgelegt beim Erfassen. ' + cap('#262C29', 's12') + ' = noch offen</p>' +
      '<div class="card list" style="margin-top:10px;overflow:hidden">' + sorted.map((w) => { const r = wineRow(w, o.scope, dateOf(w)); return w.id === o.sel ? r.replace('<a class="row"', '<a class="row sel" aria-current="true"') : r; }).join('') + '</div>'
      : o.scope !== 'stock' || !o.mini ? '<div class="empty"><b>Keine Weine gefunden</b></div>'
      : '<div class="empty"><b>Dieses Fach ist leer</b>Sobald du einen passenden Wein anlegst, landet er hier.</div><div class="btns"><a class="btn" href="#/neu">Wein anlegen</a></div>') + (o.footer || '');
}

// Etiketten-Wand: Weine eines Fachs als Etikettenfotos, ohne Foto mit Platzhalter
function labelWall(S, list) {
  const ini = (p) => String(p || '?').replace(/^(Weingut|Weinbau|Dr\.|Schloss|Villa|Domaine|Château|Chateau|Champagne)\s+/i, '').split(/[\s-]+/).map((x) => x.charAt(0)).join('').slice(0, 2).toUpperCase();
  const n = list.filter((w) => w.label_path && S.urls[w.label_path]).length;
  return '<p class="note" style="margin-top:12px">' + plural(list.length, 'Wein', 'Weine') + ' · ' + n + ' mit Foto' + (n < list.length ? ' · <a href="#/fotos" style="color:var(--wine);font-weight:600">Fehlende Fotos nachtragen</a>' : '') + '</p><div class="wall">' + list.map((w) => {
    const u = w.label_path && S.urls[w.label_path];
    return '<a href="#/wein/' + w.id + '" aria-label="' + esc(w.name + (w.vintage ? ' ' + w.vintage : '') + ', ' + (w.producer || '') + ', ' + fl(w.stock) + (u ? '' : ', noch ohne Etikettenfoto')) + '"><span class="pic">' +
      (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '<span class="ph"><b>' + esc(ini(w.producer)) + '</b>' + icon('camera') + '<span>Foto fehlt</span></span>') +
      '<span class="q">' + num(w.stock) + ' Fl.</span></span><span class="nm">' + esc(w.name) + '</span><span class="sb">' + esc([w.producer, w.vintage].filter(Boolean).join(' · ')) + '</span></a>';
  }).join('') + '</div>';
}

// iPad quer: Regal links, gewähltes Fach rechts
export function fachSplit(S, D, name, list) {
  const t = totals(D), F = faecher(D);
  return '<div class="split"><div class="split-l">' + head('Mein Keller', 'Weinregal', '<div class="meta">' + fl(t.stock) + '<br>' + plural(F.length, 'Fach', 'Fächer') + '</div>') +
    shelfHtml(D, S.q, name) + (S.q.trim() ? '<p class="hint">Gold = Treffer für „' + esc(S.q.trim()) + '“ · <a href="#/regal" style="color:var(--wine)">Suche bearbeiten</a></p>' : '') +
    '</div><div class="split-r">' + fachView(S, D, name, list, { split: true, wall: true }) + '</div></div>';
}

// Fehlende Etiketten nachtragen: alle Weine ohne Foto, auch ausgetrunkene, mit Kamera-Knopf je Zeile
export function photosView(S, D) {
  const ws = D.wines.filter((w) => !w.label_path).sort((a, b) => (b.stock > 0) - (a.stock > 0) || String(b.lastDrunk || '').localeCompare(String(a.lastDrunk || '')) || a.name.localeCompare(b.name));
  const row = (w) => '<div class="row prow2"><a class="tx" href="#/wein/' + w.id + '"><span class="t">' + esc(w.name) + (w.vintage ? ' ' + w.vintage : '') + '</span><span class="s">' + esc([w.producer, w.stock > 0 ? fl(w.stock) + ' im Keller' : 'ausgetrunken' + (w.lastDrunk ? ' · zuletzt ' + deDate(w.lastDrunk) : '')].filter(Boolean).join(' · ')) + '</span></a>' +
    '<label class="btn ghost cam" for="lfp-' + w.id + '">' + icon('camera') + 'Foto</label><input id="lfp-' + w.id + '" class="sr" type="file" accept="image/*" data-change="label" data-id="' + w.id + '"></div>';
  const inS = ws.filter((w) => w.stock > 0), out = ws.filter((w) => w.stock <= 0);
  return backBtn('#/regal', 'Weinregal') + '<div class="top"><div><div class="eyebrow">Etiketten</div><h1 class="title">Fotos nachtragen</h1><div class="sub">' + (ws.length ? plural(ws.length, 'Wein', 'Weine') + ' ohne Etikettenfoto' : 'Alle Weine haben ein Foto') + '</div></div></div>' +
    (ws.length ? '<p class="note">„Foto“ öffnet Kamera oder Fotomediathek. Nach dem Speichern verschwindet der Wein aus der Liste.</p>' : '<div class="empty"><b>Alles erledigt</b>Jeder Wein hat ein Etikettenfoto.</div>') +
    (inS.length ? '<div class="sec">Im Keller (' + inS.length + ')</div><div class="card list">' + inS.map(row).join('') + '</div>' : '') +
    (out.length ? '<div class="sec">Ausgetrunken (' + out.length + ')</div><div class="card list">' + out.map(row).join('') + '</div>' : '');
}

/* ---------- Detail ---------- */
export function detailView(S, D, w, opts = {}) {
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
      '<span class="s">' + esc([deDate(e.x.drunk_on) || 'Datum unbekannt', e.x.occasion, MAT_TXT[e.x.maturity] && 'Reife: ' + MAT_TXT[e.x.maturity]].filter(Boolean).join(' · ')) + '</span>' + starsShow(e.x.rating) + (e.x.note ? '<span class="n" style="display:block">„' + esc(e.x.note) + '“</span>' : '') + '</span>' +
      '<button class="del" data-act="edit-drink" data-id="' + e.x.id + '" aria-label="Getrunken-Eintrag bearbeiten">' + icon('edit') + '</button></div>';
  const url = w.label_path && S.urls[w.label_path];
  return '<div style="display:flex;justify-content:space-between;align-items:center">' + (opts.split ? '<span></span>' : backBtn(S.backHref || '#/regal', S.backLabel || 'Zurück')) +
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
    reifeCard(w) + '<div class="sec">Steckbrief</div><div class="card facts">' + facts.map(([l, v]) => '<div><div class="l">' + esc(l) + '</div><div class="v">' + esc(v) + '</div></div>').join('') + '</div>' +
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
// Suche in getrunkenen Weinen: Wein-Angaben plus Trinknotiz, Anlass, Datum, Bewertung
export function drinkMatcher(q) {
  const tokens = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  return ({ w, d }) => {
    const hay = [w.name, w.producer, w.grape, w.wine_type, w.style, w.region, w.vintage, w.fach, w.merchants.join(' '), d.note, d.occasion, d.drunk_on, d.drunk_on ? deDate(d.drunk_on) : 'ohne datum',
      d.rating ? d.rating + ' sterne' : '', MAT_TXT[d.maturity] || '', d.buy_again ? 'nochmal ' + d.buy_again : ''].join(' ').toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };
}
export function drunkView(S, D) {
  const t = totals(D);
  return head('Meine Erinnerungen', 'Getrunken') + homeSeg('drunk') + drunkHead(S, D, t) + '<div id="dlist">' + drunkList(S, D) + '</div>';
}
export function drunkList(S, D) {
  let items = D.wines.flatMap((w) => w.drinks.map((d) => ({ w, d })));
  const m = drinkMatcher(S.drunkQ); if (m) items = items.filter(m);
  if (S.drunkFilter === 'again') items = items.filter((x) => x.d.buy_again === 'ja');
  if (S.drunkFilter === 'occasion') items = items.filter((x) => x.d.occasion);
  const occ = String(S.drunkFilter).startsWith('occ:') ? S.drunkFilter.slice(4) : '';
  if (occ) items = items.filter((x) => x.d.occasion === occ);
  items.sort((a, b) => String(b.d.drunk_on || '').localeCompare(String(a.d.drunk_on || '')) || String(b.d.created_at).localeCompare(String(a.d.created_at)));
  const groups = [];
  for (const x of items) {
    const y = yearOf(x.d.drunk_on) || 'Ohne Datum';
    if (!groups.length || groups[groups.length - 1].y !== y) groups.push({ y, items: [] });
    groups[groups.length - 1].items.push(x);
  }
  const shown = groups.reduce((acc, g) => { if (acc.n < S.drunkLimit) { const take = g.items.slice(0, S.drunkLimit - acc.n); acc.n += take.length; acc.g.push({ y: g.y, items: take }); } return acc; }, { n: 0, g: [] });
  const fchip = (k, l) => '<button class="chip" data-act="drunk-filter" data-k="' + k + '" aria-pressed="' + (S.drunkFilter === k) + '">' + l + '</button>';
  const fl0 = items.reduce((n, x) => n + x.d.qty, 0);
  return '<div class="chips" style="margin-top:14px">' + fchip('all', 'Alle') + fchip('again', 'Nochmal kaufen') + fchip('occasion', 'Mit Anlass') + (occ ? fchip(S.drunkFilter, 'Anlass: ' + esc(occ)) : '') + '</div>' +
    (m && items.length ? '<p class="note" style="margin-top:10px">' + plural(items.length, 'Eintrag', 'Einträge') + ' · ' + fl(fl0) + ' für „' + esc(S.drunkQ.trim()) + '“</p>' : '') +
    (items.length ? shown.g.map((g) => '<div class="year"><b>' + esc(g.y) + '</b><i></i></div><div class="mems">' + g.items.map(({ w, d }) =>
      '<div class="mem"><a class="go" href="#/wein/' + w.id + '">' + labelImg(w, S.urls, 'th') + '<span class="tx"><span class="d">' + esc(d.drunk_on ? deDayMonth(d.drunk_on) : 'Datum unbekannt') + (d.qty > 1 ? ' · ' + fl(d.qty) : '') + '</span>' +
      '<span class="w">' + esc(w.name) + '</span><span class="s">' + esc([w.producer, w.grape].filter(Boolean).join(' · ')) + '</span>' + starsShow(d.rating) +
      (d.note ? '<span class="n">„' + esc(d.note) + '“</span>' : '') + (d.occasion ? '<span class="an">Anlass: ' + esc(d.occasion) + '</span>' : '') + '</span></a>' +
      '<span class="eds"><button class="ed" data-act="edit-drink" data-id="' + d.id + '" aria-label="Notiz und Anlass bearbeiten">' + icon('edit') + '</button>' +
      (w.label_path ? '' : '<label class="ed" for="lfm-' + d.id + '" aria-label="Etikett fotografieren">' + icon('camera') + '</label><input id="lfm-' + d.id + '" class="sr" type="file" accept="image/*" data-change="label" data-id="' + w.id + '">') + '</span></div>').join('') + '</div>').join('') +
      (items.length > S.drunkLimit ? '<button class="more card" style="margin-top:4px" data-act="drunk-more">Weitere ' + (items.length - S.drunkLimit) + ' Einträge anzeigen</button>' : '') : (m ? '<div class="empty"><b>Nichts gefunden</b>Kein getrunkener Wein passt zu „' + esc(S.drunkQ.trim()) + '“.</div>' : '<div class="empty"><b>Noch nichts getrunken</b>Markiere in der Detailansicht eines Weins „Flasche getrunken“.</div>'));
}
function drunkHead(S, D, t) {
  return '<div class="kpis"><div class="kpi dark"><div class="l">Flaschen</div><div class="v">' + num(t.drunk) + '</div></div><div class="kpi"><div class="l">Genossen für</div><div class="v">' + eur(t.drunkValue, 0) + '</div></div><div class="kpi"><div class="l">Nochmal kaufen</div><div class="v">' + num(t.again) + '×</div></div></div>' +
    (S.wide ? drunkWide(S, D) : '') +
    '<div class="search dsearch"><div class="box">' + icon('search') + '<label for="dq" class="sr">In getrunkenen Weinen suchen</label><input id="dq" type="search" enterkeyhint="search" autocomplete="off" placeholder="Wein, Weingut, Notiz, Anlass, Jahr …" value="' + esc(S.drunkQ || '') + '">' +
    '<button class="clr' + (S.drunkQ ? '' : ' hidden') + '" data-act="clear-dq" aria-label="Suche leeren">' + icon('x') + '</button></div></div>';
}


// iPad quer: Zeitstrahl der letzten Erinnerungen (seitenweise) sowie Jahre und Anlässe
const TL_PER = 4;
function drunkWide(S, D) {
  const all = D.wines.flatMap((w) => w.drinks.map((d) => ({ w, d })));
  const dated = all.filter((x) => x.d.drunk_on).sort((a, b) => a.d.drunk_on.localeCompare(b.d.drunk_on) || String(a.d.created_at).localeCompare(String(b.d.created_at)));
  const pages = Math.max(1, Math.ceil(dated.length / TL_PER)), page = Math.min(S.tlPage || 0, pages - 1);
  const end = dated.length - page * TL_PER, slice = dated.slice(Math.max(0, end - TL_PER), end);
  const tl = slice.length ? '<div class="tl">' + slice.map(({ w, d }, i) =>
    '<a class="tle" href="#/wein/' + w.id + '"><span class="dot' + (page === 0 && i === slice.length - 1 ? ' now' : '') + '"></span><span class="d">' + esc(deDate(d.drunk_on)) + '</span>' +
    '<span class="tlc">' + labelImg(w, S.urls, 'th') + '<span class="tx"><span class="w">' + esc(w.name) + '</span><span class="s">' + esc(w.producer || '') + '</span>' +
    (d.note ? '<span class="n">„' + esc(d.note) + '“</span>' : '') + (d.occasion ? '<span class="an">' + esc(d.occasion) + '</span>' : '') + '</span></span></a>').join('') + '</div>' : '<p class="note">Noch keine datierten Einträge.</p>';
  const pager = '<div class="mseg"><button data-act="tl-page" data-d="1" aria-label="Ältere Einträge"' + (page >= pages - 1 ? ' disabled' : '') + '>' + icon('back') + '</button>' +
    '<button data-act="tl-page" data-d="-1" aria-label="Neuere Einträge"' + (page === 0 ? ' disabled' : '') + '>' + icon('chev') + '</button></div>';
  const yrs = groupSum(dated, (x) => yearOf(x.d.drunk_on), (x) => x.d.qty).sort((a, b) => a[0] - b[0]).slice(-6);
  const nodate = all.filter((x) => !x.d.drunk_on).reduce((s, x) => s + x.d.qty, 0);
  if (nodate) yrs.push(['ohne Datum', nodate]);
  const occs = groupSum(all.filter((x) => x.d.occasion), (x) => x.d.occasion, () => 1);
  return '<div class="card chart" style="margin-top:16px"><div class="chart-head"><div class="eyebrow">Zeitstrahl · ' + (page === 0 ? 'zuletzt getrunken' : 'Seite ' + (page + 1) + ' von ' + pages) + '</div>' + pager + '</div>' + tl + '</div>' +
    '<div class="sgrid"><div class="card chart"><div class="eyebrow" style="margin-bottom:12px;letter-spacing:.1em">Getrunken je Jahr</div>' + cols(yrs, num, (k) => (k === 'ohne Datum' ? '' : listHref('dyear', k, 'drunk'))) + '</div>' +
    '<div class="card chart"><div class="eyebrow" style="margin-bottom:12px;letter-spacing:.1em">Anlässe</div>' +
    (occs.length ? '<div class="tags" style="margin-top:0">' + occs.map(([k, n]) => '<button class="chip" data-act="drunk-filter" data-k="occ:' + esc(k) + '" aria-pressed="' + (S.drunkFilter === 'occ:' + k) + '">' + esc(k) + ' <b style="font-weight:600;color:var(--muted)">' + n + '</b></button>').join('') + '</div>' +
      '<p class="note">Tippen auf einen Anlass zeigt unten alle Weine, die du dazu getrunken hast.</p>' : '<p class="note" style="margin-top:0">Noch keine Anlässe erfasst. Du kannst sie beim Eintrag „Getrunken“ ergänzen.</p>') + '</div></div>';
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
const numIn = (v) => { const n = Number(String(v || '').replace(',', '.')); return String(v || '').trim() && Number.isFinite(n) ? n : null; };
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
    '<div class="sec">Trinkfenster</div><div class="card" style="padding:16px" id="nw-reife">' + newReife({ ...f.wine, price: numIn(f.price) }, f.tier) + '</div>' +
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
// Bewertung und Reife (ab 1.2)
export const MAT_TXT = { jung: 'zu jung', ok: 'genau richtig', drueber: 'drüber' };
export const RATING_LABEL = ['', 'Enttäuschend', 'Geht so', 'Gut', 'Sehr gut', 'Herausragend'];
export const MATURITY = [['jung', 'Zu jung'], ['ok', 'Genau richtig'], ['drueber', 'Drüber']];
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3.1-5.4 3.1 1.2-6-4.5-4.2 6.1-.7z"/></svg>';
export function starsInput(r) {
  return '<div class="stars" role="radiogroup" aria-label="Bewertung">' + [1, 2, 3, 4, 5].map((n) =>
    '<button type="button" role="radio" data-act="rate" data-n="' + n + '" aria-checked="' + (r === n) + '" aria-label="' + n + ' von 5 Sternen – ' + RATING_LABEL[n] + '"' + (r && n <= r ? ' class="on"' : '') + '>' + STAR + '</button>').join('') +
    '<span class="sl' + (r ? '' : ' off') + '">' + (r ? RATING_LABEL[r] : 'Noch nicht bewertet') + '</span></div>';
}
export const starsShow = (r) => (r ? '<span class="srow" role="img" aria-label="' + r + ' von 5 Sternen">' + [1, 2, 3, 4, 5].map((n) => '<i' + (n <= r ? ' class="on"' : '') + '>' + STAR + '</i>').join('') + '</span>' : '');
export function maturityHint(m, left) {
  const fl = left === 1 ? 'Die übrige Flasche' : left > 1 ? 'Die übrigen ' + left + ' Flaschen' : '';
  if (!m) return 'Deine Einschätzung passt das Trinkfenster der übrigen Flaschen an.';
  if (!fl) return 'Gespeichert – hilft bei künftigen Jahrgängen dieses Weins.';
  return m === 'jung' ? fl + ' ' + (left === 1 ? 'bekommt' : 'bekommen') + ' ein späteres Trinkfenster.' : m === 'drueber' ? fl + ' ' + (left === 1 ? 'rückt' : 'rücken') + ' nach vorn: bald trinken.' : 'Passt – der Höhepunkt schließt dieses Jahr ein.';
}
export function drinkSheet(S, w, d = null) {
  const sel = S.form.buyAgain;
  const max = Math.max(1, w.stock + (d ? d.qty : 0));
  return '<h2>' + (d ? 'Getrunken bearbeiten' : 'Flasche getrunken') + '</h2><p class="sub" style="margin:-6px 0 14px">' + esc([w.name, w.producer, w.vintage].filter(Boolean).join(' · ')) + '</p>' +
    '<form data-form="drink" data-id="' + w.id + '"' + (d ? ' data-did="' + d.id + '"' : '') + ' novalidate><div class="fgrid"><div class="frow">' + fld('drunk_on', 'Datum', 'type="date"', d ? (d.drunk_on || '') : today()) +
    '<div class="field" style="flex:0 0 104px"><label for="dqty">Flaschen</label><input id="dqty" name="qty" type="number" inputmode="numeric" min="1" max="' + max + '" value="' + (d ? d.qty : 1) + '"></div></div>' +
    '<div class="field"><label for="note">Meine Notiz</label><textarea id="note" name="note" rows="3" placeholder="Wie war er? Aromen, Begleitung, Eindruck …">' + esc(d ? d.note || '' : '') + '</textarea></div>' +
    fld('occasion', 'Anlass (optional)', 'autocomplete="off" placeholder="z. B. Geburtstag, Essen mit Freunden"', d ? d.occasion : '') + '</div>' +
    '<div class="sec">Wie hat er dir geschmeckt?</div>' + starsInput(S.form.rating) +
    '<div class="sec">Wie war die Reife? <span class="opt">(optional)</span></div><div class="opts" data-grp="maturity" role="group" aria-label="Reife">' +
    MATURITY.map(([k, l]) => '<button type="button" data-act="maturity" data-k="' + k + '" aria-pressed="' + (S.form.maturity === k) + '">' + l + '</button>').join('') + '</div>' +
    '<p class="note" id="mat-hint" data-left="' + Math.max(0, w.stock - (d ? 0 : 1)) + '">' + esc(maturityHint(S.form.maturity, Math.max(0, w.stock - (d ? 0 : 1)))) + '</p>' +
    '<div class="sec">Würdest du ihn nochmal kaufen?</div><div class="opts" data-grp="again" role="group" aria-label="Nochmal kaufen">' +
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
    (list.length ? '<div class="wgrid">' + list.map((x) => {
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
  again: ['Nochmal kaufen', (w) => w.drinks.map((d) => BA_LABEL[d.buy_again]).filter(Boolean)],
  price: ['Preis pro Flasche', (w) => priceBucket(w.avgPrice)],
  gv: ['Rebsorte und Jahrgang', (w) => (w.grape || 'ohne Rebsorte') + ' ' + (w.vintage || 'ohne Jahrgang')]
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
  if (link) return '<div class="cols lk">' + rows.map(([k, v]) => link(k) ? '<a class="col" href="' + esc(link(k)) + '" aria-label="' + esc(k + ': ' + fmt(v) + ', Weine anzeigen') + '">' + bar(v) + '<b>' + esc(k) + '</b></a>'
    : '<div class="col nl">' + bar(v) + '<b>' + esc(k) + '</b></div>').join('') + '</div>';
  return '<div class="cols">' + rows.map(([k, v]) => '<div class="col">' + bar(v) + '</div>').join('') + '</div>' +
    '<div class="cols-x">' + rows.map(([k]) => '<span>' + esc(k) + '</span>').join('') + '</div>';
}
const boxT = (title, right, inner) => '<div class="card chart" style="margin-top:12px"><div class="chart-head"><div class="eyebrow">' + esc(title) + '</div>' + right + '</div>' + inner + '</div>';
// Balken-Box: „Top-5 …“ solange zugeklappt und mehr als 5 Einträge, sonst Titel ohne Zusatz
function barBox(S, title, rows, fmt, key, link, right = '') {
  const open = S.expand.has(key);
  return boxT((!open && rows.length > TOP_N ? 'Top-5 ' : '') + title, right, hbars(rows, fmt, { key, open, link }));
}
// Rebsorte × Jahrgang: Flaschen im Keller als Raster mit Farbabstufung
function matrixBox(ws) {
  if (ws.length < 3) return '';
  const vy = [...new Set(ws.map((w) => w.vintage || 0))].sort((a, b) => (a || 9999) - (b || 9999));
  const gr = groupSum(ws, (w) => w.grape || 'ohne Rebsorte', (w) => w.stock).sort((a, b) => b[1] - a[1]);
  const cell = (g, v) => ws.filter((w) => (w.grape || 'ohne Rebsorte') === g && (w.vintage || 0) === v).reduce((s, w) => s + w.stock, 0);
  const lvl = (n) => (!n ? '' : n <= 2 ? ' m1' : n <= 5 ? ' m2' : n <= 10 ? ' m3' : ' m4');
  const colSum = vy.map((v) => ws.filter((w) => (w.vintage || 0) === v).reduce((s, w) => s + w.stock, 0)), total = colSum.reduce((a, b) => a + b, 0);
  // Schwerpunkt: die drei aufeinanderfolgenden Jahrgänge der größten Rebsorte mit den meisten Flaschen
  const top = gr[0][0], yrs = vy.filter(Boolean); let best = null;
  for (let i = 0; i + 2 < yrs.length; i++) { const n = yrs.slice(i, i + 3).reduce((s, v) => s + cell(top, v), 0); if (!best || n > best.n) best = { a: yrs[i], b: yrs[i + 2], n }; }
  const cs = 'grid-template-columns:minmax(96px,130px) repeat(' + vy.length + ',minmax(30px,1fr)) 46px';
  return '<div class="card chart full"><div class="chart-head"><div class="eyebrow ce">Rebsorte × Jahrgang</div><div class="note" style="margin:0">Feld antippen zeigt die Weine</div></div>' +
    (best && best.n ? '<div class="wjsal" style="margin-top:6px">Schwerpunkt: <b>' + esc(top) + ' ' + best.a + '–' + best.b + ' mit ' + fl(best.n) + '</b> (' + Math.round(best.n / total * 100) + ' % des Kellers)</div>' : '') +
    '<div class="mxw"><div class="mx" role="table" aria-label="Flaschen im Keller nach Rebsorte und Jahrgang" style="' + cs + '">' +
    '<span class="h" role="columnheader">Rebsorte</span>' + vy.map((v) => '<span class="h c" role="columnheader">' + (v || 'ohne') + '</span>').join('') + '<span class="h r" role="columnheader">Summe</span>' +
    gr.map(([g, sum]) => '<span class="g" role="rowheader">' + esc(g) + '</span>' + vy.map((v) => { const n = cell(g, v);
      return n ? '<a class="x' + lvl(n) + '" role="cell" href="' + listHref('gv', g + ' ' + (v || 'ohne Jahrgang')) + '" aria-label="' + esc(g + ' ' + (v || 'ohne Jahrgang') + ': ' + fl(n)) + '">' + n + '</a>' : '<span class="x" role="cell"></span>'; }).join('') + '<span class="r" role="cell">' + sum + '</span>').join('') +
    '<span class="g f">Summe</span>' + colSum.map((n) => '<span class="f c">' + n + '</span>').join('') + '<span class="f r">' + total + '</span></div></div>' +
    '<div class="callg mxl">Flaschen: <i class="m1"></i>1–2 <i class="m2"></i>3–5 <i class="m3"></i>6–10 <i class="m4"></i>über 10</div></div>';
}
// Preis-Gruppen ohne Überschneidung, nach durchschnittlichem Kaufpreis je Flasche (auf Cent gerundet)
export const PRICE_BUCKETS = [['unter 10 €', 10], ['10 – 14,99 €', 15], ['15 – 24,99 €', 25], ['25 – 39,99 €', 40], ['ab 40 €', Infinity]];
export function priceBucket(p) {
  if (p == null) return 'ohne Preis';
  const c = Math.round(p * 100) / 100;
  return PRICE_BUCKETS.find(([, hi]) => c < hi)[0];
}
function priceBox(S, D, scope) {
  const g = scope === 'stock' ? 'sprice' : 'bprice', eurM = ((S.metric || {})[g] || 'qty') === 'eur';
  const ws = D.wines.filter((w) => (scope === 'stock' ? w.stock > 0 : w.bought > 0));
  const fl = (w) => (scope === 'stock' ? w.stock : w.bought), val = (w) => (scope === 'stock' ? w.value : w.spent);
  const keys = PRICE_BUCKETS.map((b) => b[0]).concat(ws.some((w) => w.avgPrice == null) ? ['ohne Preis'] : []);
  const rows = keys.map((k) => { const xs = ws.filter((w) => priceBucket(w.avgPrice) === k); return { k, n: xs.length, fl: xs.reduce((s, w) => s + fl(w), 0), eur: xs.reduce((s, w) => s + val(w), 0) }; });
  const sumFl = rows.reduce((s, r) => s + r.fl, 0), sumEur = rows.reduce((s, r) => s + r.eur, 0), priced = rows.filter((r) => r.k !== 'ohne Preis').reduce((s, r) => s + r.fl, 0);
  const max = Math.max(1, ...rows.map((r) => (eurM ? r.eur : r.fl)));
  const total = eurM ? eur(sumEur, 0) : fl2(sumFl), sub = eurM ? (scope === 'stock' ? 'Lagerwert' : 'ausgegeben') + ' · Ø ' + eur2(priced ? sumEur / priced : 0) + ' pro Flasche' : (scope === 'stock' ? 'im Keller' : 'gekauft') + ' · ' + plural(ws.length, 'Wein', 'Weine');
  return boxT('Preis pro Flasche', metricSeg(S, g, 'qty', 'Wert'),
    '<div class="ptot"><b>' + total + '</b><span>' + esc(sub) + '</span></div><div class="prows">' + rows.map((r) => {
      const v = eurM ? r.eur : r.fl;
      return '<a class="prow" href="' + listHref('price', r.k, scope === 'stock' ? '' : 'bought') + '" aria-label="' + esc(r.k + ': ' + (eurM ? eur(v, 0) : fl2(v)) + ', Weine anzeigen') + '">' +
        '<span class="pt"><span>' + esc(r.k) + '</span><span><b>' + (eurM ? eur(v, 0) : num(v) + ' Fl.') + '</b> · ' + Math.round(v / Math.max(1, eurM ? sumEur : sumFl) * 100) + ' %</span></span>' +
        '<span class="pb2"><i style="width:' + (v / max * 100).toFixed(1) + '%"></i></span><span class="ps">' + plural(r.n, 'Wein', 'Weine') + ' · ' + (eurM ? fl2(r.fl) : eur(r.eur, 0)) + '</span></a>';
    }).join('') + '</div><p class="note" style="margin-top:6px">Gruppe nach dem durchschnittlichen Kaufpreis je Flasche. Antippen zeigt die Weine.</p>');
}
const fl2 = (n) => num(n) + ' Flaschen';
function metricSeg(S, g, def = 'eur', eurLabel = 'Euro') {
  const cur = (S.metric || {})[g] || def;
  const opts = def === 'qty' ? [['qty', 'Flaschen'], ['eur', eurLabel]] : [['eur', eurLabel], ['qty', 'Flaschen']];
  return '<div class="mseg" role="group" aria-label="Einheit">' + opts.map(([k, l]) => '<button data-act="metric" data-g="' + g + '" data-k="' + k + '" aria-pressed="' + (cur === k) + '">' + l + '</button>').join('') + '</div>';
}
const box = (title, inner) => '<div class="card chart" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:12px;letter-spacing:.1em">' + esc(title) + '</div>' + inner + '</div>';
// Zeitverlauf je Quartal: Käufe nach oben, getrunkene Flaschen nach unten (Telefon: letzte 8 Quartale)
function quarterBox(S, D, nodate) {
  const qOf = (d) => (d ? d.slice(0, 4) * 4 + Math.floor((Number(d.slice(5, 7)) - 1) / 3) : null);
  const m = new Map(), add = (q, i, n) => { if (q == null) return; const v = m.get(q) || [0, 0]; v[i] += n; m.set(q, v); };
  D.wines.forEach((w) => { w.purchases.forEach((p) => add(qOf(p.purchased_on), 0, p.qty)); w.drinks.forEach((d) => add(qOf(d.drunk_on), 1, d.qty)); });
  if (!m.size) return '';
  const ks = [...m.keys()], hi = Math.max(...ks), lo = Math.max(Math.min(...ks), hi - (S.wide ? 23 : 7));
  const rows = []; for (let q = lo; q <= hi; q++) rows.push([q, ...(m.get(q) || [0, 0])]);
  // Ausreißer (z. B. Erstbestand beim Import) kappen, damit der Rest lesbar bleibt
  const vals = rows.flatMap((r) => [r[1], r[2]]).sort((a, b) => b - a);
  const max = Math.max(1, vals[0] > 3 * (vals[1] || 0) && vals[1] ? vals[1] * 1.15 : vals[0]);
  const H = 64, h = (v) => Math.min(H, v / max * H);
  const cut = (v) => (v > max ? ' cut' : '');
  const showN = rows.length <= 12, num1 = (v) => (v && (showN || v > max) ? '<span>' + v + '</span>' : '');
  const lab = (q) => (q % 4 === 0 || q === lo ? '<b>' + Math.floor(q / 4) + '</b>' : '<b></b>');
  const col = ([q, b, d]) => '<div class="qc" title="Q' + (q % 4 + 1) + ' ' + Math.floor(q / 4) + ': ' + b + ' gekauft, ' + d + ' getrunken">' +
    '<div class="up"><i class="' + cut(b) + '" style="height:' + (b ? Math.max(2, h(b)) : 0).toFixed(0) + 'px">' + num1(b) + '</i></div>' +
    '<div class="dn"><i class="' + cut(d) + '" style="height:' + (d ? Math.max(2, h(d)) : 0).toFixed(0) + 'px">' + num1(d) + '</i></div>' +
    '<span class="ql">Q' + (q % 4 + 1) + '</span>' + lab(q) + '</div>';
  return '<div class="card chart full" style="margin-top:12px"><div class="chart-head"><div class="eyebrow">Gekauft und getrunken je Quartal</div></div>' +
    '<div class="qt" role="img" aria-label="Flaschen je Quartal, gekauft nach oben, getrunken nach unten">' + rows.map(col).join('') + '</div>' +
    '<div class="plg"><span><i class="b"></i>Gekauft</span><span><i class="d"></i>Getrunken</span>' + (nodate ? '<em>' + num(nodate) + ' getrunkene Flaschen ohne Datum nicht enthalten</em>' : '') + '</div></div>';
}
// Diagramm-Raster: auf dem Telefon untereinander, auf breiten Bildschirmen zweispaltig
const sg = (inner) => '<div class="sgrid">' + inner + '</div>';
export function statsView(S, D) {
  // Breiter Bildschirm: zusätzlicher Reiter „Alles“ (Standard), zeigt alle drei Bereiche untereinander
  const tabs = (S.wide ? [['all', 'Alles']] : []).concat([['stock', 'Bestand'], ['drunk', 'Getrunken'], ['buy', 'Einkauf']]);
  const tab = tabs.some(([k]) => k === S.statTab) ? S.statTab : (S.wide ? 'all' : 'stock');
  const seg = '<div class="seg">' + tabs.map(([k, l]) => '<button data-act="stat-tab" data-k="' + k + '" aria-pressed="' + (tab === k) + '">' + l + '</button>').join('') + '</div>';
  const body = tab === 'all'
    ? [['stock', 'Bestand'], ['drunk', 'Getrunken'], ['buy', 'Einkauf']].map(([k, l]) => '<h2 class="shead">' + l + '</h2>' + statPart(S, D, k)).join('')
    : statPart(S, D, tab);
  return head('Keller in Zahlen', 'Statistik') + yearBanner(D) + seg + body;
}
function statPart(S, D, tab) {
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
      body = sg(box('Rot, Weiß & Co.', donut(parts, t.stock, 'Flaschen', (k) => listHref('type', k))) +
        barBox(S, 'Rebsorten im Keller', groupSum(inS, (w) => w.grape, (w) => w.stock), num, 'grape', (k) => listHref('grape', k)) +
        reifeBox(S, D) + priceBox(S, D, 'stock') +
        barBox(S, 'Regionen', groupSum(inS, (w) => w.region, (w) => w.stock), num, 'region', (k) => listHref('region', k)) +
        (vint.length ? box('Jahrgänge im Keller', cols(vint, num, (k) => listHref('vintage', k))) : '') +
        matrixBox(inS) +
        barBox(S, 'Weingüter nach Lagerwert', groupSum(inS, (w) => w.producer, (w) => w.value), (v) => eur(v, 0), 'producer', (k) => listHref('producer', k)) +
        barBox(S, 'Händler im Bestand', groupSum(alloc, (x) => x.m, (x) => (sEur ? x.eur : x.fl)), sEur ? (v) => eur(v, 0) : num, 'smerch', (k) => listHref('merchant', k), metricSeg(S, 'stock')));
    }
  } else if (tab === 'drunk') {
    const items = D.wines.flatMap((w) => w.drinks.map((d) => ({ w, d })));
    if (!items.length) body = '<div class="empty"><b>Noch nichts getrunken</b></div>';
    else {
      const years = groupSum(items.filter((x) => x.d.drunk_on), (x) => yearOf(x.d.drunk_on), (x) => x.d.qty).sort((a, b) => a[0] - b[0]).slice(-7);
      const nodate = items.filter((x) => !x.d.drunk_on).reduce((s, x) => s + x.d.qty, 0);
      if (nodate) years.push(['ohne Datum', nodate]);
      const ba = BUY_AGAIN.map(([k, l]) => [l, items.filter((x) => x.d.buy_again === k).length]).filter((x) => x[1]);
      const fav = groupSum(items.filter((x) => x.d.buy_again === 'ja'), (x) => x.w.producer, () => 1);
      body = sg(quarterBox(S, D, nodate) + (years.length ? box('Flaschen pro Jahr', cols(years, num, (k) => (k === 'ohne Datum' ? '' : listHref('dyear', k, 'drunk')))) : '') +
        barBox(S, 'Getrunkene Rebsorten', groupSum(items, (x) => x.w.grape, (x) => x.d.qty), num, 'dgrape', (k) => listHref('grape', k, 'drunk')) +
        (fav.length ? barBox(S, 'Lieblings-Weingüter (nochmal kaufen: ja)', fav, num, 'fav', (k) => listHref('producer', k, 'drunk')) : '') +
        (ba.length ? barBox(S, 'Nochmal kaufen?', ba, num, 'again', (k) => listHref('again', k, 'drunk')) : ''));
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
        sg(boxT(eurM ? 'Ausgaben pro Jahr' : 'Flaschen pro Jahr', metricSeg(S, 'buy'), cols(groupSum(ps.filter((x) => x.p.purchased_on), (x) => yearOf(x.p.purchased_on), mval).sort((a, b) => a[0] - b[0]).slice(-8), mfmt, (k) => listHref('byear', k, 'bought'))) +
        barBox(S, 'Händler', groupSum(ps, (x) => x.p.merchant, mval), mfmt, 'merch', (k) => listHref('merchant', k, 'bought'), metricSeg(S, 'buy')) +
        priceBox(S, D, 'bought'));
    }
  }
  return body;
}

/* ---------- Dein Weinjahr ---------- */
// Jahr für Rückblick-Karten: im Januar das Vorjahr, sonst das laufende Jahr
export const reviewYear = (d = new Date()) => (d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear());
// Kennzahlen eines Jahres (nur datierte Einträge)
export function yearStats(D, y) {
  const ys = String(y);
  const dr = D.wines.flatMap((w) => w.drinks.filter((d) => d.drunk_on).map((d) => ({ w, d })));
  const yd = dr.filter((x) => x.d.drunk_on.startsWith(ys));
  const pu = D.wines.flatMap((w) => w.purchases.filter((p) => p.purchased_on && p.purchased_on.startsWith(ys)).map((p) => ({ w, p })));
  const fl = yd.reduce((s, x) => s + x.d.qty, 0);
  // Erstkontakte: wann wurde eine Region / ein Weingut / eine Rebsorte zum ersten Mal getrunken – und mit welchem Wein
  const sorted = dr.slice().sort((a, b) => a.d.drunk_on.localeCompare(b.d.drunk_on) || String(a.d.created_at).localeCompare(String(b.d.created_at)));
  const first = (key) => { const m = new Map(); for (const x of sorted) { const k = key(x.w); if (k && !m.has(k)) m.set(k, x); } return [...m.entries()].filter(([, x]) => x.d.drunk_on.startsWith(ys)).map(([k, x]) => ({ k, w: x.w })); };
  const months = Array.from({ length: 12 }, (_, i) => {
    const mm = '-' + String(i + 1).padStart(2, '0') + '-';
    return [yd.filter((x) => x.d.drunk_on.slice(4, 8) === mm).reduce((s, x) => s + x.d.qty, 0), pu.filter((x) => x.p.purchased_on.slice(4, 8) === mm).reduce((s, x) => s + x.p.qty, 0)];
  });
  // Lieblinge: Bewertung, dann „nochmal kaufen: ja“, dann Flaschen
  const byWine = new Map();
  for (const x of yd) { const o = byWine.get(x.w.id) || { w: x.w, fl: 0, r: 0, ja: false }; o.fl += x.d.qty; o.r = Math.max(o.r, x.d.rating || 0); o.ja = o.ja || x.d.buy_again === 'ja'; byWine.set(x.w.id, o); }
  const fav = [...byWine.values()].filter((o) => o.r >= 4 || (o.ja && !o.r)).sort((a, b) => b.r - a.r || b.fl - a.fl).slice(0, 3);
  return {
    y, fl, n: yd.length, val: yd.reduce((s, x) => s + x.d.qty * (x.w.avgPrice || 0), 0),
    types: groupSum(yd, (x) => x.w.wine_type, (x) => x.d.qty).sort((a, b) => b[1] - a[1]),
    pfl: pu.reduce((s, x) => s + x.p.qty, 0), peur: pu.reduce((s, x) => s + x.p.qty * (x.p.price != null ? Number(x.p.price) : 0), 0),
    ja: yd.filter((x) => x.d.buy_again === 'ja').length, months,
    news: { reg: first((w) => w.region), prod: first((w) => w.producer), gr: first((w) => w.grape) },
    grapes: groupSum(yd, (x) => x.w.grape, (x) => x.d.qty).sort((a, b) => b[1] - a[1]),
    fav, rated: yd.filter((x) => x.d.rating).length,
    again: [['ja', 'Ja', '#2F6B45'], ['evtl', 'Vielleicht', '#C9A24A'], ['nein', 'Nein', '#8A2B33'], ['', 'Ohne Angabe', '#CFC4B6']].map(([k, l, c]) => [l, yd.filter((x) => (x.d.buy_again || '') === k).length, c]).filter((x) => x[1]),
    occ: groupSum(yd.filter((x) => x.d.occasion), (x) => x.d.occasion, () => 1).map((x) => x[0]),
    undated: D.wines.reduce((s, w) => s + w.drinks.filter((d) => !d.drunk_on).reduce((t, d) => t + d.qty, 0), 0)
  };
}
export function yearsWithData(D) {
  const ys = new Set([reviewYear()]);
  D.wines.forEach((w) => { w.drinks.forEach((d) => d.drunk_on && ys.add(Number(d.drunk_on.slice(0, 4)))); w.purchases.forEach((p) => p.purchased_on && ys.add(Number(p.purchased_on.slice(0, 4)))); });
  return [...ys].sort((a, b) => b - a);
}
// Schmale Karte über den Statistik-Reitern
export function yearBanner(D) {
  const y = reviewYear(), x = yearStats(D, y);
  return '<a class="wjbar" href="#/weinjahr?y=' + y + '"><span class="ic">' + icon('cal') + '</span><span class="tx"><b>Dein Weinjahr ' + y + '</b> · ' + num(x.fl) + ' getrunken · ' + num(x.pfl) + ' gekauft</span>' + icon('chev') + '</a>';
}
// Rückblick-Karte auf der Übersicht, nur 1. Dezember bis 31. Januar
export function yearHomeCard(S, D) {
  const now = new Date(), m = now.getMonth();
  if ((m !== 11 && m !== 0 && !S.forceYearCard) || S.yearCardHidden === reviewYear()) return '';
  const y = reviewYear(), x = yearStats(D, y), nw = x.news.prod.length;
  return '<div class="wjcard"><button class="x" data-act="year-hide" aria-label="Rückblick ausblenden">' + icon('x') + '</button><div class="eb">Jahresrückblick</div><h2>Dein Weinjahr ' + y + ' ist da</h2>' +
    '<div class="k3"><div><b>' + num(x.fl) + '</b><span>getrunken</span></div><div><b>' + num(x.pfl) + '</b><span>gekauft</span></div><div><b>' + num(nw) + '</b><span>' + (nw === 1 ? 'neues Weingut' : 'neue Weingüter') + '</span></div></div>' +
    '<a class="go" href="#/weinjahr?y=' + y + '">Rückblick ansehen</a></div>';
}
const MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export function yearView(S, D, y) {
  const years = yearsWithData(D);
  if (!years.includes(y)) y = years[0];
  const x = yearStats(D, y), p0 = years.includes(y - 1) ? yearStats(D, y - 1) : null, prev = p0 && p0.fl ? p0 : null; // Vergleich nur, wenn im Vorjahr etwas getrunken wurde
  const chips = '<div class="chips wjy" role="group" aria-label="Jahr wählen">' + years.map((k) => '<a class="chip" href="#/weinjahr?y=' + k + '" aria-pressed="' + (k === y) + '"' + (k === y ? ' aria-current="page"' : '') + '>' + k + '</a>').join('') + '</div>';
  const delta = prev ? x.fl - prev.fl : null;
  const tsum = x.types.reduce((s, t) => s + t[1], 0) || 1;
  const hero = '<div class="wjhero"><div class="r1"><div><div class="l">Getrunken ' + y + '</div><div class="big"><b>' + num(x.fl) + '</b><span>' + (x.fl === 1 ? 'Flasche' : 'Flaschen') + '</span></div>' +
    '<div class="l2">' + (x.n ? 'in ' + plural(x.n, 'Eintrag', 'Einträgen') + (x.fl ? ' · Ø ' + eur2(x.val / x.fl) + ' pro Flasche' : '') : 'noch keine Einträge mit Datum') + '</div></div>' +
    '<div class="rt"><div class="l">Genossen für</div><div class="v">' + eur(x.val, 0) + '</div><div class="dl' + (delta == null ? '' : delta >= 0 ? ' up' : ' down') + '">' + (delta == null ? (x.fl ? 'erstes Jahr mit Einträgen' : '') : delta === 0 ? 'so viele wie ' + (y - 1) : Math.abs(delta) + ' Fl. ' + (delta > 0 ? 'mehr' : 'weniger') + ' als ' + (y - 1) + ' (' + num(prev.fl) + ')') + '</div></div></div>' +
    (x.types.length ? '<div class="tbar" aria-hidden="true">' + x.types.map(([k, v]) => '<i style="flex:' + v + ';background:' + (TYPE_COLOR[k] || '#CFC4B6') + '"></i>').join('') + '</div><div class="tlg">' + x.types.map(([k, v]) => '<span><i style="background:' + (TYPE_COLOR[k] || '#CFC4B6') + '"></i>' + esc(k) + ' ' + num(v) + '</span>').join('') + '</div>' : '') + '</div>';
  const kpis = '<div class="kpis" style="margin-top:10px"><div class="kpi"><div class="l">Gekauft</div><div class="v">' + num(x.pfl) + ' Fl.</div></div><div class="kpi"><div class="l">Ausgegeben</div><div class="v">' + eur(x.peur, 0) + '</div></div><div class="kpi"><div class="l">Nochmal kaufen</div><div class="v">' + x.ja + '×</div></div></div>';
  const mmax = Math.max(1, ...x.months.flat()), pk = x.months.reduce((b, m, i) => (m[0] > x.months[b][0] ? i : b), 0);
  const h = (v) => (v ? Math.max(3, Math.round(v / mmax * 84)) : 0);
  const months = '<div class="card chart"><div class="eyebrow ce">Monat für Monat</div><div class="wjpk">' + (x.months[pk][0] ? 'Stärkster Monat: ' + MONL[pk] + ' mit ' + fl(x.months[pk][0]) : 'Noch keine datierten Einträge') + '</div>' +
    '<div class="mcols" role="img" aria-label="Getrunkene und gekaufte Flaschen je Monat ' + y + '">' + x.months.map(([d, p], i) =>
      '<div class="mc" title="' + MONL[i] + ': ' + d + ' getrunken, ' + p + ' gekauft"><span class="mv">' + (d || '') + '</span><div class="mb"><i class="d" style="height:' + h(d) + 'px"></i><i class="p" style="height:' + h(p) + 'px"></i></div><span class="ml">' + MON[i] + '</span></div>').join('') + '</div>' +
    '<div class="plg"><span><i class="d"></i>Getrunken</span><span><i class="b"></i>Gekauft</span></div></div>';
  const cat = ['reg', 'prod', 'gr'].includes(S.wjCat) ? S.wjCat : 'reg', CATS = [['reg', 'Regionen'], ['prod', 'Weingüter'], ['gr', 'Rebsorten']];
  const all = x.news[cat], LIM = 5, shown = S.wjMore ? all : all.slice(0, LIM), catL = CATS.find((c) => c[0] === cat)[1];
  const news = '<div class="card chart"><div class="eyebrow ce">Neu entdeckt</div><div class="note" style="margin-top:2px">zum ersten Mal getrunken – antippen öffnet den Wein, mit dem es anfing</div>' +
    '<div class="wjcats" role="group" aria-label="Kategorie">' + CATS.map(([k, l]) => '<button data-act="wj-cat" data-k="' + k + '" aria-pressed="' + (k === cat) + '"><b>' + x.news[k].length + '</b><span>' + l + '</span></button>').join('') + '</div>' +
    (shown.length ? '<div class="wjnew">' + shown.map(({ k, w }) => { const wine = w.name + (w.vintage ? ' ' + w.vintage : '');
      return '<a href="#/wein/' + w.id + '"><b>' + esc(k) + '</b><span>' + esc(cat === 'prod' ? 'erster Wein: ' + wine : wine + (w.producer ? ' · ' + w.producer : '')) + '</span></a>'; }).join('') + '</div>' +
      (all.length > LIM ? '<button class="more" data-act="wj-more">' + (S.wjMore ? 'Weniger anzeigen' : 'Alle ' + all.length + ' ' + catL + ' anzeigen') + '</button>' : '')
      : '<p class="note">Keine neuen ' + catL + ' in ' + y + ' – Zeit für etwas Neues?</p>') + '</div>';
  const grapes = x.grapes.length ? '<div class="card chart"><div class="eyebrow ce">Rebsorten</div>' + hbars(x.grapes.slice(0, 5), num, { key: 'wjgr', open: false }) + '</div>' : '';
  const favs = '<div class="card chart"><div class="eyebrow ce">Deine Lieblinge</div><div class="note" style="margin-top:2px">' + (x.rated ? 'nach deiner Bewertung, dann „nochmal kaufen: ja“' : '„Nochmal kaufen: ja“ – mit Sternen bewertete Weine kommen zuerst') + '</div>' +
    (x.fav.length ? '<div class="wjfav">' + x.fav.map((o, i) => '<a href="#/wein/' + o.w.id + '"><span class="rk">' + (i + 1) + '</span><span class="tx"><b>' + esc(o.w.name) + '</b><span>' + esc([o.w.producer, o.w.vintage].filter(Boolean).join(' · ')) + '</span>' + starsShow(o.r) + '</span><em>' + num(o.fl) + ' Fl.</em></a>').join('') + '</div>' : '<p class="note">Noch keine Lieblinge in diesem Jahr.</p>') + '</div>';
  const asum = x.again.reduce((s, a) => s + a[1], 0);
  const again = asum ? '<div class="card chart"><div class="eyebrow ce">Würdest du sie nochmal kaufen?</div><div class="tbar tall" aria-hidden="true">' + x.again.map(([, v, c]) => '<i style="flex:' + v + ';background:' + c + '"></i>').join('') + '</div>' +
    '<div class="tlg dk">' + x.again.map(([l, v, c]) => '<span><i style="background:' + c + '"></i>' + l + ' ' + v + '</span>').join('') + '</div>' +
    (x.occ.length ? '<div class="eyebrow ce" style="margin-top:16px">Anlässe</div><div class="tags">' + x.occ.map((o) => '<span class="tag">' + esc(o) + '</span>').join('') + '</div>' : '') + '</div>' : '';
  if (S.wide) return yearWide(S, D, y, years, x, prev, { news, grapes, again });
  return backBtn('#/statistik', 'Statistik') + '<div class="top"><div><div class="eyebrow">Rückblick</div><h1 class="title">Dein Weinjahr</h1></div></div>' + chips + hero + kpis +
    '<div class="sgrid wjgrid">' + months + news + grapes + favs + again + '</div>' +
    (x.undated ? '<p class="note">Gezählt werden nur Einträge mit Datum. ' + fl(x.undated) + ' ohne Datum ' + (x.undated === 1 ? 'ist' : 'sind') + ' nicht enthalten – trägst du ein Datum nach, erscheinen sie im passenden Jahr.</p>' : '');
}

// iPad quer: Rückblick als Übersichtsseite (Jahresleiste, Kopfzeile, Monate mit Keller-Linie, Kalender, Etiketten)
function yearWide(S, D, y, years, x, prev, parts) {
  const ys = String(y), fy = years.slice().sort((a, b) => a - b);
  const flOf = new Map(fy.map((k) => [k, yearStats(D, k).fl])), fmax = Math.max(1, ...flOf.values());
  const strip = '<div class="wjstrip" role="group" aria-label="Jahr wählen">' + fy.map((k) => '<a href="#/weinjahr?y=' + k + '"' + (k === y ? ' aria-current="page"' : '') + ' aria-label="' + k + ': ' + flOf.get(k) + ' Flaschen getrunken"><span class="n">' + (flOf.get(k) || '–') + '</span><i style="height:' + Math.max(2, Math.round(flOf.get(k) / fmax * 46)) + 'px"></i><b>' + k + '</b></a>').join('') + '</div>';
  const delta = prev ? x.fl - prev.fl : null;
  const boughtMonths = x.months.filter((m) => m[1]).length;
  const tile = (l, v, sub) => '<div class="t"><div class="l">' + l + '</div><div class="v">' + v + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';
  const hero = '<div class="wjhero wide"><div class="r1"><div class="lead"><div class="l">Getrunken ' + y + '</div><div class="big"><b>' + num(x.fl) + '</b><span>' + (x.fl === 1 ? 'Flasche' : 'Flaschen') + '</span></div>' +
    '<div class="l2">' + (x.n ? 'in ' + plural(x.n, 'Eintrag', 'Einträgen') : 'noch keine Einträge mit Datum') + (delta == null ? '' : ' · ' + (delta === 0 ? 'so viele wie ' + (y - 1) : Math.abs(delta) + ' Fl. ' + (delta > 0 ? 'mehr' : 'weniger') + ' als ' + (y - 1) + ' (' + num(prev.fl) + ')')) + '</div></div>' +
    '<div class="tiles">' + tile('Genossen für', eur(x.val, 0), x.fl ? 'Ø ' + eur2(x.val / x.fl) + ' / Fl.' : '') + tile('Gekauft', num(x.pfl) + ' Fl.', boughtMonths ? 'in ' + plural(boughtMonths, 'Monat', 'Monaten') : '') +
    tile('Ausgegeben', eur(x.peur, 0), x.pfl ? 'Ø ' + eur2(x.peur / x.pfl) + ' / Fl.' : '') + tile('Nochmal kaufen', x.ja + '×', x.n ? 'von ' + plural(x.n, 'Eintrag', 'Einträgen') : '') + '</div></div>' +
    (x.types.length ? '<div class="tbar" aria-hidden="true">' + x.types.map(([k, v]) => '<i style="flex:' + v + ';background:' + (TYPE_COLOR[k] || '#CFC4B6') + '"></i>').join('') + '</div><div class="tlg">' + x.types.map(([k, v]) => '<span><i style="background:' + (TYPE_COLOR[k] || '#CFC4B6') + '"></i>' + esc(k) + ' ' + num(v) + '</span>').join('') + '</div>' : '') + '</div>';
  // Monate: Säulen plus Linie „Keller-Veränderung seit Januar“ (gekauft − getrunken, kumuliert)
  let cum = 0; const cumv = x.months.map(([d, p]) => (cum += p - d));
  const mmax = Math.max(1, ...x.months.flat()), lim = Math.max(1, ...cumv.map(Math.abs));
  const yOf = (v) => (8 + (lim - v) / (2 * lim) * 144).toFixed(1);
  const pts = cumv.map((v, i) => ((i + 0.5) * 40).toFixed(1) + ',' + yOf(v)).join(' ');
  const pk = x.months.reduce((b, m, i) => (m[0] > x.months[b][0] ? i : b), 0), endv = cumv[11];
  const months = '<div class="card chart wjm"><div class="chart-head"><div class="eyebrow ce">Monat für Monat</div><div class="wjsal">Keller seit 1. Januar: <b class="' + (endv < 0 ? 'neg' : 'pos') + '">' + (endv > 0 ? '+' : endv < 0 ? '−' : '±') + fl(Math.abs(endv)) + '</b></div></div>' +
    '<div class="wjmc"><div class="bars">' + x.months.map(([d, p], i) => '<div title="' + MONL[i] + ': ' + d + ' getrunken, ' + p + ' gekauft, Keller seit Januar ' + (cumv[i] > 0 ? '+' : '') + cumv[i] + '"><i class="d" style="height:' + Math.round(d / mmax * 150) + 'px"></i><i class="p" style="height:' + Math.round(p / mmax * 150) + 'px"></i></div>').join('') + '</div>' +
    '<svg viewBox="0 0 480 160" preserveAspectRatio="none" role="img" aria-label="Keller-Veränderung seit Januar, am Jahresende ' + endv + ' Flaschen"><line x1="0" x2="480" y1="' + yOf(0) + '" y2="' + yOf(0) + '" class="z"/><polyline points="' + pts + '" vector-effect="non-scaling-stroke"/></svg>' +
    '<div class="ml">' + MON.map((m) => '<span>' + m + '</span>').join('') + '</div></div>' +
    '<div class="plg"><span><i class="d"></i>Getrunken</span><span><i class="b"></i>Gekauft</span><span><i class="ln"></i>Keller-Veränderung seit Januar</span><em>' + (x.months[pk][0] ? 'Stärkster Monat: ' + MONL[pk] + ' · ' + fl(x.months[pk][0]) : '') + '</em></div></div>';
  // Kalender: Tage mit Wein, Wochen ab Montag
  const daily = new Map(), occ = new Set();
  D.wines.forEach((w) => w.drinks.forEach((d) => { if (d.drunk_on && d.drunk_on.startsWith(ys)) { daily.set(d.drunk_on, (daily.get(d.drunk_on) || 0) + d.qty); if (d.occasion) occ.add(d.drunk_on); } }));
  const start = Date.UTC(y, 0, 1), lead = (new Date(start).getUTCDay() + 6) % 7, nd = (Date.UTC(y + 1, 0, 1) - start) / 864e5;
  let cells = '<i class="e"></i>'.repeat(lead);
  for (let i = 0; i < nd; i++) {
    const dt = new Date(start + i * 864e5), k = dt.toISOString().slice(0, 10), v = daily.get(k) || 0;
    cells += '<i class="c' + (v ? (v === 1 ? ' v1' : v < 5 ? ' v2' : ' v3') : '') + (occ.has(k) ? ' oc' : '') + '" title="' + dt.getUTCDate() + '.' + (dt.getUTCMonth() + 1) + '.: ' + (v ? fl(v) : 'kein Wein') + '"></i>';
  }
  const topDay = [...daily.entries()].sort((a, b) => b[1] - a[1])[0];
  // Monatsbeschriftung: Breite = Wochen bis zum Beginn des nächsten Monats (keine Doppelzählung)
  const wk = (i) => (i > 11 ? Math.ceil((lead + nd) / 7) : Math.floor((lead + (Date.UTC(y, i, 1) - start) / 864e5) / 7));
  const mh = MONL.map((m, i) => '<span style="width:' + ((wk(i + 1) - wk(i)) * 14 - 3) + 'px">' + m.slice(0, 3) + '</span>').join('');
  const cal = '<div class="card chart"><div class="chart-head"><div class="eyebrow ce">Deine Wein-Tage</div><div class="wjsal">' + (daily.size ? plural(daily.size, 'Tag', 'Tage') + ' mit Wein · meiste Flaschen: <b>' + deDate(topDay[0]).slice(0, 6) + ' (' + topDay[1] + ')</b>' : 'Noch keine Tage mit Datum') + '</div></div>' +
    '<div class="wjcal"><div class="mh">' + mh + '</div><div class="row"><div class="wd"><span>Mo</span><span></span><span>Mi</span><span></span><span>Fr</span><span></span><span>So</span></div><div class="g" role="img" aria-label="Kalender ' + y + ': ' + daily.size + ' Tage mit Wein">' + cells + '</div></div></div>' +
    '<div class="callg">weniger <i></i><i class="v1"></i><i class="v2"></i><i class="v3"></i> mehr <span><i class="oc"></i>Tag mit Anlass</span></div></div>';
  // Etiketten der im Jahr getrunkenen Weine; Lieblinge groß
  const byW = new Map();
  D.wines.forEach((w) => w.drinks.forEach((d) => { if (d.drunk_on && d.drunk_on.startsWith(ys)) { const o = byW.get(w.id) || { w, fl: 0, r: 0 }; o.fl += d.qty; o.r = Math.max(o.r, d.rating || 0); byW.set(w.id, o); } }));
  const favIds = new Set(x.fav.map((o) => o.w.id));
  const all = [...byW.values()].sort((a, b) => (favIds.has(b.w.id) - favIds.has(a.w.id)) || b.fl - a.fl), withPic = all.filter((o) => o.w.label_path && S.urls[o.w.label_path]);
  const collage = all.length ? '<div class="card chart"><div class="chart-head"><div class="eyebrow ce">Deine Etiketten ' + y + '</div><div class="wjsal">' + withPic.length + ' von ' + plural(all.length, 'Wein', 'Weinen') + ' mit Foto' + (favIds.size ? ' · groß = Lieblinge' : '') + '</div></div>' +
    '<div class="wjlab">' + withPic.map((o) => '<a href="#/wein/' + o.w.id + '" class="' + (favIds.has(o.w.id) ? 'big' : '') + '" aria-label="' + esc(o.w.name + ', ' + fl(o.fl)) + '"><img src="' + esc(S.urls[o.w.label_path]) + '" alt="" loading="lazy"><span class="q">' + num(o.fl) + ' Fl.</span>' + (favIds.has(o.w.id) && o.r ? '<span class="st">' + '★'.repeat(o.r) + '</span>' : '') + '</a>').join('') + '</div></div>' : '';
  return backBtn('#/statistik', 'Statistik') + '<div class="wjtop"><div><div class="eyebrow">Rückblick</div><h1 class="title">Dein Weinjahr</h1></div>' + strip + '</div>' + hero +
    '<div class="wjg2">' + months + parts.news + '</div>' + cal +
    '<div class="wjg2 st">' + (collage || parts.grapes) + '<div class="wjside">' + (collage ? parts.grapes : '') + parts.again + '</div></div>' +
    (x.undated ? '<p class="note">Gezählt werden nur Einträge mit Datum. ' + fl(x.undated) + ' ohne Datum ' + (x.undated === 1 ? 'ist' : 'sind') + ' nicht enthalten.</p>' : '');
}

/* ---------- Vorschläge ---------- */
// Vorschläge (ab 1.4 mit Kaufberatung): Ergebnis, gezielt kaufen, erst trinken, nachkaufen, Wunschliste
export function recoView(S, D) {
  const A = K.analyse(D, S.tempo), recs = K.recommendations(D, A), pause = A.rows.filter((r) => r.st === 'pause').slice(0, 6), rb = K.rebuy(D, A).slice(0, 6);
  const tiles = K.CATS.filter((c) => A.cat[c].fl).map((c) => '<div class="kt"><span>' + K.CAT_SHORT[c] + '</span><b>' + yrs(A.cat[c].reach) + '</b><em>' + (A.cat[c].gap ? 'Lücke ab ' + A.cat[c].gap : 'versorgt') + '</em></div>').join('');
  const hero = A.fl ? '<a class="khero" href="#/kaufberatung"><div class="eyebrow" style="color:var(--gold)">Kaufberatung</div><div class="kh">' + (A.ok < A.fl * 0.75 ? 'Erst trinken, gezielt nachkaufen' : 'Gut sortiert – gezielt nachkaufen') + '</div>' +
    '<p>' + num(A.fl) + ' Flaschen reichen bei ' + num(S.tempo) + ' Fl. pro Jahr rund ' + yrs(A.reach, 'Jahre') + '. Im Trinkfenster schaffst du davon etwa ' + num(A.ok) + '.</p><div class="kts">' + tiles + '</div>' +
    '<span class="kmore">Reife-Lücke, Reichweite, Tempo' + icon('chev') + '</span></a>' : '';
  return head('Für dich ausgewählt', 'Vorschläge') + hero +
    (recs.length ? '<div class="sec">Gezielt kaufen</div>' + recs.map(recoCard).join('') : '') +
    (pause.length ? '<div class="sec">Erst trinken, nicht kaufen</div><div class="card list">' + pause.map((r) => '<a class="row" href="#/kaufberatung"><span class="tx"><span class="t">' + esc(r.name) + '</span><span class="s">' + num(r.fl) + ' Fl. · ' + (r.over === r.fl ? 'alle Fenster vorbei' : r.bad + ' nicht mehr im Fenster') + '</span></span>' + kpill(r.st) + '</a>').join('') + '</div>' : '') +
    '<div class="sec">Nachkaufen</div>' + (rb.length ? '<div class="card list">' + rb.map(({ w, later, stars }) => '<a class="row" href="#/wein/' + w.id + '"><span class="tx"><span class="t">' + esc(w.name + (w.vintage ? ' ' + w.vintage : '')) + '</span><span class="s">' + esc([w.producer, stars >= 4 ? stars + ' Sterne' : 'nochmal: ja', w.stock ? 'noch 1 Fl.' : 'ausgetrunken', later ? 'erst nach der Kauf-Pause' : ''].filter(Boolean).join(' · ')) + '</span></span>' +
      (later ? '<span class="rpill" style="color:var(--muted);background:var(--soft)">später</span>' : icon('chev', 'i chev')) + '</a>').join('') + '</div>' : '<p class="note">Hier erscheinen Weine, die du nochmal kaufen würdest oder mit 4–5 Sternen bewertet hast und die fast oder ganz leer sind.</p>') +
    (D.wishlist.length ? '<div class="sec">Von deiner Wunschliste</div>' + D.wishlist.slice(0, 3).map((x) => '<a class="card" href="#/wunschliste" style="display:block;padding:14px 16px;margin-bottom:10px"><span style="display:block;font:600 16px var(--head)">' + esc(x.name) + '</span><span class="sub" style="display:block;font-size:13px">' + esc([x.producer, x.grape, x.price != null ? eur(x.price) : ''].filter(Boolean).join(' · ')) + '</span></a>').join('') : '');
}
const yrs = (x, unit = 'J.') => (x == null ? '–' : String(Math.round(x * 2) / 2).replace('.', ',') + ' ' + unit);
const kpill = (st) => '<span class="rpill" style="color:' + K.ROW_ST[st][1] + ';background:' + K.ROW_ST[st][2] + '">' + K.ROW_ST[st][0] + '</span>';
function recoCard(r) {
  const pl = r.gap ? '<span class="rpill" style="color:' + (r.c === 'R' ? '#3E6A92;background:#E1EAF3' : '#2F6B45;background:#E1EFE4') + '">' + (r.c === 'R' ? 'ab ' : 'für ') + r.gap + (r.c === 'R' ? '' : '+') + '</span>' : '<span class="rpill" style="color:var(--muted);background:var(--soft)">versorgt</span>';
  return '<div class="card kcard"><div class="kct"><b>' + esc(r.title) + '</b>' + pl + '</div><p>' + esc(r.text) + '</p>' +
    (r.gap && r.items.length ? '<div class="kml">' + esc(r.label) + '</div>' + r.items.map((x) => '<a class="kit" href="' + x.href + '"><span>' + esc(x.t) + '</span><em>' + esc(x.r) + '</em></a>').join('') : '') + '</div>';
}

// Kaufberatung im Detail: Tempo, Ergebnis, Reife-Lücke, „Schaffst du das im Fenster?“; iPad als Übersichtsseite
export function kaufView(S, D) {
  const A = K.analyse(D, S.tempo), sug = K.suggestedTempo(D), dated = K.datedPerYear(D), y = R.nowYear();
  if (!A.fl) return head('Vorschläge', 'Kaufberatung') + '<div class="empty"><b>Noch kein Bestand</b></div>';
  const tHint = S.tempoOwn ? 'Eigenes Tempo – gilt auf allen Geräten. <button class="lnk" data-act="tempo-reset">Vorschlag (' + sug + ') verwenden</button>'
    : 'Vorschlag aus deinen Einträgen: ' + num(D.drinks.reduce((s, d) => s + (d.qty || 0), 0)) + ' getrunkene Flaschen seit ' + firstYear(D) + '.' + ((dated[y] || 0) + (dated[y - 1] || 0) < S.tempo / 2 ? ' Mit Datum sind ' + (y - 1) + ' nur ' + (dated[y - 1] || 0) + ' und ' + y + ' nur ' + (dated[y] || 0) + ' Flaschen erfasst – trägst du fehlende Daten nach, wird das Tempo genauer.' : '');
  const stepper = '<button type="button" class="kst" data-act="tempo" data-d="-4" aria-label="Tempo verringern">−</button><button type="button" class="kst" data-act="tempo" data-d="4" aria-label="Tempo erhöhen">+</button>';
  const result = 'Dein Keller reicht rund ' + yrs(A.reach, 'Jahre') + ' – im Fenster schaffst du ' + num(A.ok) + ' von ' + num(A.fl) + ' Flaschen';
  const sub = K.CATS.filter((c) => A.cat[c].fl).map((c) => K.CAT_SHORT[c] + ' ' + yrs(A.cat[c].reach)).join(' · ');
  const rows = '<div class="krows">' + A.rows.map((r) => '<div class="krow"><div class="kr1"><b>' + esc(r.name) + ' <small>' + num(r.fl) + ' Fl.</small></b>' + kpill(r.st) + '</div>' +
    '<div class="kbar"><i style="width:' + (r.ok / r.fl * 100).toFixed(1) + '%;background:#2F6B45"></i><i style="width:' + (r.bad / r.fl * 100).toFixed(1) + '%;background:#8A2B33"></i></div>' +
    '<div class="kr3">' + num(r.ok) + ' im Fenster' + (r.bad ? ' · ' + num(r.bad) + ' nicht mehr' + (r.over ? ' (' + num(r.over) + ' schon vorbei)' : '') : '') + '</div></div>').join('') + '</div>';
  const keyRows = '<div class="rkey"><span><i style="width:12px;height:8px;border-radius:2px;background:#2F6B45"></i>im Fenster</span><span><i style="width:12px;height:8px;border-radius:2px;background:#8A2B33"></i>nicht mehr im Fenster</span></div>';
  const gapChart = (c, small) => {
    const k = A.cat[c], max = Math.max(k.t * 1.3, ...k.avail, 1), H = small ? 70 : 120;
    return '<div class="kgap' + (small ? ' sm' : '') + '" role="img" aria-label="' + esc(K.CAT_LABEL[c] + ': trinkreife Flaschen ' + k.years[0] + ' bis ' + k.years[k.years.length - 1] + ': ' + k.avail.join(', ') + '; Bedarf ' + Math.round(k.t) + ' pro Jahr') + '">' +
      (k.t > 0 ? '<span class="need" style="bottom:' + (20 + k.t / max * H).toFixed(0) + 'px"></span>' : '') +
      k.avail.map((v, i) => '<span class="kc"><b>' + v + '</b><i style="height:' + Math.max(2, v / max * H).toFixed(0) + 'px;background:' + (v < k.t ? '#C9813F' : '#2F6B45') + '"></i><em>' + k.years[i] + '</em></span>').join('') + '</div>';
  };
  const ph = { W: 'trinkreife Weißweine', R: 'trinkreife Rotweine', C: 'trinkreifen Champagner' };
  const gapTxt = (c) => (A.cat[c].gap ? 'Ab ' + A.cat[c].gap + ' hast du weniger ' + ph[c] + ' als du trinkst – dafür jetzt Lagerweine kaufen, die dann reif sind.' : 'Bis ' + A.cat[c].years[A.cat[c].years.length - 1] + ' genug ' + ph[c] + ' – kein Kaufbedarf.');
  const legend = '<div class="rkey"><span><i style="width:12px;height:8px;border-radius:2px;background:#2F6B45"></i>reicht</span><span><i style="width:12px;height:8px;border-radius:2px;background:#C9813F"></i>Lücke</span><span><i style="width:16px;border-top:2px dashed var(--ink)"></i>Bedarf</span></div>';
  const cats = K.CATS.filter((c) => A.cat[c].fl);
  if (S.wide) {
    const recs = K.recommendations(D, A);
    return '<div class="top"><div><div class="eyebrow">Vorschläge</div><h1>Kaufberatung</h1></div><div class="ktempo"><span>Dein Tempo<b>' + num(S.tempo) + ' Fl. / Jahr</b></span>' + stepper + '</div></div>' +
      '<p class="note" style="text-align:right;margin-top:4px">' + tHint + '</p>' +
      '<div class="khero wide"><div><div class="eyebrow" style="color:var(--gold)">Ergebnis</div><div class="kh">' + esc(result) + '. Erst trinken, nur Lagerweine für die Lücke kaufen.</div></div>' +
      cats.map((c) => '<div class="kt"><span>' + K.CAT_LABEL[c] + '</span><b>' + yrs(A.cat[c].reach) + '</b><em>' + (A.cat[c].gap ? 'Lücke ab ' + A.cat[c].gap : 'versorgt') + '</em></div>').join('') + '</div>' +
      '<div class="kgrid"><div class="card chart"><div class="eyebrow" style="letter-spacing:.1em">Reife-Lücke</div><p class="note" style="margin-top:2px">Trinkreife Flaschen je Jahr im Keller · gestrichelt dein Bedarf · orange = Lücke</p>' +
      cats.map((c) => '<div class="kgh"><b>' + K.CAT_LABEL[c] + '</b><span>' + (A.cat[c].gap ? 'Lücke ab ' + A.cat[c].gap + ' · Bedarf ' + Math.round(A.cat[c].t) + ' Fl./Jahr' : 'versorgt') + '</span></div>' + gapChart(c, true)).join('') + '</div>' +
      '<div class="kside">' + recs.map(recoCard).join('') + '</div></div>' +
      '<div class="card chart" style="margin-top:12px"><div class="chart-head"><div><div class="eyebrow" style="letter-spacing:.1em">Schaffst du das im Fenster?</div><p class="note" style="margin-top:2px">Je Rebsorte bei deinem Tempo – dringendste Flaschen zuerst</p></div>' + keyRows + '</div>' + rows.replace('krows', 'krows two') + '</div>';
  }
  const c = K.CATS.includes(S.kCat) && A.cat[S.kCat].fl ? S.kCat : cats[0];
  return backBtn('#/vorschlaege', 'Vorschläge') + head('Vorschläge', 'Kaufberatung') +
    '<div class="card ktcard"><div class="ktrow"><div><div class="l">Dein Trinktempo</div><div class="v">' + num(S.tempo) + ' <small>Flaschen pro Jahr</small></div></div>' + stepper + '</div><p class="note">' + tHint + '</p></div>' +
    '<div class="khero"><div class="eyebrow" style="color:var(--gold)">Ergebnis</div><div class="kh" style="font-size:20px">' + esc(result) + '</div><p>' + esc(sub) + '. Erst trinken, nur gezielt nachkaufen: Lagerweine für die Jahre, in denen die Reife-Lücke beginnt.</p></div>' +
    boxT('Reife-Lücke', '<div class="mseg" role="group" aria-label="Weinart">' + cats.map((x) => '<button data-act="k-cat" data-k="' + x + '" aria-pressed="' + (x === c) + '">' + K.CAT_SHORT[x] + '</button>').join('') + '</div>',
      '<p class="note" style="margin-top:0">Trinkreife Flaschen je Jahr im Keller – gestrichelt dein Bedarf (' + String(Math.round(A.cat[c].t * 10) / 10).replace('.', ',') + ' Fl./Jahr)</p>' + gapChart(c) + legend + '<p style="font:500 13px/1.45 var(--sans);margin:10px 0 0">' + gapTxt(c) + '</p>') +
    boxT('Schaffst du das im Fenster?', '', '<p class="note" style="margin-top:0">Je Rebsorte: was du bei deinem Tempo im Trinkfenster trinkst – dringendste Flaschen zuerst</p>' + rows + keyRows);
}
const firstYear = (D) => { const d = [...D.purchases.map((p) => p.purchased_on), ...D.drinks.map((x) => x.drunk_on)].filter(Boolean).sort()[0]; return d ? d.slice(0, 4) : '–'; };

/* ---------- Einstellungen / Import ---------- */
export const TEMPLATE_URL = 'vorlage/Weinkeller-Importvorlage.xlsx';
export const IMPORT_ACCEPT = '.xlsx,.xlsm,.csv,.json,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export function settingsSheet(S, D) {
  const t = totals(D);
  return '<h2>Einstellungen</h2><div class="card" style="padding:14px 16px"><div class="l eyebrow" style="letter-spacing:.08em">Angemeldet als</div><div style="font-weight:500;margin-top:2px">' + esc(S.email) + '</div>' +
    '<div class="note">' + plural(D.wines.length, 'Wein', 'Weine') + ' · ' + fl(t.stock) + ' im Keller · ' + plural(D.wishlist.length, 'Wunsch', 'Wünsche') + '</div></div>' +
    '<div class="sec">Importieren</div><div class="fgrid">' +
    '<label class="btn ghost" for="imp">Excel-Liste oder Sicherung importieren</label><input id="imp" class="sr" type="file" accept="' + IMPORT_ACCEPT + '" data-change="import">' +
    '<a class="btn ghost" href="' + TEMPLATE_URL + '" download>Excel-Vorlage herunterladen</a></div>' +
    '<p class="note">Excel (.xlsx, .xlsm) oder CSV: Vor dem Import siehst du eine Vorschau. Weine, die schon in deinem Keller sind, werden übersprungen.</p>' +
    '<div class="sec">Etiketten</div><div class="card lstat" id="lbl-stats">' + labelStats(S, D) + '</div>' +
    (D.wines.some((w) => !w.label_path) ? '<div class="fgrid" style="margin-top:10px"><a class="btn ghost" href="#/fotos">' + icon('camera') + 'Fehlende Etiketten nachtragen (' + D.wines.filter((w) => !w.label_path).length + ')</a></div>' : '') +
    '<div class="sec">Exportieren</div><div class="fgrid">' +
    '<button class="btn ghost" data-act="export-xlsx">Als Excel exportieren</button>' +
    '<button class="btn ghost" data-act="export">Sicherung herunterladen (ohne Etiketten)</button></div>' +
    '<p class="note">Die Excel-Datei hat den Aufbau der Vorlage und lässt sich wieder importieren.</p>' +
    '<div class="sec">Konto</div><div class="fgrid"><button class="btn ghost" data-act="pw">Passwort ändern</button><button class="btn ghost" data-act="logout">Abmelden</button></div>' +
    '<div class="btns" style="margin-top:22px"><button class="btn ghost danger" data-act="wipe">Alle meine Daten löschen</button></div>' +
    '<p class="note" style="text-align:center">Version ' + VERSION + '<br>© ' + new Date().getFullYear() + ' Nick</p>';
}
// Etiketten im Speicher: Anzahl und Gesamtgröße (wird beim Öffnen der Einstellungen gezählt)
export function labelStats(S, D) {
  const x = S.lblStats, withLbl = D.wines.filter((w) => w.label_path).length;
  if (!x) return '<span class="l">Etikettenfotos</span><b>wird gezählt …</b>';
  if (x.err) return '<span class="l">Etikettenfotos</span><b>' + num(withLbl) + '</b><span class="note" style="margin:2px 0 0">Größe gerade nicht abrufbar</span>';
  const mb = x.bytes / 1048576;
  return '<span class="l">Etikettenfotos gespeichert</span><b>' + num(x.n) + ' <small>· ' + mb.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' MB</small></b>' +
    '<span class="note" style="margin:2px 0 0">' + (x.n ? 'Ø ' + Math.round(x.bytes / x.n / 1024) + ' KB je Foto · ' : '') + num(withLbl) + ' von ' + plural(D.wines.length, 'Wein', 'Weinen') + ' mit Etikett</span>';
}
export function pwSheet(err) {
  return '<h2>Passwort ändern</h2><form data-form="pw" style="display:flex;flex-direction:column;gap:10px">' +
    '<div class="field"><label for="pw0">Aktuelles Passwort</label><input id="pw0" name="pw0" type="password" autocomplete="current-password" required></div>' +
    '<div class="field"><label for="pw1">Neues Passwort (mind. 8 Zeichen)</label><input id="pw1" name="pw1" type="password" autocomplete="new-password" minlength="8" required></div>' +
    '<div class="field"><label for="pw2">Neues Passwort wiederholen</label><input id="pw2" name="pw2" type="password" autocomplete="new-password" minlength="8" required></div>' +
    (err ? '<p class="err">' + esc(err) + '</p>' : '') +
    '<div class="btns"><button class="btn ghost" type="button" data-act="settings">Abbrechen</button><button class="btn" type="submit">Speichern</button></div></form>';
}
export function wipeSheet(D) {
  return '<h2>Alle Daten löschen</h2><p class="sub">Löscht ' + plural(D.wines.length, 'Wein', 'Weine') + ' mit allen Käufen, Getrunken-Einträgen und Etiketten sowie ' + plural(D.wishlist.length, 'Wunsch', 'Wünsche') + ' aus deinem Konto. Das lässt sich nicht rückgängig machen. Das Konto selbst bleibt bestehen.</p>' +
    '<div class="fgrid" style="margin-top:14px"><button class="btn ghost" data-act="export-xlsx">Vorher als Excel sichern</button></div>' +
    '<form data-form="wipe" style="display:flex;flex-direction:column;gap:10px;margin-top:14px"><div class="field"><label for="wipe-ok">Zur Bestätigung LÖSCHEN eintippen</label><input id="wipe-ok" name="ok" autocomplete="off" autocapitalize="characters" required></div>' +
    '<div class="btns"><button class="btn ghost" type="button" data-act="settings">Abbrechen</button><button class="btn danger" type="submit">Endgültig löschen</button></div></form>';
}
// Excel-Import: Vorschau oder Zuordnung
export function xlSheet(S) {
  const X = S.xl, st = X.res.stats;
  const roles = Object.keys(ROLES);
  if (X.mapping) {
    const sheetSel = (role) => '<select data-change="xl-sheet" data-role="' + role + '"><option value="">— nicht vorhanden —</option>' +
      X.book.sheets.map((s, i) => s.hidden ? '' : '<option value="' + i + '"' + (X.plan.roles[role] === i ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select>';
    return '<h2>Zuordnung</h2><p class="sub">Welches Blatt und welche Spalte gehört wohin? Felder mit * sind nötig.</p>' +
      roles.map((role) => '<div class="sec">' + ROLES[role].label + '</div><div class="xmap"><div class="field"><label>Blatt</label>' + sheetSel(role) + '</div>' +
        (X.plan.roles[role] != null ? (() => { const hs = headers(X.book, X.plan, role); return ROLES[role].fields.map(([f, syn, req]) =>
          '<div class="field"><label>' + esc(syn[0]) + (req ? ' *' : '') + '</label><select data-change="xl-col" data-role="' + role + '" data-f="' + f + '"><option value="">—</option>' +
          hs.map((h, i) => '<option value="' + i + '"' + ((X.plan.maps[role] || {})[f] === i ? ' selected' : '') + '>' + esc(h) + '</option>').join('') + '</select></div>').join(''); })() : '') + '</div>').join('') +
      '<div class="btns"><button class="btn" data-act="xl-map">Fertig – zur Vorschau</button></div>';
  }
  const bad = X.res.issues.filter((x) => x.bad), warn = X.res.issues.filter((x) => !x.bad);
  const list = (arr, cls) => arr.slice(0, 25).map((x) => '<li class="' + cls + '"><b>' + esc(x.where) + '</b> ' + esc(x.text) + '</li>').join('') + (arr.length > 25 ? '<li class="' + cls + '">… und ' + (arr.length - 25) + ' weitere</li>' : '');
  const found = roles.filter((r) => X.plan.roles[r] != null).map((r) => ROLES[r].label + ' ← „' + esc(X.book.sheets[X.plan.roles[r]].name) + '“').join(' · ');
  const can = st.wines + st.wishlist > 0;
  return '<h2>Excel-Import</h2><p class="sub">' + esc(X.name) + (found ? '<br>' + found : '') + '</p>' +
    '<div class="kpis" style="margin-top:12px"><div class="kpi dark"><div class="l">Neue Weine</div><div class="v">' + num(st.wines) + '</div></div>' +
    '<div class="kpi"><div class="l">Flaschen</div><div class="v">' + num(st.bottles) + '</div></div><div class="kpi"><div class="l">Wünsche</div><div class="v">' + num(st.wishlist) + '</div></div></div>' +
    '<p class="note">' + [plural(st.producers, 'Weingut', 'Weingüter'), plural(st.purchases, 'Kauf', 'Käufe'), plural(st.drinks, 'Getrunken-Eintrag', 'Getrunken-Einträge')].join(' · ') +
    (st.skippedExisting ? ' · ' + plural(st.skippedExisting, 'Wein', 'Weine') + ' schon im Keller (übersprungen)' : '') + (st.wishSkipped ? ' · ' + plural(st.wishSkipped, 'Wunsch', 'Wünsche') + ' schon vorhanden' : '') + '</p>' +
    (bad.length ? '<div class="sec">Nicht übernommen (' + bad.length + ')</div><ul class="issues">' + list(bad, 'bad') + '</ul>' : '') +
    (warn.length ? '<div class="sec">Hinweise (' + warn.length + ')</div><ul class="issues">' + list(warn, '') + '</ul>' : '') +
    (!bad.length && !warn.length && can ? '<p class="note" style="color:#2F6B45;font-weight:600">Alles erkannt – keine Probleme gefunden.</p>' : '') +
    '<div class="btns"><button class="btn ghost" data-act="xl-map">Zuordnung prüfen</button>' +
    '<button class="btn" data-act="xl-run"' + (can ? '' : ' disabled') + '>' + (can ? 'Importieren' : 'Nichts zu importieren') + '</button></div>';
}
export function progressSheet(title, text, pct) {
  return '<h2>' + esc(title) + '</h2><p class="sub" id="prog-text">' + esc(text) + '</p><div class="progress"><i id="prog-bar" style="width:' + pct + '%"></i></div>';
}

/* ---------- Trinkreife (ab 1.3) ---------- */
// Zeitstrahl: Reifezeit (Linie ab Jahrgang), Trinkfenster, Höhepunkt, Markierung heute; Jahre einschließlich
export function reifeLine(win, vintage, A, B, opt = {}) {
  const x = (y) => (Math.max(0, Math.min(1, (y - A) / (B - A))) * 100).toFixed(2) + '%';
  const w = (a, b) => (Math.max(0, Math.min(B, b) - Math.max(A, a)) / (B - A) * 100).toFixed(2) + '%';
  const d = new Date(), now = d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
  const v = vintage && vintage < win[0] ? vintage : null;
  return '<div class="rtl' + (opt.cls ? ' ' + opt.cls : '') + '" role="img" aria-label="' + esc((vintage ? 'Jahrgang ' + vintage + ', ' : '') + 'trinkbar ' + win[0] + ' bis ' + win[3] + ', Höhepunkt ' + win[1] + ' bis ' + win[2]) + '">' +
    (v ? '<i class="st" style="left:' + x(v) + ';width:' + w(v, win[0]) + '"></i><i class="vd" style="left:' + x(v) + '"></i>' : '') +
    '<i class="wn" style="left:' + x(win[0]) + ';width:' + w(win[0], win[3] + 1) + '"></i><i class="pk" style="left:' + x(win[1]) + ';width:' + w(win[1], win[2] + 1) + '"></i>' +
    (now >= A && now <= B ? '<i class="td" style="left:' + x(now) + '">' + (opt.today ? '<b>heute</b>' : '') + '</i>' : '') +
    (opt.ticks ? opt.ticks.map((y) => '<span class="tk" style="left:' + x(y) + '">' + y + '</span>').join('') : '') + '</div>';
}
const pill = (st, text) => '<span class="rpill" style="color:' + R.STATUS[st].color + ';background:' + R.STATUS[st].bg + '">' + esc(text || R.STATUS[st].label) + '</span>';
const dotC = (k) => R.STATUS[k].bar || R.STATUS[k].color;
const SRC_TXT = { rule: 'Schätzung nach Rebsorte, Qualitätsstufe und Jahrgang. Deine Reife-Notiz beim Trinken passt das Fenster an.', est: 'Schätzung nach Rebsorte, Qualitätsstufe und Jahrgang. Deine Reife-Notiz beim Trinken passt das Fenster an.', note: 'Durch deine Reife-Notiz angepasst. Weitere Notizen passen es weiter an.', own: 'Von dir festgelegt – Reife-Notizen ändern es nicht mehr.' };
const yspan = (a, b) => (a === b ? String(a) : a + ' – ' + b);

export function reifeCard(w) {
  if (w.stock <= 0) return '';
  const { win, src } = R.windowOf(w), st = R.statusOf(win), t = R.sentence(win, st, w.stock);
  const A = Math.min(w.vintage || win[0], win[0]), B = Math.max(win[3] + 2, R.nowYear() + 2);
  return '<div class="sec rsec"><span>Trinkreife</span>' + pill(st) + '</div><div class="card rcard">' +
    '<div class="rt">' + esc(t.t) + '</div><div class="rs">' + esc(t.s) + '</div>' +
    reifeLine(win, w.vintage, A, B, { cls: 'lg', today: true, ticks: [A, B] }) +
    '<div class="rf3"><div><span>Trinkbar ab</span><b>' + win[0] + '</b></div><div><span>Höhepunkt</span><b class="pk">' + yspan(win[1], win[2]) + '</b></div><div><span>Trinkbar bis</span><b>' + win[3] + '</b></div></div>' +
    '<div class="rfoot">' + icon('info') + '<span>' + esc(SRC_TXT[src]) + '</span><button class="btn ghost small" data-act="reife-edit" data-id="' + w.id + '">Anpassen</button></div></div>';
}

// Bearbeiten: vier Jahreswerte mit −/+, Vorschau aktualisiert sich
export function reifeSheet(S, w) {
  const v = S.rw.v, st = R.statusOf(v);
  const L = [['Trinkbar ab', 'a'], ['Höhepunkt ab', 'p'], ['Höhepunkt bis', 'p'], ['Trinkbar bis', 'b']];
  const est = R.estimate(w), same = v.join() === est.join();
  const A = Math.min(w.vintage || v[0], v[0]), B = Math.max(v[3] + 2, R.nowYear() + 2);
  return '<h2>Trinkfenster anpassen</h2><p class="sub" style="margin:-6px 0 14px">' + esc([w.name, w.vintage, w.stock ? fl(w.stock) : ''].filter(Boolean).join(' · ')) + '</p>' +
    '<form data-form="reife" data-id="' + w.id + '" novalidate><div class="rprev"><div class="rph"><span>Vorschau</span>' + pill(st) + '</div>' + reifeLine(v, w.vintage, A, B, { today: true, ticks: [A, B] }) + '</div>' +
    '<div class="rsteps">' + L.map(([l, c], i) => '<div class="rstep"><i class="sw ' + c + '"></i><span class="l">' + l + '</span>' +
      '<button type="button" data-act="rw-step" data-i="' + i + '" data-d="-1" aria-label="' + l + ' ein Jahr früher">−</button><b>' + v[i] + '</b>' +
      '<button type="button" data-act="rw-step" data-i="' + i + '" data-d="1" aria-label="' + l + ' ein Jahr später">+</button></div>').join('') + '</div>' +
    '<div class="rreset"><span class="note">' + (same ? 'Entspricht der Regel-Schätzung (' + yspan(est[0], est[3]) + ').' : 'Wird als deine Angabe gespeichert – Reife-Notizen ändern sie dann nicht mehr.') + '</span>' +
    (same ? '' : '<button type="button" class="lnk" data-act="rw-reset">Zur Schätzung</button>') + '</div>' +
    '<div class="btns"><button type="button" class="btn ghost" data-act="close">Abbrechen</button><button class="btn" type="submit">Speichern</button></div></form>';
}

// Übersicht: „Jetzt trinken“ mit den drei am stärksten gefährdeten Weinen
export function reifeHome(D) {
  const c = R.cellar(D), s = R.summary(c), due = s.over.fl + s.now.fl, tot = c.reduce((a, x) => a + x.w.stock, 0);
  if (!c.length || !due) return '';
  const top = c.filter((x) => x.st === 'over' || x.st === 'now').slice(0, 3);
  return '<div class="card rhome"><div class="rh"><div><div class="eyebrow" style="color:#A55A12">Jetzt trinken</div><div class="rt">' + num(due) + ' ' + (due === 1 ? 'Flasche ist' : 'Flaschen sind') + ' dran</div></div><span class="note" style="margin:0">von ' + num(tot) + '</span></div>' +
    reifeStack(s, 'fl') + '<div class="rlg">' + R.STATUS_ORDER.filter((k) => s[k].fl).map((k) => '<span><i style="background:' + dotC(k) + '"></i>' + (k === 'wait' ? 'Warten' : R.STATUS[k].label) + ' ' + num(s[k].fl) + '</span>').join('') + '</div>' +
    '<div class="rlist">' + top.map((x) => '<a class="rrow" href="#/wein/' + x.w.id + '">' + cap(capOf(x.w), 'rcap') + '<span class="tx"><span class="t">' + esc(x.w.name) + '</span><span class="s">' + esc([x.w.producer, x.w.vintage, fl(x.w.stock)].filter(Boolean).join(' · ')) + '</span></span>' +
      pill(x.st, x.st === 'over' ? 'seit ' + (x.win[3] + 1) + ' vorbei' : 'bis ' + x.win[3]) + '</a>').join('') + '</div>' +
    '<a class="rmore" href="#/reife">Alle nach Dringlichkeit' + icon('chev') + '</a></div>';
}
const reifeStack = (s, k) => '<div class="rstack" aria-hidden="true">' + R.STATUS_ORDER.filter((x) => s[x][k] > 0).map((x) => '<i style="flex:' + s[x][k].toFixed(2) + ';background:' + dotC(x) + '"></i>').join('') + '</div>';

// Statistik Bestand: Reife im Keller und nach Rebsorte
export function reifeBox(S, D) {
  const c = R.cellar(D); if (!c.length) return '';
  const s = R.summary(c), eurM = ((S.metric || {}).reife || 'qty') === 'eur', k = eurM ? 'eur' : 'fl';
  const fmt = (v) => (eurM ? eur(v, 0) : num(v) + ' Fl.');
  const top = groupSum(c, (x) => x.w.grape || 'ohne Rebsorte', (x) => x.w.stock).slice(0, 6).map((g) => g[0]);
  const gk = (x) => (top.includes(x.w.grape || 'ohne Rebsorte') ? x.w.grape || 'ohne Rebsorte' : x.w.wine_type === 'Rotwein' ? 'Weitere Rote' : 'Weitere Weiße & Co.');
  const groups = [...new Set(c.map(gk))].map((g) => { const xs = c.filter((x) => gk(x) === g); return { g, s: R.summary(xs), t: xs.reduce((a, x) => a + (eurM ? x.w.value || 0 : x.w.stock), 0) }; }).sort((a, b) => b.t - a.t);
  const max = Math.max(1, ...groups.map((g) => g.t));
  return boxT('Reife im Keller', metricSeg(S, 'reife', 'qty', 'Wert'), reifeStack(s, k).replace('rstack', 'rstack big') +
    '<div class="rst">' + R.STATUS_ORDER.filter((x) => s[x].wines).map((x) => '<a class="row" href="#/reife?st=' + x + '"><i class="rdot" style="background:' + dotC(x) + '"></i><span class="tx"><span class="t">' + R.STATUS[x].label + '</span><span class="s">' + plural(s[x].wines, 'Wein', 'Weine') + ' · ' + esc(R.STATUS[x].hint) + '</span></span><b>' + fmt(s[x][k]) + '</b>' + icon('chev', 'i hchev') + '</a>').join('') + '</div>') +
    boxT('Reife nach Rebsorte', '', '<div class="rgr">' + groups.map((g) => '<a href="#/reife?g=' + encodeURIComponent(g.g) + '"><span class="h"><span>' + esc(g.g) + '</span><em>' + fmt(g.t) + '</em></span><span class="b">' +
      R.STATUS_ORDER.filter((x) => g.s[x][k] > 0).map((x) => '<i style="width:' + (g.s[x][k] / max * 100).toFixed(2) + '%;background:' + dotC(x) + '"></i>').join('') + '</span></a>').join('') + '</div>');
}

// Seite Trinkreife: alle Weine im Bestand, dringend zuerst, Filter nach Status (und optional Rebsorte)
export function reifeView(S, D, params) {
  const all = R.cellar(D), gf = params.get('g') || '';
  const top = groupSum(all, (x) => x.w.grape || 'ohne Rebsorte', (x) => x.w.stock).slice(0, 6).map((g) => g[0]);
  const gk = (x) => (top.includes(x.w.grape || 'ohne Rebsorte') ? x.w.grape || 'ohne Rebsorte' : x.w.wine_type === 'Rotwein' ? 'Weitere Rote' : 'Weitere Weiße & Co.');
  const c = gf ? all.filter((x) => gk(x) === gf) : all;
  const s = R.summary(c), f = R.STATUS[S.reifeF] ? S.reifeF : 'all';
  if (!all.length) return head('Trinkreife', 'Trinkfenster') + '<div class="empty"><b>Noch kein Bestand</b></div>';
  const ys = c.flatMap((x) => [x.w.vintage || x.win[0], x.win[3]]);
  const A = Math.max(Math.min(...ys), R.nowYear() - 10), B = Math.min(Math.max(...ys) + 1, R.nowYear() + 20);
  const ticks = []; const step = B - A > 16 ? 4 : 2; for (let y = Math.ceil(A / step) * step; y <= B; y += step) ticks.push(y);
  const chip = (k, l, col, n) => '<button class="rchip" data-act="reife-f" data-k="' + k + '" aria-pressed="' + (f === k) + '" style="--c:' + col + '"><span><i></i>' + l + '</span><b>' + num(n) + ' <small>Fl.</small></b></button>';
  const tot = c.reduce((a, x) => a + x.w.stock, 0);
  const row = (x) => '<a class="rtrow" href="#/wein/' + x.w.id + '" aria-label="' + esc(x.w.name + ', ' + R.STATUS[x.st].label) + '"><span class="nm"><span class="t">' + esc(x.w.name) + '</span><span class="s">' + esc([x.w.producer, x.w.vintage || 'NV', fl(x.w.stock)].filter(Boolean).join(' · ')) + '</span></span>' +
    reifeLine(x.win, x.w.vintage, A, B) + '<span class="end">' + (x.st === 'wait' ? 'ab ' + x.win[0] : 'bis ' + x.win[3]) + (x.src === 'own' ? ' ·&nbsp;eigene' : '') + '</span></a>';
  const groups = R.STATUS_ORDER.filter((k) => (f === 'all' || f === k) && s[k].wines).map((k) =>
    '<div class="rtg"><i style="background:' + dotC(k) + '"></i><b>' + R.STATUS[k].label + '</b><span>' + plural(s[k].wines, 'Wein', 'Weine') + ' · ' + num(s[k].fl) + ' Fl. · ' + esc(R.STATUS[k].hint) + '</span></div>' +
    c.filter((x) => x.st === k).map(row).join('')).join('');
  return '<div class="top"><div><div class="eyebrow">Statistik · Trinkreife</div><h1>Trinkfenster im Keller</h1></div><div class="note" style="text-align:right;margin:0">' + plural(c.length, 'Wein', 'Weine') + ' · ' + num(tot) + ' Flaschen<br>dringend zuerst</div></div>' +
    (gf ? '<div class="btns" style="margin-top:0"><a class="chip" aria-pressed="true" href="#/reife">' + esc(gf) + ' ' + icon('x', 'i') + '</a></div>' : '') +
    '<div class="rchips" role="group" aria-label="Filter nach Reife">' + chip('all', 'Alle', '#2B2024', tot) + R.STATUS_ORDER.map((k) => chip(k, R.STATUS[k].label, dotC(k), s[k].fl)).join('') + '</div>' +
    '<div class="card rtl-card"><div class="rtax"><span class="nm">Wein · Flaschen</span><div class="rtl axis">' + ticks.map((y) => '<span class="tk" style="left:' + ((y - A) / (B - A) * 100).toFixed(2) + '%">' + y + '</span>').join('') + '</div><span class="end"></span></div>' + (groups || '<p class="note">Keine Weine in dieser Gruppe.</p>') +
    '<div class="rkey"><span><i class="k1"></i>Reifezeit</span><span><i class="k2"></i>Trinkfenster</span><span><i class="k3"></i>Höhepunkt</span><span><i class="k4"></i>heute</span></div></div>';
}

// Neuer Wein: Vorschlag aus Rebsorte, Qualitätsstufe, Jahrgang
export function newReife(w, tierSel) {
  const tier = tierSel || R.detectTier(w), win = R.estimate(w, tier);
  const A = Math.min(w.vintage || win[0], win[0]), B = Math.max(win[3] + 1, R.nowYear() + 1);
  return '<p class="note" style="margin-top:0">Qualitätsstufe – ' + (tierSel ? 'von dir gewählt' : 'aus Name und Preis erkannt') + ', antippen zum Ändern:</p>' +
    '<div class="opts tiers" role="group" aria-label="Qualitätsstufe">' + R.TIERS.map(([k, l]) => '<button type="button" data-act="nw-tier" data-k="' + k + '" aria-pressed="' + (tier === k) + '">' + l + '</button>').join('') + '</div>' +
    '<div class="rprev" style="margin-top:12px"><div class="rph"><b>Vorschlag ' + win[0] + ' – ' + win[3] + '</b><span style="color:var(--wine);font-weight:600">Höhepunkt ' + yspan(win[1], win[2]) + '</span></div>' + reifeLine(win, w.vintage, A, B, { today: true, ticks: [A, B] }) + '</div>' +
    '<p class="note">Wird mit dem Wein gespeichert und lässt sich später auf der Wein-Seite anpassen.</p>';
}
