// Client-side: one rAF loop for a pointer-driven hero. Reports the pointer
// (0–1 within the element), how fast it is moving, whether it moved recently
// ("live"), and elapsed seconds — so each page only writes its own mapping.

export interface HeroFrame {
  px: number; py: number; speed: number; live: boolean; t: number; reduce: boolean; clicks: number;
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** 1 at the pointer, easing to 0 at `reach` letters away. */
export const near = (i: number, pos: number, reach: number) => {
  const n = 1 - clamp(Math.abs(i - pos) / reach, 0, 1);
  return n * n * (3 - 2 * n);
};

export function runHero(el: HTMLElement, frame: (f: HeroFrame) => void) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let px = 0.5, py = 0.5, speed = 0, last = -1e9, lastT = 0, on = true, clicks = 0;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const nx = clamp((e.clientX - r.left) / r.width, 0, 1);
    const now = performance.now();
    speed = Math.max(speed, (Math.abs(nx - px) / Math.max(now - lastT, 8)) * 900);
    px = nx; py = clamp((e.clientY - r.top) / r.height, 0, 1);
    last = lastT = now;
  });
  el.addEventListener('click', () => { clicks++; });
  new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe(el);
  const tick = (now: number) => {
    requestAnimationFrame(tick);
    if (!on) return;
    speed *= 0.93;
    frame({ px, py, speed: clamp(speed, 0, 1), live: now - last < 2600, t: now / 1000, reduce, clicks });
  };
  requestAnimationFrame(tick);
}

/** Toggle `.is-in` on elements as they enter the viewport (starts CSS choreography). */
export function watchInView(root: ParentNode, selector = '[data-inview]') {
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => e.target.classList.toggle('is-in', e.isIntersecting)),
    { threshold: 0.2 }
  );
  root.querySelectorAll(selector).forEach((el) => io.observe(el));
}
