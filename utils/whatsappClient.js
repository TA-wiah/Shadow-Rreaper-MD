const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const setupCommandHandlers  = require('../utils/commandHandlers'); // Import command handler

const SETTINGS_PATH = './config/settings.json';
const SESSION_PATH = './session/creds.json';
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c';

if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });
if (!fs.existsSync('./config')) fs.mkdirSync('./config', { recursive: true });

let settings = {};
if (fs.existsSync(SETTINGS_PATH)) {
    settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
} else {
    settings = { session: "", botName: "Shadow Reaper MD", developer: "Tottimeh Jeffrey", welcomeSent: false };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

if (settings.session && settings.session.trim() !== "") {
    console.log("🔄 Loading session from settings.json...");
    try {
        fs.writeFileSync(SESSION_PATH, Buffer.from(settings.session, 'base64').toString('utf8'));
        console.log("✅ Session loaded successfully.");
    } catch (error) {
        console.error("❌ Error restoring session:", error);
    }
} else {
    console.log("⚠️ No session data found in settings.json. Please pair your number.");
}

const connectShadowReaperMD = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const client = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        defaultQueryTimeoutMs: 120000,
    });

    if (!client || !client.ev) {
        throw new Error("❌ Failed to initialize WhatsApp client.");
    }

    client.ev.on('creds.update', async () => {
        await saveCreds();
        try {
            const sessionData = fs.readFileSync(SESSION_PATH, 'utf8');
            settings.session = Buffer.from(sessionData).toString('base64');
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
            console.log("✅ Session updated in settings.json");
        } catch (error) {
            console.error("❌ Error saving session:", error);
        }
    });

    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            console.log("❌ Connection closed. Checking if we should reconnect...");
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting in 5 seconds...");
                setTimeout(connectShadowReaperMD, 5000);
            } else {
                console.log("❌ Logged out. Clearing session and requiring re-auth.");
                settings.session = "";
                fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
            }
        } else if (connection === 'open') {
            console.log(`✅ Connected to WhatsApp as *${settings.botName}*`);

            if (!settings.welcomeSent) {
                try {
                    const userJid = client.user.id;
                    await client.sendMessage(userJid, { text: `🌟 Welcome to *${settings.botName}* by *${settings.developer}*` });
                    await client.sendMessage(userJid, { text: `🔔 Join our official WhatsApp channel: \n👉 *${CHANNEL_LINK}*` });

                    settings.welcomeSent = true;
                    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
                    console.log("✅ Invite link sent successfully.");
                } catch (err) {
                    console.error("❌ Error during connection open:", err);
                }
            }
        }
    });

    // Forward messages to command handler
    client.ev.on('messages.upsert', async (msg) => {
        if (!msg.messages) return;
        
        const message = msg.messages[0];

        if (!message.key.fromMe) {
            await setupCommandHandlers(client, message); // Send message to command handler
        }
    });

    return client;
};

(async () => {
    try {
        await connectShadowReaperMD();
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
    }
})();

module.exports = connectShadowReaperMD;
