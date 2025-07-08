import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test database connection
    const { error: dbError } = await supabase
      .from('whiteboards')
      .select('count')
      .limit(0)
    
    // Test auth
    const { data: { user } } = await supabase.auth.getUser()
    
    return NextResponse.json({
      status: 'healthy',
      database: dbError ? 'error' : 'connected',
      auth: user ? 'authenticated' : 'anonymous',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}