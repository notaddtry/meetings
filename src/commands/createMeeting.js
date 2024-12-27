const { bot } = require('../bot.js')
const { setUserState } = require('../../redis/utils.js')
const pool = require('../../db/pool.js')

const createMeeting = () => {
  bot.onText('/create_meeting', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    const worker = await pool.query(`
      SELECT * FROM worker WHERE username = '${username}'
      `)

    const isWorkerLeader = await pool.query(`
      SELECT * FROM leader WHERE worker_id = ${worker.rows[0].id}
      `)

    if (!isWorkerLeader.rows.length) {
      return await bot.sendMessage(
        chatId,
        'Вы не являетесь руководителем команды. Создайте команду,чтобы создать собрание в ней.'
      )
    }

    try {
      await setUserState(chatId, {
        action: 'meeting',
        status: 'waitingForMeetingDate',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    return bot.sendMessage(chatId, 'Введите дату собрания в формате YYYY.MM.DD')
  })
}

module.exports = createMeeting
