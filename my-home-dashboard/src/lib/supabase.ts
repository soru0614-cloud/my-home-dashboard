
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slpbqiceearnetcnsweg.supabase.co';
const supabaseKey = 'sb_publishable__QROPavlI-k2nsJPYdOzeg_NkEPze3P'; // Anon key (safe for client side if RLS is on)

export const supabase = createClient(supabaseUrl, supabaseKey);
