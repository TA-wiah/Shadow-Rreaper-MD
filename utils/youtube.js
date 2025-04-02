const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
    ytmp3: async (client, message, args) => {
        const url = args[0];

        if (!url || !ytdl.validateURL(url)) {
            return await client.sendMessage(
                message.key.remoteJid, 
                { text: '❌ Please provide a valid YouTube URL!' }
            );
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_'); // Clean title
        const author = info.videoDetails.author.name; // Channel name
        const description = info.videoDetails.description ? info.videoDetails.description.substring(0, 200) + '...' : 'No description available.';
        const outputFilePath = path.join(__dirname, `${title}.mp3`);

        // Send initial message
        await client.sendMessage(
            message.key.remoteJid, 
            { text: `🎵 Converting *${info.videoDetails.title}* to MP3...\n\n📌 *Title:* ${info.videoDetails.title}\n👤 *Author:* ${author}\n📝 *Description:* ${description}` }
        );

        // Download & Convert to MP3
        const stream = ytdl(url, { quality: 'highestaudio' });

        ffmpeg(stream)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .save(outputFilePath)
            .on('end', async () => {
                await client.sendMessage(message.key.remoteJid, {
                    audio: fs.readFileSync(outputFilePath),
                    mimetype: 'audio/mpeg'
                });
                fs.unlinkSync(outputFilePath);
            })
            .on('error', async (err) => {
                console.error(err);
                await client.sendMessage(message.key.remoteJid, { text: '❌ Error converting to MP3.' });
            });
    },

    ytmp4: async (client, message, args) => {
        const url = args[0];

        if (!url || !ytdl.validateURL(url)) {
            return await client.sendMessage(
                message.key.remoteJid, 
                { text: '❌ Please provide a valid YouTube URL!' }
            );
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_'); // Clean title
        const author = info.videoDetails.author.name; // Channel name
        const description = info.videoDetails.description ? info.videoDetails.description.substring(0, 200) + '...' : 'No description available.';
        const outputFilePath = path.join(__dirname, `${title}.mp4`);

        // Send initial message
        await client.sendMessage(
            message.key.remoteJid, 
            { text: `🎥 Downloading *${info.videoDetails.title}*...\n\n📌 *Title:* ${info.videoDetails.title}\n👤 *Author:* ${author}\n📝 *Description:* ${description}` }
        );

        // Download & Save MP4
        const stream = ytdl(url, { quality: 'highestvideo' });
        const file = fs.createWriteStream(outputFilePath);

        stream.pipe(file);

        file.on('finish', async () => {
            await client.sendMessage(message.key.remoteJid, {
                video: fs.readFileSync(outputFilePath),
                mimetype: 'video/mp4'
            });
            fs.unlinkSync(outputFilePath);
        });

        file.on('error', async (err) => {
            console.error(err);
            await client.sendMessage(message.key.remoteJid, { text: '❌ Error downloading video.' });
        });
    }
};
