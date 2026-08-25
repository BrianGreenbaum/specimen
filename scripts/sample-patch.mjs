import sharp from 'sharp';
const f = process.argv[2];
const { data, info } = await sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const L = (x, y) => { const i = (y * W + x) * 3; return 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2]; };
const patch = (name, x0, y0, w, h) => {
  let s = 0, n = 0;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { s += L(x, y); n++; }
  console.log(`  ${name.padEnd(26)} ${(s/n).toFixed(1)}`);
};
console.log(f.split('/').pop(), `${W}x${H}`);
for (const a of process.argv.slice(3)) {
  const [n, x, y, w, h] = a.split(',');
  patch(n, Math.round(x*W), Math.round(y*H), Math.round(w*W), Math.round(h*H));
}
