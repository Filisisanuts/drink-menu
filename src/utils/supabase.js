import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kwnbmfeolvzjbnkqgoz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bmJtZmVvbHZjempia25xZ296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzQxMzksImV4cCI6MjEwMDkxMDEzOX0.bktOa3lF5WJ2FhouE01RIyKglzW3LmYNy1PRylPCOHs'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 检查连接状态
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1)
    if (error) throw error
    return { connected: true, data }
  } catch (err) {
    console.error('Supabase connection error:', err)
    return { connected: false, error: err.message }
  }
}
