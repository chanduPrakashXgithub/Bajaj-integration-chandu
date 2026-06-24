const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { search: /\|\|.*"RESOLVED"/g, replace: '' }, // This is too aggressive. Let's do string exact match.
  { search: /\|\|\s*item\.status\s*===\s*"RESOLVED"/g, replace: '' },
  { search: /\|\|\s*c\.status\s*===\s*"RESOLVED"/g, replace: '' },
  { search: /&&\s*item\.status\s*!==\s*"RESOLVED"/g, replace: '' },
  { search: /&&\s*c\.status\s*!==\s*"RESOLVED"/g, replace: '' },
  { search: /\|\|\s*item\.status\s*===\s*"VENDOR_PENDING"/g, replace: '' },
  { search: /\|\|\s*c\.status\s*===\s*"VENDOR_PENDING"/g, replace: '' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Fix duplicate conditions like `c.status === "RESOLVED" || c.status === "RESOLVED"`
      content = content.replace(/c\.status === "RESOLVED" \|\| c\.status === "RESOLVED"/g, 'c.status === "RESOLVED"');
      content = content.replace(/c\.status !== "RESOLVED" && c\.status !== "RESOLVED"/g, 'c.status !== "RESOLVED"');
      content = content.replace(/item\.status === "RESOLVED" \|\| item\.status === "RESOLVED"/g, 'item.status === "RESOLVED"');
      content = content.replace(/item\.status !== "RESOLVED" && item\.status !== "RESOLVED"/g, 'item.status !== "RESOLVED"');
      
      content = content.replace(/c\.status === "VENDOR_PENDING" \|\| c\.status === "VENDOR_PENDING"/g, 'c.status === "VENDOR_PENDING"');
      content = content.replace(/item\.status === "VENDOR_PENDING" \|\| item\.status === "VENDOR_PENDING"/g, 'item.status === "VENDOR_PENDING"');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned up ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
