const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check if there are any syntax errors by trying to extract and parse
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('ERROR: Could not extract script');
    process.exit(1);
}

let script = scriptMatch[1];

console.log('Script length:', script.length);

// Try to find syntax errors
console.log('\n--- Checking around line 926 (let activeDtab) ---');
const lines = script.split('\n');
for (let i = 920; i < Math.min(lines.length, 940); i++) {
    console.log(`Line ${i+1}: ${lines[i]}`);
}

console.log('\n--- Checking for concatenation issues ---');
// Check the actual raw characters around activeDtab/openDrawer
const idx = script.indexOf('let activeDtab');
if (idx > -1) {
    console.log('Characters around activeDtab:');
    console.log(JSON.stringify(script.substring(idx - 10, idx + 100)));
}

// Try to compile the script
console.log('\n--- Trying to parse ---');
try {
    new Function(script);
    console.log('Script parsed successfully!');
} catch (e) {
    console.log('PARSE ERROR:', e.message);
}
