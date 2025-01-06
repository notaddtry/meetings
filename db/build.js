const fs = require('fs')
const connection = require('./pool')

const sqlQuery = fs.readFileSync('./db/build.sql', 'utf-8')

connection.query(sqlQuery, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.info('Database built successfully')
})

connection.end()
