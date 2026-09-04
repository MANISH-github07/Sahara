import client from './client'

export const adminApi = {
  async getStats() {
    return client.get('/admin/stats')
  },

  async getUsers(params = {}) {
    return client.get('/admin/users', { params })
  },

  async updateUser(id, payload) {
    return client.patch(`/admin/users/${id}`, payload)
  },

  async deleteUser(id) {
    return client.delete(`/admin/users/${id}`)
  },

  async getProfessionals() {
    return client.get('/admin/professionals')
  },

  async createProfessional(payload) {
    return client.post('/admin/professionals', payload)
  },

  async getAuditLogs(params = {}) {
    return client.get('/admin/audit-logs', { params })
  },
}
