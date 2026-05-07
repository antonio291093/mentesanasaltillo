import { Browser } from '@playwright/test';
import { test, expect } from '../../../fixtures/base';
import { AdminPage } from '../../../poms/admin.page';

test.describe('Dashboard administrador', () => {
    let adminPage: AdminPage;

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        const page = await browser.newPage();
        adminPage = new AdminPage(page);
        await adminPage.setUp();
    });

    test.afterAll(async () => {
        await adminPage.tearDown();
    });

    test('resumen muestra encabezado y estadísticas', async () => {
        await adminPage.assertStatsLoaded();
    });

    test('profesionales muestra tabs Pendientes / Aprobados / Rechazados', async () => {
        await adminPage.navigateToProfesionales();
        await adminPage.assertProfesionalesTabsVisible();
    });

    test('reseñas muestra tabs Todas / Pendientes / Aprobadas / Rechazadas', async () => {
        await adminPage.navigateToResenas();
        await adminPage.assertResenasTabsVisible();
    });
});
