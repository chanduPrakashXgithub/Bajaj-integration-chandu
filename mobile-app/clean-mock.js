const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src', 'data', 'mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Replace CRLF with LF to standardize finding boundaries
content = content.replace(/\r\n/g, '\n');

// Also remove "Daily reporting" from user skills
let usersModified = 0;
const usersStartStr = 'export const users: User[] = [';
const usersEndStr = '];\n\nexport const tasks: Task[] = [];';
const usIndex = content.indexOf(usersStartStr);
const ueIndex = content.indexOf(usersEndStr);

if (usIndex !== -1 && ueIndex !== -1) {
    const arrStr = content.substring(usIndex + usersStartStr.length - 1, ueIndex + 1);
    try {
        const users = JSON.parse(arrStr);
        users.forEach(u => {
            if (u.skills && u.skills.includes('Daily reporting')) {
                u.skills = u.skills.filter(s => s !== 'Daily reporting');
                usersModified++;
            }
        });
        const newArr = JSON.stringify(users, null, 2);
        content = content.substring(0, usIndex + usersStartStr.length - 1) + newArr + content.substring(ueIndex + 1);
        console.log(`Removed Daily reporting skill from ${usersModified} users.`);
    } catch (e) {
        console.error("Failed to parse users array:", e.message);
    }
} else {
    console.log("Could not find users boundaries.");
}

const startStr = 'export const notifications: NotificationItem[] = [';
const endStr = '];\n\nexport const attendanceLog';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const arrayStr = content.substring(startIndex + startStr.length - 1, endIndex + 1);
    try {
        const notifications = JSON.parse(arrayStr);
        const filtered = notifications.filter(n => !n.title.includes('Daily task audit'));
        
        const newArrayStr = JSON.stringify(filtered, null, 2);
        content = content.substring(0, startIndex + startStr.length - 1) + newArrayStr + content.substring(endIndex + 1);
        fs.writeFileSync(mockDataPath, content, 'utf8');
        console.log(`Cleaned notifications. Removed ${notifications.length - filtered.length} items.`);
    } catch (e) {
        console.error("Failed to parse notifications array:", e.message);
    }
} else {
    console.log("Could not find notifications boundaries.");
}
