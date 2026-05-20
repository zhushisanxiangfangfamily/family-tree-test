const fs = require('fs');
const html = fs.readFileSync("C:/Users/29763/Downloads/族谱_2026-05-20 (6).html", 'utf8');

// Find where defaultMembers ends
const afterDM = html.indexOf('const defaultMembers');
let bracketEnd = -1;
let depth = 0;
let inStr = false;
let strChar = '';
let startCounting = false;

for (let i = afterDM; i < html.length; i++) {
  let ch = html[i];
  if (!startCounting && ch === '[') {
    startCounting = true;
    depth = 1;
    continue;
  }
  if (!startCounting) continue;
  if (inStr) {
    if (ch === '\\') { i++; continue; }
    if (ch === strChar) { inStr = false; }
    continue;
  }
  if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
  if (ch === '[') { depth++; }
  else if (ch === ']') {
    depth--;
    if (depth === 0 && html[i+1] === ';') {
      bracketEnd = i + 2;
      break;
    }
  }
}

if (bracketEnd > 0) {
  console.log('defaultMembers ends at char:', bracketEnd);
  console.log('Next 300 chars after ]:');
  console.log(html.substring(bracketEnd, bracketEnd + 300));
} else {
  console.log('Could not find end of defaultMembers');
}

// What's the last 500 chars?
console.log('\n=== FILE END ===');
console.log('File length:', html.length, 'chars,', html.split('\n').length, 'lines');
console.log('Last 500 chars:');
console.log(html.substring(html.length - 500));
