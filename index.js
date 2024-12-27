require('dotenv').config()
const express = require('express')
const pool = require('./db/pool.js')
const { initBot } = require('./src/bot.js')
const setCommands = require('./src/commands/setCommands.js')
const redisClient = require('./redis/redis.js')

const app = express()
const PORT = process.env.PORT || 5432

// Используй try-catch для обработки ошибок

async function start() {
  try {
    app.listen(PORT, () => console.info(`hello,worlds from ${PORT}`))

    await pool.connect()

    initBot()
    setCommands()

    await redisClient.connect()

    redisClient.on('error', (err) => {
      console.error('Redis error:', err)
    })

    redisClient.on('ready', () => {
      console.info('Redis client is ready.')
    })
  } catch (e) {
    console.error('Server error', e.message)
    return
  }
}

start()
