const { bot } = require('../bot.js')
const pool = require('../../db/pool.js')

const commands = () => {
  bot.onText('/commands', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username

    try {
      // const worker = await pool.query(`
      //   SELECT * FROM worker WHERE username = '${username}';
      //   `)
      // const teams = await pool.query(`
      //   SELECT * FROM team;
      //   `)
      // const roles = await pool.query(`
      //   SELECT * FROM role;
      //   `)
      // const worker_team_role = await pool.query(`
      //   SELECT * FROM worker_team_role WHERE worker_id = ${worker.rows[0].id};
      //   `)
      // const team_roles = worker_team_role.rows.reduce((acc, val) => {
      //   if (acc[val.team_id]) {
      //     acc[val.team_id].push(
      //       roles.rows.find((role) => role.id === val.role_id)
      //     )
      //   } else {
      //     acc[val.team_id] = [
      //       roles.rows.find((role) => role.id === val.role_id),
      //     ]
      //   }
      //   return acc
      // }, {})
      // console.log(team_roles)
      // return bot.sendMessage(chatId, JSON.stringify(team_roles, null, 2))
      // return res.rows
    } catch (error) {
      console.log(error)
      throw new Error()
    }
  })
}

module.exports = commands
