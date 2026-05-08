const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'public', 'SVG');
const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));

files.forEach((file, index) => {
  const oldPath = path.join(svgDir, file);
  const ext = path.extname(file);
  const newName = `icon_${String(index + 1).padStart(2, '0')}${ext}`;
  const newPath = path.join(svgDir, newName);
  fs.renameSync(oldPath, newPath);
});

console.log('Renamed all icons.');
