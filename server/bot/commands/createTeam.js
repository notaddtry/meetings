const { bot } = require('./../bot.js')
const { setUserState } = require('../../../redis/utils.js')
const { isWorkerRegistered } = require('./utils.js')

const createTeam = () => {
  bot.onText('/create_team', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    if (!(await isWorkerRegistered(username))) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    try {
      await setUserState(chatId, {
        action: 'createTeam',
        status: 'waitingForTeamName',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    return bot.sendMessage(chatId, 'Введите название вашей команды')
  })
}

module.exports = createTeam
