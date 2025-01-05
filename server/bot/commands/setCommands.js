const getInfoMeeting = require('./getInfoMeeting.js')
const start = require('./start.js')
const getMeetings = require('./getMeetings.js')
const createTeam = require('./createTeam.js')
const messageHandler = require('./messageHandler.js')
const createMeeting = require('./createMeeting.js')
const setMark = require('./setMark.js')

const setCommands = () => {
  start()
  getInfoMeeting()
  getMeetings()
  createTeam()
  createMeeting()
  setMark()

  messageHandler()
}

module.exports = setCommands
