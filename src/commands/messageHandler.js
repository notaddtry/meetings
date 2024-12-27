const pool = require('../../db/pool.js')
const {
  clearUserState,
  getUserState,
  setUserState,
} = require('../../redis/utils.js')
const { bot } = require('../bot.js')
const handleError = require('../utils/handleError.js')
const fs = require('fs')
const officegen = require('officegen')
const path = require('path')

function isDateValid(dateStr) {
  return !isNaN(new Date(dateStr))
}

let meetingState = {}

const messageHandler = () => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username
    const messageText = msg.text

    let state = await getUserState(chatId)

    if (messageText.includes('/')) {
      return
    }

    if (state) {
      const worker = await pool.query(`
        SELECT * FROM worker WHERE username = '${username}';
        `)

      if (typeof state === 'object' || typeof JSON.parse(state) === 'object') {
        state = JSON.parse(state)

        if (state.action === 'meeting') {
          if (state.status === 'waitingForMeetingDate') {
            const date = new Date(messageText)

            if (!isDateValid(messageText)) {
              return await bot.sendMessage(
                chatId,
                'Неверный формат даты, введите корректное значение.'
              )
            }

            meetingState = { ...meetingState, date }

            await setUserState(chatId, {
              action: 'meeting',
              status: 'waitingForMeetingType',
            })

            await bot.sendMessage(
              chatId,
              'Укажите тип собрания (введите онлайн / офлайн)'
            )
          } else if (state.status === 'waitingForMeetingType') {
            if (messageText !== 'офлайн' && messageText !== 'онлайн') {
              return await bot.sendMessage(
                chatId,
                'Укажите правильный формат (онлайн / офлайн)'
              )
            }

            meetingState = {
              ...meetingState,
              type: messageText === 'офлайн' ? 'Offline' : 'Online',
            }

            const teams = await pool.query(`
            SELECT * FROM team WHERE leader_id = '${worker.rows[0].id}';
            `)

            await bot.sendMessage(
              chatId,
              `Укажите идентификатор команду,в которой хотите сделать собрание:
              ${teams.rows
                .map(
                  (team) => `
    Идентификатор команды: ${team.id}
    Название команды: ${team.title}
    `
                )
                .join('\n\n')}`
            )

            await setUserState(chatId, {
              action: 'meeting',
              status: 'waitingForMeetingTeam',
            })
          } else if (state.status === 'waitingForMeetingTeam') {
            if (!typeof +messageText === 'number') {
              return await bot.sendMessage(
                chatId,
                'Укажите правильный идентификатор'
              )
            }

            const team = await pool.query(`
              SELECT * FROM team WHERE id = ${+messageText};
              `)

            if (!team.rows.length) {
              return await bot.sendMessage(
                chatId,
                'Команда с таким идентификатором не найдена. Введите правильный идентификатор'
              )
            }

            meetingState = { ...meetingState, team: +messageText }

            await pool.query(`
              SELECT create_meeting_function('${new Date(
                meetingState.date
              ).toISOString()}', '${meetingState.type}', ${
              meetingState.team
            }) AS meeting_id;
              `)

            await bot.sendMessage(
              chatId,
              `
              Собрание успешно создано!.
              
              Дата собрания: ${new Date(meetingState.date).toLocaleString()},
              Тип собрания: ${
                meetingState.type === 'Offline' ? 'Офлайн' : 'Онлайн'
              }
              Команда: ${team.rows[0].title}
              `
            )

            meetingState = {}
            await clearUserState(chatId)
          }
        } else if (state.action === 'infoMeeting') {
          if (state.status === 'waitingForSelectMeeting') {
            const meeting = await pool.query(`
              SELECT * FROM meeting WHERE id = ${+messageText};
              `)

            const workersInTeam = await pool.query(`
              SELECT * FROM worker_team_role WHERE team_id = ${meeting.rows[0].team_id};
              `)

            const workersInTeamId = workersInTeam.rows.map(
              (worker) => worker.worker_id
            )

            const marksFromWorkers = await pool.query(`
              SELECT * FROM mark WHERE worker_id = ANY(ARRAY[${workersInTeamId}]) AND meeting_id = ${+messageText};
              `)

            const workerMarkMap = workersInTeam.rows.reduce((acc, val) => {
              if (val.id === worker.rows[0].id) {
                return acc
              }

              const markFromWorker = marksFromWorkers.rows.find(
                (mark) => mark.worker_id === val.id
              )

              if (markFromWorker) {
                acc[val.id] = markFromWorker.can_be_in_meeting
              } else {
                acc[val.id] = null
              }

              return acc
            }, {})

            const workers = await pool.query(`
              SELECT * FROM worker WHERE id = ANY(ARRAY[${workersInTeamId}])
              `)

            try {
              const ERROR_MESSAGE =
                'Произошла ошибка при отправке документа. Попробуйте позже.'

              async function generateDocument() {
                let docx = officegen('docx')

                docx.on('finalize', function (written) {
                  console.info('Finish to create a Microsoft Word document.')
                })

                docx.on('error', (error) => handleError(error, chatId))

                let pObj = docx.createP()

                Object.keys(workerMarkMap).map((id) => {
                  const worker = workers.rows.find(
                    (worker) => worker.id === +id
                  )

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

                if (fs.existsSync(path.join(__dirname, '../../example.docx'))) {
                  fs.unlinkSync(path.join(__dirname, '../../example.docx'))
                }

                out = fs.createWriteStream(
                  path.join(__dirname, '../../example.docx')
                )

                out.on('error', (error) => handleError(error, chatId))

                docx.generate(out)
              }

              generateDocument()
                .then(() => {
                  bot.sendMessage(chatId, 'Отчет готовится, ожидайте.')
                  //TODO REFACTORING
                  setTimeout(() => {
                    bot
                      .sendDocument(
                        chatId,
                        path.join(__dirname, '../../example.docx')
                      )
                      .then(() => {
                        // TODO AFTER TESTING fs.unlinkSync(path.join(__dirname, 'example.docx'))
                      })
                      .catch((error) =>
                        handleError(error, chatId, ERROR_MESSAGE)
                      )
                  }, 1000)
                })
                .catch((error) => handleError(error, chatId, ERROR_MESSAGE))
            } catch (error) {
              handleError(error, chatId, ERROR_MESSAGE)
            }
          }
        }
      } else {
        state = state.replaceAll('"', '')

        if (state === 'waitingForTeamName') {
          try {
            await pool.query(`
            SELECT create_team_function('${messageText}', ${worker.rows[0].id}) AS team_id;
            `)

            await bot.sendMessage(
              chatId,
              `Команда "${messageText}" успешно создана!`
            )

            await clearUserState(chatId)
          } catch (error) {
            console.error(error)
            await bot.sendMessage(
              chatId,
              'Произошла ошибка при создании команды.'
            )
          }
        }
      }
    }
  })
}

module.exports = messageHandler
