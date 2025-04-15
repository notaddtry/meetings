const nodemailer = require('nodemailer')
require('dotenv').config()

const transport = nodemailer.createTransport('SMTP', {
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  secureConnection: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_TOKEN,
  },
})

module.exports = transport
