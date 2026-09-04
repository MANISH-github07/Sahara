import client from './client'

export const messageApi = {
  async list(patientId) {
    const params = patientId ? { patientId } : {}
    return client.get('/messages', { params })
  },

  async send(content, patientId) {
    const body = patientId ? { content, patientId } : { content }
    return client.post('/messages', body)
  },

  async getUnreadCount() {
    return client.get('/messages/unread-count')
  },
}
