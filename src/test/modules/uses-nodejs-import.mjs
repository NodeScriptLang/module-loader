import fs from 'fs';

export function hello(name) {
    return fs.readFileSync(name + '.txt', 'utf-8');
}
