module.exports = async (context) => {

const { client, m } = context;

const Myself = await client.decodeJid(client.user.id);
    
    const {
                readreceipts,
                profile,
                status,
                online,
                last,
                groupadd,
                calladd
        } = await client.fetchPrivacySettings(true);
        
        const fnn = `*Current Privacy Settings*

* Name : ${client.user.name}
* Online: ${online}
* Profile picture : ${profile}
* Last seen : ${last}
* Read receipt : ${readreceipts}
* Group add : ${groupadd}
* Status : ${status}
* Call add : ${calladd}`;


const avatar = await client.profilePictureUrl(Myself, 'image').catch(_ => 'https://i.imgur.com/9uUP6sG.png');

await client.sendMessage(m.chat, { image: { url: avatar}, caption: fnn}, { quoted: m}) 

}   
