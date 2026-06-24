const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');
const fileAppContext = path.join(__dirname, 'src', 'context', 'AppContext.tsx');

let mockData = fs.readFileSync(fileMockData, 'utf8');
// Fix An object literal cannot have multiple properties with the same name.
// Mostly "raisedByName" being duplicated or "resolvedAt" duplicated. I will just run a regex to remove duplicates if they are adjacent
// But they might not be adjacent. I will just regex "raisedByName": "User",\s*"raisedByName": "User",
mockData = mockData.replace(/"raisedByName": "User",\s*"raisedByName": "User",/g, '"raisedByName": "User",');

// The duplicate properties were 16971, 16988, 17053 etc. Let's look at those lines using a regex replacer for any duplicated keys.
let lines = mockData.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"raisedByName": "User",') && lines[i+1] && lines[i+1].includes('"raisedByName": "User",')) {
    lines[i] = ''; // remove first one
  }
}
mockData = lines.filter(l => l !== '').join('\n');
fs.writeFileSync(fileMockData, mockData, 'utf8');

let appCtx = fs.readFileSync(fileAppContext, 'utf8');
appCtx = appCtx.replace(/c\.attachments/g, 'c.attachmentUrls');
appCtx = appCtx.replace(/attachments: \[\]/g, 'attachmentUrls: []');
fs.writeFileSync(fileAppContext, appCtx, 'utf8');

console.log("Cleanup 7 complete");
