// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// These come from your Supabase dashboard
const SUPABASE_URL = "https://gbotwkyaagcffzvcyzuy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Egi9rMCDbL0BP6R9Mbh_0Q_LxEHau5r";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);