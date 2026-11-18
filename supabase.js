/* ===== Study Quest — Supabase client (shared by all pages) ===== */
/* This file creates ONE Supabase client and exports it.          */
/* Every page that needs the database imports from here.          */

// Load the Supabase library from the installed npm package
import { createClient } from "@supabase/supabase-js";

// Project URL and publishable (anon) key — safe to use in the browser
const SUPABASE_URL = "https://kscdkqqldfqkwcjxvlqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_s1oS7beHqYojIjxKZ6ATuQ_bRbfdQmK";

// Create the single shared client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
