module.exports = async (client, message) => {

  const prefix = '.'
  const textL = message.text.toLowerCase();
  const quotedMessage = message.msg?.contextInfo?.quotedMessage;



if (quotedMessage && textL.startsWith(prefix + "send") && !message.quoted.chat.includes("status@broadcast")) {
    return message.reply("You did not tag a status media to save.");
  }


  if (quotedMessage && textL.startsWith(prefix + "send") && message.quoted.chat.includes("status@broadcast")) {
    
    

    if (quotedMessage.imageMessage) {
      let imageCaption = quotedMessage.imageMessage.caption;
      let imageUrl = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      client.sendMessage(message.chat, { image: { url: imageUrl }, caption: imageCaption });
    }

    if (quotedMessage.videoMessage) {
      let videoCaption = quotedMessage.videoMessage.caption;
      let videoUrl = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      client.sendMessage(message.chat, { video: { url: videoUrl }, caption: videoCaption });
    }
  }

  
  
}