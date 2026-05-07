import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/admin');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async tearDown(): Promise<void> {}

    async assertStatsLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/admin$/);
        // Stats section contains numeric values rendered by StatCard
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async navigateToProfesionales(): Promise<void> {
        await this.page.goto('/admin/profesionales');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async assertProfesionalesTabsVisible(): Promise<void> {
        await expect(this.page).toHaveURL(/\/admin\/profesionales/);
        await expect(this.page.getByRole('tab', { name: 'Pendientes' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Aprobados' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Rechazados' })).toBeVisible();
    }

    async navigateToResenas(): Promise<void> {
        await this.page.goto('/admin/resenas');
        await expect(this.page.locator('svg.animate-spin')).toBeHidden({ timeout: 10_000 });
    }

    async assertResenasTabsVisible(): Promise<void> {
        await expect(this.page).toHaveURL(/\/admin\/resenas/);
        await expect(this.page.getByRole('tab', { name: 'Todas' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Pendientes' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Aprobadas' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Rechazadas' })).toBeVisible();
    }
}
