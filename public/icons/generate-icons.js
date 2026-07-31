/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * FaceLove PWA Icon Generator
 * 
 * This script generates PNG icons from SVG templates.
 * Run with: node generate-icons.js
 * 
 * Note: For production, replace these generated icons with professionally designed ones.
 */

const fs = require('fs');
const path = require('path');

// SVG template for FaceLove icons
function createSVG(size) {
  const bgColor = '#0a0a0f';
  const primaryColor = '#ec4899';
  const secondaryColor = '#8b5cf6';
  
  // Calculate dimensions
  const center = size / 2;
  const heartSize = size * 0.35;
  const strokeWidth = Math.max(2, size * 0.015);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="${primaryColor}" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="${bgColor}"/>
  
  <!-- Gradient border -->
  <rect x="${strokeWidth}" y="${strokeWidth}" width="${size - strokeWidth * 2}" height="${size - strokeWidth * 2}" rx="${size * 0.19}" ry="${size * 0.19}" fill="none" stroke="url(#bgGrad)" stroke-width="${strokeWidth}"/>
  
  <!-- Heart shape -->
  <g transform="translate(${center}, ${center - size * 0.05}) scale(${heartSize / 100})" filter="url(#shadow)">
    <path d="M0,30 C-25,10 -50,-10 -50,-30 C-50,-55 -20,-65 0,-45 C20,-65 50,-55 50,-30 C50,-10 25,10 0,30 Z" 
          fill="url(#heartGrad)"/>
  </g>
  
  <!-- Small sparkle decorations -->
  <circle cx="${size * 0.22}" cy="${size * 0.28}" r="${size * 0.03}" fill="#ffffff" opacity="0.7"/>
  <circle cx="${size * 0.78}" cy="${size * 0.72}" r="${size * 0.025}" fill="#ffffff" opacity="0.5"/>
</svg>`;
}

// Icon sizes to generate
const ICON_SIZES = [
  { name: 'icon-72x72', size: 72 },
  { name: 'icon-96x96', size: 96 },
  { name: 'icon-128x128', size: 128 },
  { name: 'icon-144x144', size: 144 },
  { name: 'icon-152x152', size: 152 },
  { name: 'icon-192x192', size: 192 },
  { name: 'icon-384x384', size: 384 },
  { name: 'icon-512x512', size: 512 },
];

// Also create favicon and apple-touch-icon
const ADDITIONAL_ICONS = [
  { name: 'favicon', size: 32 },
  { name: 'apple-touch-icon', size: 180 },
  { name: 'icon-192', size: 192 }, // shortcut icon
];

// Generate all icons
function generateIcons() {
  const outputDir = path.dirname(__filename);
  
  console.log('🎨 Generating FaceLove PWA Icons...\n');
  
  // Generate main icons
  [...ICON_SIZES, ...ADDITIONAL_ICONS].forEach(({ name, size }) => {
    const svgContent = createSVG(size);
    const filename = `${name}.svg`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`  ✓ Created ${filename} (${size}x${size})`);
  });
  
  // Create a maskable version (for Android adaptive icons)
  const maskableSizes = [192, 512];
  maskableSizes.forEach((size) => {
    const svgContent = createMaskableSVG(size);
    const filename = `icon-${size}x${size}-maskable.svg`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`  ✓ Created ${filename} (maskable)`);
  });
  
  console.log('\n✅ All icons generated successfully!');
  console.log('\n⚠️  Note: These are SVG placeholder icons.');
  console.log('   For production, convert them to PNG or use professionally designed icons.');
}

// Create maskable-safe icon (content within safe zone)
function createMaskableSVG(size) {
  const primaryColor = '#ec4899';
  const secondaryColor = '#8b5cf6';
  const safeZone = size * 0.6; // 60% safe zone for maskable icons
  const center = size / 2;
  const heartSize = safeZone * 0.35;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Solid background (required for maskable) -->
  <rect width="${size}" height="${size}" fill="#0a0a0f"/>
  
  <!-- Heart in safe zone -->
  <g transform="translate(${center}, ${center}) scale(${heartSize / 100})">
    <path d="M0,30 C-25,10 -50,-10 -50,-30 C-50,-55 -20,-65 0,-45 C20,-65 50,-55 50,-30 C50,-10 25,10 0,30 Z" 
          fill="url(#heartGrad)"/>
  </g>
</svg>`;}

// Run if executed directly
if (require.main === module) {
  generateIcons();
}

module.exports = { createSVG, createMaskableSVG, ICON_SIZES };
