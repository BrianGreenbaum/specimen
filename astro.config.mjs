// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';

import react from '@astrojs/react';

// --- Dev-only: save edited glyph focus points back to source .mdx -----------
// Used by the in-context Glyph-edit tool (src/components/GlyphEditMode.astro).
// Surgically rewrites a single callout's `focus: [...]` array, preserving the
// rest of the hand-formatted frontmatter. Only mounted on the dev server.
function matchBracket(str, open) {
  let depth = 0, inStr = false;
  for (let i = open; i < str.length; i++) {
    const ch = str[i];
    if (inStr) {
      if (ch === "'") { if (str[i + 1] === "'") { i++; continue; } inStr = false; }
      continue;
    }
    if (ch === "'") { inStr = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) return i; }
  }
  return -1;
}
function serializeFocus(arr) {
  if (!Array.isArray(arr) || !arr.length) return '[]';
  const num = (n) => String(Math.round(Number(n) * 100) / 100);
  const items = arr.map((s) => {
    const p = [`x: ${num(s.x)}`, `y: ${num(s.y)}`, `r: ${num(s.r ?? 0.16)}`];
    if (s.label != null && s.label !== '') p.push(`label: '${String(s.label).replace(/'/g, "''")}'`);
    if (s.lx != null) p.push(`lx: ${num(s.lx)}`);
    if (s.ly != null) p.push(`ly: ${num(s.ly)}`);
    return `{ ${p.join(', ')} }`;
  });
  return `[${items.join(', ')}]`;
}
function upsertFocus(line, ser) {
  const ki = line.lastIndexOf('focus:');
  if (ki >= 0) {
    const bi = line.indexOf('[', ki);
    if (bi < 0) return line;
    const ei = matchBracket(line, bi);
    if (ei < 0) return line;
    return line.slice(0, ki) + 'focus: ' + ser + line.slice(ei + 1);
  }
  const lb = line.lastIndexOf('}');
  if (lb < 0) return line;
  return line.slice(0, lb).replace(/\s*$/, '') + `, focus: ${ser} ` + line.slice(lb);
}
function patchFocus(src, field, index, focus) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('no frontmatter');
  const fm = m[1];
  const nl = fm.includes('\r\n') ? '\r\n' : '\n';
  const lines = fm.split(/\r?\n/);
  const fieldRe = new RegExp('^' + field + ':');
  const fi = lines.findIndex((l) => fieldRe.test(l));
  if (fi < 0) throw new Error('field "' + field + '" not found');
  const items = [];
  for (let j = fi + 1; j < lines.length; j++) {
    const l = lines[j];
    if (/^\S/.test(l)) break;               // next top-level key
    if (/^\s*-\s/.test(l)) items.push(j);   // a flow-style list item
  }
  const ti = items[index];
  if (ti == null) throw new Error('item ' + index + ' not found in ' + field);
  lines[ti] = upsertFocus(lines[ti], serializeFocus(focus));
  const newFm = lines.join(nl);
  return src.slice(0, m.index) + '---' + nl + newFm + nl + '---' + src.slice(m.index + m[0].length);
}

function glyphEditSaver() {
  return {
    name: 'glyph-edit-saver',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__glyph-save', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          const reply = (code, obj) => {
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
          };
          try {
            const { collection, id, field, index, focus } = JSON.parse(body || '{}');
            if (!['fonts', 'eras'].includes(collection)) throw new Error('bad collection');
            if (!/^[a-z0-9-]+$/.test(id || '')) throw new Error('bad id');
            if (!['callouts', 'traitCallouts'].includes(field)) throw new Error('bad field');
            const file = path.resolve(process.cwd(), 'src/content', collection, id + '.mdx');
            if (!fs.existsSync(file)) throw new Error('file not found: ' + id + '.mdx');
            const out = patchFocus(fs.readFileSync(file, 'utf8'), field, Number(index), focus);
            fs.writeFileSync(file, out, 'utf8');
            reply(200, { ok: true });
          } catch (err) {
            reply(400, { ok: false, error: String((err && err.message) || err) });
          }
        });
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://specimen.local',
  integrations: [mdx(), react()],
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [glyphEditSaver()],
  },
});
