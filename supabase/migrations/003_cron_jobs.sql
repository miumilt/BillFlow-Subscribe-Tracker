-- Create a cron job to update next_payment_date for subscriptions
-- This runs daily and advances the next_payment_date for subscriptions that have passed

CREATE OR REPLACE FUNCTION advance_subscription_dates()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  rec RECORD;
  new_next_date DATE;
BEGIN
  FOR rec IN 
    SELECT id, next_payment_date, billing_cycle
    FROM subscriptions
    WHERE next_payment_date < CURRENT_DATE
      AND is_active = TRUE
  LOOP
    -- Calculate next payment date
    new_next_date := rec.next_payment_date;
    
    WHILE new_next_date < CURRENT_DATE LOOP
      CASE rec.billing_cycle
        WHEN 'weekly' THEN
          new_next_date := new_next_date + INTERVAL '7 days';
        WHEN 'monthly' THEN
          new_next_date := new_next_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN
          new_next_date := new_next_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
          new_next_date := new_next_date + INTERVAL '1 year';
      END CASE;
    END LOOP;
    
    -- Update the subscription
    UPDATE subscriptions
    SET next_payment_date = new_next_date,
        updated_at = NOW()
    WHERE id = rec.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available)
-- This runs every day at 3 AM UTC
-- SELECT cron.schedule('advance-subscription-dates', '0 3 * * *', 'SELECT advance_subscription_dates()');
