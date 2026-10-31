// Kleine Hilfsfunktionen
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

const p2 = (n) => String(n).padStart(2, '0');
export const fmtDate = (d) => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
export const today = () => fmtDate(new Date());
export const parseDate = (s) => new Date(String(s).slice(0, 10) + 'T12:00:00');
export const deDate = (s) => (s ? parseDate(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
export const deDayMonth = (s) => (s ? parseDate(s).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' }) : '');
export const yearOf = (s) => (s ? String(s).slice(0, 4) : '');

export const num = (n, digits = 0) => Number(n || 0).toLocaleString('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const eur = (n, digits) => {
  const v = Number(n || 0);
  const d = digits != null ? digits : (Math.abs(v) >= 1000 || Number.isInteger(v) ? 0 : 2);
  return num(v, d) + ' €';
};
export const eur2 = (n) => num(n, 2) + ' €';
export const fl = (n) => num(n) + ' Fl.';
export const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : many);

export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
}));

export function download(filename, text, type = 'application/json;charset=utf-8') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Foto verkleinern (lange Kante max. 1200 px) und als JPEG liefern
export async function shrinkImage(file, max = 1200, quality = 0.82) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
  } finally { URL.revokeObjectURL(url); }
}
export function b64ToBlob(b64, type) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type });
}
