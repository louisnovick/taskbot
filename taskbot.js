/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Run bot from the command line:

    token=<MY TOKEN> node taskbot.js

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var Botkit = require('botkit/lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
  debug: true
});

var bot = controller.spawn({
  token: process.env.token
}).startRTM();


// Add a task to the bots list
controller.hears(['add task'], 'direct_message', function(bot, message) {
  bot.reply(message,'Ok, what do you need to do today?');
});

// Show all tasks from the bots list
controller.hears(['see tasks'], 'direct_message', function(bot, message) {
  bot.reply(message,'Here are all your tasks for today.');
});

// Clear all tasks from the bots list
controller.hears(['clear tasks'], 'direct_message', function(bot, message) {
  bot.reply(message,'Sure thing, your tasklist is cleared');
});
