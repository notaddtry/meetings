const pool = require('../../db/pool.js')
const {
  clearUserState,
  getUserState,
  setUserState,
} = require('../../redis/utils.js')
const fs = require('fs')
const path = require('path')
const {
  validateEmail,
  isWorkerRegistered,
  generateDocument,
} = require('./commands/utils.js')
const {
  selectWorkerByUsername,
  selectWorkerTeamRoleByTeamIdOrWorkerId,
} = require('../../db/seletors.js')
const { sendMail } = require('../mail/utils.js')

function isDateValid(dateStr) {
  return !isNaN(new Date(dateStr))
}

const messageHandler = (bot) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username
    const messageText = msg.text

    if (messageText.includes('/')) {
      clearUserState(chatId)
      return
    }

    let state = await getUserState(chatId)

    if (
      !(await isWorkerRegistered(username)) &&
      JSON.parse(state).action !== 'start'
    ) {
      return await bot.sendMessage(
        chatId,
        'Для начала работы пройдите регистрацию. Команда /start'
      )
    }

    if (state) {
      const worker = await selectWorkerByUsername(username)

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

            await setUserState(chatId, {
              action: 'meeting',
              status: 'waitingForMeetingType',
              date: date,
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
            const teamsFromLeadership = await pool.query(`
                SELECT * FROM team WHERE leader_id = '${worker.rows[0].id}';
                `)

            let teams = [...teamsFromLeadership.rows]

            const workerTeamRoleFromResponsible = await pool.query(`
              SELECT * FROM worker_team_role WHERE worker_id = '${worker.rows[0].id}' AND role_id = (SELECT id FROM role WHERE title = 'Responsible')
              `)

            const workerTeamRoleMapId = workerTeamRoleFromResponsible.rows.map(
              (workerTeamRole) => workerTeamRole.team_id
            )

            if (workerTeamRoleMapId.length) {
              const teamsFromResponsible = await pool.query(`
                SELECT * FROM team WHERE id = ANY(ARRAY[${workerTeamRoleMapId}]);
                `)

              teams = [...teams, ...teamsFromResponsible.rows]
            }

            await bot.sendMessage(
              chatId,
              `Укажите идентификатор команду,в которой хотите сделать собрание:
              ${teams
                .map(
                  (team) => `
    Идентификатор команды: ${team.id}
    Название команды: ${team.title}
    `
                )
                .join('\n\n')}`
            )

            const newState = {
              ...state,
              status: 'waitingForMeetingTeam',
              type: messageText === 'офлайн' ? 'Offline' : 'Online',
            }

            await setUserState(chatId, newState)
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

            const meetingId = await pool.query(`
              SELECT create_meeting_function('${new Date(
                state.date
              ).toISOString()}', '${
              state.type
            }', ${+messageText}) AS meeting_id;
              `)

            await bot.sendMessage(
              chatId,
              `
              Собрание успешно создано!. 
              
              Идентификатор собрание: ${meetingId.rows[0].meeting_id}
              Дата собрания: ${new Date(state.date).toLocaleString()},
              Тип собрания: ${state.type === 'Offline' ? 'Офлайн' : 'Онлайн'}
              Команда: ${team.rows[0].title}
              `
            )

            console.log(1)

            const workerTeamRoleInCurrentTeam =
              await selectWorkerTeamRoleByTeamIdOrWorkerId(messageText, 'team')

            console.log(2)
            const workerInCurrentTeamIds = workerTeamRoleInCurrentTeam.rows.map(
              (workerTeamRole) => workerTeamRole.worker_id
            )
            console.log(3)
            const workers = await pool.query(`
              SELECT * FROM worker WHERE id = ANY(ARRAY[${workerInCurrentTeamIds}]);
              `)
            console.log(4)

            const leaderWorker = await pool.query(`
                SELECT * FROM worker WHERE id = ${team.rows[0].leader_id}
              `)
            console.log(6)
            const workersMail = workers.rows.map((worker) => worker.email)
            const workersChatId = workers.rows
              .filter((worker) => worker.id !== leaderWorker.rows[0].id)
              .map((worker) => worker.chat_id)

            sendMail(workersMail, state, team)

            try {
              await bot.sendMessage(
                leaderWorker.rows[0].chat_id,
                `У вас новое собрание.
                  Идентификатор собрание: ${meetingId.rows[0].meeting_id}
                  Дата собрания: ${new Date(state.date).toLocaleString()},
                  Тип собрания: ${
                    state.type === 'Offline' ? 'Офлайн' : 'Онлайн'
                  }
                  Команда: ${team.rows[0].title}
                  `
              )
            } catch (error) {
              console.error(error)
            }

            for (const workerChatId of workersChatId) {
              try {
                await bot.sendMessage(
                  workerChatId,
                  `У вас новое собрание.
                  Идентификатор собрание: ${meetingId.rows[0].meeting_id}
                  Дата собрания: ${new Date(state.date).toLocaleString()},
                  Тип собрания: ${
                    state.type === 'Offline' ? 'Офлайн' : 'Онлайн'
                  }
                  Команда: ${team.rows[0].title}
                  `,
                  {
                    reply_markup: JSON.stringify({
                      inline_keyboard: [
                        [
                          {
                            text: 'Принять',
                            callback_data: `markYes/${meetingId.rows[0].meeting_id}`,
                          },
                        ],
                        [
                          {
                            text: 'Отклонить',
                            callback_data: `markNo/${meetingId.rows[0].meeting_id}`,
                          },
                        ],
                      ],
                    }),
                  }
                )
              } catch (error) {
                console.error(error)
              }
            }

            await clearUserState(chatId)
          }
        } else if (state.action === 'infoMeeting') {
          if (state.status === 'waitingForSelectMeeting') {
            const meeting = await pool.query(`
              SELECT * FROM meeting WHERE id = ${+messageText};
              `)

            const workersInTeam = await selectWorkerTeamRoleByTeamIdOrWorkerId(
              meeting.rows[0].team_id,
              'team'
            )

            const workersInTeamId = workersInTeam.rows.map(
              (worker) => worker.worker_id
            )

            const marksFromWorkers = await pool.query(`
              SELECT * FROM mark WHERE worker_id = ANY(ARRAY[${workersInTeamId}]) AND meeting_id = ${+messageText};
              `)

            const workerMarkMap = workersInTeam.rows.reduce((acc, val) => {
              console.log(val)

              if (val.worker_id === worker.rows[0].id) {
                return acc
              }

              const markFromWorker = marksFromWorkers.rows.find(
                (mark) => mark.worker_id === val.worker_id
              )

              if (markFromWorker) {
                acc[val.worker_id] = markFromWorker.can_be_in_meeting
              } else {
                acc[val.worker_id] = null
              }

              return acc
            }, {})

            const workers = await pool.query(`
              SELECT * FROM worker WHERE id = ANY(ARRAY[${workersInTeamId}]);
              `)

            const ERROR_MESSAGE =
              'Произошла ошибка при отправке документа. Попробуйте позже.'

            try {
              generateDocument(workerMarkMap, workers)
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
                        fs.unlinkSync(
                          path.join(__dirname, '../../example.docx')
                        )
                      })
                      .catch((error) => {
                        console.error(error)
                        bot.sendMessage(chatId, ERROR_MESSAGE)
                      })
                  }, 1000)
                })
                .catch((error) => {
                  console.error(error)
                  bot.sendMessage(chatId, ERROR_MESSAGE)
                })
            } catch (error) {
              console.error(error)
              bot.sendMessage(chatId, ERROR_MESSAGE)
            }
          }
        } else if (state.action === 'setMark') {
          if (state.status === 'waitingForMeetingForMark') {
            await bot.sendMessage(
              chatId,
              `Укажите, сможете ли Вы быть на собрании.`,
              {
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [
                      {
                        text: 'Принять',
                        callback_data: `markYes/${messageText}`,
                      },
                    ],
                    [
                      {
                        text: 'Отклонить',
                        callback_data: `markNo/${messageText}`,
                      },
                    ],
                  ],
                }),
              }
            )
          }
        } else if (state.action === 'start') {
          if (state.status === 'waitingForUserEmail') {
            if (!validateEmail(messageText)) {
              return await bot.sendMessage(chatId, 'Введите корректный email.')
            }

            try {
              await pool.query(`
              INSERT INTO worker (username, email, chat_id) VALUES ('${username}', '${messageText}', ${chatId});
              `)

              await bot.sendMessage(chatId, `Вы успешно зарегистрированы!`)

              await clearUserState(chatId)
            } catch (error) {
              console.error(error)
              await bot.sendMessage(chatId, 'Произошла ошибка при регистрации.')
            }
          }
        } else if (state.action === 'createTeam') {
          if (state.status === 'waitingForTeamName') {
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
        } else if (state.action === 'addMember') {
          if (state.status === 'waitingForSelectTeam') {
            const teamId = +messageText

            try {
              await setUserState(chatId, {
                ...state,
                status: 'waitingForUsername',
                teamId,
              })
            } catch (err) {
              console.error('Ошибка при вызове setUserState:', err)
              return
            }

            await bot.sendMessage(
              chatId,
              'Введите логин сотрудника,которого Вы хотите добавить.'
            )
          } else if (state.status === 'waitingForUsername') {
            const adaptedMessageText = messageText.replaceAll('@', '')

            const workerToAdd = await pool.query(`
              SELECT * FROM worker WHERE username = '${adaptedMessageText}';
              `)

            if (!workerToAdd.rows.length) {
              await bot.sendMessage(
                chatId,
                'Сотрудник с таким логином не зарегистрирован в боте.'
              )
              return
            }

            const workerTeamRoleExists = await pool.query(`
              SELECT * FROM worker_team_role WHERE worker_id = ${workerToAdd.rows[0].id} AND team_id = ${state.teamId}
              `)

            if (workerTeamRoleExists.rows.length) {
              await bot.sendMessage(chatId, 'Сотруднику уже назначена роль.')
              return
            }

            const roles = await pool.query(`
              SELECT * FROM role
              `)

            const inlineKeyboard = roles.rows
              .map((role) => {
                if (role.title === 'Leader') {
                  return
                }

                return [
                  {
                    text:
                      role.title === 'Responsible'
                        ? 'Ответственное лицо(может создавать собрания)'
                        : 'Сотрудник',
                    callback_data: `addMemberChooseRole/${role.title}`,
                  },
                ]
              })
              .filter((r) => r)

            try {
              await setUserState(chatId, {
                ...state,
                status: 'waitingForChooseRole',
                username: adaptedMessageText,
              })

              await bot.sendMessage(chatId, 'Выберите роль.', {
                reply_markup: JSON.stringify({
                  inline_keyboard: inlineKeyboard,
                }),
              })
            } catch (error) {
              console.error(error)
              await bot.sendMessage(
                chatId,
                'Произошла ошибка при добавлении сотрудника.'
              )
            }
          }
        }
      }
    }
  })
}

module.exports = messageHandler
