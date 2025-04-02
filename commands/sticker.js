const { MessageMedia } = require('whatsapp-web.js');
const Jimp = require('jimp');
const settings = require('../config/settings.json');

async function createTextSticker(text) {
    const image = new Jimp(512, 512, 0xFFFFFFFF);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 10, 200, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 492);
    return await image.getBufferAsync(Jimp.MIME_PNG);
}

async function createImageWithTextSticker(imageBuffer, text) {
    const image = await Jimp.read(imageBuffer);
    image.resize(512, 512); // Resize to sticker size

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 10, 450, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 492);

    return await image.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = async (client, message) => {
    try {
        if (message.hasMedia) {
            const media = await message.downloadMedia();

            if (media.mimetype.startsWith('image')) {
                const imgBuffer = Buffer.from(media.data, 'base64');

                if (message.caption) {
                    // Image with text
                    const imgWithTextBuffer = await createImageWithTextSticker(imgBuffer, message.caption);
                    await client.sendMessage(
                        message.from,
                        new MessageMedia('image/png', imgWithTextBuffer.toString('base64')),
                        {
                            sendMediaAsSticker: true,
                            stickerAuthor: settings.stickerAuthor,
                            stickerName: message.caption
                        }
                    );
                } else {
                    // Only image
                    await client.sendMessage(
                        message.from,
                        new MessageMedia('image/png', imgBuffer.toString('base64')),
                        {
                            sendMediaAsSticker: true,
                            stickerAuthor: settings.stickerAuthor,
                            stickerName: 'Sticker'
                        }
                    );
                }
            } else {
                message.reply('⚠️ Please send an image or text to create a sticker.');
            }
        } else if (message.body.trim()) {
            // Only text
            const textSticker = await createTextSticker(message.body);
            await client.sendMessage(
                message.from,
                new MessageMedia('image/png', textSticker.toString('base64')),
                {
                    sendMediaAsSticker: true,
                    stickerAuthor: settings.stickerAuthor,
                    stickerName: 'Text Sticker'
                }
            );
        } else {
            message.reply('⚠️ Please send an image, text, or both to create a sticker!');
        }
    } catch (error) {
        console.error('❌ Error creating sticker:', error);
        message.reply('⚠️ An error occurred while creating the sticker. Please try again.');
    }
};
