export const buildRequestOptions = (): RequestInit => {
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return {
    headers,
  }
}
