const fs = require('fs');

module.exports = (bot, addUser) => {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Welcome! Please provide your email address to receive notifications for new emails.");

        bot.on('message', (msg) => {
            const emailAddress = msg.text.trim().toLowerCase(); // Convert to lowercase

            // Check if the message is a valid email format
            if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailAddress)) {
                addUser(chatId, msg.from.username, emailAddress);

                // Check for the latest email content for the provided email address
                const latestContent = getLatestEmailContent(emailAddress);

                if (latestContent) {
                    bot.sendMessage(chatId, `Thank you! You will now receive notifications for any new emails sent to ${emailAddress}.\n\nLatest email content:\n\n${latestContent}`);
                } else {
                    bot.sendMessage(chatId, `Thank you! You will now receive notifications for any new emails sent to ${emailAddress}. No previous emails found.`);
                }

                bot.removeListener('message', arguments.callee); // Remove listener after email is saved
            } else {
                bot.sendMessage(chatId, "That doesn’t look like a valid email address. Please try again.");
            }
        });
    });

    // Function to get the latest email content for a given email address
    function getLatestEmailContent(emailAddress) {
        if (!fs.existsSync('emails.json')) {
            return null;
        }

        const emails = JSON.parse(fs.readFileSync('emails.json'));

        // Find emails matching the address, sorted by the latest timestamp
        const userEmails = emails
            .filter((email) => email.emailAddress.toLowerCase() === emailAddress) // Convert stored email to lowercase
            .sort((a, b) => b.timestamp - a.timestamp);

        // Return the latest email content if found
        return userEmails.length > 0 ? userEmails[0].content : null;
    }
};