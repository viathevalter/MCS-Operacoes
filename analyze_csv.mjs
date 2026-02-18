import fs from 'fs';

try {
    const content = fs.readFileSync('funcionarios.csv', 'utf-8');
    console.log('--- RAW CONTENT START ---');
    console.log(content.substring(0, 1000)); // Print first 1000 chars
    console.log('--- RAW CONTENT END ---');

    const lines = content.split(/\r?\n/);
    console.log(`Total lines: ${lines.length}`);

    if (lines.length > 0) {
        console.log('Header line:', lines[0]);
        // Find first non-empty data line
        const dataLine = lines.find((l, i) => i > 0 && l.trim().length > 0);
        console.log('First data line:', dataLine);
    }
} catch (err) {
    console.error('Error reading file:', err);
}
