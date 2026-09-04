import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Preencha com os dados do seu projeto Supabase (Project Settings > API).
 * A "anon key" é feita para ser usada no cliente (protegida por Row Level
 * Security no banco) — ver README.md para o passo a passo de configuração.
 */
export const SUPABASE_URL = 'https://dbcskkzpswnqsjlxfrlu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_yG9kWePLzc7qN9WKc6_07Q_ThIKkEi1';

export const FOTOS_BUCKET = 'fotos-checklist';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
