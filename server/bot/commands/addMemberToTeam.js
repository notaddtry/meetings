const { selectWorkerByUsername } = require('../../../db/seletors.js')
const { isWorkerRegistered } = require('./utils.js')
const pool = require('../../../db/pool.js')
const { setUserState } = require('../../../redis/utils.js')

const addMemberToTeam = (bot) => {
  bot.onText('/add_member_to_team', async (msg) => {
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
        'Вы не являетесь руководителем команды. Создайте команду,чтобы добавлять в нее участников.'
      )
    }

    const teams = await pool.query(`
      SELECT * FROM team WHERE leader_id = '${worker.rows[0].id}';
      `)

    await bot.sendMessage(
      chatId,
      `Укажите идентификатор команду,в которой хотите сделать собрание:
        ${teams.rows
          .map(
            (team) => `
Идентификатор команды: ${team.id}
Название команды: ${team.title}
`
          )
          .join('\n\n')}`
    )

    try {
      await setUserState(chatId, {
        action: 'addMember',
        status: 'waitingForSelectTeam',
      })
    } catch (err) {
      console.error('Ошибка при вызове setUserState:', err)
      return
    }
  })
}

module.exports = addMemberToTeam
