import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LandingPage extends BasePage {
    async setUp(): Promise<void> {
        await this.page.goto('/');
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async tearDown(): Promise<void> {}

    async assertHeroHeadingVisible(): Promise<void> {
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async assertLocationBadgeVisible(): Promise<void> {
        await expect(
            this.page.getByText('Saltillo, Coahuila', { exact: true })
        ).toBeVisible();
    }

    async assertNavLinkPresent(label: string): Promise<void> {
        await expect(
            this.page
                .getByRole('navigation', { name: 'Navegación principal' })
                .getByRole('link', { name: label })
        ).toBeVisible();
    }

    async clickNavLink(label: string): Promise<void> {
        await this.page
            .getByRole('navigation', { name: 'Navegación principal' })
            .getByRole('link', { name: label })
            .click();
    }

    async assertUrl(pattern: string | RegExp): Promise<void> {
        await expect(this.page).toHaveURL(pattern);
    }

    async assertFooterVisible(): Promise<void> {
        await expect(this.page.getByRole('contentinfo')).toBeVisible();
    }

    async assertFooterSaptelLink(): Promise<void> {
        await expect(
            this.page.getByRole('contentinfo').getByRole('link', { name: /800-290-0024/ })
        ).toBeVisible();
    }
}
