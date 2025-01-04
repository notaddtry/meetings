const redis = require('redis')
require('dotenv').config()

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

module.exports = redisClient
