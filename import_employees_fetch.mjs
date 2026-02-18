
import fs from 'fs';
import path from 'path';

// 1. Manually read .env
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

async function fetchCompanies() {
    const res = await fetch(`${supabaseUrl}/rest/v1/empresas?select=id,nome_pbi,nome_comercial`, {
        headers: headers
    });
    if (!res.ok) throw new Error(`Companies fetch error: ${res.statusText}`);
    return await res.json();
}

async function insertEmployee(payload) {
    const res = await fetch(`${supabaseUrl}/rest/v1/mcs_department_members`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Insert error: ${res.status} - ${text}`);
    }
}

async function main() {
    console.log('--- STARTING IMPORT (FETCH VERSION) ---');

    // Load Mappings
    const deptMappingPath = 'C:/Users/theva/.gemini/antigravity/brain/4fe75977-6128-431b-966d-361180ab47f6/department_mapping.json';
    const deptMapping = JSON.parse(fs.readFileSync(deptMappingPath, 'utf-8'));
    console.log(`Departments mapped: ${Object.keys(deptMapping).length}`);

    // Fetch Companies
    let companyMap = new Map();
    try {
        const companies = await fetchCompanies();
        companies.forEach(c => {
            if (c.nome_pbi) companyMap.set(c.nome_pbi.trim().toLowerCase(), c.id);
            if (c.nome_comercial) companyMap.set(c.nome_comercial.trim().toLowerCase(), c.id);
        });
        console.log(`Companies loaded: ${companies.length}`);
    } catch (err) {
        console.error('Could not fetch companies:', err);
        process.exit(1);
    }

    // Read CSV
    const csvContent = fs.readFileSync('funcionarios.csv', 'utf-8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    console.log(`CSV Lines: ${lines.length}`);

    let success = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(';');

        // Extract Logic
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

        if (!nomeCompleto) continue;

        const department_id = deptMapping[deptIdRaw];
        if (!department_id) {
            console.warn(`Line ${i}: Dept ID ${deptIdRaw} not found.`);
            errors++;
            continue;
        }

        const empresa_contratante_id = empresaContratanteRaw ? companyMap.get(empresaContratanteRaw.toLowerCase()) : null;
        const empresa_servicos_id = empresaServiciosRaw ? companyMap.get(empresaServiciosRaw.toLowerCase()) : null;

        let active = true;
        let estadotrabajador = status || 'Ativo';
        if (status && (status.toLowerCase().includes('inativo') || status.toLowerCase().includes('desligado'))) {
            active = false;
        }

        const payload = {
            department_id,
            empresa_contratante_id,
            empresa_servicos_id,
            nombrecompleto: nomeCompleto,
            usuario: usuario || null,
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

        // Date cleanup
        if (dataInicio && dataInicio.length > 5) payload.fechainicio = dataInicio;
        else delete payload.fechainicio;
        if (dataNascimento && dataNascimento.length > 5) payload.fechanacimiento = dataNascimento;
        else delete payload.fechanacimiento;

        try {
            await insertEmployee(payload);
            success++;
            if (success % 10 === 0) process.stdout.write('.');
        } catch (err) {
            console.error(`\nLine ${i} Error:`, err);
            errors++;
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 20));
    }

    console.log(`\nImport Done. Success: ${success}, Errors: ${errors}`);
}

main();
