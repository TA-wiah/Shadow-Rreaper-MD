const { prefix, botName, author, dev, developer } = require('../config/bot-config');
const fs = require('fs');

const whatsappChannel = 'https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c';
const botImage = '../assets/image/reap.png';

const commandCategories = {
    General: ['menu', 'ping', 'uptime', 'quote', 'rm', 'vv', 'ss', 'loc', 'track', 'new', 'weather', 'tempmail', 'tempinbox', 'bible', 'remind', 'txtaut', 'github', 'gitrepo'],
    Games: ['truthOrDare', 'riddle', 'rockPaperScissors'],
    AI: ['ai', 'gemini', 'blackbox'],
    Search: ['define', 'search', 'movie', 'youtube', 'instagram', 'twitter', 'fb', 'google', 'wikipedia', 'fetch', 'ig'],
    Download: ['mp3', 'mp4', 'youtube', 'ytmp3', 'ytmp4', 'status', 'repo', 'play', 'download', 'lyrics'],
    Group: ['ban', 'unban', 'promote', 'demote', 'add', 'remove', 'delete', 'approve', 'approveall', 'invitelink', 'revokelink', 'mute', 'unmute', 'antilink', 'bio', 'hidetag', 'tagall', 'pin'],
    Utility: ['movie', 'anime', 'sticker','send', 'link', 'location', 'tempmail', 'tempinbox', 'deviceinfo', 'news', 'pair', 'privacy'],
    GIFs: ['slap', 'laugh', 'cry', 'sad', 'mad', 'wrinck', 'annoying', 'kick', 'happy'],
    BotFeatures: ['status', 'presence', 'setprefix', 'antitag', 'antispam', 'chatbot', 'antilink', 'antibot', 'anticall', 'antibadword', 'antidelete', 'autoviewstatus', 'autolikestatus', 'autoread', 'autobio', 'antiviewonce'],
    Support: ['repo', 'follow', 'support', 'dev', 'donate'],
};

// Function to get personalized greeting
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// Generate Menu Function
async function generateMenu(client, message) {
    const userName = message.pushName || "User"; 
    const greeting = getGreeting();

    let menuText = `
🌟 *Hello, ${greeting} ${userName}!* Welcome to *${botName}* 🤖

━━━━━━━━━━━━━━━━━━
👤 *Developer:* ${author}  
📌 *Prefix:* [ ${prefix} ]  
🔹 *Contact Dev:* [Click Here](https://wa.me/${developer})  
━━━━━━━━━━━━━━━━━━

📜 *Available Commands:*
`;

    Object.entries(commandCategories).forEach(([category, commands]) => {
        menuText += `\n📌 *${category} Commands:*`;
        commands.forEach((cmd) => {
            menuText += `\n   ➤ *${prefix}${cmd}*`;
        });
        menuText += '\n━━━━━━━━━━━━━━━━━━';
    });

    // Send WhatsApp Channel Join Button with Image Preview
    await client.sendMessage(message.chat, {
        image: fs.readFileSync(botImage), 
        caption: menuText,
        footer: "💬 Stay updated with new features & news! 🔥",
        buttons: [
            {
                buttonId: "join_channel",
                buttonText: { displayText: "🔗 Click to Join" },
                type: 1,
            },
        ],
        headerType: 4,
        contextInfo: {
            externalAdReply: {
                title: "📢 Join Our WhatsApp Channel!",
                body: "Stay updated with the latest news and features!",
                thumbnail: fs.readFileSync(botImage),
                mediaType: 1,
                mediaUrl: whatsappChannel,
                sourceUrl: whatsappChannel,
            },
        },
    });
}

module.exports = { generateMenu };
