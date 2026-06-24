const fs = require('fs');
const path = require('path');

const fileMockData = path.join(__dirname, 'src', 'data', 'mockData.ts');
const fileDetailModal = path.join(__dirname, 'src', 'modals', 'detail', 'DetailModal.tsx');
const fileBmComplaints = path.join(__dirname, 'src', 'roles', 'branchManager', 'BranchManagerComplaintsScreen.tsx');
const fileLcBranch = path.join(__dirname, 'src', 'roles', 'lc', 'LcBranchScreen.tsx');
const fileRmCommandCenter = path.join(__dirname, 'src', 'roles', 'rm', 'RmComplaintCommandCenter.tsx');

// Fix mockData
let mockData = fs.readFileSync(fileMockData, 'utf8');
mockData = mockData.replace(/"resolvedAt": null,\s*"resolvedAt": null/g, '"resolvedAt": null');
mockData = mockData.replace(/"vendorContactedAt":.*,\s*/g, '');
mockData = mockData.replace(/raisedByIdName/g, 'raisedByName');
fs.writeFileSync(fileMockData, mockData, 'utf8');

// Fix DetailModal
let detailModal = fs.readFileSync(fileDetailModal, 'utf8');
detailModal = detailModal.replace(/complaint\.status !== "RESOLVED" && complaint\.status !== "RESOLVED"/g, 'complaint.status !== "RESOLVED"');
detailModal = detailModal.replace(/complaint\.status === "VENDOR_PENDING" \? "Vendor Contacted" : complaint\.status === "IN_PROGRESS" \? "In Progress" : complaint\.status === "VENDOR_PENDING" \? "Waiting for Vendor"/g, 'complaint.status === "VENDOR_PENDING" ? "Vendor Pending" : complaint.status === "IN_PROGRESS" ? "In Progress"');
detailModal = detailModal.replace(/raisedByIdName/g, 'raisedByName');
detailModal = detailModal.replace(/complaint\.vendorContactedAt.*null\}/g, '');
detailModal = detailModal.replace(/\{complaint\.resolvedAt \? <DetailRow icon=\{XCircle\} label="RESOLVED" value=\{new Date\(complaint\.resolvedAt\)\.toLocaleString\("en-IN"\)\} \/> : null\}/g, '');
fs.writeFileSync(fileDetailModal, detailModal, 'utf8');

// Fix BranchManagerComplaintsScreen
let bmComplaints = fs.readFileSync(fileBmComplaints, 'utf8');
bmComplaints = bmComplaints.replace(/item\.status === "VENDOR_PENDING" \|\| item\.status === "VENDOR_PENDING"/g, 'item.status === "VENDOR_PENDING"');
bmComplaints = bmComplaints.replace(/item\.status === "RESOLVED" \|\| item\.status === "RESOLVED"/g, 'item.status === "RESOLVED"');
fs.writeFileSync(fileBmComplaints, bmComplaints, 'utf8');

// Fix LcBranchScreen
let lcBranch = fs.readFileSync(fileLcBranch, 'utf8');
lcBranch = lcBranch.replace(/c\.status === "RESOLVED" \|\| c\.status === "RESOLVED"/g, 'c.status === "RESOLVED"');
fs.writeFileSync(fileLcBranch, lcBranch, 'utf8');

// Fix RmComplaintCommandCenter
let rmCmd = fs.readFileSync(fileRmCommandCenter, 'utf8');
rmCmd = rmCmd.replace(/c\.status === "OPEN" \|\| c\.status === "IN_PROGRESS"/g, 'c.status === "OPEN" || c.status === "IN_PROGRESS"');
rmCmd = rmCmd.replace(/c\.status === "VENDOR_PENDING" \|\| c\.status === "VENDOR_PENDING"/g, 'c.status === "VENDOR_PENDING"');
rmCmd = rmCmd.replace(/c\.status === "RESOLVED" \|\| c\.status === "RESOLVED"/g, 'c.status === "RESOLVED"');
rmCmd = rmCmd.replace(/c\.status !== "RESOLVED" && c\.status !== "RESOLVED"/g, 'c.status !== "RESOLVED"');
rmCmd = rmCmd.replace(/i\.status === "OPEN" \|\| i\.status === "IN_PROGRESS"/g, 'i.status === "OPEN" || i.status === "IN_PROGRESS"');
rmCmd = rmCmd.replace(/i\.status === "VENDOR_PENDING" \|\| i\.status === "VENDOR_PENDING"/g, 'i.status === "VENDOR_PENDING"');
rmCmd = rmCmd.replace(/i\.status !== "RESOLVED" && i\.status !== "RESOLVED"/g, 'i.status !== "RESOLVED"');
rmCmd = rmCmd.replace(/i\.status === "RESOLVED" \|\| i\.status === "RESOLVED"/g, 'i.status === "RESOLVED"');
rmCmd = rmCmd.replace(/item\.status !== "RESOLVED" && item\.status !== "RESOLVED"/g, 'item.status !== "RESOLVED"');
fs.writeFileSync(fileRmCommandCenter, rmCmd, 'utf8');

console.log("Cleanup complete");
