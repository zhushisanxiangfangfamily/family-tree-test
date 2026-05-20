const fs = require('fs');
const repo = fs.readFileSync('C:/Users/29763/github-family-tree/index.html', 'utf8');

function extractArray(html, varName) {
  const search = 'const ' + varName + ' = [';
  const idx = html.indexOf(search);
  if (idx === -1) return null;
  const start = idx + search.length - 1;
  let depth = 1, inStr = false, strChar = '';
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === strChar) { inStr = false; }
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
    if (ch === '[') { depth++; }
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        const arrStr = html.substring(start, i + 1);
        try { return JSON.parse(arrStr); } catch(e) {
          console.log('Parse error:', e.message.substring(0, 200));
          return null;
        }
      }
    }
  }
  return null;
}

const members = extractArray(repo, 'defaultMembers');
if (!members) { console.log('Failed to extract members'); process.exit(1); }

console.log('Total repo members:', members.length);

// Find id 78
const m78 = members.find(m => m.id === 78);
if (m78) {
  console.log('\nMember 78 "过客":');
  console.log(JSON.stringify(m78, null, 2));
} else {
  console.log('\nMember 78 NOT in repo data');
}

// Show members around id 75-82
console.log('\nMembers id 75-82:');
members.filter(m => m.id >= 75 && m.id <= 82).forEach(m => {
  console.log('  id:', m.id, '|', m.name, '|', m.gender, '| parentId:', m.parentId, '| spouseOfId:', m.spouseOfId || '-');
});

// Count: how many members have spouseOfId set?
const spouses = members.filter(m => m.spouseOfId);
console.log('\nTotal spouses (has spouseOfId):', spouses.length);
spouses.forEach(s => console.log('  -', s.name, s.gender, '-> spouseOf', s.spouseOfId));

// Members with children (has childIds or referenced as parentId)
const parents = new Set();
members.forEach(m => { if (m.parentId) parents.add(m.parentId); });
console.log('\nMembers referenced as parent:', parents.size);

// Female members that are roots (no parent, no spouseOfId)
const femaleRoots = members.filter(m => m.gender === '女' && !m.parentId && !m.spouseOfId);
console.log('\nFemale roots (no parent, no spouse):', femaleRoots.length);
femaleRoots.forEach(m => console.log('  -', m.name, 'id:', m.id));
