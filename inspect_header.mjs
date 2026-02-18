import fs from 'fs';

const content = fs.readFileSync('funcionarios.csv', 'utf-8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

if (lines.length > 0) {
    console.log('--- HEADER ---');
    console.log(lines[0]);
    console.log('--- FIRST DATA LINE ---');
    if (lines.length > 1) console.log(lines[1]);
} else {
    console.log('File is empty or contains only whitespace.');
}
