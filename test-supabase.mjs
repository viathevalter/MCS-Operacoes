import { createClient } from '@supabase/supabase-js';

const url = "YOUR_SUPABASE_URL";
const key = "YOUR_SUPABASE_KEY";

const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase.from('mcs_users').select('*').limit(1);
    console.log("Users:", data, error);
}

run();
