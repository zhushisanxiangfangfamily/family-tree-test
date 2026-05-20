const fs = require('fs');
let html = fs.readFileSync('C:/Users/29763/github-family-tree/index.html', 'utf8');

// The cleanup lines that need to be removed (appear twice in exportFullHTML)
// These regexes self-match when applied to the XHR response, eating the function's own code
const lines = [
  "      // Clean old tags to prevent duplicate accumulation",
  "      html = html.replace(/<script>window\\.__CUSTOM_SPLASH__[\\s\\S]*?<\\/script>/g, '');",
  "      html = html.replace(/<script>window\\.__CUSTOM_CONFIG__[\\s\\S]*?<\\/script>/g, '');"
];

let count = 0;
for (const line of lines) {
  while (html.includes(line)) {
    html = html.replace(line + '\n', '');
    count++;
  }
  // also try without trailing newline
  while (html.includes(line + '\r')) {
    html = html.replace(line + '\r\n', '\n');
    count++;
  }
}

console.log('Removed', count, 'self-destructive lines');
fs.writeFileSync('C:/Users/29763/github-family-tree/index.html', html);

// Verify
if (html.includes('CUSTOM_SPLASH__[\\s\\S]*?')) {
  console.log('WARNING: cleanup regex still present!');
} else {
  console.log('Verified: no more self-matching regex in source');
}
