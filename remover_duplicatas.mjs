
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env
const envPath = '.env';
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2 && !line.startsWith('#')) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- REMOVENDO DUPLICATAS ---');

    // Fetch all employees (id, name, created_at)
    const { data: employees, error } = await supabase
        .from('mcs_department_members')
        .select('id, nombrecompleto, created_at')
        .order('created_at', { ascending: true }); // Keep oldest?

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Total de registros: ${employees.length}`);

    const seen = new Map();
    const toDelete = [];

    employees.forEach(emp => {
        const name = emp.nombrecompleto?.trim().toLowerCase();
        if (!name) return;

        if (seen.has(name)) {
            // Duplicate found
            toDelete.push(emp.id);
        } else {
            // First time seeing this name, keep it
            seen.set(name, emp.id);
        }
    });

    console.log(`Duplicatas encontradas: ${toDelete.length}`);

    if (toDelete.length > 0) {
        // Delete in batches
        const batchSize = 100;
        for (let i = 0; i < toDelete.length; i += batchSize) {
            const batch = toDelete.slice(i, i + batchSize);
            const { error: delError } = await supabase
                .from('mcs_department_members')
                .delete()
                .in('id', batch);

            if (delError) console.error('Erro ao deletar lote:', delError);
            else console.log(`Deletados ${batch.length} registros.`);
        }
        console.log('Limpeza concluída!');
    } else {
        console.log('Nenhuma duplicata para remover.');
    }
}

main();
