import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramAuthRequest {
  telegram_id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: TelegramAuthRequest = await req.json()

    // Call the database function to handle user creation/update
    const { data, error } = await supabaseClient.rpc('handle_telegram_auth', {
      telegram_id: body.telegram_id,
      first_name: body.first_name,
      last_name: body.last_name || null,
      username: body.username || null,
      photo_url: body.photo_url || null,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user_id,
          telegram_id: body.telegram_id,
          first_name: body.first_name,
          last_name: body.last_name,
          username: body.username,
          photo_url: body.photo_url,
        },
        token: data.auth_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
