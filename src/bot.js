const TelegramBot = require('node-telegram-bot-api')
const TOKEN = require('../config.js')
const messageHandler = require('./commands/messageHandler.js')

const bot = new TelegramBot(TOKEN, { polling: true })

const initBot = () => {
  bot.setMyCommands(
    [
      { command: '/start', description: 'Начать работу с ботом' },
      {
        command: '/get_info_meetings',
        description: 'Получить информацию о собрании',
      },
      { command: '/commands', description: 'Список доступных команд' },
    ]
    // { scope }
  )

  messageHandler(bot)
}

module.exports = { bot, initBot }
