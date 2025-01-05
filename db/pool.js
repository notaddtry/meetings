const { Pool } = require('pg')
const { user, password, host, database, port } = require('./db.config.js')

const pool = new Pool({
  user: process.env.DB_USER,
  host:
    process.env.NODE_ENV === 'prod'
      ? process.env.PROD_HOST_DB
      : process.env.DEV_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

module.exports = pool
