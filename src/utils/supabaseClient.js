// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// These come from your Supabase dashboard
const SUPABASE_URL = "https://ysxjsmumcxxfsihxofma.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_H31R0pzii6aapeAShAV2Cg_JBnwGL8o";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);