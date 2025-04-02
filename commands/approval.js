const fs = require('fs');
const settingsPath = './config/settings.json';

// Function to read settings
function getSettings() {
    if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath));
    }
    return { approvedUsers: [] }; // Default: No approved users
}

// Function to update settings
function updateSettings(newSettings) {
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
}

// ✅ Approve a single user
async function approveUser(sock, group, mentionedUsers) {
    if (!mentionedUsers.length) {
        await sock.sendMessage(group, { text: "⚠️ Mention a user to approve!" });
        return;
    }

    let settings = getSettings();
    mentionedUsers.forEach(user => {
        if (!settings.approvedUsers.includes(user)) {
            settings.approvedUsers.push(user);
        }
    });

    updateSettings(settings);
    await sock.sendMessage(group, { text: `✅ Approved: ${mentionedUsers.join(", ")}` });
}

// ✅ Approve all users in the group
async function approveAllUsers(sock, group) {
    const participants = (await sock.groupMetadata(group)).participants.map(p => p.id);

    let settings = getSettings();
    settings.approvedUsers = participants;

    updateSettings(settings);
    await sock.sendMessage(group, { text: "✅ All group members have been approved!" });
}

// 🔍 Check if a user is approved
function isUserApproved(userId) {
    const settings = getSettings();
    return settings.approvedUsers.includes(userId);
}

module.exports = { approveUser, approveAllUsers, isUserApproved };
