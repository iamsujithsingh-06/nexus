import axios from 'axios';

let requestCounter = 0;

function generateRequestId() {
  requestCounter += 1;
  return `fe-${Date.now()}-${requestCounter}`;
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const reqId = generateRequestId();
  config.headers['X-Request-ID'] = reqId;
  config._reqId = reqId;

  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  console.error('[FE_REQ_ERR] Request setup failed:', error.message);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const reqId = error.config?._reqId || '?';

    if (error.code === 'ECONNABORTED') {
      console.error(`[TIMEOUT:${reqId}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      if (status === 429) {
        console.error(`[429:${reqId}] ${error.config?.method?.toUpperCase()} ${error.config?.url} — body=${JSON.stringify(data)}`);
      }
      if (status >= 500) {
        console.error(`[ERR:${reqId}] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      }
      if (status === 401) {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error(`[NO_RES:${reqId}] ${error.config?.url}: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;
