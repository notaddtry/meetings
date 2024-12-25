const { bot } = require('../bot.js')

const start = () => {
  bot.onText('/create_team', (msg) => {
    const chatId = msg.chat.id

    return bot.sendMessage(chatId, 'Я тебя слушаю')
  })
}

module.exports = start
