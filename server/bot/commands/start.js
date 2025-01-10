const { setUserState } = require('../../../redis/utils.js')
const { selectWorkerByUsername } = require('../../../db/seletors.js')

const MESSAGE =
  'Приветствую! Это бот поможет Вам и вашим коллегам организовать собрания! Для начала работы создайте команду или,если Вы не руководитель, можете просмотреть все собрания,на которые Вас записали.'

const start = (bot) => {
  bot.onText('/start', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username
    console.log(chatId, username)

    const worker = await selectWorkerByUsername(username)

    if (!worker.rows.length) {
      await bot.sendMessage(
        chatId,
        `${MESSAGE}\n\nДля начала работы зарегистрируйтесь в боте. Введите Вашу почту.`
      )

      try {
        await setUserState(chatId, {
          action: 'start',
          status: 'waitingForUserEmail',
        })
      } catch (err) {
        console.error('Ошибка при вызове setUserState:', err)
        return
      }

      return
    }

    return bot.sendMessage(chatId, MESSAGE)
  })
}

module.exports = start
