const axios = require('axios');

module.exports = async (client, message, query) => {
    if (!query) {
        return message.reply("Please provide a search query!");
    }

    const searchURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    
    try {
        const response = await axios.get(searchURL);
        const results = response.data.query.search;

        if (results.length === 0) {
            return message.reply("No results found for your search.");
        }

        // Send the top 3 search results
        let reply = "📚 Wikipedia Search Results:\n";
        results.slice(0, 3).forEach((result, index) => {
            const title = result.title;
            const snippet = result.snippet.replace(/<[^>]+>/g, ''); // Remove HTML tags
            const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

            reply += `\n${index + 1}. *${title}*\n${snippet}...\nRead more: ${url}\n`;
        });

        await client.sendMessage(message.chat, { text: reply });
    } catch (error) {
        console.error(error);
        await client.sendMessage(message.chat, { text: "An error occurred while fetching Wikipedia results." });
    }
};
