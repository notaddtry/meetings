const pool = require('../../../db/pool.js')
const { isWorkerRegistered } = require('./utils.js')
const {
  selectWorkerByUsername,
  selectWorkerTeamRoleByTeamIdOrWorkerId,
} = require('../../../db/seletors.js')

const getMeetings = (bot) => {
  bot.onText('/get_meetings', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    if (!(await isWorkerRegistered(username))) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    const worker = await selectWorkerByUsername(username)

    const teamsWorker = await selectWorkerTeamRoleByTeamIdOrWorkerId(
      worker.rows[0].id,
      'worker'
    )

    const teamsWorkerId = teamsWorker.rows.map(
      (teamWorker) => teamWorker.team_id
    )

    const teams = await pool.query(`
      SELECT * FROM team WHERE id = ANY(ARRAY[${teamsWorkerId}]);
      `)

    const meetings = await pool.query(`
      SELECT * FROM meeting WHERE team_id = ANY(ARRAY[${teamsWorkerId}]) AND date > NOW();
      `)

    const meetingInTeam = teams.rows.find((team) =>
      meetings.rows.find((meeting) => meeting.team_id === team.id)
    )

    const message = meetings.rows
      .map((meeting) => {
        return `    Идентификатор встречи: ${meeting.id}
    Команда: ${meetingInTeam.title}
    Дата встречи: ${new Date(meeting.date).toLocaleDateString()}
    Тип встречи: ${
      meeting.type === 'Online' ? 'Онлайн-формат' : 'Оффлайн-формат'
    }`
      })
      .join('\n\n')

    await bot.sendMessage(
      chatId,
      `Вот все ваши грядущие встречи:\n${message}
      `
    )
  })
}

module.exports = getMeetings
