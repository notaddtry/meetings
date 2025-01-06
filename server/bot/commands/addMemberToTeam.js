const { bot } = require('./../bot.js')
const { isWorkerRegistered } = require('./utils.js')

const start = () => {
  bot.onText('/add_member_to_team', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    if (!(await isWorkerRegistered(username))) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    return bot.sendMessage(chatId, 'Я тебя слушаю')
  })
}

module.exports = start
