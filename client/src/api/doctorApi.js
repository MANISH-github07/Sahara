import client from './client'

export const doctorApi = {
  async getPatients() {
    return client.get('/doctor/patients')
  },

  async getPatient(id) {
    return client.get(`/doctor/patients/${id}`)
  },

  async addNote(payload) {
    return client.post('/doctor/notes', payload)
  },

  async getAnalytics() {
    return client.get('/doctor/analytics')
  },
}
