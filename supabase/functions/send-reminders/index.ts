import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const botToken = Deno.env.get('BOT_TOKEN')
    if (!botToken) {
      throw new Error('BOT_TOKEN not configured')
    }

    // Find subscriptions due for reminder
    const { data: reminders, error: queryError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        user:users(telegram_id),
        prefs:notification_preferences(*)
      `)
      .eq('is_active', true)
      .gte('next_payment_date', new Date().toISOString().split('T')[0])
      .lte('next_payment_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (queryError) throw queryError

    const results = []
    
    for (const sub of reminders || []) {
      // Skip if notifications disabled
      if (!sub.prefs?.is_enabled) continue

      const daysUntil = Math.ceil(
        (new Date(sub.next_payment_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      // Only notify if within user's preferred days
      if (daysUntil > (sub.prefs?.notify_days_before || 3)) continue

      const message = `🔔 *Payment Reminder*

*${sub.name}* is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!

💰 Amount: ${sub.cost} ${sub.currency}
📅 Due: ${sub.next_payment_date}

Open BillFlow to view details.`

      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sub.user.telegram_id,
            text: message,
            parse_mode: 'Markdown',
          }),
        })

        if (response.ok) {
          results.push({ subscription: sub.id, status: 'sent' })
        } else {
          results.push({ subscription: sub.id, status: 'failed', error: await response.text() })
        }
      } catch (e) {
        results.push({ subscription: sub.id, status: 'error', error: e.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
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
