import { test as base } from '@playwright/test';

// ──────────────────────────────────────────────
// Test Data Interfaces
// ──────────────────────────────────────────────

interface RegistroData {
    nombre:   string;
    apellido: string;
    email:    string;
    password: string;
}

interface FeatureTestData {
    registro: RegistroData;
}

// ──────────────────────────────────────────────
// stampUnique — collision-free parallel data
// ──────────────────────────────────────────────

/**
 * Recursively appends a unique suffix (timestamp + random ID) to every
 * string value in the given data structure. This guarantees parallel
 * workers never collide on test data.
 *
 * For email addresses the suffix is inserted before the @ to keep the
 * address valid: "smoke@mente-sana.com" → "smoke-1711234567890-a1b2c3@mente-sana.com"
 * For other strings: "Test" → "Test-1711234567890-a1b2c3"
 */
function stampUnique(data: unknown): unknown {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (typeof data === 'string') {
        if (data.includes('@')) {
            const atIndex = data.indexOf('@');
            return `${data.slice(0, atIndex)}-${suffix}${data.slice(atIndex)}`;
        }
        return `${data}-${suffix}`;
    }
    if (Array.isArray(data)) return data.map(stampUnique);
    if (typeof data === 'object' && data !== null) {
        return Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, stampUnique(v)])
        );
    }
    return data;
}

// ──────────────────────────────────────────────
// Custom test fixture
// ──────────────────────────────────────────────

export const test = base.extend<{ testData: FeatureTestData }>({
    testData: async ({}, use) => {
        const raw: FeatureTestData = {
            registro: require('../test-data/registro.json'),
        };
        await use(stampUnique(raw) as FeatureTestData);
    },
});

export { expect } from '@playwright/test';
