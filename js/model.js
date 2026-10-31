// Abgeleitete Daten: Bestand, Fächer, Suche – alles aus den Rohtabellen berechnet.

export const TYPES = ['Weißwein', 'Rotwein', 'Rosé', 'Champagner', 'Schaumwein', 'Süßwein'];
export const STYLES = ['trocken', 'feinherb', 'halbtrocken', 'fruchtig', 'lieblich', 'süß', 'brut', 'extra brut'];
export const TINT = { W: '#262C29', R: '#331C23', C: '#3A3324', P: '#38262B' };
export const TYPE_COLOR = { 'Weißwein': '#E3C36B', 'Rotwein': '#B3344F', 'Champagner': '#A9B58A', 'Schaumwein': '#C9CFA8', 'Rosé': '#E7A9B6', 'Süßwein': '#D9A45B' };
export const CAP_COLORS = [['Dunkel', ''], ['Weiß', '#ECE8DF'], ['Gold', '#C9A14A'], ['Silber', '#B9BCC0'], ['Hellblau', '#9CCBEA'], ['Rot', '#9B2335'], ['Grün', '#2F6B45']];
export const BUY_AGAIN = [['ja', 'Ja'], ['evtl', 'Evtl.'], ['nein', 'Nein']];
export const FIXED_TAIL = ['Weitere Rote', 'Weitere Weiße', 'Rosé', 'Schaumweine'];

export const typeKey = (t) => (t === 'Rotwein' ? 'R' : t === 'Champagner' || t === 'Schaumwein' ? 'C' : t === 'Rosé' ? 'P' : 'W');
export const tintOf = (w) => TINT[typeKey(w.wine_type)];
export const capOf = (w) => (w.cap_color || tintOf(w));

const byDateDesc = (k) => (a, b) => String(b[k] || '').localeCompare(String(a[k] || '')) || String(b.created_at || '').localeCompare(String(a.created_at || ''));

export function derive(data) {
  const prod = new Map(data.producers.map((p) => [p.id, p]));
  const pur = new Map(), dr = new Map();
  for (const p of data.purchases) (pur.get(p.wine_id) || pur.set(p.wine_id, []).get(p.wine_id)).push(p);
  for (const d of data.drinks) (dr.get(d.wine_id) || dr.set(d.wine_id, []).get(d.wine_id)).push(d);

  const wines = data.wines.map((w) => {
    const p = prod.get(w.producer_id) || null;
    const purchases = (pur.get(w.id) || []).slice().sort(byDateDesc('purchased_on'));
    const drinks = (dr.get(w.id) || []).slice().sort(byDateDesc('drunk_on'));
    const bought = purchases.reduce((s, x) => s + (x.qty || 0), 0);
    const drunk = drinks.reduce((s, x) => s + (x.qty || 0), 0);
    let pq = 0, ps = 0;
    for (const x of purchases) if (x.price != null) { pq += x.qty; ps += x.qty * Number(x.price); }
    const avgPrice = pq ? ps / pq : null;
    const stock = Math.max(0, bought - drunk);
    const rated = drinks.find((d) => d.buy_again) || null;
    const noted = drinks.find((d) => d.note) || null;
    const dates = purchases.map((x) => x.purchased_on).filter(Boolean).sort();
    return {
      ...w,
      producer: p ? p.name : '',
      cap_color: p ? p.cap_color : null,
      purchases, drinks, bought, drunk, stock, avgPrice,
      value: avgPrice != null ? stock * avgPrice : 0,
      spent: ps,
      buyAgain: rated ? rated.buy_again : null,
      lastNote: noted ? noted.note : '',
      lastDrunk: drinks.find((d) => d.drunk_on) ? drinks.find((d) => d.drunk_on).drunk_on : null,
      firstBought: dates[0] || null,
      merchants: [...new Set(purchases.map((x) => x.merchant).filter(Boolean))]
    };
  });

  // Fächer: eigenes Fach je Rebsorte ab 3 Weinen im Bestand, sonst "Weitere ..."
  const inStock = wines.filter((w) => w.stock > 0);
  const grapeCount = {};
  for (const w of inStock) {
    if (['Champagner', 'Schaumwein', 'Rosé'].includes(w.wine_type) || !w.grape) continue;
    grapeCount[w.grape] = (grapeCount[w.grape] || 0) + 1;
  }
  for (const w of wines) w.fach = fachOf(w, grapeCount);
  return { wines, byId: new Map(wines.map((w) => [w.id, w])), producers: data.producers, wishlist: data.wishlist, drinks: data.drinks, purchases: data.purchases };
}

export function fachOf(w, grapeCount) {
  if (w.wine_type === 'Champagner') return 'Champagner';
  if (w.wine_type === 'Rosé') return 'Rosé';
  if (w.wine_type === 'Schaumwein') return 'Schaumweine';
  if (w.grape && (grapeCount[w.grape] || 0) >= 3) return w.grape;
  return w.wine_type === 'Rotwein' ? 'Weitere Rote' : 'Weitere Weiße';
}

// Fächerliste in Regal-Reihenfolge
export function faecher(D) {
  const inStock = D.wines.filter((w) => w.stock > 0);
  const map = new Map();
  for (const w of inStock) (map.get(w.fach) || map.set(w.fach, []).get(w.fach)).push(w);
  for (const list of map.values()) list.sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name));
  const regular = [...map.keys()].filter((k) => !FIXED_TAIL.includes(k));
  if (!regular.includes('Champagner')) regular.push('Champagner');
  const bottles = (k) => (map.get(k) || []).reduce((s, w) => s + w.stock, 0);
  regular.sort((a, b) => (map.get(b) || []).length - (map.get(a) || []).length || bottles(b) - bottles(a));
  return [...regular, ...FIXED_TAIL].map((name) => ({ name, wines: map.get(name) || [], bottles: bottles(name) }));
}

// Stapel-Stufen nach Anzahl Weine
export function layout(n) {
  if (n >= 9) return { rows: [3, 3, 3], stacked: false };
  if (n >= 6) return { rows: [1, 2, 3], stacked: true };
  if (n >= 3) return { rows: [3], stacked: false };
  return { rows: [n], stacked: false };
}

// Volltextsuche: jedes Wort muss in irgendeinem Feld vorkommen
export function matcher(q) {
  const tokens = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  return (w) => {
    const hay = [w.name, w.producer, w.grape, w.wine_type, w.style, w.region, w.vintage, w.fach, w.merchants.join(' ')].join(' ').toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };
}

// Chips: 2 Top-Rebsorten + Top-Weingut nach Flaschen im Bestand
export function topSearches(D) {
  const g = {}, p = {};
  for (const w of D.wines) {
    if (!w.stock) continue;
    if (w.grape) g[w.grape] = (g[w.grape] || 0) + w.stock;
    if (w.producer) p[w.producer] = (p[w.producer] || 0) + w.stock;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map((x) => x[0]);
  return [...top(g, 2), ...top(p, 1)];
}

export function totals(D) {
  const s = { stock: 0, value: 0, wines: 0, byType: {}, drunk: 0, drunkValue: 0, again: 0 };
  for (const w of D.wines) {
    if (w.stock > 0) { s.stock += w.stock; s.value += w.value; s.wines++; s.byType[w.wine_type] = (s.byType[w.wine_type] || 0) + w.stock; }
    s.drunk += w.drunk; s.drunkValue += (w.avgPrice || 0) * w.drunk;
  }
  s.again = D.drinks.filter((d) => d.buy_again === 'ja').length;
  return s;
}

export function groupSum(items, key, val) {
  const o = {};
  for (const x of items) { const k = key(x); if (k == null || k === '') continue; o[k] = (o[k] || 0) + val(x); }
  return Object.entries(o).sort((a, b) => b[1] - a[1]);
}
