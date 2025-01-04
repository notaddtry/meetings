const TelegramBot = require('node-telegram-bot-api')
const TOKEN = require('./config.js')
const callbackQueriesInit = require('./callbackQueries.js')

const bot = new TelegramBot(TOKEN, { polling: true })

const initBot = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начать работу с ботом' },
    {
      command: '/get_meetings',
      description: 'Получить список актуальных собраний',
    },
    {
      command: '/get_info_meetings',
      description: 'Получить информацию о собрании',
    },
    { command: '/create_team', description: 'Создать команду' },
    { command: '/create_meeting', description: 'Создать собрание' },
  ])

  callbackQueriesInit(bot)
}

module.exports = { bot, initBot }
