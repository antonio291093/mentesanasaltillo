import { Browser } from '@playwright/test';
import { test, expect } from '../../../fixtures/base';
import { DashboardPsicologoPage } from '../../../poms/dashboard-psicologo.page';

test.describe('Dashboard psicólogo', () => {
    let dashboard: DashboardPsicologoPage;

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        const page = await browser.newPage();
        dashboard = new DashboardPsicologoPage(page);
        await dashboard.setUp();
    });

    test.afterAll(async () => {
        await dashboard.tearDown();
    });

    test('resumen carga con estado de verificación', async () => {
        await dashboard.assertDashboardLoaded();
        await dashboard.assertVerificationStatusVisible();
    });

    test('Mi Perfil carga con encabezado visible', async () => {
        await dashboard.navigateToPerfil();
        await dashboard.assertPerfilPageLoaded();
    });

    test('Horarios carga con días de la semana', async () => {
        await dashboard.navigateToHorarios();
        await dashboard.assertHorariosPageLoaded();
    });

    test('Reseñas carga con tres tabs', async () => {
        await dashboard.navigateToResenas();
        await dashboard.assertResenasPageLoaded();
    });
});
