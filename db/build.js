const fs = require('fs')
const connection = require('./pool')

const sqlQuery = fs.readFileSync('./db/build.sql', 'utf-8')
const createSqlQuery = fs.readFileSync('./db/create.sql', 'utf-8')
const dropSqlQuery = fs.readFileSync('./db/drop.sql', 'utf-8')

connection.query(dropSqlQuery, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.info('Database built successfully')
})

connection.end()
