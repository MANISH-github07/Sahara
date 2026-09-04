import client from './client'

export const profileApi = {
  async get() {
    return client.get('/profile')
  },

  async update(payload) {
    return client.put('/profile/update', payload)
  },

  async changePassword(currentPassword, newPassword) {
    return client.post('/profile/change-password', { currentPassword, newPassword })
  },

  async uploadAvatar(formData) {
    return client.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
