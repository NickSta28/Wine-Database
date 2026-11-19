// Kaufberatung (ab 1.4): Trinktempo, Reichweite, Reife-Lücke, „im Fenster schaffbar“, Empfehlungen.
import { windowOf, detectTier, estimate, nowYear } from './reife.js';

export const CATS = ['W', 'R', 'C'];
export const CAT_LABEL = { W: 'Weißwein', R: 'Rotwein', C: 'Champagner' };
export const CAT_SHORT = { W: 'Weiß', R: 'Rot', C: 'Champagner' };
export const catOf = (t) => (t === 'Rotwein' ? 'R' : t === 'Champagner' || t === 'Schaumwein' ? 'C' : 'W');
const HORIZON = 8;

// Tempo-Vorschlag: alle getrunkenen Flaschen (auch ohne Datum) je Jahr seit dem ersten Eintrag
export function suggestedTempo(D) {
  const drunk = D.drinks.reduce((s, d) => s + (d.qty || 0), 0);
  const dates = [...D.purchases.map((p) => p.purchased_on), ...D.drinks.map((d) => d.drunk_on)].filter(Boolean).sort();
  if (!drunk || !dates.length) return 24;
  const first = new Date(dates[0]), years = Math.max(1, (Date.now() - first.getTime()) / (365.25 * 864e5));
  return Math.max(4, Math.round(drunk / years));
}
// Erfasste Flaschen mit Datum je Jahr (für den Hinweis)
export function datedPerYear(D) {
  const o = {};
  for (const d of D.drinks) if (d.drunk_on) { const y = Number(d.drunk_on.slice(0, 4)); o[y] = (o[y] || 0) + (d.qty || 0); }
  return o;
}

// Gruppen für „Schaffst du das im Fenster?“: Rebsorten ab 5 Flaschen, Rest gesammelt
function groupOf(w, big) {
  const c = catOf(w.wine_type);
  if (c === 'C') return w.wine_type === 'Champagner' ? 'Champagner' : 'Schaumwein';
  if (w.grape && big.has(w.grape)) return w.grape;
  return c === 'R' ? 'Weitere Rote' : 'Weitere Weiße & Rosé';
}

export function analyse(D, T, Y = nowYear()) {
  const inS = D.wines.filter((w) => w.stock > 0);
  const byGrape = {}; for (const w of inS) if (w.grape) byGrape[w.grape] = (byGrape[w.grape] || 0) + w.stock;
  const big = new Set(Object.entries(byGrape).filter(([, n]) => n >= 5).map(([g]) => g));
  // Anteil je Weinart nach bisher getrunkenen Flaschen, sonst nach Bestand
  const share = { W: 0, R: 0, C: 0 };
  for (const w of D.wines) share[catOf(w.wine_type)] += w.drunk;
  let tot = share.W + share.R + share.C;
  if (!tot) { for (const w of inS) share[catOf(w.wine_type)] += w.stock; tot = share.W + share.R + share.C || 1; }
  const groups = {}, cat = {};
  const yearFrac = (12 - new Date().getMonth()) / 12;
  for (const c of CATS) {
    const t = T * share[c] / tot;
    let pool = [];
    let fl = 0, ok = 0;
    for (const w of inS.filter((x) => catOf(x.wine_type) === c)) {
      const g = groupOf(w, big), win = windowOf(w).win;
      const o = groups[g] || (groups[g] = { name: g, cat: c, fl: 0, over: 0, ok: 0, late: 0 });
      for (let i = 0; i < w.stock; i++) { o.fl++; fl++; if (win[3] < Y) o.over++; else pool.push({ a: win[0], b: win[3], g }); }
    }
    // Jahr für Jahr die dringendste trinkreife Flasche zuerst; was über sein Ende kommt, ist „nicht mehr im Fenster“
    let cap = 0;
    for (let y = Y; y < Y + 60 && pool.length; y++) {
      cap += y === Y ? t * yearFrac : t;
      pool.sort((p, q) => p.b - q.b);
      while (cap >= 1) { const i = pool.findIndex((p) => p.a <= y); if (i < 0) break; groups[pool[i].g].ok++; ok++; pool.splice(i, 1); cap -= 1; }
      pool = pool.filter((p) => { if (p.b <= y) { groups[p.g].late++; return false; } return true; });
    }
    const avail = [];
    for (let y = Y + 1; y <= Y + HORIZON; y++) avail.push(inS.filter((w) => catOf(w.wine_type) === c).reduce((s, w) => { const x = windowOf(w).win; return s + (x[0] <= y && y <= x[3] ? w.stock : 0); }, 0));
    const gi = t >= 0.5 ? avail.findIndex((v) => v < t) : -1;
    cat[c] = { c, t, fl, ok, avail, years: avail.map((_, i) => Y + 1 + i), gap: gi < 0 ? null : Y + 1 + gi, reach: t > 0 ? fl / t : null, share: share[c] / tot };
  }
  const rows = Object.values(groups).map((g) => {
    const bad = g.over + g.late;
    const st = g.fl && bad >= g.fl * 0.5 ? 'pause' : g.ok >= g.fl ? 'ok' : 'soon';
    return { ...g, bad, st };
  }).sort((a, b) => b.bad - a.bad || b.fl - a.fl);
  const fl = CATS.reduce((s, c) => s + cat[c].fl, 0), ok = CATS.reduce((s, c) => s + cat[c].ok, 0);
  return { T, cat, rows, fl, ok, reach: T ? fl / T : null, pause: new Set(rows.filter((r) => r.st === 'pause').map((r) => r.name)), groupOf: (w) => groupOf(w, big) };
}

export const ROW_ST = { pause: ['Erst trinken', '#8A2B33', '#F6E1E3'], soon: ['Bald dran', '#A55A12', '#F8E6D3'], ok: ['Gut versorgt', '#2F6B45', '#E1EFE4'] };

// Gezielt kaufen: je Weinart (Reihenfolge Weiß, Rot, Champagner) Text und passende Weine
export function recommendations(D, A, Y = nowYear()) {
  const lager = (x) => ['lage', 'top', 'suess'].includes(detectTier(x));
  const exWine = (w) => ({ id: w.id, t: [w.producer, w.name + (w.vintage ? ' ' + w.vintage : '')].filter(Boolean).join(' · '), r: w.stock ? 'noch ' + w.stock + ' Fl.' : 'ausgetrunken', href: '#/wein/' + w.id });
  const exWish = (x) => ({ t: [x.producer, x.name + (x.vintage ? ' ' + x.vintage : '')].filter(Boolean).join(' · '), r: x.price != null ? Math.round(Number(x.price)) + ' €' : 'Wunschliste', href: '#/wunschliste' });
  const fav = (w) => w.buyAgain === 'ja' || w.drinks.some((d) => (d.rating || 0) >= 4);
  const wishC = (x) => catOf(x.wine_type || (/champagne/i.test((x.grape || '') + ' ' + x.name) ? 'Champagner' : 'Weißwein'));
  const out = [];
  for (const c of CATS) {
    const k = A.cat[c]; if (!k.fl && !k.share) continue;
    const per = Math.max(2, Math.round(k.t / 4));
    let title, text, label, items;
    if (c === 'W') {
      const g = topDrunkGrape(D, 'W');
      title = (g || 'Weißwein') + ' zum Lagern';
      text = k.gap
        ? (g === 'Riesling' ? 'Erste Lage, GG oder Kabinett' : 'Lagen- oder Reserve-Weine') + ' aus ' + (Y - 2) + '/' + (Y - 1) + ' – trinkreif in den nächsten Jahren, Höhepunkt in deiner Lücke ab ' + k.gap + '. Etwa ' + per + ' Flaschen pro Jahr reichen.'
        : 'Bis ' + (Y + HORIZON) + ' genug trinkreife Weißweine – kein Kaufbedarf.';
      label = 'Passt von deiner Wunschliste';
      // Wunschliste: Weine, deren geschätztes Fenster die Lücke abdeckt – am besten passender Höhepunkt zuerst
      items = k.gap ? D.wishlist.filter((x) => wishC(x) === 'W' && (!g || !x.grape || x.grape === g)).map((x) => ({ x, e: estimate({ ...x, wine_type: x.wine_type || 'Weißwein', price: x.price != null ? Number(x.price) : null }) }))
        .filter(({ e }) => e[3] >= k.gap + 2 && e[0] <= k.gap).sort((p, q) => Math.abs(p.e[1] - k.gap) - Math.abs(q.e[1] - k.gap)).slice(0, 3).map(({ x }) => exWish(x)) : [];
    } else if (c === 'R') {
      title = 'Rotwein';
      text = k.gap ? 'Bis ' + (k.gap - 1) + ' versorgt. Danach Riserva oder Lagenwein aus ' + (Y - 5) + '/' + (Y - 4) + ' – am besten jetzt kaufen, solange verfügbar.' : 'Bis ' + (Y + HORIZON) + ' genug trinkreife Rotweine – kein Kaufbedarf.';
      label = 'Nachkaufen, neuer Jahrgang';
      items = D.wines.filter((w) => catOf(w.wine_type) === 'R' && fav(w) && w.stock <= 1 && lager({ ...w, price: w.avgPrice })).slice(0, 2).map(exWine);
      if (!items.length) { label = 'Passt von deiner Wunschliste'; items = D.wishlist.filter((x) => wishC(x) === 'R').slice(0, 2).map(exWish); }
    } else {
      title = 'Champagner';
      const nvLeft = D.wines.filter((w) => w.stock > 0 && w.wine_type === 'Champagner' && !w.vintage).reduce((s, w) => s + w.stock, 0);
      const nvYear = Y + Math.max(1, Math.ceil(nvLeft / Math.max(1, k.t)));
      text = k.gap ? 'Ohne Jahrgang erst wieder ab ' + Math.min(nvYear, k.gap) + ' kaufen – dann jährlich frisch, rund ' + Math.max(1, Math.round(k.t)) + ' Flaschen. Für später ein, zwei Jahrgangs-Champagner.' : 'Bis ' + (Y + HORIZON) + ' genug Champagner – kein Kaufbedarf.';
      label = 'Deine Lieblinge · nochmal kaufen: ja';
      items = D.wines.filter((w) => catOf(w.wine_type) === 'C' && fav(w) && w.stock === 0).sort((a, b) => Math.max(0, ...b.drinks.map((d) => d.rating || 0)) - Math.max(0, ...a.drinks.map((d) => d.rating || 0)) || String(b.lastDrunk || '').localeCompare(String(a.lastDrunk || ''))).slice(0, 3).map(exWine);
    }
    out.push({ c, title, text, gap: k.gap, label, items });
  }
  return out;
}
function topDrunkGrape(D, c) {
  const o = {};
  for (const w of D.wines) if (catOf(w.wine_type) === c && w.grape && w.drunk) o[w.grape] = (o[w.grape] || 0) + w.drunk;
  const top = Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : '';
}

// Nachkaufen: „nochmal kaufen: ja“ oder ab 4 Sterne, höchstens noch 1 Flasche; „später“, wenn die Rebsorte Überhang hat
export function rebuy(D, A) {
  return D.wines.filter((w) => w.stock <= 1 && (w.buyAgain === 'ja' || w.drinks.some((d) => (d.rating || 0) >= 4)))
    .map((w) => ({ w, later: A.pause.has(A.groupOf(w)), stars: Math.max(0, ...w.drinks.map((d) => d.rating || 0)) }))
    .sort((a, b) => a.later - b.later || b.stars - a.stars || String(b.w.lastDrunk || '').localeCompare(String(a.w.lastDrunk || '')));
}
export { estimate };
