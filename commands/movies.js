const axios = require('axios');

// Your OMDB API Key
const API_KEY = 'YOUR_OMDB_API_KEY';

module.exports = async (client, message, query) => {
    if (!query) {
        return message.reply("Please provide a movie name to search for!");
    }

    try {
        // Construct the URL for OMDb API movie search
        const searchURL = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${API_KEY}`;

        // Fetch movie data from OMDb
        const response = await axios.get(searchURL);
        const movie = response.data;

        // If no movie is found
        if (movie.Response === 'False') {
            return message.reply("No movie found with that title.");
        }

        // Prepare movie details with emojis
        const movieDetails = `
            ╭───────────────────
            │ 
            │ 🎬 *Movie Search Result*:
            │ 
            │ *Title*: ${movie.Title} 🎥
            │ *Year*: ${movie.Year} 📅
            │ *Runtime *: ${movie.Runtime} ⏳
            │ *Rated*: ${movie.Rated} ⭐
            │ *Released*: ${movie.Released} 📆
            │ *Director*: ${movie.Director} 🎬
            │ *Writer*: ${movie.Writer} ✍
            │ *Country*: ${movie.Country} 🌍
            │ *Language *: ${movie.Language } 🌐
            │ *BoxOffice *: ${movie.BoxOffice } 📦
            │ *Actors*: ${movie.Actors} 👥
            │ *Genre*: ${movie.Genre} 🎭
            │ *Plot*: ${movie.Plot} 📖
            │ *IMDB Rating*: ${movie.imdbRating}/10 🌟
            │ 
            │ 🎥 *Poster*:
            │ ${movie.Poster} 🖼️
            │
            │───>>> By SHADOW-REAPER ⚡
            ╰───────────────────
        `;

        // Send movie details and the poster image along with download link
        await client.sendMessage(message.chat, {
            text: movieDetails,
            image: { url: movie.Poster }, // Send the movie poster image
            caption: `Here are the details for "${movie.Title}".\nYou can also download the poster: [Download Poster](${movie.Poster})`
        });

    } catch (error) {
        console.error(error);
        await client.sendMessage(message.chat, { text: "An error occurred while fetching movie details." });
    }
};
