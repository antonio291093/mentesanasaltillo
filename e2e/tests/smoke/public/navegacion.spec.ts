import { Browser } from '@playwright/test';
import { test, expect } from '../../../fixtures/base';
import { LandingPage } from '../../../poms/landing.page';

test.describe('Navegación general', () => {
    let landing: LandingPage;

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        const page = await browser.newPage();
        landing = new LandingPage(page);
        await landing.setUp();
    });

    test.afterAll(async () => {
        await landing.tearDown();
    });

    test('landing page carga correctamente', async () => {
        await landing.assertHeroHeadingVisible();
        await landing.assertLocationBadgeVisible();
    });

    test('navbar muestra los tres enlaces principales', async () => {
        await landing.assertNavLinkPresent('Inicio');
        await landing.assertNavLinkPresent('Especialistas');
        await landing.assertNavLinkPresent('Sobre Nosotros');
    });

    test('link Especialistas navega a /especialistas', async () => {
        await landing.setUp(); // start at /
        await landing.clickNavLink('Especialistas');
        await landing.assertUrl(/\/especialistas/);
    });

    test('link Sobre Nosotros navega a /sobre-nosotros', async () => {
        await landing.setUp(); // start at /
        await landing.clickNavLink('Sobre Nosotros');
        await landing.assertUrl(/\/sobre-nosotros/);
    });

    test('footer visible con número SAPTEL 800-290-0024', async () => {
        await landing.setUp();
        await landing.assertFooterVisible();
        await landing.assertFooterSaptelLink();
    });
});
