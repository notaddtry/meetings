const { Pool } = require('pg')
const { user, password, host, database, port } = require('./db.config.js')

const pool = new Pool({ user, password, host, database, port })

module.exports = pool
