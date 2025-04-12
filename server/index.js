require('dotenv').config()
const express = require('express')
const pool = require('../db/pool.js')
const { initBot } = require('./bot/bot.js')
const redisClient = require('../redis/redis.js')

const app = express()
const PORT = process.env.PORT || 5432

async function start() {
  try {
    app.listen(PORT, () => {
      console.info(`hello,world from ${PORT}`)
    })

    await pool.connect()
    await redisClient.connect()

    initBot()
  } catch (e) {
    console.error('Server error', e.message)
    return
  }
}

module.exports = start
