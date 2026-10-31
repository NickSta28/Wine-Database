// Schlanker Supabase-Client (Login, Datenbank, Etiketten-Speicher) ohne Fremdbibliothek.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const SKEY = 'wd_session_v1';
let session = null;
try { session = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch { session = null; }

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export const getSession = () => session;
export const isLoggedIn = () => !!(session && session.refresh_token);

function saveSession(s) {
  session = s;
  try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch { /* privater Modus */ }
}
function fromAuth(j) {
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (j.expires_in || 3600),
    user: { id: j.user.id, email: j.user.email }
  };
}
async function authCall(grant, body) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=' + grant, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const m = j.error_description || j.msg || j.message || '';
    throw new ApiError(/invalid login/i.test(m) ? 'E-Mail oder Passwort falsch' : (m || 'Anmeldung fehlgeschlagen'), r.status);
  }
  return fromAuth(j);
}
export async function signIn(email, password) {
  saveSession(await authCall('password', { email, password }));
  return session;
}
export function signOut() { saveSession(null); }

let refreshing = null;
async function refresh() {
  if (!session) throw new ApiError('Nicht angemeldet', 401);
  if (!refreshing) {
    refreshing = authCall('refresh_token', { refresh_token: session.refresh_token })
      .then((s) => { saveSession(s); })
      .catch((e) => { if (e.status === 400 || e.status === 401) saveSession(null); throw e; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}
async function fresh() { if (session && session.expires_at - 30 < Date.now() / 1000) await refresh(); }

async function req(method, path, { query, body, headers = {} } = {}) {
  const qs = query ? '?' + new URLSearchParams(query).toString() : '';
  for (let attempt = 0; attempt < 2; attempt++) {
    await fresh();
    const h = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...headers };
    if (session) h.Authorization = 'Bearer ' + session.access_token;
    const r = await fetch(SUPABASE_URL + path + qs, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    if (r.status === 401 && attempt === 0 && session) { await refresh(); continue; }
    if (!r.ok) {
      let msg = ''; try { const j = await r.json(); msg = j.message || j.error || j.hint || JSON.stringify(j); } catch { msg = r.statusText; }
      throw new ApiError(msg || 'Fehler ' + r.status, r.status);
    }
    if (r.status === 204) return null;
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  throw new ApiError('Nicht angemeldet', 401);
}

const PAGE = 1000;
export async function selectAll(table, params = {}) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const part = await req('GET', '/rest/v1/' + table, {
      query: { select: '*', ...params },
      headers: { 'Range-Unit': 'items', Range: from + '-' + (from + PAGE - 1) }
    });
    rows.push(...part);
    if (part.length < PAGE) break;
  }
  return rows;
}
export const insert = (table, rows) => req('POST', '/rest/v1/' + table, { body: rows, headers: { Prefer: 'return=representation' } });
export const upsert = (table, rows, onConflict) => req('POST', '/rest/v1/' + table, {
  query: { on_conflict: onConflict }, body: rows, headers: { Prefer: 'resolution=merge-duplicates,return=representation' }
});
export const patch = (table, filter, values) => req('PATCH', '/rest/v1/' + table, { query: filter, body: values, headers: { Prefer: 'return=representation' } });
export const remove = (table, filter) => req('DELETE', '/rest/v1/' + table, { query: filter });

/* ---------- Etiketten (privater Speicher, Ordner = Konto-ID) ---------- */
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

export async function uploadLabel(path, blob) {
  await fresh();
  const r = await fetch(SUPABASE_URL + '/storage/v1/object/labels/' + enc(path), {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': blob.type || 'image/jpeg', 'x-upsert': 'true' },
    body: blob
  });
  if (!r.ok) { let m = ''; try { m = (await r.json()).message; } catch { /* leer */ } throw new ApiError(m || 'Upload fehlgeschlagen (' + r.status + ')', r.status); }
  return path;
}
export async function deleteLabels(paths) {
  if (!paths.length) return;
  await req('DELETE', '/storage/v1/object/labels', { body: { prefixes: paths } });
}
// Zeitlich begrenzte Links für die privaten Etiketten (ein Aufruf für alle)
export async function signLabels(paths, expiresIn = 60 * 60 * 24) {
  const out = {};
  for (let i = 0; i < paths.length; i += 200) {
    const part = paths.slice(i, i + 200);
    const res = await req('POST', '/storage/v1/object/sign/labels', { body: { expiresIn, paths: part } });
    for (const x of res || []) if (x.signedURL && !x.error) out[x.path] = SUPABASE_URL + '/storage/v1' + x.signedURL;
  }
  return out;
}
