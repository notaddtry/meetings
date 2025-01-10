const {
  clearUserState,
  setUserState,
  getUserState,
} = require('../../redis/utils.js')
const pool = require('../../db/pool.js')
const { selectWorkerByUsername } = require('../../db/seletors.js')

const callbackQueriesInit = (bot) => {
  bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data
    const msg = callbackQuery.message
    const username = msg.chat.username
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    }
    let text
    let state = await getUserState(msg.chat.id)
    state = JSON.parse(state)

    const worker = await selectWorkerByUsername(username)

    if (action.includes('markYes')) {
      const meetingId = action.split('/')[1]

      try {
        await pool.query(`
          INSERT INTO mark (meeting_id, worker_id, can_be_in_meeting) VALUES (${meetingId}, ${worker.rows[0].id}, TRUE);
          `)
      } catch (err) {
        console.error('Ошибка сохранении отметки.', err)
        return
      }

      await clearUserState(msg.chat.id)

      text = 'Вы успешно приняли приглашение!'
    } else if (action.includes('markNo')) {
      const meetingId = action.split('/')[1]

      try {
        await pool.query(`
          INSERT INTO mark (meeting_id, worker_id, can_be_in_meeting) VALUES (${meetingId}, ${worker.rows[0].id}, FALSE);
          `)
      } catch (err) {
        console.error('Ошибка сохранении отметки.', err)
        return
      }

      await clearUserState(msg.chat.id)

      text = 'Вы отклонили приглашение.'
    } else if (action.includes('addMemberChooseRole')) {
      const roleTitle = action.split('/')[1]

      const role = await pool.query(`
        SELECT * FROM role WHERE title = '${roleTitle}'
        `)

      const workerToAdd = await selectWorkerByUsername(state.username)

      const team = await pool.query(`
        SELECT * FROM team WHERE id = ${state.teamId}
        `)

      try {
        await pool.query(`
          SELECT add_worker_to_team(${state.teamId}, ${workerToAdd.rows[0].id}, ${role.rows[0].id});
          `)
      } catch (err) {
        console.error('Ошибка при добавлении сотрудника.', err)
        return
      }

      text = `Вы успешно добавили сотрудника ${state.username} в команду ${team.rows[0].title}!`

      await clearUserState(msg.chat.id)
    }

    bot.editMessageText(text, opts)
  })
}

module.exports = callbackQueriesInit
