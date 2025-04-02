
const deviceInfoHandler = async (client, message) => {
    const chatId = message.key.remoteJid;
    let targetMessage = message;

    // ✅ If user tagged (quoted) a message, get the sender's info
    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
        targetMessage = message.message.extendedTextMessage.contextInfo;
    }

    // Extract device information if available
    const deviceInfo = targetMessage.deviceInfo || {};
    const senderJid = targetMessage.participant || message.key.participant;

    const deviceDetails = `
📱 *Device Information*:
👤 *User:* ${senderJid}
🔹 *Platform:* ${deviceInfo.platform || 'Unknown'}
🔹 *Manufacturer:* ${deviceInfo.manufacturer || 'Unknown'}
🔹 *Model:* ${deviceInfo.device_model || 'Unknown'}
🔹 *OS Version:* ${deviceInfo.os_version || 'Unknown'}
🔹 *App Version:* ${deviceInfo.app_version || 'Unknown'}
    `.trim();

    await client.sendMessage(chatId, { text: deviceDetails });
};

module.exports = { deviceInfoHandler };

