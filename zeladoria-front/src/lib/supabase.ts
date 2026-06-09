import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("Variável de ambiente não definida: NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Variável de ambiente não definida: NEXT_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Instância global do cliente Supabase.
 * Fornece a conexão necessária para as funcionalidades de Autenticação, 
 * Storage de arquivos e subscrições WebSocket (Realtime).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);