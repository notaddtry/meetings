const redis = require('redis')
const { port } = require('../db/db.config')
require('dotenv').config()

const options = {
  url:
    process.env.NODE_ENV === 'prod'
      ? `redis://${process.env.PROD_HOST_REDIS}:${process.env.REDIS_PORT}`
      : `redis://${process.env.DEV_HOST}:${process.env.REDIS_PORT}`,
}

const redisClient = redis.createClient(options)

module.exports = redisClient
