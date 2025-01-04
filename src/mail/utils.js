const transport = require('../mail/index.js')

const sendMail = (workersMail, state, team) => {
  const message = {
    from: '"Уведомление от бота" <comatose.6666@gmail.com>',

    to: workersMail.join(', '),

    subject: 'Уведомление о новом собрании',

    html: `
      <p>Дата собрания: ${new Date(state.date).toLocaleString()}</p>
      <p>Тип собрания: ${state.type === 'Offline' ? 'Офлайн' : 'Онлайн'}</p>
      <p>Команда: ${team.rows[0].title}</p>
  
      <p>Пожалуйста, зайдите в бота и отметьте информацию о возможности своего присутствия.</p>
      <p>t.me/meetings_with_team_bot</p>
    `,
  }

  transport.sendMail(message, function (error) {
    if (error) {
      console.error('Error occured')
      return
    }
    console.info('Message sent successfully!')

    transport.close()
  })
}

module.exports = { sendMail }
