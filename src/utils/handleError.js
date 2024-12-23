const { bot } = require('../bot.js')

const handleError = (error, chatId, text) => {
  console.error(error)
  bot.sendMessage(chatId, text || 'Произошла ошибка. Попробуйте позже.')
}

module.exports = handleError
