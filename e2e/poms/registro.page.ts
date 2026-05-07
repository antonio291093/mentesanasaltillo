import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RegistroPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/auth/registro');
        await expect(this.page.getByRole('heading', { name: /Comienza/i })).toBeVisible();
    }

    async tearDown(): Promise<void> {}

    async registerAs(
        nombre:   string,
        apellido: string,
        email:    string,
        password: string,
    ): Promise<void> {
        await this.page.getByLabel('Nombre').fill(nombre);
        await this.page.getByLabel('Apellido').fill(apellido);
        await this.page.getByLabel('Correo electrónico').fill(email);

        await this.page.locator('#password').fill(password);
        await this.page.locator('#confirm').fill(password);

        await this.page.getByRole('button', { name: 'Crear cuenta' }).click();
    }

    async assertRegistrationSuccess(): Promise<void> {
        // Esperar a que la app procese la respuesta del backend
        await this.page.waitForTimeout(2000);

        // Solo verificar error si hay texto visible en el banner
        const errorBanner = this.page.locator('[role="alert"]');
        const isVisible = await errorBanner.isVisible();
        if (isVisible) {
            const msg = await errorBanner.textContent();
            if (msg && msg.trim().length > 0) {
                throw new Error(`Registration failed with error: ${msg}`);
            }
        }

        // Esperar redirección a /especialistas
        await this.page.waitForURL(/\/especialistas/, { timeout: 30_000 });
    }
}
