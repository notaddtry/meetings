const fs = require('fs')
const connection = require('./pool')

const sqlQuery = fs.readFileSync('./db/build.sql', 'utf-8')

connection.query(sqlQuery, (err) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('Database built successfully')
})

connection.end()
