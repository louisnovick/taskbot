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
  debug: true,
  json_file_store: './db'
});

var bot = controller.spawn({
  token: process.env.token
}).startRTM();

// Add a task to the bots list
controller.hears(['add tasks'], 'direct_message', function(bot, message) {
  var user = message.user;
  bot.startConversation(message, function(err,convo) {
    convo.ask('Add your tasks using a comma to seperate them.', [
      {
        default: true,
        callback: function(response, convo) {
          convo.say('Tasks added, "' + response.text + '".');
          convo.next();
        },
      },
    ]);
    convo.on('end', function(convo) {
      if (convo.status == 'completed') {
        console.log('completed');
        var tasks = convo.extractResponses();
        if(tasks != undefined) {
          controller.storage.users.save({id: user, tasks: tasks}, function(err) {
            if(err) {
              console.log(err);
            }
          });
        } else {
          console.log('There are no tasks to save');
        }
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
  var user = message.user;
  controller.storage.users.get(user, function(err, user_data) {
    if(user_data != undefined) {
      var userTasks = user_data.tasks['Add your tasks using a comma to seperate them.'];
      if(userTasks != undefined) {
        console.log(userTasks);
        bot.reply(message, 'Here are all your tasks for today. ' + userTasks);
      } else {
        bot.reply(message, "You haven't added any tasks yet. Add some by typing 'add tasks'.");
      }
    } else {
      bot.reply(message, "You haven't added any tasks yet. Add some by typing 'add tasks'.");
    }
  });
});

// Clear all tasks from the bots list
controller.hears(['clear tasks'], 'direct_message', function(bot, message) {
  var user = message.user;
  var tasks = '';
  controller.storage.users.save({id: user, tasks: tasks}, function(err) {
    bot.reply(message, "I have cleared your task list.");
    if(err) {
      console.log(err);
    }
  });
});
