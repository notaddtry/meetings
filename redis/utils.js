const redisClient = require('./redis.js')

async function setUserState(chatId, state) {
  return redisClient.set(`user_state_${chatId}`, state)
}

async function getUserState(chatId) {
  return redisClient.get(`user_state_${chatId}`, (err, result) => {
    console.log(err, result)

    return result
  })
}

async function clearUserState(chatId) {
  return redisClient.del(`user_state_${chatId}`)
}

module.exports = { clearUserState, setUserState, getUserState }
