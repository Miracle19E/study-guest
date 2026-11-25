/* ===== Study Quest — Supabase client (shared by all pages) ===== */
/* This classic script creates ONE Supabase client and stores it in  */
/* a global variable. Every page includes this file BEFORE its own   */
/* scripts, and then uses the global `sq` object.                    */

// The Supabase library itself is loaded from the CDN in each HTML page:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Project URL and publishable (anon) key — safe to use in the browser
var SUPABASE_URL = "https://kscdkqqldfqkwcjxvlqm.supabase.co";
var SUPABASE_KEY = "sb_publishable_s1oS7beHqYojIjxKZ6ATuQ_bRbfdQmK";

// Create the single shared client and store it in a global `sq`
// (named `sq` to avoid clashing with the CDN's own `supabase` global,
// which holds the library object with .createClient)
var sq = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
