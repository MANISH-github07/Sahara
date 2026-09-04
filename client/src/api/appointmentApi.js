import client from './client'

export const appointmentApi = {
  async list(params = {}) {
    return client.get('/appointments', { params })
  },

  async getDoctors() {
    return client.get('/appointments/doctors')
  },

  async getDoctorAvailability(doctorId, date) {
    return client.get(`/appointments/doctors/${doctorId}/availability`, { params: { date } })
  },

  async updateSchedule(payload) {
    // payload: { availableSlots: ['09:00','10:00',...], workingDays: [1,2,3,4,5] }
    return client.put('/appointments/doctors/schedule', payload)
  },

  async book(payload) {
    return client.post('/appointments', payload)
  },

  async cancel(id, reason) {
    return client.patch(`/appointments/${id}/cancel`, { reason })
  },

  async complete(id) {
    return client.patch(`/appointments/${id}/complete`)
  },
}
