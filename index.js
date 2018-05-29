/*
 *
 * Description here
 * Node-slack-bot
 * Created  : Mat
 * Date   : 9/7/16
 * Updated  :  
 * Notes  : 'client_secret' is the "token"??? just like weather.js
 */

var Botkit = require('botkit')
var Witbot = require('witbot')
var UntappdClient = require('node-untappd'); //ok from node_modules
var Slack = require('slack-client')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

// Add Tokens and Keys
var witToken = process.env.WIT_TOKEN
var untappdToken = process.env.UNTAPPD_TOKEN          //ok from bot.yml
var openWeatherApiKey = process.env.OPENWEATHER_KEY
var asiApiKey = process.env.ASI_KEY

var controller = Botkit.slackbot({
  debug: false
})

controller.spawn({
  token: slackToken
}).startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Error connecting to Slack: ', err)
  }
  console.log('Connected to Slack')
})


var debug = false
var witbot = Witbot(witToken)
var untappd = UntappdClient(untappdToken);

//might need to be 'var node-untappd = Untappd(untappdToken)'
//var untappd = Untappd(untappdToken)
// 13/1 - I think below needs to take the parameter 'untappdToken'


controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
  witbot.process(message.text, bot, message)
})

witbot.hears('hello', 0.5, function(bot, message, outcome) {
  bot.reply(message, 'Hello to you as well!')
})

/* This works as a conversation too - 'bot.startConversation' function from botkit
witbot.hears(['hello'], 0.5, function(bot, message, outcome) {

  // start a conversation to handle this response.
  bot.startConversation(message,function(err,convo) {

    convo.say('Hello!');
    convo.say('Have a nice day!');

  })

});
*/

// add a second 'hears' for the 'how_are_you' intent below
witbot.hears('how_are_you', 0.5, function(bot, message, outcome) {
  bot.reply(message, 'Doing great! Thanks for asking.'),
  console.log("Doing great! Thanks for asking.")
})

var weather = require('./weather')(openWeatherApiKey)

// hears weather
witbot.hears('weather', 0.5, function(bot, message, outcome) {
  console.log(outcome.entities.location)
  if (!outcome.entities.location || outcome.entities.location.length === 0) {
    bot.reply(message, 'I\'d love to give you the weather but for where?')
    return
  }

  var location = outcome.entities.location[0].value

  weather.get(location, function(error, msg) {
    if (error) {
      console.error(error)
      bot.reply(message, 'uh oh! There was a problem getting the weather')
      return
    }
    bot.reply(message,"Wait for it... Here you are. Enjoy!")
    bot.reply(message, msg)
  })
})

var untappd = require('./untappd')(untappdToken)

// hears beer
witbot.hears('beer', 0.5, function(bot, message, outcome) {
  console.log(outcome.entities.beer)                                      // search term
  if (!outcome.entities.beer || outcome.entities.beer.length === 0) {     // this should be a JSON search results response 
    bot.reply(message, 'I\'d love to find you that beer but which one?')
    return
  }

  var beer = outcome.entities.beer[0].value
  console.log(beer)

  untappd.get(beer, function(error, msg) {
    if (error) {
      console.error(error)
      bot.reply(message, 'uh oh! There was a problem getting that brew')
      return
    }
    console.log("here comes your beer...")
    console.log(msg.attachments[0].pretext)
    //console.log(msg.attachments.pretext)
    //console.log(msg.attachments[0].fallback)
    bot.reply(message, 'Nice one!  Check it out.')
    bot.reply(message, msg)
  })

})
