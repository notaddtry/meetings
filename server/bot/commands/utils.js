const fs = require('fs')
const officegen = require('officegen')
const path = require('path')
const { selectWorkerByUsername } = require('../../../db/seletors.js')

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

const isWorkerRegistered = async (username) => {
  const worker = await selectWorkerByUsername(username)

  return !!worker.rows.length
}

async function generateDocument(workerMarkMap, workers) {
  if (!workerMarkMap || !workers) {
    return console.error('Ошибка при создании документа')
  }

  let docx = officegen('docx')

  let pObj = docx.createP()

  Object.keys(workerMarkMap).map((id) => {
    const worker = workers.rows.find((worker) => worker.id === +id)

    console.log(workerMarkMap, workers.rows, id)

    pObj = docx.createP()

    pObj.addText(
      `${worker.username}: ${
        typeof workerMarkMap[id] === 'boolean'
          ? workerMarkMap[id]
            ? 'Сможет присутствовать'
            : 'Не сможет присутствовать'
          : 'Не ответил на уведомление'
      }`
    )
  })

  if (fs.existsSync(path.join(__dirname, '../../../example.docx'))) {
    fs.unlinkSync(path.join(__dirname, '../../../example.docx'))
  }

  out = fs.createWriteStream(path.join(__dirname, '../../../example.docx'))

  docx.generate(out)
}

module.exports = {
  validateEmail,
  isWorkerRegistered,
  generateDocument,
}
