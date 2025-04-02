const axios = require('axios');
const { prefix } = require('../config/settings.json');

let storedTempEmail = null; // Store generated temp email

const tempMailHandler = {
    tempmail: async (client, message) => {
        try {
            // Generate a random email from 1secmail API
            const response = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox');
            storedTempEmail = response.data[0]; // Store the email for later use

            await client.sendMessage(message.key.remoteJid, { 
                text: `📬 *Your Temporary Email:*\n✉️ ${storedTempEmail}\n\nUse "${prefix}tempinbox" to check inbox.` 
            });
        } catch (error) {
            await client.sendMessage(message.key.remoteJid, { text: '❌ Error fetching temp email. Try again later.' });
        }
    },

    tempinbox: async (client, message, args, prefix) => {
        try {
            // Use stored temp email if no email is provided
            let email = args[0] || storedTempEmail;
            if (!email || !email.includes('@')) {
                return await client.sendMessage(message.key.remoteJid, 
                {
                    text: `⚠️ No temporary email found. Use "${prefix}tempmail" first.`
                });
            }

            const [username, domain] = email.split('@');

            // Fetch inbox for the provided temp email
            const inboxResponse = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
            const inbox = inboxResponse.data;

            if (inbox.length === 0) {
                return await client.sendMessage(message.key.remoteJid, { text: '📭 No new emails in your inbox.' });
            }

            let inboxMessages = '📥 *Temporary Inbox:*\n';
            for (const mail of inbox) {
                inboxMessages += `\n📧 *From:* ${mail.from}\n🔹 *Subject:* ${mail.subject}\n📅 *Date:* ${mail.date}\n💬 *ID:* ${mail.id}\n`;
            }

            inboxMessages += `\n\n📌 Reply with "${prefix}readmail [ID]" to read an email.`;

            await client.sendMessage(message.key.remoteJid, { text: inboxMessages });
        } catch (error) {
            await client.sendMessage(message.key.remoteJid, { text: '❌ Error fetching inbox. Try again later.' });
        }
    },

    readmail: async (client, message, args) => {
        try {
            if (!storedTempEmail) {
                return await client.sendMessage(message.key.remoteJid, 
                    {
                        text: `⚠️ No temporary email found. Use "${prefix}tempmail" first.`
                    });
            }

            const [username, domain] = storedTempEmail.split('@');
            const emailId = args[0];

            if (!emailId) {
                return await client.sendMessage(message.key.remoteJid, { text: '⚠️ Please provide an email ID. Use "${prefix}tempinbox" to get the email ID.' });
            }

            // Fetch email details
            const emailResponse = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${emailId}`);
            const emailData = emailResponse.data;

            if (!emailData.subject) {
                return await client.sendMessage(message.key.remoteJid, { text: '❌ Email not found or expired.' });
            }

            const emailContent = `📩 *Email Details:*\n\n📧 *From:* ${emailData.from}\n🔹 *Subject:* ${emailData.subject}\n📅 *Date:* ${emailData.date}\n\n💌 *Message:* \n${emailData.textBody || '[No text content]'}\n`;

            await client.sendMessage(message.key.remoteJid, { text: emailContent });
        } catch (error) {
            await client.sendMessage(message.key.remoteJid, { text: '❌ Error fetching email content. Try again later.' });
        }
    }
};

module.exports = tempMailHandler;
