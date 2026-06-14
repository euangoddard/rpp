import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, "../public/icons");
const publicDir = resolve(__dirname, "../public");
const svg = readFileSync(resolve(iconsDir, "icon.svg"), "utf-8");

function renderPng(size) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  return resvg.render().asPng();
}

// PNG files
const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
];

const pngBuffers = {};
for (const { name, size } of sizes) {
  const png = renderPng(size);
  writeFileSync(resolve(iconsDir, name), png);
  pngBuffers[size] = png;
  console.log(`✓ icons/${name} (${size}×${size})`);
}

// favicon.ico — multi-size PNG-in-ICO (16 + 32)
const icoImages = [pngBuffers[16], pngBuffers[32]];
const count = icoImages.length;
const headerSize = 6 + count * 16;
let offset = headerSize;

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: ICO
header.writeUInt16LE(count, 4); // image count

const entries = icoImages.map((png, i) => {
  const dim = i === 0 ? 16 : 32;
  const entry = Buffer.alloc(16);
  entry.writeUInt8(dim, 0); // width
  entry.writeUInt8(dim, 1); // height
  entry.writeUInt8(0, 2); // colour count (0 = >256)
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // data size
  entry.writeUInt32LE(offset, 12); // data offset
  offset += png.length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...icoImages]);
writeFileSync(resolve(publicDir, "favicon.ico"), ico);
console.log("✓ favicon.ico (16+32)");
