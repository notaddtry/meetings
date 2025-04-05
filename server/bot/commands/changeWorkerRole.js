// change_worker_role
const { setUserState } = require('../../../redis/utils.js')
const pool = require('../../../db/pool.js')
const { isWorkerRegistered } = require('./utils.js')
const { selectWorkerByUsername } = require('../../../db/seletors.js')

const changeWorkerRole = (bot) => {
  bot.onText('/change_worker_role', async (msg) => {
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

    if (!isWorkerLeader.rows.length) {
      return await bot.sendMessage(
        chatId,
        'Вы не можете менять роли участников,так как вы не являетесь руководителем ни одной команды.'
      )
    }

    const teams = await pool.query(`
      SELECT * FROM team WHERE leader_id = '${worker.rows[0].id}';
      `)

    //

    try {
      await setUserState(chatId, {
        action: 'changeRole',
        status: 'waitingForSelectTeam',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }

    return bot.sendMessage(
      chatId,
      `Выберите команду, в которой хотите изменить роль участника:
      ${teams.rows
        .map(
          (team) => `
Идентификатор команды: ${team.id}
Название команды: ${team.title}
`
        )
        .join('\n\n')}`
    )
  })
}

module.exports = changeWorkerRole
