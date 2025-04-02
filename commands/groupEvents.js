const fs = require("fs");
const path = require("path");
const { botName } = require("../config/bot-config");

// Load settings.json from config folder
const settingsPath = path.join(__dirname, "config", "settings.json");
let settings = { welcome: "false", remove: "false" };

// Load settings from file
if (fs.existsSync(settingsPath)) {
    try {
        settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch (error) {
        console.error("❌ Error loading settings.json:", error);
    }
}

// 🚀 Toggle Welcome & Remove Commands
async function handleGroupCommands(client, message, command, args) {
    const sender = message.key.remoteJid;

    // If no argument is provided, show usage instructions
    if (!args[0]) {
        return await client.sendMessage(sender, { 
            text: `⚠️ Usage: \n- \`${command} on\` to enable\n- \`${command} off\` to disable`
        });
    }

    const subCommand = args[0].toLowerCase();

    if (!["on", "off"].includes(subCommand)) {
        return await client.sendMessage(sender, { text: "⚠️ Invalid option. Use `on` or `off`." });
    }

    settings[command] = subCommand;

    // Save updated settings to file
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error("❌ Error saving settings.json:", error);
        return await client.sendMessage(sender, { text: "⚠️ Failed to save settings. Please try again." });
    }

    await client.sendMessage(sender, { text: `✅ ${command.charAt(0).toUpperCase() + command.slice(1)} messages turned ${subCommand}.` });
}

// 🚀 Handle User Join/Leave Events
async function handleGroupEvents(client, reaper) {
    const metadata = await client.groupMetadata(reaper.id);
    const desc = metadata.desc || "No description provided.";

    for (let num of reaper.participants) {
        let dpuser;

        try {
            dpuser = await client.profilePictureUrl(num, "image");
        } catch {
            dpuser = "https://i.imgur.com/iEWHnOH.jpeg"; // Default profile pic
        }

        if (reaper.action === "add" && settings.welcome === "true") {
            let userName = num;
            let welcomeText = `👋 Hey @${userName.split("@")[0]}, welcome to ${metadata.subject}!\n\nPlease read the group description to avoid being removed. Thank You ${userName.split("@")[0]}.\n\n*Powered by Bot* ${botName}🤖`;
            await client.sendMessage(reaper.id, {
                image: { url: dpuser },
                caption: welcomeText,
                mentions: [num],
            });
        } else if (reaper.action === "remove" && settings.remove === "true") {
            let userName2 = num;
            let leaveText = `😢 Goodbye @${userName2.split("@")[0]}. You'll be remembered!`;
            await client.sendMessage(reaper.id, {
                image: { url: dpuser },
                caption: leaveText,
                mentions: [num],
            });
        }
    }
}

module.exports = { handleGroupCommands, handleGroupEvents };
