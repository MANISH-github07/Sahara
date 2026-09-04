import client from './client'

export const notificationApi = {
  async list(params = {}) {
    return client.get('/notifications', { params })
  },

  async markRead(id) {
    return client.patch(`/notifications/${id}/read`)
  },

  async markAllRead() {
    return client.post('/notifications/read-all')
  },

  async delete(id) {
    return client.delete(`/notifications/${id}`)
  },
}
