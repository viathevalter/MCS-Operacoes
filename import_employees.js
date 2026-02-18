
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Manually read .env file for credentials
async function loadEnv() {
    try {
        const envContent = await fs.readFile('.env', 'utf-8');
        const env = {};
        envContent.split(/\r?\n/).forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2 && !line.startsWith('#')) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
                env[key] = value;
            }
        });
        return env;
    } catch (err) {
        console.error('Error reading .env file:', err.message);
        return {};
    }
}

async function main() {
    console.log('--- STARTING EMPLOYEE IMPORT (ROBUST) ---');

    const env = await loadEnv();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials. Check .env file.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Load Department Mapping
    const deptMappingPath = 'C:/Users/theva/.gemini/antigravity/brain/4fe75977-6128-431b-966d-361180ab47f6/department_mapping.json';
    let deptMapping = {};
    try {
        const mappingContent = await fs.readFile(deptMappingPath, 'utf-8');
        deptMapping = JSON.parse(mappingContent);
        console.log(`Loaded department mapping: ${Object.keys(deptMapping).length} departments.`);
    } catch (err) {
        console.error(`Department mapping file not found or invalid at ${deptMappingPath}`);
        process.exit(1);
    }

    // 3. Load Companies for Lookup
    console.log('Fetching companies...');
    const { data: companies, error: companyError } = await supabase
        .from('empresas')
        .select('id, nome_pbi, nome_comercial');

    if (companyError) {
        console.error('Error fetching companies:', companyError);
        process.exit(1);
    }

    const companyMap = new Map();
    companies.forEach(c => {
        if (c.nome_pbi) companyMap.set(c.nome_pbi.trim().toLowerCase(), c.id);
        if (c.nome_comercial) companyMap.set(c.nome_comercial.trim().toLowerCase(), c.id);
    });
    console.log(`Loaded ${companies.length} companies for lookup.`);

    // 4. Read CSV
    const csvPath = 'funcionarios.csv';
    let lines = [];
    try {
        const content = await fs.readFile(csvPath, 'utf-8');
        lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        console.log(`Found ${lines.length} lines in CSV (including header).`);
    } catch (err) {
        console.error(`Error reading CSV file at ${csvPath}:`, err);
        process.exit(1);
    }

    if (lines.length < 2) {
        console.log('No data to import.');
        process.exit(0);
    }

    // 5. Process Lines
    let successCount = 0;
    let errorCount = 0;

    console.log('Starting processing lines...');

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(';');

        const empresaContratanteRaw = cols[0]?.trim();
        const empresaServiciosRaw = cols[1]?.trim();
        const usuario = cols[2]?.trim();
        const nomeCompleto = cols[3]?.trim();
        const email = cols[4]?.trim();
        const local = cols[5]?.trim();
        const deptIdRaw = cols[6]?.trim();
        const codigoResp = cols[7]?.trim();
        const telDireto = cols[8]?.trim();
        const ramal = cols[9]?.trim();
        const dataInicio = cols[10]?.trim();
        const dataNascimento = cols[11]?.trim();
        const status = cols[12]?.trim();
        const iban = cols[13]?.trim();

        if (!nomeCompleto) {
            console.warn(`Line ${i}: Skipping due to missing Name`);
            continue;
        }

        // Resolve IDs
        const department_id = deptMapping[deptIdRaw];
        if (!department_id) {
            console.warn(`Line ${i}: Skipping - Department ID "${deptIdRaw}" not found in mapping.`);
            errorCount++;
            continue;
        }

        const empresa_contratante_id = empresaContratanteRaw ? companyMap.get(empresaContratanteRaw.toLowerCase()) : null;
        const empresa_servicos_id = empresaServiciosRaw ? companyMap.get(empresaServiciosRaw.toLowerCase()) : null;

        let active = true;
        let estadotrabajador = status || 'Ativo';
        if (status && (status.toLowerCase().includes('inativo') || status.toLowerCase().includes('desligado'))) {
            active = false;
        }

        // Payload
        const payload = {
            department_id,
            empresa_contratante_id,
            empresa_servicos_id,
            nombrecompleto: nomeCompleto,
            usuario: usuario || null, // Ensure explicit null if empty
            correoempresarial: email || null,
            ubicaciontrabajo: local || null,
            codigoresponsabilidad: codigoResp || null,
            telefonodirecto: telDireto || null,
            extenciontelefonica: ramal || null,
            estadotrabajador: estadotrabajador,
            iban: iban || null,
            active: active,
            member_role: 'member'
        };

        // Only add dates if they look valid-ish (simple check)
        if (dataInicio && dataInicio.length > 5) payload.fechainicio = dataInicio;
        if (dataNascimento && dataNascimento.length > 5) payload.fechanacimiento = dataNascimento;

        try {
            const { error } = await supabase.from('mcs_department_members').insert([payload]);

            if (error) {
                console.error(`Line ${i}: DB Error - ${error.message}`);
                errorCount++;
            } else {
                successCount++;
            }
        } catch (err) {
            console.error(`Line ${i}: Unexpected Error -`, err);
            errorCount++;
        }

        // Small delay to avoid rate limits or congestion
        if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n--- IMPORT COMPLETE ---');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

main();
