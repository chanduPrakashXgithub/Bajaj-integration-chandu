const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');
const fileAppContext = path.join(__dirname, 'src', 'context', 'AppContext.tsx');

let mockData = fs.readFileSync(fileMockData, 'utf8');
let appCtx = fs.readFileSync(fileAppContext, 'utf8');

// Fix AppContext
appCtx = appCtx.replace(/attachments:/g, 'attachmentUrls:');
fs.writeFileSync(fileAppContext, appCtx, 'utf8');

// Fix MockData
// The problem is duplicate properties. We can just use a regex to remove duplicate properties.
// Specifically we know there is duplicate "vendorRemarks" or something else? Wait, let's look at line 16971.
let lines = mockData.split('\n');
// Let's print out lines around 16971 to see what's wrong.
console.log("Lines 16965-16975:");
console.log(lines.slice(16965, 16975).join('\n'));

console.log("Lines 16982-16992:");
console.log(lines.slice(16982, 16992).join('\n'));

console.log("Lines 17048-17058:");
console.log(lines.slice(17048, 17058).join('\n'));
