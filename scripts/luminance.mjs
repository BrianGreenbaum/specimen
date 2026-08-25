import sharp from 'sharp';

const files = process.argv.slice(2);
for (const f of files) {
  const { data, info } = await sharp(f).resize(640, 360, { fit: 'fill' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const N = info.width * info.height;
  let lt18 = 0, lt30 = 0, sum = 0;
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = L; sum += L;
    if (L < 18) lt18++; if (L < 30) lt30++;
  }
  // bottom-right quadrant
  let brN = 0, brLt18 = 0, brSum = 0;
  for (let y = 180; y < 360; y++) for (let x = 320; x < 640; x++) {
    const L = lum[y * 640 + x]; brN++; brSum += L; if (L < 18) brLt18++;
  }
  // per-quadrant mean
  const q = [];
  for (const [x0, y0] of [[0,0],[320,0],[0,180],[320,180]]) {
    let s = 0, n = 0;
    for (let y = y0; y < y0+180; y++) for (let x = x0; x < x0+320; x++) { s += lum[y*640+x]; n++; }
    q.push(+(s/n).toFixed(1));
  }
  // horizontal band means (12 rows) — banding check
  const bands = [];
  for (let b = 0; b < 12; b++) { let s=0,n=0; for (let y=b*30;y<b*30+30;y++) for(let x=0;x<640;x++){s+=lum[y*640+x];n++;} bands.push(Math.round(s/n)); }
  console.log(JSON.stringify({ f: f.split('/').slice(-2).join('/'),
    pctLt18: +(lt18/N*100).toFixed(1), pctLt30: +(lt30/N*100).toFixed(1),
    mean: +(sum/N).toFixed(1), brQuadPctLt18: +(brLt18/brN*100).toFixed(1),
    brQuadMean: +(brSum/brN).toFixed(1), quadMeans: q, bands }));
}
