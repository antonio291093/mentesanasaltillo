import { Browser } from '@playwright/test';
import { test, expect } from '../../../fixtures/base';
import { EspecialistasPage } from '../../../poms/especialistas.page';
import { EspecialistaPerfilPage } from '../../../poms/especialista-perfil.page';

test.describe('Directorio de especialistas — con sesión', () => {
    let perfil: EspecialistaPerfilPage;

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        const page = await browser.newPage();
        const listado = new EspecialistasPage(page);
        await listado.setUp();
        const href = await listado.getFirstSpecialistHref();
        const id = parseInt(href.split('/').pop() ?? '1', 10);
        perfil = new EspecialistaPerfilPage(page, id);
        await perfil.setUp();
    });

    test.afterAll(async () => {
        await perfil.tearDown();
    });

    test('botón contacto con sesión muestra información de contacto', async () => {
        await perfil.assertContactInfoVisible();
    });
});
