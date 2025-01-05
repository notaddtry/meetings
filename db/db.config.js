require('dotenv').config()

module.exports = {
  user: process.env.DB_USER,
  host:
    process.env.NODE_ENV === 'prod'
      ? process.env.PROD_HOST_DB
      : process.env.DEV_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
}
