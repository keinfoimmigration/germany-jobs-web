// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// These come from your Supabase dashboard
const SUPABASE_URL = "https://sofkeqlzhsmzvpbkicxm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_K9a6xqiWFTKK3z4z2tA0vQ_HM9cd6bH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);