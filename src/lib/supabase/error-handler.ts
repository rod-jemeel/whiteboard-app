// Supabase error handler utility

export function handleSupabaseError(error: any, context: string) {
  console.error(`[${context}] Supabase error:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    statusCode: error?.statusCode
  })

  // Common error codes
  if (error?.code === 'PGRST116') {
    return 'Access denied. Please check your permissions.'
  }
  
  if (error?.code === 'PGRST301') {
    return 'Multiple results found. Please be more specific.'
  }

  if (error?.statusCode === 406) {
    return 'Request not acceptable. This may be due to Row Level Security policies.'
  }

  if (error?.statusCode === 409) {
    return 'Conflict detected. The resource may already exist.'
  }

  return error?.message || 'An unexpected error occurred'
}

export function isAuthError(error: any): boolean {
  return error?.statusCode === 401 || error?.message?.includes('JWT')
}

export function isPermissionError(error: any): boolean {
  return error?.statusCode === 403 || error?.statusCode === 406 || error?.code === 'PGRST116'
}