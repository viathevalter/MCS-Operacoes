import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(SRC_DIR);
const keys = new Set();
const regex = /t\(['"`](.*?)['"`]\)/g;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
    }
});

console.log('--- ALL KEYS USED IN PROJECT ---');
const sortedKeys = Array.from(keys).sort();
sortedKeys.forEach(k => console.log(k));
