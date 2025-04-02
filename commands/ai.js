// aiHandler.js
const OpenAI = require('openai');
const ai = require('unlimited-ai'); // Import the unlimited-ai library for Gemini and Blackbox
const openai = new OpenAI({
    apiKey: 'YOUR_OPENAI_API_KEY' // 🔹 Replace with your actual OpenAI API key
});

// GPT-4 Handler
const aiHandler = {
    ai: async (client, message, args) => {
        const query = args.join(' ') || 'Hello!';

        // Notify the user that the AI is thinking
        await client.sendMessage(message.key.remoteJid, { text: `🤖 AI (GPT-4) is thinking about:\n "${query}"` });

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: query }]
            });

            const aiResponse = response.choices[0].message.content;
            await client.sendMessage(message.key.remoteJid, { text: `🤖 AI says (GPT-4): ${aiResponse}` });

        } catch (error) {
            console.error('OpenAI GPT-4 Error:', error);
            await client.sendMessage(message.key.remoteJid, { text: '❌ GPT-4 AI is currently unavailable. Please try again later.' });
        }
    },

    blackbox: async (client, message, args) => {
        const query = args.join(' ') || 'Hello!';

        // Notify the user that the AI is thinking
        await client.sendMessage(message.key.remoteJid, { text: `🤖 AI (Blackbox) is thinking about: "${query}"` });

        try {
            const model = 'blackbox'; // Specify the Blackbox model here
            const messages = [
                { role: 'user', content: query },
                { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' }
            ];

            const aiResult = await ai.generate(model, messages);
            await client.sendMessage(message.key.remoteJid, { text: `🤖 AI says (Blackbox): ${aiResult}` });

        } catch (error) {
            console.error('Blackbox AI Error:', error);
            await client.sendMessage(message.key.remoteJid, { text: '❌ Blackbox AI is currently unavailable. Please try again later.' });
        }
    },
    gemini: async (client, message, args) => {
        const query = args.join(' ') || 'Hello!';

        // Notify the user that the AI is thinking
        await client.sendMessage(message.key.remoteJid, { text: `🤖 AI (Gemini) is thinking about: "${query}"` });

        try {
            const model = 'gemini'; // Specify the Gemini model here
            const messages = [
                { role: 'user', content: query },
                { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' }
            ];

            const aiResult = await ai.generate(model, messages);
            await client.sendMessage(message.key.remoteJid, { text: `🤖 AI says (Gemini):\n ${aiResult}` });

        } catch (error) {
            console.error('Gemini AI Error:', error);
            await client.sendMessage(message.key.remoteJid, { text: '❌ Gemini AI is currently unavailable. Please try again later.' });
        }
    }
};

module.exports = aiHandler;
