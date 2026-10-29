import fs from 'fs';
import zlib from 'zlib';

// Function to generate a raw valid PNG with cyberpunk palette (deep dark bg, neon cyan & magenta core)
function createCyberPng(width, height, isMaskable = false) {
  // RGBA buffer: (width * 4 + 1 for filter byte) * height
  const rowStride = width * 4 + 1;
  const rawData = Buffer.alloc(rowStride * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = (Math.min(width, height) / 2) * (isMaskable ? 0.75 : 0.88);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cyber background: Deep navy/black #040914
      let r = 4;
      let g = 9;
      let b = 20;
      let a = 255;

      // Outer glowing circle
      if (dist < maxR) {
        // Base dark container #081226
        r = 8;
        g = 18;
        b = 38;

        // Diagonal cyber crossbars
        const d1 = Math.abs(dx - dy);
        const d2 = Math.abs(dx + dy);
        const strokeW = width * 0.08;

        if (d1 < strokeW && dist < maxR * 0.75) {
          // Neon Cyan #00f0ff
          const intensity = 1 - d1 / strokeW;
          r = Math.min(255, Math.floor(0 * intensity + r * (1 - intensity)));
          g = Math.min(255, Math.floor(240 * intensity + g * (1 - intensity)));
          b = Math.min(255, Math.floor(255 * intensity + b * (1 - intensity)));
        } else if (d2 < strokeW && dist < maxR * 0.75) {
          // Neon Magenta #ec4899
          const intensity = 1 - d2 / strokeW;
          r = Math.min(255, Math.floor(236 * intensity + r * (1 - intensity)));
          g = Math.min(255, Math.floor(72 * intensity + g * (1 - intensity)));
          b = Math.min(255, Math.floor(153 * intensity + b * (1 - intensity)));
        }

        // Center microchip node
        const boxSize = width * 0.16;
        if (Math.abs(dx) < boxSize && Math.abs(dy) < boxSize) {
          r = 2;
          g = 4;
          b = 9;
          // Math plus sign in center
          if (
            (Math.abs(dx) < strokeW * 0.25 && Math.abs(dy) < boxSize * 0.7) ||
            (Math.abs(dy) < strokeW * 0.25 && Math.abs(dx) < boxSize * 0.7)
          ) {
            r = 0;
            g = 240;
            b = 255;
          }
        }

        // Ring border
        if (Math.abs(dist - maxR * 0.88) < width * 0.02) {
          r = 0;
          g = 240;
          b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // PNG CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression (deflate)
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createCyberPng(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createCyberPng(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createCyberPng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createCyberPng(180, 180, true));
fs.writeFileSync('public/favicon.ico', createCyberPng(32, 32, false));

console.log('Successfully generated all PWA PNG icons!');
