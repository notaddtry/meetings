const { bot } = require('../bot.js')
const pool = require('../../db/pool.js')

const getMeetings = () => {
  bot.onText('/get_meetings', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    const worker = await pool.query(`
      SELECT * FROM worker WHERE username = '${username}';
      `)
    const meeting_worker_array = await pool.query(`
      SELECT * FROM meeting_worker_relationship WHERE worker_id = '${worker.rows[0].id}';
      `)

    let meetings = []

    for (const meeting_worker of meeting_worker_array.rows) {
      const meeting = await pool.query(`
        SELECT * FROM meeting WHERE id = ${meeting_worker.meeting_id} AND date > NOW();
        `)
      if (meeting.rows[0]) {
        meetings.push(meeting.rows[0])
      }
    }

    const message = meetings
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
