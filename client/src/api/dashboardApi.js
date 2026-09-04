import client from './client'

export const dashboardApi = {
  async get() {
    return client.get('/dashboard')
  },
}
