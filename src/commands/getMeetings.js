const { bot } = require('../bot.js')
const pool = require('../../db/pool.js')

const getMeetings = () => {
  bot.onText('/get_meetings', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    const worker = await pool.query(`
      SELECT * FROM worker WHERE username = '${username}';
      `)

    const teamsWorker = await pool.query(`
      SELECT * FROM worker_team_role WHERE worker_id = '${worker.rows[0].id}';
      `)

    const teamsWorkerId = teamsWorker.rows.map(
      (teamWorker) => teamWorker.team_id
    )

    const meetings = await pool.query(`
      SELECT * FROM meeting WHERE team_id = ANY(ARRAY[${teamsWorkerId}]) AND date > NOW();
      `)

    const message = meetings.rows
      .map((meeting) => {
        return `    Идентификатор встречи: ${meeting.id}
    Дата встречи: ${new Date(meeting.date).toLocaleString()}
    Тип встречи: ${
      meeting.type === 'Online' ? 'Онлайн-формат' : 'Оффлайн-формат'
    }`
      })
      .join('\n\n')

    return bot.sendMessage(
      chatId,
      `Вот все ваши грядущие встречи:\n${message}
      `
    )
  })
}

module.exports = getMeetings
