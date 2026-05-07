import { defineConfig, devices } from '@playwright/test';
import { getAuthFilePath, getAdminAuthFilePath, getBaseUrl } from './helpers/env-config';

const psicologoAuthFile = getAuthFilePath();
const adminAuthFile     = getAdminAuthFilePath();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: getBaseUrl(),
        trace: 'on-first-retry',
    },

    projects: [
        // ── Setup ────────────────────────────────────
        {
            name: 'setup',
            testDir: './auth',
            testMatch: /.*\.setup\.ts/,
        },

        // ── Chromium ─────────────────────────────────
        {
            name: 'chromium:regression',
            use: { ...devices['Desktop Chrome'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/regression',
        },
        {
            name: 'chromium:handover',
            use: { ...devices['Desktop Chrome'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/handover',
        },

        // ── Firefox ──────────────────────────────────
        {
            name: 'firefox:regression',
            use: { ...devices['Desktop Firefox'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/regression',
        },
        {
            name: 'firefox:handover',
            use: { ...devices['Desktop Firefox'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/handover',
        },

        // ── WebKit ───────────────────────────────────
        {
            name: 'webkit:regression',
            use: { ...devices['Desktop Safari'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/regression',
        },
        {
            name: 'webkit:handover',
            use: { ...devices['Desktop Safari'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/handover',
        },

        // ── Mobile Chrome ────────────────────────────
        {
            name: 'mobile-chrome:regression',
            use: { ...devices['Pixel 5'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/regression',
        },
        {
            name: 'mobile-chrome:handover',
            use: { ...devices['Pixel 5'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/handover',
        },

        // ── Mobile Safari ────────────────────────────
        {
            name: 'mobile-safari:regression',
            use: { ...devices['iPhone 12'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/regression',
        },
        {
            name: 'mobile-safari:handover',
            use: { ...devices['iPhone 12'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/handover',
        },

        // ── Smoke (Chromium — 3 auth levels) ──────────
        {
            name: 'chromium:smoke-public',
            use: { ...devices['Desktop Chrome'] },
            testDir: './tests/smoke/public',
        },
        {
            name: 'chromium:smoke-psicologo',
            use: { ...devices['Desktop Chrome'], storageState: psicologoAuthFile },
            dependencies: ['setup'],
            testDir: './tests/smoke/psicologo',
        },
        {
            name: 'chromium:smoke-admin',
            use: { ...devices['Desktop Chrome'], storageState: adminAuthFile },
            dependencies: ['setup'],
            testDir: './tests/smoke/admin',
        },
    ],
});
