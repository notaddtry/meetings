const {
  validateEmail,
  generateDocument,
} = require('../../bot/commands/utils.js')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

describe('Тестирование валидации почты пользователя', () => {
  it('Должен вернуть true, так как пользователь ввел корректную почту', function () {
    const expectedResult = true
    const result = !!validateEmail('coma123@mail.ru')

    assert.equal(result, expectedResult)
  })

  it('Должен вернуть false, если пользователь ввел некорректную почту', function () {
    const expectedResult = false
    const result = !!validateEmail('coma123')

    assert.equal(result, expectedResult)
  })
})

describe('Тестирование создания документа для отчета', () => {
  let workerMarkMap, workers

  beforeEach(() => {
    workerMarkMap = { 2: true, 1: null }

    workers = {
      rows: [
        {
          id: 1,
          username: 'notaddtry',
          email: '',
          chat_id: '',
        },
        {
          id: 2,
          username: 'meeting_test_1',
          email: '',
          chat_id: '',
        },
      ],
    }
  })

  it('Должен вернуть true, если успешно создался документ с информацией о собрании', async function () {
    const expectedResult = true

    await generateDocument(workerMarkMap, workers)

    const result = fs.existsSync(path.join(__dirname, '../../../example.docx'))

    assert.equal(result, expectedResult)
  })

  it('Должен вернуть false, если указаны неверные пути при создании документа с информацией о собрании', async function () {
    const expectedResult = false

    await generateDocument(workerMarkMap, workers)

    const result = fs.existsSync(path.join(__dirname, '../../../example'))

    assert.equal(result, expectedResult)
  })

  it('Должен вернуть false, если произошла ошибка при создании документа с информацией о собрании', async function () {
    const expectedResult = false

    workerMarkMap = null

    workers = null

    await generateDocument(workerMarkMap, workers)

    const result = fs.existsSync(path.join(__dirname, '../../../example.docx'))

    assert.equal(result, expectedResult)
  })

  afterEach(() => {
    if (fs.existsSync(path.join(__dirname, '../../../example.docx'))) {
      fs.unlinkSync(path.join(__dirname, '../../../example.docx'))
    }
  })
})
