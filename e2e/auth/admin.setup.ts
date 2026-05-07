import { test as setup } from '@playwright/test';
import { getBaseUrl, getAdminCredentials, getAdminAuthFilePath } from '../helpers/env-config';

const authFile = getAdminAuthFilePath();

setup('authenticate as admin', async ({ page }) => {
    const { email, password } = getAdminCredentials();

    await page.goto(getBaseUrl() + '/auth/login');

    await page.getByLabel('Correo electrónico').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await page.waitForURL(/\/admin/);

    await page.context().storageState({ path: authFile });
});
