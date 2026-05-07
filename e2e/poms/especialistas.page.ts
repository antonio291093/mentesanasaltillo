import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class EspecialistasPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/especialistas');
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async tearDown(): Promise<void> {}

    async assertCardsLoaded(): Promise<void> {
        // Wait for skeletons to finish and real articles to appear
        await expect(
            this.page.getByRole('article').first()
        ).toBeVisible({ timeout: 10_000 });
    }

    async assertAtLeastOneCard(): Promise<void> {
        const cards = this.page.getByRole('article');
        await expect(cards.first()).toBeVisible();
    }

    async getFirstSpecialistHref(): Promise<string> {
        const link = this.page.getByRole('link', { name: 'Ver perfil completo' }).first();
        await expect(link).toBeVisible();
        return (await link.getAttribute('href')) ?? '';
    }

    async clickFirstCard(): Promise<void> {
        await this.page.getByRole('link', { name: 'Ver perfil completo' }).first().click();
        await this.page.waitForURL(/\/especialistas\/\d+/);
    }
}
