const fs = require('fs');
const html = fs.readFileSync('C:/Users/29763/github-family-tree/index.html', 'utf8');

// --- Part 1: Clean duplicate CUSTOM tags from HTML ---
// Find all <script>window.__CUSTOM_SPLASH__=...</script> tags
// Keep only the LAST combined tag and the LAST splash-only tag

function findAllTagPositions(str, tagPrefix) {
  const positions = [];
  let searchFrom = 0;
  const openTag = '<script>' + tagPrefix;
  while (true) {
    const start = str.indexOf(openTag, searchFrom);
    if (start === -1) break;
    const end = str.indexOf('</script>', start);
    if (end === -1) break;
    positions.push({ start, end: end + 9, text: str.substring(start, end + 9) });
    searchFrom = end + 9;
  }
  return positions;
}

// Find combined tags (have both SPLASH and CONFIG)
const combinedTags = findAllTagPositions(html, 'window.__CUSTOM_SPLASH__=');
const combinedWithConfig = combinedTags.filter(t => t.text.includes('window.__CUSTOM_CONFIG__='));

// Find splash-only tags (have SPLASH but not CONFIG)
const splashOnlyTags = combinedTags.filter(t => !t.text.includes('window.__CUSTOM_CONFIG__='));

console.log('Combined tags (SPLASH+CONFIG):', combinedWithConfig.length);
console.log('Splash-only tags:', splashOnlyTags.length);

// Build list of tags to remove (all except the last of each type)
const tagsToRemove = [];
if (combinedWithConfig.length > 1) {
  tagsToRemove.push(...combinedWithConfig.slice(0, -1)); // all but last
}
if (splashOnlyTags.length > 1) {
  tagsToRemove.push(...splashOnlyTags.slice(0, -1)); // all but last
}

// Sort by position descending so we can remove from end to start
tagsToRemove.sort((a, b) => b.start - a.start);

console.log('Removing', tagsToRemove.length, 'duplicate tags');

// Remove them
let cleaned = html;
for (const tag of tagsToRemove) {
  cleaned = cleaned.substring(0, tag.start) + cleaned.substring(tag.end);
  // If there's a newline character right after (or before), clean it up
}

// Clean up double-newlines that might result
cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

// --- Part 2: Fix exportFullHTML to prevent future accumulation ---
const oldLine = "html = html.replace('</title>', '</title>\\n<script>window.__CUSTOM_SPLASH__=' + splashJSON + ';window.__CUSTOM_CONFIG__=' + configJSON + ';localStorage.setItem(\"ft_config\",JSON.stringify(window.__CUSTOM_CONFIG__));delete localStorage.ft_data_version;</scr' + 'ipt>');";

const cleanupCode = "// Clean old injection tags to prevent duplicate accumulation\n      html = html.replace(/<script>window\\.__CUSTOM_SPLASH__[\\s\\S]*?<\\/script>/g, '');\n      html = html.replace(/<script>window\\.__CUSTOM_CONFIG__[\\s\\S]*?<\\/script>/g, '');";

const newLine = cleanupCode + '\n      ' + oldLine;

const oldCount = cleaned.split(oldLine).length - 1;
if (oldCount > 0) {
  cleaned = cleaned.split(oldLine).join(newLine);
  console.log('Fixed', oldCount, 'exportFullHTML occurrences');
} else {
  console.log('WARNING: exportFullHTML line not found!');
}

fs.writeFileSync('C:/Users/29763/github-family-tree/index.html', cleaned);

// Verify
const remainingCombined = findAllTagPositions(cleaned, 'window.__CUSTOM_SPLASH__=').filter(t => t.text.includes('window.__CUSTOM_CONFIG__='));
const remainingSplash = findAllTagPositions(cleaned, 'window.__CUSTOM_SPLASH__=').filter(t => !t.text.includes('window.__CUSTOM_CONFIG__='));
console.log('After cleanup - Combined:', remainingCombined.length, 'Splash-only:', remainingSplash.length);
console.log('Done!');
