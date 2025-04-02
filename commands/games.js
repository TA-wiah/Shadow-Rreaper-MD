const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleGameCommands = async (client, message, command, args) => {
    const chatId = message.key.remoteJid;
    
    switch (command.toLowerCase()) {
        case 'truth or dare': {
            const truths = [
                'What’s your biggest secret?',
                'What’s your most embarrassing moment?',
                'Who was your first crush?',
                'Have you ever lied to get out of trouble?',
                'What’s the worst gift you’ve ever received?',
            ];
            const dares = [
                'Send a funny selfie!',
                'Sing your favorite song and send it as a voice note.',
                'Send a voice note saying "I love bananas" in a funny voice!',
                'Send a random emoji to your last WhatsApp contact.',
                'Tell the group the last lie you told!',
            ];
            const truthOrDare = Math.random() < 0.5 ? truths : dares;
            const result = truthOrDare[Math.floor(Math.random() * truthOrDare.length)];
            await client.sendMessage(chatId, { text: `🎲 *Truth or Dare?*\n\n${result}` });
            break;
        }
        
        case 'riddle': {
            const riddles = [
                { question: 'What has keys but can’t open locks?', answer: 'A piano' },
                { question: 'What has one eye but can’t see?', answer: 'A needle' },
                { question: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps' },
                { question: 'What has hands but can’t clap?', answer: 'A clock' },
                { question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'The letter M' },
            ];
            
            const riddle = riddles[Math.floor(Math.random() * riddles.length)];
            await client.sendMessage(chatId, { text: `🧩 *Riddle Challenge!*\n\n${riddle.question}` });
            
            await delay(10000);
            await client.sendMessage(chatId, { text: `📝 *Answer:* ${riddle.answer}` });
            break;
        }
        
        case 'rock paper scissors': {
            const choices = ['rock', 'paper', 'scissors'];
            const userChoice = args[0]?.toLowerCase();
            
            if (!choices.includes(userChoice)) {
                return await client.sendMessage(
                    chatId, 
                    { text: '🪨📜✂ *Rock Paper Scissors*\n\nType: `rock`, `paper`, or `scissors` to play!' }
                );
            }
            
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            let result;

            if (userChoice === botChoice) {
                result = '😐 It’s a tie!';
            } else if (
                (userChoice === 'rock' && botChoice === 'scissors') ||
                (userChoice === 'paper' && botChoice === 'rock') ||
                (userChoice === 'scissors' && botChoice === 'paper')
            ) {
                result = '🎉 You win!';
            } else {
                result = '🤖 Bot wins!';
            }
            
            await client.sendMessage(
                chatId, 
                { text: `🎮 *Rock Paper Scissors*\n\n🤖 *Bot:* ${botChoice}\n👤 *You:* ${userChoice}\n\n${result}` }
            );
            break;
        }
        
        default:
            await client.sendMessage(chatId, { text: `❌ Unknown game command: "${command}". Please try again.` });
    }
};

module.exports = { handleGameCommands };
