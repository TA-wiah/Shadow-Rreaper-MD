const { generateMenu } = require('./menu-generator');
const axios = require('axios');
const { prefix } = require('../config/settings.json');
const { handleAntilink, isAntiLinkEnabled } = require('../commands/antilink');
const { approveUser, approveAllUsers, isUserApproved } = require('../commands/approval');
const { ytmp3, ytmp4 } = require('./youtube');
const deviceInfoHandler = require('../commands/deviceInfo');
const handleGroupCommands = require('../commands/groupEvents')
const { locationHandler } = require('../commands/location');
const { newsHandler } = require('../commands/news');
// const news = require('../commands/news');

const { handleSupportCommands } = require('../commands/support');
const { handleBan, handleKick, handlePromote, handleDemote, handleMute, handleUnmute, handlePin, handleUnpin, handleBio, handleHidetag, handleTagAll, handleInviteLink, handleRevokeLink, handleAdd, handleRemoveUser } = require("../commands/groupManagement");
const quoteHandler = require('../commands/quoteHandler');
const saveStatus = require("../commands/saveStatus");
const retrieveMedia = require('../commands/retrieveMedia'); 
const screenHandler = require('../commands/stalk/screenshot'); 
const linkHandler = require('../commands/scan/tinyurl'); 
const githubMedia = require('../commands/stalk/github'); 
const gitrepoMedia = require('../commands/stalk/gitrepo'); 
const igMedia = require('../commands/stalk/ig'); 
const Def = require('../commands/scan/define'); 
const FETCH = require('../commands/scan/fetch'); 
const sendBibleVerse = require('../commands/bible'); 
const STAK = require('../commands/scan/stickersearch'); 
const fetchprivacy = require('../commands/privacy');
const retrieveAnime = require('../commands/random-anime'); 
const movieMedia = require('../commands/movies'); 
const googleSearchHandler = require('../commands/googleSearchHandler');
const wikipediaSearchHandler = require('../commands/wikipediaSearchHandler');
const gameHandlers = require('../commands/games');
const aiHandlers = require('../commands/ai');
const fs = require('fs');
const gTTS = require('gtts');
const { getSettings, updateSetting, toggleSetting, getPresenceStatus, setPresenceStatus} = require("../commands/events"); 
const lyricsbring = require('../commands/scan/lyrics');
const stickersearch = require('../commands/scan/stickersearch');
const fetchCode = require('../commands/scan/code');
const privacy = require('../commands/privacy');
const createSticker = require('../commands/sticker');
const scrapGroupMembers = require("../commands/vcf&csv");
const manageGroupMembers = require("../commands/addMembersToGroup");


// Load settings from the config file
const settings = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));

// Extract phone number and mode from settings
const botPhoneNumber = settings.phoneNumber;
const botMode = settings.mode;

// Check if the bot is in public or private mode
const isPrivateMode = botMode === 'private';
const isPublicMode = botMode === 'public';

// Predefined GIFs for each emotion/action
const gifLibrary = {
    laugh: './assets/gifs/laugh.gif',
    slap: './assets/gifs/slap.gif',
    kick: './assets/gifs/kick.gif',
    knock: './assets/gifs/knock.gif',
    punch: './assets/gifs/punch.gif',
    bully: './assets/gifs/bully.gif',
    cry: './assets/gifs/cry.gif',
    sad: './assets/gifs/sad.gif',
    happy: './assets/gifs/happy.gif',
    evillaugh: './assets/gifs/evillaugh.gif',
    jubilate: './assets/gifs/jubilate.gif',
    crazy: './assets/gifs/crazy.gif',
    mad: './assets/gifs/mad.gif',
    happy: './assets/gifs/happy.gif',
    annoying: './assets/gifs/annoying.gif',
    wrinck: './assets/gifs/wrinck.gif',
  };

function setupCommandHandlers(client, message) {
    client.ev.on('messages.upsert', async (msg) => {
        if (!msg.messages) return;
    
        const message = msg.messages[0]; // Get the first message
        if (!message.message) return; // Ignore empty messages
        if (message.key.fromMe) return; // Ignore bot's own messages
    
        const messageType = Object.keys(message.message)[0]; // Get message type
        const text = message.message.conversation || message.message[messageType]?.text || "";
        const remoteJid = message.key.remoteJid;
    
        if (!text.startsWith(prefix)) return; // Ignore messages without the prefix
    
        const args = text.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
    
        // Check if the bot is in private mode
        if (isPrivateMode && remoteJid !== botPhoneNumber) {
            console.log('Unauthorized access attempt from:', remoteJid);
            await client.sendMessage(remoteJid, { 
                text: '❌ You are not authorized to use this bot in private mode.', 
                quoted: message 
            });
            return;
        }
    
        // Command Execution
        if (commandHandlers[command]) {
            try {
                const response = await commandHandlers[command](client, message, args);
    
                if (response) {
                    await client.sendMessage(remoteJid, { 
                        text: response, 
                        quoted: message 
                    });
                }
    
                // Send a reaction ✅
                await client.sendMessage(remoteJid, { 
                    react: { text: "✅", key: message.key } 
                });
            } catch (error) {
                console.error(`Error executing command ${command}:`, error);
    
                // Send error reaction 😓
                await client.sendMessage(remoteJid, { 
                    react: { text: "😓", key: message.key } 
                });
    
                await client.sendMessage(remoteJid, { 
                    text: '❌ An error occurred while executing this command.', 
                    quoted: message 
                });
            }
        }
    });    

    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const body = mek.message.conversation || "";
            const chatId = mek.key.remoteJid;

                // Check bot's mode (public or private)
                const botMode = getSettings().mode; // Assuming this gets the mode from settings.json
                const isAuthorizedUser = botMode === "private" && mek.key.fromMe; // Only owner if private mode

                // If the mode is private, only respond to authorized users
                if (botMode === "private" && !isAuthorizedUser) {
                    console.log("Bot is in private mode, and this message is from an unauthorized user.");
                    return;
                }

                if (!body.startsWith(prefix)) return;

                const args = body.trim().split(/ +/);
                const command = args.shift().slice(prefix.length).toLowerCase();

                switch (command) {
                    case "setprefix":
                        await mek.react('❄️');
                        if (args[0]) {
                            updateSetting("prefix", args[0]); // Update prefix in settings.json
                            await client.sendMessage(chatId, { 
                                text: `✅ Prefix updated to: ${args[0]}`, 
                                quotedMessageId: mek.key.id // Tagging original message
                            });
                        } else {
                            await client.sendMessage(chatId, { 
                                text: "❌ Please provide a new prefix! (e.g !#$&*+.,?/\- etc)", 
                                quotedMessageId: mek.key.id // Tagging original message
                            });
                        }
                        break;

                    case "autoreact":
                        await mek.react('❄️');
                        toggleSetting("autoReact");
                        await client.sendMessage(chatId, { 
                            text: `✅ Auto React is now ${getSettings().autoReact ? "ON" : "OFF"}`, 
                            quotedMessageId: mek.key.id // Tagging original message
                        });
                        break;

                    case "status":
                        await mek.react('🤓');
                        await client.sendMessage(chatId, { 
                            text: `🔹 Bot Status: *${getPresenceStatus()}*`, 
                            quotedMessageId: mek.key.id // Tagging original message
                        });
                        break;

                    // 🔥 Toggle Features
                    case "antitag":
                    case "antispam":
                    case "chatbot":
                    case "antilink":
                    case "antibot":
                    case "anticall":
                    case "antibadword":
                    case "antidelete":
                    case "autoviewstatus":
                    case "autolikestatus":
                    case "autoread":
                    case "autobio":
                    case "antiviewonce":
                        toggleSetting(command);
                        await mek.react('🌩️');
                        await client.sendMessage(chatId, {
                            text: `✅ *${command.toUpperCase()}* is now ${getSettings()[command] ? "ON" : "OFF"}`,
                            quotedMessageId: mek.key.id // Tagging original message
                        });
                        break;

                    default:
                        await mek.react('👀');
                        await client.sendMessage(chatId, { 
                            text: `❌ Unknown command: ${command}`, 
                            quotedMessageId: mek.key.id // Tagging original message
                        });
                        break;
                }
            } catch (error) {
                console.error("Error processing command:", error);
                await client.sendMessage(chatUpdate.messages[0].key.remoteJid, { 
                    text: "❌ An error occurred while processing the command.", 
                    quotedMessageId: chatUpdate.messages[0].key.id // Tagging original message
                });
            }
        });

        client.ev.on("messages.upsert", async (chatUpdate) => {
            if (!chatUpdate.messages || !chatUpdate.messages[0]) return;
            
            const message = chatUpdate.messages[0]; 
            if (!message.message) return; // Ignore empty messages
        
            const group = message.key.remoteJid; // Group or chat ID
            await onMessage(client, group, message); // Call message handler
        });
        
        async function onMessage(client, group, message) {
            try {
                // Extract text from different types of messages
                const text = message.message?.conversation ||
                             message.message?.extendedTextMessage?.text ||
                             message.message?.imageMessage?.caption ||
                             message.message?.videoMessage?.caption ||
                             "";
        
                if (!prefix || !text.startsWith(prefix)) return;
        
                const args = text.slice(prefix.length).trim().split(" ");
                const command = args.shift().toLowerCase();
                const sender = message.key.participant || message.key.remoteJid;
        
                // 🛑 PRIVATE MODE CHECK
                if (isPrivateMode && sender !== botPhoneNumber) {
                    console.log('Unauthorized access attempt by:', sender);
                    await client.sendMessage(group, { 
                        text: '❌ You are not authorized to use this bot in private mode.', 
                        quoted: message
                    });
                    return;  
                }
        
                // Extract mentioned users (if applicable)
                const mentionedUsers = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
                switch (command) {
                    case "antilink":
                        await client.sendMessage(group, { react: { text: "💨", key: message.key } });
                        await handleAntilink(client, group, args, prefix);
                        break;
        
                    case "approve":
                        await client.sendMessage(group, { react: { text: "✍️", key: message.key } });
                        await approveUser(client, group, mentionedUsers);
                        break;
        
                    case "approveall":
                        await client.sendMessage(group, { react: { text: "✍️", key: message.key } });
                        await approveAllUsers(client, group);
                        break;
        
                    default:
                        await client.sendMessage(group, { react: { text: "👀", key: message.key } });
                        await client.sendMessage(group, { 
                            text: `❌ Unknown command: ${command}`, 
                            quoted: message 
                        });
                        break;
                }
        
                // 🚨 Anti-Link Check
                if (isAntiLinkEnabled()) {
                    const linkPattern = /\b(?:https?|ftp|www\.)\S+\.(com|xyz|org|net|edu|gov|co|io|me|gg|ly|be|gl|sh|to|uk|us|[a-z]{2,})\b/gi;
                    if (linkPattern.test(text)) {
                        await client.sendMessage(group, { react: { text: "💨", key: message.key } });
                        await client.sendMessage(group, { 
                            text: "🚫 *Links are not allowed!*", 
                            quoted: message
                        });
                    }
                }
        
                // 🚨 Restrict actions for unapproved users
                if (!isUserApproved(sender)) {
                    await client.sendMessage(group, { 
                        text: "❌ You are not approved to send messages!", 
                        quoted: message 
                    });
                }
        
            } catch (error) {
                console.error("❌ Error processing message:", error.message);
                await client.sendMessage(group, { 
                    text: `❌ An error occurred: ${error.message}`, 
                    quoted: message 
                });
            }
        }    
        
        client.ev.on('messages.upsert', async (msg) => {
            try {
                if (!msg.messages) return;
        
                const message = msg.messages[0]; // Get the first message
                if (!message.message) return; // Ignore empty messages
                if (message.key.fromMe) return; // Ignore bot's own messages
        
                const chatId = message.key.remoteJid;
                const sender = message.key.participant || message.key.remoteJid;
                
                // Extract text from different message types
                const content = message.message?.conversation ||
                                message.message?.extendedTextMessage?.text ||
                                message.message?.imageMessage?.caption ||
                                message.message?.videoMessage?.caption ||
                                "";
        
                if (!content.startsWith(prefix)) return;
        
                const [command, ...args] = content.slice(prefix.length).trim().split(/\s+/);
                const lowerCommand = command.toLowerCase();
                const query = args.join(" "); // For search-related commands
        
                // 🛑 PRIVATE MODE CHECK
                if (isPrivateMode && sender !== botPhoneNumber) {
                    console.log('Unauthorized access attempt by:', sender);
                    await client.sendMessage(chatId, {
                        text: '❌ You are not authorized to use this bot in private mode.',
                        quoted: message
                    });
                    return;
                }
        
                // ✅ Send a reaction (Waiting)
                await client.sendMessage(chatId, { react: { text: "⏳", key: message.key } });
        
                // 🎯 Command Mapping & Aliases
                const commandMap = {
                    'truthordare': () => gameHandlers['truth or dare'](client, message),
                    'riddle': () => gameHandlers['riddle'](client, message),
                    'rock': () => gameHandlers['rock paper scissors'](client, message, args),
                    'paper': () => gameHandlers['rock paper scissors'](client, message, args),
                    'scissors': () => gameHandlers['rock paper scissors'](client, message, args),
                    'ai': () => aiHandlers['ai'](client, message, args),
                    'blackbox': () => aiHandlers['blackbox'](client, message, args),
                    'gemini': () => aiHandlers['gemini'](client, message, args),
                    'loc': () => locationHandler(client, message, args),
                    'location': () => locationHandler(client, message, args),
                    'google': () => googleSearchHandler(client, message, query),
                    'wikipedia': () => wikipediaSearchHandler(client, message, query),
                    'search': () => googleSearchHandler(client, message, query),
                    'quote': () => quoteHandler(client, message, args),
                    'follow': () => handleSupportCommands(client, message, 'repo'),
                    'support': () => handleSupportCommands(client, message, 'repo'),
                    'repo': () => handleSupportCommands(client, message, 'repo'),
                    'deviceinfo': () => deviceInfoHandler(client, message),
                    'news': () => newsHandler(client, message),
                    'tempmail': () => tempMailHandler.tempmail(client, message),
                    'tempinbox': () => tempMailHandler.tempinbox(client, message, args),
                    'readmail': () => tempMailHandler.readmail(client, message, args),
                    'welcome': () => handleGroupCommands(client, message, "welcome", args),
                    'removemsg': () => handleGroupCommands(client, message, "remove", args),
                    'ban': () => handleBan(client, sender, message),
                    'kick': () => handleKick(client, sender, message),
                    'promote': () => handlePromote(client, sender, message),
                    'demote': () => handleDemote(client, sender, message),
                    'mute': () => handleMute(client, sender),
                    'unmute': () => handleUnmute(client, sender),
                    'pin': () => handlePin(client, sender, message),
                    'unpin': () => handleUnpin(client, sender),
                    'bio': () => handleBio(client, sender, args),
                    'antilink': () => handleAntilink(client, sender, "on", args),
                    'tagall': () => handleTagAll(client, sender, message),
                    'hidetag': () => handleHidetag(client, sender, message),
                    'invitelink': () => handleInviteLink(client, sender),
                    'add': () => handleAdd(client, sender),
                    'revokelink': () => handleRevokeLink(client, chatId, message, args),
                    'rm': () => handleRemoveUser(client, chatId, message, args),
                };
        
                // ✅ Execute Command
                if (commandMap[lowerCommand]) {
                    await commandMap[lowerCommand]();
                    await client.sendMessage(chatId, { react: { text: "✅", key: message.key } });
                } else {
                    await client.sendMessage(chatId, {
                        text: `❌ Unknown command: "${command}".`,
                        quoted: message
                    });
                }
        
            } catch (error) {
                console.error("❌ Error processing command:", error.message);
                if (msg.messages[0]) {
                    const chatId = msg.messages[0].key.remoteJid;
                    await client.sendMessage(chatId, {
                        text: `❌ An error occurred: ${error.message}`,
                        quoted: msg.messages[0]
                    });
                }
            }
        }); 
        
        client.ev.on("messages.upsert", async (msg) => {
            try {
                const message = msg.messages[0]; // Ensure message is extracted correctly
                if (!message || !message.key || !message.key.remoteJid) {
                    console.warn("⚠️ Skipping: Message is undefined or missing key.remoteJid.");
                    return;
                }
        
                const chatId = message.key.remoteJid;
                const senderJid = message.key.participant || chatId;
                const senderNumber = senderJid.replace(/@s\.whatsapp\.net$/, "");
                const BOT_OWNER = botPhoneNumber || "233547838433";
        
                if (senderNumber !== BOT_OWNER) {
                    console.warn(`⚠️ Unauthorized Access: ${senderNumber} tried to use the command.`);
                    //await client.sendMessage(chatId, { text: "🚫 Sorry, only the bot owner can use this command!" });
                    return;
                }
        
                const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const documentMessage = quotedMessage?.documentMessage;
        
                if (text.startsWith(`${prefix}newgroup`) || text.startsWith(`${prefix}addtogroup`)) {
                    const args = text.split(" ");
                    if (args.length < 2) {
                        await client.sendMessage(chatId, { text: `⚠️ Usage: *${prefix}newgroup GroupName* OR *${prefix}addtogroup GroupName* (tag a CSV/VCF file)` });
                        return;
                    }
        
                    const groupName = args.slice(1).join(" ");
        
                    if (!documentMessage) {
                        await client.sendMessage(chatId, { text: "⚠️ Please tag a CSV or VCF file with your command!" });
                        return;
                    }
        
                    const fileName = documentMessage.fileName || "unknown";
                    const fileExtension = fileName.split(".").pop()?.toLowerCase();
        
                    if (!["csv", "vcf"].includes(fileExtension)) {
                        await client.sendMessage(chatId, { text: "⚠️ Unsupported file format! Please use a CSV or VCF file." });
                        return;
                    }
        
                    const filePath = path.join(__dirname, `group_members.${fileExtension}`);
                    try {
                        const buffer = await client.downloadMediaMessage(documentMessage);
                        fs.writeFileSync(filePath, buffer);
                        console.log(`📂 File saved: ${filePath}`);
                    } catch (error) {
                        console.error("❌ Error downloading file:", error);
                        await client.sendMessage(chatId, { text: "⚠️ Failed to download the file. Please try again." });
                        return;
                    }
        
                    await manageGroupMembers(client, groupName, filePath, chatId);
                    await client.sendMessage(chatId, { text: `✅ Successfully processed *${fileName}* and added members to *${groupName}*.` });
        
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`❌ Error deleting file: ${filePath}`, err);
                        } else {
                            console.log(`🗑️ Deleted file: ${filePath}`);
                        }
                    });
                }
            } catch (error) {
                console.error("❌ Error in message processing:", error);
                if (msg.messages[0]?.key?.remoteJid) {
                    await client.sendMessage(msg.messages[0].key.remoteJid, { text: "⚠️ An error occurred while processing your request." });
                }
            }
        });        
        
    console.log("✅ Command handlers are now active!");
};


const commandHandlers = {
    // General Commands
    menu: async (client, message) => {
        await message.react('📜'); // React with a menu emoji
        const menu = generateMenu();
        await client.sendMessage(message.key.remoteJid, { text: menu });
    },
    ping: async (client, message) => {
        await message.react('🏓'); // React with a ping emoji
    
        const start = Date.now(); // Capture the start time
        
        // Send an initial "Pinging..." message
        const sentMessage = await client.sendMessage(message.key.remoteJid, { text: '🏓 Pinging...' });
        
        // Calculate the bot's response time
        const latency = Date.now() - start;
        
        // Optional file to attach (e.g., a small image or audio file)
        const fileUrl = 'https://your-server.com/ping-image.jpg'; // Change this to your file URL
        
        // Send the final response with the latency and optional file
        await client.sendMessage(message.key.remoteJid, { 
            text: `🏓 Pong! The bot is online.\n⏳ Latency: ${latency}ms`,
            image: { url: fileUrl }, // Attach the file
            caption: 'Bot response time measured.'
        });
    
        await message.react('✅'); // React with a checkmark after responding
    },        
    remind: async (client, message, args) => {
        if (args.length < 2) {
            await message.react('⏰'); // React with a clock emoji
            return await client.sendMessage(message.key.remoteJid, { 
                text: '⏰ Usage: *!remind <time in minutes> <reminder message>*\nExample: !remind 5 Take a break!'
            });
        }
    
        const timeInMinutes = parseInt(args[0]);
        if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
            await message.react('❌'); // React with an error emoji
            return await client.sendMessage(message.key.remoteJid, { 
                text: '❌ Please enter a valid number of minutes.\nExample: *!remind 5 Take a break!*'
            });
        }
    
        const reminderMessage = args.slice(1).join(' ');
        await message.react('✅'); // React to confirm setting the reminder
    
        await client.sendMessage(message.key.remoteJid, { 
            text: `⏳ Reminder set for *${timeInMinutes} minutes*:\n"${reminderMessage}"`
        });
    
        setTimeout(async () => {
            await client.sendMessage(message.key.remoteJid, { 
                text: `⏰ Reminder: *${reminderMessage}*`
            });
        }, timeInMinutes * 60 * 1000);
    },     

    txtaut: async (client, message, args) => {
        await message.react('🎙️');
        if (!args.length) {
            return await client.sendMessage(message.key.remoteJid, { 
                text: '⚠️ Please provide text to convert to audio.\nExample: *!txtaut Hello, how are you?*' 
            });
        }

        const text = args.join(' ');
        const filePath = './temp_audio.mp3';

        try {
            // Convert text to speech
            const tts = new gTTS(text, 'en'); // Change 'en' to other language codes if needed
            tts.save(filePath, async function (err) {
                if (err) {
                    console.error('TTS Error:', err);
                    return await client.sendMessage(message.key.remoteJid, { text: '❌ Error generating audio!' });
                }

                // Send the generated audio file
                await client.sendMessage(message.key.remoteJid, { 
                    audio: { url: filePath },
                    mimetype: 'audio/mp3',
                    ptt: true // Sends as voice note
                });

                // Delete the file after sending
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            console.error('Error:', error);
            await client.sendMessage(message.key.remoteJid, { text: '❌ Failed to generate audio!' });
        }
    },
    // Weather Commands
    weather: async (client, message, args) => {
        await message.react('🌦️');
        const city = args.join(' ') || 'Accra';
        const apiKey = 'YOUR_OPENWEATHER_API_KEY';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(url);
            const data = response.data;
            const weatherInfo = `🌤️ Weather condition in ${data.name}:\n` +
                                `Temperature: ${data.main.temp}°C\n` +
                                `Humidity: ${data.main.temp}°C\n` +
                                `Condition: ${data.weather[0].description}`;
            await client.sendMessage(message.key.remoteJid, { text: weatherInfo });
        } catch (err) {
            await client.sendMessage(message.key.remoteJid, { text: '❌ Could not fetch weather data.' });
        }
    },
    scrap: async (client, chatId, message) => {
        await message.react('😈');
        await scrapGroupMembers(client, chatId);
    },

    // GIF Commands
    slap: async (client, message) => {
        await message.react('🤚');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.slap }, caption: '🤚 Ouch! That must have hurt!' });
    },
    laugh: async (client, message) => {
        await message.react('😂');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.laugh }, caption: '😂 That’s hilarious!' });
    },
    cry: async (client, message) => {
        await message.react('😢');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.cry }, caption: '😢 Aww, don’t cry!' });
    },
    sad: async (client, message) => {
        await message.react('😞');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.sad }, caption: '😞 Feeling a bit down?' });
    },
    mad: async (client, message) => {
        await message.react('😡');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.mad }, caption: '😡 Someone’s angry!' });
    },
    wrinck: async (client, message) => {
        await message.react('🤔');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.wrinck }, caption: '🤔 Wrinkling those brows?' });
    },
    annoying: async (client, message) => {
        await message.react('😒');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.annoying }, caption: '😒 That’s annoying!' });
    },
    kick: async (client, message) => {
        await message.react('🦵');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.kick }, caption: '🦵 Ouch! A kick to remember!' });
    },
    happy: async (client, message) => {
        await message.react('😊');
        await client.sendMessage(message.key.remoteJid, { image: { url: gifLibrary.happy }, caption: '😊 Happiness all around!' });
    },

    // Group Management
    promote: async (client, message, args) => {
        await message.react('⏳');
        const member = args[0];
        await client.groupParticipantsUpdate(message.key.remoteJid, [member], 'promote');
        await client.sendMessage(message.key.remoteJid, { text: `${member} has been promoted.` });
    },
    demote: async (client, message, args) => {
        await message.react('⏳');
        const member = args[0];
        await client.groupParticipantsUpdate(message.key.remoteJid, [member], 'demote');
        await client.sendMessage(message.key.remoteJid, { text: `${member} has been demoted.` });
    },
    add: async (client, message, args) => {
        await message.react('⏳');
        const member = args[0];
        await client.groupParticipantsUpdate(message.key.remoteJid, [member], 'add');
        await client.sendMessage(message.key.remoteJid, { text: `${member} has been added.` });
    },
    remove: async (client, message, args) => {
        await message.react('⏳');
        const member = args[0];
        await client.groupParticipantsUpdate(message.key.remoteJid, [member], 'remove');
        await client.sendMessage(message.key.remoteJid, { text: `${member} has been removed.` });
    },
    approve: async (client, message, args) => {
        await message.react('⏳');
        const member = args[0];
        await client.groupParticipantsUpdate(message.key.remoteJid, [member], 'approve');
        await client.sendMessage(message.key.remoteJid, { text: `${member} has been approved.` });
    },
    approveall: async (client, message) => {
        await message.react('⏳');
        await client.sendMessage(message.key.remoteJid, { text: 'All pending approvals have been granted.' });
    },
    mute: async (client, message) => {
        await message.react('⏳');
        await client.groupSettingUpdate(message.key.remoteJid, 'announcement');
        await client.sendMessage(message.key.remoteJid, { text: 'The group has been muted.' });
    },
    unmute: async (client, message) => {
        await message.react('⏳');
        await client.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
        await client.sendMessage(message.key.remoteJid, { text: 'The group has been unmuted.' });
    },
    hidetag: async (client, message, args) => {
        await message.react('⏳');
        const messageToHide = args.join(' ') || 'Hidden message';
        await client.sendMessage(message.key.remoteJid, { text: messageToHide }, { mentions: [] });
    },
    revoke: async (client, message) => {
        await message.react('⏳');
        await client.groupRevokeInvite(message.key.remoteJid);
        await client.sendMessage(message.key.remoteJid, { text: `🔗 Group link revoked.` });
    },
    link: async (client, message) => {
        await message.react('⏳');
        const groupInvite = await client.groupInviteCode(message.key.remoteJid);
        await client.sendMessage(message.key.remoteJid, { text: `🔗 Group link: https://chat.whatsapp.com/${groupInvite}` });
    },
    antilink: async (client, message, args) => {
        await message.react('⏳');
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            await client.sendMessage(message.key.remoteJid, { text: '🔗 Anti-link enabled.' });
        } else {
            await client.sendMessage(message.key.remoteJid, { text: '🔗 Anti-link disabled.' });
        }
    },
    delete: async (client, message) => {
        await message.react('⏳');
        await client.deleteMessage(message.key.remoteJid, { id: message.key.id, remoteJid: message.key.remoteJid });
    },

    // Download Commands
    ytmp3: async (client, message, args) => {
        await message.react('⏳');
        await ytmp3(client, message, args);
    },

    ytmp4: async (client, message, args) => {
        await message.react('⏳');
        await ytmp4(client, message, args);
    },
    vv: async (client, m) => {
        await message.react('⏳');
        await retrieveMedia(client, m); 
    }, 
    stickersearch: async (client, m) => {
        await message.react('⏳');
        await STAK(client, m); 
    }, 
    
    privacy: async (client, m) => {  
        await message.react('⏳');
        await fetchprivacy({ client, m}); 
    }, 
    pair: async (client, m, text) => {  
        await message.react('⏳');
        await fetchCode({ client, m, text }); 
    },    
    github: async (client, m, text) => {
        await message.react('⏳');
        await githubMedia(client, m, text); 
    },
    gitrepo: async (client, m, text) => {
        await message.react('⏳');
        await gitrepoMedia(client, m, text); 
    }, 
    define: async (client, m, text) => {
        await message.react('⏳');
        await Def(client, m, text); 
    },  
    lyrics: async (client, m, text) => {
        await message.react('⏳');
        await lyricsbring(client, m, text); 
    }, 
    bible: async (client, m ) => {
        await message.react('⏳');
        await sendBibleVerse(client, m ); 
    },      
    fetch: async (client, m, text) => {
        await message.react('⏳');
        await FETCH(client, m, text); 
    }, 
    ig: async (client, m, text) => {
        await message.react('⏳');
        await igMedia(client, m, text); 
    }, 
    link: async (client, m,text) => {
        await message.react('⏳');
        await linkHandler(client, m, text); 
    },  
    ss: async (client, m, text) => {
        await message.react('⏳');
        await screenHandler(client, m, text); 
    },  
    movie: async (client, message, query) => {
        await message.react('⏳');
        await movieMedia(client, message, query);
    }, 
    anime: async (client, m) => {
        await message.react('⏳');
        await retrieveAnime(client, m, text);
    },    
    sticker: async(client, message) =>{
        await message.react('⏳');
        await createSticker(client, message);
    },
    instagram: async (client, message, args) => {
        await message.react('⏳');
        const url = args[0];
        await client.sendMessage(message.key.remoteJid, { text: `📸 Downloading Instagram content from: ${url}` });
    },
    fb: async (client, message, args) => {
        await message.react('⏳');
        const url = args[0];
        await client.sendMessage(message.key.remoteJid, { text: `📘 Downloading Facebook content from: ${url}` });
    },

    uptime: async (client, message) => {
        await message.react('⏳');
        const uptime = process.uptime(); // Get uptime in seconds
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
    
        const uptimeMessage = `🔹 *Bot Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s and still kicking 😁\n\n Keep on using _SHADOW-REAPER-MD_`;
        
        await client.sendMessage(message.key.remoteJid, { text: uptimeMessage });
    },

    donate: async (client, message) => {
        await message.react('⏳');
        await client.sendMessage(message.key.remoteJid, { text: '💰 Support us via PayPal: tottimehjeffrey1@gmail.com' });
    },

    // Placeholder for additional commands
    placeholder: async (client, message) => {
        await message.react('⏳');
        await client.sendMessage(message.key.remoteJid, { text: 'This is a placeholder command. Customize it as needed.' });
    },
};

module.exports = setupCommandHandlers;
