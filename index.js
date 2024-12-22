require('dotenv').config()
var TeleBot = require('telebot')
const pool = require('./db/pool.js')
const fs = require('fs')
const officegen = require('officegen')
const path = require('path')

const bot = new TeleBot({
  token: process.env.TG_TOKEN,
  sleep: 1000, // How often check updates (in ms)
  timeout: 0, // Update pulling timeout (0 - short polling)
  limit: 100, // Limits the number of updates to be retrieved
  retryTimeout: 5000, // Reconnecting timeout (in ms)
})

bot.on('text', async (msg) => {
  const text = msg.text.toLowerCase()

  if (text.includes('/start')) {
    console.log(msg)
    await msg.reply.text(
      'Привет! Я помогу тебе заполнить шаблон в LibreOffice. Введи свои данные в следующем порядке: Имя, Email, Телефон.'
    )
  } else {
    const data = text.split(',')

    if (data.length === 3) {
      try {
        async function generateDocument() {
          let docx = officegen('docx')

          docx.on('finalize', function (written) {
            console.log('Finish to create a Microsoft Word document.')
          })

          docx.on('error', function (err) {
            console.log(err)
          })

          let pObj = docx.createP()

          pObj.addText(`Имя: ${data[0].trim()}\n`)
          pObj.addText(`Email: ${data[1].trim()}\n`)
          pObj.addText(`Телефон: ${data[2].trim()}`)

          if (fs.existsSync(path.join(__dirname, 'example.docx'))) {
            fs.unlinkSync(path.join(__dirname, 'example.docx'))
          }

          out = fs.createWriteStream('example.docx')

          out.on('error', function (err) {
            console.log(err)
          })

          docx.generate(out)
        }

        generateDocument()
          .then(() => {
            bot.sendMessage(msg.chat.id, 'asdasd')

            setTimeout(() => {
              bot
                .sendDocument(msg.chat.id, path.join(__dirname, 'example.docx'))
                .then(() => {
                  // TODO AFTER TESTING fs.unlinkSync(path.join(__dirname, 'example.docx'))
                })
                .catch((error) => {
                  console.log(error)
                  console.error(error)
                  msg.reply.text(
                    'Произошла ошибка при отправке документа. Попробуйте позже.'
                  )
                })
            }, 1000)
          })
          .catch((error) => {
            console.error(error)
            msg.reply.text(
              'Произошла ошибка при создании документа. Попробуйте позже.'
            )
          })
      } catch (error) {
        console.error(error)
        await msg.reply.text(
          'Произошла ошибка при сохранении данных. Попробуйте ещё раз.'
        )
      }
    } else {
      await msg.reply.text(
        'Введите данные в правильном формате: Имя, Email, Телефон.'
      )
    }
  }
})

bot.start()
