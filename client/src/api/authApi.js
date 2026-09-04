import client from './client'
import { API_ENDPOINTS } from '../constants/api'

export const authApi = {
  async login(email, password) {
    return client.post(API_ENDPOINTS.LOGIN, { email, password })
  },

  async register(payload) {
    return client.post(API_ENDPOINTS.REGISTER, payload)
  },

  async logout(refreshToken) {
    return client.post(API_ENDPOINTS.LOGOUT, { refreshToken })
  },

  async refreshToken(refreshToken) {
    return client.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken })
  },

  async forgotPassword(email) {
    return client.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
  },

  async me() {
    return client.get(API_ENDPOINTS.ME)
  },
}
