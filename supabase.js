
import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Replace these with your own Supabase project details.
const SUPABASE_URL = "https://grehasyqcypnijrueouv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bPjHB7ql-tNo6DJ18VN21w_QOwEhf1Z";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
