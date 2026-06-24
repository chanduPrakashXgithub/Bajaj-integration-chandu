const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');
const fileAppContext = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
const fileDetailModal = path.join(__dirname, 'src', 'modals', 'detail', 'DetailModal.tsx');
const fileBmComplaints = path.join(__dirname, 'src', 'roles', 'branchManager', 'BranchManagerComplaintsScreen.tsx');
const fileRmAttendance = path.join(__dirname, 'src', 'roles', 'rm', 'RmAttendanceScreen.tsx');

// Fix AppContext
let appCtx = fs.readFileSync(fileAppContext, 'utf8');
appCtx = appCtx.replace(/serverLogs\.find\(s =>/g, 'serverLogs.find((s: any) =>');
appCtx = appCtx.replace(/attachmentUrls: Array\.isArray\(c\.attachments\)/g, 'attachmentUrls: Array.isArray(c.attachmentUrls)');
appCtx = appCtx.replace(/c\.attachments\.map/g, 'c.attachmentUrls.map');
fs.writeFileSync(fileAppContext, appCtx, 'utf8');

// Fix mockData
let mockData = fs.readFileSync(fileMockData, 'utf8');
mockData = mockData.replace(/"vendorRemarks":\s*\[[\s\S]*?\],/g, '"vendorRemarks": "",');
mockData = mockData.replace(/"raisedByName": "[^"]*",\s*"raisedByName": "[^"]*",/g, '"raisedByName": "User",');
fs.writeFileSync(fileMockData, mockData, 'utf8');

// Fix DetailModal
let detailModal = fs.readFileSync(fileDetailModal, 'utf8');
detailModal = detailModal.replace(/const vendorRemarks = \(complaint\.vendorRemarks \|\| \[\]\) as Array<\{user: string; text: string; timestamp: string\}>;/g, 'const vendorRemarks = complaint.vendorRemarks || "";');
detailModal = detailModal.replace(/vendorRemarks\.length > 0 \? \(/g, 'vendorRemarks.length > 0 ? (');
detailModal = detailModal.replace(/\{vendorRemarks\.map\(\(log, i\) => \([\s\S]*?\}\)/g, '<Text style={{ fontSize: 13, color: "#64748B" }}>{vendorRemarks}</Text>');
detailModal = detailModal.replace(/complaint\.status !== "RESOLVED" && complaint\.status !== "RESOLVED"/g, 'complaint.status !== "RESOLVED"');
fs.writeFileSync(fileDetailModal, detailModal, 'utf8');

// Fix BmComplaints
let bmComplaints = fs.readFileSync(fileBmComplaints, 'utf8');
bmComplaints = bmComplaints.replace(/item\.status === "VENDOR_PENDING" \|\| item\.status === "VENDOR_PENDING"/g, 'item.status === "VENDOR_PENDING"');
bmComplaints = bmComplaints.replace(/item\.status === "RESOLVED" \|\| item\.status === "RESOLVED"/g, 'item.status === "RESOLVED"');
bmComplaints = bmComplaints.replace(/item\.status !== "RESOLVED" && item\.status !== "RESOLVED"/g, 'item.status !== "RESOLVED"');
bmComplaints = bmComplaints.replace(/c\.status === "OPEN" \|\| c\.status === "IN_PROGRESS" \|\| c\.status === "ON_HOLD" \|\| c\.status === "RESOLVED" \|\| c\.status === "REOPENED"/g, 'c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "ON_HOLD" || c.status === "REOPENED"');
fs.writeFileSync(fileBmComplaints, bmComplaints, 'utf8');

console.log("Cleanup 4 complete");
