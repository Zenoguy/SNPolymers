require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function run() {
  console.log('Bot Token:', TELEGRAM_BOT_TOKEN);
  const chatIds = ['5078059280', '8023911159'];
  
  for (const chatId of chatIds) {
    try {
      const messageText = `🧪 *Test Direct Message* to chat ID ${chatId}`;
      const url = `${TELEGRAM_API_BASE}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(messageText)}&parse_mode=Markdown`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(`Result for ${chatId}:`, data);
    } catch (err) {
      console.error(`Error for ${chatId}:`, err);
    }
  }
}

run();
