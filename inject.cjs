const fs = require('fs');
const img = fs.readFileSync('public/orangehrm-logo.png');
const b64 = img.toString('base64');
let code = fs.readFileSync('src/emailGenerator.ts', 'utf8');

// Also remove the defaultLogoSvg string since we won't need it
code = code.replace(/const defaultLogoSvg = `[\s\S]*?`\.trim\(\);\n  const defaultLogoB64 = btoa\(defaultLogoSvg\);\n  const fallbackLogo = `<img src="data:image\/svg\+xml;base64,\$\{defaultLogoB64\}" height="40" alt="\$\{company\}" style="height:40px;display:inline-block;">`;/, 
"const fallbackLogo = `<img src=\"data:image/png;base64," + b64 + "\" height=\"40\" alt=\"${company}\" style=\"height:40px; width:auto; max-width:250px; display:inline-block;\">`;");

fs.writeFileSync('src/emailGenerator.ts', code);
console.log('Successfully injected base64 logo!');
