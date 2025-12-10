export const env = {
  API_URL: import.meta.env.VITE_API_URL || '',
} as const

export function getApiUrl(path: string): string {
  const baseUrl = env.API_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!baseUrl) {
    return normalizedPath
  }

  return `${baseUrl}${normalizedPath}`
}
