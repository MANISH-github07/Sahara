import axios from 'axios'

// Default client — 15 s timeout for standard requests
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Long-timeout client for AI chat — free OpenRouter models can take up to 60s
export const chatClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 70000,   // 70s — gives free models enough time even under load
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request (both clients)
const attachToken = (config) => {
  const token = localStorage.getItem('sahara_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

client.interceptors.request.use(attachToken, (e) => Promise.reject(e))
chatClient.interceptors.request.use(attachToken, (e) => Promise.reject(e))

// Handle 401 (both clients)
const handle401 = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('sahara_token')
    localStorage.removeItem('sahara_user')
    window.dispatchEvent(new Event('sahara:unauthorized'))
  }
  return Promise.reject(error)
}

client.interceptors.response.use((r) => r.data, handle401)
chatClient.interceptors.response.use((r) => r.data, handle401)

export default client
