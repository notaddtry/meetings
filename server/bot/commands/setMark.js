const { setUserState } = require('../../../redis/utils.js')
const pool = require('../../../db/pool.js')
const { isWorkerRegistered } = require('./utils.js')
const {
  selectWorkerByUsername,
  selectWorkerTeamRoleByTeamIdOrWorkerId,
} = require('../../../db/seletors.js')

const setMark = (bot) => {
  bot.onText('/set_mark', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    if (!(await isWorkerRegistered(username))) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    const worker = await selectWorkerByUsername(username)

    const teamWorker = await selectWorkerTeamRoleByTeamIdOrWorkerId(
      worker.rows[0].id,
      'worker'
    )

    const teamsIds = teamWorker.rows.map((teamWorker) => teamWorker.team_id)

    if (!teamsIds.length) {
      return await bot.sendMessage(
        chatId,
        'Вы не состоите ни в какой команде, Вам не могут быть назначены собрания. Обратитесь к Вашему руководителю,чтобы он добавил Вас в команду.'
      )
    }

    const teams = await pool.query(`
      SELECT * FROM team WHERE id = ANY(ARRAY[${teamsIds}]);
      `)

    const leader = await pool.query(`
        SELECT * FROM leader WHERE worker_id = ${worker.rows[0].id};
        `)

    const teamsWithLeaderCheck = teams.rows.filter(
      (team) => team.leader_id !== leader.rows[0].id
    )

    if (!teamsWithLeaderCheck.length) {
      return await bot.sendMessage(
        chatId,
        'Вы являетесь руководителем во все ваших командах. Вы не можете ставить отметки на собрания.'
      )
    }

    const meetings = await pool.query(`
      SELECT * FROM meeting WHERE team_id = ANY(ARRAY[${teamsIds}]) AND date > NOW();
      `)

    const meetingInTeam = teamsWithLeaderCheck.find((team) =>
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

    try {
      await setUserState(chatId, {
        action: 'setMark',
        status: 'waitingForMeetingForMark',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    return bot.sendMessage(
      chatId,
      `Вот все ваши грядущие встречи:\n${message}.\n\n Укажите идентификатор встречи, к которой Вы хотите поставить отметку о своем присутствии.
      `
    )
  })
}

module.exports = setMark
