import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { before } from 'mocha';

const server = createServer(async (req, res) => {
    try {
        const fileUrl = new URL('./modules/' + req.url, import.meta.url);
        const file = await readFile(fileUrl, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(file);
    } catch (_err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

before(async () => {
    await new Promise<void>(r => server.listen(8123, r));
});

after(async () => {
    await new Promise(r => server.close(r));
});
