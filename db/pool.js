const { Pool } = require('pg')
const { user, password, host, database, port } = require('./db.config.js')

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host:
    process.env.NODE_ENV === 'prod'
      ? process.env.PROD_HOST_DB
      : process.env.DEV_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
})

module.exports = pool
