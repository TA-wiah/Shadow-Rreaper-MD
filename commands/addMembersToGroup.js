const fs = require("fs");
const path = require("path");

async function manageGroupMembers(sock, groupName, filePath, chatId, message) {
    try {
        // React with ⏳ to show that the process has started
        await message.react("⏳");

        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            await message.react("❌");
            await sock.sendMessage(chatId, { text: `⚠️ File not found: ${filePath}` });
            return;
        }

        const members = extractNumbersFromFile(filePath);
        if (members.length === 0) {
            console.log("❌ No valid numbers found in the file.");
            await message.react("⚠️");
            await sock.sendMessage(chatId, { text: "⚠️ No valid numbers found in the file." });
            return;
        }

        const memberJids = members.map(num => num + "@s.whatsapp.net");

        // Fetch all groups
        const groups = await sock.groupFetchAllParticipating();
        let group = Object.values(groups).find(g => g.subject.toLowerCase() === groupName.toLowerCase());

        if (!group) {
            console.log(`❌ Group '${groupName}' not found. Creating a new group...`);
            const newGroup = await sock.groupCreate(groupName, [sock.user.id]);
            group = { id: newGroup.id, subject: groupName };
            console.log(`✅ Group '${groupName}' created successfully.`);
            await sock.sendMessage(chatId, { text: `✅ New group *${groupName}* created!` });
        } else {
            console.log(`✅ Found existing group '${groupName}'. Adding members...`);
        }

        // Add members in batches of 4
        for (let i = 0; i < memberJids.length; i += 4) {
            const batch = memberJids.slice(i, i + 4);
            await sock.groupParticipantsUpdate(group.id, batch, "add");
            console.log(`👥 Added members: ${batch}`);
            await new Promise(res => setTimeout(res, 3000)); // Small delay to avoid spam detection
        }

        console.log(`🚀 All members added to '${groupName}'`);
        await message.react("✅");
        await sock.sendMessage(chatId, { text: `✅ Members have been added to *${groupName}*!` });

        // Delete the file after use
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (error) {
        console.error("❌ Error managing group members:", error);
        await message.react("❌");
        await sock.sendMessage(chatId, { text: "⚠️ Failed to add members." });
    }
}

// Extract numbers from CSV or VCF
function extractNumbersFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let numbers = [];

    try {
        const content = fs.readFileSync(filePath, "utf-8");

        if (ext === ".csv") {
            numbers = content.split("\n").slice(1).map(line => line.split(",")[1]?.trim()).filter(Boolean);
        } else if (ext === ".vcf") {
            const matches = content.match(/TEL;TYPE=CELL:\+?(\d+)/g);
            if (matches) {
                numbers = matches.map(line => line.replace(/\D/g, ""));
            }
        }
    } catch (error) {
        console.error("❌ Error reading file:", error);
    }

    return numbers.filter(num => num.length > 8);
}

module.exports = manageGroupMembers;
