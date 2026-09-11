import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Background with smooth rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Network Connection Nodes -->
  <!-- Left Node (Friend A) -->
  <g filter="url(#shadow)">
    <circle cx="176" cy="200" r="64" fill="#ffffff" fill-opacity="0.95" />
    <circle cx="176" cy="184" r="26" fill="#6366f1" />
    <path d="M140 236 C140 216, 212 216, 212 236 Z" fill="#6366f1" />
  </g>

  <!-- Right Node (Friend B) -->
  <g filter="url(#shadow)">
    <circle cx="336" cy="200" r="64" fill="#ffffff" fill-opacity="0.95" />
    <circle cx="336" cy="184" r="26" fill="#06b6d4" />
    <path d="M300 236 C300 216, 372 216, 372 236 Z" fill="#06b6d4" />
  </g>

  <!-- Connecting Dynamic Arc Bridge -->
  <path d="M196 230 C 230 270, 282 270, 316 230" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 1" />
  <path d="M196 230 C 230 270, 282 270, 316 230" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />

  <!-- Heart / Intimacy symbol at center -->
  <g transform="translate(256, 310)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="48" fill="#ffffff" />
    <path d="M0 16 C-24 -4, -30 -30, -10 -40 C5 -46, 12 -28, 0 -14 C-12 -28, -5 -46, 10 -40 C30 -30, 24 -4, 0 16 Z" 
          fill="url(#heartGrad)" transform="translate(0, 10) scale(1.1)" />
  </g>

  <!-- Notification / Pulse Ring -->
  <circle cx="376" cy="148" r="16" fill="#10b981" stroke="#ffffff" stroke-width="4" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');

// Function to generate PNG with circular safe-zone or full-bleed
function createIconPNG(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * (isMaskable ? 0.40 : 0.46); // maskable leaves safe-zone border

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background calculation
      const t = (x + y) / (size * 2);
      // from Indigo #4f46e5 (79, 70, 229) to Cyan #06b6d4 (6, 182, 212)
      const rGrad = Math.round(79 + (6 - 79) * t);
      const gGrad = Math.round(70 + (182 - 70) * t);
      const bGrad = Math.round(229 + (212 - 229) * t);

      if (isMaskable) {
        // Full bleed for maskable
        png.data[idx] = rGrad;
        png.data[idx + 1] = gGrad;
        png.data[idx + 2] = bGrad;
        png.data[idx + 3] = 255;
      } else {
        // Rounded squircle / rounded rect or circle
        const cornerR = size * 0.22;
        const inCornerX = x < cornerR || x > size - cornerR;
        const inCornerY = y < cornerR || y > size - cornerR;
        let inBounds = true;
        if (inCornerX && inCornerY) {
          const cx = x < cornerR ? cornerR : size - cornerR;
          const cy = y < cornerR ? cornerR : size - cornerR;
          const cDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (cDist > cornerR) inBounds = false;
        }

        if (inBounds) {
          png.data[idx] = rGrad;
          png.data[idx + 1] = gGrad;
          png.data[idx + 2] = bGrad;
          png.data[idx + 3] = 255;
        } else {
          png.data[idx] = 0;
          png.data[idx + 1] = 0;
          png.data[idx + 2] = 0;
          png.data[idx + 3] = 0;
        }
      }

      // Draw two white friend avatar circles and heart in center
      // Left avatar (dist to (-0.16*size, -0.08*size))
      const nodeR = size * 0.13;
      const leftDist = Math.sqrt((x - (center - size * 0.16)) ** 2 + (y - (center - size * 0.08)) ** 2);
      const rightDist = Math.sqrt((x - (center + size * 0.16)) ** 2 + (y - (center - size * 0.08)) ** 2);
      const heartDist = Math.sqrt((x - center) ** 2 + (y - (center + size * 0.18)) ** 2);

      if (leftDist < nodeR || rightDist < nodeR) {
        // Inner white circle
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else if (heartDist < size * 0.11) {
        // Heart badge in rose #f43f5e
        png.data[idx] = 244;
        png.data[idx + 1] = 63;
        png.data[idx + 2] = 94;
        png.data[idx + 3] = 255;
      }
    }
  }

  return PNG.sync.write(png);
}

// Generate all required files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createIconPNG(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createIconPNG(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createIconPNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIconPNG(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createIconPNG(64, false));

console.log('Successfully generated all PWA icons.');
