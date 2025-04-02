const fs = require('fs');
const connectShadowReaperMD = require('../utils/whatsappClient'); 

let lastTextTime = 0;
const messageDelay = 5000; // Prevent spam messages

async function startClient() {
    const client = await connectShadowReaperMD();
    const settings = getSettings();
    const botname = settings.botName || "Shadow Reaper MD";

    // 📵 Handle Incoming Calls (AntiCall Feature)
    client.ev.on('call', async (callData) => {
        if (settings.antiCall) {
            const callId = callData[0].id;
            const callerId = callData[0].from;

            await client.rejectCall(callId, callerId);

            const currentTime = Date.now();
            if (currentTime - lastTextTime >= messageDelay) {
                await client.sendMessage(callerId, {
                    text: '```❗❗❗📵❗❗📵❗❗📵❗❗❗\nI AM SHADOW-REAPER-MD\n\nI REJECTED THIS CALL BECAUSE MY OWNER IS BUSY. KINDLY SEND TEXT INSTEAD```',
                });
                lastTextTime = currentTime;
            }
        }
    });

    // 🔥 Auto React to Messages
    client.ev.on("messages.upsert", async (chatUpdate) => {
        if (!settings.autoReact) return;
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message || mek.key.fromMe) return;

            const reactEmojis = ["✅", "♂️", "🎆", "🎇", "💧", "🌟", "🙆", "🙌", "👀", "👁️", "❤️‍🔥", "💗", "👽", "💫", "🔥", "💯", "💥", "😇", "😥", "😂", "👋", 
                                    "🐡", "🦈", "🐙", "🦑", "🦀", "🦞", "🦐", "🦪", "🐚", "🐌", "🦋", "🐛", "🐜", "🐝", "🐞", "🦗", "🕷️", "🕸️", "🦂", "🦟", "🦠",
                                    "💐", "🌸", "💮", "🏵️", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🌲", "🌳", "🌴", "🌵", "🎋", "🎍", "🌾", "🌿", "☘️", "🍀", 
                                    "🍁", "🍂", "🍃", "🌍️", "🌎️", "🌏️", "🌑", "🌒", "🌓", "🌔", "🌕️", "🌖", "🌗", "🌘", "🌙", "🌚", "🌛", "🌜️", "☀️", "🌝", "🌞",
                                    "🪐", "💫", "⭐️", "🌟", "✨", "🌠", "🌌", "☁️", "⛅️", "⛈️", "🌤️", "🌥️", "🌦️", "🌧️", "🌨️", "🌩️", "🌪️", "🌫️", "🌬️", "🌀",
                                    "🌈", "🌂", "☂️", "☔️", "⛱️", "⚡️", "❄️", "☃️", "⛄️", "☄️", "🔥", "💧", "🌊", "💥", "💦", "💨", "😀", "😃", "😄", "😁", "😆", "😅",
                                    "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
                                    "🤫", "🤔", "🤐", "🤨", "😐️", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "😮‍", "💨", "🤤", "😴", "😷", "🤒", "🤕", "🤢",
                                    "🤮", "🤧", "🥵", "🥶", "😶‍", "🌫️", "🥴", "😵‍", "💫", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯",
                                    "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈",
                                    "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽️", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉",
                                    "🙊", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈️", "👉️", "👆️", "🖕", "👇️", "☝️", "👍️", "👎️", "✊",
                                    "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂️", "🦻", "👃", "🧠", "🦷",
                                    "🦴", "👀", "👁️", "👅", "👄", "💋", "👶", "🧒", "👦", "👧"];
            const randomEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];

            await client.sendMessage(mek.key.remoteJid, {
                react: { text: randomEmoji, key: mek.key },
            });
        } catch (error) {
            console.error('❌ Error processing auto-react:', error);
        }
    });

    // 📝 Auto Bio Update
    let bioUpdateInterval;
    if (settings.autoBio && !bioUpdateInterval) {
        bioUpdateInterval = setInterval(() => {
            const date = new Date();
            client.updateProfileStatus(
                `${botname} is active 24/7\n\n${date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })} It's a ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}.`
            );
        }, 10 * 1000);
    }

    // 👀 Auto Read & Auto View Status
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;
            
            if (settings.autoViewStatus && mek.key.remoteJid === "status@broadcast") {
                await client.readMessages([mek.key]);
                if (settings.autoLikeStatus) {
                    const reactEmojis = ['😂', '😥', '😇', '🥹', '💥', '💯', '🔥', '💫', '👽', '💗', '❤️‍🔥', '👁️', '👀', '🙌', '🙆', '🌟', '💧', '🎇', '🎆', '♂️', '✅'];
                    const randomEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
                    await client.sendMessage(mek.key.remoteJid, {
                        react: { text: randomEmoji, key: mek.key },
                    });
                }
            } else if (settings.autoRead) {
                await client.readMessages([mek.key]);
            }
        } catch (error) {
            console.error("❌ Error processing auto-read & auto-view:", error);
        }
    });

    return client;
}

// ✅ Start the Client
startClient().then(client => {
    console.log("🤖 Bot started successfully!");
}).catch(err => {
    console.error("❌ Failed to start bot:", err);
});

// ✅ Helper Functions for Settings Management
const settingsPath = "./config/settings.json";

function getSettings() {
    return fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
}

function updateSetting(key, value) {
    let settings = getSettings();
    settings[key] = value;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function toggleSetting(key) {
    let settings = getSettings();
    if (typeof settings[key] === "boolean") {
        settings[key] = !settings[key];
        updateSetting(key, settings[key]);
    }
}

function setPresenceStatus(status) {
    const validStatuses = ["online", "offline", "sleeping", "dont text", "recording"];
    if (validStatuses.includes(status)) {
        updateSetting("presence", status);
    }
}

function enableSetting(key) {
    updateSetting(key, true);
}

function disableSetting(key) {
    updateSetting(key, false);
}

// ✅ Export settings functions
module.exports = {
    getSettings,
    updateSetting,
    toggleSetting,
    setPresenceStatus,
    enableSetting,
    disableSetting
};
