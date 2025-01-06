require('dotenv').config()

module.exports = {
  user: process.env.POSTGRES_USER,
  host:
    process.env.NODE_ENV === 'prod'
      ? process.env.PROD_HOST_DB
      : process.env.DEV_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
}
