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

async function generateDocument(workerMarkMap, workers, type, meeting, team) {
  if (!workerMarkMap || !workers) {
    return console.error('Ошибка при создании документа')
  }

  if (type === 'docx') {
    let docx = officegen('docx')

    let pObj = docx.createP()

    pObj = docx.createP({ align: 'center' })

    pObj.addText(
      `Дата собрания: ${new Date(meeting.date).toLocaleDateString()}`
    )
    pObj = docx.createP()
    pObj.addText(`Команда: ${team.title}`)
    pObj.addLineBreak()
    pObj.addText(
      `Тип собрания: ${meeting.type === 'Offline' ? 'офлайн' : 'онлайн'}`
    )

    pObj = docx.createP()
    pObj.addText(`Участники:`)

    Object.keys(workerMarkMap).map((id) => {
      const worker = workers.rows.find((worker) => worker.id === +id)

      pObj.addLineBreak()

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

  const objToWrite = {
    users: {},
    date: undefined,
    teamId: undefined,
    type: undefined,
  }

  Object.keys(workerMarkMap).map((id) => {
    const worker = workers.rows.find((worker) => worker.id === +id)

    objToWrite.users[worker.username] = workerMarkMap[id]
  })

  meeting.date = new Date(meeting.date)

  meeting.date.setMinutes(
    meeting.date.getMinutes() - meeting.date.getTimezoneOffset()
  )

  objToWrite.date = meeting.date
  objToWrite.teamId = team.id
  objToWrite.type = meeting.type

  if (fs.existsSync(path.join(__dirname, '../../../example.json'))) {
    fs.unlinkSync(path.join(__dirname, '../../../example.json'))
  }

  fs.writeFile(
    path.join(__dirname, '../../../example.json'),
    JSON.stringify(objToWrite, null, 2),
    'utf8',
    function (err) {
      if (err) {
        console.error(err)
        throw new Error(err)
      } else {
        console.info('data written')
      }
    }
  )
}

module.exports = {
  validateEmail,
  isWorkerRegistered,
  generateDocument,
}
