/**
 * Base API Client
 * Configured with environment variable or fallback, ready for Flask backend integration.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ganaderapp_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    // When backend is not yet connected, return null to let mock services handle it gracefully
    console.warn(`[API] Fallback for ${endpoint}:`, err.message)
    throw err
  }
}

/**
 * Helper to simulate network latency for mock calls
 */
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
