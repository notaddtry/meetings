const { bot } = require('../bot.js')
const { setUserState } = require('../../redis/utils.js')

const createTeam = () => {
  bot.onText('/create_team', async (msg) => {
    const chatId = msg.chat.id

    try {
      await setUserState(chatId, 'waitingForTeamName')
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    return bot.sendMessage(chatId, 'Введите название вашей команды')
  })
}

module.exports = createTeam
