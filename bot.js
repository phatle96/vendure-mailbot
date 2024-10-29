require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(bodyParser.json());

let users = [];
const usersFile = 'users.json';

// Load or initialize user data
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers() {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function addUser(chatId, username, emailAddress) {
    const userExists = users.some((user) => user.chatId === chatId);
    if (!userExists) {
        users.push({ chatId, username, emailAddress });
        saveUsers();
    }
}

// Import listeners and API routes
require('./listeners/start')(bot, addUser);
require('./apis/email')(app, bot, users, saveUsers);

// Start the Express server
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});