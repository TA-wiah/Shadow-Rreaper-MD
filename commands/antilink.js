const fs = require('fs');
const settingsPath = './config/settings.json';

// Function to read settings.json
function getSettings() {
    if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath));
    }
    return { antiLink: false }; // Default: OFF
}

// Function to update settings.json
function updateSettings(newSettings) {
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
}

// 🚫 Handle Anti-Link Command
async function handleAntilink(sock, group, args, prefix) {
    let settings = getSettings();
    const setting = args[0]?.toLowerCase();

    if (!setting || (setting !== "on" && setting !== "off")) {
        await sock.sendMessage(group, { text: `⚠️ Use: *${prefix}antilink on/off*` });
        return;
    }

    settings.antiLink = setting === "on"; // Update setting
    updateSettings(settings);

    await sock.sendMessage(group, { text: `🔗 *Anti-Link* has been turned *${setting.toUpperCase()}*.` });
}

// ✅ Check if Anti-Link is enabled
function isAntiLinkEnabled() {
    const settings = getSettings();
    return settings.antiLink;
}

module.exports = { handleAntilink, isAntiLinkEnabled };
