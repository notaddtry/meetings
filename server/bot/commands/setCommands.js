const getInfoMeeting = require('./getInfoMeeting.js')
const start = require('./start.js')
const getMeetings = require('./getMeetings.js')
const createTeam = require('./createTeam.js')
const createMeeting = require('./createMeeting.js')
const setMark = require('./setMark.js')
const addMemberToTeam = require('./addMemberToTeam.js')
const getCommands = require('./getCommands.js')
const changeWorkerRole = require('./changeWorkerRole.js')

const setCommands = (bot) => {
  start(bot)
  getCommands(bot)
  getInfoMeeting(bot)
  getMeetings(bot)
  createTeam(bot)
  createMeeting(bot)
  setMark(bot)
  addMemberToTeam(bot)
  changeWorkerRole(bot)
}

module.exports = setCommands
