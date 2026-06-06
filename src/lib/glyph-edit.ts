// Dev-only in-context editor for glyph spotlight focus points.
// Loaded ONLY from Layout's `if (import.meta.env.DEV)` block, so Vite strips it
// from production entirely. Toggle from any [data-glyph-edit-toggle] (the nav
// button); drag circles + labels directly on the page, then save back to the
// source .mdx via the dev-server middleware in astro.config.mjs (/__glyph-save).
import { renderGlyphDiagram } from './diagram';
import type { GlyphLayout } from './diagram';

type Spot = { x: number; y: number; r: number; label?: string; lx?: number; ly?: number };
const SVGNS = 'http://www.w3.org/2000/svg';
const KEY = 'specimen-glyph-edit';
const r2 = (n: number) => Math.round(n * 100) / 100;

const CSS = `
  html[data-glyph-edit] .callout__plate {
    outline: 2px dashed color-mix(in srgb, var(--accent) 60%, transparent);
    outline-offset: -2px;
  }
  html[data-glyph-edit] .dg-ring,
  html[data-glyph-edit] .dg-flabel { opacity: 0.28; }
  .ge-overlay { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; touch-action: none; }
  .ge-ring { fill: color-mix(in srgb, var(--accent) 9%, transparent); stroke: var(--accent); stroke-width: 3; stroke-dasharray: 7 5; }
  .ge-center { fill: var(--accent); }
  .ge-move { cursor: move; }
  .ge-grip { fill: var(--bg); stroke: var(--accent); stroke-width: 3; cursor: ew-resize; }
  .ge-lbl-box { fill: color-mix(in srgb, var(--accent) 16%, transparent); stroke: var(--accent); stroke-width: 1.5; cursor: move; }
  .ge-lbl-txt { fill: var(--accent); font-family: var(--font-mono); font-size: 26px; text-anchor: middle; pointer-events: none; }
  .ge-del { fill: var(--accent); cursor: pointer; }
  .ge-del-x { fill: var(--bg); font-family: var(--font-mono); font-size: 24px; text-anchor: middle; pointer-events: none; }
  .ge-toolbar {
    position: absolute; top: 8px; left: 8px; z-index: 6;
    display: flex; gap: 4px; align-items: center;
    background: var(--bg); border: 1px solid var(--line); border-radius: 100px;
    padding: 3px 5px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.02em;
  }
  .ge-toolbar button { padding: 3px 9px; border-radius: 100px; color: var(--fg-2); border: 1px solid transparent; cursor: pointer; }
  .ge-toolbar button:hover { border-color: var(--line); color: var(--fg); }
  .ge-toolbar .ge-save { color: var(--accent); }
  .ge-toolbar .ge-status { color: var(--fg-3); padding: 0 4px; }
  .ge-toolbar .ge-status.is-dirty { color: var(--accent); }
`;

class Editor {
  svg: SVGSVGElement;
  plate: HTMLElement;
  overlay: SVGSVGElement;
  toolbar: HTMLElement;
  status: HTMLElement;
  layout: GlyphLayout | null = null;
  focus: Spot[];
  base: string;
  family: string; glyph: string; weight: number; guides: string[];
  dirty = false;
  drag: { role: string; i: number } | null = null;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.plate = svg.closest('.callout__plate') as HTMLElement;
    this.base = svg.dataset.focus || '[]';
    this.focus = JSON.parse(this.base);
    this.family =
      svg.dataset.family ||
      (svg.closest('.callouts') as HTMLElement)?.style.getPropertyValue('--fam') || '';
    this.glyph = svg.dataset.glyph || 'a';
    this.weight = +(svg.dataset.weight || 400);
    this.guides = JSON.parse(svg.dataset.guides || '[]');

    this.overlay = document.createElementNS(SVGNS, 'svg') as SVGSVGElement;
    this.overlay.setAttribute('class', 'ge-overlay');
    this.overlay.setAttribute('viewBox', '0 0 1000 1000');
    this.overlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.plate.appendChild(this.overlay);

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'ge-toolbar';
    this.status = document.createElement('span');
    this.status.className = 'ge-status';
    const mk = (txt: string, cls = '') => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = txt; if (cls) b.className = cls;
      return b;
    };
    const add = mk('＋ spot'); const rev = mk('revert'); const save = mk('save', 'ge-save');
    add.onclick = () => this.addSpot();
    rev.onclick = () => this.revert();
    save.onclick = () => this.save();
    this.toolbar.append(this.status, add, rev, save);
    this.plate.appendChild(this.toolbar);

    this.overlay.addEventListener('pointerdown', (e) => this.onDown(e));
    this.overlay.addEventListener('pointermove', (e) => this.onMove(e));
    this.overlay.addEventListener('pointerup', () => this.onUp());
    this.overlay.addEventListener('click', (e) => this.onClick(e));

    this.redraw();
  }

  async redraw() {
    this.layout = await renderGlyphDiagram(this.svg, {
      family: this.family, glyph: this.glyph, weight: this.weight,
      guides: this.guides as any, focus: this.focus, fill: 0.62,
    });
    (this.svg as any).__layout = this.layout;
    this.drawHandles();
  }

  toUser(s: Spot) { const L = this.layout!; return { ux: L.inkL + s.x * L.inkW, uy: L.inkT + s.y * L.inkH }; }
  labelUser(s: Spot) {
    const L = this.layout!; const c = this.toUser(s); const sr = s.r * L.inkH;
    const has = typeof s.lx === 'number' || typeof s.ly === 'number';
    return has
      ? { ux: c.ux + (s.lx || 0) * L.inkH, uy: c.uy + (s.ly || 0) * L.inkH }
      : { ux: c.ux, uy: c.uy - sr - 16 };
  }
  ptrUser(e: PointerEvent) {
    const m = this.overlay.getScreenCTM();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m!.inverse());
    return { ux: p.x, uy: p.y };
  }
  el(tag: string, attrs: Record<string, string | number>) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  }

  drawHandles() {
    const o = this.overlay; while (o.firstChild) o.removeChild(o.firstChild);
    if (!this.layout) return; const L = this.layout;
    this.focus.forEach((s, i) => {
      const { ux, uy } = this.toUser(s); const sr = s.r * L.inkH;
      const g = this.el('g', { 'data-i': i });
      g.appendChild(this.el('circle', { cx: ux, cy: uy, r: sr, class: 'ge-ring' }));
      g.appendChild(this.el('circle', { cx: ux + sr, cy: uy, r: 11, class: 'ge-grip', 'data-role': 'radius' }));
      g.appendChild(this.el('circle', { cx: ux, cy: uy, r: 14, class: 'ge-center ge-move', 'data-role': 'move' }));
      if (s.label) {
        const lp = this.labelUser(s); const w = Math.max(58, s.label.length * 15);
        g.appendChild(this.el('rect', { x: lp.ux - w / 2, y: lp.uy - 22, width: w, height: 30, rx: 4, class: 'ge-lbl-box', 'data-role': 'label' }));
        const t = this.el('text', { x: lp.ux, y: lp.uy, class: 'ge-lbl-txt', 'dominant-baseline': 'middle' });
        t.textContent = s.label; g.appendChild(t);
      }
      const dx = ux + sr * 0.72, dy = uy - sr * 0.72;
      g.appendChild(this.el('circle', { cx: dx, cy: dy, r: 13, class: 'ge-del', 'data-role': 'del' }));
      const xt = this.el('text', { x: dx, y: dy + 1, class: 'ge-del-x', 'dominant-baseline': 'middle' });
      xt.textContent = '×'; g.appendChild(xt);
      o.appendChild(g);
    });
  }

  roleAt(e: Event) {
    const t = (e.target as Element).closest('[data-role]'); if (!t) return null;
    const g = t.closest('[data-i]'); return { role: t.getAttribute('data-role')!, i: +(g!.getAttribute('data-i') || 0) };
  }
  onDown(e: PointerEvent) {
    const r = this.roleAt(e); if (!r || r.role === 'del') return;
    this.drag = r; this.overlay.setPointerCapture(e.pointerId); e.preventDefault();
  }
  onMove(e: PointerEvent) {
    if (!this.drag || !this.layout) return; const L = this.layout;
    const { ux, uy } = this.ptrUser(e); const s = this.focus[this.drag.i]; if (!s) return;
    if (this.drag.role === 'move') { s.x = r2((ux - L.inkL) / L.inkW); s.y = r2((uy - L.inkT) / L.inkH); }
    else if (this.drag.role === 'radius') { const c = this.toUser(s); s.r = Math.max(0.04, Math.min(0.6, r2(Math.hypot(ux - c.ux, uy - c.uy) / L.inkH))); }
    else if (this.drag.role === 'label') { const c = this.toUser(s); s.lx = r2((ux - c.ux) / L.inkH); s.ly = r2((uy - c.uy) / L.inkH); }
    this.markDirty(); this.drawHandles();
  }
  onUp() { if (this.drag) { this.drag = null; this.redraw(); } }
  onClick(e: PointerEvent) {
    const r = this.roleAt(e);
    if (r && r.role === 'del') { this.focus.splice(r.i, 1); this.markDirty(); this.redraw(); }
  }

  addSpot() { this.focus.push({ x: 0.5, y: 0.5, r: 0.16, label: 'label' }); this.markDirty(); this.redraw(); }
  revert() { this.focus = JSON.parse(this.base); this.dirty = false; this.setStatus(''); this.redraw(); }
  markDirty() { this.dirty = true; this.status.classList.add('is-dirty'); this.setStatus('edited'); }
  setStatus(t: string) { this.status.textContent = t; if (!t) this.status.classList.remove('is-dirty'); }

  async save() {
    this.setStatus('saving…');
    try {
      const body = {
        collection: this.svg.dataset.editCollection,
        id: this.svg.dataset.editId,
        field: this.svg.dataset.editField,
        index: +(this.svg.dataset.editIndex || 0),
        focus: this.focus,
      };
      const res = await fetch('/__glyph-save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'save failed');
      this.base = JSON.stringify(this.focus);
      this.svg.dataset.focus = this.base;
      this.dirty = false; this.status.classList.remove('is-dirty'); this.setStatus('saved ✓');
      setTimeout(() => { if (!this.dirty) this.setStatus(''); }, 1600);
    } catch (err: any) {
      this.setStatus('error: ' + (err.message || err));
    }
  }

  destroy() {
    this.overlay.remove(); this.toolbar.remove();
    renderGlyphDiagram(this.svg, {
      family: this.family, glyph: this.glyph, weight: this.weight,
      guides: this.guides as any, focus: JSON.parse(this.svg.dataset.focus || '[]'), fill: 0.62,
    });
  }
}

let started = false;
export function initGlyphEdit() {
  if (started) return;
  started = true;

  const style = document.createElement('style');
  style.id = 'ge-styles';
  style.textContent = CSS;
  document.head.appendChild(style);

  const editors = new Map<SVGElement, Editor>();
  let mode = false;

  const attach = (svg: SVGSVGElement) => {
    if (editors.has(svg) || !svg.dataset.editId) return;
    editors.set(svg, new Editor(svg));
  };
  const mount = () => document.querySelectorAll<SVGSVGElement>('svg[data-callout][data-edit-id]').forEach(attach);
  const unmount = () => { editors.forEach((ed) => ed.destroy()); editors.clear(); };

  const setMode = (on: boolean) => {
    mode = on;
    document.documentElement.toggleAttribute('data-glyph-edit', on);
    localStorage.setItem(KEY, on ? '1' : '0');
    document.querySelectorAll('[data-glyph-edit-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
    on ? mount() : unmount();
  };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('[data-glyph-edit-toggle]');
    if (t) { e.preventDefault(); setMode(!mode); }
  });
  document.addEventListener('glyph-diagram-drawn', (e: any) => {
    if (mode && e.detail?.svg) attach(e.detail.svg);
  });

  const on = localStorage.getItem(KEY) === '1';
  document.querySelectorAll('[data-glyph-edit-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  if (on) setMode(true);
}
