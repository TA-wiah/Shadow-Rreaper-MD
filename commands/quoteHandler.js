const path = require('path');

module.exports = async (client, message, args) => {
    const quotes = [
        "The best way to predict the future is to create it. – Abraham Lincoln",
        "Life is what happens when you're busy making other plans. – John Lennon",
        "It does not matter how slowly you go as long as you do not stop. – Confucius",
        "In the end, we will remember not the words of our enemies, but the silence of our friends. – Martin Luther King Jr.",
        "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well. – Ralph Waldo Emerson",
        "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
        "You only live once, but if you do it right, once is enough. – Mae West",
        "It always seems impossible until it’s done. – Nelson Mandela",
        "Don’t watch the clock; do what you do. Keep going. – Sam Levenson",
        "The only way to do great work is to love what you do. – Steve Jobs",
        "It's easier said than done - Cyber_Jay",
        "Practice makes Permanent - Cyber_Jay",
        "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
        "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
        "Success usually comes to those who are too busy to be looking for it. – Henry David Thoreau",
        "Your time is limited, so don’t waste it living someone else’s life. – Steve Jobs",
        "The best revenge is massive success. – Frank Sinatra",
        "You must be the change you wish to see in the world. – Mahatma Gandhi",
        "Act as if what you do makes a difference. It does. – William James"
    ];    

    // Get a random quote from the list
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Format the message with nice formatting
    const messageCaption = `
╭───────────────────
│ 📅*Daily Life Quote*
│
│ 🗣${randomQuote}
│
│ — *by* SHADOW-REAPER-MD
╰───────────────────
`;

    // Prepare the image path (adjust to your project structure)
    const imagePath = path.join(__dirname, '../assets/image/reap.png');
    
    // Send the message with the image and formatted quote
    await client.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: messageCaption
    });
};
