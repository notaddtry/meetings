require('dotenv').config()
const express = require('express')
const pool = require('./db/pool.js')
const { initBot } = require('./src/bot/bot.js')
const setCommands = require('./src/bot/commands/setCommands.js')
const redisClient = require('./redis/redis.js')

const app = express()
const PORT = process.env.PORT || 5432

// Используй try-catch для обработки ошибок

async function start() {
  try {
    app.listen(PORT, () => console.info(`hello,worlds from ${PORT}`))

    await pool.connect()
    await redisClient.connect()

    initBot()
    setCommands()
  } catch (e) {
    console.error('Server error', e.message)
    return
  }
}

start()
