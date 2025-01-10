const { setUserState } = require('../../../redis/utils.js')
const pool = require('../../../db/pool.js')
const { isWorkerRegistered } = require('./utils.js')
const { selectWorkerByUsername } = require('../../../db/seletors.js')

const createMeeting = (bot) => {
  bot.onText('/create_meeting', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    if (!(await isWorkerRegistered(username))) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    const worker = await selectWorkerByUsername(username)

    const isWorkerLeader = await pool.query(`
      SELECT * FROM leader WHERE worker_id = ${worker.rows[0].id};
      `)

    const isWorkerResponsible = await pool.query(`
      SELECT * FROM worker_team_role WHERE worker_id = ${worker.rows[0].id} AND role_id = (SELECT id FROM role WHERE title = 'Responsible');
      `)

    if (!isWorkerLeader.rows.length && !isWorkerResponsible.rows.length) {
      return await bot.sendMessage(
        chatId,
        'Вы не являетесь руководителем команды или ответственным  лицом. Создайте команду,чтобы создать собрание в ней.'
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
