import client from './client'

export const moodApi = {
  async getHistory(days = 7) {
    return client.get('/mood/history', { params: { days } })
  },

  async log(payload) {
    // payload: { mood, score, note?, logDate? }
    return client.post('/mood', payload)
  },

  async delete(id) {
    return client.delete(`/mood/${id}`)
  },
}
