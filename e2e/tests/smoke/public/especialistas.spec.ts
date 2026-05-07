import { Browser } from '@playwright/test';
import { test, expect } from '../../../fixtures/base';
import { EspecialistasPage } from '../../../poms/especialistas.page';
import { EspecialistaPerfilPage } from '../../../poms/especialista-perfil.page';

test.describe('Directorio de especialistas — sin sesión', () => {
    let listado: EspecialistasPage;
    let firstId: number;

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        const page = await browser.newPage();
        listado = new EspecialistasPage(page);
        await listado.setUp();
        // Resolve first specialist ID from the href, e.g. /especialistas/3
        const href = await listado.getFirstSpecialistHref();
        firstId = parseInt(href.split('/').pop() ?? '1', 10);
    });

    test.afterAll(async () => {
        await listado.tearDown();
    });

    test('/especialistas carga y muestra tarjetas', async () => {
        await listado.assertCardsLoaded();
        await listado.assertAtLeastOneCard();
    });

    test('click en tarjeta navega al perfil correcto', async () => {
        await listado.setUp();
        await listado.clickFirstCard();
        // URL should contain the specialist ID
        expect(listado['page'].url()).toMatch(/\/especialistas\/\d+/);
    });

    test('perfil muestra nombre y badge Verificado', async () => {
        const perfil = new EspecialistaPerfilPage(listado['page'], firstId);
        await perfil.setUp();
        await perfil.assertNameVisible();
        await perfil.assertVerifiedBadgeVisible();
    });

    test('botón contacto sin sesión muestra "Ver información de contacto"', async () => {
        const perfil = new EspecialistaPerfilPage(listado['page'], firstId);
        await perfil.setUp();
        await perfil.assertContactButtonVisible();
        await perfil.assertLoginLinkInContactSection();
    });
});
