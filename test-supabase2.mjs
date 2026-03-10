import { createClient } from '@supabase/supabase-js';

const url = "YOUR_SUPABASE_URL";
const key = "YOUR_SUPABASE_KEY";

const supabase = createClient(url, key);

async function run() {
    const { data: userData, error: userError } = await supabase.from('mcs_users').select('*').limit(1);
    console.log("Users:", userData, userError);

    // Try an update with the anon key (should fail if RLS is on)
    const { data: updateData, error: updateError } = await supabase.from('mcs_users').update({ role: 'admin' }).eq('email', 'wolmer@gestaologinpro.com');
    console.log("Update:", updateData, updateError);
}

run();
