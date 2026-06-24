const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { search: /complaintNumber/g, replace: 'complaintId' },
  { search: /reportedBy/g, replace: 'raisedById' },
  { search: /reportedByName/g, replace: 'raisedByName' },
  { search: /assignedVendor/g, replace: 'vendorId' },
  { search: /remarks/g, replace: 'vendorRemarks' },
  { search: /"Open"/g, replace: '"OPEN"' },
  { search: /"InProgress"/g, replace: '"IN_PROGRESS"' },
  { search: /"VendorContacted"/g, replace: '"VENDOR_PENDING"' },
  { search: /"WaitingForVendor"/g, replace: '"VENDOR_PENDING"' },
  { search: /"Resolved"/g, replace: '"RESOLVED"' },
  { search: /"Closed"/g, replace: '"RESOLVED"' },
  { search: /closedAt/g, replace: 'resolvedAt' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Done!');
