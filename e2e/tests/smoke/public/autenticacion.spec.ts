import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../poms/login.page';
import { RegistroPage } from '../../../poms/registro.page';
import { getCredentials, getAdminCredentials } from '../../../helpers/env-config';

// Each test gets a fresh page context (via the `page` fixture) so
// localStorage is clean and tests are fully independent.

test.describe('Autenticación — login', () => {
    test('login psicólogo redirige a /dashboard', async ({ page }) => {
        const { email, password } = getCredentials();
        const loginPage = new LoginPage(page);
        await loginPage.setUp();
        await loginPage.loginAs(email, password);
        await loginPage.assertRedirectedTo(/\/dashboard/);
    });

    test('login admin redirige a /admin', async ({ page }) => {
        const { email, password } = getAdminCredentials();
        const loginPage = new LoginPage(page);
        await loginPage.setUp();
        await loginPage.loginAs(email, password);
        await loginPage.assertRedirectedTo(/\/admin/);
    });

    test('login con credenciales incorrectas muestra error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.setUp();
        await loginPage.loginAs('noexiste@ejemplo.com', 'password_incorrecta');
        await loginPage.assertLoginFailed();
    });
});

test.describe('Autenticación — registro', () => {
    test('registro de usuario nuevo exitoso redirige a /especialistas', async ({ page, testData }) => {
        const registroPage = new RegistroPage(page);
        await registroPage.setUp();
        await registroPage.registerAs(
            testData.registro.nombre,
            testData.registro.apellido,
            testData.registro.email,
            testData.registro.password,
        );
        await registroPage.assertRegistrationSuccess();
    });
});
