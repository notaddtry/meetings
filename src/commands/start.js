const { bot } = require('../bot.js')

const start = () => {
  bot.onText('/start', (msg) => {
    const chatId = msg.chat.id

    return bot.sendMessage(
      chatId,
      'Приветствую! Это бот поможет Вам и вашим коллегам организовать собрания! Для начала работы создайте команду или,если Вы не руководитель, можете просмотреть все собрания,на которые Вас записали.'
    )
  })
}

module.exports = start
