import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  if (typeof window === 'undefined') return;
  try {
    const res = await axios.get(`${API_URL}/api/v1/csrf-token`, { withCredentials: true });
    csrfToken = res.data.data.csrfToken;
  } catch (e) {
    console.error('Failed to fetch CSRF token', e);
  }
}

if (typeof window !== 'undefined') {
  fetchCsrfToken();
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const siteId = document.cookie
      .split('; ')
      .find(r => r.startsWith('siteId='))
      ?.split('=')[1]
    const isAuthRoute = config.url?.startsWith('/auth/') || config.url?.includes('/auth/')
    if (siteId && !isAuthRoute) {
      config.headers['X-Site-ID'] = siteId
      if (!config.params) config.params = {}
      config.params.site = siteId
    }
    
    // CSRF Injection
    const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
    if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        // Refresh token sekarang dikirim via cookie secara otomatis
        await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        return api(original)
      } catch (refreshError) {
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)