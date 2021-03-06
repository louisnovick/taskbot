/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Run bot from the command line:

    token=<MY TOKEN> node taskbot.js

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var Botkit = require('botkit/lib/Botkit.js');
var _ = require('lodash');
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
          var user = message.user;
          var taskChunks = _.split(response.text, ', ');

          controller.storage.users.get(user, function(err, user_data) {
            if(user_data.tasks.length > -1) {

              // Handle existing tasks
              var taskList = [];
              for(var i = 0; i < user_data.tasks.length; i++) {
                taskList.push(user_data.tasks[i]);
              }

              convo.say('Tasks added, \n');

              // Prepare to save new tasks
              _(taskChunks).forEach(function(value) {
                convo.say(value + '\n');
                taskList.push(value);
              });
              controller.storage.users.save({id: user, tasks: taskList}, function(err) {});

            } else {
              console.log(err);
            }
          });
          convo.next();
        },
      },
    ]);
    convo.on('end', function(convo) {
      if (convo.status == 'completed') {
        console.log('completed');
      }
    });
  });
});

// Show all tasks from the bots list
controller.hears(['see tasks'], 'direct_message', function(bot, message) {
  var user = message.user;
  controller.storage.users.get(user, function(err, user_data) {
    if(user_data != undefined) {
      var userTasks = user_data.tasks;
      if(!_.isEmpty(userTasks)) {
        console.log(userTasks);
        //bot.reply(message, 'Here are all your tasks for today.\n');
        _(userTasks).forEach(function(value) {
          bot.reply(message, value);
        });
      } else {
        bot.reply(message, "You haven't added any tasks yet. Add some by typing 'add tasks'.");
      }
    } else {
      bot.reply(message, "You haven't added any tasks yet. Add some by typing 'add tasks'.");
    }
  });
});

// Remove a task from your list
controller.hears(['complete task'], 'direct_message', function(bot, message) {
  bot.startConversation(message, function(err,convo) {
    var user = message.user;
    convo.ask('Which task would you like to complete?', [
      {
        pattern: /^[1-9]*$/gm,
        callback: function(response, convo, removedTask) {
          var taskList = [];
          var taskNumber = response.text - 1;
          controller.storage.users.get(user, function(err, user_data) {

            // Get the tasklist
            for(var i = 0; i < user_data.tasks.length; i++) {
              taskList.push(user_data.tasks[i]);
            }

            // Complete the task
            var removedTask = user_data.tasks[taskNumber];
            var taskIndex = taskList.indexOf(removedTask);
            //console.log(removedTask);
            if(taskIndex > -1) {
              taskList.splice(removedTask, 1);
              convo.say('Task "' + removedTask + '" Completed');
              controller.storage.users.save({id: user, tasks: taskList}, function(err) {});
            } else {
              convo.say('There is no task at ' + response.text);
              convo.repeat();
            }

            // Save the new tasklist
          });
          convo.next();
        },
      },
      {
        default: true,
        callback: function(response, convo) {
          convo.say('Please enter a valid index number of the task you want to complete.');
          convo.repeat();
          convo.next();
        },
      },
    ]);
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
