const fs = require('fs');
const path = require('path');

function search(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(search(fullPath, pattern));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (pattern.test(content)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

console.log(search('E:/bajaj-Integration-main/mobile-app/src', /am/i));
