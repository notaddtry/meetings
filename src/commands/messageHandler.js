const pool = require('../../db/pool.js')
const { clearUserState, getUserState } = require('../../redis/utils.js')

const messageHandler = (bot) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const username = msg.chat.username
    const messageText = msg.text

    const state = await getUserState(chatId)

    console.log(state)

    if (state === 'waitingForTeamName') {
      // Получили название команды
      const teamName = messageText.trim()

      try {
        // Запись данных в базу данных
        await pool.query(`
        SELECT create_team_function('${teamName}', (SELECT id FROM leader WHERE worker_id = (SELECT id FROM worker WHERE username = '${username}'))) AS team_id;
        `) // Функция для записи команды в БД

        // Сообщаем пользователю об успехе
        await bot.sendMessage(chatId, `Команда "${teamName}" успешно создана!`)

        // Сбрасываем состояние ожидания
        await clearUserState(chatId)
      } catch (error) {
        console.error(error)
        await bot.sendMessage(chatId, 'Произошла ошибка при создании команды.')
      }
    } else {
      // Обрабатываем другие сообщения
    }
  })
}

module.exports = messageHandler
