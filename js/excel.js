// Excel-Import und -Export: Blätter erkennen, Spalten zuordnen, Werte prüfen, in das Importformat umwandeln.
import { TYPES } from './model.js';

/* ---------- Felder je Blatt (Name in der Vorlage, Synonyme) ---------- */
const P = ['Weingut', 'winzer', 'erzeuger', 'produzent', 'hersteller', 'weinbau', 'weingut name'];
const N = ['Wein', 'name', 'bezeichnung', 'weinname', 'wein name', 'wein bezeichnung', 'produkt', 'artikel'];
const Y = ['Jahrgang', 'jahr', 'vintage', 'jg'];
const T = ['Weinart', 'art', 'typ', 'farbe', 'kategorie', 'weintyp', 'sorte wein'];
const G = ['Rebsorte', 'rebsorten', 'traube', 'trauben', 'sorte', 'grape', 'rebsorte n'];
const R = ['Region', 'anbaugebiet', 'gebiet', 'herkunft', 'land region', 'appellation'];
const M = ['Händler', 'haendler', 'bezugsquelle', 'gekauft bei', 'shop', 'lieferant', 'quelle kauf', 'einkauf bei'];
const PR = ['Preis je Flasche', 'preis', 'preis flasche', 'preis pro flasche', 'ek', 'einkaufspreis', 'flaschenpreis', 'preis eur', 'preis in eur'];
const NO = ['Notiz', 'bemerkung', 'bemerkungen', 'kommentar', 'anmerkung', 'notizen', 'beschreibung'];
export const ROLES = {
  wines: { label: 'Weine', match: /^(weine?|weinliste|bestand|weinbestand|keller|weinkeller|sammlung|lager|meineweine|weindatenbank)$/, fields: [
    ['producer', P, true], ['name', N, true], ['vintage', Y], ['wine_type', T, true], ['grape', G, true], ['region', R],
    ['style', ['Geschmack', 'geschmacksrichtung', 'stil', 'suesse', 'restsuesse', 'ausbau']],
    ['stock', ['Flaschen im Keller', 'bestand', 'anzahl', 'menge', 'flaschen', 'im keller', 'lagerbestand', 'anzahl flaschen', 'vorrat']],
    ['price', PR], ['merchant', M], ['note', NO]] },
  purchases: { label: 'Käufe', match: /^(kaeufe|kauf|einkaeufe|einkauf|bestellungen|weinkaeufe)/, fields: [
    ['producer', P, true], ['name', N, true], ['vintage', Y],
    ['date', ['Kaufdatum', 'datum', 'gekauft am', 'bestelldatum', 'kauf datum']], ['merchant', M],
    ['qty', ['Anzahl', 'menge', 'flaschen', 'stueck', 'anzahl flaschen'], true], ['price', PR]] },
  drinks: { label: 'Getrunken', match: /^(getrunken|verkostung|verkostungen|trink|konsum|probiert)/, fields: [
    ['producer', P, true], ['name', N, true], ['vintage', Y],
    ['date', ['Datum', 'getrunken am', 'trinkdatum', 'wann']], ['qty', ['Anzahl', 'menge', 'flaschen']], ['note', NO],
    ['buy_again', ['Nochmal kaufen', 'wieder kaufen', 'nachkaufen', 'erneut kaufen']], ['occasion', ['Anlass', 'gelegenheit', 'event']]] },
  wishlist: { label: 'Wunschliste', match: /^(wunsch|wuensche|merkliste|probieren)/, fields: [
    ['producer', P], ['name', N, true], ['vintage', Y], ['wine_type', T], ['grape', G], ['region', R], ['merchant', M],
    ['price', ['Preis', ...PR.slice(1)]], ['url', ['Link', 'url', 'shop link', 'webseite']],
    ['idea_source', ['Idee von', 'empfehlung', 'empfohlen von', 'quelle', 'woher']], ['note', NO]] }
};
export const fieldLabel = (role, f) => ROLES[role].fields.find((x) => x[0] === f)[1][0];

export const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

// Kopfzeile finden: erste Zeile (unter den ersten 10) mit den meisten erkannten Spaltennamen
function headerOf(rows, role) {
  let best = { row: 0, hits: 0 };
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const hits = (rows[r] || []).filter((c) => ROLES[role].fields.some(([, syn]) => syn.some((s) => norm(s) === norm(c)))).length;
    if (hits > best.hits) best = { row: r, hits };
  }
  return best;
}
function autoMap(head, role) {
  const map = {}, used = new Set();
  const cells = head.map((h) => norm(h));
  for (const pass of ['exact', 'start']) {
    for (const [f, syn] of ROLES[role].fields) {
      if (map[f] != null) continue;
      const i = cells.findIndex((c, k) => !used.has(k) && c && syn.some((s) => (pass === 'exact' ? c === norm(s) : c.startsWith(norm(s) + ' '))));
      if (i >= 0) { map[f] = i; used.add(i); }
    }
  }
  return map;
}

// Erste Analyse einer Datei: Rollen der Blätter, Kopfzeilen, Zuordnung
export function analyse(book) {
  const vis = book.sheets.map((s, i) => ({ ...s, i })).filter((s) => !s.hidden && s.rows.some((r) => r.some((c) => c != null && c !== '')));
  const plan = { roles: {}, head: {}, maps: {} };
  for (const role of Object.keys(ROLES)) {
    const s = vis.find((x) => ROLES[role].match.test(norm(x.name).replace(/ /g, '')) && !Object.values(plan.roles).includes(x.i));
    if (s) plan.roles[role] = s.i;
  }
  // Kein Blatt „Weine“: das Blatt mit den meisten erkannten Wein-Spalten nehmen
  if (plan.roles.wines == null) {
    const cand = vis.filter((x) => !Object.values(plan.roles).includes(x.i)).map((x) => ({ x, h: headerOf(x.rows, 'wines') })).sort((a, b) => b.h.hits - a.h.hits)[0];
    if (cand && cand.h.hits >= 2) plan.roles.wines = cand.x.i;
  }
  for (const [role, i] of Object.entries(plan.roles)) setSheet(book, plan, role, i);
  return plan;
}
export function setSheet(book, plan, role, i) {
  if (i == null || i === '') { delete plan.roles[role]; delete plan.head[role]; delete plan.maps[role]; return; }
  i = Number(i);
  const h = headerOf(book.sheets[i].rows, role);
  plan.roles[role] = i; plan.head[role] = h.row;
  plan.maps[role] = autoMap(book.sheets[i].rows[h.row] || [], role);
}
export const headers = (book, plan, role) => (book.sheets[plan.roles[role]].rows[plan.head[role]] || []).map((h, i) => String(h == null || h === '' ? 'Spalte ' + (i + 1) : h));

/* ---------- Werte prüfen ---------- */
const str = (v) => { if (v == null) return ''; if (typeof v === 'number') return String(v); return String(v).replace(/\s+/g, ' ').trim(); };
const numOf = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = str(v).replace(/€|eur|euro/gi, '').replace(/\s/g, '');
  if (!s) return null;
  const t = /,\d{1,2}$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const n = parseFloat(t); return Number.isFinite(n) ? n : NaN;
};
const intOf = (v) => { const n = numOf(v); return n == null || Number.isNaN(n) ? n : Math.round(n); };
const iso = (y, m, d) => {
  if (y < 100) y += y < 70 ? 2000 : 1900;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d && y >= 1950 && y <= 2100 ? dt.toISOString().slice(0, 10) : undefined;
};
function dateOf(v, date1904) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') {
    if (v < 1 || v > 80000) return undefined;
    const ms = Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 30) + Math.floor(v) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = str(v);
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.{1,2}(\d{2,4})$/); if (m) return iso(+m[3], +m[2], +m[1]);
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return iso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if (m) return iso(+m[3], +m[1], +m[2]);
  m = s.match(/^(\d{1,2})\.(\d{4})$/); if (m) return iso(+m[2], +m[1], 1);
  m = s.match(/^(\d{4})$/); if (m) return iso(+m[1], 1, 1);
  return undefined;
}
const TYPE_SYN = [
  ['Weißwein', /^(weiss|weisswein|weisswe|white|blanc|bianco|w)$/], ['Rotwein', /^(rot|rotwein|red|rouge|rosso|r)$/],
  ['Rosé', /^(rose|rosewein|rosato|rosado|blush)$/], ['Champagner', /^(champagner|champagne)$/],
  ['Schaumwein', /^(schaumwein|sekt|cremant|prosecco|cava|spumante|sparkling|perlwein|frizzante|franciacorta|pet nat|petnat|winzersekt)$/],
  ['Süßwein', /^(suesswein|dessertwein|edelsuess|eiswein|suess|portwein|port|sherry|madeira|tokaji|sauternes|beerenauslese|trockenbeerenauslese)$/]];
const typeOf = (v) => { const s = norm(v); if (!s) return null; const t = TYPES.find((x) => norm(x) === s); if (t) return t; const m = TYPE_SYN.find(([, re]) => re.test(s)); return m ? m[0] : undefined; };
const againOf = (v) => { const s = norm(v); if (!s) return null; if (/^(ja|j|yes|y|x|1|true|wahr|unbedingt)$/.test(s)) return 'ja'; if (/^(nein|n|no|0|false|falsch|nie)$/.test(s)) return 'nein'; if (/^(evtl|eventuell|vielleicht|mal sehen|ggf)$/.test(s)) return 'evtl'; return undefined; };
const vintageOf = (v) => { const s = str(v); if (!s || /^(nv|n v|ohne|mv|sa)$/i.test(norm(s))) return null; const n = intOf(v); return n >= 1900 && n <= 2100 ? n : undefined; };
// Beispielzeilen der Vorlage (nur in der ersten Datenzeile ignoriert)
const EXAMPLES = new Set();
const keyOf = (p, n, y) => norm(p) + '|' + norm(n) + '|' + (y || '');

EXAMPLES.add(keyOf('Robert Weil', 'Kiedrich Turmberg Riesling trocken', '2020')); EXAMPLES.add(keyOf('Dr. Loosen', 'Erdener Prälat Riesling GG', '2021'));

/* ---------- Umwandeln: Plan → Importdaten + Hinweise ---------- */
// existing: { wines: [{producer, name, vintage}], wishlist: [...] } – bereits vorhandene Einträge werden übersprungen
export function build(book, plan, existing) {
  const issues = [], warn = (role, row, text) => issues.push({ bad: false, where: ROLES[role].label + (row ? ', Zeile ' + row : ''), text });
  const err = (role, row, text) => issues.push({ bad: true, where: ROLES[role].label + (row ? ', Zeile ' + row : ''), text });
  const rowsOf = (role) => {
    if (plan.roles[role] == null) return [];
    const sheet = book.sheets[plan.roles[role]], map = plan.maps[role] || {};
    const out = [];
    for (let r = plan.head[role] + 1; r < sheet.rows.length; r++) {
      const row = sheet.rows[r] || [];
      if (!row.some((c) => c != null && str(c) !== '')) continue;
      const o = { _row: r + 1 };
      for (const [f] of ROLES[role].fields) o[f] = map[f] != null ? row[map[f]] : null;
      if (r === plan.head[role] + 1 && EXAMPLES.has(keyOf(o.producer, o.name, str(o.vintage)))) continue; // Beispielzeile der Vorlage
      out.push(o);
    }
    return out;
  };
  const missing = (role) => ROLES[role].fields.filter(([f, , req]) => req && (plan.maps[role] || {})[f] == null).map(([f]) => fieldLabel(role, f));

  const j = { format: 'wine-database', producers: [], wines: [], purchases: [], drinks: [], wishlist: [] };
  const stats = { wines: 0, skippedExisting: 0, purchases: 0, drinks: 0, wishlist: 0, wishSkipped: 0, bottles: 0, producers: new Set(), errors: 0 };
  const have = new Set((existing.wines || []).map((w) => keyOf(w.producer, w.name, w.vintage)));
  const haveWish = new Set((existing.wishlist || []).map((w) => keyOf(w.producer, w.name, w.vintage)));

  if (plan.roles.wines == null) { err('wines', 0, 'Kein Blatt mit Weinen gefunden. Bitte unter „Zuordnung“ das Blatt wählen.'); }
  const miss = plan.roles.wines != null ? missing('wines') : [];
  if (miss.length) err('wines', 0, 'Spalte fehlt: ' + miss.join(', ') + '. Bitte unter „Zuordnung“ auswählen.');

  // Weine
  const byKey = new Map(), byPN = new Map(), skipKeys = new Set();
  if (plan.roles.wines != null && !miss.length) {
    for (const o of rowsOf('wines')) {
      const producer = str(o.producer), name = str(o.name);
      if (!name) { err('wines', o._row, 'Name des Weins fehlt – Zeile übersprungen'); stats.errors++; continue; }
      let vintage = vintageOf(o.vintage);
      if (vintage === undefined) { warn('wines', o._row, 'Jahrgang „' + str(o.vintage) + '“ nicht erkannt – ohne Jahrgang übernommen'); vintage = null; }
      let grape = str(o.grape);
      let type = typeOf(o.wine_type);
      if (!type && /^champagne/i.test(grape)) type = 'Champagner';
      if (!type) { err('wines', o._row, (str(o.wine_type) ? 'Weinart „' + str(o.wine_type) + '“ unbekannt' : 'Weinart fehlt') + ' – Zeile übersprungen (' + name + ')'); stats.errors++; continue; }
      if (type === 'Champagner' && (!grape || /^champagne$/i.test(grape))) grape = 'Champagner';
      if (!grape && type !== 'Rosé' && type !== 'Schaumwein') warn('wines', o._row, 'Rebsorte fehlt – „' + name + '“ kommt ins Fach „Weitere …“');
      let stock = intOf(o.stock);
      if (Number.isNaN(stock) || stock < 0) { warn('wines', o._row, 'Flaschenzahl „' + str(o.stock) + '“ nicht erkannt – als 0 übernommen'); stock = 0; }
      let price = numOf(o.price);
      if (Number.isNaN(price) || price < 0) { warn('wines', o._row, 'Preis „' + str(o.price) + '“ nicht erkannt'); price = null; }
      const key = keyOf(producer, name, vintage);
      if (have.has(key)) { skipKeys.add(key); stats.skippedExisting = skipKeys.size; continue; }
      if (byKey.has(key)) {
        const w = byKey.get(key); w._stock = (w._stock || 0) + (stock || 0);
        warn('wines', o._row, '„' + name + '“ doppelt – Flaschen zusammengezählt'); continue;
      }
      const w = { key, producer: producer || null, name, grape: grape || null, wine_type: type, style: str(o.style).toLowerCase() || null, region: str(o.region) || null,
        vintage, my_note: str(o.note) || null, _stock: stock, _price: price, _merchant: str(o.merchant) || null, _row: o._row };
      byKey.set(key, w); j.wines.push(w);
      const pn = keyOf(producer, name, ''); byPN.set(pn, byPN.has(pn) ? 'multi' : w);
      if (producer) stats.producers.add(producer);
    }
  }
  const findWine = (role, o) => {
    const vintage = vintageOf(o.vintage);
    const key = keyOf(str(o.producer), str(o.name), vintage || null);
    if (skipKeys.has(key)) return 'skip';
    if (byKey.has(key)) return byKey.get(key);
    if (!str(o.vintage)) { const w = byPN.get(keyOf(str(o.producer), str(o.name), '')); if (w && w !== 'multi') return w; }
    err(role, o._row, '„' + [str(o.producer), str(o.name), str(o.vintage)].filter(Boolean).join(' · ') + '“ steht nicht im Blatt Weine – übersprungen');
    stats.errors++;
    return null;
  };
  // Käufe
  if (plan.roles.purchases != null && j.wines.length) {
    const m = missing('purchases');
    if (m.length) err('purchases', 0, 'Spalte fehlt: ' + m.join(', ') + ' – Blatt nicht übernommen');
    else for (const o of rowsOf('purchases')) {
      const w = findWine('purchases', o); if (!w || w === 'skip') continue;
      const qty = intOf(o.qty);
      if (!(qty > 0)) { err('purchases', o._row, 'Anzahl „' + str(o.qty) + '“ ungültig – übersprungen'); stats.errors++; continue; }
      let d = dateOf(o.date, book.date1904); if (d === undefined) { warn('purchases', o._row, 'Datum „' + str(o.date) + '“ nicht erkannt – ohne Datum übernommen'); d = null; }
      let price = numOf(o.price); if (Number.isNaN(price) || price < 0) { warn('purchases', o._row, 'Preis „' + str(o.price) + '“ nicht erkannt'); price = null; }
      j.purchases.push({ wine: w.key, purchased_on: d, merchant: str(o.merchant) || null, qty, price: price == null ? null : Math.round(price * 100) / 100 });
      w._bought = (w._bought || 0) + qty;
    }
  }
  // Getrunken
  if (plan.roles.drinks != null && j.wines.length) {
    const m = missing('drinks');
    if (m.length) err('drinks', 0, 'Spalte fehlt: ' + m.join(', ') + ' – Blatt nicht übernommen');
    else for (const o of rowsOf('drinks')) {
      const w = findWine('drinks', o); if (!w || w === 'skip') continue;
      let qty = intOf(o.qty); if (qty == null) qty = 1;
      if (!(qty > 0)) { warn('drinks', o._row, 'Anzahl „' + str(o.qty) + '“ ungültig – als 1 übernommen'); qty = 1; }
      let d = dateOf(o.date, book.date1904); if (d === undefined) { warn('drinks', o._row, 'Datum „' + str(o.date) + '“ nicht erkannt – ohne Datum übernommen'); d = null; }
      let again = againOf(o.buy_again); if (again === undefined) { warn('drinks', o._row, '„Nochmal kaufen“ = „' + str(o.buy_again) + '“ nicht erkannt (ja, evtl, nein)'); again = null; }
      j.drinks.push({ wine: w.key, drunk_on: d, qty, note: str(o.note) || null, buy_again: again, occasion: str(o.occasion) || null });
      w._drunk = (w._drunk || 0) + qty;
    }
  }
  // Bestand: ohne Käufe aus „Flaschen im Keller“ einen Kauf bilden; mit Käufen nur prüfen
  for (const w of j.wines) {
    const drunk = w._drunk || 0;
    if (w._bought) {
      if (w._stock != null && w._bought - drunk !== w._stock) warn('wines', w._row, '„' + w.name + '“: laut Käufen und Getrunken ' + Math.max(0, w._bought - drunk) + ' Flaschen, in der Liste ' + w._stock + ' – die App rechnet mit Käufen minus Getrunken');
    } else {
      const qty = (w._stock || 0) + drunk;
      if (qty > 0) j.purchases.push({ wine: w.key, purchased_on: null, merchant: w._merchant, qty, price: w._price == null ? null : Math.round(w._price * 100) / 100 });
      w._bought = qty;
    }
    stats.bottles += Math.max(0, w._bought - drunk);
  }
  // Wunschliste
  if (plan.roles.wishlist != null) {
    const m = missing('wishlist');
    if (m.length) err('wishlist', 0, 'Spalte fehlt: ' + m.join(', ') + ' – Blatt nicht übernommen');
    else for (const o of rowsOf('wishlist')) {
      const name = str(o.name); if (!name) { err('wishlist', o._row, 'Name fehlt – übersprungen'); stats.errors++; continue; }
      const vintage = vintageOf(o.vintage) || null, key = keyOf(str(o.producer), name, vintage);
      if (haveWish.has(key)) { stats.wishSkipped++; continue; }
      haveWish.add(key);
      let price = numOf(o.price); if (Number.isNaN(price)) price = null;
      j.wishlist.push({ producer: str(o.producer) || null, name, grape: str(o.grape) || null, wine_type: typeOf(o.wine_type) || null, region: str(o.region) || null, vintage,
        idea_source: str(o.idea_source) || null, merchant: str(o.merchant) || null, price, url: str(o.url) || null, note: str(o.note) || null });
    }
  }
  for (const w of j.wines) for (const k of Object.keys(w)) if (k.startsWith('_')) delete w[k];
  stats.wines = j.wines.length; stats.purchases = j.purchases.length; stats.drinks = j.drinks.length; stats.wishlist = j.wishlist.length;
  stats.producers = stats.producers.size;
  return { j, issues, stats };
}

/* ---------- Export in Vorlagen-Struktur (wieder importierbar) ---------- */
export function exportSheets(D) {
  const name = (w) => [w.producer || '', w.name, w.vintage || ''];
  const wines = D.wines.slice().sort((a, b) => (a.producer || '').localeCompare(b.producer || '') || a.name.localeCompare(b.name) || (a.vintage || 0) - (b.vintage || 0));
  const byId = new Map(D.wines.map((w) => [w.id, w]));
  const sortD = (k) => (a, b) => String(a[k] || '').localeCompare(String(b[k] || ''));
  return [
    { name: 'Weine', cols: [{ h: 'Weingut', w: 24 }, { h: 'Wein', w: 34 }, { h: 'Jahrgang', w: 10 }, { h: 'Weinart', w: 13 }, { h: 'Rebsorte', w: 18 }, { h: 'Region', w: 16 }, { h: 'Geschmack', w: 12 },
      { h: 'Flaschen im Keller', w: 11 }, { h: 'Preis je Flasche', w: 12, eur: true }, { h: 'Händler', w: 18 }, { h: 'Notiz', w: 40 }],
      rows: wines.map((w) => [...name(w), w.wine_type, w.grape || '', w.region || '', w.style || '', w.stock, w.avgPrice != null ? Math.round(w.avgPrice * 100) / 100 : '', w.merchants.join(', '), w.my_note || '']) },
    { name: 'Käufe', cols: [{ h: 'Weingut', w: 24 }, { h: 'Wein', w: 34 }, { h: 'Jahrgang', w: 10 }, { h: 'Kaufdatum', w: 12, date: true }, { h: 'Händler', w: 18 }, { h: 'Anzahl', w: 9 }, { h: 'Preis je Flasche', w: 12, eur: true }],
      rows: D.purchases.filter((p) => byId.has(p.wine_id)).sort(sortD('purchased_on')).map((p) => [...name(byId.get(p.wine_id)), p.purchased_on || '', p.merchant || '', p.qty, p.price != null ? Number(p.price) : '']) },
    { name: 'Getrunken', cols: [{ h: 'Weingut', w: 24 }, { h: 'Wein', w: 34 }, { h: 'Jahrgang', w: 10 }, { h: 'Datum', w: 12, date: true }, { h: 'Anzahl', w: 9 }, { h: 'Notiz', w: 40 }, { h: 'Nochmal kaufen', w: 12 }, { h: 'Anlass', w: 18 }],
      rows: D.drinks.filter((d) => byId.has(d.wine_id)).sort(sortD('drunk_on')).map((d) => [...name(byId.get(d.wine_id)), d.drunk_on || '', d.qty, d.note || '', d.buy_again || '', d.occasion || '']) },
    { name: 'Wunschliste', cols: [{ h: 'Weingut', w: 24 }, { h: 'Wein', w: 34 }, { h: 'Jahrgang', w: 10 }, { h: 'Weinart', w: 13 }, { h: 'Rebsorte', w: 18 }, { h: 'Region', w: 16 }, { h: 'Händler', w: 16 },
      { h: 'Preis', w: 11, eur: true }, { h: 'Link', w: 30 }, { h: 'Idee von', w: 18 }, { h: 'Notiz', w: 34 }],
      rows: D.wishlist.map((x) => [x.producer || '', x.name, x.vintage || '', x.wine_type || '', x.grape || '', x.region || '', x.merchant || '', x.price != null ? Number(x.price) : '', x.url || '', x.idea_source || '', x.note || '']) }
  ];
}
