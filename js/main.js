// Hauptprogramm: Zustand, Routing, Daten laden, Aktionen
import * as api from './api.js';
import { $, $$, esc, today, debounce, uuid, download, shrinkImage, b64ToBlob } from './util.js';
import { derive, faecher, matcher, topSearches, CAP_COLORS } from './model.js';
import * as V from './views.js';
import { readXlsx, readCsv, writeXlsx } from './xlsx.js';
import * as XL from './excel.js';
import * as R from './reife.js';
import * as K from './kauf.js';

const PREFS = 'wd_prefs_v1';
const S = {
  email: '', loginError: '', loginBusy: false,
  data: null, D: null, urls: {}, loaded: false,
  route: { name: 'home', arg: '' }, prevHash: '',
  q: '', showDrop: false, recent: [], fachSort: 'stock',
  drunkFilter: 'all', drunkLimit: 40, statTab: '', expand: new Set(),
  form: null, busy: false, backHref: '#/regal', backLabel: 'Weinregal'
};
try { const p = JSON.parse(localStorage.getItem(PREFS) || '{}'); if (Array.isArray(p.recent)) S.recent = p.recent.slice(0, 3); if (p.yearCardHidden) S.yearCardHidden = p.yearCardHidden; } catch { /* egal */ }
const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify({ recent: S.recent, yearCardHidden: S.yearCardHidden || null })); } catch { /* egal */ } };

/* ---------- Hilfen ---------- */
let toastTimer;
function toast(msg, bad) {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : '');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), bad ? 5000 : 2600);
}
const errMsg = (e) => (e && e.message ? e.message : String(e));
async function guard(fn) { try { return await fn(); } catch (e) { console.error(e); toast(errMsg(e), true); return undefined; } }
const uid = () => api.getSession().user.id;
const numOrNull = (v) => { const s = String(v == null ? '' : v).trim().replace(/\s/g, '').replace(',', '.'); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const intOrNull = (v) => { const n = numOrNull(v); return n == null ? null : Math.round(n); };
const txt = (v) => { const s = String(v == null ? '' : v).trim(); return s || null; };
const blankForm = () => ({ wine: { wine_type: 'Weißwein' }, qty: 1, price: '', merchant: '', date: today(), cap: '', photoBlob: null, photoUrl: '', wishId: null });

/* ---------- Daten ---------- */
async function load() {
  const [producers, wines, purchases, drinks, wishlist] = await Promise.all([
    api.selectAll('producers', { order: 'name' }), api.selectAll('wines'), api.selectAll('purchases'),
    api.selectAll('drinks'), api.selectAll('wishlist')
  ]);
  S.data = { producers, wines, purchases, drinks, wishlist };
  S.D = derive(S.data);
  // Einstellungen je Konto (ab 1.4); fehlt die Tabelle, gilt der Vorschlag
  try { const [st] = await api.selectAll('settings'); S.settings = (st && st.data) || {}; } catch (e) { console.warn('Einstellungen', e); S.settings = S.settings || {}; }
  S.tempoOwn = !!S.settings.tempo;
  S.tempo = S.settings.tempo || K.suggestedTempo(S.D);
  S.loaded = true;
  const need = wines.map((w) => w.label_path).filter((p) => p && !S.urls[p]);
  if (need.length) { try { Object.assign(S.urls, await api.signLabels(need)); } catch (e) { console.warn('Etiketten-Links', e); } }
}
async function reload() { await load(); render(); }

/* ---------- Routing ---------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const parts = path.split('/').map(decodeURIComponent);
  const params = new URLSearchParams(qs || '');
  const map = { '': 'home', regal: 'regal', fach: 'fach', suche: 'search', liste: 'list', wein: 'wine', getrunken: 'drunk', neu: 'neu', statistik: 'stats', weinjahr: 'year', fotos: 'photos', reife: 'reife', kaufberatung: 'kauf', vorschlaege: 'reco', wunschliste: 'wish' };
  return { name: map[parts[0]] || 'home', arg: parts[1] || '', params };
}
const BACK_LABEL = { photos: 'Fotos nachtragen', home: 'Übersicht', regal: 'Weinregal', search: 'Suche', drunk: 'Getrunken', reco: 'Vorschläge', stats: 'Statistik', year: 'Weinjahr', reife: 'Trinkreife', kauf: 'Kaufberatung' };
function onRoute() {
  const r = parseHash();
  const prev = S.route;
  // iPad quer: Wein aus einer Liste geöffnet → Liste links, Detail rechts; beim Weiterklicken bleibt die Liste
  if (r.name === 'wine' && prev.name !== 'wine') S.wineCtx = ['fach', 'list', 'search'].includes(prev.name) ? prev : null;
  if (r.name === 'wine' && prev.name !== 'wine') {
    S.backHref = S.prevHash || '#/regal';
    S.wineFrom = prev.name;
    S.backLabel = prev.name === 'fach' ? 'Fach ' + prev.arg : prev.name === 'list' ? (prev.params.get('v') || 'Liste') : (BACK_LABEL[prev.name] || 'Zurück');
  }
  if (r.name === 'regal' && r.params.get('q') != null) { S.q = r.params.get('q'); S.showDrop = false; }
  if (r.name === 'neu' && (!S.form || !S.form.keep)) S.form = blankForm();
  if (S.form) S.form.keep = false;
  if (r.name === 'year' && prev.name !== 'wine') S.wjMore = false;
  if (r.name === 'reife' && prev.name !== 'wine') S.reifeF = r.params.get('st') || 'all';
  if (r.name === 'drunk' && !['drunk', 'wine'].includes(prev.name)) S.drunkQ = '';
  if (r.name === 'drunk' && prev.name !== 'drunk') { S.drunkLimit = 40; if (prev.name !== 'wine') S.tlPage = 0; }
  // Neue Liste: Standard-Sortierung (Bestand bzw. Datum); beim Zurückkommen vom Wein bleibt die Wahl
  if (['fach', 'list', 'search'].includes(r.name) && prev.name !== 'wine') S.fachSort = 'stock';
  S.route = r; S.prevHash = location.hash || '#/';
  closeSheet();
  render(true);
  if (r.name === 'regal' && r.params.get('focus')) { const i = $('#q'); if (i) i.focus(); }
}

/* ---------- Rendern ---------- */
function render(top) {
  const app = $('#app');
  document.body.classList.toggle('authed', api.isLoggedIn());
  if (!api.isLoggedIn()) { app.innerHTML = V.loginView(S.loginError, S.loginBusy, S.email); return; }
  if (!S.loaded) { app.innerHTML = '<p class="empty">Lädt …</p>'; return; }
  const y = window.scrollY, D = S.D, r = S.route;
  S.keepR = $('.wsplit .split-r')?.scrollTop || 0;
  let html = '', tab = 'home';
  if (r.name === 'regal') html = V.regalView(S, D);
  else if (r.name === 'fach' && S.wide && S.fachMode === 'labels') { const F = faecher(D); html = V.fachView(S, D, r.arg, F.find((f) => f.name === r.arg)?.wines || [], { wall: true, fachChips: F }); }
  else if (r.name === 'fach' && S.wide) html = V.fachSplit(S, D, r.arg, faecher(D).find((f) => f.name === r.arg)?.wines || []);
  else if (['fach', 'search', 'list'].includes(r.name)) { html = listView(r); if (r.name === 'list') tab = 'stats'; }
  else if (r.name === 'wine') {
    const w = D.byId.get(r.arg), c = S.wineCtx;
    if (!w) html = '<div class="empty"><b>Wein nicht gefunden</b></div>';
    else if (S.wide && c) {
      // Zurück aus der Liste: Fach → Regal mit Fach, Suche → Weinregal, Statistik-Liste → Statistik
      const back = c.name === 'fach' ? ['#/fach/' + encodeURIComponent(c.arg), 'Regalansicht'] : c.name === 'search' ? ['#/regal', 'Weinregal'] : ['#/statistik', 'Statistik'];
      html = '<div class="split wsplit"><div class="split-l pane">' + listView(c, { split: true, showBack: true, back, sel: w.id }) +
        '</div><div class="split-r pane">' + V.detailView(S, D, w, { split: true }) + '</div></div>';
      if (c.name === 'list') tab = 'stats';
    } else html = V.detailView(S, D, w);
  }
  else if (r.name === 'drunk') html = V.drunkView(S, D);
  else if (r.name === 'neu') { html = V.newView(S, D); tab = 'neu'; }
  else if (r.name === 'stats') { html = V.statsView(S, D); tab = 'stats'; }
  else if (r.name === 'photos') html = V.photosView(S, D);
  else if (r.name === 'reife') { html = V.reifeView(S, D, r.params); tab = 'stats'; }
  else if (r.name === 'year') { html = V.yearView(S, D, Number(r.params.get('y')) || V.reviewYear()); tab = 'stats'; }
  else if (r.name === 'reco') { html = V.recoView(S, D); tab = 'reco'; }
  else if (r.name === 'kauf') { html = V.kaufView(S, D); tab = 'reco'; }
  else if (r.name === 'wish') { html = V.wishView(S, D); tab = 'wish'; }
  else html = V.homeView(S, D);
  // Seitenleiste (iPad): aktiver Bereich; beim Wein der Bereich, aus dem man kam
  const SIDE = { photos: 'regal', home: 'home', regal: 'regal', fach: 'regal', search: 'regal', drunk: 'drunk', stats: 'stats', list: 'stats', year: 'year', reife: 'reife', reco: 'reco', kauf: 'reco', wish: 'wish', neu: 'neu' };
  const side = SIDE[r.name === 'wine' ? S.wineFrom : r.name] || '';
  const split = html.startsWith('<div class="split wsplit">');
  const wide = split || (r.name === 'fach' && S.fachMode === 'labels') || ['home', 'regal', 'fach', 'search', 'list', 'drunk', 'stats', 'year', 'reife', 'reco', 'kauf', 'wish'].includes(r.name);
  const oldL = $('.wsplit .split-l'), keepL = split && oldL ? oldL.scrollTop : 0;
  app.innerHTML = '<div class="page pg-' + r.name + (wide ? ' wide' : '') + '">' + html + '</div>' + V.nav(tab, side);
  // Liste links behält beim Durchklicken ihre Position, rechts startet das Detail oben
  if (split) { $('.wsplit .split-l').scrollTop = keepL; if (!top) $('.wsplit .split-r').scrollTop = S.keepR || 0; }
  if (r.name === 'regal') renderRegalParts();
  window.scrollTo(0, top ? 0 : y);
}
// Listen (Fach, Suche, Statistik-Liste); extra: zusätzliche Optionen für die geteilte Ansicht
function listView(r, extra = {}) {
  const D = S.D;
  if (r.name === 'fach') return V.fachView(S, D, r.arg, faecher(D).find((f) => f.name === r.arg)?.wines || [], { wall: !extra.sel, ...extra });
  if (r.name === 'search') {
    // Suche: Bestand; ausgetrunkene Weine auf Wunsch dazu
    const m = matcher(S.q), all = m ? D.wines.filter((w) => m(w)) : [], gone = all.filter((w) => w.stock <= 0).length;
    const footer = gone ? '<div class="btns"><button class="btn ghost" data-act="search-all">' + (S.searchAll ? 'Nur Weine im Keller zeigen' : 'Auch ' + gone + ' ausgetrunkene ' + (gone === 1 ? 'Wein' : 'Weine') + ' zeigen') + '</button></div>' : '';
    return V.fachView(S, D, '„' + S.q.trim() + '“', S.searchAll ? all : all.filter((w) => w.stock > 0), { eyebrow: 'Suche', mini: false, footer, ...extra });
  }
  const k = V.LIST_FIELDS[r.params.get('k')] ? r.params.get('k') : 'grape', f = V.LIST_FIELDS[k], v = r.params.get('v') || '';
  const scope = ['drunk', 'bought'].includes(r.params.get('s')) ? r.params.get('s') : 'stock';
  const inScope = scope === 'drunk' ? (w) => w.drunk > 0 : scope === 'bought' ? (w) => w.bought > 0 : (w) => w.stock > 0;
  const suffix = scope === 'drunk' ? ' · getrunken' : scope === 'bought' ? ' · gekauft' : ' im Keller';
  return V.fachView(S, D, v, D.wines.filter((w) => inScope(w) && V.listMatch(k, v)(w)), { eyebrow: f[0] + (['dyear', 'byear', 'again'].includes(k) ? '' : suffix), back: ['#/statistik', 'Statistik'], mini: false, scope, year: ['dyear', 'byear'].includes(k) ? v : '', ...extra });
}
const saveSettings = debounce(() => guard(() => api.upsert('settings', [{ user_id: uid(), data: S.settings, updated_at: new Date().toISOString() }], 'user_id')), 500);
// Neuer Wein: Trinkfenster-Vorschlag live aus den Formularfeldern
function refreshNewReife() {
  const box = $('#nw-reife'), f = $('form[data-form=new]'); if (!box || !f || !S.form) return;
  const w = { ...readWineFields(f), price: numOrNull(f.elements.price.value), firstBought: f.elements.purchased_on.value };
  box.innerHTML = V.newReife(w, S.form.tier);
}
const refreshNewReifeSoon = debounce(refreshNewReife, 150);
// Getrunken-Suche: nur die Liste neu zeichnen, damit das Eingabefeld den Fokus behält
const refreshDrunk = debounce(() => { const box = $('#dlist'); if (box && S.D) box.innerHTML = V.drunkList(S, S.D); }, 120);
function renderRegalParts() {
  const D = S.D;
  const chips = $('#chips'); if (chips) chips.innerHTML = V.chipsHtml(topSearches(D), S.recent, S.q);
  const shelf = $('#shelf'); if (shelf) shelf.innerHTML = V.shelfHtml(D, S.q);
  const drop = $('#drop'); if (drop) drop.innerHTML = S.showDrop ? V.dropHtml(D, S.q) : '';
  const hint = $('#hint'); if (hint) hint.textContent = V.hintText(D, S.q);
  const clr = $('#regal-search .clr'); if (clr) clr.classList.toggle('hidden', !S.q);
}
function addRecent(term) {
  const t = String(term || '').trim(); if (!t) return;
  if (topSearches(S.D).some((x) => x.toLowerCase() === t.toLowerCase())) return;
  S.recent = [t, ...S.recent.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 3); savePrefs();
}

/* ---------- Sheets ---------- */
function openSheet(html) {
  $('#layer').innerHTML = '<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
  const f = $('#layer .sheet input:not([type=hidden]):not(.sr), #layer .sheet textarea'); if (f && !('ontouchstart' in window)) f.focus();
}
function closeSheet() { $('#layer').innerHTML = ''; }
const sheetOpen = () => !!$('#layer .sheet');

/* ---------- Formular-Hilfen ---------- */
function readWineFields(form) {
  const g = (n) => (form.elements[n] ? form.elements[n].value : '');
  return {
    producer: txt(g('producer')), name: txt(g('name')), grape: txt(g('grape')), vintage: intOrNull(g('vintage')),
    wine_type: g('wine_type') || 'Weißwein', style: txt(g('style')), region: txt(g('region')),
    description: txt(g('description')), my_note: txt(g('my_note'))
  };
}
function captureNewForm() {
  const form = $('form[data-form=new]'); if (!form || !S.form) return;
  const g = (n) => form.elements[n].value;
  S.form.wine = { ...S.form.wine, ...readWineFields(form) };
  S.form.qty = g('qty'); S.form.price = g('price'); S.form.merchant = g('merchant'); S.form.date = g('purchased_on');
}
const findProducer = (name) => name && S.data.producers.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
async function ensureProducer(name, cap) {
  if (!name) return null;
  const p = findProducer(name);
  if (p) {
    if ((p.cap_color || '') !== (cap || '')) await api.patch('producers', { id: 'eq.' + p.id }, { cap_color: cap || null });
    return p.id;
  }
  const [n] = await api.insert('producers', [{ name: name.trim(), cap_color: cap || null }]);
  S.data.producers.push(n);
  return n.id;
}
function syncCapUi(name) {
  const p = findProducer(name);
  if (S.form) S.form.cap = p ? (p.cap_color || '') : (S.form.cap || '');
  $$('.sw').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.c || '') === (S.form ? S.form.cap : ''))));
  const h = $('#cap-hint'); if (h) h.textContent = name ? 'gilt für alle Weine von ' + name + (p ? '' : ' (neues Weingut)') : 'gilt für alle Weine dieses Weinguts';
}

/* ---------- Aktionen ---------- */
const actions = {
  async settings() {
    openSheet(V.settingsSheet(S, S.D));
    // Etiketten zählen (Anzahl und Größe im Speicher), danach nur die Zeile aktualisieren
    try {
      const files = await api.listLabels(uid());
      S.lblStats = { n: files.length, bytes: files.reduce((a, f) => a + f.size, 0) };
    } catch (e) { console.warn('Etiketten', e); S.lblStats = { err: true }; }
    const el = $('#lbl-stats'); if (el) el.innerHTML = V.labelStats(S, S.D);
  },
  close() { closeSheet(); },
  'xl-map'() { S.xl.mapping = !S.xl.mapping; S.xl.keepScroll = false; openSheet(V.xlSheet(S)); S.xl.keepScroll = true; },
  async 'xl-run'() { const j = S.xl.res.j; S.xl = null; await runImport(j); },
  'export-xlsx'() { xlsxDownload('weinkeller-' + today() + '.xlsx', XL.exportSheets(S.D)); },
  pw() { openSheet(V.pwSheet()); },
  wipe() { openSheet(V.wipeSheet(S.D)); },
  logout() { api.signOut(); S.loaded = false; S.data = null; S.urls = {}; closeSheet(); location.hash = '#/'; render(); },
  export() {
    const d = S.data;
    const out = {
      format: 'wine-database', version: 1, exported_at: new Date().toISOString(),
      producers: d.producers.map((p) => ({ name: p.name, cap_color: p.cap_color })),
      wines: d.wines.map((w) => ({ key: w.id, producer: (d.producers.find((p) => p.id === w.producer_id) || {}).name || null, name: w.name, grape: w.grape, wine_type: w.wine_type, style: w.style, region: w.region, vintage: w.vintage, description: w.description, my_note: w.my_note, drink_from: w.drink_from, peak_from: w.peak_from, peak_to: w.peak_to, drink_to: w.drink_to, window_src: w.window_src })),
      purchases: d.purchases.map((p) => ({ wine: p.wine_id, purchased_on: p.purchased_on, merchant: p.merchant, qty: p.qty, price: p.price })),
      drinks: d.drinks.map((x) => ({ wine: x.wine_id, drunk_on: x.drunk_on, qty: x.qty, note: x.note, buy_again: x.buy_again, occasion: x.occasion, rating: x.rating, maturity: x.maturity })),
      wishlist: d.wishlist.map(({ id, user_id, created_at, ...x }) => x), labels: {}
    };
    download('weinkeller-sicherung-' + today() + '.json', JSON.stringify(out, null, 1));
  },
  'clear-q'() { S.q = ''; S.showDrop = false; const i = $('#q'); if (i) { i.value = ''; i.focus(); } renderRegalParts(); },
  chip(el) { const q = el.dataset.q; const on = S.q.trim().toLowerCase() === q.toLowerCase(); S.q = on ? '' : q; S.showDrop = false; const i = $('#q'); if (i) i.value = S.q; renderRegalParts(); },
  'show-shelf'() { addRecent(S.q); S.showDrop = false; const i = $('#q'); if (i) i.blur(); renderRegalParts(); },
  'all-hits'() { addRecent(S.q); S.showDrop = false; location.hash = '#/suche'; },
  'fach-sort'(el) { S.fachSort = el.dataset.k; render(); },
  'drunk-filter'(el) { S.drunkFilter = el.dataset.k; S.drunkLimit = 40; render(); },
  'tl-page'(el) { S.tlPage = Math.max(0, (S.tlPage || 0) + Number(el.dataset.d)); render(); },
  'drunk-more'() { S.drunkLimit += 60; render(); },
  'stat-tab'(el) { S.statTab = el.dataset.k; render(); },
  'clear-dq'() { S.drunkQ = ''; const i = $('#dq'); if (i) { i.value = ''; i.focus(); } const c = $('.dsearch .clr'); if (c) c.classList.add('hidden'); refreshDrunk(); },
  'search-all'() { S.searchAll = !S.searchAll; render(); },
  // Trinktempo (Flaschen pro Jahr): gilt für alle Geräte, gespeichert in „settings“
  tempo(el) { S.tempo = Math.max(4, Math.min(120, S.tempo + Number(el.dataset.d))); S.tempoOwn = true; S.settings = { ...S.settings, tempo: S.tempo }; render(); saveSettings(); },
  'tempo-reset'() { const { tempo, ...rest } = S.settings; S.settings = rest; S.tempoOwn = false; S.tempo = K.suggestedTempo(S.D); render(); saveSettings(); },
  'k-cat'(el) { S.kCat = el.dataset.k; render(); },
  'reife-f'(el) { S.reifeF = el.dataset.k; render(); },
  'reife-edit'(el) { const w = S.D.byId.get(el.dataset.id); S.rw = { id: w.id, v: R.windowOf(w).win.slice() }; openSheet(V.reifeSheet(S, w)); },
  // Werte bleiben geordnet: ab ≤ Höhepunkt ab ≤ Höhepunkt bis ≤ bis
  'rw-step'(el) {
    const i = Number(el.dataset.i), v = S.rw.v.slice(); v[i] += Number(el.dataset.d);
    for (let k = i + 1; k < 4; k++) if (v[k] < v[k - 1]) v[k] = v[k - 1];
    for (let k = i - 1; k >= 0; k--) if (v[k] > v[k + 1]) v[k] = v[k + 1];
    if (v[0] < 1950 || v[3] > 2100) return;
    S.rw.v = v; const y = $('#layer .sheet').scrollTop; openSheet(V.reifeSheet(S, S.D.byId.get(S.rw.id))); $('#layer .sheet').scrollTop = y;
  },
  'rw-reset'() { const w = S.D.byId.get(S.rw.id); S.rw.v = R.estimate(w); openSheet(V.reifeSheet(S, w)); },
  'nw-tier'(el) { captureNewForm(); S.form.tier = S.form.tier === el.dataset.k ? null : el.dataset.k; refreshNewReife(); },
  'fach-mode'(el) { S.fachMode = el.dataset.k; render(); },
  'wj-cat'(el) { S.wjCat = el.dataset.k; S.wjMore = false; render(); },
  'wj-more'() { S.wjMore = !S.wjMore; render(); },
  'year-hide'() { S.yearCardHidden = V.reviewYear(); savePrefs(); render(); toast('Rückblick ausgeblendet – du findest ihn in der Statistik'); },
  metric(el) { S.metric = { ...(S.metric || {}), [el.dataset.g]: el.dataset.k }; render(); },
  expand(el) { const k = el.dataset.k; if (S.expand.has(k)) S.expand.delete(k); else S.expand.add(k); render(); },
  cap(el) { if (!S.form) S.form = blankForm(); S.form.cap = el.dataset.c || ''; $$('.sw').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); },
  'buy-again'(el) { const k = el.dataset.k; S.form.buyAgain = S.form.buyAgain === k ? null : k; $$('.opts[data-grp=again] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === S.form.buyAgain))); },
  maturity(el) { const k = el.dataset.k; S.form.maturity = S.form.maturity === k ? null : k; $$('.opts[data-grp=maturity] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === S.form.maturity))); const h = $('#mat-hint'); if (h) h.textContent = V.maturityHint(S.form.maturity, Number(h.dataset.left)); },
  // Sterne: erneutes Tippen auf denselben Stern nimmt die Bewertung zurück
  rate(el) { const n = Number(el.dataset.n); S.form.rating = S.form.rating === n ? null : n; const box = el.closest('.stars'); if (box) box.outerHTML = V.starsInput(S.form.rating); },
  drink(el) { const w = S.D.byId.get(el.dataset.id); S.form = { ...(S.form || {}), buyAgain: null, rating: null, maturity: null }; openSheet(V.drinkSheet(S, w)); },
  purchase(el) { openSheet(V.purchaseSheet(S, S.D, S.D.byId.get(el.dataset.id))); },
  'edit-wine'(el) { const w = S.D.byId.get(el.dataset.id); S.form = { ...(S.form || blankForm()), cap: w.cap_color || '' }; openSheet(V.editSheet(S, S.D, w)); },
  async 'del-wine'(el) {
    const w = S.D.byId.get(el.dataset.id);
    if (!confirm('„' + w.name + '“ mit allen Käufen und Getrunken-Einträgen löschen?')) return;
    await guard(async () => {
      await api.remove('wines', { id: 'eq.' + w.id });
      if (w.label_path) api.deleteLabels([w.label_path]).catch(() => {});
      toast('Wein gelöscht'); await load(); location.hash = S.backHref && !S.backHref.includes('/wein/') ? S.backHref : '#/regal';
    });
  },
  async 'del-purchase'(el) { if (!confirm('Diesen Kauf löschen?')) return; await guard(async () => { await api.remove('purchases', { id: 'eq.' + el.dataset.id }); closeSheet(); await reload(); toast('Kauf gelöscht'); }); },
  async 'del-drink'(el) { if (!confirm('Diesen Getrunken-Eintrag löschen?')) return; await guard(async () => { await api.remove('drinks', { id: 'eq.' + el.dataset.id }); closeSheet(); await reload(); toast('Eintrag gelöscht'); }); },
  'edit-drink'(el) {
    const d = S.data.drinks.find((x) => x.id === el.dataset.id); if (!d) return;
    S.form = { ...(S.form || {}), buyAgain: d.buy_again || null, rating: d.rating || null, maturity: d.maturity || null };
    openSheet(V.drinkSheet(S, S.D.byId.get(d.wine_id), d));
  },
  'edit-purchase'(el) {
    const p = S.data.purchases.find((x) => x.id === el.dataset.id); if (!p) return;
    openSheet(V.purchaseSheet(S, S.D, S.D.byId.get(p.wine_id), p));
  },
  'wish-new'() { openSheet(V.wishSheet(S.D)); },
  'wish-edit'(el) { openSheet(V.wishSheet(S.D, S.data.wishlist.find((x) => x.id === el.dataset.id))); },
  async 'wish-del'(el) { if (!confirm('Von der Wunschliste löschen?')) return; await guard(async () => { await api.remove('wishlist', { id: 'eq.' + el.dataset.id }); closeSheet(); await reload(); }); },
  'wish-take'(el) {
    const x = S.data.wishlist.find((y) => y.id === el.dataset.id);
    const p = findProducer(x.producer);
    S.form = { ...blankForm(), wishId: x.id, keep: true, price: x.price != null ? String(x.price).replace('.', ',') : '', merchant: x.merchant || '', cap: p ? (p.cap_color || '') : '',
      wine: { producer: x.producer, name: x.name, grape: x.grape, vintage: x.vintage, region: x.region, wine_type: x.wine_type || 'Weißwein', my_note: x.note } };
    location.hash = '#/neu';
  }
};

/* ---------- Formulare ---------- */
const forms = {
  async pw(f) {
    const [p0, p1, p2] = ['pw0', 'pw1', 'pw2'].map((k) => f.elements[k].value);
    if (p1 !== p2) { openSheet(V.pwSheet('Die neuen Passwörter stimmen nicht überein.')); return; }
    if (p1.length < 8) { openSheet(V.pwSheet('Bitte mindestens 8 Zeichen.')); return; }
    try { await api.changePassword(p0, p1); } catch (e) { openSheet(V.pwSheet(errMsg(e))); return; }
    closeSheet(); toast('Passwort geändert');
  },
  async wipe(f) {
    if (f.elements.ok.value.trim().toUpperCase() !== 'LÖSCHEN') { toast('Bitte LÖSCHEN eintippen', true); return; }
    openSheet(V.progressSheet('Daten werden gelöscht', 'Etiketten …', 10));
    try {
      const own = { user_id: 'eq.' + uid() };
      const labels = S.data.wines.map((w) => w.label_path).filter(Boolean);
      for (let i = 0; i < labels.length; i += 100) await api.deleteLabels(labels.slice(i, i + 100));
      for (const [t, pct] of [['drinks', 30], ['purchases', 50], ['wines', 70], ['producers', 85], ['wishlist', 92], ['settings', 97]]) {
        const tx = $('#prog-text'), b = $('#prog-bar'); if (tx) tx.textContent = 'Lösche ' + t + ' …'; if (b) b.style.width = pct + '%';
        await api.remove(t, own);
      }
      S.urls = {}; await load(); closeSheet(); location.hash = '#/'; render(); toast('Alle Daten gelöscht');
    } catch (e) { console.error(e); closeSheet(); toast('Löschen abgebrochen: ' + errMsg(e), true); await guard(reload); }
  },
  async login(f) {
    S.email = f.elements.email.value.trim(); S.loginBusy = true; S.loginError = ''; render();
    try { await api.signIn(S.email, f.elements.password.value); S.loginBusy = false; await load(); onRoute(); }
    catch (e) { S.loginBusy = false; S.loginError = errMsg(e); render(); }
  },
  async new(f) {
    captureNewForm();
    const w = S.form.wine;
    if (!w.name) { toast('Bitte einen Namen für den Wein eingeben', true); f.elements.name.focus(); return; }
    S.busy = true; render();
    const ok = await guard(async () => {
      const producer_id = await ensureProducer(w.producer, S.form.cap);
      const id = uuid();
      let label_path = null;
      if (S.form.photoBlob) { label_path = uid() + '/' + id + '-' + Date.now() + '.jpg'; await api.uploadLabel(label_path, S.form.photoBlob); }
      const { producer, ...cols } = w;
      const win = R.estimate({ ...w, price: numOrNull(S.form.price), firstBought: S.form.date }, S.form.tier);
      await api.insert('wines', [{ id, producer_id, ...cols, label_path, drink_from: win[0], peak_from: win[1], peak_to: win[2], drink_to: win[3], window_src: 'est' }]);
      const qty = intOrNull(S.form.qty);
      if (qty && qty > 0) await api.insert('purchases', [{ wine_id: id, qty, price: numOrNull(S.form.price), merchant: txt(S.form.merchant), purchased_on: S.form.date || null }]);
      if (S.form.wishId) await api.remove('wishlist', { id: 'eq.' + S.form.wishId });
      return id;
    });
    S.busy = false;
    if (!ok) { render(); return; }
    if (S.form.photoUrl) URL.revokeObjectURL(S.form.photoUrl);
    S.form = null; await load(); toast('Wein gespeichert'); location.hash = '#/wein/' + ok;
  },
  async edit(f) {
    const w = readWineFields(f);
    if (!w.name) { toast('Bitte einen Namen eingeben', true); return; }
    await guard(async () => {
      const producer_id = await ensureProducer(w.producer, S.form.cap);
      const { producer, ...cols } = w;
      await api.patch('wines', { id: 'eq.' + f.dataset.id }, { producer_id, ...cols });
      closeSheet(); await reload(); toast('Gespeichert');
    });
  },
  async drink(f) {
    const w = S.D.byId.get(f.dataset.id), did = f.dataset.did;
    const old = did ? S.data.drinks.find((x) => x.id === did) : null;
    const max = Math.max(1, w.stock + (old ? old.qty : 0));
    const qty = Math.max(1, Math.min(intOrNull(f.elements.qty.value) || 1, max));
    const row = { qty, drunk_on: f.elements.drunk_on.value || null, note: txt(f.elements.note.value), occasion: txt(f.elements.occasion.value), buy_again: S.form.buyAgain || null, rating: S.form.rating || null, maturity: S.form.maturity || null };
    await guard(async () => {
      if (did) await api.patch('drinks', { id: 'eq.' + did }, row);
      else await api.insert('drinks', [{ wine_id: w.id, ...row }]);
      // Reife-Notiz passt das Fenster der übrigen Flaschen an (nicht bei eigener Angabe)
      const left = w.stock - (old ? 0 : qty), cur = R.windowOf(w);
      const nw = row.maturity && (!old || old.maturity !== row.maturity) && left > 0 && cur.src !== 'own' ? R.adjust(cur.win, row.maturity, Number(String(row.drunk_on || '').slice(0, 4)) || R.nowYear()) : null;
      const changed = nw && nw.join() !== cur.win.join();
      if (changed) await api.patch('wines', { id: 'eq.' + w.id }, { drink_from: nw[0], peak_from: nw[1], peak_to: nw[2], drink_to: nw[3], window_src: 'note' });
      closeSheet(); await reload();
      toast(changed ? 'Gespeichert · Trinkfenster jetzt ' + nw[0] + '–' + nw[3] : did ? 'Eintrag aktualisiert' : 'Zum Wohl! Eintrag gespeichert');
    });
  },
  async reife(f) {
    const w = S.D.byId.get(f.dataset.id), v = S.rw.v, est = R.estimate(w);
    const src = v.join() === est.join() ? 'est' : 'own';
    await guard(async () => {
      await api.patch('wines', { id: 'eq.' + w.id }, { drink_from: v[0], peak_from: v[1], peak_to: v[2], drink_to: v[3], window_src: src });
      closeSheet(); await reload(); toast(src === 'own' ? 'Trinkfenster gespeichert' : 'Zurück auf die Schätzung');
    });
  },
  async purchase(f) {
    const qty = intOrNull(f.elements.qty.value);
    if (!qty || qty < 1) { toast('Bitte eine Anzahl eingeben', true); return; }
    const row = { qty, price: numOrNull(f.elements.price.value), merchant: txt(f.elements.merchant.value), purchased_on: f.elements.purchased_on.value || null };
    await guard(async () => {
      if (f.dataset.pid) await api.patch('purchases', { id: 'eq.' + f.dataset.pid }, row);
      else await api.insert('purchases', [{ wine_id: f.dataset.id, ...row }]);
      closeSheet(); await reload(); toast(f.dataset.pid ? 'Kauf aktualisiert' : 'Kauf gespeichert');
    });
  },
  async wish(f) {
    const g = (n) => f.elements[n].value;
    const row = { producer: txt(g('producer')), name: txt(g('name')), grape: txt(g('grape')), vintage: intOrNull(g('vintage')), region: txt(g('region')), price: numOrNull(g('price')), idea_source: txt(g('idea_source')), merchant: txt(g('merchant')), url: txt(g('url')), note: txt(g('note')) };
    if (!row.name) { toast('Bitte einen Namen eingeben', true); return; }
    await guard(async () => {
      if (f.dataset.id) await api.patch('wishlist', { id: 'eq.' + f.dataset.id }, row); else await api.insert('wishlist', [row]);
      closeSheet(); await reload(); toast('Wunschliste aktualisiert');
    });
  }
};

/* ---------- Dateien ---------- */
const changes = {
  async photo(input) {
    const file = input.files && input.files[0]; if (!file) return;
    captureNewForm();
    const blob = await guard(() => shrinkImage(file));
    if (!blob) return;
    if (S.form.photoUrl) URL.revokeObjectURL(S.form.photoUrl);
    S.form.photoBlob = blob; S.form.photoUrl = URL.createObjectURL(blob);
    render();
  },
  async label(input) {
    const file = input.files && input.files[0]; if (!file) return;
    const w = S.D.byId.get(input.dataset.id);
    await guard(async () => {
      toast('Etikett wird gespeichert …');
      const blob = await shrinkImage(file);
      const path = uid() + '/' + w.id + '-' + Date.now() + '.jpg';
      await api.uploadLabel(path, blob);
      await api.patch('wines', { id: 'eq.' + w.id }, { label_path: path });
      if (w.label_path) api.deleteLabels([w.label_path]).catch(() => {});
      await reload(); toast('Etikett gespeichert');
    });
  },
  // Excel-Zuordnung: Blatt bzw. Spalte geändert → Vorschau neu berechnen
  'xl-sheet'(el) { XL.setSheet(S.xl.book, S.xl.plan, el.dataset.role, el.value); xlRebuild(); },
  'xl-col'(el) { const m = S.xl.plan.maps[el.dataset.role]; if (el.value === '') delete m[el.dataset.f]; else m[el.dataset.f] = Number(el.value); xlRebuild(); },
  async import(input) {
    const file = input.files && input.files[0]; if (!file) return;
    if (!/\.json$/i.test(file.name) && file.type !== 'application/json') return startExcel(file);
    let j;
    try { j = JSON.parse(await file.text()); } catch { toast('Die Datei ist kein gültiges JSON', true); return; }
    if (!j || j.format !== 'wine-database' || !Array.isArray(j.wines)) { toast('Keine Wine-Database-Importdatei', true); return; }
    if (S.data.wines.length && j.wines.length && !confirm('Du hast bereits ' + S.data.wines.length + ' Weine. Der Import fügt alle Einträge zusätzlich hinzu. Fortfahren?')) return;
    await runImport(j);
  }
};

/* ---------- Excel-Import ---------- */
async function startExcel(file) {
  let book;
  try {
    book = /\.csv$/i.test(file.name) || file.type === 'text/csv' ? readCsv(await file.text()) : await readXlsx(await file.arrayBuffer());
  } catch (e) { console.error(e); toast(/xlsx|Excel|Browser/.test(errMsg(e)) ? errMsg(e) : 'Die Datei konnte nicht gelesen werden', true); return; }
  S.xl = { name: file.name, book, plan: XL.analyse(book), mapping: false };
  xlRebuild(); S.xl.keepScroll = true;
}
function xlRebuild() {
  const existing = { wines: S.D.wines.map((w) => ({ producer: w.producer, name: w.name, vintage: w.vintage })), wishlist: S.data.wishlist };
  S.xl.res = XL.build(S.xl.book, S.xl.plan, existing);
  const box = $('#layer .sheet'), y = box ? box.scrollTop : 0;
  openSheet(V.xlSheet(S));
  const nb = $('#layer .sheet'); if (nb && S.xl.keepScroll) nb.scrollTop = y;
}
function xlsxDownload(name, sheets) {
  const blob = writeXlsx(sheets), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

async function runImport(j) {
  const steps = j.wines.length + Object.keys(j.labels || {}).length + 4;
  let done = 0;
  openSheet(V.progressSheet('Import läuft', 'Vorbereiten …', 0));
  const prog = (text) => { done++; const t = $('#prog-text'), b = $('#prog-bar'); if (t) t.textContent = text; if (b) b.style.width = Math.min(100, done / steps * 100).toFixed(0) + '%'; };
  const chunk = async (table, rows) => { for (let i = 0; i < rows.length; i += 200) await api.insert(table, rows.slice(i, i + 200)); };
  try {
    // Weingüter
    const prodId = new Map(S.data.producers.map((p) => [p.name.trim().toLowerCase(), p.id]));
    const newProd = [];
    const names = new Set([...(j.producers || []).map((p) => p.name), ...j.wines.map((w) => w.producer)].filter(Boolean).map((n) => n.trim()));
    for (const n of names) if (!prodId.has(n.toLowerCase())) {
      const src = (j.producers || []).find((p) => p.name && p.name.trim().toLowerCase() === n.toLowerCase());
      newProd.push({ name: n, cap_color: (src && src.cap_color) || null });
    }
    for (let i = 0; i < newProd.length; i += 200) {
      const res = await api.insert('producers', newProd.slice(i, i + 200));
      for (const p of res) prodId.set(p.name.trim().toLowerCase(), p.id);
    }
    prog('Weingüter angelegt');
    // Etiketten hochladen
    const wineId = new Map(j.wines.map((w) => [String(w.key), uuid()]));
    const labelPath = new Map();
    const labels = j.labels || {};
    const queue = j.wines.filter((w) => w.label && labels[w.label]);
    let failed = 0;
    for (let i = 0; i < queue.length; i += 4) {
      await Promise.all(queue.slice(i, i + 4).map(async (w) => {
        const L = labels[w.label], ext = /png/.test(L.type) ? 'png' : 'jpg';
        const path = uid() + '/' + wineId.get(String(w.key)) + '.' + ext;
        try { await api.uploadLabel(path, b64ToBlob(L.data, L.type)); labelPath.set(String(w.key), path); }
        catch (e) { failed++; console.warn('Etikett', w.name, e); }
        prog('Etiketten: ' + labelPath.size + ' von ' + queue.length);
      }));
    }
    // Weine
    // Trinkfenster: aus der Datei (eigene Angabe) oder Regel-Schätzung mit Preis und erstem Kaufdatum
    const pinfo = new Map();
    for (const p of j.purchases || []) {
      const o = pinfo.get(String(p.wine)) || { q: 0, s: 0, d: null }; pinfo.set(String(p.wine), o);
      if (p.price != null) { o.q += p.qty || 0; o.s += (p.qty || 0) * Number(p.price); }
      if (p.purchased_on && (!o.d || p.purchased_on < o.d)) o.d = p.purchased_on;
    }
    const winOf = (w) => {
      if (Array.isArray(w.drink)) return { win: w.drink, src: 'own' };
      if (w.drink_from && w.drink_to) return { win: [w.drink_from, w.peak_from || w.drink_from, w.peak_to || w.drink_to, w.drink_to], src: w.window_src || 'est' };
      const o = pinfo.get(String(w.key)) || {};
      return { win: R.estimate({ ...w, price: o.q ? o.s / o.q : null, firstBought: o.d }), src: 'est' };
    };
    const wines = j.wines.map((w) => {
      const { win, src } = winOf(w);
      return {
        id: wineId.get(String(w.key)), producer_id: w.producer ? prodId.get(w.producer.trim().toLowerCase()) || null : null,
        name: w.name, grape: w.grape || null, wine_type: w.wine_type || 'Weißwein', style: w.style || null, region: w.region || null,
        vintage: w.vintage || null, description: w.description || null, my_note: w.my_note || null, label_path: labelPath.get(String(w.key)) || null,
        drink_from: win[0], peak_from: win[1], peak_to: win[2], drink_to: win[3], window_src: src
      };
    });
    await chunk('wines', wines); for (let i = 0; i < j.wines.length; i++) done++; prog('Weine angelegt');
    const wid = (k) => wineId.get(String(k));
    await chunk('purchases', (j.purchases || []).filter((p) => wid(p.wine)).map((p) => ({ wine_id: wid(p.wine), purchased_on: p.purchased_on || null, merchant: p.merchant || null, qty: p.qty, price: p.price == null ? null : p.price })));
    await chunk('drinks', (j.drinks || []).filter((d) => wid(d.wine)).map((d) => ({ wine_id: wid(d.wine), drunk_on: d.drunk_on || null, qty: d.qty || 1, note: d.note || null, buy_again: d.buy_again || null, occasion: d.occasion || null, rating: d.rating || null, maturity: d.maturity || null })));
    prog('Käufe und Getrunken-Einträge angelegt');
    if ((j.wishlist || []).length) await chunk('wishlist', j.wishlist.map((x) => ({ producer: x.producer || null, name: x.name, grape: x.grape || null, wine_type: x.wine_type || null, region: x.region || null, vintage: x.vintage || null, idea_source: x.idea_source || null, merchant: x.merchant || null, price: x.price == null ? null : x.price, url: x.url || null, note: x.note || null })));
    prog('Wunschliste angelegt');
    await load(); closeSheet(); render();
    const parts = [];
    if (j.wines.length) parts.push(j.wines.length + ' Weine');
    if ((j.wishlist || []).length) parts.push(j.wishlist.length + ' Wünsche');
    toast((parts.join(' und ') || 'Nichts') + ' importiert' + (failed ? ' · ' + failed + ' Etiketten fehlgeschlagen' : ''), failed > 0);
  } catch (e) {
    console.error(e); closeSheet(); toast('Import abgebrochen: ' + errMsg(e), true); await guard(reload);
  }
}

/* ---------- Ereignisse ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const fn = actions[el.dataset.act]; if (!fn) return;
  ev.preventDefault(); guard(() => fn(el));
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('form[data-form]'); if (!f) return;
  ev.preventDefault(); const fn = forms[f.dataset.form]; if (fn) guard(() => fn(f));
});
document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-change]'); if (!el) return;
  const fn = changes[el.dataset.change]; if (fn) guard(() => fn(el)).finally(() => { if (el.type === 'file') el.value = ''; });
});
const refreshShelf = debounce(() => renderRegalParts(), 90);
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'q') { S.q = t.value; S.showDrop = !!t.value.trim(); refreshShelf(); return; }
  if (t.id === 'dq') { S.drunkQ = t.value; S.drunkLimit = 40; const c = t.parentElement.querySelector('.clr'); if (c) c.classList.toggle('hidden', !t.value); refreshDrunk(); return; }
  if (t.dataset && t.dataset.input === 'producer') syncCapUi(t.value);
  // Weinart Champagner: Rebsorte einheitlich „Champagner“, falls noch leer
  if (t.name === 'wine_type' && t.value === 'Champagner' && t.form && t.form.elements.grape && !t.form.elements.grape.value.trim()) t.form.elements.grape.value = 'Champagner';
  if (t.closest && t.closest('form[data-form=new]') && ['name', 'vintage', 'grape', 'wine_type', 'style', 'price', 'purchased_on'].includes(t.name)) refreshNewReifeSoon();
  if (t.closest && t.closest('form[data-form=new]') && ['producer', 'name', 'vintage'].includes(t.name)) {
    const box = $('#shop-links'); const f = t.form;
    if (box) box.innerHTML = V.shopLinks({ producer: f.elements.producer.value, name: f.elements.name.value, vintage: f.elements.vintage.value });
  }
});
document.addEventListener('keydown', (ev) => {
  if (ev.target.id === 'dq' && ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); return; }
  if (ev.target.id === 'q' && ev.key === 'Enter') { ev.preventDefault(); addRecent(S.q); S.showDrop = false; ev.target.blur(); renderRegalParts(); }
  if (ev.key === 'Escape' && sheetOpen()) closeSheet();
});
document.addEventListener('focusin', (ev) => { if (ev.target.id === 'q' && S.q.trim()) { S.showDrop = true; renderRegalParts(); } });
window.addEventListener('hashchange', onRoute);
// iPad drehen: ab 800 pt Breite und 600 pt Höhe – iPhone quer bleibt beim Telefon-Layout breites Layout (Seitenleiste, geteilte Ansichten) – Ansicht neu aufbauen
const WIDE = window.matchMedia('(min-width: 800px) and (min-height: 600px)');
S.wide = WIDE.matches;
WIDE.addEventListener('change', (e) => {
  S.wide = e.matches;
  if (!S.loaded || !api.isLoggedIn()) return;
  if (S.route.name === 'neu') captureNewForm();
  render();
});

/* ---------- Start ---------- */
(async function start() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (api.isLoggedIn()) {
    S.email = api.getSession().user.email;
    render();
    await guard(load);
    if (!api.isLoggedIn()) { render(); return; }
  }
  onRoute();
})();
