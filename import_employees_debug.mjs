
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- STARTING DEBUG IMPORT (SIMPLE) ---');

    // 1. Load Department Mapping
    // (Skipping for now or using hardcoded path if needed, but mainly want to see CSV structure)
    const deptMappingPath = path.resolve('C:/Users/theva/.gemini/antigravity/brain/4fe75977-6128-431b-966d-361180ab47f6/department_mapping.json');
    try {
        const mappingContent = fs.readFileSync(deptMappingPath, 'utf-8');
        const deptMapping = JSON.parse(mappingContent);
        console.log(`Loaded department mapping: ${Object.keys(deptMapping).length} departments mapped.`);
    } catch (err) {
        console.log('Could not load department mapping (ignoring for structure check).');
    }

    // 2. Read CSV
    try {
        const content = fs.readFileSync('funcionarios.csv', 'utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

        console.log(`\nFound ${lines.length} non-empty lines in CSV.`);

        if (lines.length > 0) {
            // Analyze header (first line)
            const header = lines[0].split(';');
            console.log('\nHeader columns (split by ";"):');
            header.forEach((h, i) => console.log(`  ${i}: [${h}]`));

            // Analyze first 5 valid data lines
            console.log('\n--- DATA PREVIEW (First 5 lines) ---');
            let dataCount = 0;
            for (let i = 1; i < lines.length && dataCount < 5; i++) {
                const cols = lines[i].split(';');

                // Heuristic: valid line should have at least some columns filled
                // Based on previous peek: ;;Valtencir;...
                // It seems the first few columns might be empty?

                console.log(`Line ${i}:`);
                cols.forEach((c, idx) => {
                    if (c.trim()) console.log(`    Col ${idx}: ${c}`);
                });
                dataCount++;
            }
        }
    } catch (err) {
        console.error('Error reading CSV:', err);
    }
}

main();
