import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/auth/login');
        await expect(this.page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
    }

    async tearDown(): Promise<void> {}

    async loginAs(email: string, password: string): Promise<void> {
        await this.page.getByLabel('Correo electrónico').fill(email);
        await this.page.locator('#password').fill(password);
        await this.page.getByRole('button', { name: 'Iniciar sesión' }).click();
    }

    async assertRedirectedTo(pattern: string | RegExp): Promise<void> {
        await this.page.waitForURL(pattern, { timeout: 10_000 });
    }

    async assertLoginFailed(): Promise<void> {
        // Button returns to idle text after a failed attempt
        await expect(
            this.page.getByRole('button', { name: 'Iniciar sesión' })
        ).toBeVisible({ timeout: 8_000 });
        await expect(this.page).toHaveURL(/\/auth\/login/);
    }
}
