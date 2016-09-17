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
var res = '';
var value = '';

var controller = Botkit.slackbot({
  debug: true
});

var bot = controller.spawn({
  token: process.env.token
}).startRTM();

// Add a task to the bots list
controller.hears(['add tasks'], 'direct_message', function(bot, message) {
  bot.startConversation(message, function(err,convo) {
    convo.ask('Type the word "done" once all tasks are added.', [
      {
        pattern: 'done',
        callback: function(response, convo) {
          // since no further messages are queued after this,
          // the conversation will end naturally with status === ‘completed’
          convo.say('Okay I am done listening for tasks!');
          convo.next();
        },
      },
      {
        default: true,
        callback: function(response, convo) {
          convo.say('Task added, "' + response.text + '".');
          convo.repeat();
          convo.next();
        },
      },
    ]);
    convo.on('end', function(convo) {
      if (convo.status == 'completed') {
        var res = convo.extractResponses();
        var value = convo.extractResponse('key');
      }
    });
    /*bot.startConversation(message, function(err,convo) {
      convo.ask('Type the word "done" once all tasks are added.', function(response, convo) {
        if(response.text !== 'done') {
          convo.say('Task added, "' + response.text + '".');
          convo.repeat();
        } else {
          convo.say('All tasks added.');
        }

        convo.next();
      })
    });*/
  });
});

// Show all tasks from the bots list
controller.hears(['see tasks'], 'direct_message', function(bot, message) {
  bot.reply(message,'Here are all your tasks for today.\n' + res + value );
});

// Clear all tasks from the bots list
controller.hears(['clear tasks'], 'direct_message', function(bot, message) {
  bot.reply(message,'Sure thing, your tasklist is cleared');
});
