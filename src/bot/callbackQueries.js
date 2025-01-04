const { clearUserState } = require('../../redis/utils.js')
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

    const worker = await selectWorkerByUsername(username)

    if (action.includes('markYes')) {
      const meetingId = action.split('/')[1]

      try {
        await pool.query(`
          INSERT INTO mark (meeting_id, worker_id, can_be_in_meeting) VALUES (${meetingId}, ${worker.rows[0].id}, TRUE);
          `)
      } catch (err) {
        console.error('Ошибка при вызове setUserState:', err)
        return
      }

      await clearUserState(msg.chat.id)

      text = 'Вы успешно приняли приглашение!'
    }
    if (action.includes('markNo')) {
      const meetingId = action.split('/')[1]

      try {
        await pool.query(`
          INSERT INTO mark (meeting_id, worker_id, can_be_in_meeting) VALUES (${meetingId}, ${worker.rows[0].id}, FALSE);
          `)
      } catch (err) {
        console.error('Ошибка при вызове setUserState:', err)
        return
      }

      await clearUserState(msg.chat.id)

      text = 'Вы отклонили приглашение.'
    }

    bot.editMessageText(text, opts)
  })
}

module.exports = callbackQueriesInit
