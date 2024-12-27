const redisClient = require('./redis.js')

async function setUserState(chatId, state) {
  return redisClient.set(`user_state_${chatId}`, JSON.stringify(state))
}

async function getUserState(chatId) {
  return redisClient.get(`user_state_${chatId}`, (err, result) => result)
}

async function clearUserState(chatId) {
  return redisClient.del(`user_state_${chatId}`)
}

module.exports = { clearUserState, setUserState, getUserState }
