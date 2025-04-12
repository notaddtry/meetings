const TelegramBot = require('node-telegram-bot-api')
const TOKEN = require('./config.js')
const callbackQueriesInit = require('./callbackQueries.js')
const messageHandler = require('./messageHandler.js')
const setCommands = require('./commands/setCommands.js')

const bot = new TelegramBot(TOKEN, { polling: true })

const initBot = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начать работу с ботом' },
    { command: '/get_commands', description: 'Список всех команд' },
    { command: '/create_meeting', description: 'Создать собрание' },
    { command: '/create_team', description: 'Создать команду' },
    { command: '/get_info_meeting', description: 'Создать отчет по собранию' },
    {
      command: '/get_meetings',
      description: 'Получить список актуальных собраний',
    },
    {
      command: '/set_mark',
      description: 'Выставить отметку о возможности прийти на собрание',
    },
    {
      command: '/add_member_to_team',
      description: 'Добавить сотрудника в команду',
    },
    {
      command: '/change_worker_role',
      description: 'Изменить роль участника',
    },
  ])

  setCommands(bot)
  messageHandler(bot)
  callbackQueriesInit(bot)
}

module.exports = { initBot }
