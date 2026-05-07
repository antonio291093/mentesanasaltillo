import { test as setup } from '@playwright/test';
import { getBaseUrl, getCredentials, getAuthFilePath } from '../helpers/env-config';

const authFile = getAuthFilePath();

setup('authenticate', async ({ page }) => {
    const { email, password } = getCredentials();

    await page.goto(getBaseUrl() + '/auth/login');

    // Labels are in Spanish — "Correo electrónico" and "Contraseña"
    await page.getByLabel('Correo electrónico').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Redirect target depends on role: /dashboard (psicologo) or /admin (admin)
    await page.waitForURL(/\/(dashboard|admin)/);

    // Auth token is stored in localStorage — no IndexedDB needed
    await page.context().storageState({ path: authFile });
});
