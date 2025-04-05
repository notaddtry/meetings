const {
  clearUserState,
  setUserState,
  getUserState,
} = require('../../redis/utils.js')
const pool = require('../../db/pool.js')
const {
  selectWorkerByUsername,
  selectWorkerTeamRoleByTeamIdOrWorkerId,
} = require('../../db/seletors.js')

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

        text = 'Произошла ошибка при сохранении отметки.'
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
        text = 'Произошла ошибка при сохранении отметки.'
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
        text = 'Произошла ошибка при добавлении сотрудника.'
      }

      text = `Вы успешно добавили сотрудника ${state.username} в команду ${team.rows[0].title}!`

      await clearUserState(msg.chat.id)
    } else if (action.includes('selectUser')) {
      const workerId = action.split('/')[1]

      const workerTeamRole = await selectWorkerTeamRoleByTeamIdOrWorkerId(
        workerId,
        'worker'
      )

      const roles = await pool.query(`
        SELECT * FROM role
        `)

      const currentRole = await pool.query(`
        SELECT * FROM role WHERE id = ${workerTeamRole.rows[0].role_id}
        `)

      const inlineKeyboard = roles.rows.reduce((acc, role) => {
        if (
          role.title === 'Leader' ||
          role.title === currentRole.rows[0].title
        ) {
          return acc
        }

        acc.push([
          {
            text:
              role.title === 'Responsible' ? 'Ответственное лицо' : 'Сотрудник',
            callback_data: `changeRole/${role.title}`,
          },
        ])

        return acc
      }, [])

      try {
        await setUserState(msg.chat.id, {
          ...state,
          workerId,
        })

        await bot.editMessageText(
          `Выберите роль для участника ${worker.rows[0].username}:`,
          {
            reply_markup: JSON.stringify({
              inline_keyboard: inlineKeyboard,
            }),
            ...opts,
          }
        )
      } catch (error) {
        console.error(error)
        text = 'Произошла ошибка при изменении роли сотрудника.'
      }

      return
    } else if (action.includes('changeRole')) {
      const roleTitle = action.split('/')[1]

      const role = await pool.query(`
        SELECT * FROM role WHERE title = '${roleTitle}'
        `)

      const worker = await pool.query(`
        SELECT * FROM worker WHERE id = ${state.workerId}  
        `)

      const team = await pool.query(`
        SELECT * FROM team WHERE id = ${state.teamId}
        `)

      try {
        await pool.query(`
            SELECT change_worker_role(${state.teamId}, ${state.workerId}, ${role.rows[0].id});
            `)
      } catch (err) {
        console.error('Ошибка при изменении роли сотрудника.', err)
        text = 'Произошла ошибка при изменении роли сотрудника.'
      }

      text = `Вы успешно изменили роль сотрудника ${
        worker.rows[0].username
      } в команде ${team.rows[0].title} на ${
        role.rows[0].title === 'Responsible'
          ? '"Ответственное лицо"'
          : '"Сотрудник"'
      }!`

      await clearUserState(msg.chat.id)
    }

    bot.editMessageText(text, opts)
  })
}

module.exports = callbackQueriesInit
