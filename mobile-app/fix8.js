const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');

let mockData = fs.readFileSync(fileMockData, 'utf8');

let lines = mockData.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"resolvedAt":') && lines[i+1] && lines[i+1].includes('"resolvedAt":')) {
    lines[i+1] = ''; // remove second one
  }
}
mockData = lines.filter(l => l !== '').join('\n');
fs.writeFileSync(fileMockData, mockData, 'utf8');

console.log("Cleanup 8 complete");
