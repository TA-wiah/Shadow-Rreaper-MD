// Import necessary modules
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const youtube = require('../utils/youtube');

// This function now accepts the WhatsApp client passed from index.js
module.exports = (client, prefix) => {
  client.ev.on('messages.upsert', async (m) => {
    try {
      const message = m.messages[0];
      if (!message.message) return;
      if (message.key.fromMe) return;  // Ignore messages sent by the bot itself

      const { text } = message.message.conversation || '';
      if (!text) return;

      const command = text.split(' ')[0];  // Get the first word as the command (e.g., ".play")

      // Ensure the command starts with the correct prefix
      if (!command.startsWith(prefix)) return; // Ignore messages without the correct prefix

      // Strip prefix from the command
      const cmd = command.slice(prefix.length).toLowerCase(); 

      // Play command
      if (cmd === 'play') {  // Assuming the command is '.play'
        const query = text.slice(prefix.length + 5).trim(); // Extract query after ".play"
        youtube.searchYouTube(query, (results) => {
          if (results.length > 0) {
            client.sendMessage(message.key.remoteJid, `Playing: ${results[0].title}\n${results[0].link}`);
          } else {
            client.sendMessage(message.key.remoteJid, 'No results found.');
          }
        });
      }

      // Download command
      if (cmd === 'download') {
        const args = text.slice(prefix.length + 9).trim().split(' '); // Extract arguments after ".download"
        const videoUrl = args[0]; // The URL of the video
        const downloadType = args[1] || 'audio';  // 'audio' by default, otherwise 'video'

        if (ytdl.validateURL(videoUrl)) {
          try {
            const videoId = ytdl.getURLVideoID(videoUrl);
            const info = await ytdl.getInfo(videoUrl);

            client.sendMessage(message.key.remoteJid, `Downloading: ${info.videoDetails.title}`);

            // Choose download type based on the argument
            const filePath = path.join(__dirname, '..', 'downloads', `${info.videoDetails.title}.${downloadType === 'video' ? 'mp4' : 'mp3'}`);
            const videoStream = ytdl(videoUrl, { filter: downloadType === 'video' ? 'videoandaudio' : 'audioonly' });
            const writeStream = fs.createWriteStream(filePath);

            // Pipe the video/audio stream to the file
            videoStream.pipe(writeStream);

            writeStream.on('finish', () => {
              client.sendMessage(message.key.remoteJid, `Download complete! You can find the file at: ${filePath}`);
            });

            writeStream.on('error', (err) => {
              client.sendMessage(message.key.remoteJid, 'There was an error during download.');
              console.error(err);
            });
          } catch (error) {
            client.sendMessage(message.key.remoteJid, 'Failed to download the video. Please check the URL or try again later.');
            console.error(error);
          }
        } else {
          client.sendMessage(message.key.remoteJid, 'Please provide a valid YouTube URL.');
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};
