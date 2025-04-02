const fs = require("fs");
const path = require("path");
const { phoneNumber} = require('../config/settings.json');

const OWNER_NUMBER = phoneNumber || 233547838433; 

async function scrapGroupMembers(sock, chatId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const groupName = groupMetadata.subject.replace(/[^a-zA-Z0-9]/g, "_"); // Clean name for filename
        const members = groupMetadata.participants.map((member) => ({
            id: member.id,
            number: member.id.split("@")[0]
        }));

        // Define file paths
        const csvFilePath = path.join(__dirname, `${groupName}.csv`);
        const vcfFilePath = path.join(__dirname, `${groupName}.vcf`);

        // Save as CSV
        const csvContent = "Name,Number\n" + members.map(m => `Member,${m.number}`).join("\n");
        fs.writeFileSync(csvFilePath, csvContent);

        // Save as VCF
        const vcfContent = members.map(m => `BEGIN:VCARD\nVERSION:3.0\nFN:Member\nTEL;TYPE=CELL:+${m.number}\nEND:VCARD`).join("\n");
        fs.writeFileSync(vcfFilePath, vcfContent);

        // Send a message with the group name before sending files
        const ownerJid = OWNER_NUMBER + "@s.whatsapp.net"; // Convert to WhatsApp JID
        await sock.sendMessage(ownerJid, { text: `📂 Here are the files from *${groupMetadata.subject}*` });

        // Send CSV file
        await sock.sendMessage(ownerJid, { document: fs.readFileSync(csvFilePath), mimetype: "text/csv", fileName: `${groupName}.csv` });

        // Send VCF file
        await sock.sendMessage(ownerJid, { document: fs.readFileSync(vcfFilePath), mimetype: "text/vcard", fileName: `${groupName}.vcf` });

        console.log(`✅ Group members list sent and will now be deleted: ${groupName}.csv & ${groupName}.vcf`);

        // Delete files after sending
        fs.unlinkSync(csvFilePath);
        fs.unlinkSync(vcfFilePath);
        console.log(`🗑️ Files deleted: ${groupName}.csv & ${groupName}.vcf`);

    } catch (error) {
        console.error("❌ Error fetching group members:", error);

        // Notify the owner if something goes wrong
        await sock.sendMessage(OWNER_NUMBER + "@s.whatsapp.net", { text: "⚠️ Failed to retrieve group members. Make sure the bot is an admin!" });
    }
}

module.exports = scrapGroupMembers;
