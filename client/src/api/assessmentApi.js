import client from './client'

export const assessmentApi = {
  async getHistory() {
    return client.get('/assessment/history')
  },

  async getById(id) {
    return client.get(`/assessment/${id}`)
  },

  async submit(type, answers) {
    return client.post(`/assessment/${type}/submit`, { answers })
  },
}
