const pool = require('../../../db/pool.js')
const { setUserState } = require('../../../redis/utils.js')
const { isWorkerRegistered } = require('./utils.js')
const { selectWorkerByUsername } = require('../../../db/seletors.js')

const getInfoMeeting = (bot) => {
  bot.onText('/get_info_meeting', async (msg) => {
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
        action: 'infoMeeting',
        status: 'waitingForSelectExportType',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    await bot.sendMessage(
      chatId,
      `Укажите, в какой тип эскпортировать данные.`,
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: 'docx',
                callback_data: `docx`,
              },
            ],
            [
              {
                text: 'json',
                callback_data: `json`,
              },
            ],
          ],
        }),
      }
    )
  })
}

module.exports = getInfoMeeting
