const puppeteer = require('puppeteer');
const path = require('path');

module.exports = async (client, message, query) => {
    if (!query) {
        return message.reply("Please provide a search query!");
    }

    try {
        // Launch the Puppeteer browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Perform Google search
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

        // Extract search results
        const results = await page.evaluate(() => {
            const searchResults = [];
            const items = document.querySelectorAll('.tF2Cxc');
            items.forEach(item => {
                const title = item.querySelector('h3') ? item.querySelector('h3').innerText : 'No Title';
                const link = item.querySelector('.yuRUbf a') ? item.querySelector('.yuRUbf a').href : '';
                const snippet = item.querySelector('.IsZvec') ? item.querySelector('.IsZvec').innerText : '';
                searchResults.push({ title, link, snippet });
            });
            return searchResults;
        });

        // Close the browser
        await browser.close();

        // If no results found
        if (!results.length) {
            return message.reply("No results found for your search.");
        }

        // Prepare the image path (adjust to your project structure)
        const imagePath = path.join(__dirname, '../assets/image/reap.png');  // Adjust path as necessary

        // Format the results and send the reply with the image
        let reply = "🔍 Google Search Results:\n";
        results.slice(0, 3).forEach((result, index) => {
            reply += `\n${index + 1}. *${result.title}*\n${result.snippet}...\nRead more: ${result.link}\n`;
        });

        await client.sendMessage(message.chat, { 
            image: { url: imagePath },
            text: reply,
            caption: 'Here are the search results you requested.\n\n*By*: SHADOW-REaPER_MD'
        });
    } catch (error) {
        console.error(error);
        await client.sendMessage(message.chat, { text: "An error occurred while fetching Google search results." });
    }
};
