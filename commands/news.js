// news.js
const axios = require('axios');

const fetchNewsByCategory = async (category) => {
    try {
        const apiKey = 'YOUR_API_KEY';
        const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${apiKey}`;
        const response = await axios.get(url);
        const articles = response.data.articles;
        const topArticles = articles.slice(0, 2).map((article) => article.title);
        return topArticles.length > 0 ? topArticles : [`No news available for ${category} at the moment.`];
    } catch (error) {
        console.error(`Error fetching ${category} news:`, error);
        return [`Sorry, there was an error fetching ${category} news.`];
    }
};

const fetchAllNews = async () => {
    const categories = ['general', 'technology', 'business', 'health', 'sports', 'entertainment'];
    const categoryMap = {
        general: 'global',
        technology: 'tech',
        business: 'stock & trade',
        health: 'others',
        sports: 'cars',
        entertainment: 'local',
    };
    
    let allNews = [];
    for (const [category, label] of Object.entries(categoryMap)) {
        const categoryNews = await fetchNewsByCategory(category);
        allNews.push(`📰 ${label.charAt(0).toUpperCase() + label.slice(1)} News:`);
        allNews.push(...categoryNews);
        allNews.push('\n');
    }

    return allNews.join('\n');
};

const newsHandler = async (client, message) => {
    try {
        const newsContent = await fetchAllNews(); // Fetch all categorized news
        await client.sendMessage(message.key.remoteJid, { text: newsContent });
    } catch (error) {
        console.error('Error sending categorized news:', error);
        await client.sendMessage(message.key.remoteJid, { text: 'Sorry, there was an error sending the categorized news.' });
    }
};

// Export the news function for use in other files
module.exports = { newsHandler };
