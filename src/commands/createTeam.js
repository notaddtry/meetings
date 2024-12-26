const { bot } = require('../bot.js')
const { setUserState, getUserState } = require('../../redis/utils.js')

const createTeam = () => {
  bot.onText('/create_team', async (msg) => {
    const chatId = msg.chat.id

    try {
      const res = await setUserState(chatId, 'waitingForTeamName')
      console.log(res)
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }
    // Устанавливаем состояние ожидания ввода названия команды
    await setUserState(chatId, 'waitingForTeamName')

    console.log('asdad')

    return bot.sendMessage(chatId, 'Введите название вашей команды')
  })
}

module.exports = createTeam
