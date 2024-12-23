const { bot } = require('../bot.js')
const fs = require('fs')
const officegen = require('officegen')
const path = require('path')
const handleError = require('../utils/handleError.js')

const ERROR_MESSAGE =
  'Произошла ошибка при отправке документа. Попробуйте позже.'

const getInfoMeeting = () => {
  bot.onText('/get_info_meeting', async (msg) => {
    const chatId = msg.chat.id

    try {
      async function generateDocument() {
        let docx = officegen('docx')

        docx.on('finalize', function (written) {
          console.log('Finish to create a Microsoft Word document.')
        })

        docx.on('error', (error) => handleError(error, chatId))

        let pObj = docx.createP()
        pObj.addText(`Тестовая печать`)

        if (fs.existsSync(path.join(__dirname, '../../example.docx'))) {
          fs.unlinkSync(path.join(__dirname, '../../example.docx'))
        }

        out = fs.createWriteStream(path.join(__dirname, '../../example.docx'))

        out.on('error', (error) => handleError(error, chatId))

        docx.generate(out)
      }

      generateDocument()
        .then(() => {
          bot.sendMessage(chatId, 'Отчет готовится, ожидайте.')
          //TODO DEBUGGING
          setTimeout(() => {
            bot
              .sendDocument(chatId, path.join(__dirname, '../example.docx'))
              .then(() => {
                // TODO AFTER TESTING fs.unlinkSync(path.join(__dirname, 'example.docx'))
              })
              .catch((error) => handleError(error, chatId, ERROR_MESSAGE))
          }, 1000)
        })
        .catch((error) => handleError(error, chatId, ERROR_MESSAGE))
    } catch (error) {
      handleError(error, chatId, ERROR_MESSAGE)
    }
  })
}

module.exports = getInfoMeeting
