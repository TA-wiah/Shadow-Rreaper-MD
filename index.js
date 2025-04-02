const connectShadowReaperMD = require('./utils/whatsappClient');
const setupCustomization = require('./commands/customization');
const setupCommandHandlers = require('./utils/commandHandlers');
const config = require('./config/bot-config');
const chalk = require('chalk');

const BOT_NAME = config.botName || 'SHADOW-REAPER-MD';
const AUTHOR = config.author || 'Cyber_Jay';
const VERSION = config.version || '1.0.0';
const START_TIME = new Date().toLocaleString();

console.log(chalk.blueBright(`
======================================================
🚀 ${chalk.yellow.bold(BOT_NAME)} - WhatsApp Bot
👑 Created by: ${chalk.green.bold(AUTHOR)}
🛠  Version: ${chalk.magenta(VERSION)}
📅 Start Time: ${chalk.cyan(START_TIME)}
======================================================
`));

(async () => {
    console.log(chalk.green(`🔄 Connecting to WhatsApp...`));

    try {
        const client = await connectShadowReaperMD();
        if (!client) throw new Error("WhatsApp connection failed!");

        console.log(chalk.blue(`✅ Connection Established Successfully!`));

        // 📌 Load Bot Modules
        console.log(chalk.yellow(`📂 Loading Command Modules...`));

        try {
            setupCommandHandlers(client);   // Handle commands
            setupCustomization(client);    // Customization features

            console.log(chalk.green(`🎯 All Modules Loaded Successfully!`));
        } catch (moduleError) {
            console.error(chalk.red(`❌ Error Loading Modules: ${moduleError.message}`));
        }

        console.log(chalk.green.bold(`✨ ${BOT_NAME} is Now Online and Ready to Use! Have fun😁`));

    } catch (error) {
        console.error(chalk.red('❌ Error Starting Bot:', error.message));
    }
})();
