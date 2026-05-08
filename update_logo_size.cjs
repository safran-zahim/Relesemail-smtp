const fs = require('fs');
let code = fs.readFileSync('src/emailGenerator.ts', 'utf8');
code = code.replace(/height="40" alt="\$\{company\}" style="height:40px; width:auto; max-width:250px; display:inline-block;"/, 'height="72" alt="${company}" style="height:72px; width:auto; max-width:400px; display:inline-block;"');
fs.writeFileSync('src/emailGenerator.ts', code);
console.log('Logo size updated to 72px!');
