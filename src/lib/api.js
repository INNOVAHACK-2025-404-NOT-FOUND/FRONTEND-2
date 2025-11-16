const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

export async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const config = {
    method,
    headers: { ...defaultHeaders, ...headers },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.message || 'Hubo un problema al comunicar con el servidor.'
    throw new Error(message)
  }

  return data
}

export async function uploadForecastCsv({ file, periods, seasonality, datasetName }, token) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('periods', String(periods ?? 6))
  formData.append('seasonality', String(seasonality ?? 12))
  if (datasetName) {
    formData.append('dataset_name', datasetName)
  }

  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/forecast/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.message || 'Hubo un problema al procesar el CSV.'
    throw new Error(message)
  }

  return data
}

export async function fetchLatestForecast(token) {
  return request('/forecast/latest', { token })
}

export async function listForecastBatches(token, { limit = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) })
  return request(`/forecast/batches?${params.toString()}`, { token })
}

export async function fetchForecastBatch(batchId, token) {
  return request(`/forecast/batches/${batchId}`, { token })
}

export async function listUsers(token) {
  return request('/users/', { token })
}

export async function createUser(user, token) {
  return request('/users/', { method: 'POST', body: user, token })
}

export async function updateUser(userId, user, token) {
  return request(`/users/${userId}`, { method: 'PUT', body: user, token })
}

export async function deleteUser(userId, token) {
  return request(`/users/${userId}`, { method: 'DELETE', token })
}

export async function createCustomScenario(scenarioData, token) {
  return request('/forecast/custom-scenario', { method: 'POST', body: scenarioData, token })
}

export { API_BASE_URL }
