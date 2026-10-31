// Hauptprogramm: Zustand, Routing, Daten laden, Aktionen
import * as api from './api.js';
import { $, $$, esc, today, debounce, uuid, download, shrinkImage, b64ToBlob } from './util.js';
import { derive, faecher, matcher, topSearches, CAP_COLORS } from './model.js';
import * as V from './views.js';

const PREFS = 'wd_prefs_v1';
const S = {
  email: '', loginError: '', loginBusy: false,
  data: null, D: null, urls: {}, loaded: false,
  route: { name: 'home', arg: '' }, prevHash: '',
  q: '', showDrop: false, recent: [], fachSort: 'stock',
  drunkFilter: 'all', drunkLimit: 40, statTab: 'stock',
  form: null, busy: false, backHref: '#/regal', backLabel: 'Weinregal'
};
try { const p = JSON.parse(localStorage.getItem(PREFS) || '{}'); if (Array.isArray(p.recent)) S.recent = p.recent.slice(0, 3); } catch { /* egal */ }
const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify({ recent: S.recent })); } catch { /* egal */ } };

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
  const map = { '': 'home', regal: 'regal', fach: 'fach', suche: 'search', wein: 'wine', getrunken: 'drunk', neu: 'neu', statistik: 'stats', vorschlaege: 'reco', wunschliste: 'wish' };
  return { name: map[parts[0]] || 'home', arg: parts[1] || '', params };
}
const BACK_LABEL = { home: 'Übersicht', regal: 'Weinregal', search: 'Suche', drunk: 'Getrunken', reco: 'Vorschläge', stats: 'Statistik' };
function onRoute() {
  const r = parseHash();
  const prev = S.route;
  if (r.name === 'wine' && prev.name !== 'wine') {
    S.backHref = S.prevHash || '#/regal';
    S.backLabel = prev.name === 'fach' ? 'Fach ' + prev.arg : (BACK_LABEL[prev.name] || 'Zurück');
  }
  if (r.name === 'regal' && r.params.get('q') != null) { S.q = r.params.get('q'); S.showDrop = false; }
  if (r.name === 'neu' && (!S.form || !S.form.keep)) S.form = blankForm();
  if (S.form) S.form.keep = false;
  if (r.name === 'drunk' && prev.name !== 'drunk') S.drunkLimit = 40;
  S.route = r; S.prevHash = location.hash || '#/';
  closeSheet();
  render(true);
  if (r.name === 'regal' && r.params.get('focus')) { const i = $('#q'); if (i) i.focus(); }
}

/* ---------- Rendern ---------- */
function render(top) {
  const app = $('#app');
  if (!api.isLoggedIn()) { app.innerHTML = V.loginView(S.loginError, S.loginBusy, S.email); return; }
  if (!S.loaded) { app.innerHTML = '<p class="empty">Lädt …</p>'; return; }
  const y = window.scrollY, D = S.D, r = S.route;
  let html = '', tab = 'home';
  if (r.name === 'regal') html = V.regalView(S, D);
  else if (r.name === 'fach') html = V.fachView(S, D, r.arg, faecher(D).find((f) => f.name === r.arg)?.wines || [], false);
  else if (r.name === 'search') { const m = matcher(S.q); html = V.fachView(S, D, '„' + S.q.trim() + '“', m ? D.wines.filter((w) => w.stock > 0 && m(w)) : [], true); }
  else if (r.name === 'wine') { const w = D.byId.get(r.arg); html = w ? V.detailView(S, D, w) : '<div class="empty"><b>Wein nicht gefunden</b></div>'; }
  else if (r.name === 'drunk') html = V.drunkView(S, D);
  else if (r.name === 'neu') { html = V.newView(S, D); tab = 'neu'; }
  else if (r.name === 'stats') { html = V.statsView(S, D); tab = 'stats'; }
  else if (r.name === 'reco') { html = V.recoView(S, D); tab = 'reco'; }
  else if (r.name === 'wish') { html = V.wishView(S, D); tab = 'wish'; }
  else html = V.homeView(S, D);
  app.innerHTML = html + V.nav(tab);
  if (r.name === 'regal') renderRegalParts();
  window.scrollTo(0, top ? 0 : y);
}
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
  async settings() { openSheet(V.settingsSheet(S, S.D)); },
  close() { closeSheet(); },
  logout() { api.signOut(); S.loaded = false; S.data = null; S.urls = {}; closeSheet(); location.hash = '#/'; render(); },
  export() {
    const d = S.data;
    const out = {
      format: 'wine-database', version: 1, exported_at: new Date().toISOString(),
      producers: d.producers.map((p) => ({ name: p.name, cap_color: p.cap_color })),
      wines: d.wines.map((w) => ({ key: w.id, producer: (d.producers.find((p) => p.id === w.producer_id) || {}).name || null, name: w.name, grape: w.grape, wine_type: w.wine_type, style: w.style, region: w.region, vintage: w.vintage, description: w.description, my_note: w.my_note })),
      purchases: d.purchases.map((p) => ({ wine: p.wine_id, purchased_on: p.purchased_on, merchant: p.merchant, qty: p.qty, price: p.price })),
      drinks: d.drinks.map((x) => ({ wine: x.wine_id, drunk_on: x.drunk_on, qty: x.qty, note: x.note, buy_again: x.buy_again, occasion: x.occasion })),
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
  'drunk-more'() { S.drunkLimit += 60; render(); },
  'stat-tab'(el) { S.statTab = el.dataset.k; render(); },
  'buy-metric'(el) { S.buyMetric = el.dataset.k; render(); },
  cap(el) { if (!S.form) S.form = blankForm(); S.form.cap = el.dataset.c || ''; $$('.sw').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); },
  'buy-again'(el) { const k = el.dataset.k; S.form.buyAgain = S.form.buyAgain === k ? null : k; $$('.opts button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === S.form.buyAgain))); },
  drink(el) { const w = S.D.byId.get(el.dataset.id); S.form = { ...(S.form || {}), buyAgain: null }; openSheet(V.drinkSheet(S, w)); },
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
  async 'del-purchase'(el) { if (!confirm('Diesen Kauf löschen?')) return; await guard(async () => { await api.remove('purchases', { id: 'eq.' + el.dataset.id }); await reload(); toast('Kauf gelöscht'); }); },
  async 'del-drink'(el) { if (!confirm('Diesen Getrunken-Eintrag löschen?')) return; await guard(async () => { await api.remove('drinks', { id: 'eq.' + el.dataset.id }); await reload(); toast('Eintrag gelöscht'); }); },
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
      await api.insert('wines', [{ id, producer_id, ...cols, label_path }]);
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
    const w = S.D.byId.get(f.dataset.id);
    const qty = Math.max(1, Math.min(intOrNull(f.elements.qty.value) || 1, Math.max(1, w.stock)));
    await guard(async () => {
      await api.insert('drinks', [{ wine_id: w.id, qty, drunk_on: f.elements.drunk_on.value || null, note: txt(f.elements.note.value), occasion: txt(f.elements.occasion.value), buy_again: S.form.buyAgain || null }]);
      closeSheet(); await reload(); toast('Zum Wohl! Eintrag gespeichert');
    });
  },
  async purchase(f) {
    const qty = intOrNull(f.elements.qty.value);
    if (!qty || qty < 1) { toast('Bitte eine Anzahl eingeben', true); return; }
    await guard(async () => {
      await api.insert('purchases', [{ wine_id: f.dataset.id, qty, price: numOrNull(f.elements.price.value), merchant: txt(f.elements.merchant.value), purchased_on: f.elements.purchased_on.value || null }]);
      closeSheet(); await reload(); toast('Kauf gespeichert');
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
  async import(input) {
    const file = input.files && input.files[0]; if (!file) return;
    let j;
    try { j = JSON.parse(await file.text()); } catch { toast('Die Datei ist kein gültiges JSON', true); return; }
    if (!j || j.format !== 'wine-database' || !Array.isArray(j.wines)) { toast('Keine Wine-Database-Importdatei', true); return; }
    if (S.data.wines.length && j.wines.length && !confirm('Du hast bereits ' + S.data.wines.length + ' Weine. Der Import fügt alle Einträge zusätzlich hinzu. Fortfahren?')) return;
    await runImport(j);
  }
};

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
    const wines = j.wines.map((w) => ({
      id: wineId.get(String(w.key)), producer_id: w.producer ? prodId.get(w.producer.trim().toLowerCase()) || null : null,
      name: w.name, grape: w.grape || null, wine_type: w.wine_type || 'Weißwein', style: w.style || null, region: w.region || null,
      vintage: w.vintage || null, description: w.description || null, my_note: w.my_note || null, label_path: labelPath.get(String(w.key)) || null
    }));
    await chunk('wines', wines); for (let i = 0; i < j.wines.length; i++) done++; prog('Weine angelegt');
    const wid = (k) => wineId.get(String(k));
    await chunk('purchases', (j.purchases || []).filter((p) => wid(p.wine)).map((p) => ({ wine_id: wid(p.wine), purchased_on: p.purchased_on || null, merchant: p.merchant || null, qty: p.qty, price: p.price == null ? null : p.price })));
    await chunk('drinks', (j.drinks || []).filter((d) => wid(d.wine)).map((d) => ({ wine_id: wid(d.wine), drunk_on: d.drunk_on || null, qty: d.qty || 1, note: d.note || null, buy_again: d.buy_again || null, occasion: d.occasion || null })));
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
  const fn = changes[el.dataset.change]; if (fn) guard(() => fn(el)).finally(() => { el.value = ''; });
});
const refreshShelf = debounce(() => renderRegalParts(), 90);
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'q') { S.q = t.value; S.showDrop = !!t.value.trim(); refreshShelf(); return; }
  if (t.dataset && t.dataset.input === 'producer') syncCapUi(t.value);
  if (t.closest && t.closest('form[data-form=new]') && ['producer', 'name', 'vintage'].includes(t.name)) {
    const box = $('#shop-links'); const f = t.form;
    if (box) box.innerHTML = V.shopLinks({ producer: f.elements.producer.value, name: f.elements.name.value, vintage: f.elements.vintage.value });
  }
});
document.addEventListener('keydown', (ev) => {
  if (ev.target.id === 'q' && ev.key === 'Enter') { ev.preventDefault(); addRecent(S.q); S.showDrop = false; ev.target.blur(); renderRegalParts(); }
  if (ev.key === 'Escape' && sheetOpen()) closeSheet();
});
document.addEventListener('focusin', (ev) => { if (ev.target.id === 'q' && S.q.trim()) { S.showDrop = true; renderRegalParts(); } });
window.addEventListener('hashchange', onRoute);

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
