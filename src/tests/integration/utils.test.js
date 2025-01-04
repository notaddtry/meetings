const pool = require('../../../db/pool.js')
const assert = require('assert')
const { isWorkerRegistered } = require('../../commands/utils.js')

describe('Тестирование регистрации пользователя', () => {
  it('Должен вернуть true, если пользователь зарегистрирован', async function () {
    const expectedResult = true

    await pool.connect()

    const result = await isWorkerRegistered('meeting_test_1')

    assert.equal(result, expectedResult)
  })

  it('Должен вернуть false, если пользователь не зарегистрирован', async function () {
    const expectedResult = false

    await pool.connect()

    const result = await isWorkerRegistered('meeting_test_11')

    assert.equal(result, expectedResult)
  })
})
