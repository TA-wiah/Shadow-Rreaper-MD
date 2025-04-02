// bible.js
const path = require('path');
const fetch = require('node-fetch'); // Ensure you have node-fetch or use any other method to fetch data from the API

// Function to fetch a daily Bible verse from the API
async function getDailyBibleVerse() {
    try {
        const response = await fetch("https://bible-api.com/random"); // API endpoint to get a random verse
        const data = await response.json();
        
        // Check if the response contains a verse
        if (data && data.text) {
            return `${data.text} – ${data.reference}`;
        } else {
            throw new Error("Couldn't fetch the Bible verse.");
        }
    } catch (error) {
        console.error("Error fetching Bible verse:", error);
        return "Sorry, I couldn't fetch a Bible verse at this time.";
    }
}

// Main function to fetch the Bible verse and send the message
async function sendBibleVerse(client, m) {
    const bibleVerse = await getDailyBibleVerse();

    // Send the message with the Bible verse and image
    await client.sendMessage(m.chat, {
        caption: `
            *Hello, 👋 This is SHADOW-REAPER-MD*
            Daily Bible reading: 
            ╭───────────────────
            │ 🙏🙏🙏🙏🙏🙏🙏
            │ 🤲 ${bibleVerse}
            │
            │───>>>By Cyber_Jay      
            ╰───────────────────
        `,
        image: path.join(__dirname, '../assets/image/reap.png')
    }, { quoted: m });
}

// The bible handler function
const bible = {
    async bible(client, m) {
        await sendBibleVerse(client, m);
    }
};

// Export bible handler
module.exports = bible;
