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
        status: 'waitingForSelectMeeting',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    const worker = await selectWorkerByUsername(username)

    const isWorkerLeader = await pool.query(`
      SELECT * FROM leader WHERE worker_id = ${worker.rows[0].id};
      `)

    if (!isWorkerLeader.rows.length) {
      return await bot.sendMessage(
        chatId,
        'Вы не являетесь руководителем команды. Создайте команду,чтобы добавлять в нее участников.'
      )
    }

    const teamsUnderCurrentLeader = await pool.query(`
      SELECT * FROM team WHERE leader_id = ${worker.rows[0].id};
      `)

    const teamsId = teamsUnderCurrentLeader.rows.map((row) => row.id)

    const meetings = await pool.query(`
      SELECT * FROM meeting WHERE team_id = ANY(ARRAY[${teamsId}]);
     `)

    return bot.sendMessage(
      chatId,
      `Укажите идентификатор собрания,по которому хотите получить отчет. Вот список всех собраний,которые назначены на Ваши команды
      
      ${meetings.rows
        .map((meeting) => {
          return `    Идентификатор встречи: ${meeting.id}
      Дата встречи: ${new Date(meeting.date).toLocaleDateString()}
      Тип встречи: ${
        meeting.type === 'Online' ? 'Онлайн-формат' : 'Оффлайн-формат'
      }`
        })
        .join('\n\n')}
      `
    )
  })
}

module.exports = getInfoMeeting
