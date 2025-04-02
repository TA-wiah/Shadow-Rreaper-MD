// supportCommands.js

const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const handleSupportCommands = async (client, message, command) => {
  const chatId = message.key.remoteJid;

  // Fetch repository data from GitHub
  const response = await fetch("https://api.github.com/repos/TA-wiah/Shadow-Rreaper-MD");
  const repoData = await response.json();

  const repoInfo = {
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    lastUpdate: repoData.updated_at,
    owner: repoData.owner.login,
    createdAt: repoData.created_at,
    url: repoData.html_url
  };

  const createdDate = new Date(repoInfo.createdAt).toLocaleDateString("en-GB");
  const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString("en-GB");

  const supportResponses = {
    repo: {
      caption: `
        *Hello, 👋 This is SHADOW-REAPER-MD*
        The best bot in the universe developed by Cyber Jay. Fork and give a star 🌟 to my repo
        ╭───────────────────
        │ ⭐*Stars:* ${repoInfo.stars}
        │ 🔁*Forks:* ${repoInfo.forks}
        │ 🗓*Release Date:* ${createdDate}
        │ 🕔*Last Update:* ${lastUpdateDate}
        │ 👥*Owner:* ${repoInfo.owner}
        │ 📂*Repository:* ${repoInfo.url}
        │ 🔐*Session:* https://shadow-reaper-session-id.onrender.com/
        │
        │───>>>By Cyber_Jay      
        ╰───────────────────
      `,
      image: path.join(__dirname, '../assets/image/reap.png')
    },
    follow: {
      caption: `
        *Follow my channels and join my groups for more updates*
        ╭───────────────────
        │ 📲*Wachannel:* https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c
        │ 👻*wagroup:* N/A
        │ 🤳🏻*Telegram:* https://t.me/junior_billyhills
        │ 📞*Contact owner:* https://wa.me/qr/M2BKBKULFC5QP1
        │
        │───>>>By Cyber_Jay  
        ╰───────────────────
      `,
      image: path.join(__dirname, '../assets/image/reap.png')
    }
  };

  if (supportResponses[command]) {
    try {
      if (fs.existsSync(supportResponses[command].image)) {
        await client.sendMessage(chatId, {
          image: fs.createReadStream(supportResponses[command].image),
          caption: supportResponses[command].caption
        });
      } else {
        console.error("Image file not found.");
        await client.sendMessage(chatId, { text: "An error occurred while processing your request. Image not found." });
      }
    } catch (error) {
      console.error(`Error processing support command "${command}": ${error.message}`);
      await client.sendMessage(chatId, { text: 'An error occurred while processing your request.' });
    }
  } else {
    await client.sendMessage(chatId, { text: `❌ Unknown support command: "${command}"` });
  }
};

module.exports = { handleSupportCommands };
