import { LoadHookContext, ResolveHookContext, } from 'node:module';

export async function resolve(specifier: string, context: ResolveHookContext, next: (...args: any[]) => void) {
    // Do not handle entrypoint resolution
    const { parentURL } = context;
    if (parentURL == null) {
        return next(specifier, context);
    }
    // Modules imported via HTTP can only resolve `http:`, `data:` and relative imports.
    if (isHttpSpecifier(parentURL)) {
        const allowed = isHttpSpecifier(specifier) || isDataUrl(specifier) || isRelativeImport(specifier);
        if (!allowed) {
            throw new ModuleNotAllowedError(`Cannot load "${specifier}" from "${parentURL}". Only http:, data: and relative imports are allowed`);
        }
        const resolvedUrl = isRelativeImport(specifier) ? new URL(specifier, parentURL).toString() : specifier;
        return {
            url: resolvedUrl,
            shortCircuit: true,
        };
    }
    // Modules imported from Data URLs can only resolve `http:` and `data:`
    if (isDataUrl(parentURL)) {
        const allowed = isHttpSpecifier(specifier) || isDataUrl(specifier);
        if (!allowed) {
            throw new ModuleNotAllowedError(`Cannot load "${specifier}" from "${parentURL}". Only http: and data: imports are allowed`);
        }
        return {
            url: specifier,
            shortCircuit: true,
        };
    }
    // Otherwise use default resolver
    return next(specifier, context);
}

export async function load(specifier: string, context: LoadHookContext, next: (...args: any[]) => void) {
    if (!isHttpSpecifier(specifier)) {
        return next(specifier, context);
    }
    try {
        return await tryHttpImport(specifier);
    } catch (error: any) {
        throw new ModuleLoadingError(`Failed to load module: ${error.message}`);
    }
}

async function tryHttpImport(specifier: string) {
    const url = new URL(specifier);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const source = await response.text();
    return {
        source,
        format: 'module',
        shortCircuit: true,
    };
}

function isHttpSpecifier(specifier: string) {
    return specifier.startsWith('https://') || isLocalhost(specifier);
}

function isLocalhost(specifier: string) {
    return specifier.startsWith('http://localhost') || specifier.startsWith('http://127.0.0.1');
}

function isRelativeImport(specifier: string) {
    return specifier.startsWith('./') || specifier.startsWith('../');
}

function isDataUrl(specifier: string) {
    return specifier.startsWith('data:');
}

export class ModuleLoadingError extends Error {

    override name = this.constructor.name;

}

export class ModuleNotAllowedError extends Error {

    override name = this.constructor.name;

}
