const fs = require('fs');
const srcPath = 'C:/Users/29763/Desktop/朱氏三厢房家族族谱/上传版本/族谱.html';
const html = fs.readFileSync(srcPath, 'utf8');

// --- Part 1: Safely remove duplicate CUSTOM tags ---
// Find all positions of <script>window.__CUSTOM_SPLASH__=...</script>
function findTags(str) {
  const tags = [];
  let searchFrom = 0;
  const prefix = '<script>window.__CUSTOM_SPLASH__=';
  while (true) {
    const start = str.indexOf(prefix, searchFrom);
    if (start === -1) break;
    const end = str.indexOf('</script>', start);
    if (end === -1) break;
    const fullText = str.substring(start, end + 9);
    tags.push({ start, end: end + 9, text: fullText, hasConfig: fullText.includes('window.__CUSTOM_CONFIG__=') });
    searchFrom = end + 9;
  }
  return tags;
}

const allTags = findTags(html);
const combined = allTags.filter(t => t.hasConfig);
const splashOnly = allTags.filter(t => !t.hasConfig);

console.log('Found:', allTags.length, 'total tags');
console.log('  Combined (SPLASH+CONFIG):', combined.length);
console.log('  Splash-only:', splashOnly.length);

// Keep only the LAST of each type
const toRemove = [];
if (combined.length > 1) toRemove.push(...combined.slice(0, -1));
if (splashOnly.length > 1) toRemove.push(...splashOnly.slice(0, -1));
toRemove.sort((a, b) => b.start - a.start); // remove from end to start

let cleaned = html;
for (const t of toRemove) {
  // Remove the tag and any trailing newline
  let after = cleaned.substring(t.end);
  if (after.startsWith('\r')) after = after.substring(1);
  if (after.startsWith('\n')) after = after.substring(1);
  cleaned = cleaned.substring(0, t.start) + after;
}
console.log('Removed', toRemove.length, 'duplicate tags');

// --- Part 2: Fix exportFullHTML ---
const oldExportLine = "html = html.replace('</title>', '</title>\\n<script>window.__CUSTOM_SPLASH__=' + splashJSON + ';window.__CUSTOM_CONFIG__=' + configJSON + ';localStorage.setItem(\"ft_config\",JSON.stringify(window.__CUSTOM_CONFIG__));delete localStorage.ft_data_version;</scr' + 'ipt>');";

const cleanupLines = "// Clean old tags to prevent duplicate accumulation\n      html = html.replace(/<script>window\\.__CUSTOM_SPLASH__[\\s\\S]*?<\\/script>/g, '');\n      html = html.replace(/<script>window\\.__CUSTOM_CONFIG__[\\s\\S]*?<\\/script>/g, '');";

const newExportLine = cleanupLines + '\n      ' + oldExportLine;

const exportCount = cleaned.split(oldExportLine).length - 1;
if (exportCount > 0) {
  cleaned = cleaned.split(oldExportLine).join(newExportLine);
  console.log('Fixed', exportCount, 'exportFullHTML occurrences');
} else {
  console.log('WARNING: export pattern not found');
}

fs.writeFileSync(srcPath, cleaned);
console.log('Source file cleaned successfully');

// Verify
const remaining = findTags(cleaned);
console.log('After:', remaining.length, 'tags (Combined:', remaining.filter(t=>t.hasConfig).length, 'Splash-only:', remaining.filter(t=>!t.hasConfig).length, ')');
