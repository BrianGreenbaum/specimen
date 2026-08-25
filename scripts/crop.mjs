import sharp from 'sharp';
const [,, src, l, t, w, h, out, z] = process.argv;
await sharp(src).extract({ left: +l, top: +t, width: +w, height: +h })
  .resize(+w * (+z || 3), +h * (+z || 3), { kernel: 'nearest' })
  .jpeg({ quality: 94 }).toFile(out);
console.log('→', out);
