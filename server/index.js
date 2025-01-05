require('dotenv').config()
const express = require('express')
const pool = require('../db/pool.js')
const { initBot } = require('./bot/bot.js')
const setCommands = require('./bot/commands/setCommands.js')
const redisClient = require('../redis/redis.js')
const config = require('../db/db.config.js')

const app = express()
const PORT = process.env.PORT || 5432

async function start() {
  try {
    app.listen(PORT, () => {
      console.info(`hello,worlds from ${PORT},asda`)
      console.info(config)
      console.info({
        host:
          process.env.NODE_ENV === 'prod'
            ? process.env.PROD_HOST_REDIS
            : process.env.DEV_HOST,
        port: process.env.REDIS_PORT,
      })
    })

    await pool.connect()
    await redisClient.connect()

    initBot()
    setCommands()
  } catch (e) {
    console.error('Server error', e.message)
    return
  }
}

module.exports = start
