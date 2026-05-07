import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPsicologoPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/dashboard');
        // Wait for the page to finish loading (spinner disappears)
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async tearDown(): Promise<void> {}

    async assertVerificationStatusVisible(): Promise<void> {
        // Status can be "Aprobado", "En revisión", or "Rechazado"
        const statuses = ['Aprobado', 'En revisión', 'Rechazado'];
        let found = false;
        for (const status of statuses) {
            const el = this.page.getByText(status, { exact: true });
            if (await el.count() > 0) { found = true; break; }
        }
        if (!found) throw new Error('No verification status badge found on dashboard');
    }

    async navigateToPerfil(): Promise<void> {
        await this.page.goto('/dashboard/perfil');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async navigateToHorarios(): Promise<void> {
        await this.page.goto('/dashboard/horarios');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async navigateToResenas(): Promise<void> {
        await this.page.goto('/dashboard/resenas');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async assertPerfilPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/dashboard\/perfil/);
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async assertHorariosPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/dashboard\/horarios/);
        // Days of week are shown as a grid
        await expect(this.page.getByText(/Lunes|lunes/i)).toBeVisible({ timeout: 8_000 });
    }

    async assertResenasPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/dashboard\/resenas/);
        // Tabs: Pendientes, Aprobadas, Rechazadas
        await expect(this.page.getByRole('tab')).toHaveCount(3);
    }

    async assertDashboardLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/dashboard/);
    }
}
