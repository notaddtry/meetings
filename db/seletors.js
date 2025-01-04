const pool = require('./pool.js')

const selectWorkerByUsername = async (username) => {
  const worker = await pool.query(`
    SELECT * FROM worker WHERE username = '${username}'; 
    `)

  return worker
}

const selectWorkerTeamRoleByTeamIdOrWorkerId = async (value, type) => {
  if (type !== 'team' && type !== 'worker') {
    console.error('Некорректный тип для выборки данных из бд')
  }

  const workerTeamRole = await pool.query(`
    SELECT * FROM worker_team_role WHERE ${
      type === 'team' ? 'team_id' : 'worker_id'
    } = '${value}';
    `)

  return workerTeamRole
}

module.exports = {
  selectWorkerByUsername,
  selectWorkerTeamRoleByTeamIdOrWorkerId,
}
