const fs = require('fs');

module.exports = (app, bot, users, saveUsers) => {
    const emailsFile = 'emails.json';

    let emails = [];
    if (fs.existsSync(emailsFile)) {
        emails = JSON.parse(fs.readFileSync(emailsFile));
    }

    function saveEmails() {
        fs.writeFileSync(emailsFile, JSON.stringify(emails, null, 2));
    }

    function notifyUsers(emailAddress, content) {
        users.forEach((user) => {
            if (user.emailAddress.toLowerCase() === emailAddress.toLowerCase()) {
                bot.sendMessage(user.chatId, `New email content for ${emailAddress}:\n\n${content}`);
            }
        });
    }

    app.post('/api/save-email', (req, res) => {
        const { emailAddress, content } = req.body;

        if (!emailAddress || !content) {
            return res.status(400).json({ error: 'Both emailAddress and content are required' });
        }

        emails.push({ emailAddress, content, timestamp: Date.now() });
        saveEmails();
        notifyUsers(emailAddress, content);

        res.status(200).json({ success: true, message: 'Email content saved and notification sent' });
    });
};