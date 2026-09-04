import client from './client'

export const journalApi = {
  async list(params = {}) {
    return client.get('/journal', { params })
  },

  async getById(id) {
    return client.get(`/journal/${id}`)
  },

  async create(payload) {
    return client.post('/journal', payload)
  },

  async update(id, payload) {
    return client.put(`/journal/${id}`, payload)
  },

  async delete(id) {
    return client.delete(`/journal/${id}`)
  },
}
