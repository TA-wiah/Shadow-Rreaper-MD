const fs = require('fs');
const settings = require('../config/settings.json');

module.exports = (client) => {
const updateSettings = (key, value) => {
    try {
        settings[key] = value;
        fs.writeFileSync('./config/settings.json', JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error(`❌ Failed to update settings: ${error.message}`);
        return false;
    }
};

client.ev.on('messages.upsert', async (messageUpdate) => {
    const message = messageUpdate.messages[0];
    if (!message?.message) return; // Ignore empty messages

    const chatId = message.key.remoteJid;
    const body = message.message.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || "";
    const args = body.split(/\s+/);
    const command = args.shift()?.toLowerCase() || "";

    // ✅ Set New Prefix
    if (command === `${settings.prefix}setprefix`) {
        if (!args[0]) {
            return client.sendMessage(chatId, { text: '❌ Please provide a new prefix.' });
        }
        if (updateSettings('prefix', args[0])) {
            client.sendMessage(chatId, { text: `✅ Prefix updated to *${args[0]}*` });
        }
    }

    // ✅ Set Session (Text or File)
    if (command === `${settings.prefix}setsession`) {
        if (args[0]) {
            // 📝 If session ID is provided as text
            if (updateSettings('session', args[0])) {
                fs.writeFileSync('./session/creds.json', JSON.stringify({ session: args[0] }, null, 2));
                client.sendMessage(chatId, { text: '✅ Session ID updated. Restart the bot to apply changes.' });
            }
        } else if (message.message?.documentMessage) {
            // 📂 If session file is attached
            const docMessage = message.message.documentMessage;
            const fileName = docMessage.fileName || "";

            if (!fileName.endsWith('.json')) {
                return client.sendMessage(chatId, { text: '❌ Invalid file type! Please upload a valid *creds.json* file.' });
            }

            // 📥 Download session file
            const buffer = await client.downloadMediaMessage(message);
            fs.writeFileSync('./session/creds.json', buffer);
            client.sendMessage(chatId, { text: '✅ Session file updated successfully. Restart the bot to apply changes.' });
        } else {
            client.sendMessage(chatId, { text: '❌ Please provide a session ID or attach a *creds.json* file.' });
        }
    }

    // ✅ Toggle Boolean Settings (Accepts true/false)
    const toggleSetting = (cmd, key, description) => {
        if (command === `${settings.prefix}${cmd}`) {
            if (!args[0] || !["true", "false"].includes(args[0].toLowerCase())) {
                return client.sendMessage(chatId, { text: `❌ Usage: *${settings.prefix}${cmd} true/false*` });
            }
            const state = args[0].toLowerCase() === "true"; // Convert to true/false
            if (updateSettings(key, state)) {
                client.sendMessage(chatId, { text: `✅ *${description}* is now *${state ? "enabled" : "disabled"}*.` });
            }
        }
    };

    // 🔹 Toggle Features
    toggleSetting('antitag', 'antiTag', 'Anti-Tag feature');
    toggleSetting('antispam', 'antiSpam', 'Anti-Spam feature');
    toggleSetting('chatbot', 'chatBot', 'Chatbot feature');
    toggleSetting('antilink', 'antiLink', 'Anti-Link feature');
    toggleSetting('autoreact', 'autoReact', 'Auto-React feature');
    toggleSetting('antibot', 'antiBot', 'Anti-Bot feature');
    toggleSetting('anticall', 'antiCall', 'Anti-Call feature');
    toggleSetting('antibadword', 'antiBadWord', 'Anti-Bad-Word feature');
    toggleSetting('antidelete', 'antiDelete', 'Anti-Delete feature');
    toggleSetting('autoviewstatus', 'autoViewStatus', 'Auto-View-Status feature');
    toggleSetting('autolikestatus', 'autoLikeStatus', 'Auto-Like-Status feature');
    toggleSetting('autoread', 'autoRead', 'Auto-Read feature');
    toggleSetting('autobio', 'autoBio', 'Auto-Bio feature');
});
};
