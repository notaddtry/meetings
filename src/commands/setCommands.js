const getInfoMeeting = require('./getInfoMeeting.js')
const start = require('./start.js')
const commands = require('./commands.js')
const getMeetings = require('./getMeetings.js')
const createTeam = require('./createTeam.js')

const setCommands = () => {
  start()
  getInfoMeeting()
  getMeetings()
  createTeam()
}

module.exports = setCommands
