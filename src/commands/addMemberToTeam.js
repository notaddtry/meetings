const { bot } = require('../bot.js')

const start = () => {
  bot.onText('/add_member_to_team', (msg) => {
    const chatId = msg.chat.id

    return bot.sendMessage(chatId, 'Я тебя слушаю')
  })
}

module.exports = start
