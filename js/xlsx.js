// Minimaler Excel-Leser und -Schreiber (.xlsx / .xlsm) ohne Fremdbibliothek.
// Lesen: ZIP entpacken (DecompressionStream), Tabellenblätter als Zeilen-Arrays.
// Schreiben: unkomprimiertes ZIP mit einfachen Blättern (Text, Zahl, Datum).

const td = new TextDecoder('utf-8');
const te = new TextEncoder();

/* ---------- ZIP lesen ---------- */
async function inflate(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann Excel-Dateien nicht entpacken. Bitte iOS/Safari aktualisieren.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function unzip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Keine Excel-Datei (.xlsx). Ältere .xls-Dateien bitte in Excel als .xlsx speichern.');
  const n = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const files = {};
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const off = dv.getUint32(p + 42, true);
    const name = td.decode(u8.subarray(p + 46, p + 46 + nlen));
    files[name] = { method, csize, off };
    p += 46 + nlen + elen + clen;
  }
  return {
    has: (name) => !!files[name],
    async text(name) {
      const f = files[name]; if (!f) return null;
      const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
      const raw = u8.subarray(start, start + f.csize);
      return td.decode(f.method === 0 ? raw : await inflate(raw));
    }
  };
}

/* ---------- Excel lesen ---------- */
const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
const all = (node, tag) => [...node.getElementsByTagNameNS('*', tag)];
const colIndex = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
const textOf = (si) => all(si, 't').filter((t) => !t.closest || !t.parentElement || t.parentElement.localName !== 'rPh').map((t) => t.textContent).join('');

// Liefert { date1904, sheets: [{ name, hidden, rows: [[Zellwerte]]] }]; Zahlen bleiben Zahlen (Datum = Excel-Seriennummer)
export async function readXlsx(buf) {
  const z = await unzip(buf);
  const wbXml = await z.text('xl/workbook.xml');
  if (!wbXml) throw new Error('Die Datei enthält keine Excel-Arbeitsmappe.');
  const wb = xml(wbXml);
  const pr = all(wb, 'workbookPr')[0];
  const date1904 = !!(pr && /^(1|true)$/.test(pr.getAttribute('date1904') || ''));
  const rels = {};
  const relXml = await z.text('xl/_rels/workbook.xml.rels');
  if (relXml) for (const r of all(xml(relXml), 'Relationship')) rels[r.getAttribute('Id')] = r.getAttribute('Target');
  let shared = [];
  const ssXml = await z.text('xl/sharedStrings.xml');
  if (ssXml) shared = all(xml(ssXml), 'si').map(textOf);
  const sheets = [];
  for (const s of all(wb, 'sheet')) {
    const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    let target = rels[rid] || '';
    target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
    const sx = await z.text(target);
    if (!sx) continue;
    const rows = [];
    for (const row of all(xml(sx), 'row')) {
      const ri = Number(row.getAttribute('r')) - 1;
      const out = [];
      let ci = 0;
      for (const c of all(row, 'c')) {
        const ref = c.getAttribute('r');
        if (ref) ci = colIndex(ref);
        const t = c.getAttribute('t') || 'n';
        const v = all(c, 'v')[0];
        let val = null;
        if (t === 's') val = v ? shared[Number(v.textContent)] ?? '' : '';
        else if (t === 'inlineStr') { const is = all(c, 'is')[0]; val = is ? textOf(is) : ''; }
        else if (t === 'str') val = v ? v.textContent : '';
        else if (t === 'b') val = v ? v.textContent === '1' : null;
        else if (t === 'e') val = null;
        else val = v && v.textContent !== '' ? Number(v.textContent) : null;
        out[ci] = val;
        ci++;
      }
      rows[ri >= 0 ? ri : rows.length] = out;
    }
    for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
    sheets.push({ name: s.getAttribute('name') || 'Blatt', hidden: (s.getAttribute('state') || 'visible') !== 'visible', rows });
  }
  return { date1904, sheets };
}

// CSV (Semikolon oder Komma) als ein Blatt
export function readCsv(text) {
  const first = text.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return { date1904: false, sheets: [{ name: 'Weine', hidden: false, rows }] };
}

/* ---------- Excel schreiben ---------- */
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = crcTable[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(entries) {
  const parts = [], central = []; let off = 0;
  for (const [name, data] of entries) {
    const nb = te.encode(name), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true); h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(h.buffer), nb, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), nb);
    off += 30 + nb.length + data.length;
  }
  const size = central.reduce((s, x) => s + x.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true);
  e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const escX = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const colName = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const serial = (iso) => { const [y, m, d] = iso.split('-').map(Number); return (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000; };

// sheets: [{ name, cols: [{ h, w, date?, eur? }], rows: [[...]] }] → Blob
export function writeXlsx(sheets) {
  const sx = sheets.map((sh) => {
    const cols = '<cols>' + sh.cols.map((c, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (c.w || 14) + '" customWidth="1"/>').join('') + '</cols>';
    const cell = (v, r, i, head) => {
      const ref = colName(i) + r, c = sh.cols[i] || {};
      if (v == null || v === '') return '';
      if (head) return '<c r="' + ref + '" t="inlineStr" s="1"><is><t>' + escX(v) + '</t></is></c>';
      if (c.date && /^\d{4}-\d{2}-\d{2}/.test(String(v))) return '<c r="' + ref + '" s="2"><v>' + serial(String(v).slice(0, 10)) + '</v></c>';
      if (typeof v === 'number' && Number.isFinite(v)) return '<c r="' + ref + '"' + (c.eur ? ' s="3"' : '') + '><v>' + v + '</v></c>';
      return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + escX(v) + '</t></is></c>';
    };
    const rows = [sh.cols.map((c) => c.h), ...sh.rows].map((row, ri) => '<row r="' + (ri + 1) + '">' + row.map((v, i) => cell(v, ri + 1, i, ri === 0)).join('') + '</row>').join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      cols + '<sheetData>' + rows + '</sheetData></worksheet>';
  });
  const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    sheets.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
    sheets.map((s, i) => '<sheet name="' + escX(s.name.slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets></workbook>';
  const wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    sheets.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') +
    '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="2"><numFmt numFmtId="164" formatCode="DD.MM.YYYY"/><numFmt numFmtId="165" formatCode="#,##0.00 &quot;€&quot;"/></numFmts>' +
    '<fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>';
  const entries = [['[Content_Types].xml', ct], ['_rels/.rels', rels], ['xl/workbook.xml', wb], ['xl/_rels/workbook.xml.rels', wbRels], ['xl/styles.xml', styles],
    ...sx.map((s, i) => ['xl/worksheets/sheet' + (i + 1) + '.xml', s])];
  return zip(entries.map(([n, s]) => [n, te.encode(s)]));
}
