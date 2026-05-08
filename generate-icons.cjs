const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'public', 'SVG');
const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));

let content = `// Auto-generated icons file\n\nexport const featureIcons: Record<string, string> = {\n`;

files.forEach(file => {
  const filePath = path.join(svgDir, file);
  const fileContent = fs.readFileSync(filePath);
  const b64 = fileContent.toString('base64');
  const name = file.replace(/\.(png|svg)$/, '');
  const mime = file.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  content += `  '${name}': 'data:${mime};base64,${b64}',\n`;
});

content += `};\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'icons.ts'), content);
console.log('Icons generated in src/icons.ts');
