-- Deploy function for Telegram authentication
-- This handles the Telegram Mini App auth flow

CREATE OR REPLACE FUNCTION handle_telegram_auth(
  telegram_id BIGINT,
  first_name TEXT,
  last_name TEXT DEFAULT NULL,
  username TEXT DEFAULT NULL,
  photo_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  auth_token TEXT
) AS $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO existing_user_id FROM users WHERE users.telegram_id = handle_telegram_auth.telegram_id;
  
  IF existing_user_id IS NOT NULL THEN
    -- Update existing user
    UPDATE users SET
      first_name = handle_telegram_auth.first_name,
      last_name = handle_telegram_auth.last_name,
      username = handle_telegram_auth.username,
      photo_url = handle_telegram_auth.photo_url,
      updated_at = NOW()
    WHERE id = existing_user_id;
    
    user_id := existing_user_id;
  ELSE
    -- Create new user
    INSERT INTO users (telegram_id, first_name, last_name, username, photo_url)
    VALUES (handle_telegram_auth.telegram_id, handle_telegram_auth.first_name, handle_telegram_auth.last_name, handle_telegram_auth.username, handle_telegram_auth.photo_url)
    RETURNING id INTO new_user_id;
    
    -- Create notification preferences for new user
    INSERT INTO notification_preferences (user_id)
    VALUES (new_user_id);
    
    -- Copy default categories to user
    INSERT INTO categories (user_id, name, icon, color, sort_order)
    SELECT new_user_id, name, icon, color, sort_order
    FROM categories WHERE is_default = TRUE;
    
    user_id := new_user_id;
  END IF;
  
  -- Return a simple token (in production, use proper JWT)
  auth_token := encode(gen_random_bytes(32), 'base64');
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
