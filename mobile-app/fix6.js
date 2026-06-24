const fs = require('fs');
const path = require('path');

const fileDetailModal = path.join(__dirname, 'src', 'modals', 'detail', 'DetailModal.tsx');
const fileRmAttendance = path.join(__dirname, 'src', 'roles', 'rm', 'RmAttendanceScreen.tsx');

let detailModal = fs.readFileSync(fileDetailModal, 'utf8');
detailModal = detailModal.replace(/item\.status === "IN_PROGRESS" \|\| item\.status === "VENDOR_PENDING" \|\| item\.status === "VENDOR_PENDING" \? \[/g, 'item.status === "IN_PROGRESS" || item.status === "VENDOR_PENDING" ? [');
fs.writeFileSync(fileDetailModal, detailModal, 'utf8');

let rmAtt = fs.readFileSync(fileRmAttendance, 'utf8');
rmAtt = rmAtt.replace(/status === "Late"/g, 'status === "Late" /* Fixed */');
rmAtt = rmAtt.replace(/task\.status === "Late"/g, 'task.status === "Pending" /* Restoring task status */');
// Wait, TaskStatus doesn't have "Late". TaskStatus is "Pending" | "InProgress" | "Done" etc.
// The previous script replaced status === "Pending" with status === "Late" which broke TaskStatus!
rmAtt = rmAtt.replace(/task\.status === "Late" \/\* Fixed \*\//g, 'task.status === "Pending"');
fs.writeFileSync(fileRmAttendance, rmAtt, 'utf8');

console.log("Cleanup 6 complete");
