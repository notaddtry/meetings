const getCommands = (bot) => {
  bot.onText('/get_commands', async (msg) => {
    const chatId = msg.chat.id

    return bot.sendMessage(
      chatId,
      `
      Вот список доступных комманд: 
      /start - Начать работу с ботом;
      /create_meeting - Создать собрание;
      /create_team - Создать команду;
      /get_info_meeting - Создать отчет по собранию;
      /get_meetings - Получить список актуальных собраний;
      /set_mark - Выставить отметку о возможности прийти на собрание;
      /add_member_to_team - Добавить сотрудника в команду;
      /change_worker_role
      `
    )
  })
}

module.exports = getCommands
