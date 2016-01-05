var Botkit = require('botkit')
var Witbot = require('witbot')

var Slack = require('slack-client')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

// Add A Wit.ai token
var witToken = process.env.WIT_TOKEN
var openWeatherApiKey = process.env.OPENWEATHER_KEY

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

var witbot = Witbot(witToken)

controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
  witbot.process(message.text, bot, message)
})

witbot.hears('hello', 0.5, function(bot, message, outcome) {
  bot.reply(message, 'Hello to you as well!')
})

// add a second 'hears' for the 'how_are_you' intent below
witbot.hears('how_are_you', 0.5, function(bot, message, outcome) {
  bot.reply(message, 'Doing great! Thanks for asking.')
})

var weather = require('./weather')(openWeatherApiKey)

// add in prompt for simple 'how's the weather' conversation
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
    bot.reply(message, msg)
  })
})