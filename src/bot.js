const TelegramBot = require('node-telegram-bot-api')
const TOKEN = require('../config.js')

const bot = new TelegramBot(TOKEN, { polling: true })

const initBot = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начать работу с ботом' },
    {
      command: '/get_info_meetings',
      description: 'Получить информацию о собрании',
    },
    { command: '/get_recipe_of_a_day', description: 'Получить рецепт дня' },
  ])
}

module.exports = { bot, initBot }
