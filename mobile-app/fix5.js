const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');
const fileAppContext = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
const fileDetailModal = path.join(__dirname, 'src', 'modals', 'detail', 'DetailModal.tsx');
const fileBmComplaints = path.join(__dirname, 'src', 'roles', 'branchManager', 'BranchManagerComplaintsScreen.tsx');
const fileRmAttendance = path.join(__dirname, 'src', 'roles', 'rm', 'RmAttendanceScreen.tsx');

// Fix AppContext
let appCtx = fs.readFileSync(fileAppContext, 'utf8');
appCtx = appCtx.replace(/c\.attachments/g, 'c.attachmentUrls');
fs.writeFileSync(fileAppContext, appCtx, 'utf8');

// Fix mockData
let mockData = fs.readFileSync(fileMockData, 'utf8');
mockData = mockData.replace(/"attachments":/g, '"attachmentUrls":');
mockData = mockData.replace(/"raisedByName": "User",\s*"raisedByName": "User",/g, '"raisedByName": "User",');
fs.writeFileSync(fileMockData, mockData, 'utf8');

// Fix DetailModal
let detailModal = fs.readFileSync(fileDetailModal, 'utf8');
// Fix vendorRemarks.map -> vendorRemarks is string, so we just want to split by newline or something
// If it's a string, we can't map. I'll just change `{vendorRemarks.map((remark, i) => ... )}` to `{vendorRemarks.split("\\n").map((remark, i) => ...)}`
detailModal = detailModal.replace(/\{vendorRemarks\.map\(/g, '{vendorRemarks.split("\\n").map(');
detailModal = detailModal.replace(/complaint\.status === "VENDOR_PENDING" \? "Vendor Contacted" : complaint\.status === "IN_PROGRESS" \? "In Progress" : complaint\.status === "VENDOR_PENDING" \? "Waiting for Vendor" : complaint\.status;/g, 'complaint.status === "VENDOR_PENDING" ? "Vendor Pending" : complaint.status === "IN_PROGRESS" ? "In Progress" : complaint.status;');
fs.writeFileSync(fileDetailModal, detailModal, 'utf8');

// Fix BranchManagerComplaintsScreen
let bmComplaints = fs.readFileSync(fileBmComplaints, 'utf8');
bmComplaints = bmComplaints.replace(/c\.status === "OPEN" \|\| c\.status === "IN_PROGRESS" \|\| c\.status === "ON_HOLD" \|\| c\.status === "RESOLVED" \|\| c\.status === "REOPENED"/g, 'c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "ON_HOLD" || c.status === "REOPENED"');
fs.writeFileSync(fileBmComplaints, bmComplaints, 'utf8');

// Fix RmAttendanceScreen
let rmAtt = fs.readFileSync(fileRmAttendance, 'utf8');
rmAtt = rmAtt.replace(/status === "Pending"/g, 'status === "Late"');
fs.writeFileSync(fileRmAttendance, rmAtt, 'utf8');

console.log("Cleanup 5 complete");
