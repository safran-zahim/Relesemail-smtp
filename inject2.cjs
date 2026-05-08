const fs = require('fs');
const img = fs.readFileSync('public/orangehrm-logo.png');
const b64 = img.toString('base64');
let code = fs.readFileSync('src/emailGenerator.ts', 'utf8');

code = code.replace(/const fallbackLogo = `<img src="data:image\/png;base64,[A-Za-z0-9+/=]+" height="72" alt="\$\{company\}" style="height:72px; width:auto; max-width:400px; display:inline-block;">`;/, 
"const fallbackLogo = `<img src=\"data:image/png;base64," + b64 + "\" height=\"72\" alt=\"${company}\" style=\"height:72px; width:auto; max-width:400px; display:inline-block;\">`;");

fs.writeFileSync('src/emailGenerator.ts', code);
console.log('Successfully injected base64 logo!');
