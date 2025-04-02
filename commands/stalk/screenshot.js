module.exports = async (context) => {

const { client, m, text,} = context;
const { botName } = require('../config/settings.json');


try {
let cap = `Screenshot by ${botName}`

if (!text) return m.reply("Provide a website link to screenshot.")

const image = `https://image.thum.io/get/fullpage/${text}`

await client.sendMessage(m.chat, { image: { url: image }, caption: cap}, {quoted: m });


} catch (error) {

m.reply("An error occured.")

}

}
