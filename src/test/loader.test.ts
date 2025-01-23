import assert from 'assert';

describe('http module loader', () => {

    describe('happy cases', () => {

        it('loads http module', async () => {
            const { hello } = await import('http://localhost:8123/hello.mjs' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

        it('loads http module with another http import', async () => {
            const { hello } = await import('http://localhost:8123/uses-http-import.mjs' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

        it('loads http module with relative import', async () => {
            const { hello } = await import('http://localhost:8123/uses-relative-import.mjs' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

        it('loads http module with data URL import', async () => {
            const { hello } = await import('http://localhost:8123/uses-data-import.mjs' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

        it('loads data urls with http imports', async () => {
            const { hello } = await import('data:text/javascript,import { hello } from "http://localhost:8123/hello.mjs"; export { hello };' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

        it('loads data urls with other data URL imports', async () => {
            const { hello } = await import('data:text/javascript,import { hello } from "http://localhost:8123/uses-data-import.mjs"; export { hello };' as any);
            assert.strictEqual(hello('World'), 'Hello, World!');
        });

    });

    describe('not allowed', () => {

        it('fails to load http modules with Node.js imports', async () => {
            try {
                await import('http://localhost:8123/uses-nodejs-import.mjs' as any);
                throw new Error('Unexpected success');
            } catch (error: any) {
                assert.strictEqual(error.name, 'ModuleNotAllowedError');
            }
        });

        it('fails to load http modules with file imports', async () => {
            try {
                await import('http://localhost:8123/uses-file-import.mjs' as any);
                throw new Error('Unexpected success');
            } catch (error: any) {
                assert.strictEqual(error.name, 'ModuleNotAllowedError');
            }
        });

        it('fails to load http modules with node_modules imports', async () => {
            try {
                await import('http://localhost:8123/uses-node-modules-import.mjs' as any);
                throw new Error('Unexpected success');
            } catch (error: any) {
                assert.strictEqual(error.name, 'ModuleNotAllowedError');
            }
        });

    });

    describe('not found', () => {

        it('fails to load http modules with not found import', async () => {
            try {
                await import('http://localhost:8123/uses-not-found-import.mjs' as any);
                throw new Error('Unexpected success');
            } catch (error: any) {
                assert.strictEqual(error.name, 'ModuleLoadingError');
            }
        });

    });

});
