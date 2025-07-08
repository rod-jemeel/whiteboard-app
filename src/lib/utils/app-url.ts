/**
 * Get the application URL based on environment
 * Uses NEXT_PUBLIC_APP_URL env variable if set, otherwise falls back to localhost
 */
export function getAppUrl() {
  if (typeof window !== 'undefined') {
    // Client-side: use the current origin
    return window.location.origin
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/**
 * Get the full URL for a given path
 */
export function getFullUrl(path: string) {
  const appUrl = getAppUrl()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${appUrl}${normalizedPath}`
}