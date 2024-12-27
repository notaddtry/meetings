const getInfoMeeting = require('./getInfoMeeting.js')
const start = require('./start.js')
const getMeetings = require('./getMeetings.js')
const createTeam = require('./createTeam.js')
const messageHandler = require('./messageHandler.js')
const createMeeting = require('./createMeeting.js')

const setCommands = () => {
  start()
  getInfoMeeting()
  getMeetings()
  createTeam()
  createMeeting()

  messageHandler()
}

module.exports = setCommands
