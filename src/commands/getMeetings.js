const { bot } = require('../bot.js')

const start = () => {
  bot.onText('/get_meetings', (msg) => {
    const chatId = msg.chat.id

    return bot.sendMessage(chatId, 'Я тебя слушаю')
  })
}

module.exports = start
