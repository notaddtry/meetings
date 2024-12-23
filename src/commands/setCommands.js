const getInfoMeeting = require('./getInfoMeeting.js')
const start = require('./start.js')

const setCommands = () => {
  start()
  getInfoMeeting()
}

module.exports = setCommands
