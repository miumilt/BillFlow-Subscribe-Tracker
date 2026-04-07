export const LOCAL_DATA_MODE =
  import.meta.env.VITE_FORCE_LOCAL_DATA === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
